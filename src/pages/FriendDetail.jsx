// src/pages/FriendDetail.jsx
import React, { useEffect, useState } from 'react';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { friendService } from '../services/friendService';
import { playlistService } from '../services/playlistService';
import { userService } from '../services/userService';
import { conversationService } from '../services/conversationService';

export default function FriendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const { setCurrentSong, setIsPlaying } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await friendService.getFriendById(id);
        setFriend(userData);

        if (userData.auth_proveedor === 'spotify' || userData.spotifyId) {
          const rawPlaylists = await playlistService.getSpotifyPlaylists(userData._id);
          setPlaylists(rawPlaylists);
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        setError('Amigo no encontrado o error al cargar datos');
      }
    };
    fetchData();
  }, [id]);

  const handleIniciarConversacion = async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      const userId = currentUser.user._id;
      const conversaciones = await conversationService.getConversacionesDeUsuario(userId);

      const yaExiste = conversaciones.find(conversacion =>
        (conversacion.usuario1_id._id === userId && conversacion.usuario2_id._id === friend._id) ||
        (conversacion.usuario2_id._id === userId && conversacion.usuario1_id._id === friend._id)
      );

      if (yaExiste) {
        navigate(`/chat/${yaExiste._id}`);
      } else {
        const nueva = await conversationService.crearConversacion(userId, friend._id);
        navigate(`/chat/${nueva._id}`);
      }
    } catch (error) {
      console.error("Error al iniciar conversación:", error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar onSongSelect={setCurrentSong}/>
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-red-500">{error}</h2>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-harmony-primary flex items-center justify-center">
        <div className="text-white text-lg">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={setCurrentSong} />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            className="text-harmony-accent hover:text-harmony-accent/80"
            onClick={() => navigate('/friends')}
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <h2 className="text-xl font-bold text-harmony-accent">Perfil</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden">
              <img
                src={friend.foto_perfil}
                alt={friend.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-harmony-accent mb-2">
                {friend.nombre}
              </h1>
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>{playlists.length} playlists públicas</span>
                <span>•</span>
                <span>{friend.estado || 'sin estado'}</span>
              </div>

              {friend.song && (
                <div className="flex items-center gap-4 group">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={friend.song.img}
                      alt={`${friend.song.title} - ${friend.song.artist}`}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                      <button
                        className="text-harmony-accent hover:text-harmony-accent/80"
                        onClick={async () => {
                          setCurrentSong(friend.song);
                          setIsPlaying(true);
                          try {
                            const currentUser = await userService.getCurrentUser();
                            const trackId = friend.song.spotifyUri?.split(':').pop();
                            if (trackId) {
                              await userService.setCancionUsuario(currentUser.user._id, trackId);
                            }
                          } catch (err) {
                            console.error("Error al guardar canción destacada:", err);
                          }
                        }}
                      >
                        <FaPlay className="text-xl" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-harmony-text-primary">
                      {friend.song.title}
                    </span>
                    <span className="text-xs text-harmony-text-secondary">
                      {friend.song.artist}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-harmony-text-secondary line-clamp-3">
                {friend.biografia || 'Sin biografía.'}
              </p>

              <button
                onClick={handleIniciarConversacion}
                className="inline-block mt-2 px-4 py-2 bg-harmony-accent text-white text-sm font-semibold rounded-full hover:bg-harmony-accent/80 transition"
              >
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-harmony-accent mb-6">
            Playlists Públicas
          </h3>

          {friend.auth_proveedor !== 'spotify' && !friend.spotifyId ? (
            <p className="text-harmony-text-secondary">
              Este usuario no tiene vinculada su cuenta de Spotify.
            </p>
          ) : playlists.length === 0 ? (
            <p className="text-harmony-text-secondary">
              No tiene playlists públicas disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/public/${friend._id}/${playlist.id}`}
                  className="playlist-card relative group w-full h-48 flex items-center gap-4 p-4 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={playlist.imagen}
                      alt={playlist.nombre}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                      <button
                        className="text-harmony-accent hover:text-harmony-accent/80"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (playlist.songs && playlist.songs.length > 0) {
                            const song = playlist.songs[0];
                            setCurrentSong(song);
                            setIsPlaying(true);
                            try {
                              const currentUser = await userService.getCurrentUser();
                              const trackId = song.spotifyUri?.split(':').pop();
                              if (trackId) {
                                await userService.setCancionUsuario(currentUser.user._id, trackId);
                              }
                            } catch (err) {
                              console.error("Error al guardar canción desde playlist:", err);
                            }
                          }
                        }}
                      >
                        <FaPlay className="text-xl" />
                      </button>
                      <span className="text-sm text-harmony-accent/80 mt-1">Reproducir</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-harmony-text-primary">
                      {playlist.nombre}
                    </h4>
                    <div className="flex items-center gap-2 text-harmony-text-secondary">
                      <span>{playlist.canciones} canciones</span>
                      <span>•</span>
                      <span>{playlist.duracion || '---'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <FooterPlayer />
    </div>
  );
}
