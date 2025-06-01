import React, { useEffect, useState, useRef } from 'react';
import { FaPaperclip, FaSmile } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { conversationService } from '../services/conversationService';
import { userService } from '../services/userService';
import { usePlayer } from '../context/PlayerContext';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';

export default function ChatDetalle() {
  const { conversacionId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const scrollRef = useRef(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const cargarMensajes = async () => {
      const user = await userService.getCurrentUser();
      if (user?._id) {
        setUsuarioActualId(user._id);
        const data = await conversationService.getMensajesDeConversacion(conversacionId);
        setMensajes(data);
      }
    };

    cargarMensajes();
  }, [conversacionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim()) return;

    const res = await conversationService.enviarMensaje(conversacionId, usuarioActualId, nuevoMensaje);
    setMensajes((prev) => [...prev, res]);
    setNuevoMensaje('');
  };

  return (
    <div className="min-h-screen bg-harmony-primary flex flex-col">
      <HeaderBar onSongSelect={playTrack} />

      <div className="flex-1 overflow-y-auto container mx-auto px-4 py-6 space-y-4">
        {mensajes.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.emisor_id._id === usuarioActualId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-xl shadow-sm ${msg.emisor_id._id === usuarioActualId ? 'bg-harmony-accent text-white' : 'bg-harmony-secondary/50 text-harmony-text-primary'}`}>
              <div className="text-sm font-semibold mb-1">{msg.emisor_id.nombre}</div>
              <div>{msg.contenido}</div>
              {msg.cancion_id && (
                <div className="mt-2 p-2 bg-harmony-secondary/30 rounded-lg text-sm">
                  <div className="font-bold">{msg.cancion_id.titulo}</div>
                  <div>{msg.cancion_id.artista}</div>
                </div>
              )}
              <div className="text-xs mt-1 text-right text-harmony-text-secondary">{new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="sticky bottom-0 bg-harmony-secondary/30 backdrop-blur-sm border-t border-harmony-text-secondary/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
            <FaSmile className="text-lg" />
          </button>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none outline-none text-harmony-text-primary placeholder:text-harmony-text-secondary"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          />
          <button onClick={handleEnviar} className="p-2 hover:bg-harmony-secondary/50 rounded-full">
            <FaPaperclip className="text-lg" />
          </button>
        </div>
      </div>

      <FooterPlayer />
    </div>
  );
}
