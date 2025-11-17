import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PlayerContext = createContext();

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

  // useEffect para cargar el token
  useEffect(() => {
    // Prioridad 1: spotifyToken del AuthContext
    if (spotifyToken) {
      console.log("✅ Usando token de AuthContext:", spotifyToken.substring(0, 20) + "...");
      setToken(spotifyToken);
      return;
    }

    // Prioridad 2: URL params
    const params = new URLSearchParams(window.location.search);
    const spToken = params.get('spotify_token');
    if (spToken) {
      console.log("✅ Usando token de URL");
      localStorage.setItem('sp_token', spToken);
      setToken(spToken);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Prioridad 3: localStorage
    const saved = localStorage.getItem('sp_token');
    if (saved) {
      console.log("✅ Usando token de localStorage");
      setToken(saved);
    } else {
      console.warn("⚠️ No se encontró token de Spotify");
    }
  }, [spotifyToken]);

  // useEffect para verificar si el usuario es Premium
  useEffect(() => {
    if (!token) return;

    const checkPremiumStatus = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          console.error('❌ Error al verificar Premium:', res.status);
          setIsPremium(false);
          return;
        }

        const data = await res.json();
        const premium = data.product === 'premium';
        console.log(`✅ Usuario es ${premium ? 'Premium' : 'Free'}`);
        setIsPremium(premium);
      } catch (err) {
        console.error('❌ Error al verificar Premium:', err);
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [token]);

  // useEffect para cargar el SDK solo si es Premium
  useEffect(() => {
    if (!token || isPremium !== true) {
      if (isPremium === false) {
        console.log("ℹ️ Usuario Free - SDK de Spotify no disponible");
      }
      return;
    }

    console.log("🎵 Cargando Spotify Web Playback SDK...");

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("✅ Spotify SDK listo");
      
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Harmony Spotify Player',
        getOAuthToken: cb => {
          console.log("🔑 Enviando token al SDK");
          cb(token);
        },
        volume: volume / 100
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log("✅ Dispositivo listo con ID:", device_id);
        setDeviceId(device_id);
        
        // Transferir reproducción a este dispositivo
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        }).then(() => {
          console.log("✅ Dispositivo configurado correctamente");
        }).catch(err => {
          console.error("❌ Error configurando dispositivo:", err);
        });
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.warn("⚠️ Dispositivo no está listo:", device_id);
      });

      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach(evt =>
        spotifyPlayer.addListener(evt, ({ message }) => console.error(`❌ Spotify Player ${evt}:`, message))
      );

      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log("✅ Player conectado exitosamente");
          setPlayer(spotifyPlayer);
        } else {
          console.error("❌ Error al conectar player");
        }
      });
    };

    return () => {
      if (player) {
        console.log("🔌 Desconectando player");
        player.disconnect();
      }
    };
  }, [token, isPremium]);

  // useEffect para actualizar posición (Premium)
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

  // useEffect para polling en usuarios Free
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
        console.error('❌ Error obteniendo track actual (free):', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, isPremium]);

  // Función para reproducir una canción
  // Función para reproducir (versión con soporte Free)
const playTrack = async (
  spotifyUriOrUris,
  startIndex = 0,
  resetQueue = true,
  updateHistory = true
) => {
  console.log("🎵 playTrack llamado con:", { spotifyUriOrUris, isPremium });

  if (!token) {
    console.error("❌ No hay token disponible");
    return;
  }

  const uris = Array.isArray(spotifyUriOrUris)
    ? spotifyUriOrUris
    : [spotifyUriOrUris];

  // Si NO es Premium, abrir en Spotify
  if (isPremium === false) {
    console.log("ℹ️ Usuario Free - Abriendo en Spotify");
    const uri = uris[0];
    window.open(`https://open.spotify.com/track/${uri.split(':')[2]}`, '_blank');
    return;
  }

  // Si es Premium pero no hay deviceId, esperar
  if (isPremium && !deviceId) {
    console.error("❌ deviceId no está disponible aún. Esperando...");
    return;
  }

  if (resetQueue) {
    setQueue(uris);
    setQueueIndex(startIndex);
  }

  try {
    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;

    const body = {
      uris,
      offset: { position: startIndex }
    };

    console.log("📤 Enviando petición a Spotify:", url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de Spotify:", response.status, errorText);
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }

    console.log("✅ Canción reproducida correctamente");
  } catch (err) {
    console.error('❌ Error en playTrack:', err);
    // Si hay error 403, mostrar mensaje al usuario
    if (err.message.includes('403')) {
      alert('Para reproducir música en el navegador, necesitas Spotify Premium. Abriendo en Spotify...');
      const uri = uris[0];
      window.open(`https://open.spotify.com/track/${uri.split(':')[2]}`, '_blank');
    }
  }

  if (updateHistory && !Array.isArray(spotifyUriOrUris)) {
    addToHistory(spotifyUriOrUris);
  }
};


  const pause = () => player && player.pause();
  const resume = () => player && player.resume();

  const addToHistory = (uri) => {
    setPlayHistory((prev) => {
      const newHistory = [...prev];
      if (historyIndex < newHistory.length - 1) {
        newHistory.splice(historyIndex + 1);
      }
      newHistory.push(uri);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

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

  const nextTrack = async () => {
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      await playTrack(queue, nextIndex);
    } else {
      const randomUri = await getRandomTrackUri();
      if (randomUri) await playTrack(randomUri);
    }
  };

  const previousTrack = async () => {
    try {
      if (!player) return;
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
      }
    } catch (err) {
      console.error("Error en previousTrack:", err);
    }
  };

  const seekTo = (ms) => player && player.seek(ms);

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
      deviceId, // ⬅️ Exponemos deviceId para debug
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
