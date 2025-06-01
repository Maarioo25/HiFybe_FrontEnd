import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendService } from "../services/friendService";
import { userService } from "../services/userService";
import { usePlayer } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import FooterPlayer from "../components/FooterPlayer";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import L from "leaflet";
import "./style.css";
import AddFriendModal from "../components/AddFriendModal";
import axios from "axios";

export default function MainPage() {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const [realFriends, setRealFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("friends");
  const [currentPosition, setCurrentPosition] = useState([40.4165, -3.7026]);

  const { loading } = useAuth();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);

  const playAndStoreTrack = async (uri) => {
    try {
      await playTrack(uri);
      const trackId = uri?.split(":").pop();
      if (!trackId) return;
      const currentUser = await userService.getCurrentUser();
      await userService.setCancionUsuario(currentUser.user._id, trackId);
    } catch (err) {
      console.error("Error al reproducir o guardar canción:", err);
    }
  };

  
  // Detectar token de Spotify
  const spotifyToken = localStorage.getItem("sp_token");
  const handleConnectSpotify = () => {
    window.location.href = "https://api.mariobueno.info/usuarios/spotify/connect";
  };

  // Obtener lista de amigos
  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = await userService.getCurrentUser();
      const userId = currentUser.user._id || currentUser.user.id;
      setCurrentUserId(userId);
      const friends = await friendService.getFriends(userId);
      setRealFriends(friends);
    };
    fetchFriends();
  }, []);

  // Función para obtener usuarios cercanos
  const fetchUsersAtPosition = async (latitude, longitude) => {
    try {
      let res = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/ubicacion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ latitude, longitude }),
        }
      );
      if (!res.ok) console.error("POST /ubicacion fallo:", await res.text());

      res = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/cerca?latitude=${latitude}&longitude=${longitude}&radio=5000`,
        { credentials: "include" }
      );
      if (!res.ok) {
        console.error("GET /cerca fallo:", await res.text());
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) setUsuariosCercanos(data);
      else console.error("GET /cerca devolvió data no-array:", data);
    } catch (err) {
      console.error("Error al obtener usuarios cercanos:", err);
    }
  };

  // Geolocalización inicial
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCurrentPosition([latitude, longitude]);
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 13);
        }
        fetchUsersAtPosition(latitude, longitude);
      },
      (error) => {
        console.error("Error al pedir permiso de geolocalización:", error);
      }
    );
  }, []);

  // Inicializar Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      preferCanvas: false,
      zoomControl: false,
    }).setView(currentPosition, 13);

    ["tilePane", "shadowPane", "overlayPane", "markerPane", "popupPane"].forEach(
      (name) => {
        const pane = mapInstance.current.getPane(name);
        if (pane) pane.style.position = "relative";
      }
    );

    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    ).addTo(mapInstance.current);
    L.control.zoom({ position: "topright" }).addTo(mapInstance.current);

    return () => {
      mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  // Marcadores de usuarios cercanos
  useEffect(() => {
    if (!mapInstance.current) return;

    markerRefs.current.forEach((m) => mapInstance.current.removeLayer(m));
    markerRefs.current = [];

    markerRefs.current = usuariosCercanos
      .map((user) => {
        const coords = user.ubicacion?.coordinates;
        if (!coords) return null;

        const isSmall = window.innerWidth < 640;
        const sizeClass = isSmall ? "w-8 h-8" : "w-10 h-10";
        const posClass = isSmall ? "top-1 right-1" : "top-2 right-2";

        const icon = L.divIcon({
          className: "custom-icon",
          html: `
            <div class='${sizeClass} rounded-full flex items-center justify-center shadow-lg
                         bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
              <img src='${user.foto_perfil ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user.nombre)}'
                   alt='${user.nombre}'
                   class='w-full h-full object-cover rounded-full border-2 border-white shadow' />
              <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500
                                 border-2 border-white shadow'></span>
            </div>`,
        });

        return L.marker([coords[1], coords[0]], { icon })
          .addTo(mapInstance.current)
          .on("click", async () => {
            try {
              const songData = await userService.getCancionUsuario(user._id);
              console.log('Canción obtenida correctamente: ' + songData.nombre);
          
              setSelectedUser({
                _id: user._id,
                nombre: user.nombre,
                foto_perfil: user.foto_perfil,
                song: songData && songData.nombre
                  ? {
                      title: songData.nombre,
                      artist: songData.artista,
                      img: songData.imagen,
                      uri: songData.uri
                    }
                  : {
                      title: "No disponible",
                      artist: "",
                      img: "",
                      uri: null
                    },
              });              
          
              mapInstance.current.setView([coords[1], coords[0]], 15);
            } catch (error) {
              console.error("Error al obtener canción del usuario:", error);
            }
          });
          
      })
      .filter(Boolean);
  }, [usuariosCercanos]);

  // Animar icono del usuario seleccionado
  useEffect(() => {
    if (!markerRefs.current.length || !selectedUser) return;

    markerRefs.current.forEach((marker, idx) => {
      const user = usuariosCercanos[idx];
      const isSel = user.nombre === selectedUser.nombre;
      const bounceClass = isSel ? " bounce" : "";

      const isSmall = window.innerWidth < 640;
      const sizeClass = isSmall ? "w-8 h-8" : "w-10 h-10";
      const posClass = isSmall ? "top-1 right-1" : "top-2 right-2";

      const icon = L.divIcon({
        className: `custom-icon${bounceClass}`,
        html: `
          <div class='relative ${sizeClass} rounded-full flex items-center justify-center shadow-lg
                       bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <img src='${user.foto_perfil ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user.nombre)}'
                 alt='${user.nombre}'
                 class='w-full h-full object-cover rounded-full' />
            <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500
                               border-2 border-white shadow'></span>
          </div>`,
      });
      marker.setIcon(icon);
    });
  }, [selectedUser]);

  // Obtener recomendaciones desde el JSON y pedir detalles al backend
  useEffect(() => {
    // Solo obtener si hay token de Spotify
    if (!spotifyToken) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/data/recommendations.json");
        const recomendaciones = await res.json();

        const detalles = await Promise.all(
          recomendaciones.map(async (rec) => {
            const respuesta = await axios.get(
              `${import.meta.env.VITE_API_URL}/canciones/spotify/${rec.id}`
            );
            return {
              id: rec.id,
              title: respuesta.data.nombre,
              artist: respuesta.data.artista,
              img: respuesta.data.imagen,
              spotifyUri: respuesta.data.uri,
            };
          })
        );

        setSpotifyRecommendations(detalles);
      } catch (err) {
        console.error("Error al obtener recomendaciones:", err);
      }
    };

    fetchRecommendations();
  }, [spotifyToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-harmony-primary">
        <div className="text-harmony-text-primary text-xl">Cargando...</div>
      </div>
    );
  }

  const reloadMap = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCurrentPosition([latitude, longitude]);
        fetchUsersAtPosition(latitude, longitude);
      },
      (error) => console.error("Error al recargar usuarios:", error)
    );
  };

  const centerMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView(currentPosition, 13);
    }
  };

  return (
    <div className="text-harmony-text-primary min-h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={playTrack} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa + Selected User */}
          <div className="lg:col-span-2">
            <div
              className="bg-harmony-secondary/30 rounded-2xl p-4 sm:p-6 border border-harmony-text-secondary/10
                            flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh] relative"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-harmony-accent">
                Usuarios escuchando cerca
              </h2>

              <div className="absolute top-4 right-4 flex space-x-2 z-20">
                <button
                  onClick={reloadMap}
                  className="p-2 h-10 w-10 bg-harmony-secondary rounded-full shadow hover:bg-harmony-secondary/80"
                  title="Recargar mapa"
                >
                  ⟳
                </button>
                <button
                  onClick={centerMap}
                  className="p-2 h-10 w-10 bg-harmony-secondary rounded-full shadow hover:bg-harmony-secondary/80"
                  title="Centrar en mi posición"
                >
                  ⊕
                </button>
              </div>

              <div
                ref={mapRef}
                id="map"
                className="rounded-2xl shadow-lg h-full"
              />
              {selectedUser && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-8 flex items-center bg-harmony-secondary/80 rounded-2xl p-2 sm:p-4 border border-harmony-text-secondary/20 gap-3 w-[90%] sm:w-[60%] max-w-lg backdrop-blur-md transition-all animate-fade-in-down">
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-harmony-accent shadow-lg bg-harmony-primary flex items-center justify-center overflow-hidden mb-1">
                      <img
                        src={
                          selectedUser.foto_perfil ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(selectedUser.nombre)
                        }
                        alt={selectedUser.nombre}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-harmony-text-primary font-semibold truncate max-w-[60px] sm:max-w-[72px] text-center">
                      {selectedUser.nombre}
                    </span>
                  </div>

                  {/* Canción actual */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectedUser.song?.img && (
                      <img
                        src={selectedUser.song.img}
                        alt="Album"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded shadow object-cover border border-harmony-accent"
                      />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-harmony-accent text-xs sm:text-sm font-bold uppercase tracking-wide mb-1">
                        Escuchando
                      </span>
                      <span className="text-harmony-text-primary text-sm sm:text-base font-bold truncate">
                        {selectedUser.song.title}
                      </span>
                      <span className="text-harmony-text-secondary text-xs sm:text-sm truncate">
                        {selectedUser.song.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 sm:gap-2 ml-1 sm:ml-2">                
                    <button
                      onClick={async () => {
                        try {
                          await friendService.sendRequest(currentUserId, selectedUser._id);
                          try {
                            await notificationService.createNotification(
                              selectedUser._id,
                              `${selectedUser.nombre} te ha enviado una solicitud de amistad`
                            );
                          } catch (notifErr) {
                            console.warn('Error al crear notificación:', notifErr);
                          }
                          toast.success('Solicitud enviada correctamente');
                        } catch (error) {
                          console.error('Error al enviar solicitud:', error);
                          toast.error(error?.response?.data?.mensaje || 'Error al enviar la solicitud');
                        }
                      }}                                            
                      className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-accent hover:bg-harmony-accent/80 rounded-full text-xs sm:text-sm font-semibold text-white shadow"
                    >
                      Seguir
                    </button>

                    {selectedUser.song?.uri && (
                      <button
                        onClick={() => playTrack(selectedUser.song.uri)}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-primary hover:bg-harmony-accent/80 rounded-full text-xs sm:text-sm font-semibold text-harmony-accent shadow border border-harmony-accent"
                      >
                        Escuchar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: Amigos / Recomendaciones */}
          <div>
            <div
              className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6
                            border border-harmony-text-secondary/10 flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh]"
            >
              {/* Botones de pestañas */}
              <div className="flex items-center mb-4 gap-2">
                <button
                  onClick={() => setActiveTab("friends")}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                    activeTab === "friends"
                      ? "bg-harmony-accent text-white border-harmony-accent"
                      : "bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10"
                  }`}
                >
                  Amigos
                </button>
                <button
                  onClick={() => setActiveTab("recomendaciones")}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                    activeTab === "recomendaciones"
                      ? "bg-harmony-accent text-white border-harmony-accent"
                      : "bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10"
                  }`}
                >
                  Recomendaciones
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
                {/* =====================================
                     PESTAÑA “AMIGOS”
                     ===================================== */}
                {activeTab === "friends" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {realFriends.map((amigo) => (
                      <div
                        key={amigo.id}
                        className="friend-card relative flex flex-col justify-end h-48 sm:h-64 rounded-xl overflow-hidden group shadow-lg border border-harmony-secondary/30"
                      >
                        <img
                          src={amigo.foto_perfil}
                          alt={amigo.nombre}
                          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300 filter blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-harmony-primary/80 via-harmony-primary/40 to-transparent" />
                        <div className="relative flex flex-col justify-end h-full px-4 sm:px-5 pb-3 sm:pb-4 pt-8 w-full">
                          <div className="font-bold text-harmony-accent text-lg sm:text-xl drop-shadow mb-1 sm:mb-2 truncate">
                            {amigo.nombre}
                          </div>
                          <div className="text-harmony-text-secondary text-sm">
                            Canción destacada no disponible
                          </div>
                        </div>
                        <span
                          className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow ${
                            amigo.online ? "bg-green-500" : "bg-gray-500"
                          }`}
                        />
                        <button
                          onClick={() => navigate(`/friends/${amigo.id}`)}
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    ))}
                    <button
                      className="flex flex-col items-center justify-center h-48 sm:h-64 rounded-xl border-2 border-dashed border-harmony-accent text-harmony-accent hover:bg-harmony-accent/10 transition shadow-lg"
                      onClick={() => setShowAddFriendModal(true)}
                    >
                      <span className="text-4xl mb-2">+</span>
                      <span className="font-semibold">Agregar amigo</span>
                    </button>
                  </div>
                )}

                {/* =====================================
                     PESTAÑA “RECOMENDACIONES”
                     ===================================== */}
                {activeTab === "recomendaciones" && (
                  <div className="flex flex-col gap-3 transition-opacity duration-300 opacity-100">
                    {/* Si no hay token de Spotify, mostrar botón para conectar */}
                    {!spotifyToken ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-harmony-text-primary mb-4">
                          Debes conectar tu cuenta de Spotify para ver las
                          recomendaciones
                        </span>
                        <button
                          onClick={handleConnectSpotify}
                          className="px-4 py-2 bg-harmony-accent text-white rounded-lg shadow hover:bg-harmony-accent/80 transition"
                        >
                          Conectar con Spotify
                        </button>
                      </div>
                    ) : (
                      /* Si existe token, renderizar recomendaciones */
                      <>
                        {spotifyRecommendations.length === 0 ? (
                          <div className="text-center text-harmony-text-secondary mt-4">
                            Cargando recomendaciones...
                          </div>
                        ) : (
                          spotifyRecommendations.map((song) => (
                            <div
                              key={song.spotifyUri}
                              className="playlist-item recommendation-card flex items-center gap-4 p-3 rounded-xl cursor-pointer"
                              onClick={async () => {
                                await playAndStoreTrack(song.spotifyUri);
                              }}
                            >
                              <img
                                src={song.img || "https://via.placeholder.com/48"}
                                alt={song.title}
                                className="w-12 h-12 rounded shadow object-cover border-2 border-harmony-accent"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-harmony-text-primary truncate">
                                  {song.title}
                                </div>
                                <div className="text-xs text-harmony-text-secondary truncate">
                                  {song.artist}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterPlayer />

      {showAddFriendModal && currentUserId && (
        <AddFriendModal
          currentUserId={currentUserId}
          existingFriends={realFriends}
          onClose={() => setShowAddFriendModal(false)}
        />
      )}
    </div>
  );
}
