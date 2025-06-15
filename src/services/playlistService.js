import api from './api';

export const playlistService = {
  // Obtener playlists de Spotify
  getSpotifyPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  },
  // Obtener una playlist de Spotify por ID
  getSpotifyPlaylistById: async (userId, playlistId) => {
    const res = await api.get(`/public/${userId}/${playlistId}`);
    return res.data;
  }
};
