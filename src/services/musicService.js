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
    try {
      const res = await fetch('/data/recommendations.json');
      const recomendaciones = await res.json();

      const detalles = await Promise.all(
        recomendaciones.map(async (rec) => {
          const respuesta = await api.get(`/canciones/spotify/${rec.id}`);
          return {
            id: rec.id,
            title: respuesta.data.nombre,
            artist: respuesta.data.artista,
            img: respuesta.data.imagen,
            spotifyUri: respuesta.data.uri
          };
        })
      );

      return detalles;
    } catch (err) {
      console.error("Error en musicService.getSpotifyRecommendations:", err);
      return [];
    }
  }
};
