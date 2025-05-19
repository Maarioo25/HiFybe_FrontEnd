// src/pages/MainPage.jsx
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
  const { playTrack } = usePlayer();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRefs = useRef([]);

  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');

  // 1) Geolocalización y usuarios cercanos
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 13);
        }
        try {
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

  // 2) Inicializar Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      preferCanvas: false,
      zoomControl: false
    }).setView([40.4165, -3.7026], 13);

    ['tilePane','shadowPane','overlayPane','markerPane','popupPane'].forEach(name => {
      const pane = mapInstance.current.getPane(name);
      if (pane) pane.style.position = 'relative';
    });

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

  // 3) Marcadores responsivos
  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpiar
    markerRefs.current.forEach(m => mapInstance.current.removeLayer(m));
    markerRefs.current = [];

    // Añadir
    markerRefs.current = usuariosCercanos.map((user) => {
      const coords = user.ubicacion?.coordinates;
      if (!coords) return null;

      // tamaños según móvil/sm+
      const isSmall = window.innerWidth < 640;
      const sizeClass = isSmall ? 'w-8 h-8' : 'w-10 h-10';
      const posClass = isSmall ? 'top-1 right-1' : 'top-2 right-2';

      const icon = L.divIcon({
        className: 'custom-icon',
        html: `
          <div class='${sizeClass} rounded-full flex items-center justify-center shadow-lg
                       bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <img src='${user.foto_perfil || 'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(user.nombre)}'
                 alt='${user.nombre}'
                 class='w-full h-full object-cover rounded-full border-2 border-white shadow' />
            <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500
                               border-2 border-white shadow'></span>
          </div>`
      });

      return L.marker([coords[1], coords[0]], { icon })
        .addTo(mapInstance.current)
        .on('click', () => {
          setSelectedUser({
            nombre: user.nombre,
            foto_perfil: user.foto_perfil,
            song: { title: "No disponible", artist: "", img: "" }
          });
          mapInstance.current.setView([coords[1], coords[0]], 15);
        });
    }).filter(Boolean);
  }, [usuariosCercanos]);

  // 4) Bounce icon al seleccionar
  useEffect(() => {
    if (!markerRefs.current.length || !selectedUser) return;

    markerRefs.current.forEach((marker, idx) => {
      const user = usuariosCercanos[idx];
      const isSel = user.nombre === selectedUser.nombre;
      const bounceClass = isSel ? ' bounce' : '';

      const isSmall = window.innerWidth < 640;
      const sizeClass = isSmall ? 'w-8 h-8' : 'w-10 h-10';
      const posClass = isSmall ? 'top-1 right-1' : 'top-2 right-2';

      const icon = L.divIcon({
        className: `custom-icon${bounceClass}`,
        html: `
          <div class='relative ${sizeClass} rounded-full flex items-center justify-center shadow-lg
                       bg-gradient-to-br from-indigo-400 to-purple-500 custom-marker'>
            <img src='${user.foto_perfil || 'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(user.nombre)}'
                 alt='${user.nombre}'
                 class='w-full h-full object-cover rounded-full' />
            <span class='absolute ${posClass} w-3 h-3 rounded-full bg-green-500
                               border-2 border-white shadow'></span>
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mapa + Selected User */}
          <div className="lg:col-span-2">
            <div className="bg-harmony-secondary/30 rounded-2xl p-4 sm:p-6 border border-harmony-text-secondary/10
                            flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh] relative">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-harmony-accent">
                Usuarios escuchando cerca
              </h2>
              <div ref={mapRef} id="map" className="rounded-2xl shadow-lg h-full" />

              {selectedUser && (
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex items-center
                                bg-harmony-secondary/80 rounded-2xl p-2 sm:p-4 border
                                border-harmony-text-secondary/20 gap-3 max-w-xs backdrop-blur-md
                                transition-all animate-fade-in-down">
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-harmony-accent
                                    shadow-lg bg-harmony-primary flex items-center justify-center overflow-hidden mb-1">
                      <img
                        src={selectedUser.foto_perfil ||
                          'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.nombre)}
                        alt={selectedUser.nombre}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-harmony-text-primary font-semibold truncate
                                     max-w-[60px] sm:max-w-[72px] text-center">
                      {selectedUser.nombre}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
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
                  <div className="flex flex-col gap-1 sm:gap-2 ml-1 sm:ml-2">
                    <button className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-accent hover:bg-harmony-accent/80
                                        rounded-full text-xs sm:text-sm font-semibold text-white shadow">
                      Seguir
                    </button>
                    <button className="px-3 sm:px-4 py-1 sm:py-1.5 bg-harmony-primary hover:bg-harmony-accent/80
                                        rounded-full text-xs sm:text-sm font-semibold text-harmony-accent shadow
                                        border border-harmony-accent">
                      Escuchar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: Amigos / Recomendaciones */}
          <div>
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6
                            border border-harmony-text-secondary/10 flex flex-col h-[50vh] sm:h-[70vh] max-h-[70vh]">
              <div className="flex items-center mb-4 gap-2">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                    activeTab === 'friends'
                      ? 'bg-harmony-accent text-white border-harmony-accent'
                      : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                  }`}
                >
                  Amigos
                </button>
                <button
                  onClick={() => setActiveTab('recomendaciones')}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                    activeTab === 'recomendaciones'
                      ? 'bg-harmony-accent text-white border-harmony-accent'
                      : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                  }`}
                >
                  Recomendaciones
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
                {activeTab === 'friends' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FRIENDS.map((amigo, idx) => (
                      <div
                        key={idx}
                        className="friend-card relative flex flex-col justify-end h-48 sm:h-64 rounded-xl overflow-hidden group shadow-lg border border-harmony-secondary/30"
                      >
                        <img
                          src={amigo.photo}
                          alt={amigo.name}
                          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300 filter blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-harmony-primary/80 via-harmony-primary/40 to-transparent" />
                        <div className="relative flex flex-col justify-end h-full px-4 sm:px-5 pb-3 sm:pb-4 pt-8 w-full">
                          <div className="font-bold text-harmony-accent text-lg sm:text-xl drop-shadow mb-1 sm:mb-2 truncate">
                            {amigo.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={amigo.song.img}
                              alt={amigo.song.title}
                              className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg object-cover border-2 border-harmony-accent shadow"
                            />
                            <div className="text-harmony-text-primary text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">
                              {amigo.song.title} - {amigo.song.artist}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow ${
                            amigo.online ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        <button
                          onClick={() => navigate(`/friends/${idx + 1}`)}
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    ))}
                    <button
                      className="flex flex-col items-center justify-center h-48 sm:h-64 rounded-xl border-2 border-dashed border-harmony-accent text-harmony-accent hover:bg-harmony-accent/10 transition shadow-lg"
                      onClick={() => {/* lógica agregar */}}
                    >
                      <span className="text-4xl mb-2">+</span>
                      <span className="font-semibold">Agregar amigo</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {SONGS.map(song => (
                      <div
                        key={song.spotifyUri}
                        className="playlist-item recommendation-card flex items-center gap-4 p-3 rounded-xl cursor-pointer"
                        onClick={async () => {
                          try { await playTrack(song.spotifyUri); }
                          catch (err) {
                            console.error('playTrack error:', err);
                            alert('No se pudo reproducir: ' + err.message);
                          }
                        }}
                      >
                        <img
                          src={song.img}
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
