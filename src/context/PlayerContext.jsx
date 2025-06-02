import React, { createContext, useContext, useEffect, useState } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
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


  // 1) Obtener token de URL o localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('spotify_token');
    if (t) {
      localStorage.setItem('sp_token', t);
      setToken(t);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    const saved = localStorage.getItem('sp_token');
    if (saved) setToken(saved);
  }, []);

  // 2) Verificar si el usuario es Premium
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

  // 3) Cargar SDK solo si es Premium
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

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token, isPremium]);

  // 4) Polling para posición (Premium)
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

  // 5) Polling alternativo para usuarios Free
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

  // Funciones de control (solo válidas si hay player activo)
  const playTrack = async (spotifyUriOrUris, startIndex = 0) => {
    if (!deviceId) return;
  
    const uris = Array.isArray(spotifyUriOrUris)
      ? spotifyUriOrUris
      : [spotifyUriOrUris];
  
    // Actualizamos cola
    setQueue(uris);
    setQueueIndex(startIndex);
  
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
  };
  

  const pause = () => player && player.pause();
  const resume = () => player && player.resume();



  const updateCurrentTrack = async () => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.item) {
        setCurrentTrack(data.item);
        setIsPlaying(data.is_playing ?? false);
        setPosition(data.progress_ms || 0);
        setDuration(data.item.duration_ms || 0);
      }
    } catch (err) {
      console.error("Error actualizando track:", err);
    }
  };
  
  const nextTrack = async () => {
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      await playTrack(queue, nextIndex);
    }
  };
  
  const previousTrack = async () => {
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      await playTrack(queue, prevIndex);
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
