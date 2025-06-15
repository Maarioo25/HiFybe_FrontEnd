// src/pages/Playlists.jsx
import React, { useEffect, useState } from 'react';
import { FaPlay, FaSpotify } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { Link } from 'react-router-dom';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Playlists() {
  const { t } = useTranslation();
  const { connectSpotifyUrl } = useAuth();
  const spotifyToken = localStorage.getItem('sp_token');
  const isConnected = Boolean(spotifyToken);

  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const playAndStoreTrack = async (uri) => {
    try {
      await playTrack(uri);
      const trackId = uri?.split(':').pop();
      if (!trackId) return;
      const currentUser = await userService.getCurrentUser();
      await userService.setCancionUsuario(currentUser._id, trackId);
    } catch (err) {
      console.error("Error al guardar canción desde Playlists:", err);
    }
  };

  useEffect(() => {
    if (spotifyToken) {
      setLoading(true);
      fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      })
        .then(res => res.json())
        .then(data => {
          const pls = data.items.map(pl => ({
            id: pl.id,
            name: pl.name,
            cover: (pl.images && Array.isArray(pl.images) && pl.images.length > 0) ? pl.images[0].url : 'default_image_url',
            songs: pl.tracks.total,
            duration: '',
            description: pl.description || ''
          }));
          
          setPlaylists(pls);
        })
        .catch(err => console.error('Error al cargar playlists de Spotify:', err))
        .finally(() => setLoading(false));
    } else {
      setPlaylists([]);
      setLoading(false);
    }
  }, [spotifyToken]);

  const handleConnectSpotify = () => {
    window.location.href = connectSpotifyUrl;
  };

  return (
    <div className="flex flex-col h-screen bg-harmony-primary overflow-hidden">
      <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="container mx-auto">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
            <div className="flex items-center justify-between mb-4 p-6">
              <h2 className="text-xl font-bold text-harmony-accent">
                {t('playlists.title')}
              </h2>
            </div>

            <div
              className={`relative overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent px-6 pb-4 transition-all duration-300 ${
                isConnected ? 'h-[60vh]' : 'h-[40vh]'
              }`}
            >
              {isConnected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.length > 0
                    ? playlists.map(pl => (
                        <Link
                          to={`/playlists/${encodeURIComponent(pl.id)}`}
                          key={pl.id}
                          className="playlist-card relative group flex items-center gap-4 p-4 rounded-xl bg-harmony-secondary/20 cursor-pointer hover:bg-harmony-secondary/30 transition-colors duration-200"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={pl.cover}
                              alt={pl.name}
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <button
                                className="text-white"
                                onClick={async e => {
                                  e.preventDefault();
                                  const uri = `spotify:playlist:${pl.id}`;
                                  await playAndStoreTrack(uri);
                                }}
                              >
                                <FaPlay className="text-xl" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-harmony-text-primary truncate">
                              {pl.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-harmony-text-secondary mt-1">
                              <span>
                                {pl.songs} {t('playlists.songs')}
                              </span>
                              {pl.duration && (
                                <>
                                  •<span>{pl.duration}</span>
                                </>
                              )}
                            </div>
                            {pl.description && (
                              <p className="text-sm text-harmony-text-secondary mt-1 line-clamp-2">
                                {pl.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))
                    : Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-harmony-secondary/20" />
                      ))}
                </div>
              )}

              {!isConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl px-6 text-center">
                  <FaSpotify className="text-4xl text-white mb-3" />
                  <p className="text-white font-semibold mb-4">
                    {t('playlists.connect_prompt')}
                  </p>
                  <button
                    onClick={handleConnectSpotify}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                  >
                    {t('playlists.connect')}
                  </button>
                </div>
              )}

              {loading && isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-harmony-text-secondary">
                    {t('playlists.loading')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterPlayer />
    </div>
  );
}
