import React, { useState, useRef } from "react";
import { FaUserFriends, FaMusic, FaSearch, FaHome, FaComments } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HeaderBar({ children, onSongSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  // Datos de ejemplo de canciones (puedes conectar esto a tu backend)
  const SONGS = [
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      img: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png",
      audioUrl: "https://example.com/blinding-lights.mp3"
    },
    {
      title: "Save Your Tears",
      artist: "The Weeknd",
      img: "https://images.genius.com/9d35a5dff10090e6c1d5e077932cea99.1000x1000x1.jpg",
      audioUrl: "https://example.com/save-your-tears.mp3"
    },
    {
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      img: "https://upload.wikimedia.org/wikipedia/en/b/bf/Watermelon_Sugar_-_Harry_Styles.png",
      audioUrl: "https://example.com/watermelon-sugar.mp3"
    },
    {
      title: "drivers license",
      artist: "Olivia Rodrigo",
      img: "https://i.scdn.co/image/ab67616d0000b27391446773f7022233013144c5",
      audioUrl: "https://example.com/drivers-license.mp3"
    }
  ];

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    // Solo buscar si hay texto
    if (value.trim()) {
      // Filtrar canciones basado en el valor de búsqueda
      const results = SONGS.filter(song => 
        song.title.toLowerCase().includes(value) ||
        song.artist.toLowerCase().includes(value)
      );
      setSearchResults(results);
    } else {
      // Si la búsqueda está vacía, no mostrar resultados
      setSearchResults([]);
    }
  };

  return (
    <nav className={`header-bar flex items-center justify-between py-4 px-8 bg-harmony-primary/90 rounded-b-3xl shadow-lg mb-8 transition-all duration-500 ${showSearch ? 'z-[60] drop-shadow-2xl' : ''}`} style={{position:'relative'}}>
      <div className="flex items-center gap-3 relative">
        <span className="font-bold text-2xl text-harmony-accent tracking-tight cursor-pointer" onClick={() => navigate("/")}>HiFybe</span>
        <button
          className="ml-2 mr-1 p-2 rounded-full hover:bg-harmony-accent/10 transition text-harmony-accent focus:outline-none"
          aria-label="Buscar"
          onClick={() => setShowSearch(v => !v)}
        >
          <FaSearch className="w-5 h-5" />
        </button>
        {/* Barra de búsqueda animada */}
        <div 
          className={`absolute left-36 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${showSearch ? 'w-64 opacity-100' : 'w-0 opacity-0'} bg-harmony-primary/90 rounded-full shadow px-4 py-2 flex items-center overflow-hidden border border-harmony-accent/30`} style={{ minHeight: 40 }}>
          <input
            ref={searchInputRef}
            type="text"
            className="bg-transparent outline-none text-harmony-text-primary placeholder-harmony-text-secondary w-full text-sm"
            placeholder="Buscar canciones, artistas..."
            autoFocus={showSearch}
            value={searchValue}
            onChange={handleSearch}
            onBlur={() => setShowSearch(false)}
          />
        </div>
        {/* Resultados de búsqueda */}
        {showSearch && (
          <div className="absolute left-36 top-1/2 transform translate-y-[100%] mt-2 w-64 bg-harmony-secondary/90 rounded-xl shadow-2xl border border-harmony-accent/30 animate-fade-in-down z-[70]" style={{
            position: 'absolute',
            top: '100%',
            left: '20%',
            transform: 'none',
            width: '320px'
          }}>
            {searchResults.length > 0 ? (
              searchResults.map((song, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-harmony-accent/10 cursor-pointer transition rounded-xl"
                  onClick={() => {
                    if (onSongSelect) {
                      onSongSelect(song);
                    }
                  }}
                >
                  <img src={song.img} alt="cover" className="w-10 h-10 rounded-lg object-cover border border-harmony-accent/30" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-harmony-text-primary text-base">{song.title}</span>
                    <span className="text-xs text-harmony-text-secondary">{song.artist}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-4 text-harmony-text-secondary text-sm">
                {searchValue.trim() ? "No se encontraron resultados" : "Escribe algo para buscar"}
              </div>
            )}
          </div>
        )}
        <div className={`flex items-center gap-2 transition-all duration-300 ${showSearch ? 'translate-x-64' : ''}`}>
          <button
            className={`px-3 py-1 rounded-full text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent font-semibold transition flex items-center gap-2 ${location.pathname === "/" ? "bg-harmony-accent/20 text-harmony-accent" : ""}`}
            onClick={() => navigate("/")}
          >
            <FaHome className="text-lg" />
            <span>Inicio</span>
          </button>
          <button
            className={`px-3 py-1 rounded-full text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent font-semibold transition flex items-center gap-2 ${location.pathname.includes("/playlists") ? "" : (location.pathname.startsWith("/friends") || location.pathname === "/friends")? "bg-harmony-accent/20 text-harmony-accent": ""}`}

            onClick={() => navigate("/friends")}
          >
            <FaUserFriends className="text-lg" />
            <span>Amigos</span>
          </button>
          <button
            className={`px-3 py-1 rounded-full text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent font-semibold transition flex items-center gap-2 ${location.pathname.includes("/playlists") ? "bg-harmony-accent/20 text-harmony-accent" : ""}`}
            onClick={() => navigate("/playlists")}
          >
            <FaMusic className="text-lg" />
            <span>Playlists</span>
          </button>
          <button
            className={`px-3 py-1 rounded-full text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent font-semibold transition flex items-center gap-2 ${location.pathname === "/chats" ? "bg-harmony-accent/20 text-harmony-accent" : ""}`}
            onClick={() => navigate("/chats")}
          >
            <FaComments className="text-lg" />
            <span>Chats</span>
          </button>
        </div>
      </div>
      {children}
      {/* Icono de perfil y menú de usuario */}
      <div className="relative flex items-center">
        <ProfileMenu user={user} logout={logout} />
      </div>
    </nav>
  );
}

// --- Menú de perfil desplegable ---
import { FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";

function ProfileMenu({ user, logout }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="ml-4 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-3xl"
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de perfil"
      >
        <FaUserCircle />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-harmony-primary/95 rounded-xl shadow-xl border border-harmony-accent/20 z-50 animate-fade-in-down">
          <div className="px-4 py-3 border-b border-harmony-accent/10">
            <span className="font-semibold text-harmony-accent text-base block">{user?.name || 'Mi perfil'}</span>
            <span className="text-xs text-harmony-text-secondary">{user?.email}</span>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => {/* Aquí puedes navegar a la página de perfil */ setOpen(false); }}
          >
            <FaCog className="text-lg" />
            Ajustes de perfil
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => { logout(); setOpen(false); }}
          >
            <FaSignOutAlt className="text-lg" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
