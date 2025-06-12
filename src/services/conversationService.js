import api from './api';

export const conversationService = {
  // Obtener todas las conversaciones de un usuario
  getConversacionesDeUsuario: async (usuarioId) => {
    const res = await api.get(`/conversaciones/usuarios/${usuarioId}`);
    return res.data;
  },

  // Crear una conversación entre dos usuarios (solo si son amigos)
  crearConversacion: async (usuarioId1, usuarioId2) => {
    const res = await api.post('/conversaciones', {
      participantes: [usuarioId1, usuarioId2]
    });
    return res.data;
  },

  // Obtener los mensajes de una conversación
  getMensajesDeConversacion: async (conversacionId) => {
    try {
      console.log(`📤 Solicitando mensajes de la conversación ${conversacionId}`);
      const res = await api.get(`/conversaciones/${conversacionId}/mensajes`);
      console.log(`📥 Mensajes recibidos (${res.data.length}):`, res.data);
  
      if (!Array.isArray(res.data)) {
        console.error('❌ La respuesta no es un array:', res.data);
      }
  
      return res.data;
    } catch (err) {
      console.error(`❌ Error al obtener mensajes de conversación ${conversacionId}:`, err);
      return [];
    }
  },
  

  // Enviar un mensaje (con o sin canción)
  enviarMensaje: async (conversacionId, emisorId, contenido, cancion) => {
    const mensajeLimpio = contenido.trim();
  
    // Si no hay texto y no hay canción, no enviar
    if (!mensajeLimpio) {
      console.warn('⚠️ No se puede enviar un mensaje vacío.');
      return;
    }
  
    console.log('📨 Intentando enviar mensaje...');
    console.log('🆔 Conversación:', conversacionId);
    console.log('👤 Usuario actual ID:', emisorId);
    console.log('✉️ Contenido:', mensajeLimpio);
  
    try {
      const res = await api.post(`/conversaciones/${conversacionId}/mensajes`, {
        emisor_id: emisorId,
        contenido,
        cancion
      });
      return res.data;
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err?.response?.data || err);
      throw err;
    }
  },
  
  

  // Marcar un mensaje como leído
  marcarMensajeLeido: async (mensajeId) => {
    const res = await api.put(`/conversaciones/mensajes/${mensajeId}/leido`);
    return res.data;
  }
};
