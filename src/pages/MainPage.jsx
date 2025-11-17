import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendService } from "../services/friendService";
import { userService } from "../services/userService";
import { usePlayer } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import HeaderBar from "../components/HeaderBar";
import FooterPlayer from "../components/FooterPlayer";
import { notificationService } from "../services/notificationService";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import L from "leaflet";
import "./style.css"; // Asegúrate de añadir la animación aquí
import AddFriendModal from "../components/AddFriendModal";
import axios from "axios";
import { FaEye, FaEyeSlash, FaMapMarkerAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function MainPage() {
  const { t } = useTranslation();
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const [realFriends, setRealFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("friends");
  const [currentPosition, setCurrentPosition] = useState([40.4165, -3.7026]);
  const [mostrarUbicacion, setMostrarUbicacion] = useState(false);
  const [mapMoving, setMapMoving] = useState(false);
  const { loading } = useAuth();
  const navigate = useNavigate();
  const { playTrack, isPremium } = usePlayer();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);
  const userInfoRef = useRef(null);

  // Función para reproducir y guardar la canción
  const playAndStoreTrack = async (uri) => {
    try {
      await playTrack(uri);
      const trackId = uri?.split(":").pop();
      if (!trackId) return;
      const currentUser = await userService.getCurrentUser();
      await userService.setCancionUsuario(currentUser._id, trackId);
    } catch (err) {
      console.error("Error al reproducir o guardar canción:", err);
    }
  };

  const spotifyToken = localStorage.getItem("sp_token");
  const handleConnectSpotify = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/usuarios/spotify/connect`;
  };

  // Obtener lista de amigos
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        console.log("currentUser devuelto por getCurrentUser:", currentUser);
        const userId = currentUser?._id || currentUser?.id;
        console.log("userId extraído de currentUser:", userId);

        setCurrentUserId(userId);
        const friends = await friendService.getFriends(userId);
        setRealFriends(friends);
      } catch (error) {
        console.error("Error al obtener amigos:", error);
      }
    };
    fetchFriends();
  }, []);

  // Función para obtener usuarios cercanos
  const fetchUsersAtPosition = async (latitude, longitude) => {
  try {
    console.log("Enviando a backend (actualizarUbicacion):", { latitude, longitude });
    await userService.actualizarUbicacion(latitude, longitude);

    // ⬇️ CAMBIO: Usar api en lugar de fetch
    const response = await api.get(`/usuarios/cerca`, {
      params: {
        latitude,
        longitude,
        radio: 5000
      }
    });

    const data = response.data;
    console.log("Respuesta de usuarios cercanos:", data);

    if (Array.isArray(data)) {
      setUsuariosCercanos(data);
    } else {
      console.error("/cerca devolvió algo que no es un array:", data);
    }
  } catch (err) {
    console.error("Error en fetchUsersAtPosition:", err);
  }
};

  // Inicializar Leaflet con control de movimiento
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      preferCanvas: true,
      zoomControl: false,
    }).setView(currentPosition, 13);

    mapInstance.current.on("movestart", () => setMapMoving(true));
    mapInstance.current.on("moveend", () => setMapMoving(false));

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

    markerRefs.current.forEach((marker) => {
      mapInstance.current.removeLayer(marker);
    });
    markerRefs.current = [];

    usuariosCercanos.forEach((user) => {
      const coords = user.ubicacion?.coordinates;
      if (!coords) return;

      const isSmall = window.innerWidth < 640;
      const sizeClass = isSmall ? "w-8 h-8" : "w-10 h-10";
      const posClass = isSmall ? "top-1 right-1" : "top-2 right-2";

      const icon = L.divIcon({
        className: "custom-icon",
        html: `
          <div class='${sizeClass} rounded-full relative shadow-lg overflow-hidden
                       bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <div class="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src='${user.foto_perfil || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nombre)}' 
                alt='${user.nombre}'
                class='min-w-full min-h-full object-cover object-center'
              />
            </div>
            <div class="absolute inset-0 rounded-full border-2 border-white"></div>
            <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow'></span>
          </div>`,
      });

      const marker = L.marker([coords[1], coords[0]], { icon })
        .addTo(mapInstance.current)
        .on("click", async () => {
          try {
            const songData = await userService.getCancionUsuario(user._id);

            setSelectedUser({
              _id: user._id,
              nombre: user.nombre,
              foto_perfil: user.foto_perfil,
              song:
                songData && songData.nombre
                  ? {
                      title: songData.nombre,
                      artist: songData.artista,
                      img: songData.imagen,
                      uri: songData.uri,
                    }
                  : {
                      title: t("main.noSong"),
                      artist: "",
                      img: "",
                      uri: null,
                    },
              position: [coords[1], coords[0]],
            });

            mapInstance.current.setView([coords[1], coords[0]], 15);
          } catch (error) {
            console.error("Error al obtener canción del usuario:", error);
          }
        });

      markerRefs.current.push(marker);
    });
  }, [usuariosCercanos, t]);

  // Gestión de visibilidad de ubicación
  useEffect(() => {
    const gestionarVisibilidad = async () => {
      if (mostrarUbicacion) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            console.log("📍 Ubicación obtenida:", { latitude, longitude });
            setCurrentPosition([latitude, longitude]);
        
            if (mapInstance.current) {
              mapInstance.current.setView([latitude, longitude], 13);
            }
        
            console.log("Llamando a fetchUsersAtPosition...");
            fetchUsersAtPosition(latitude, longitude);
          },
          (error) => {
            console.error("Error al obtener ubicación:", error);
          }
        );        
      } else {
        try {
          await userService.ocultarUbicacion();
          setUsuariosCercanos([]);
        } catch (error) {
          console.error("Error al ocultar ubicación:", error);
        }
      }
    };

    gestionarVisibilidad();
  }, [mostrarUbicacion]);

  // Animar icono del usuario seleccionado
  useEffect(() => {
    if (!markerRefs.current.length || !selectedUser) return;

    markerRefs.current.forEach((marker, idx) => {
      const user = usuariosCercanos[idx];
      if (!user) return;

      const isSel = user.nombre === selectedUser.nombre;
      const pulseClass = isSel ? " animate-pulse" : "";

      const isSmall = window.innerWidth < 640;
      const sizeClass = isSmall ? "w-8 h-8" : "w-10 h-10";
      const posClass = isSmall ? "top-1 right-1" : "top-2 right-2";

      const icon = L.divIcon({
        className: "custom-icon",
        html: `
          <div class='${sizeClass} rounded-full relative shadow-lg overflow-hidden
                       bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker${pulseClass}'>
            <div class="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src='${user.foto_perfil || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nombre)}' 
                alt='${user.nombre}'
                class='min-w-full min-h-full object-cover object-center'
              />
            </div>
            <div class="absolute inset-0 rounded-full border-2 border-white"></div>
            <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow'></span>
          </div>`,
      });

      marker.setIcon(icon);
    });
  }, [selectedUser, usuariosCercanos]);

  // Obtener recomendaciones de Spotify
  useEffect(() => {
    if (!spotifyToken) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/data/recommendations.json");
        const recomendaciones = await res.json();

        const detalles = await Promise.all(
          recomendaciones.map(async (rec) => {
            try {
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
            } catch (err) {
              console.error("Error al obtener detalles de canción:", err);
              return null;
            }
          })
        );

        setSpotifyRecommendations(detalles.filter((item) => item !== null));
      } catch (err) {
        console.error("Error al obtener recomendaciones:", err);
      }
    };

    fetchRecommendations();
  }, [spotifyToken]);

  // Funciones de utilidad
  const reloadMap = () => {
    if (mostrarUbicacion) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          setCurrentPosition([latitude, longitude]);
          fetchUsersAtPosition(latitude, longitude);
        },
        (error) => console.error("Error al recargar ubicación:", error)
      );
    }
  };

  // Función para centrar el mapa
  const centerMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView(currentPosition, 13);
    }
  };

  // Render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-harmony-primary">
        <div className="text-harmony-text-primary text-xl">{t("main.loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
      {isPremium === false && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 rounded-xl px-4 py-2 mb-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-yellow-200 text-xs sm:text-sm flex-1">
                Para reproducir música directamente en el navegador, necesitas Spotify Premium. 
                Por ahora, las canciones se abrirán en Spotify.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mapa + Selected User */}
            <div className="lg:col-span-2">
              <div className="bg-harmony-secondary/30 rounded-2xl p-4 sm:p-6 border border-harmony-text-secondary/10 flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh] relative mt-4 sm:mt-0">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-harmony-accent">
                  {t("main.nearbyUsersTitle")}
                </h2>

                <div className="absolute top-4 right-4 flex space-x-2 z-20">
                  <div className="flex items-center gap-2">
                    {mostrarUbicacion ? (
                      <FaEye
                        className="text-harmony-accent w-5 h-5"
                        title={t("main.locationVisible")}
                      />
                    ) : (
                      <FaEyeSlash
                        className="text-harmony-text-secondary w-5 h-5"
                        title={t("main.locationHidden")}
                      />
                    )}
                    <button
                      onClick={() => setMostrarUbicacion(!mostrarUbicacion)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        mostrarUbicacion ? "bg-harmony-accent" : "bg-harmony-secondary"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          mostrarUbicacion ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={reloadMap}
                    disabled={!mostrarUbicacion}
                    className={`p-2 h-10 w-10 rounded-full shadow transition ${
                      mostrarUbicacion
                        ? "bg-harmony-secondary hover:bg-harmony-secondary/80"
                        : "bg-gray-500/30"
                    }`}
                    title={t("main.reloadMap")}
                  >
                    ⟳
                  </button>

                  <button
                    onClick={centerMap}
                    disabled={!mostrarUbicacion}
                    className={`p-2 h-10 w-10 rounded-full shadow transition ${
                      mostrarUbicacion
                        ? "bg-harmony-secondary hover:bg-harmony-secondary/80"
                        : "bg-gray-500/30"
                    }`}
                    title={t("main.centerMap")}
                  >
                    <FaMapMarkerAlt className="mx-auto" />
                  </button>
                </div>

                <div className="relative h-full">
                  <div
                    className={`absolute inset-0 z-10 pointer-events-none transition-all duration-300 ${
                      !mostrarUbicacion ? "backdrop-blur-lg bg-harmony-primary/30 shadow-inner" : ""
                    }`}
                  />
                  {!mostrarUbicacion && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <div className="bg-harmony-primary/60 text-white px-4 py-2 rounded-xl shadow text-sm sm:text-base font-semibold backdrop-blur-md">
                        {t("main.locationHiddenOverlay")}
                      </div>
                    </div>
                  )}

                  <div
                    ref={mapRef}
                    id="map"
                    className="rounded-2xl shadow-lg h-full z-0"
                  />
                </div>

                {/* Mostrar info de usuario siempre que haya uno seleccionado */}
                {selectedUser && (
                  <div
                    ref={userInfoRef}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-8 flex items-center bg-harmony-secondary/80 rounded-2xl p-2 sm:p-4 border border-harmony-text-secondary/20 gap-3 w-[90%] sm:w-[60%] max-w-lg backdrop-blur-md transition-all animate-fade-in-down"
                  >
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
                          {t("main.listening")}
                        </span>
                        <span className="text-harmony-text-primary text-sm sm:text-base font-bold truncate">
                          {selectedUser.song.title}
                        </span>
                        <span className="text-harmony-text-secondary text-xs sm:text-sm truncate">
                          {selectedUser.song.artist}
                        </span>
                      </div>
                    </div>

                    {selectedUser._id !== currentUserId && (
                      <div className="flex flex-col gap-1 sm:gap-2 ml-1 sm:ml-2">
                        <button
                          onClick={async () => {
                            try {
                              await friendService.sendRequest(currentUserId, selectedUser._id);
                              await notificationService.createNotification(
                                selectedUser._id,
                                `${selectedUser.nombre} ${t("main.sentFriendRequest")}`
                              );
                              toast.success(t("main.requestSent"));
                            } catch (error) {
                              console.error("Error al enviar solicitud:", error);
                              toast.error(
                                error?.response?.data?.mensaje || t("main.requestError")
                              );
                            }
                          }}
                          className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-accent hover:bg-harmony-accent/80 rounded-full text-xs sm:text-sm font-semibold text-white shadow"
                        >
                          {t("main.addFriend")}
                        </button>

                        {selectedUser.song?.uri && (
                          <button
                            onClick={() => playTrack(selectedUser.song.uri)}
                            className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-primary hover:bg-harmony-accent/80 rounded-full text-xs sm:text-sm font-semibold text-harmony-accent shadow border border-harmony-accent"
                          >
                            {t("chatDetalle.play")}
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* Panel derecho: Amigos / Recomendaciones */}
            <div>
              <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-harmony-text-secondary/10 flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh] mb-4">
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
                    {t("main.tabFriends")}
                  </button>
                  <button
                    onClick={() => setActiveTab("recomendaciones")}
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                      activeTab === "recomendaciones"
                        ? "bg-harmony-accent text-white border-harmony-accent"
                        : "bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10"
                    }`}
                  >
                    {t("main.tabRecommendations")}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
                  {/* PESTAÑA “AMIGOS” */}
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
                            className="absolute inset-0 w-full h-full object-cover scale-105 
                                      transition-all duration-300 
                                      group-hover:scale-110 
                                      group-hover:blur-sm group-active:blur-sm"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-harmony-primary/80 via-harmony-primary/40 to-transparent" />
                          <div className="relative flex flex-col justify-end h-full px-4 sm:px-5 pb-3 sm:pb-4 pt-8 w-full">
                            <div className="font-bold text-harmony-accent text-lg sm:text-xl drop-shadow mb-1 sm:mb-2 truncate">
                              {amigo.nombre}
                            </div>
                            <div className="text-harmony-text-secondary text-sm">
                              {t("main.noHighlightedSong")}
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
                        <span className="font-semibold">{t("main.addFriend")}</span>
                      </button>
                    </div>
                  )}

                  {/* PESTAÑA “RECOMENDACIONES” */}
                  {activeTab === "recomendaciones" && (
                    <div className="flex flex-col gap-3 transition-opacity duration-300 opacity-100">
                      {!spotifyToken ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-harmony-text-primary mb-4">
                            {t("main.mustConnectSpotify")}
                          </span>
                          <button
                            onClick={handleConnectSpotify}
                            className="px-4 py-2 bg-harmony-accent text-white rounded-lg shadow hover:bg-harmony-accent/80 transition"
                          >
                            {t("main.connectSpotifyButton")}
                          </button>
                        </div>
                      ) : (
                        <>
                          {spotifyRecommendations.length === 0 ? (
                            <div className="text-center text-harmony-text-secondary mt-4">
                              {t("main.loadingRecommendations")}
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
