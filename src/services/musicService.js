import api from './api';

export const musicService = {
  // Obtener canciones
  getSongs: async filters => {
    const res = await api.get('/canciones', { params: filters });
    return res.data;
  },
  // Obtener playlists
  getPlaylists: async () => {
    const res = await api.get('/playlists');
    return res.data;
  },
  // Crear una playlist
  createPlaylist: async data => {
    const res = await api.post('/playlists', data);
    return res.data;
  },
  // Agregar una canción a una playlist
  addSongToPlaylist: async (pid, sid) => {
    const res = await api.post(`/playlists/${pid}/canciones`, { songId: sid });
    return res.data;
  },
  // Obtener recomendaciones de Spotify
  getSpotifyRecommendations: async () => {
    try {
      const recomendaciones = await fetch('/data/recommendations.json').then(r => r.json());

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
