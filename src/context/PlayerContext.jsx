// context/PlayerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  console.log('Spotify Web Playback listo en device:', deviceId);



  // Cargar token de Spotify desde localStorage (obtenido en proceso de OAuth)
  useEffect(() => {
    // 1) Mira en query string
    const params = new URLSearchParams(window.location.search);
    const t = params.get('spotify_token');
    const r = params.get('spotify_refresh');
    if (t) {
      localStorage.setItem('sp_token', t);
      if (r) localStorage.setItem('sp_refresh', r);
      setToken(t);
      // limpia la URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    // 2) Si no, carga el que hubiera
    const saved = localStorage.getItem('sp_token');
    if (saved) setToken(saved);
  }, []);

  // Cargar SDK de Spotify y crear player
  useEffect(() => {
    if (!token) return;
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Harmony Spotify Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5
      });

      // Conectar el player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);

      // Listeners de estado
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Web Playback listo en device:', device_id);
        setDeviceId(device_id);
        // Transferir playback al dispositivo Web Playback SDK:
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        })
        .then(() => console.log('Playback transferido al Web Playback SDK'))
        .catch(err => console.error('Error transfiriendo playback:', err));
      });

      
  spotifyPlayer.addListener('authentication_error', ({ message }) => console.error('Auth error:', message));
  spotifyPlayer.addListener('account_error', ({ message }) => console.error('Account error:', message));
      
      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [token]);

  // Función para reproducir una URI de Spotify
  const playTrack = async (spotifyUri) => {
    if (!deviceId || !token) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [spotifyUri] })
    });
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      position,
      duration,
      setIsPlaying,
      playTrack
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