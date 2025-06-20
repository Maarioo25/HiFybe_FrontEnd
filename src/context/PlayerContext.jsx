import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PlayerContext = createContext();

// PlayerProvider component 
export const PlayerProvider = ({ children }) => {
  const { spotifyToken } = useAuth();
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(10);
  const [isPremium, setIsPremium] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playHistory, setPlayHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // useEffect para cargar el token al montar el componente
  useEffect(() => {
    if (!spotifyToken) return;
  
    console.log("PlayerProvider usando token:", spotifyToken);
    setToken(spotifyToken);
  }, [spotifyToken]);

  // useEffect para cargar el token de la URL o localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spToken = params.get('spotify_token');
    if (spToken) {
      localStorage.setItem('sp_token', spToken);
      setToken(spToken);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    const saved = localStorage.getItem('sp_token');
    console.log("Saved:", saved)
    if (saved) setToken(saved);
  }, []);

  // useEffect para verificar si el usuario es Premium
  useEffect(() => {
    if (!token) return;

    const checkPremiumStatus = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIsPremium(data.product === 'premium');
      } catch (err) {
        console.error('[Spotify] Error al verificar Premium:', err);
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [token]);

  // useEffect para cargar el SDK solo si es Premium
  useEffect(() => {
    if (!token || isPremium !== true) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Harmony Spotify Player',
        getOAuthToken: cb => cb(token),
        volume: volume / 100
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        });
      });

      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach(evt =>
        spotifyPlayer.addListener(evt, ({ message }) => console.error(`Spotify Player ${evt}:`, message))
      );
    };

    console.log("token:", token)
    console.log("isPremium:", isPremium)
    return () => {
      console.log("player:", player)
      if (player) {
        player.disconnect();
      }
    };
  }, [token, isPremium]);

  // useEffect para pulling para posición (Premium)
  useEffect(() => {
    if (!player || !isPlaying) return;
    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state) {
        setPosition(state.position);
        setDuration(state.duration);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // useEffect para pulling alternativo para usuarios Free
  useEffect(() => {
    if (!token || isPremium === null || isPremium) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 204) {
          setCurrentTrack(null);
          setIsPlaying(false);
          return;
        }

        const data = await res.json();
        if (data && data.item) {
          setCurrentTrack(data.item);
          setIsPlaying(data.is_playing ?? false);
          setPosition(data.progress_ms || 0);
          setDuration(data.item.duration_ms || 0);
        }
      } catch (err) {
        console.error('[Spotify] Error obteniendo track actual (free):', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, isPremium]);
  
  // Función para reproducir una canción
  const playTrack = async (
    spotifyUriOrUris,
    startIndex = 0,
    resetQueue = true,
    updateHistory = true
  ) => {
    if (!deviceId) return;
  
    const uris = Array.isArray(spotifyUriOrUris)
      ? spotifyUriOrUris
      : [spotifyUriOrUris];
  
    if (resetQueue) {
      setQueue(uris);
      setQueueIndex(startIndex);
    }
  
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris,
          offset: { position: startIndex }
        })
      });
    } catch (err) {
      console.warn('[Spotify] Error en playTrack:', err.message || err);
    }
    
  
    if (updateHistory && !Array.isArray(spotifyUriOrUris)) {
      addToHistory(spotifyUriOrUris);
    }
  };
  
  // Función para pausar la canción
  const pause = () => player && player.pause();
  
  // Función para reanudar la canción
  const resume = () => player && player.resume();
  
  // Función para agregar una canción al historial
  const addToHistory = (uri) => {
    setPlayHistory((prev) => {
      const newHistory = [...prev];
      if (historyIndex < newHistory.length - 1) {
        newHistory.splice(historyIndex + 1);
      }
      newHistory.push(uri);
      console.log("Historial actualizado:", newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };
  
  // Función para obtener una canción aleatoria
  const getRandomTrackUri = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const uris = data.items?.map(t => t.uri).filter(Boolean);
      if (!uris?.length) return null;
  
      const randomIndex = Math.floor(Math.random() * uris.length);
      return uris[randomIndex];
    } catch (err) {
      console.error("Error al obtener canción aleatoria:", err);
      return null;
    }
  };
  
  // Función para reproducir la siguiente canción
  const nextTrack = async () => {
    const nextIndex = queueIndex + 1;
  
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      await playTrack(queue, nextIndex);
    } else {
      const randomUri = await getRandomTrackUri();
      if (randomUri) {
        await playTrack(randomUri); 
      }
    }
  };
  
  // Función para reproducir la canción anterior
  const previousTrack = async () => {
    try {
      const state = await player.getCurrentState();
      if (!state) return;
  
      const currentPosition = state.position;
  
      if (currentPosition > 2000) {
        await seekTo(0);
        return;
      }
  
      const newIndex = historyIndex === -1 ? playHistory.length - 2 : historyIndex - 1;
  
      if (newIndex >= 0 && playHistory[newIndex]) {
        setHistoryIndex(newIndex);
        await playTrack(playHistory[newIndex], 0, false, false);
      } else {
        console.log("No hay más canciones anteriores en el historial.");
      }
    } catch (err) {
      console.error("Error en previousTrack:", err);
    }
  };
  
  // Función para saltar a una posición específica
  const seekTo = (ms) => player && player.seek(ms);
  
  // Función para cambiar el volumen
  const changeVolume = (vol) => {
    setVolume(vol);
    if (player) player.setVolume(vol / 100);
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      position,
      duration,
      volume,
      isPremium,
      playTrack,
      pause,
      resume,
      nextTrack,
      previousTrack,
      seek: seekTo,
      changeVolume,
      setIsPlaying,
      queue,
      queueIndex,
      setQueue,
    }}>

      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
