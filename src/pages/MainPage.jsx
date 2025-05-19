import React, { useEffect, useRef, useState } from "react";
import { FRIENDS } from "../data/friends";
import { SONGS } from "../data/songs";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import FooterPlayer from '../components/FooterPlayer';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./style.css";

export default function MainPage() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const { playTrack, isPlaying, position: playbackPosition, duration } = usePlayer();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);

  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');

  // 1) Obtener ubicación, guardarla y recuperar usuarios cercanos
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          // 1) Guardar ubicación
          let res = await fetch(
            `${import.meta.env.VITE_API_URL}/usuarios/ubicacion`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ latitude, longitude })
            }
          );
          if (!res.ok) {
            console.error('POST /ubicacion fallo:', await res.text());
            return;
          }
  
          // 2) Obtener usuarios cercanos
          res = await fetch(
            `${import.meta.env.VITE_API_URL}/usuarios/cerca?latitude=${latitude}&longitude=${longitude}&radio=10`,
            { credentials: 'include' }
          );
          if (!res.ok) {
            console.error('GET /cerca fallo:', await res.text());
            return;
          }
  
          const data = await res.json();
          if (!Array.isArray(data)) {
            console.error('GET /cerca devolvió data no-array:', data);
            return;
          }
          setUsuariosCercanos(data);
  
        } catch (err) {
          console.error("Error en geolocalización:", err);
        }
      },
      (error) => {
        console.error("Error al pedir permiso de geolocalización:", error);
      }
    );
  }, []);
  

  // 2) Inicializar Leaflet solo una vez
  useEffect(() => {
    if (!mapRef.current) return;

    // Crear mapa centrado en Madrid
    mapInstance.current = L.map(mapRef.current, {
      preferCanvas: false,
      zoomControl: false
    }).setView([40.4165, -3.7026], 13);

    // Pane z-index settings
    const popupPane = mapInstance.current.getPane('popupPane');
    if (popupPane) popupPane.style.position = 'relative';
    ['tilePane','shadowPane','overlayPane','markerPane'].forEach(name => {
      const pane = mapInstance.current.getPane(name);
      if (pane) pane.style.position = 'relative';
    });

    // Tiles y zoom control
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    ).addTo(mapInstance.current);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);

    return () => {
      mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  // 3) Cuando cambian los usuarios cercanos, limpiamos marcadores y dibujamos los nuevos
  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpiar marcadores previos
    markerRefs.current.forEach(m => mapInstance.current.removeLayer(m));
    markerRefs.current = [];

    // Añadir marcadores
    markerRefs.current = usuariosCercanos.map(user => {
      const coords = user.ubicacion?.coordinates;
      if (!coords) return null;

      const icon = L.divIcon({
        className: 'custom-icon',
        html: `
          <div class='w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <img src='${user.foto_perfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nombre)}'
                 alt='${user.nombre}'
                 class='w-10 h-10 object-cover rounded-full border-2 border-white shadow' />
            <span style='position:absolute;top:2px;right:2px;width:13px;height:13px;
                         border-radius:50%;background:#22c55e;border:2px solid #fff;
                         box-shadow:0 1px 3px #0002;display:block;'></span>
          </div>`
      });

      const marker = L.marker([coords[1], coords[0]], { icon })
        .addTo(mapInstance.current)
        .on('click', () => {
          setSelectedUser({
            nombre: user.nombre,
            foto_perfil: user.foto_perfil,
            song: { title: "No disponible", artist: "", img: "" }
          });
          mapInstance.current.setView([coords[1], coords[0]], 15);
        });

      return marker;
    }).filter(Boolean);
  }, [usuariosCercanos]);

  // 4) Re-renderizado de iconos al cambiar selectedUser
  useEffect(() => {
    if (!markerRefs.current.length || !selectedUser) return;

    markerRefs.current.forEach((marker, idx) => {
      const user = usuariosCercanos[idx];
      const isSelected = user?.nombre === selectedUser.nombre;
      const bounceClass = isSelected ? ' bounce' : '';

      const icon = L.divIcon({
        className: `custom-icon${bounceClass}`,
        html: `
          <div class='relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                      bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <img src='${user.foto_perfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nombre)}'
                 alt='${user.nombre}'
                 class='w-full h-full object-cover rounded-full' />
            <span style='position:absolute;top:2px;right:2px;width:13px;height:13px;
                         border-radius:50%;background:#22c55e;border:2px solid #fff;
                         box-shadow:0 1px 3px #0002;display:block;'></span>
          </div>`
      });

      marker.setIcon(icon);
    });
  }, [selectedUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-harmony-primary">
        <div className="text-harmony-text-primary text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="text-harmony-text-primary min-h-screen bg-harmony-primary">
      <HeaderBar />

      <div className="container mx-auto px-6 z-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mapa + Selected User */}
          <div className="lg:col-span-2 space-y-8" style={{ position: 'relative', zIndex: 1 }}>
            <div className="bg-harmony-secondary/30 rounded-2xl p-6 border border-harmony-text-secondary/10 flex flex-col
                            h-[calc(70vh)] max-h-[calc(70vh)]" style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="text-xl font-bold mb-4 text-harmony-accent">
                Usuarios escuchando cerca
              </h2>
              <div ref={mapRef} id="map" className="rounded-2xl shadow-lg h-full min-h-[320px]" />

              {selectedUser && (
                <div className="absolute bottom-8 left-8 flex items-center bg-harmony-secondary/80 rounded-2xl p-4
                                border border-harmony-text-secondary/20 gap-5 max-w-lg backdrop-blur-md
                                transition-all animate-fade-in-down">
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-12 h-12 rounded-full border-2 border-harmony-accent shadow-lg
                                    bg-harmony-primary flex items-center justify-center overflow-hidden mb-1">
                      <img
                        src={selectedUser.foto_perfil ||
                             'https://ui-avatars.com/api/?name=' +
                             encodeURIComponent(selectedUser.nombre)}
                        alt={selectedUser.nombre}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs text-harmony-text-primary font-semibold truncate
                                     max-w-[72px] text-center">
                      {selectedUser.nombre}
                    </span>
                  </div>
                  {/* Aquí podrías mostrar info de la canción real */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-harmony-accent text-xs font-bold uppercase tracking-wide mb-1">
                      Escuchando
                    </span>
                    <span className="text-harmony-text-primary text-base font-bold truncate">
                      {selectedUser.song.title}
                    </span>
                    <span className="text-harmony-text-secondary text-xs truncate">
                      {selectedUser.song.artist}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                    <button className="px-4 py-1 bg-harmony-accent hover:bg-harmony-accent/80
                                        rounded-full text-xs font-semibold text-white shadow">
                      Seguir
                    </button>
                    <button className="px-4 py-1 bg-harmony-primary hover:bg-harmony-accent/80
                                        rounded-full text-xs font-semibold text-harmony-accent shadow
                                        border border-harmony-accent">
                      Escuchar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: Amigos / Recomendaciones */}
          <div className="space-y-8 z-0">
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-6
                            border border-harmony-text-secondary/10 flex flex-col
                            h-[calc(70vh)] max-h-[calc(70vh)]">
              <div className="flex items-center mb-4 gap-2">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`px-4 py-1 rounded-full font-semibold text-sm transition border shadow-sm
                              focus:outline-none ${
                                activeTab === 'friends'
                                  ? 'bg-harmony-accent text-white border-harmony-accent'
                                  : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                              }`}
                >
                  Amigos
                </button>
                <button
                  onClick={() => setActiveTab('recomendaciones')}
                  className={`px-4 py-1 rounded-full font-semibold text-sm transition border shadow-sm
                              focus:outline-none ${
                                activeTab === 'recomendaciones'
                                  ? 'bg-harmony-accent text-white border-harmony-accent'
                                  : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                              }`}
                >
                  Recomendaciones
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin
                              scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
                {activeTab === 'friends' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FRIENDS.map((amigo, idx) => (
                      <div
                        key={idx}
                        className="friend-card relative flex flex-col justify-end h-64 rounded-xl overflow-hidden
                                   group shadow-lg border border-harmony-secondary/30"
                      >
                        <img
                          src={amigo.photo}
                          alt={amigo.name}
                          className="absolute inset-0 w-full h-full object-cover scale-105
                                     group-hover:scale-110 transition-transform duration-300"
                          style={{ filter: 'blur(2px)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t
                                        from-harmony-primary/80 via-harmony-primary/40 to-transparent" />
                        <div className="relative flex flex-col justify-end h-full
                                        px-5 pb-4 pt-8 w-full">
                          <div className="font-bold text-harmony-accent text-lg drop-shadow mb-2 truncate">
                            {amigo.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={amigo.song.img}
                              alt={amigo.song.title}
                              className="w-8 h-8 rounded-lg object-cover
                                         border-2 border-harmony-accent shadow"
                            />
                            <div className="text-harmony-text-primary text-sm truncate max-w-[120px]">
                              {amigo.song.title} - {amigo.song.artist}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            position: 'absolute',
                            top: 3,
                            right: 3,
                            width: 13,
                            height: 13,
                            borderRadius: '50%',
                            background: amigo.online ? '#22c55e' : '#64748b',
                            border: '2px solid #fff',
                            boxShadow: '0 1px 3px #0002'
                          }}
                        />
                        <button
                          onClick={() => navigate(`/friends/${idx + 1}`)}
                          className="absolute inset-0 w-full h-full opacity-0
                                     group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    ))}
                    <button
                      className="flex flex-col items-center justify-center h-64 rounded-xl
                                 border-2 border-dashed border-harmony-accent text-harmony-accent
                                 hover:bg-harmony-accent/10 transition shadow-lg cursor-pointer mt-2"
                      onClick={() => {/* Lógica para agregar amigos */}}
                    >
                      <span className="text-4xl mb-2">+</span>
                      <span className="font-semibold">Agregar amigo</span>
                    </button>
                  </div>
                )}
                {activeTab === 'recomendaciones' && (
                  <div className="flex flex-col gap-3">
                    {SONGS.map(song => (
                      <div
                        key={song.spotifyUri}
                        className="playlist-item recommendation-card flex items-center gap-4 p-3
                                   rounded-xl cursor-pointer"
                        onClick={async () => {
                          try {
                            await playTrack(song.spotifyUri);
                          } catch (err) {
                            console.error('Error en playTrack:', err);
                            alert('No se pudo reproducir: ' + err.message);
                          }
                        }}
                      >
                        <img
                          src={song.img}
                          alt={song.title}
                          className="w-12 h-12 rounded shadow object-cover
                                     border-2 border-harmony-accent"
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <FooterPlayer />
    </div>
  );
}
