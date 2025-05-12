import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaPlay,
  FaShareAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import { FRIENDS } from '../data/friends';

export default function PublicPlaylistDetail() {
  const { id, name } = useParams();
  const navigate = useNavigate();

  const friend = FRIENDS.find(f => f.id === parseInt(id, 10));
  const decodedName = decodeURIComponent(name || '');

  const playlist = friend?.playlists?.find(p => p.nombre === decodedName);

  if (!friend || !playlist) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar />
        <div className="container mx-auto px-6 pt-8">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigate(`/friends/${id}`)}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10"
                >
                  <FaArrowLeft className="text-lg" />
                </button>
                <h2 className="text-2xl font-bold text-harmony-accent">{decodedName}</h2>
              </div>
              <div className="text-center text-harmony-text-secondary py-8">
                <p className="text-xl font-semibold mb-4">Playlist no encontrada</p>
                <p className="text-sm">No se encontró ninguna playlist pública con ese nombre para este amigo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6 pt-8">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/friends/${id}`)}
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition-colors duration-200"
                >
                  <FaArrowLeft className="text-lg" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-harmony-accent">{decodedName}</h2>
            </div>

            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-44px)] px-6 pb-6">
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden group">
                    <img
                      src={playlist.imagen}
                      alt={decodedName}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:filter group-hover:blur-sm group-hover:opacity-80"
                    />
                    {/* No botón de edición */}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4">
                      <h1 className="text-3xl font-bold text-harmony-accent mb-2">{decodedName}</h1>
                      <div className="flex items-center gap-4 text-harmony-text-secondary">
                        <span>{playlist.canciones} canciones</span>
                        <span>•</span>
                        <span>{playlist.duracion}</span>
                      </div>
                      <p className="text-harmony-text-secondary line-clamp-2">{playlist.descripcion}</p>
                      <div className="flex items-center gap-4">
                        <button className="text-harmony-accent hover:text-harmony-accent/80">
                          <FaPlay className="text-xl" />
                        </button>
                        <button className="text-harmony-accent hover:text-harmony-accent/80">
                          <FaShareAlt className="text-xl" />
                        </button>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-harmony-accent/20"></div>
                          <div className="w-2 h-2 rounded-full bg-harmony-accent/20"></div>
                          <div className="w-2 h-2 rounded-full bg-harmony-accent/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {playlist.songs.map((song) => (
                    <div key={song.id} className="playlist-song-card group flex items-center gap-3 p-3 rounded-xl bg-harmony-secondary/20 hover:bg-harmony-secondary/30">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-harmony-text-primary truncate">{song.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-harmony-text-secondary">
                          <span className="truncate">{song.artist}</span>
                          <span>•</span>
                          <span>{song.duration}</span>
                        </div>
                      </div>
                      <button className="text-harmony-accent hover:text-harmony-accent/80">
                        <FaPlay className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
