// src/services/userService.js
import api from './api';

export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    const res = await api.get('/usuarios');
    return res.data;
  },
  // Obtener un usuario por ID
  getUserById: async id => {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },
  // Actualizar perfil
  updateProfile: async (id, data) => {
    const res = await api.put(`/usuarios/${id}`, {
      nombre: data.nombre,
      apodo: data.apodo,
      biografia: data.biografia,
      foto_perfil: data.foto_perfil
    });
    return res.data;
  },
  // Eliminar un usuario
  deleteUser: async id => {
    const res = await api.delete(`/usuarios/${id}`);
    return res.data;
  },
  // Iniciar sesión
  login: async (email, password) => {
    const res = await api.post('/usuarios/login', { email, password }, {
      withCredentials: true
    });
    return res.data;
  },
  // Registrarse
  register: async data => {
    const res = await api.post('/usuarios/register', data);
    return res.data;
  },
  // Obtener el usuario actual
  getCurrentUser: async () => {
    const res = await api.get('/usuarios/me');
    return res.data;
  },
  // Cerrar sesión
  logout: async () => {
    const res = await api.post('/usuarios/logout');
    return res.data;
  },
  // Guardar la canción del usuario
  setCancionUsuario: async (userId, trackId) => {
    try {
      const res = await api.put(`/usuarios/${userId}/cancion`, { trackId });
      return res.data;
    } catch (err) {
      console.error("Error en setCancionUsuario:", err);
      return null;
    }
  },

  // Obtener la canción del usuario
  getCancionUsuario: async (userId) => {
    try {
      const res = await api.get(`/usuarios/${userId}/cancion`);
      return res.data;
    } catch (err) {
      console.error("Error en getCancionUsuario:", err);
      return null;
    }
  },

  // Ocultar la ubicación del usuario
  ocultarUbicacion: async () => {
    try {
      const res = await api.post("/usuarios/ocultar-ubicacion");
      return res.data;
    } catch (err) {
      console.error("Error al ocultar ubicación:", err);
      throw err;
    }
  },

  // Actualizar la ubicación del usuario
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

  // Actualizar las redes sociales del usuario
  updateRedesSociales: async (id, redes) => {
    try {
      const res = await api.put(`/usuarios/${id}/redes`, redes);
      return res.data;
    } catch (err) {
      console.error("Error al actualizar redes sociales:", err);
      throw err;
    }
  },

  // Actualizar la foto del perfil del usuario
  updateFotoPerfil: async (id, file) => {
    const formData = new FormData();
    formData.append('foto', file);

    const res = await api.post(`/usuarios/${id}/foto`, formData);
    return res.data;
  },

  // Actualizar las preferencias del usuario
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
