import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';

export default function PublicPlaylistDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { setCurrentSong, setIsPlaying } = usePlayer();

  const decodedName = decodeURIComponent(name || '');
  const playlist = realFriends?.find(p => p.nombre === decodedName);
  const { playTrack } = usePlayer();

  // Si no existe
  if (!playlist) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar onSongSelect={playTrack}/>
        <div className="container mx-auto px-6 pt-8">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
            <div className="p-6 text-center text-harmony-text-secondary">
              <button
                onClick={() => navigate(-1)}
                className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
              >
                <FaArrowLeft />
              </button>
              <p className="mt-4 text-xl font-semibold">Playlist no encontrada</p>
              <p className="text-sm">No se encontró la playlist de este amigo.</p>
            </div>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  const tracks = playlist.songs || [];

  // Compartir URL
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  // Reproducir toda la playlist
  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentSong(tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6 pt-8">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <h1 className="text-3xl font-bold text-harmony-accent">{decodedName}</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayAll}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                  title="Reproducir todo"
                >
                  <FaPlay className="text-xl" />
                </button>
                <button
                  onClick={handleShare}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                  title="Compartir playlist"
                >
                  <FaShareAlt className="text-xl" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-44px)] px-6 pb-6 space-y-6">
              {tracks.map(track => (
                <div
                  key={track.id}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-harmony-text-primary truncate">{track.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-harmony-text-secondary">
                      <span className="truncate">{track.artist}</span>
                      <span>•</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                  <button
                    className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition"
                    onClick={() => {
                      setCurrentSong(track);
                      setIsPlaying(true);
                    }}
                    title="Reproducir canción"
                  >
                    <FaPlay className="text-lg" />
                  </button>
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
