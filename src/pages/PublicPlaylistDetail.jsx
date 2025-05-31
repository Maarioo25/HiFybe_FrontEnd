// src/pages/PublicPlaylistDetail.jsx
import React, { useEffect, useState } from 'react';
import { FaPlay, FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import api from '../services/api'; // reemplaza playlistService por instancia axios

export default function PublicPlaylistDetail() {
  // Ahora obtenemos userId y playlistId en lugar de solo id
  const { userId, playlistId } = useParams();
  const navigate = useNavigate();
  const { setCurrentSong, setIsPlaying, playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistDetail = async () => {
      try {
        // Llamar al servicio con userId y playlistId
        const playlistInfo = await playlistService.getSpotifyPlaylistById(userId, playlistId);
        setPlaylist(playlistInfo);
        setTracks(playlistInfo.canciones); // asumimos que "canciones" viene en el objeto
      } catch (err) {
        setError('No se encontró la playlist o hubo un error cargando datos.');
      }
    };
    fetchPlaylistDetail();
  }, [userId, playlistId]);

  if (error) {
    console.log(error);
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar onSongSelect={playTrack} />
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
              <p className="text-sm">No se pudo cargar la playlist pública.</p>
            </div>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-harmony-primary flex items-center justify-center">
        <div className="text-white text-lg">Cargando playlist...</div>
      </div>
    );
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentSong(tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={playTrack} />
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
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-harmony-accent truncate">
                  {playlist.nombre}
                </h1>
              </div>
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

            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-1/3 flex-shrink-0">
                <img
                  src={playlist.imagen}
                  alt={playlist.nombre}
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <p className="text-harmony-text-secondary">
                  {tracks.length} canciones • {playlist.owner?.nombre || 'Desconocido'}
                </p>
                <p className="text-harmony-text-secondary">
                  {playlist.descripcion || 'Sin descripción.'}
                </p>
              </div>
            </div>

            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-120px)] px-6 pb-6 space-y-6">
              {tracks.map((track) => (
                <div
                  key={track._id}
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
                    <h3 className="font-semibold text-harmony-text-primary truncate">
                      {track.title}
                    </h3>
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
