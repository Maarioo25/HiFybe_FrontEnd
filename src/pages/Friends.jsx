import React from 'react';
import { FaUser, FaMusic, FaPlay, FaPlus } from 'react-icons/fa';
import { FRIENDS } from '../data/friends';
import HeaderBar from '../components/HeaderBar';
import { Link } from 'react-router-dom';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';



const friendsList = FRIENDS.map(friend => ({
  id: friend.id,
  nombre: friend.name,
  foto: friend.photo,
  estado: friend.status,
  playlistsPublicas: friend.playlistsPublicas,
  cancionDestacada: {
    titulo: friend.song.title,
    artista: friend.song.artist,
    imagen: friend.song.img
  },
  ultimaActividad: friend.lastActivity,
  online: friend.online
}));

export default function Friends() {
  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-harmony-accent mb-6">Mis Amigos</h2>
            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-24px)] px-4 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...friendsList,
                {
                  id: 'add',
                  nombre: 'Añadir amigos',
                  foto: '',
                  estado: '',
                  playlistsPublicas: 0
                }
              ].map((amigo) => (
                amigo.id === 'add' ? (
                  <div key={amigo.id} className="friend-card relative group w-full h-50">
                    <div className="flex items-center justify-center w-full h-full bg-harmony-secondary/20 rounded-xl hover:bg-harmony-secondary/30 transition-colors duration-200">
                      <FaPlus className="text-4xl text-harmony-accent" />
                    </div>
                  </div>
                ) : (
                  <Link to={`/friends/${amigo.id}`} key={amigo.id} className="friend-card relative group w-full h-50">
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <img
                          src={amigo.foto}
                          alt={amigo.nombre}
                          className="w-full h-full object-cover blur-lg group-hover:blur-none transition-all duration-300"
                        />
                      </div>
                      <div className="relative w-full h-full flex flex-col p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="absolute top-4 right-4">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                            <img
                              src={amigo.foto}
                              alt={amigo.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{amigo.nombre}</h3>
                            <div className="flex items-center gap-2 text-white/90 mt-1">
                              <FaMusic className="text-lg" />
                              <span>{amigo.playlistsPublicas} playlists públicas</span>
                            </div>
                            {amigo.estado.includes("Escuchando") && (
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
