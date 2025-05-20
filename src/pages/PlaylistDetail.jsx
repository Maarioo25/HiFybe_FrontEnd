import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaTrashAlt, FaShareAlt, FaArrowLeft, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const token = localStorage.getItem('sp_token');
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snapshotId, setSnapshotId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPlaylist(data);
        setNewName(data.name);
        setTracks(data.tracks.items.map(item => item.track));
        setSnapshotId(data.snapshot_id);
      } catch (err) {
        console.error('Fetch playlist error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [id, token]);

  // Guardar cambio de nombre
  const handleSaveName = async () => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      setPlaylist(prev => ({ ...prev, name: newName }));
      setEditMode(false);
      alert('Nombre de la playlist actualizado');
    } catch (err) {
      console.error('Rename playlist error:', err);
      alert('No se pudo renombrar: ' + err.message);
    }
  };

  // Estadísticas
  const totalDurationMin = Math.floor(
    tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / 60000
  );

  // Subir nueva imagen
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const arrayBuffer = await file.arrayBuffer();
  
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/images`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
        },
        body: arrayBuffer
      });
  
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
  
      alert('Portada de la playlist actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar la portada:', err);
      alert('No se pudo actualizar la portada: ' + err.message);
    }
  };
  

  // Borrar pista
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
    } catch (err) {
      console.error('Remove track error:', err);
      alert('No se pudo eliminar la canción: ' + err.message);
    }
  };

  if (!playlist && !loading) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar />
        <div className="container mx-auto px-6 pt-8">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 p-6 text-center text-harmony-text-secondary">
            <button
              onClick={() => navigate(-1)}
              className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <p className="mt-4 text-xl font-semibold">Playlist no encontrada</p>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-harmony-primary overflow-hidden">
      <HeaderBar />
      <div className="flex-1 overflow-hidden container mx-auto px-6 pt-8">
        <div className="h-full bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 flex flex-col">
          <div className="p-6 flex-1 flex flex-col">
            {/* Imagen y detalles */}
            <div className="flex items-center gap-6 mb-6">
              <div
                className="relative w-48 h-48 rounded-lg overflow-hidden shadow-md cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                <img
                  src={playlist?.images[0]?.url}
                  alt={playlist?.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <FaEdit className="text-white text-2xl" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {editMode ? (
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
                      <button onClick={() => { setEditMode(false); setNewName(playlist.name); }} title="Cancelar">
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold text-harmony-accent">{playlist?.name}</h1>
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-harmony-accent hover:text-harmony-accent/80"
                        title="Editar nombre"
                      >
                        <FaEdit />
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-2 text-harmony-text-secondary truncate">
                  {playlist?.description || 'Sin descripción'}
                </p>
                <div className="mt-1 text-sm text-harmony-text-secondary">
                  Creada por {playlist?.owner.display_name}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => playTrack(tracks[0]?.uri)}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title="Reproducir todo"
                  >
                    <FaPlay className="text-xl" />
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Enlace copiado'); }}
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    title="Compartir playlist"
                  >
                    <FaShareAlt className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 mb-4">
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>{tracks.length} canciones</span>
                <span>•</span>
                <span>{totalDurationMin} min</span>
              </div>
            </div>

            {/* Lista de canciones */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-4">
              {tracks.map((song, idx) => (
                <div
                  key={song.id + idx}
                  onClick={() => playTrack(song.uri)}
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={e => handleRemoveTrack(e, song.uri)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full transition"
                      title="Eliminar canción"
                    >
                      <FaTrashAlt />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); playTrack(song.uri); }}
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
