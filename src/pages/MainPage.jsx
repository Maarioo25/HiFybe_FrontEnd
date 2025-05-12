import React, { useEffect, useRef, useState } from "react";
import { FRIENDS } from "../data/friends";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt, FaUserCircle, FaBell, FaPlay, FaPause, FaStepBackward, FaStepForward, FaShareAlt, FaRedo, FaHome, FaMusic, FaUserFriends, FaSearch, FaComments } from "react-icons/fa";
import "./style.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

// Usar los datos de FRIENDS directamente
const USERS = FRIENDS.map(friend => ({
  name: friend.name,
  song: friend.song.title + " - " + friend.song.artist,
  songImg: friend.song.img,
  avatarImg: friend.photo,
  coords: [40.4168, -3.7038], // Coordenadas por defecto
  online: friend.online,
  color: friend.online ? "from-indigo-400 to-purple-500" : "from-gray-400 to-gray-500"
}));

const RECOMMENDATIONS = [
  {
    title: "As It Was",
    artist: "Harry Styles",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/as-it-was.mp3"
  },
  {
    title: "Peaches",
    artist: "Justin Bieber",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/peaches.mp3"
  },
  {
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/stay.mp3"
  },
  {
    title: "MONTERO (Call Me By Your Name)",
    artist: "Lil Nas X",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/montero.mp3"
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/levitating.mp3"
  },
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    img: "https://i.scdn.co/image",
    audioUrl: "C:\Users\maari\Desktop\I Thought About Killing You.mp3"
  },
  {
    title: "Save Your Tears",
    artist: "The Weeknd",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/save-your-tears.mp3"
  },
  {
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/watermelon-sugar.mp3"
  },
  {
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/good-4-u.mp3"
  },
  {
    title: "drivers license",
    artist: "Olivia Rodrigo",
    img: "https://i.scdn.co/image",
    audioUrl: "https://example.com/drivers-license.mp3"
  }
];

