import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaPlay,
  FaTrashAlt,
  FaShareAlt,
  FaArrowLeft,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { toast } from 'react-hot-toast';
import { playlistService } from '../services/playlistService';
import { userService } from '../services/userService';

export default function PlaylistDetail() {
  const { t } = useTranslation();
  const { id, userId, playlistId } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const token = localStorage.getItem('sp_token');
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snapshotId, setSnapshotId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);
  const isOwnPlaylist = Boolean(id && !userId && !playlistId);

  // Función para reproducir y guardar la playlist
  const playFullPlaylist = async () => {
    const uris = tracks.map(t => t.uri).filter(Boolean);
    if (uris.length === 0) return;

    try {
      await playTrack(uris);
      const currentUser = await userService.getCurrentUser();
      const trackId = uris[0].split(":").pop();
      await userService.setCancionUsuario(currentUser._id, trackId);
    } catch (err) {
      console.error("Error al reproducir playlist:", err);
      toast.error(t('playlistDetail.error.play_playlist'));
    }
  };

  // Función para reproducir y guardar una canción
  const playSingleTrack = async (uri) => {
    if (!uri) return;
  
    try {
      console.log("Iniciando reproducción de canción:", uri);
      await playTrack(uri, 0, false, true);
      console.log("Canción reproducida.");
  
      const trackId = uri.split(":").pop();
      console.log("trackId extraído:", trackId);

      const currentUser = await userService.getCurrentUser();
      console.log("Usuario actual:", currentUser);
  
      if (!currentUser || !currentUser._id) {
        throw new Error("No se encontró el usuario actual.");
      }
  
      await userService.setCancionUsuario(currentUser._id, trackId);
      console.log("Canción guardada con éxito.");
    } catch (err) {
      console.error("Error al reproducir o guardar la canción:", err);
      toast.error(t('playlistDetail.error.play_song'));
    }
  };

  // Efecto para cargar la playlist
  useEffect(() => {
    async function fetchOwnPlaylist() {
      try {
        setLoading(true);
        const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        setPlaylist(data);
        setNewName(data.name);
        setTracks(data.tracks.items.map(item => item.track));
        setSnapshotId(data.snapshot_id);
      } catch (err) {
        console.error('Fetch playlist error:', err);
        setError(t('playlistDetail.error.load_own'));
      } finally {
        setLoading(false);
      }
    }

    async function fetchPublicPlaylist() {
      try {
        setLoading(true);
        // playlistService.getSpotifyPlaylistById devuelve un objeto con campos: nombre, descripcion, imagen, owner, canciones (array)
        const playlistInfo = await playlistService.getSpotifyPlaylistById(userId, playlistId);
        setPlaylist({
          name: playlistInfo.nombre,
          description: playlistInfo.descripcion,
          images: [{ url: playlistInfo.imagen }],
          owner: { display_name: playlistInfo.owner?.nombre || t('playlistDetail.unknown_owner') }
        });
        // Adaptamos “canciones” públicas al formato básico que usa la UI (title, artist, duration y cover)
        setTracks(
          playlistInfo.canciones.map(track => ({
            id: track._id,
            name: track.title,
            artists: [{ name: track.artist }],
            duration_ms: parseDurationToMs(track.duration),
            album: { images: [{ url: track.cover }] },
            uri: track.uri || null
          }))
        );
      } catch (err) {
        console.error('Carga playlist pública error:', err);
        setError(t('playlistDetail.error.load_public'));
      } finally {
        setLoading(false);
      }
    }

    // Función auxiliar para convertir "3:45" a milisegundos
    function parseDurationToMs(durationStr) {
      const parts = durationStr.split(':').map(p => parseInt(p, 10));
      if (parts.length === 2) {
        return (parts[0] * 60 + parts[1]) * 1000;
      }
      return 0;
    }

    if (isOwnPlaylist) {
      if (!token) {
        setError(t('playlistDetail.error.need_login'));
        setLoading(false);
        return;
      }
      fetchOwnPlaylist();
    } else {
      if (!userId || !playlistId) {
        setError(t('playlistDetail.error.invalid_params'));
        setLoading(false);
        return;
      }
      fetchPublicPlaylist();
    }
  }, [id, userId, playlistId, token, isOwnPlaylist, t]);

  // Función para guardar el nombre de la playlist
  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error(t('playlistDetail.error.name_empty'));
      return;
    }
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const j = JSON.parse(text);
          msg = j.error?.message || text;
        } catch {}
        throw new Error(`(${res.status}) ${msg}`);
      }
      setPlaylist(prev => ({ ...prev, name: newName }));
      setEditMode(false);
      toast.success(t('playlistDetail.success.name_updated'));
    } catch (err) {
      console.error('Rename playlist error:', err);
      toast.error(t('playlistDetail.error.name_update_prefix') + err.message);
    }
  };

  // Función para convertir el archivo de imagen a base64
  const toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const b64 = reader.result.split(',')[1];
        resolve(b64);
      };
      reader.readAsDataURL(file);
    });

  // Función para cambiar la imagen de la playlist
  const handleImageChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg') {
      toast.error(t('playlistDetail.error.image_format'));
      return;
    }

    try {
      const b64 = await toBase64(file);
      if (b64.length > 350000) {
        toast.error(t('playlistDetail.error.image_size'));
        return;
      }
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/images`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/jpeg'
        },
        body: b64
      });
      if (res.status === 202) {
        toast.success(t('playlistDetail.success.image_updated'));
        setPlaylist(prev => {
          const nuevaUrl = prev.images[0].url + `?v=${Date.now()}`;
          return { ...prev, images: [{ url: nuevaUrl }] };
        });
      } else if (res.status === 401) {
        toast.error(t('playlistDetail.error.token_invalid'));
      } else {
        const errJson = await res.json();
        const msg = errJson.error?.message || res.statusText;
        throw new Error(`(${res.status}) ${msg}`);
      }
    } catch (err) {
      console.error('Error al actualizar la portada:', err);
      toast.error(t('playlistDetail.error.image_update_prefix') + err.message);
    }
  };

  // Función para eliminar una canción de la playlist
  const handleRemoveTrack = async (e, trackUri) => {
    e.stopPropagation();
    if (!window.confirm(t('playlistDetail.confirm_remove_track'))) return;

    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{ uri: trackUri }],
          snapshot_id: snapshotId
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || res.statusText);
      }
      const result = await res.json();
      setSnapshotId(result.snapshot_id);
      setTracks(prev => prev.filter(t => t.uri !== trackUri));
      toast.success(t('playlistDetail.success.track_removed'));
    } catch (err) {
      console.error('Remove track error:', err);
      toast.error(t('playlistDetail.error.track_remove_prefix') + err.message);
    }
  };

  // Calculamos duración total en minutos
  const totalDurationMin = Math.floor(
    tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / 60000
  );

  // Renderizado

  if (loading || error || !playlist) {
    return (
      <div className="flex flex-col h-screen bg-harmony-primary overflow-hidden">
        <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
          <div className="h-[calc(100vh-222px)] bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 flex items-center justify-center p-6">
            <div className="text-center text-harmony-text-primary">
              {loading ? (
                <p className="text-lg">{t('playlistDetail.loading')}</p>
              ) : (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition mb-4"
                  >
                    <FaArrowLeft className="text-lg inline-block mr-2" />
                    {t('playlistDetail.back')}
                  </button>
                  <p className="text-xl font-semibold mb-2">
                    {isOwnPlaylist
                      ? t('playlistDetail.own.not_found')
                      : t('playlistDetail.public.not_found')}
                  </p>
                  <p className="text-sm">
                    {error || t('playlistDetail.error.generic')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <FooterPlayer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-harmony-primary overflow-hidden">
      <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="h-[calc(100vh-222px)] overflow-hidden bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 flex flex-col">
          <div className="p-6 flex-1 flex flex-col min-h-0">
            <button
              onClick={() => navigate(-1)}
              className="text-harmony-accent hover:text-harmony-accent/80 mb-6 w-fit flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <FaArrowLeft />
              {t('playlistDetail.back')}
            </button>

            <div className="flex items-center gap-6 mb-6">
              <div
                className={`relative w-48 h-48 rounded-lg overflow-hidden shadow-md 
                  ${isOwnPlaylist ? 'cursor-pointer group' : ''}`}
                onClick={() => {
                  if (isOwnPlaylist) fileInputRef.current.click();
                }}
              >
                <img
                  src={playlist.images[0]?.url}
                  alt={playlist.name}
                  className={`w-full h-full object-cover transition-transform duration-300 
                    ${isOwnPlaylist ? 'group-hover:scale-110' : ''}`}
                />
                {isOwnPlaylist && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <FaEdit className="text-white text-2xl" />
                  </div>
                )}
                {isOwnPlaylist && (
                  <input
                    type="file"
                    accept="image/jpeg"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {isOwnPlaylist && editMode ? (
                    <>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="border-b border-harmony-text-secondary bg-transparent focus:outline-none text-4xl font-bold text-harmony-accent"
                      />
                      <button onClick={handleSaveName} title={t('playlistDetail.save')}>
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setNewName(playlist.name);
                        }}
                        title={t('playlistDetail.cancel')}
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold text-harmony-accent truncate">
                        {playlist.name}
                      </h1>
                      {isOwnPlaylist && (
                        <button
                          onClick={() => setEditMode(true)}
                          className="text-harmony-accent hover:text-harmony-accent/80"
                          title={t('playlistDetail.edit_name')}
                        >
                          <FaEdit />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-2 text-harmony-text-secondary truncate">
                  {playlist.description || t('playlistDetail.no_description')}
                </p>
                <div className="mt-1 text-sm text-harmony-text-secondary">
                  {t('playlistDetail.created_by', { user: playlist.owner.display_name })}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={playFullPlaylist}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title={t('playlistDetail.play_all')}
                  >
                    <FaPlay className="text-xl" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert(t('playlistDetail.link_copied'));
                    }}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title={t('playlistDetail.share_playlist')}
                  >
                    <FaShareAlt className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats: número de canciones y duración total */}
            <div className="flex-none px-6 mb-4">
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>
                  {tracks.length} {t('playlistDetail.songs')}
                </span>
                <span>•</span>
                <span>
                  {totalDurationMin} {t('playlistDetail.minutes')}
                </span>
              </div>
            </div>

            {/* Lista de canciones */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-harmony-secondary/30 scrollbar-thumb-harmony-accent hover:scrollbar-thumb-harmony-accent/80 transition px-4 pb-6 space-y-4">
              {tracks.map((song, idx) => (
                <div
                  key={song.id + idx}
                  onClick={() => playSingleTrack(song.uri)}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition cursor-pointer max-w-full overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                      <img
                        src={song.album.images[0]?.url}
                        alt={song.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-harmony-text-primary truncate">
                        {song.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-harmony-text-secondary truncate">
                        <span className="truncate">
                          {song.artists.map(a => a.name).join(', ')}
                        </span>
                        <span>•</span>
                        <span>
                          {Math.floor((song.duration_ms || 0) / 60000)}:
                          {String(
                            Math.floor(((song.duration_ms || 0) % 60000) / 1000)
                          ).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de eliminar/reproducir individuales (solo si es tuya) */}
                  <div className="flex items-center gap-4">
                    {isOwnPlaylist && (
                      <button
                        onClick={e => handleRemoveTrack(e, song.uri)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-full transition"
                        title={t('playlistDetail.delete_song')}
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playSingleTrack(song.uri);
                      }}
                      className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full transition"
                      title={t('playlistDetail.play_song')}
                    >
                      <FaPlay />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FooterPlayer />
    </div>
  );
}
