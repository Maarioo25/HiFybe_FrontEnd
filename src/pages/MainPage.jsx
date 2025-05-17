import React, { useEffect, useRef, useState } from "react";
import { FRIENDS } from "../data/friends";
import { useAuth } from "../context/AuthContext";
import "./style.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { SONGS } from '../data/songs';





const USERS = FRIENDS.map(friend => ({
  name: friend.name,
  song: friend.song.title + " - " + friend.song.artist,
  songImg: friend.song.img,
  avatarImg: friend.photo,
  coords: [40.4168, -3.7038],
  online: friend.online,
  color: friend.online ? "from-indigo-400 to-purple-500" : "from-gray-400 to-gray-500"
}));


export default function MainPage() {

  const { playTrack, isPlaying, position, duration } = usePlayer();
  const { loading } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // --- Estado para usuario seleccionado en el mapa ---
  const [selectedUser, setSelectedUser] = useState(null);

  // Referencia a los marcadores para actualizar su icono sin recargar el mapa
  const markerRefs = useRef([]);

  // Inicialización del mapa (solo una vez)
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Limpiar mapa anterior si existe
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Inicializar el mapa centrado en Madrid
    mapInstance.current = L.map(mapRef.current, {
      preferCanvas: false,
      zoomControl: false
    }).setView([40.4165, -3.7026], 13);

    // --- INICIALIZACIÓN LIMPIA DEL MAPA Y Z-INDEX DE POPUPS ---
    // Pane principal de popups: siempre encima
    const popupPane = mapInstance.current.getPane('popupPane');
    if (popupPane) {
      popupPane.style.position = 'relative';
    }

    // Panes del mapa: siempre debajo
    ['tilePane','shadowPane','overlayPane','markerPane'].forEach(paneName => {
      const pane = mapInstance.current.getPane(paneName);
      if (pane) pane.style.position = 'relative';
    });

    // Añadir capa de tiles
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: " OpenStreetMap"
    }).addTo(mapInstance.current);

    // Añadir controles de zoom personalizados
    const zoomControl = L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.current);

    // Añadir marcadores para cada amigo
    markerRefs.current = FRIENDS.map((friend, idx) => {
      const icon = L.divIcon({
        className: `custom-icon`,
        html: `
          <div class='w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${friend.online ? 'from-indigo-400 to-purple-500' : 'from-gray-400 to-gray-500'} custom-marker'>
            <img src='${friend.photo}' alt='${friend.name}' class='w-10 h-10 object-cover rounded-full border-2 border-white shadow' style='display:block'/>
            <span style='position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;background:${friend.online ? '#22c55e' : '#64748b'};border:2px solid #fff;box-shadow:0 1px 3px #0002;display:block;'></span>
          </div>
        `
      });
      
      const marker = L.marker(friend.coords, { icon }).addTo(mapInstance.current);
      
      // Solo manejar el clic para seleccionar el usuario
      marker.on('click', () => {
        setSelectedUser(friend);
        // Centrar el mapa en el amigo seleccionado
        mapInstance.current.setView(friend.coords, 15);
      });
      
      return marker;
    });



    return () => {
      mapInstance.current && mapInstance.current.remove();
      mapInstance.current = null;
      markerRefs.current = [];
    };
  }, []); // Sin dependencias para que solo se ejecute una vez

  // Actualización de marcadores cuando cambia el usuario seleccionado
  useEffect(() => {
    if (!markerRefs.current.length) return;
    
    // Actualizar solo el icono del usuario seleccionado
    FRIENDS.forEach((friend, idx) => {
      const isSelected = selectedUser && selectedUser.id === friend.id;
      const bounceClass = isSelected ? ' bounce' : '';
      const icon = L.divIcon({
        className: `custom-icon${bounceClass}`,
        html: `
          <div class='relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${friend.online ? 'from-indigo-400 to-purple-500' : 'from-gray-400 to-gray-500'} custom-marker'>
            <div class='absolute inset-0 rounded-full overflow-hidden'>
              <div class='w-full h-full flex items-center justify-center'>
                <div class='w-9 h-9 rounded-full overflow-hidden'>
                  <img src='${friend.photo}' alt='${friend.name}' class='w-full h-full object-cover justify-center items-center' />
                </div>
              </div>
            </div>
            <span style='position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;background:${friend.online ? '#22c55e' : '#64748b'};border:2px solid #fff;box-shadow:0 1px 3px #0002;display:block;'></span>
          </div>
        `
      });
      markerRefs.current[idx].setIcon(icon);
    });
  }, [selectedUser]);

  // --- Estado para pestaña activa en la zona de amigos/recomendaciones ---
  const [activeTab, setActiveTab] = useState('friends'); // 'amigos' o 'recomendaciones'

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
          {/* Columna izquierda: Mapa */}
          <div className="lg:col-span-2 space-y-8" style={{position:'relative', zIndex:1}}>
            {/* Mapa interactivo */}
            <div className="bg-harmony-secondary/30 rounded-2xl p-6 border border-harmony-text-secondary/10 flex flex-col h-[calc(70vh)] max-h-[calc(70vh)]" style={{backdropFilter:'none', zIndex:1, position:'relative'}}>
              <h2 className="text-xl font-bold mb-4 text-harmony-accent">Usuarios escuchando cerca</h2>
              <div ref={mapRef} id="map" style={{ height: '100%' }} className="rounded-2xl shadow-lg h-full min-h-[320px]"></div>
              {/* Usuario seleccionado en el mapa */}
              {selectedUser && (
                <div
                  key={selectedUser.name}
                  className="absolute flex flex-row items-center bg-harmony-secondary/80 rounded-2xl shadow-2xl p-4 border border-harmony-text-secondary/20 gap-5 max-w-lg backdrop-blur-md transition-all animate-fade-in-down"
                  style={{ minWidth: 320, bottom: 32, left: 32 }}
                >
                  {/* Avatar y nombre */}
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-12 h-12 rounded-full border-2 border-harmony-accent shadow-lg bg-harmony-primary flex items-center justify-center overflow-hidden mb-1">
                      <img src={selectedUser.avatarImg || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name)} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="text-xs text-harmony-text-primary font-semibold truncate max-w-[72px] text-center drop-shadow">{selectedUser.name}</span>
                  </div>
                  {/* Info de la canción */}
                  <div className="flex flex-row items-center flex-1 min-w-0 gap-3">
                    <div className="w-14 h-14 rounded-xl border-2 border-harmony-accent shadow-lg bg-harmony-primary flex items-center justify-center overflow-hidden">
                      <img src={selectedUser?.song?.img} alt="cover" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-harmony-accent text-xs font-bold uppercase tracking-wide mb-1">Escuchando</span>
                      <div className="text-harmony-text-primary text-base font-bold truncate drop-shadow">{selectedUser?.song?.title}</div>
                      <div className="text-harmony-text-secondary text-xs truncate drop-shadow">{selectedUser?.song?.artist}</div>
                    </div>
                  </div>
                  {/* Botones */}
                  <div className="flex flex-col gap-2 ml-2">
                    <button className="px-4 py-1 bg-harmony-accent hover:bg-harmony-accent/80 rounded-full text-xs font-semibold text-white shadow transition whitespace-nowrap flex items-center gap-1"><span>Seguir</span></button>
                    <button className="px-4 py-1 bg-harmony-primary hover:bg-harmony-accent/80 rounded-full text-xs font-semibold text-harmony-accent shadow transition whitespace-nowrap flex items-center gap-1 border border-harmony-accent"><span>Escuchar</span></button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Columna derecha: ahora muestra amigos */}
          <div className="space-y-8 z-0">
            {/* Lista de amigos */}
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-6 border border-harmony-text-secondary/10 flex flex-col h-[calc(70vh)] max-h-[calc(70vh)]">
              <div className="flex items-center mb-4 gap-2">
                <button
                  className={`px-4 py-1 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${activeTab === 'friends' ? 'bg-harmony-accent text-white border-harmony-accent' : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'}`}
                  onClick={() => setActiveTab('friends')}
                >
                  Amigos
                </button>
                <button
                  className={`px-4 py-1 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${activeTab === 'recomendaciones' ? 'bg-harmony-accent text-white border-harmony-accent' : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'}`}
                  onClick={() => setActiveTab('recomendaciones')}
                >
                  Recomendaciones
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
                {activeTab === 'friends' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {USERS.map((amigo, idx) => (
                      <div
                        key={amigo.name}
                        className="friend-card relative flex flex-col justify-end h-64 rounded-xl overflow-hidden group shadow-lg border border-harmony-secondary/30"
                      >
                        {/* Imagen de fondo difuminada */}
                        <img
                          src={amigo.avatarImg}
                          alt={amigo.name}
                          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
                          style={{ filter: 'blur(2px)' }}
                        />
                        {/* Gradiente de difuminado hacia arriba */}
                        <div className="absolute inset-0 bg-gradient-to-t from-harmony-primary/80 via-harmony-primary/40 to-transparent" />
                        {/* Contenido encima */}
                        <div className="relative flex flex-col justify-end h-full px-5 pb-4 pt-8 w-full">
                          <div className="font-bold text-harmony-accent text-lg drop-shadow mb-2 truncate">{amigo.name}</div>
                          <div className="flex items-center gap-2">
                            <img src={amigo.songImg} alt="cover" className="w-8 h-8 rounded-lg object-cover border-2 border-harmony-accent shadow" />
                            <div className="text-harmony-text-primary text-sm truncate max-w-[120px]">{amigo.song}</div>
                          </div>
                        </div>
                        {/* Estado online/offline */}
                        <span style={{position:'absolute',top:3,right:3,width:13,height:13,borderRadius:'50%',background:amigo.online?'#22c55e':'#64748b',border:'2px solid #fff',boxShadow:'0 1px 3px #0002',display:'block'}}></span>
                        <button
                          onClick={() => navigate(`/friends/${idx + 1}`)}
                          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        ></button>
                      </div>
                    ))}
                    {/* Botón para agregar amigos */}
                    <button
                      className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-harmony-accent text-harmony-accent hover:bg-harmony-accent/10 transition shadow-lg cursor-pointer mt-2"
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
        className="playlist-item recommendation-card flex items-center gap-4 p-3 rounded-xl cursor-pointer"
        onClick={async () => {
          console.log('click!', song.spotifyUri);
          try {
            await playTrack(song.spotifyUri);
            console.log('playTrack invoked');
          } catch (err) {
            console.error('Error en playTrack:', err);
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
