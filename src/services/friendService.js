import api from './api';

export const friendService = {
  getFriends: async (userId) => {
    const res = await api.get(`/amistades/usuarios/${userId}`);
    return res.data;
  },
  getFriendById: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },
  sendRequest: async (emisorId, receptorId) => {
    const res = await api.post('/amistades/solicitudes', {
      de_usuario_id: emisorId,
      para_usuario_id: receptorId
    });
    return res.data;
  },
  respondRequest: async (solicitudId, estado) => {
    const res = await api.put(`/amistades/solicitudes/${solicitudId}`, { estado });
    return res.data;
  },
  deleteFriend: async (amistadId) => {
    const res = await api.delete(`/amistades/${amistadId}`);
    return res.data;
  },
  getRequests: async (userId) => {
    const res = await api.get(`/amistades/usuarios/${userId}/solicitudes`);
    return res.data;
  }
};