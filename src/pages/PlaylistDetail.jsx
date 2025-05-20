import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaShareAlt, FaArrowLeft, FaPen, FaTrashAlt } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { connectSpotifyUrl } = useAuth();
  const token = localStorage.getItem('sp_token');
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

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
        const data = await res.json();
        setPlaylist(data);
        setTracks(data.tracks.items.map(item => item.track));
        setNewName(data.name);
      } catch (err) {
        console.error('Fetch playlist error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [id, token]);

  const isConnected = Boolean(token);

  const handlePlayAll = () => {
    if (tracks.length) playTrack(tracks[0].uri);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles');
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        setPlaylist(prev => ({ ...prev, name: newName }));
        setEditing(false);
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleRemoveTrack = async uri => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracks: [{ uri }] })
      });
      if (res.ok) setTracks(prev => prev.filter(t => t.uri !== uri));
    } catch (err) {
      console.error('Remove track error:', err);
    }
  };

  if (!playlist && !loading) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar />
        <div className="container mx-auto px-6 pt-8">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
            <div className="p-6 text-center text-harmony-text-secondary">
              <p className="text-xl font-semibold mb-2">Playlist no encontrada</p>
            </div>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6 pt-8">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            {/* Header Top: back and title/edit */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    className="bg-harmony-secondary/50 text-harmony-text-primary px-2 py-1 rounded"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                  <button onClick={handleRename} className="px-3 py-1 bg-harmony-accent text-white rounded">
                    Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-500 text-white rounded">
                    Cancelar
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-harmony-accent flex items-center gap-2">
                  {playlist?.name}
                  {isConnected && <FaPen className="cursor-pointer" onClick={() => setEditing(true)} />}
                </h1>
              )}
            </div>

            {/* Main content: image, name, stats, description */}
            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-44px)] px-6 pb-6 space-y-6">
              <div className="flex gap-6 items-center">
                <div className="relative w-48 h-48 rounded-xl overflow-hidden group">
                  <img
                    src={playlist?.images[0]?.url}
                    alt={playlist?.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm group-hover:opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <button onClick={handlePlayAll} className="text-harmony-accent hover:text-harmony-accent/80">
                      <FaPlay className="text-xl" />
                    </button>
                    <button onClick={handleShare} className="text-harmony-accent hover:text-harmony-accent/80">
                      <FaShareAlt className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-2xl font-semibold text-harmony-text-primary mb-2">{playlist?.name}</h2>
                  <div className="flex items-center gap-4 text-harmony-text-secondary mb-2">
                    <span>{playlist?.tracks.total} canciones</span>
                    <span>•</span>
                    <span>{Math.floor(tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / 60000)} min</span>
                  </div>
                  {playlist?.description && (
                    <p className="text-harmony-text-secondary mt-2 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Track list */}
              <div className="space-y-4">
                {tracks.map((song, idx) => (
                  <div
                    key={song.id + idx}
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={song.album.images[0]?.url}
                          alt={song.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-harmony-text-primary truncate">{song.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-harmony-text-secondary">
                          <span className="truncate">{song.artists.map(a => a.name).join(', ')}</span>
                          <span>•</span>
                          <span>{Math.floor((song.duration_ms || 0) / 60000)}:{String(Math.floor(((song.duration_ms || 0) % 60000) / 1000)).padStart(2,'0')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected && (
                        <button
                          onClick={() => handleRemoveTrack(song.uri)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                      <button
                        onClick={() => playTrack(song.uri)}
                        className="text-harmony-accent hover:text-harmony-accent/80 p-1"
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
      </div>
      <FooterPlayer />
    </div>
  );
}