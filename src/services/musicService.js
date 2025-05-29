import api from './api';
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