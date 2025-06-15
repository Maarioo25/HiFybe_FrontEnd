import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import { usePlayer } from '../context/PlayerContext';

const FooterPlayer = () => {
  const { t } = useTranslation();
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    nextTrack,
    previousTrack,
    position,
    duration,
    seek,
    volume,
    changeVolume,
    setIsPlaying,
    isPremium,
  } = usePlayer();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [addingTrack, setAddingTrack] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Manejo de la conexión a Spotify
  const spotifyToken = localStorage.getItem('sp_token');
  const handleConnectSpotify = () => {
    window.location.href = 'https://api.mariobueno.info/usuarios/spotify/connect';
  };

  // Manejo de la lista de reproducción
  useEffect(() => {
    if (!showPlaylistModal) return;
    const fetchPlaylists = async () => {
      setLoadingPlaylists(true);
      setErrorMsg('');
      try {
        const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setPlaylists(data.items || []);
      } catch (err) {
        console.error(err);
        setErrorMsg(t('footerPlayer.error.load_playlists'));
      } finally {
        setLoadingPlaylists(false);
      }
    };
    fetchPlaylists();
  }, [showPlaylistModal, spotifyToken, t]);

  // Manejo del mensaje de toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Manejo de la lista de reproducción
  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId || !currentTrack) return;
    setAddingTrack(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [currentTrack.uri] }),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      setToastMessage(t('footerPlayer.success.added'));
      setShowPlaylistModal(false);
      setSelectedPlaylistId(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(t('footerPlayer.error.add_to_playlist'));
    } finally {
      setAddingTrack(false);
    }
  };

  // Manejo del play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      resume();
      setIsPlaying(true);
    }
  };

  // Manejo del seek
  const handleSeek = (e) => {
    const pct = Number(e.target.value);
    const ms = (pct / 100) * duration;
    seek(ms);
  };

  // Manejo del volumen
  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    changeVolume(vol);
  };

  // Manejo del guardado de la canción
  useEffect(() => {
    const guardarCancion = async () => {
      if (!currentTrack?.uri) return;
      try {
        const currentUser = await userService.getCurrentUser();
        const trackId = currentTrack.uri.split(':').pop();
        console.log("Canción a guardar:", trackId);
        console.log("Usuario actual:", currentUser);
        await userService.setCancionUsuario(currentUser._id, trackId);
        console.log("Canción de usuario guardada exitosamente");
      } catch (err) {
        console.error('Error guardando canción en FooterPlayer:', err);
      }
    };
    guardarCancion();
  }, [currentTrack]);

  // Manejo de la conexión a Spotify
  if (!spotifyToken) {
    return (
      <div className="now-playing-bar sticky bottom-0 z-50 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
        <span className="text-harmony-text-primary mb-2">
          {t('footerPlayer.connect_prompt')}
        </span>

        <button
          onClick={handleConnectSpotify}
          className="px-4 py-2 bg-harmony-accent text-white rounded-lg shadow hover:bg-harmony-accent/80 transition"
        >
          {t('footerPlayer.connect')}
        </button>
      </div>
    );
  }

  // Manejo de la selección de la canción
  if (!currentTrack?.album?.images?.[0]?.url) {
    return (
      <div className="now-playing-bar sticky bottom-0 z-50 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl flex items-center justify-center p-4">
        <span className="text-harmony-text-primary">
          {t('footerPlayer.select_song')}
        </span>
      </div>
    );
  }

  // Renderiza el footer  
  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
      <div className="now-playing-bar sticky bottom-0 z-50 w-full shadow-2xl">
        <div className="absolute inset-0 bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 z-0" />
        <div className="relative mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-2 md:gap-4 px-4 py-3">
          <div
            className="absolute left-0 top-0 pointer-events-none overflow-hidden z-0 hidden md:block"
            style={{ width: '40%', height: '100%' }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${currentTrack?.album?.images?.[0]?.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left',
                filter: 'blur(12px) brightness(0.7)',
                maskImage:
                  'linear-gradient(to right, rgba(0,0,0,1) 0%,rgba(0,0,0,0.7) 50%,rgba(0,0,0,0) 100%)',
              }}
            />
          </div>
          <div className="flex items-center z-10 gap-2 md:gap-4 min-w-[150px] md:min-w-[200px] max-w-[full] md:max-w-[320px] w-full md:w-[320px] overflow-hidden">
            <img
              src={currentTrack?.album?.images?.[0]?.url}
              alt={currentTrack?.name}
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border-2 border-harmony-accent shadow-lg"
            />
            <div className="truncate text-harmony-text-primary">
              <div
                className="font-semibold truncate max-w-[150px] md:max-w-[210px] text-sm md:text-base"
                title={currentTrack?.name}
              >
                {currentTrack?.name}
              </div>
              <div
                className="text-xs text-harmony-text-secondary truncate max-w-[150px] md:max-w-[210px]"
                title={currentTrack?.artists?.map((a) => a.name).join(', ')}
              >
                {currentTrack?.artists?.map((a) => a.name).join(', ')}
              </div>
              {!isPremium && (
                <div className="text-xs text-yellow-500 mt-1">
                  {t('footerPlayer.free_account')}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-w-0 z-10 w-full">
            <div className="w-full flex items-center gap-2 md:gap-3 mb-2">
              <span className="text-xs text-harmony-text-secondary w-8 md:w-10 text-right select-none">
                {formatTime(position)}
              </span>
              <input
                type="range"
                className="flex-1 h-1 accent-harmony-accent bg-harmony-secondary/20 rounded-full"
                min={0}
                max={100}
                value={duration ? (position / duration) * 100 : 0}
                onChange={handleSeek}
                disabled={!isPremium}
              />
              <span className="text-xs text-harmony-text-secondary w-8 md:w-10 text-left select-none">
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <button
                onClick={() => seek(0)}
                aria-label={t('footerPlayer.aria.replay')}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg"
              >
                <FaRedo className="text-lg" />
              </button>
              <button
                onClick={previousTrack}
                disabled={!isPremium}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${
                  isPremium
                    ? 'bg-harmony-secondary/50 hover:bg-harmony-secondary/60'
                    : 'bg-gray-300 cursor-not-allowed'
                } flex items-center justify-center transition shadow-lg`}
                aria-label={t('footerPlayer.aria.previous')}
              >
                <FaStepBackward className="text-lg" />
              </button>
              <button
                onClick={handlePlayPause}
                disabled={!isPremium}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${
                  isPremium
                    ? 'bg-harmony-accent hover:bg-harmony-accent/80'
                    : 'bg-gray-400 cursor-not-allowed'
                } flex items-center justify-center transition shadow-xl`}
                aria-label={t('footerPlayer.aria.play_pause')}
              >
                {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
              </button>
              <button
                onClick={nextTrack}
                disabled={!isPremium}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${
                  isPremium
                    ? 'bg-harmony-secondary/50 hover:bg-harmony-secondary/60'
                    : 'bg-gray-300 cursor-not-allowed'
                } flex items-center justify-center transition shadow-lg`}
                aria-label={t('footerPlayer.aria.next')}
              >
                <FaStepForward className="text-lg" />
              </button>
              <button
                onClick={() => setShowPlaylistModal(true)}
                disabled={!isPremium}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${
                  isPremium
                    ? 'bg-harmony-secondary/50 hover:bg-harmony-secondary/60'
                    : 'bg-gray-300 cursor-not-allowed'
                } flex items-center justify-center transition shadow-lg`}
                aria-label={t('footerPlayer.aria.add_to_playlist')}
              >
                <FaPlus className="text-lg" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 min-w-[100px] md:min-w-[120px] justify-end z-10 w-full md:w-auto mt-2 md:mt-0">
            {volume > 0 ? (
              <FaVolumeUp className="text-xs md:text-sm text-harmony-text-secondary" />
            ) : (
              <FaVolumeMute className="text-xs md:text-sm text-harmony-text-secondary" />
            )}
            <input
              type="range"
              disabled={!isPremium}
              className={`w-16 md:w-24 h-2 rounded-full ${
                isPremium ? 'accent-harmony-accent' : 'bg-gray-300 cursor-not-allowed'
              }`}
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
            />
            <span className="text-xs md:text-sm text-harmony-text-secondary w-6 md:w-8 text-center select-none">
              {volume}
            </span>
          </div>
        </div>
      </div>
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-harmony-primary rounded-xl w-11/12 max-w-md p-6 shadow-xl relative">
            <button
              onClick={() => {
                setShowPlaylistModal(false);
                setSelectedPlaylistId(null);
                setPlaylists([]);
                setErrorMsg('');
              }}
              className="absolute top-4 right-4 text-harmony-text-secondary hover:text-harmony-text-primary"
              aria-label={t('footerPlayer.aria.close_modal')}
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-semibold text-harmony-accent mb-4">
              {t('footerPlayer.modal.title')}
            </h2>
            {loadingPlaylists && (
              <div className="px-4 py-2 text-center text-harmony-text-secondary">
                {t('footerPlayer.modal.loading')}
              </div>
            )}
            {!loadingPlaylists && errorMsg && (
              <div className="px-4 py-2 text-sm text-red-500">{errorMsg}</div>
            )}
            {!loadingPlaylists && playlists.length === 0 && !errorMsg && (
              <div className="px-4 py-2 text-center text-harmony-text-secondary">
                {t('footerPlayer.modal.no_playlists')}
              </div>
            )}
            {!loadingPlaylists && playlists.length > 0 && (
              <div className="max-h-60 overflow-y-auto mb-4">
                <ul>
                  {playlists.map((pl) => (
                    <li
                      key={pl.id}
                      className="flex items-center gap-2 py-1 hover:bg-harmony-accent/10 rounded px-2 cursor-pointer"
                    >
                      <img
                        src={pl.images[0]?.url || '/avatars/default.jpg'}
                        alt={pl.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                      <label className="flex-1 text-harmony-text-primary truncate">
                        <input
                          type="radio"
                          name="playlist"
                          value={pl.id}
                          checked={selectedPlaylistId === pl.id}
                          onChange={() => setSelectedPlaylistId(pl.id)}
                          className="mr-2"
                        />
                        {pl.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setSelectedPlaylistId(null);
                  setPlaylists([]);
                  setErrorMsg('');
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                {t('footerPlayer.modal.cancel')}
              </button>
              <button
                onClick={handleAddToPlaylist}
                disabled={!selectedPlaylistId || addingTrack}
                className={`px-4 py-2 rounded-lg text-white shadow ${
                  selectedPlaylistId
                    ? 'bg-harmony-accent hover:bg-harmony-accent/80'
                    : 'bg-gray-300 cursor-not-allowed'
                } transition`}
              >
                {addingTrack
                  ? t('footerPlayer.modal.adding')
                  : t('footerPlayer.modal.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterPlayer;
