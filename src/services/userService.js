import api from './api';

export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/usuarios');
    return res.data;
  },
  getUserById: async id => {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },
  updateProfile: async (id, data) => {
    const res = await api.put(`/usuarios/${id}`, {
      nombre: data.nombre,
      apodo: data.apodo,
      biografia: data.biografia,
      foto_perfil: data.foto_perfil
    });
    return res.data;
  },
  deleteUser: async id => {
    const res = await api.delete(`/usuarios/${id}`);
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/usuarios/login', { email, password });
    return res.data;
  },
  register: async data => {
    const res = await api.post('/usuarios/register', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/usuarios/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/usuarios/logout');
    return res.data;
  },
  setCancionUsuario: async (userId, trackId) => {
    try {
      const res = await api.put(`/usuarios/${userId}/cancion`, { trackId });
      return res.data;
    } catch (err) {
      console.error("Error en setCancionUsuario:", err);
      return null;
    }
  },
  getCancionUsuario: async (userId) => {
    try {
      const res = await api.get(`/usuarios/${userId}/cancion`);
      return res.data;
    } catch (err) {
      console.error("Error en getCancionUsuario:", err);
      return null;
    }
  },
  ocultarUbicacion: async () => {
    try {
      const res = await api.post("/usuarios/ocultar-ubicacion");
      return res.data;
    } catch (err) {
      console.error("Error al ocultar ubicación:", err);
      throw err;
    }
  },
  actualizarUbicacion: async (latitude, longitude) => {
    try {
      const res = await api.post("/usuarios/ubicacion", {
        latitude,
        longitude
      });
      return res.data;
    } catch (err) {
      console.error("Error al actualizar ubicación:", err);
      throw err;
    }
  },
  updateRedesSociales: async (id, redes) => {
    try {
      const res = await api.put(`/usuarios/${id}/redes`, redes);
      return res.data;
    } catch (err) {
      console.error("Error al actualizar redes sociales:", err);
      throw err;
    }
  },

  updatePreferencias: async (id, preferencias) => {
    try {
      const res = await api.put(`/usuarios/${id}/preferencias`, preferencias);
      return res.data;
    } catch (err) {
      console.error("Error al actualizar preferencias:", err);
      throw err;
    }
  },

};