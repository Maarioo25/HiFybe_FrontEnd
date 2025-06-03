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
    const res = await api.get(`/conversaciones/${conversacionId}/mensajes`);
    return res.data;
  },

  // Enviar un mensaje (con o sin canción)
  enviarMensaje: async (conversacionId, emisorId, contenido, cancion = null) => {
    const res = await api.post(`/conversaciones/${conversacionId}/mensajes`, {
      emisorId,
      contenido,
      cancion
    });
    return res.data;
  },

  // Marcar un mensaje como leído
  marcarMensajeLeido: async (mensajeId) => {
    const res = await api.put(`/conversaciones/mensajes/${mensajeId}/leido`);
    return res.data;
  }
};
