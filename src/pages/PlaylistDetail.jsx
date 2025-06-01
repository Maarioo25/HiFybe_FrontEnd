// src/pages/PlaylistDetail.jsx
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
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { toast } from 'react-hot-toast';
import { playlistService } from '../services/playlistService';
import { userService } from '../services/userService';

export default function PlaylistDetail() {
  const { id, userId, playlistId } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const token = localStorage.getItem('sp_token');

  // Estado común a ambos casos
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados sólo si es “tuya” (editable)
  const [snapshotId, setSnapshotId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);

  // ¿Es playlist propia o pública?
  const isOwnPlaylist = Boolean(id && !userId && !playlistId);

  const playAndStoreTrack = async (uri) => {
    try {
      await playTrack(uri);
      const trackId = uri?.split(':').pop();
      if (!trackId) return;
      const currentUser = await userService.getCurrentUser();
      await userService.setCancionUsuario(currentUser.user._id, trackId);
    } catch (err) {
      console.error("Error al reproducir o guardar canción:", err);
    }
  };

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
        setError('No se pudo cargar tu playlist. Quizá no tengas permiso o el token expiró.');
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
          owner: { display_name: playlistInfo.owner?.nombre || 'Desconocido' }
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
        setError('No se encontró la playlist pública o hubo un error al cargarla.');
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
        setError('Necesitas iniciar sesión para ver tu playlist.');
        setLoading(false);
        return;
      }
      fetchOwnPlaylist();
    } else {
      if (!userId || !playlistId) {
        setError('Parámetros inválidos para playlist pública.');
        setLoading(false);
        return;
      }
      fetchPublicPlaylist();
    }
  }, [id, userId, playlistId, token, isOwnPlaylist]);

  // ------------- FUNCIONES DE EDICIÓN (solo si isOwnPlaylist) -------------

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error('El nombre no puede estar vacío');
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
      toast.success('Nombre de la playlist actualizado');
    } catch (err) {
      console.error('Rename playlist error:', err);
      toast.error('No se pudo renombrar: ' + err.message);
    }
  };

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

  const handleImageChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg') {
      toast.error('La imagen debe estar en formato JPEG');
      return;
    }

    try {
      const b64 = await toBase64(file);
      if (b64.length > 350000) {
        toast.error('La imagen debe pesar menos de 256 KB');
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
        toast.success('Portada de la playlist actualizada correctamente');
        setPlaylist(prev => {
          const nuevaUrl = prev.images[0].url + `?v=${Date.now()}`;
          return { ...prev, images: [{ url: nuevaUrl }] };
        });
      } else if (res.status === 401) {
        toast.error('Token expirado o inválido. Vuelve a iniciar sesión.');
      } else {
        const errJson = await res.json();
        const msg = errJson.error?.message || res.statusText;
        throw new Error(`(${res.status}) ${msg}`);
      }
    } catch (err) {
      console.error('Error al actualizar la portada:', err);
      toast.error('No se pudo actualizar la portada: ' + err.message);
    }
  };

  const handleRemoveTrack = async (e, trackUri) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta canción de la playlist?')) return;

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
      toast.success('Canción eliminada');
    } catch (err) {
      console.error('Remove track error:', err);
      toast.error('No se pudo eliminar la canción: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------

  // Calculamos duración total en minutos
  const totalDurationMin = Math.floor(
    tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / 60000
  );

  // ------------------ RENDERIZADO ------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-harmony-primary flex items-center justify-center">
        <div className="text-white text-lg">Cargando playlist...</div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar onSongSelect={playTrack} />
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
          <div className="container mx-auto px-6 pt-8">
            <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 p-6">
              <button
                onClick={() => navigate(-1)}
                className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <p className="mt-4 text-xl font-semibold">
                {isOwnPlaylist ? 'Playlist no encontrada' : 'Playlist pública no encontrada'}
              </p>
              <p className="mt-2 text-sm">
                {error || 'No se pudieron obtener los datos.'}
              </p>
            </div>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-harmony-primary overflow-hidden">
      <HeaderBar onSongSelect={playTrack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="h-[calc(100vh-222px)] overflow-hidden bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 flex flex-col">
          <div className="p-6 flex-1 flex flex-col min-h-0">
            {/* Imagen y detalles comunes */}
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
                {/* Título editable vs. solo lectura */}
                <div className="flex items-center gap-2">
                  {isOwnPlaylist && editMode ? (
                    <>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="border-b border-harmony-text-secondary bg-transparent focus:outline-none text-4xl font-bold text-harmony-accent"
                      />
                      <button onClick={handleSaveName} title="Guardar">
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setNewName(playlist.name);
                        }}
                        title="Cancelar"
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
                          title="Editar nombre"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-2 text-harmony-text-secondary truncate">
                  {playlist.description || 'Sin descripción'}
                </p>
                <div className="mt-1 text-sm text-harmony-text-secondary">
                  Creada{' '}
                  {isOwnPlaylist
                    ? `por ${playlist.owner.display_name}`
                    : `por ${playlist.owner.display_name || 'Desconocido'}`}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => playAndStoreTrack(tracks[0]?.uri)}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title="Reproducir todo"
                  >
                    <FaPlay className="text-xl" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Enlace copiado');
                    }}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title="Compartir playlist"
                  >
                    <FaShareAlt className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats: número de canciones y duración total */}
            <div className="flex-none px-6 mb-4">
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>{tracks.length} canciones</span>
                <span>•</span>
                <span>{totalDurationMin} min</span>
              </div>
            </div>

            {/* Lista de canciones */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-harmony-secondary/30 scrollbar-thumb-harmony-accent hover:scrollbar-thumb-harmony-accent/80 transition px-6 pb-6 space-y-4">
              {tracks.map((song, idx) => (
                <div
                  key={song.id + idx}
                  onClick={() => playAndStoreTrack(song.uri)}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={song.album.images[0]?.url}
                        alt={song.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-harmony-text-primary truncate">
                        {song.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-harmony-text-secondary">
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
                        title="Eliminar canción"
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playAndStoreTrack(song.uri);
                      }}                      
                      className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full transition"
                      title="Reproducir canción"
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
