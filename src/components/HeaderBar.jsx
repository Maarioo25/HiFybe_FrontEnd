import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaUserFriends,
  FaMusic,
  FaSearch,
  FaHome,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import debounce from "lodash.debounce";
import NotificationBell from "./NotificationBell"; 


export default function HeaderBar({ children, onSongSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para mostrar/ocultar el input de búsqueda
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Refs para manejar clicks fuera y foco
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Token de Spotify almacenado en localStorage
  const spotifyToken = localStorage.getItem("sp_token");

  // Poner foco en el input cuando se muestre
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Cerrar el dropdown al hacer clic fuera del contenedor completo (input + resultados)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
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
   * Llama al endpoint de búsqueda de Spotify y actualiza searchResults
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
      setSearchResults(data.tracks?.items || []);
    } catch (err) {
      console.error("Error buscando en Spotify:", err);
      setErrorMsg("Ocurrió un error al buscar en Spotify.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para no llamar al API en cada pulsación, sino 300ms después
  const debouncedSearch = useCallback(
    debounce((term) => {
      fetchSpotifySearch(term);
    }, 300),
    [spotifyToken]
  );

  // Maneja cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setErrorMsg(null);
    debouncedSearch(value);
  };

  // Al seleccionar una pista, llamamos a onSongSelect(uri)
  const handleSelectTrack = async (track) => {
    if (onSongSelect) {
      onSongSelect(track.uri);
    }
  
    try {
      const currentUser = await userService.getCurrentUser();
      const trackId = track.uri.split(":").pop();
      await userService.setCancionUsuario(currentUser.user._id, trackId);
    } catch (err) {
      console.error("Error guardando canción:", err);
    }
  
    setShowSearch(false);
    setSearchValue("");
    setSearchResults([]);
    setErrorMsg(null);
  };

  // Manejar Enter para seleccionar el primer resultado
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
      {/* Logo y búsqueda */}
      <div className="flex items-center gap-4">
        <span
          className="font-bold text-2xl text-harmony-accent cursor-pointer"
          onClick={() => navigate("/")}
        >
          HiFybe
        </span>

        {/* Contenedor completo de búsqueda (botón, input y resultados) */}
        <div className="relative" ref={searchContainerRef}>
          {/* Botón para mostrar/ocultar el input de búsqueda */}
          <button
            className="p-2 rounded-full hover:bg-harmony-accent/10 transition"
            onClick={() => {
              setShowSearch((v) => !v);
              if (showSearch) {
                // Si se cierra, resetear estados
                setSearchValue("");
                setSearchResults([]);
                setErrorMsg(null);
              }
            }}
            aria-label="Buscar"
          >
            <FaSearch className="w-5 h-5 text-harmony-accent" />
          </button>

          {/* Input de búsqueda (círculo expandible) */}
          <div
            className={`
              absolute top-0 left-full ml-2 flex items-center
              bg-harmony-primary/90 border border-harmony-accent/30
              rounded-full transition-all duration-300
              ${showSearch ? "w-64 px-4 py-2 opacity-100" : "w-0 px-0 py-0 opacity-0 pointer-events-none"}
            `}
            style={{ minHeight: 40 }}
          >
            <input
              ref={searchInputRef}
              type="text"
              className="bg-transparent outline-none w-full text-harmony-text-primary placeholder-harmony-text-secondary"
              placeholder="Buscar en Spotify..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Dropdown de resultados, posicionado debajo del input */}
          {showSearch && (
            <div className="absolute top-full left-full mt-2 ml-2 w-64 bg-harmony-secondary/90 rounded-xl border border-harmony-accent/30 shadow-lg z-50">
              {isLoading && (
                <div className="px-4 py-2 text-center text-harmony-text-secondary">
                  Buscando...
                </div>
              )}
              {!isLoading && errorMsg && (
                <div className="px-4 py-2 text-sm text-red-500">{errorMsg}</div>
              )}
              {!isLoading &&
                !errorMsg &&
                searchResults.length === 0 &&
                searchValue.trim() !== "" && (
                  <div className="px-4 py-2 text-center text-harmony-text-secondary">
                    No se encontraron resultados.
                  </div>
                )}
              {!isLoading &&
                searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-harmony-accent/20 cursor-pointer"
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
            to === "/" ? location.pathname === to : location.pathname.startsWith(to);
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

      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <NotificationBell />
        <ProfileMenu user={user} logout={logout} />
      </div>

      {children}
    </nav>
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
