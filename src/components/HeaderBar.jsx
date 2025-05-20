import React, { useState, useRef, useEffect } from "react";
import { FaUserFriends, FaMusic, FaSearch, FaHome, FaComments, FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";
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

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  return (
    <nav className="relative flex flex-col md:flex-row items-center justify-between
                    bg-harmony-primary/90 px-6 py-4 rounded-b-3xl shadow-lg mb-8">
      {/* Logo + Botón de búsqueda (wrapper relativo) */}
      <div className="relative flex items-center gap-4">
        <span
          className="font-bold text-2xl text-harmony-accent cursor-pointer"
          onClick={() => navigate("/")}
        >
          HiFybe
        </span>

        {/* search toggle */}
        <button
          className="p-2 rounded-full hover:bg-harmony-accent/10 transition"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Buscar"
        >
          <FaSearch className="w-5 h-5 text-harmony-accent" />
        </button>

        <div
          className={`
            absolute z-50
            top-full left-1/2 transform -translate-x-1/2 mt-2
            md:top-1/2 md:left-36 md:transform md:-translate-y-1/2 md:translate-x-0 md:mt-0

            bg-harmony-primary/90 border border-harmony-accent/30
            rounded-full flex items-center overflow-hidden
            transition-all duration-300

            ${showSearch
              ? "w-64 px-4 py-2 opacity-100"
              : "w-0 px-0 py-0 opacity-0 pointer-events-none"}
          `}
          style={{ minHeight: 40 }}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="bg-transparent outline-none flex-1 text-harmony-text-primary placeholder-harmony-text-secondary"
            placeholder="Buscar canciones, artistas..."
            value={searchValue}
            onChange={handleSearch}
            onBlur={() => setShowSearch(false)}
          />
        </div>
      </div>

      {/* Navegación principal (ya no se mueve) */}
      <div className="flex-1 flex items-center justify-center gap-2 mt-4 md:mt-0">
        {[ 
          { icon: <FaHome />, label: 'Inicio', to: '/' },
          { icon: <FaUserFriends />, label: 'Amigos', to: '/friends' },
          { icon: <FaMusic />, label: 'Playlists', to: '/playlists' },
          { icon: <FaComments />, label: 'Chats', to: '/chats' },
        ].map(({ icon, label, to }) => {
          const active = to === '/' 
            ? location.pathname === to 
            : location.pathname.startsWith(to);
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`
                px-3 py-1 rounded-full flex items-center gap-2
                font-semibold transition
                ${active 
                  ? 'bg-harmony-accent/20 text-harmony-accent'
                  : 'text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent'}
              `}
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
        <ProfileMenu user={user} logout={logout} />
      </div>

      {children}

      {/* Aquí iría el dropdown de ProfileMenu, igual que antes */}
    </nav>
  );
}


// --- Menú de perfil desplegable ---
function ProfileMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
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
        className="p-2 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-2xl"
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
