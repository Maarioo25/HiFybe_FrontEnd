import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRedo, FaShareAlt, FaArrowLeft, FaPen } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';

const PLAYLISTS = [
  {
    name: "Mis Favoritas",
    cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a",
    description: "Mis canciones favoritas de todos los tiempos",
    totalSongs: 8,
    totalDuration: "2h 30m",
    created: "2024",
    songs: [
      {
        id: 1,
        title: "Stronger",
        artist: "Kanye West",
        album: "Late Registration",
        duration: "3:45",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 2,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        duration: "3:20",
        cover: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png"
      },
      {
        id: 3,
        title: "Bad Guy",
        artist: "Billie Eilish",
        album: "When We All Fall Asleep, Where Do We Go?",
        duration: "3:14",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 4,
        title: "Shape of You",
        artist: "Ed Sheeran",
        album: "÷",
        duration: "3:54",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 5,
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        duration: "5:55",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 6,
        title: "Sweet Child o' Mine",
        artist: "Guns N' Roses",
        album: "Appetite for Destruction",
        duration: "5:55",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 7,
        title: "Hotel California",
        artist: "Eagles",
        album: "Hotel California",
        duration: "6:30",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 8,
        title: "Stairway to Heaven",
        artist: "Led Zeppelin",
        album: "Led Zeppelin IV",
        duration: "8:02",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      }
    ],
    "Música para Viajes": {
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&h=1080",
      description: "Música perfecta para viajes",
      totalSongs: 8,
      totalDuration: "1h 45m",
      created: "2024",
      songs: [
      {
        id: 1,
        title: "Road Trip",
        artist: "Various Artists",
        album: "Travel Music",
        duration: "4:20",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 2,
        title: "Highway to Hell",
        artist: "AC/DC",
        album: "Highway to Hell",
        duration: "3:29",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 3,
        title: "On the Road Again",
        artist: "Willie Nelson",
        album: "Highway",
        duration: "3:45",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 4,
        title: "Life on the Road",
        artist: "Bob Seger",
        album: "Stranger in Town",
        duration: "4:15",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 5,
        title: "Drive",
        artist: "Incubus",
        album: "Make Yourself",
        duration: "4:32",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 6,
        title: "Take Me Home, Country Roads",
        artist: "John Denver",
        album: "Country Roads",
        duration: "3:55",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 7,
        title: "Wanderlust",
        artist: "The Lumineers",
        album: "Cleopatra",
        duration: "4:25",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      },
      {
        id: 8,
        title: "On the Road Again",
        artist: "Creedence Clearwater Revival",
        album: "Bayou Country",
        duration: "3:30",
        cover: "https://i.scdn.co/image/ab67616d00001e0226f7f19c7f0381e56156c94a"
      }
    ]
  },
  }
];

function PlaylistDetail() {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const playlist = PLAYLISTS.find(p => p.id === id);

  if (!playlist) {
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

                <h2 className="text-2xl font-bold text-harmony-accent">{name}</h2>
              </div>
              <div className="text-center text-harmony-text-secondary py-8">
                <p className="text-xl font-semibold mb-4">Playlist no encontrada</p>
                <p className="text-sm">No se encontró ninguna playlist con ese nombre.</p>
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
                  onClick={() => navigate(-1)} 
                  className="text-harmony-accent hover:text-harmony-accent/80 p-2 rounded-full hover:bg-harmony-accent/10 transition-colors duration-200"
                >
                  <FaArrowLeft className="text-lg" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-harmony-accent">{name}</h2>
            </div>

            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-44px)] px-6 pb-6">
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden group">
                    <img
                      src={playlist.cover}
                      alt={name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:filter group-hover:blur-sm group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="text-white bg-harmony-accent/90 p-3 rounded-full hover:bg-harmony-accent/80 transition-colors">
                        <FaPen className="text-xl" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4">
                      <h1 className="text-3xl font-bold text-harmony-accent mb-2">{name}</h1>
                      <div className="flex items-center gap-4 text-harmony-text-secondary">
                        <span>{playlist.totalSongs} canciones</span>
                        <span>•</span>
                        <span>{playlist.totalDuration}</span>
                      </div>
                      <p className="text-harmony-text-secondary line-clamp-2">{playlist.description}</p>
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

export default PlaylistDetail;