export default function MainPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const menuRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!showSearch) {
      setSearchValue("");
      setSearchResults([]);
    }
  }, [showSearch]);

  useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      return;
    }
    // Buscar tanto en RECOMMENDATIONS como en USERS
    const songResults = RECOMMENDATIONS.filter(song =>
      song.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchValue.toLowerCase())
    ).map(song => ({
      ...song,
      _type: 'recommendation'
    }));
    const userSongs = USERS.filter(u =>
      u.song && (
        u.song.toLowerCase().includes(searchValue.toLowerCase()) ||
        u.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    ).map(u => ({
      title: u.song.split(' - ')[0] || u.song,
      artist: (u.song.split(' - ')[1] || '').trim() || '',
      img: u.songImg,
      audioUrl: u.audioUrl,
      listenedBy: u.name,
      _type: 'userSong'
    }));
    setSearchResults([...songResults, ...userSongs].slice(0, 5));
  }, [searchValue]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const handlePlayPause = () => setIsPlaying(p => !p);

  const [volume, setVolume] = useState(70);
  const handleVolumeChange = (e) => setVolume(Number(e.target.value));

  // Estado y lógica para la barra de progreso
  const [progress, setProgress] = useState(45); // en segundos
  const duration = 200; // duración total en segundos (ejemplo: 3:20)

  // Actualiza la barra cada segundo si está reproduciendo
  useEffect(() => {
    if (!isPlaying) return;
    if (progress >= duration) return;
    const interval = setInterval(() => {
      setProgress((p) => (p < duration ? p + 1 : p));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, progress, duration]);

  // Formatea segundos a mm:ss
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Drag manual para el thumb
  function startDrag(e) {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    const upEvent = isTouch ? 'touchend' : 'mouseup';
    const bar = e.target.closest('.group');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    function getX(ev) {
      if (isTouch) return ev.touches[0].clientX;
      return ev.clientX;
    }
    function onMove(ev) {
      const x = getX(ev);
      let percent = (x - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      setProgress(Math.round(percent * duration));
    }
    function onUp() {
      window.removeEventListener(moveEvent, onMove);
      window.removeEventListener(upEvent, onUp);
    }
    window.addEventListener(moveEvent, onMove);
    window.addEventListener(upEvent, onUp);
  }

  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

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
      {/* Barra de navegación */}
      <HeaderBar
        onSongSelect={(song) => {
          // Reiniciar el progreso y pausar la canción anterior
          setProgress(0);
          setIsPlaying(false);
          
          // Establecer la nueva canción y comenzar a reproducir
          setCurrentSong(song);
          setIsPlaying(true);
          
          // Reiniciar el audio si existe
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }}
      >
        {/* Aquí puedes incluir la barra de búsqueda y otros elementos específicos de MainPage si lo necesitas */}
      </HeaderBar>

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
                    {RECOMMENDATIONS.map((rec, idx) => (
                      <div key={rec.title} className="playlist-item recommendation-card flex items-center gap-4 p-3 rounded-xl cursor-pointer select-none w-full"
                        style={{ minWidth: 0 }}
                        onClick={() => {
                          setIsPlaying(true);
                          setCurrentSong(rec);
                          setProgress(0);
                        }}
                      >
                        <img src={rec.img} alt={rec.title} className="w-12 h-12 rounded shadow object-cover border-2 border-harmony-accent flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-harmony-text-primary truncate max-w-full">{rec.title}</div>
                          <div className="text-xs text-harmony-text-secondary truncate max-w-full">{rec.artist}</div>
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
      {/* Reproductor de música fijo abajo */}
      <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl">
        <div className="mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-4 px-4 py-3 relative">
          {/* Imagen de fondo degradada de la canción */}
          <div
            className="absolute left-0 top-0 h-full pointer-events-none select-none overflow-hidden"
            style={{ 
              width: '40%', // Constrain to 20% of the screen
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${currentSong?.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left',
                filter: 'blur(12px) brightness(0.7)',
                maskImage: `linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0) 100%)`, // Gradient mask for fade
                WebkitMaskImage: `linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0) 100%)`, // Vendor prefix for broader compatibility
              }}
            />
          </div>

          {/* Portada y título */}
          <div className="flex items-center gap-4 min-w-[200px] max-w-[320px] w-[320px] relative overflow-hidden">
            <img src={currentSong?.img} alt="Album cover" className="w-14 h-14 rounded-xl object-cover border-2 border-harmony-accent shadow-lg shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-harmony-text-primary leading-tight truncate max-w-[210px]" title={currentSong?.title}>{currentSong?.title}</div>
              <div className="text-xs text-harmony-text-secondary truncate max-w-[210px]" title={currentSong?.artist}>{currentSong?.artist}</div>
            </div>
          </div>
          {/* Centro: barra y controles */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            {/* Barra de progreso */}
            <div className="w-full flex items-center gap-3 mb-2">
              <span className="text-xs text-harmony-text-secondary w-10 text-right select-none">{formatTime(progress)}</span>
              <div className="relative flex-1 h-3 flex items-center group"
                onClick={e => {
                  if (e.target.closest('.cursor-pointer')) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  setProgress(Math.round(x * duration));
                }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 progress-bar-bg rounded-full" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-harmony-accent rounded-full transition-all"
                  style={{ width: `${(progress/duration)*100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `calc(${(progress/duration)*100}% - 10px)` }}
                  tabIndex={0}
                  role="slider"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  onMouseDown={startDrag}
                  onTouchStart={startDrag}
                >
                  <div className="w-4 h-4 bg-harmony-accent border-2 border-white rounded-full shadow transition-all group-hover:scale-110" />
                </div>
              </div>
              <span className="text-xs text-harmony-text-secondary w-10 text-left select-none">{formatTime(duration)}</span>
            </div>
            {/* Controles */}
            <div className="flex items-center justify-center gap-4 w-full">
              <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Repetir">
                <FaRedo className="text-lg" />
              </button>
              <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Anterior">
                <FaStepBackward className="text-lg" />
              </button>
              <button className="w-12 h-12 rounded-full bg-harmony-accent flex items-center justify-center hover:bg-harmony-accent/80 transition shadow-xl mx-2" onClick={handlePlayPause} aria-label="Play/Pause">
                {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
              </button>
              <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Siguiente">
                <FaStepForward className="text-lg" />
              </button>
              <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Compartir">
                <FaShareAlt className="text-lg" />
              </button>
            </div>
          </div>
          {/* Volumen a la derecha */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <input
              type="range"
              className="volume-slider w-24 h-2 accent-harmony-accent bg-harmony-secondary/20 rounded-full"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volumen"
            />
            <span className="text-xs text-harmony-text-secondary w-8 text-center select-none">{volume}</span>
          </div>
        </div>
      </div>
      {/* Reproductor de audio */}
      <audio ref={audioRef} src={currentSong?.audioUrl || 'https://example.com/default.mp3'} autoPlay={isPlaying} style={{display:'none'}} onEnded={()=>setIsPlaying(false)} />
    </div>
  );
}
