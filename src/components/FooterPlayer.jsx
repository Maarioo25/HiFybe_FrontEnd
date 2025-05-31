import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaShareAlt,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';

const FooterPlayer = () => {
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

  // Estados para gestionar el modal y playlists
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [addingTrack, setAddingTrack] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Formatea tiempo en mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const spotifyToken = localStorage.getItem('sp_token');
  const handleConnectSpotify = () => {
    window.location.href = 'https://api.mariobueno.info/usuarios/spotify/connect';
  };

  // Cuando se abre el modal, cargamos las playlists del usuario
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
        if (!res.ok) {
          throw new Error(`Error al obtener playlists: ${res.statusText}`);
        }
        const data = await res.json();
        setPlaylists(data.items || []);
      } catch (err) {
        console.error(err);
        setErrorMsg('No se pudieron cargar las playlists.');
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchPlaylists();
  }, [showPlaylistModal, spotifyToken]);

  // Maneja la adición de la canción actual a la playlist seleccionada
  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId || !currentTrack) return;
    setAddingTrack(true);
    setErrorMsg('');
    try {
      const playlistId = selectedPlaylistId;
      const uri = currentTrack.uri; // Ej. "spotify:track:..."
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      );
      if (!res.ok) {
        throw new Error(`Error al añadir a playlist: ${res.statusText}`);
      }
      // Cerrar modal tras éxito
      setShowPlaylistModal(false);
      setSelectedPlaylistId(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo añadir a la playlist.');
    } finally {
      setAddingTrack(false);
    }
  };

  if (!spotifyToken) {
    return (
      <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
        <span className="text-harmony-text-primary mb-2">
          Debes conectar tu cuenta de Spotify para usar el reproductor
        </span>
        <button
          onClick={handleConnectSpotify}
          className="px-4 py-2 bg-harmony-accent text-white rounded-lg shadow hover:bg-harmony-accent/80 transition"
        >
          Conectar con Spotify
        </button>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl flex items-center justify-center p-4">
        <span className="text-harmony-text-primary">Selecciona una canción para reproducir</span>
      </div>
    );
  }

  // Handlers básicos
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      resume();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const pct = Number(e.target.value);
    const ms = (pct / 100) * duration;
    seek(ms);
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    changeVolume(vol);
  };

  return (
    <>
      {/* Barra de reproducción */}
      <div className="now-playing-bar fixed left-0 bottom-0 w-full shadow-2xl">
        <div className="absolute inset-0 bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 z-0" />
        <div className="relative mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-2 md:gap-4 px-4 py-3">
          {/* Fondo degradado borroso */}
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
                backgroundImage: `url(${currentTrack.album.images[0].url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left',
                filter: 'blur(12px) brightness(0.7)',
                maskImage:
                  'linear-gradient(to right, rgba(0,0,0,1) 0%,rgba(0,0,0,0.7) 50%,rgba(0,0,0,0) 100%)',
              }}
            />
          </div>

          {/* Portada y meta */}
          <div className="flex items-center z-10 gap-2 md:gap-4 min-w-[150px] md:min-w-[200px] max-w-[full] md:max-w-[320px] w-full md:w-[320px] overflow-hidden">
            <img
              src={currentTrack.album.images[0].url}
              alt="Album cover"
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border-2 border-harmony-accent shadow-lg"
            />
            <div className="truncate text-harmony-text-primary">
              <div
                className="font-semibold truncate max-w-[150px] md:max-w-[210px] text-sm md:text-base"
                title={currentTrack.name}
              >
                {currentTrack.name}
              </div>
              <div
                className="text-xs text-harmony-text-secondary truncate max-w-[150px] md:max-w-[210px]"
                title={currentTrack.artists.map((a) => a.name).join(', ')}
              >
                {currentTrack.artists.map((a) => a.name).join(', ')}
              </div>
              {!isPremium && (
                <div className="text-xs text-yellow-500 mt-1">
                  Estás usando una cuenta gratuita. Solo puedes ver lo que se está reproduciendo.
                </div>
              )}
            </div>
          </div>

          {/* Barra y controles */}
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
                aria-label="replay"
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
                aria-label="play/pause"
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
              >
                <FaStepForward className="text-lg" />
              </button>
              <button
                aria-label="share"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg"
              >
                <FaShareAlt className="text-lg" />
              </button>

              {/* Botón para añadir la canción a playlist */}
              <button
                onClick={() => setShowPlaylistModal(true)}
                disabled={!isPremium}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${
                  isPremium
                    ? 'bg-harmony-secondary/50 hover:bg-harmony-secondary/60'
                    : 'bg-gray-300 cursor-not-allowed'
                } flex items-center justify-center transition shadow-lg`}
                aria-label="Añadir a playlist"
              >
                <FaPlus className="text-lg" />
              </button>
            </div>
          </div>

          {/* Volumen */}
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

      {/* Modal para seleccionar playlist */}
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
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold text-harmony-accent mb-4">
              Añadir a playlist
            </h2>

            {isLoading && (
              <div className="text-center text-harmony-text-secondary">
                Cargando playlists...
              </div>
            )}

            {errorMsg && (
              <div className="text-center text-red-500 mb-2">{errorMsg}</div>
            )}

            {!loadingPlaylists && playlists.length === 0 && (
              <div className="text-center text-harmony-text-secondary mb-4">
                No se encontraron playlists.
              </div>
            )}

            {!loadingPlaylists && playlists.length > 0 && (
              <div className="max-h-60 overflow-y-auto mb-4">
                <ul>
                  {playlists.map((pl) => (
                    <li key={pl.id}>
                      <label className="flex items-center gap-2 py-1 hover:bg-harmony-accent/10 rounded px-2 cursor-pointer">
                        <input
                          type="radio"
                          name="playlist"
                          value={pl.id}
                          checked={selectedPlaylistId === pl.id}
                          onChange={() => setSelectedPlaylistId(pl.id)}
                        />
                        <span className="text-harmony-text-primary truncate">
                          {pl.name}
                        </span>
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
                Cancelar
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
                {addingTrack ? 'Añadiendo...' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterPlayer;
