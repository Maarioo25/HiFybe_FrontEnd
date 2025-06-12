import React, { useEffect, useState } from 'react';
import { FaPlay, FaArrowLeft, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { friendService } from '../services/friendService';
import { playlistService } from '../services/playlistService';
import { userService } from '../services/userService';
import { conversationService } from '../services/conversationService';
import { useTranslation } from 'react-i18next';

export default function FriendDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [amistadId, setAmistadId] = useState(null);
  const [error, setError] = useState(null);
  const { setCurrentSong, setIsPlaying } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await friendService.getFriendById(id);
        setFriend(userData);
  
        const currentUser = await userService.getCurrentUser();
        const friendships = await friendService.getFriends(currentUser._id);
  
        const amistad = friendships.find(f => f.id === id);
        if (amistad) setAmistadId(amistad.amistadId);

  
        if (userData.auth_proveedor === 'spotify' || userData.spotifyId) {
          const rawPlaylists = await playlistService.getSpotifyPlaylists(userData._id);
          setPlaylists(rawPlaylists);
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        setError(t('friendDetail.error'));
      }
    };
    fetchData();
  }, [id, t]);

  const handleIniciarConversacion = async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      const userId = currentUser._id;
      const conversaciones = await conversationService.getConversacionesDeUsuario(userId);

      const yaExiste = conversaciones.find(conversacion =>
        conversacion.usuario1_id &&
        conversacion.usuario2_id &&
        (
          (conversacion.usuario1_id._id === userId && conversacion.usuario2_id._id === friend._id) ||
          (conversacion.usuario2_id._id === userId && conversacion.usuario1_id._id === friend._id)
        )
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

  const handleEliminarAmistad = async () => {
    console.log('🔍 Intentando eliminar amistad con ID:', amistadId);
    if (!amistadId) {
      console.warn('⚠️ amistadId no definido');
      return;
    }
    try {
      await friendService.deleteFriend(amistadId);
      console.log('✅ Amistad eliminada correctamente');
      navigate('/friends');
    } catch (err) {
      console.error('❌ Error al eliminar amistad:', err);
    }
  };
  

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-harmony-primary">
        <HeaderBar onSongSelect={(uri) => setCurrentSong(uri, 0, true)} />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
          <div className="container mx-auto px-6 py-8">
            <h2 className="text-xl font-bold text-red-500">{t('friendDetail.error')}</h2>
          </div>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-harmony-primary flex items-center justify-center">
        <div className="text-white text-lg">{t('friendDetail.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={(uri) => setCurrentSong(uri, 0, true)} />
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              className="text-harmony-accent hover:text-harmony-accent/80"
              onClick={() => navigate('/friends')}
              aria-label={t('friendDetail.back')}
              title={t('friendDetail.back')}
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <h2 className="text-xl font-bold text-harmony-accent">{t('friendDetail.title')}</h2>
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
                  <span>
                    {playlists.length}{' '}
                    {t('friendDetail.publicPlaylists', { count: playlists.length })}
                  </span>
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
                                await userService.setCancionUsuario(currentUser._id, trackId);
                                console.log("Canción de usuario guardada exitosamente");
                              }
                            } catch (err) {
                              console.error(
                                "Error al guardar canción destacada:",
                                err
                              );
                            }
                          }}
                          aria-label={t('friendDetail.play')}
                          title={t('friendDetail.play')}
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

                <p className="text-harmony-text-secondary line-clamp-4 whitespace-pre-wrap">
                  {friend.biografia || t('friendDetail.noBio')}
                </p>

                {friend.ciudad && (
                  <p className="text-sm text-harmony-text-secondary">
                    {t('friendDetail.livesIn', { city: friend.ciudad })}
                  </p>
                )}

                {friend.generos_favoritos?.length > 0 && (
                  <p className="text-sm text-harmony-text-secondary">
                    {t('friendDetail.favoriteGenres', {
                      genres: friend.generos_favoritos.join(', ')
                    })}
                  </p>
                )}

                {(friend.redes?.instagram ||
                  friend.redes?.twitter ||
                  friend.redes?.tiktok) && (
                  <div className="flex flex-wrap gap-4 mt-2 text-sm items-center">
                    {friend.redes.instagram && (
                      <a
                        href={`https://instagram.com/${friend.redes.instagram.replace(
                          '@',
                          ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-harmony-accent hover:underline"
                      >
                        <FaInstagram className="text-lg" />{' '}
                        {t('friendDetail.instagram')}
                      </a>
                    )}
                    {friend.redes.twitter && (
                      <a
                        href={`https://twitter.com/${friend.redes.twitter.replace(
                          '@',
                          ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-harmony-accent hover:underline"
                      >
                        <FaTwitter className="text-lg" /> {t('friendDetail.twitter')}
                      </a>
                    )}
                    {friend.redes.tiktok && (
                      <a
                        href={`https://www.tiktok.com/@${friend.redes.tiktok.replace(
                          '@',
                          ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-harmony-accent hover:underline"
                      >
                        <FaTiktok className="text-lg" /> {t('friendDetail.tiktok')}
                      </a>
                    )}
                  </div>
                )}

                <button
                  onClick={handleIniciarConversacion}
                  className="inline-block mt-4 px-4 py-2 bg-harmony-accent text-white text-sm font-semibold rounded-full hover:bg-harmony-accent/80 transition"
                >
                  {t('friendDetail.sendMessage')}
                </button>
                {amistadId && (
                <button
                  onClick={handleEliminarAmistad}
                  className="inline-block mt-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition"
                >
                  {t('friendDetail.deleteFriend')}
                </button>
              )}

              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-harmony-accent mb-6">
              {t('friendDetail.playlistSectionTitle')}
            </h3>

            {friend.auth_proveedor !== 'spotify' && !friend.spotifyId ? (
              <p className="text-harmony-text-secondary">
                {t('friendDetail.noSpotifyLinked')}
              </p>
            ) : playlists.length === 0 ? (
              <p className="text-harmony-text-secondary">
                {t('friendDetail.noPublicPlaylists')}
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
                                  await userService.setCancionUsuario(currentUser._id, trackId);
                                  console.log("Canción de usuario guardada exitosamente");
                                }
                              } catch (err) {
                                console.error(
                                  "Error al guardar canción desde playlist:",
                                  err
                                );
                              }
                            }
                          }}
                          aria-label={t('friendDetail.play')}
                          title={t('friendDetail.play')}
                        >
                          <FaPlay className="text-xl" />
                        </button>
                        <span className="text-sm text-harmony-accent/80 mt-1">
                          {t('friendDetail.play')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-harmony-text-primary">
                        {playlist.nombre}
                      </h4>
                      <div className="flex items-center gap-2 text-harmony-text-secondary">
                        <span>
                          {t('friendDetail.songsCount', { count: playlist.canciones?.length || 0 })}
                        </span>
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
      </div>
      <FooterPlayer />
    </div>
  );
}
