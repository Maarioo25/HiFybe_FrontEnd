import api from './api';

export const friendService = {
  // Obtener amigos de un usuario
  getFriends: async (userId) => {
    const res = await api.get(`/amistades/usuarios/${userId}`);
    return res.data;
  },
  // Obtener un amigo por ID
  getFriendById: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },
  // Enviar una solicitud de amistad
  sendRequest: async (emisorId, receptorId) => {
    const res = await api.post('/amistades/solicitudes', {
      de_usuario_id: emisorId,
      para_usuario_id: receptorId
    });
    return res.data;
  },
  // Aceptar o rechazar una solicitud de amistad
  respondRequest: async (solicitudId, estado) => {
    const res = await api.put(`/amistades/solicitudes/${solicitudId}`, { estado });
    return res.data;
  },
  // Eliminar una amistad
  deleteFriend: async (amistadId) => {
    const res = await api.delete(`/amistades/${amistadId}`);
    return res.data;
  },
  // Obtener solicitudes de amistad
  getRequests: async (userId) => {
    const res = await api.get(`/amistades/usuarios/${userId}/solicitudes`);
    return res.data;
  }
};