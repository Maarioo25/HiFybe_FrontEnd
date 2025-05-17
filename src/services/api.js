import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      document.cookie = [
        `token=`,
        `Domain=.mariobueno.info`,
        `Path=/`,
        `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `Secure`,
        `SameSite=None`
      ].join('; ');
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_refresh');
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          }
        }
      });
    }
    if (error.response?.status === 500) {
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Error en el servidor. Por favor, verifica que todos los campos estén correctamente completados.'
          }
        }
      });
    }
    return Promise.reject({
      response: {
        data: {
          mensaje: error.response?.data?.mensaje || 'Ha ocurrido un error. Por favor, intenta nuevamente.'
        }
      }
    });
  }
);

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
  }
};

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

export const chatService = {
  getConversations: async () => {
    const res = await api.get('/conversaciones');
    return res.data;
  },
  getMessages: async cid => {
    const res = await api.get(`/conversaciones/${cid}/mensajes`);
    return res.data;
  },
  sendMessage: async (cid, message) => {
    const res = await api.post(`/conversaciones/${cid}/mensajes`, { message });
    return res.data;
  }
};

export const musicService = {
  getSongs: async filters => {
    const res = await api.get('/canciones', { params: filters });
    return res.data;
  },
  getPlaylists: async () => {
    const res = await api.get('/playlists');
    return res.data;
  },
  createPlaylist: async data => {
    const res = await api.post('/playlists', data);
    return res.data;
  },
  addSongToPlaylist: async (pid, sid) => {
    const res = await api.post(`/playlists/${pid}/canciones`, { songId: sid });
    return res.data;
  }
};

export default api;
