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