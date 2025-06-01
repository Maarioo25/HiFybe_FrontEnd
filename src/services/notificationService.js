import api from './api';

export const notificationService = {
  get: async (usuarioId) => {
    const res = await api.get(`/notificaciones/usuarios/${usuarioId}`);
    return res.data;
  },

  marcarLeida: async (id) => {
    const res = await api.put(`/notificaciones/${id}/leido`);
    return res.data;
  },

  crear: async (usuarioId, contenido) => {
    const res = await api.post('/notificaciones', {
      usuario_id: usuarioId,
      contenido,
    });
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/notificaciones/${id}`);
    return res.data;
  },
};
