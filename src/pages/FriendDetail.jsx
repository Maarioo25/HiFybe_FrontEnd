import React, { useState } from 'react';
import { FaMusic, FaPlay, FaArrowLeft } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import { useParams, useNavigate } from 'react-router-dom';
import { FRIENDS } from '../data/friends';
import { Link } from 'react-router-dom';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';

function encontrarAmigoPorId(id) {
  return FRIENDS.find(friend => friend.id === parseInt(id));
}

export default function FriendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const friend = encontrarAmigoPorId(id) || {};
  const { currentSong, setCurrentSong, isPlaying, setIsPlaying } = usePlayer();

  if (!friend.id) {
    return (
      <div className="min-h-screen bg-harmony-primary">
        <HeaderBar />
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-harmony-accent">Amigo no encontrado</h2>
        </div>
        <FooterPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="text-harmony-accent hover:text-harmony-accent/80"
            onClick={() => navigate("/friends")}
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <h2 className="text-xl font-bold text-harmony-accent">Perfil</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden">
              <img
                src={friend.photo}
                alt={friend.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-harmony-accent mb-2">{friend.name}</h1>
              <div className="flex items-center gap-4 text-harmony-text-secondary">
                <span>{friend.playlistsPublicas} playlists públicas</span>
                <span>•</span>
                <span>{friend.status}</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={friend.song?.img} 
                    alt={`${friend.song?.title} - ${friend.song?.artist}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                    <button 
                      className="text-harmony-accent hover:text-harmony-accent/80"
                      onClick={() => {
                        setCurrentSong(friend.song);
                        setIsPlaying(true);
                      }}
                    >
                      <FaPlay className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-harmony-text-primary">{friend.song?.title}</span>
                  <span className="text-xs text-harmony-text-secondary">{friend.song?.artist}</span>
                </div>
              </div>
              <p className="text-harmony-text-secondary line-clamp-3">{friend.lastActivity}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-harmony-accent mb-6">Playlists Públicas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friend.playlists?.map((playlist) => (
              <Link to={`/friends/${id}/playlists/${playlist.nombre}`} key={playlist.id} className="playlist-card relative group w-full h-48 flex items-center gap-4 p-4 rounded-xl bg-harmony-secondary/20 cursor-pointer hover:bg-harmony-secondary/30 transition-colors duration-200">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={playlist.imagen}
                    alt={playlist.nombre}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:filter group-hover:blur-sm group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        className="text-harmony-accent hover:text-harmony-accent/80"
                        onClick={() => {
                          setCurrentSong(playlist.songs[0]);
                          setIsPlaying(true);
                        }}
                      >
                        <FaPlay className="text-xl" />
                      </button>
                      <span className="text-sm text-harmony-accent/80">Reproducir</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-harmony-text-primary">{playlist.nombre}</h4>
                  <div className="flex items-center gap-2 text-harmony-text-secondary">
                    <span>{playlist.canciones} canciones</span>
                    <span>•</span>
                    <span>{playlist.duracion}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <FooterPlayer />
    </div>
  );
}
