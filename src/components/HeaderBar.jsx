// src/components/HeaderBar.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaUserFriends,
  FaMusic,
  FaSearch,
  FaHome,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import UserSettingsModal from './UserSettingsModal';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import debounce from 'lodash.debounce';
import NotificationBell from './NotificationBell';

export default function HeaderBar({ children, onSongSelect }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  // Estados para búsqueda
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const spotifyToken = localStorage.getItem('sp_token');

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        showSearch
      ) {
        setShowSearch(false);
        setSearchValue('');
        setSearchResults([]);
        setErrorMsg(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const fetchSpotifySearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      setErrorMsg(null);
      return;
    }
    if (!spotifyToken) {
      setErrorMsg(t('headerBar.error.connect_spotify_search'));
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
          setErrorMsg(t('headerBar.error.expired_token'));
        } else {
          const txt = await res.text();
          setErrorMsg(`${t('headerBar.error.generic')}: ${txt}`);
        }
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setSearchResults(data.tracks?.items || []);
    } catch (err) {
      console.error('Error buscando en Spotify:', err);
      setErrorMsg(t('headerBar.error.search_failed'));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((term) => {
      fetchSpotifySearch(term);
    }, 300),
    [spotifyToken, t]
  );

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/chats') {
      return (
        location.pathname === '/chats' ||
        location.pathname.startsWith('/chat/')
      );
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setErrorMsg(null);
    debouncedSearch(value);
  };

  const handleSelectTrack = async (track) => {
    if (onSongSelect) {
      onSongSelect(track.uri);
    }

    try {
      const currentUser = await userService.getCurrentUser();
      const trackId = track.uri.split(':').pop();
      await userService.setCancionUsuario(currentUser.usuario._id, trackId);
    } catch (err) {
      console.error('Error guardando canción:', err);
    }

    setShowSearch(false);
    setSearchValue('');
    setSearchResults([]);
    setErrorMsg(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelectTrack(searchResults[0]);
    }
  };

  return (
    <nav className="relative z-30 bg-harmony-primary/90 px-6 py-4 rounded-b-3xl shadow-lg mb-0 md:mb-4">
      <div className="flex flex-col md:flex-row items-center justify-between relative">
        <div className="flex items-center gap-4">
          <span className="font-bold text-2xl text-harmony-accent cursor-pointer" onClick={() => navigate('/')}>{t('headerBar.logo')}</span>
          <div className="relative" ref={searchContainerRef}>
            {/* search and dropdown (omit for brevity) */}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 mt-4 md:mt-0">
          {/* nav links (omit for brevity) */}
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 relative z-50">
          <NotificationBell />
          <ProfileMenu user={user} logout={logout} onSettingsClick={() => setShowSettings(true)} />
        </div>
      </div>
      {children}
      <UserSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} user={user} />
    </nav>
  );
}

function ProfileMenu({ user, logout, onSettingsClick }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-2xl"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('headerBar.aria.profile_options')}
      >
        <FaUserCircle />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-harmony-primary/95 rounded-xl shadow-xl border border-harmony-accent/20 z-50 animate-fade-in-down">
          <div className="px-4 py-3 border-b border-harmony-accent/10">
            <span className="font-semibold text-harmony-accent text-base block">
              {user?.name || t('headerBar.profile.my_profile')}
            </span>
            <span className="text-xs text-harmony-text-secondary">
              {user?.email}
            </span>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => {
              onSettingsClick();
              setOpen(false);
            }}
          >
            <FaCog className="text-lg" /> {t('headerBar.profile.settings')}
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-harmony-accent/10 text-harmony-text-primary text-sm transition"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <FaSignOutAlt className="text-lg" /> {t('headerBar.profile.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
