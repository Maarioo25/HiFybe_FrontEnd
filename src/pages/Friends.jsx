// components/Friends.jsx
import React, { useState, useEffect } from 'react';
import { FaMusic, FaPlay, FaPlus } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';

export default function Friends() {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const currentUser = await userService.getCurrentUser(); // obtener usuario actual
        const userId = currentUser._id || currentUser.id; // usar _id si existe
        console.log(userId);
        const data = await friendService.getFriends(userId);
        setFriendsList(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al cargar amigos');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-harmony-accent mb-6">Mis Amigos</h2>
            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-24px)] px-4 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...friendsList, { id: 'add' }].map(amigo => (
                amigo.id === 'add' ? (
                  <div key="add" className="friend-card relative group w-full h-50">
                    <div className="flex items-center justify-center w-full h-full bg-harmony-secondary/20 rounded-xl hover:bg-harmony-secondary/30 transition-colors duration-200">
                      <FaPlus className="text-4xl text-harmony-accent" />
                    </div>
                  </div>
                ) : (
                  <Link to={`/friends/${amigo.id}`} key={amigo.id} className="friend-card relative group w-full h-50">
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <img
                          src={amigo.foto_perfil}
                          alt={amigo.nombre}
                          className="w-full h-full object-cover blur-lg group-hover:blur-none transition-all duration-300"
                        />
                      </div>
                      <div className="relative w-full h-full flex flex-col p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="absolute top-4 right-4">
                          <div className={`w-2 h-2 rounded-full ${amigo.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                            <img src={amigo.foto_perfil} alt={amigo.nombre} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{amigo.nombre}</h3>
                            <div className="flex items-center gap-2 text-white/90 mt-1">
                              <FaMusic className="text-lg" />
                              <span>{amigo.playlistsPublicas} playlists públicas</span>
                            </div>
                            {amigo.estado?.includes('Escuchando') && (
                              <div className="flex items-center gap-2 text-white/80 mt-1">
                                <FaPlay className="text-lg" />
                                <span>{amigo.estado}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-auto flex flex-col gap-2">
                          <span className="text-sm font-medium text-white">Canción favorita</span>
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                              <img
                                src={amigo.cancionDestacada.imagen}
                                alt={`${amigo.cancionDestacada.titulo} - ${amigo.cancionDestacada.artista}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{amigo.cancionDestacada.titulo}</span>
                              <span className="text-xs text-white/70">{amigo.cancionDestacada.artista}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      <FooterPlayer />
    </div>
  );
}