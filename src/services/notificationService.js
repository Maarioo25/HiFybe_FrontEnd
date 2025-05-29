import api from './api';

export const notificationService = {
  getNotifications: async (userId) => {
    const res = await api.get(`/notificaciones/usuarios/${userId}`);
    return res.data;
  },
  markAsRead: async id => {
    const res = await api.put(`/notificaciones/${id}/leido`);
    return res.data;
  },
  createNotification: async (usuarioId, contenido) => {
    const res = await api.post('/notificaciones', { usuario_id: usuarioId, contenido });
    return res.data;
  }
};
