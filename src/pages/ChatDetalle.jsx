// ✅ ChatDetalle.js
import React, { useEffect, useState, useRef } from 'react';
import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';
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
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const scrollRef = useRef(null);
  const { playTrack } = usePlayer();
  const busquedaRef = useRef(null);
  const spotifyToken = localStorage.getItem("sp_token");


  useEffect(() => {
    const cargarMensajes = async () => {
      try {
        const res = await userService.getCurrentUser();
        const user = res?.user;
        if (user?._id) {
          setUsuarioActualId(user._id);
          const data = await conversationService.getMensajesDeConversacion(conversacionId);
          setMensajes(data);
        }
      } catch (err) {
        console.error('Error cargando mensajes:', err);
      }
    };

    cargarMensajes();
  }, [conversacionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (busquedaRef.current && !busquedaRef.current.contains(event.target)) {
        setMostrarBusqueda(false);
        setBusqueda('');
        setResultados([]);
      }
    };

    if (mostrarBusqueda) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarBusqueda]);

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim()) return;
    const res = await conversationService.enviarMensaje(conversacionId, usuarioActualId, nuevoMensaje);
    setMensajes((prev) => [...prev, res]);
    setNuevoMensaje('');
  };

  const buscarCanciones = async (query) => {
    if (!query.trim()) return setResultados([]);
  
    if (!spotifyToken) {
      console.warn("No hay token de Spotify.");
      return setResultados([]);
    }
  
    try {
      const encoded = encodeURIComponent(query);
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encoded}&type=track&limit=5`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`
        }
      });
  
      const data = await res.json();
      setResultados(data.tracks?.items || []);
    } catch (err) {
      console.error("Error buscando canciones en Spotify:", err);
    }
  };
  

  const enviarCancion = async (track) => {
    const cancion = {
      uri: track.uri,
      titulo: track.name,
      artista: track.artists.map((a) => a.name).join(', ')
    };
  
    const res = await conversationService.enviarMensaje(conversacionId, usuarioActualId, '', cancion);
    setMensajes((prev) => [...prev, res]);
    setMostrarBusqueda(false);
    setBusqueda('');
    setResultados([]);
  };  
  

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-harmony-primary">
      <div className="shrink-0">
        <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mx-4 bg-harmony-secondary/30 border border-harmony-text-secondary/10 rounded-2xl backdrop-blur-sm scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        {mensajes.length === 0 && (
          <div className="text-center text-harmony-text-secondary">
            No hay mensajes en esta conversación todavía.
          </div>
        )}

        {mensajes.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.emisor_id._id === usuarioActualId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-2xl border backdrop-blur-sm transition
                ${msg.emisor_id._id === usuarioActualId
                  ? 'bg-harmony-accent/80 text-white border-white/20'
                  : 'bg-harmony-secondary/30 text-harmony-text-primary border-harmony-text-secondary/10'}
              `}
            >
              <div className="text-sm font-semibold mb-1">{msg.emisor_id.nombre}</div>
              {msg.contenido && <div>{msg.contenido}</div>}

              {msg.cancion && (
                <div className="mt-2 p-2 bg-harmony-secondary/20 rounded-xl text-sm border border-harmony-text-secondary/10">
                  <div className="font-bold">{msg.cancion.titulo}</div>
                  <div>{msg.cancion.artista}</div>
                  <button
                    onClick={() => playTrack(msg.cancion.uri, 0)}
                    className="mt-1 text-xs text-harmony-accent hover:underline"
                  >
                    Reproducir
                  </button>
                </div>
              )}

              <div className="text-xs mt-1 text-right text-harmony-text-secondary">
                {new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {mostrarBusqueda && (
        <div
          ref={busquedaRef}
          className="fixed bottom-28 left-0 right-0 px-4 z-30"
        >
          <div className="bg-harmony-secondary p-3 rounded-xl border border-harmony-text-secondary/20 shadow space-y-2">
            <input
              type="text"
              className="w-full bg-transparent border-b border-harmony-text-secondary text-harmony-text-primary placeholder:text-harmony-text-secondary outline-none mb-2"
              placeholder="Buscar canción..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                buscarCanciones(e.target.value);
              }}
            />
            <div className="max-h-40 overflow-y-auto space-y-2">
              {resultados.length === 0 && (
                <p className="text-sm text-harmony-text-secondary">Sin resultados</p>
              )}
              {resultados.map((track) => (
                <div
                  key={track.id}
                  className="p-2 rounded-lg bg-harmony-primary/20 hover:bg-harmony-accent/20 cursor-pointer flex gap-2"
                  onClick={() => enviarCancion(track)}
                >
                  <img
                    src={track.album.images[0]?.url || "https://via.placeholder.com/40"}
                    alt={track.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <div className="font-semibold text-harmony-text-primary truncate">{track.name}</div>
                    <div className="text-sm text-harmony-text-secondary truncate">{track.artists.map((a) => a.name).join(", ")}</div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 px-4 mt-4 mb-4 z-10">
        <div className="flex items-center gap-3 bg-harmony-secondary/40 backdrop-blur-md rounded-full px-4 py-2 border border-harmony-text-secondary/20">
          <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
            <FaSmile className="text-lg" />
          </button>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent outline-none text-harmony-text-primary placeholder:text-harmony-text-secondary rounded-full px-2 py-1"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          />
          <button
            onClick={handleEnviar}
            className="p-2 hover:bg-harmony-secondary/50 rounded-full"
            title="Enviar mensaje"
          >
            <FaPaperPlane className="text-lg" />
          </button>
          <button
            onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
            className="p-2 hover:bg-harmony-secondary/50 rounded-full"
            title="Buscar canción"
          >
            <FaPaperclip className="text-lg" />
          </button>
        </div>
      </div>

      <div className="shrink-0">
        <FooterPlayer />
      </div>
    </div>
  );
}
