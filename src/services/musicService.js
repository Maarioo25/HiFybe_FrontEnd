import axios from 'axios';
import api from './api';

export const musicService = {
  getSongs: async filters => {
    const res = await axios.get('/canciones', { params: filters });
    return res.data;
  },
  getPlaylists: async () => {
    const res = await axios.get('/playlists');
    return res.data;
  },
  createPlaylist: async data => {
    const res = await axios.post('/playlists', data);
    return res.data;
  },
  addSongToPlaylist: async (pid, sid) => {
    const res = await axios.post(`/playlists/${pid}/canciones`, { songId: sid });
    return res.data;
  },
  getSpotifyRecommendations: async () => {
    const token = localStorage.getItem('sp_token');
    if (!token) throw new Error("No hay token de Spotify");

    try {
      const res = await api.get('/spotify/recomendaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Error al obtener recomendaciones:', err.response?.data || err.message);
      throw err;
    }
  }
};
