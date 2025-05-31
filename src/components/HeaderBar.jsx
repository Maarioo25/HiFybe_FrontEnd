import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaUserFriends,
  FaMusic,
  FaSearch,
  FaHome,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaBell,
} from "react-icons/fa";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debounce from "lodash.debounce";

export default function HeaderBar({ children, onSongSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para mostrar/ocultar el input de búsqueda
  const [showSearch, setShowSearch] = useState(false);
  // Texto que el usuario escribe
  const [searchValue, setSearchValue] = useState("");
  // Resultados devueltos por Spotify API
  const [searchResults, setSearchResults] = useState([]);
  // Control de carga / error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Token de Spotify almacenado en localStorage
  const spotifyToken = localStorage.getItem("sp_token");

  // Si se abre el campo de búsqueda, hacemos focus al input
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Cerrar dropdown de búsqueda si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        showSearch
      ) {
        setShowSearch(false);
        setSearchValue("");
        setSearchResults([]);
        setErrorMsg(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  /**
   * fetchSpotifySearch
   * Llama al endpoint de búsqueda de Spotify y actualiza searchResults.
   */
  const fetchSpotifySearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      setErrorMsg(null);
      return;
    }
    if (!spotifyToken) {
      setErrorMsg("Conéctate a Spotify para buscar canciones.");
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const encoded = encodeURIComponent(query);
      const endpoint = `https://api.spotify.com/v1/search?q=${encoded}&type=track&limit=5`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Token de Spotify expirado. Vuelve a conectar tu cuenta.");
        } else {
          const txt = await res.text();
          setErrorMsg(`Error: ${txt}`);
        }
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const tracks = data.tracks?.items || [];
      setSearchResults(tracks);
    } catch (err) {
      console.error("Error buscando en Spotify:", err);
      setErrorMsg("Ocurrió un error al buscar en Spotify.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para no llamar en cada tecla, sino 300ms después de que deje de teclear
  const debouncedSearch = useCallback(
    debounce((term) => {
      fetchSpotifySearch(term);
    }, 300),
    [spotifyToken]
  );

  // Cada vez que cambia el texto del input, disparamos la búsqueda debounced
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setErrorMsg(null);
    debouncedSearch(value);
  };

  // Al seleccionar un resultado: llamamos a onSongSelect(uri), cerramos dropdown
  const handleSelectTrack = (track) => {
    const uri = track.uri;
    if (onSongSelect) {
      onSongSelect(uri);
    }
    setShowSearch(false);
    setSearchValue("");
    setSearchResults([]);
    setErrorMsg(null);
  };

  // Control de pulsar Enter en el input: si hay resultados, selecciona el primero
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSelectTrack(searchResults[0]);
    }
  };

  return (
    <nav
      className="relative flex flex-col md:flex-row items-center justify-between
                 bg-harmony-primary/90 px-6 py-4 rounded-b-3xl shadow-lg mb-8"
    >
      {/* Logo + Botón de búsqueda */}
      <div className="relative flex items-center gap-4">
        <span
          className="font-bold text-2xl text-harmony-accent cursor-pointer"
          onClick={() => navigate("/")}
        >
          HiFybe
        </span>
        <button
          className="p-2 rounded-full hover:bg-harmony-accent/10 transition"
          onClick={() => {
            setShowSearch((v) => !v);
            setSearchValue("");
            setSearchResults([]);
            setErrorMsg(null);
          }}
          aria-label="Buscar"
        >
          <FaSearch className="w-5 h-5 text-harmony-accent" />
        </button>

        {/* Contenedor del input y dropdown de resultados */}
        <div
          className={`
            absolute z-50
            top-full left-1/2 transform -translate-x-1/2 mt-2
            md:top-1/2 md:left-36 md:transform md:-translate-y-1/2 md:translate-x-0 md:mt-0
            bg-harmony-primary/90 border border-harmony-accent/30
            rounded-full flex flex-col overflow-hidden
            transition-all duration-300
            ${showSearch ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"}
          `}
          style={{ minHeight: 40 }}
          ref={dropdownRef}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="bg-transparent outline-none w-full px-4 py-2 text-harmony-text-primary placeholder-harmony-text-secondary"
            placeholder="Buscar en Spotify..."
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />

          {/* Dropdown con resultados */}
          {showSearch && (
            <div className="mt-1 bg-harmony-secondary/20 rounded-b-xl overflow-hidden">
              {isLoading && (
                <div className="px-4 py-2 text-center text-harmony-text-secondary">
                  Buscando...
                </div>
              )}
              {errorMsg && !isLoading && (
                <div className="px-4 py-2 text-sm text-red-500">{errorMsg}</div>
              )}
              {!isLoading && !errorMsg && searchResults.length === 0 && searchValue.trim() !== "" && (
                <div className="px-4 py-2 text-center text-harmony-text-secondary">
                  No se encontraron resultados.
                </div>
              )}
              {!isLoading &&
                searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-harmony-accent/10 cursor-pointer"
                    onClick={() => handleSelectTrack(track)}
                  >
                    <img
                      src={track.album.images[0]?.url || "https://via.placeholder.com/40"}
                      alt={track.name}
                      className="w-8 h-8 rounded object-cover border-2 border-harmony-accent"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-harmony-text-primary font-semibold truncate"
                        title={track.name}
                      >
                        {track.name}
                      </div>
                      <div
                        className="text-xs text-harmony-text-secondary truncate"
                        title={track.artists.map((a) => a.name).join(", ")}
                      >
                        {track.artists.map((a) => a.name).join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Enlaces centrales: Inicio, Amigos, Playlists, Chats */}
      <div className="flex-1 flex items-center justify-center gap-2 mt-4 md:mt-0">
        {[
          { icon: <FaHome />, label: "Inicio", to: "/" },
          { icon: <FaUserFriends />, label: "Amigos", to: "/friends" },
          { icon: <FaMusic />, label: "Playlists", to: "/playlists" },
          { icon: <FaComments />, label: "Chats", to: "/chats" },
        ].map(({ icon, label, to }) => {
          const active =
            to === "/"
              ? location.pathname === to
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`
                px-3 py-1 rounded-full flex items-center gap-2
                font-semibold transition
                ${
                  active
                    ? "bg-harmony-accent/20 text-harmony-accent"
                    : "text-harmony-text-primary hover:bg-harmony-accent/10 hover:text-harmony-accent"
                }
              `}
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Notificaciones + Perfil */}
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <NotificationBell />
        <ProfileMenu user={user} logout={logout} />
      </div>

      {children}
    </nav>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const [notifications] = useState([]); // Puedes cargar desde API si lo deseas

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="p-2 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-2xl"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <FaBell />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-harmony-primary/95 rounded-xl shadow-xl border border-harmony-accent/20 z-50 animate-fade-in-down text-sm">
          <div className="px-4 py-3 border-b border-harmony-accent/10 font-semibold text-harmony-accent">
            Notificaciones
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-4 text-center text-harmony-text-secondary">
              No tienes ninguna notificación pendiente
            </div>
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-harmony-accent/10 cursor-pointer text-harmony-text-primary"
                >
                  {n.mensaje}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

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
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de perfil"
      >
        <FaUserCircle />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-harmony-primary/95 rounded-xl shadow-xl border border-harmony-accent/20 z-50 animate-fade-in-down">
          <div className="px-4 py-3 border-b border-harmony-accent/10">
            <span className="font-semibold text-harmony-accent text-base block">
              {user?.name || "Mi perfil"}
            </span>
            <span className="text-xs text-harmony-text-secondary">
              {user?.email}
            </span>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => {
              setOpen(false);
            }}
          >
            <FaCog className="text-lg" /> Ajustes de perfil
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <FaSignOutAlt className="text-lg" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
