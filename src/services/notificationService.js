import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notificaciones');
    return res.data;
  },
  markAsRead: async id => {
    const res = await api.put(`/notificaciones/${id}/leida`);
    return res.data;
  }
};