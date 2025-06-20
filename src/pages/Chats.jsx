import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { usePlayer } from '../context/PlayerContext';
import { conversationService } from '../services/conversationService';
import { userService } from '../services/userService';
import { useTranslation } from 'react-i18next';

export default function Chats() {
  const { t } = useTranslation();
  const [conversaciones, setConversaciones] = useState([]);
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  // Efecto para cargar las conversaciones una vez al inicializar
  useEffect(() => {
    const cargarConversaciones = async () => {
      const res = await userService.getCurrentUser();
      const user = res?.usuario || res;
      if (user?._id) {
        setUsuarioActualId(user._id);
        let data = await conversationService.getConversacionesDeUsuario(user._id);
  
        data = data.filter(conv => conv.usuario1_id && conv.usuario2_id);
  
        setConversaciones(data);
      }
    };
    cargarConversaciones();
  }, []);
  

  // Función para obtener el nombre y foto del otro usuario
  const obtenerNombreYFotoDelOtro = (conv) => {
    if (!conv.usuario1_id || !conv.usuario2_id) {
      return { nombre: '[usuario desconocido]', foto: 'https://via.placeholder.com/100?text=?' };
    }
  
    const esUsuario1 = conv.usuario1_id._id === usuarioActualId;
    const otro = esUsuario1 ? conv.usuario2_id : conv.usuario1_id;
    return {
      nombre: otro?.nombre || '[sin nombre]',
      foto: otro?.foto_perfil || `https://picsum.photos/300/300?random=${Math.random()}`,
    };
  };

  // Render
  return (
    <div className="flex flex-col h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-harmony-accent">
                  {t('chats.title')}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {conversaciones.map((conv) => {
                  const { nombre, foto } = obtenerNombreYFotoDelOtro(conv);
                  return (
                    <div
                      key={conv._id}
                      className="chat-card flex items-center gap-3 p-3 hover:bg-harmony-secondary/50 rounded-xl transition cursor-pointer"
                      onClick={() => navigate(`/chat/${conv._id}`)}
                    >
                      <div className="relative">
                        <img
                          src={foto}
                          alt={nombre}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-harmony-text-primary truncate">
                            {nombre}
                          </span>
                          <span className="text-xs text-harmony-text-secondary">
                            ⏳
                          </span>
                        </div>
                        <div className="text-sm text-harmony-text-secondary truncate">
                          {t('chats.subtext')}
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-harmony-accent/20 text-harmony-accent">
                          {t('chats.available')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {conversaciones.length === 0 && (
                  <div className="text-center text-harmony-text-secondary text-sm py-8">
                    {t('chats.noChats')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterPlayer />
    </div>
  );
}
