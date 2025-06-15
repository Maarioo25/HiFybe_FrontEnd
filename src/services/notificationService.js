import api from './api';

export const notificationService = {
  // Obtener notificaciones de un usuario
  get: async (usuarioId) => {
    const res = await api.get(`/notificaciones/usuarios/${usuarioId}`);
    return res.data;
  },
  // Marcar una notificación como leída
  marcarLeida: async (id) => {
    const res = await api.put(`/notificaciones/${id}/leido`);
    return res.data;
  },
  // Crear una notificación
  crear: async (usuarioId, contenido) => {
    const res = await api.post('/notificaciones', {
      usuario_id: usuarioId,
      contenido,
    });
    return res.data;
  },
  // Eliminar una notificación
  eliminar: async (id) => {
    const res = await api.delete(`/notificaciones/${id}`);
    return res.data;
  },
};
