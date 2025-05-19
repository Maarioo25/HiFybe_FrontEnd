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

  const SONGS = [
    { title: "Blinding Lights", artist: "The Weeknd", img: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png", audioUrl: "https://example.com/blinding-lights.mp3" },
    { title: "Save Your Tears", artist: "The Weeknd", img: "https://images.genius.com/9d35a5dff10090e6c1d5e077932cea99.1000x1000x1.jpg", audioUrl: "https://example.com/save-your-tears.mp3" },
    { title: "Watermelon Sugar", artist: "Harry Styles", img: "https://upload.wikimedia.org/wikipedia/en/b/bf/Watermelon_Sugar_-_Harry_Styles.png", audioUrl: "https://example.com/watermelon-sugar.mp3" },
    { title: "drivers license", artist: "Olivia Rodrigo", img: "https://i.scdn.co/image/ab67616d0000b27391446773f7022233013144c5", audioUrl: "https://example.com/drivers-license.mp3" }
  ];

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    if (value.trim()) {
      setSearchResults(
        SONGS.filter(song => 
          song.title.toLowerCase().includes(value) || song.artist.toLowerCase().includes(value)
        )
      );
    } else {
      setSearchResults([]);
    }
  };

  return (
    <nav className={`header-bar flex flex-col md:flex-row items-center md:justify-between py-4 px-4 md:px-8 bg-harmony-primary/90 rounded-b-3xl shadow-lg mb-8 transition-all duration-500 ${showSearch ? 'z-[60] drop-shadow-2xl' : ''}`} style={{ position: 'relative' }}>
      {/* Título y búsqueda */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3">
        <span
          className="font-bold text-xl md:text-2xl text-harmony-accent tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          HiFybe
        </span>
        <button
          className="p-2 rounded-full hover:bg-harmony-accent/10 transition text-harmony-accent focus:outline-none"
          aria-label="Buscar"
          onClick={() => setShowSearch(v => !v)}
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </div>

      {/* Barra de búsqueda animada */}
      <div
        className={`absolute top-[56px] md:top-1/2 md:left-36 transform md:-translate-y-1/2 transition-all duration-300 ${showSearch ? 'w-full md:w-64 opacity-100 px-4 py-2' : 'w-0 opacity-0 p-0'} bg-harmony-primary/90 rounded-full shadow flex items-center overflow-hidden border border-harmony-accent/30`}
        style={{ minHeight: 40, left: showSearch ? '1rem' : undefined }}
      >
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
        <div
          className="absolute top-[96px] md:top-[calc(50%+32px)] md:left-36 w-full md:w-64 bg-harmony-secondary/90 rounded-xl shadow-2xl border border-harmony-accent/30 animate-fade-in-down z-[70] overflow-hidden"
        >
          {searchResults.length > 0 ? (
            searchResults.map((song, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 hover:bg-harmony-accent/10 cursor-pointer transition rounded-none md:rounded-xl"
                onClick={() => onSongSelect?.(song)}
              >
                <img
                  src={song.img}
                  alt="cover"
                  className="w-10 h-10 rounded-lg object-cover border border-harmony-accent/30"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-harmony-text-primary text-sm md:text-base">{song.title}</span>
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

      {/* Navegación */}
      <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-2 mt-4 md:mt-0 transition-all duration-300 ${showSearch ? 'translate-y-20 md:translate-x-64' : ''}">
        {[
          { icon: <FaHome />, label: 'Inicio', to: '/' },
          { icon: <FaUserFriends />, label: 'Amigos', to: '/friends' },
          { icon: <FaMusic />, label: 'Playlists', to: '/playlists' },
          { icon: <FaComments />, label: 'Chats', to: '/chats' },
        ].map(({ icon, label, to }) => {
          const active = to === '/' ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`px-3 py-1 rounded-full text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent font-semibold flex items-center gap-2 ${active ? 'bg-harmony-accent/20 text-harmony-accent' : ''}`}
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Perfil */}
      <div className="relative flex items-center mt-4 md:mt-0 md:ml-4">
        <ProfileMenu user={user} logout={logout} />
      </div>

      {children}
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
        className="ml-4 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-2xl md:text-3xl"
        onClick={() => setOpen(v => !v)}
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
            onClick={() => { /* navegar a perfil */ setOpen(false); }}
          >
            <FaCog className="text-lg" /> Ajustes de perfil
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => { logout(); setOpen(false); }}
          >
            <FaSignOutAlt className="text-lg" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}