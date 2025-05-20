import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaTrashAlt, FaShareAlt, FaArrowLeft } from 'react-icons/fa';
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
      } catch (err) {
        console.error('Fetch playlist error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [id, token]);

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

  const totalDurationMin = Math.floor(
    tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / 60000
  );

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6 pt-8">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <h1 className="text-3xl font-bold text-harmony-accent">
                {playlist?.name}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={e => { e.stopPropagation(); playTrack(tracks[0]?.uri); }}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                  title="Reproducir todo"
                >
                  <FaPlay className="text-xl" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); alert('Enlace copiado'); }}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                  title="Compartir playlist"
                >
                  <FaShareAlt className="text-xl" />
                </button>
              </div>
            </div>

            {/* Info: Name Above Stats */}
            <div className="px-6 mb-4">
              <h2 className="text-2xl font-semibold text-harmony-accent mb-2">
                {playlist?.name}
              </h2>
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>{tracks.length} canciones</span>
                <span>•</span>
                <span>{totalDurationMin} min</span>
              </div>
            </div>

            {/* Track List */}
            <div className="overflow-y-auto scrollbar-thin h-[60vh] px-6 pb-6 space-y-4">
              {tracks.map((song, idx) => (
                <div
                  key={song.id + idx}
                  onClick={() => playTrack(song.uri)}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition cursor-pointer"
                >
                  {/* Song Info */}
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
                  {/* Action Buttons */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={e => { e.stopPropagation(); /* remove logic */ }}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full transition"
                      title="Eliminar"
                    >
                      <FaTrashAlt />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); playTrack(song.uri); }}
                      className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full transition"
                      title="Reproducir"
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
