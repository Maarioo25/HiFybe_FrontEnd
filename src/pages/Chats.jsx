import React from 'react';
import { FaPaperclip, FaSmile, FaEllipsisH } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';

export default function Chats() {
  const CHATS = [
    {
      id: 1,
      nombre: "Juan Pérez",
      foto: "https://picsum.photos/300/300?random=1",
      mensaje: "¡Hola! ¿Qué tal estás?",
      hora: "14:30",
      estado: "En línea",
      cancionDestacada: {
        titulo: "As It Was",
        artista: "Harry Styles",
        imagen: "https://picsum.photos/300/300?random=2"
      }
    },
    {
      id: 2,
      nombre: "María García",
      foto: "https://picsum.photos/300/300?random=3",
      mensaje: "¡Hola! ¿Qué tal estás?",
      hora: "14:30",
      estado: "En línea",
      cancionDestacada: {
        titulo: "As It Was",
        artista: "Harry Styles",
        imagen: "https://picsum.photos/300/300?random=2"
      }
    },
    {
      id: 3,
      nombre: "Carlos Rodríguez",
      foto: "https://picsum.photos/300/300?random=4",
      mensaje: "¡Hola! ¿Qué tal estás?",
      hora: "14:30",
      estado: "En línea",
      cancionDestacada: {
        titulo: "As It Was",
        artista: "Harry Styles",
        imagen: "https://picsum.photos/300/300?random=2"
      }
    }
  ];
  const { playTrack } = usePlayer();
  const { currentSong, setCurrentSong, isPlaying, setIsPlaying, progress, setProgress, volume, setVolume, duration, setDuration } = usePlayer();

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={playTrack}/>
      <div className="container mx-auto px-6 py-8">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-harmony-accent">Chats</h2>
              <button className="text-harmony-accent hover:text-harmony-accent/80">
                <FaEllipsisH className="text-lg" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {CHATS.map((chat) => (
                <div key={chat.id} className="chat-card flex items-center gap-3 p-3 hover:bg-harmony-secondary/50 rounded-xl transition">
                  <div className="relative">
                    <img
                      src={chat.foto}
                      alt={chat.nombre}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-harmony-text-primary truncate">{chat.nombre}</span>
                      <span className="text-xs text-harmony-text-secondary">{chat.hora}</span>
                    </div>
                    <div className="text-sm text-harmony-text-secondary truncate">{chat.mensaje}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${chat.estado === "En línea" ? "bg-harmony-accent/20 text-harmony-accent" : "bg-harmony-text-secondary/20 text-harmony-text-secondary"}`}>{chat.estado}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-3 border border-harmony-text-secondary/10">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
                  <FaSmile className="text-lg" />
                </button>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent border-none outline-none text-harmony-text-primary placeholder:text-harmony-text-secondary"
                />
                <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
                  <FaPaperclip className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterPlayer />
    </div>
  );
}