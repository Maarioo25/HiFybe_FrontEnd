// context/PlayerContext.js
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
  const [volume, setVolume] = useState(100);

  // Obtener token de URL o localStorage
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

  // Cargar SDK y crear player
  useEffect(() => {
    if (!token) return;
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
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
        // transferir playback
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

      // error listeners (opcional)
      spotifyPlayer.addListener('initialization_error', ({ message }) => console.error(message));
      spotifyPlayer.addListener('authentication_error', ({ message }) => console.error(message));
      spotifyPlayer.addListener('account_error', ({ message }) => console.error(message));
      spotifyPlayer.addListener('playback_error', ({ message }) => console.error(message));
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [token]);

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

  const changeVolume = (volPercent) => {
    setVolume(volPercent);
    if (player) player.setVolume(volPercent / 100);
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      position,
      duration,
      volume,
      player,
      setIsPlaying,
      playTrack,
      changeVolume
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
