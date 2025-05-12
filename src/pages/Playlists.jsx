import React from 'react';
import { FaPlus, FaEllipsisH, FaPlay } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import { Link } from 'react-router-dom';


const PLAYLISTS = [
  {
    id: 1,
    name: "Mis Favoritas",
    cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a",
    songs: 25,
    duration: "2h 30m",
    created: "2024",
    description: "Mis canciones favoritas de todos los tiempos"
  },
  {
    id: 2,
    name: "Workout",
    cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a",
    songs: 30,
    duration: "1h 45m",
    created: "2024",
    description: "Música para entrenar con energía"
  },
  {
    id: 3,
    name: "Relax",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&h=1080",
    songs: 15,
    duration: "1h 15m",
    created: "2024",
    description: "Música para desconectar y relajarse"
  },
  {
    id: 4,
    name: "Pop Hits",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1080&h=1080",
    songs: 20,
    duration: "1h 30m",
    created: "2024",
    description: "Los mejores hits del momento"
  },
  {
    id: 5,
    name: "Rap & Hip-Hop",
    cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a",
    songs: 45,
    duration: "3h 15m",
    created: "2024",
    description: "Los mejores temas de rap y hip-hop"
  },
  {
    id: 6,
    name: "Rock Classics",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&h=1080",
    songs: 35,
    duration: "2h 45m",
    created: "2024",
    description: "Los clásicos del rock que nunca pasan de moda"
  },
  {
    id: 7,
    name: "Party Mix",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1080&h=1080",
    songs: 50,
    duration: "3h 30m",
    created: "2024",
    description: "Música para fiestas y reuniones"
  },
  {
    id: 8,
    name: "Study Focus",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&h=1080",
    songs: 25,
    duration: "2h 15m",
    created: "2024",
    description: "Música para concentrarse y estudiar"
  },
  {
    id: 9,
    name: "Sleep Well",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&h=1080",
    songs: 20,
    duration: "1h 45m",
    created: "2024",
    description: "Música relajante para dormir"
  },
  {
    id: 10,
    name: "Travel Vibes",
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1080&h=1080",
    songs: 30,
    duration: "2h 30m",
    created: "2024",
    description: "Música perfecta para viajes"
  }
];


export default function Playlists() {
  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="flex items-center justify-between mb-4 p-6">
            <h2 className="text-xl font-bold text-harmony-accent">Playlists</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-harmony-accent hover:bg-harmony-accent/80 rounded-full text-white font-semibold">
              <FaPlus className="text-lg" />
              <span>Nueva Playlist</span>
            </button>
          </div>

          <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-28px)] px-6 pb-2">
            {PLAYLISTS.map((playlist) => (
              <Link to={`/playlists/${encodeURIComponent(playlist.name)}`} key={playlist.id} className="playlist-card relative group w-full flex items-center gap-4 p-4 rounded-xl bg-harmony-secondary/20 cursor-pointer hover:bg-harmony-secondary/30 transition-colors duration-200">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                    <div className="flex flex-col items-center gap-2">
                      <button className="text-harmony-accent hover:text-harmony-accent/80">
                        <FaPlay className="text-xl" />
                      </button>
                      <span className="text-sm text-harmony-accent/80">Reproducir</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-harmony-text-primary truncate">{playlist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-harmony-text-secondary mt-1">
                    <span>{playlist.songs} canciones</span>
                    <span>•</span>
                    <span>{playlist.duration}</span>
                  </div>
                  <p className="text-sm text-harmony-text-secondary mt-1 line-clamp-2">{playlist.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}