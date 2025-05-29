import api from './api';

export const playlistService = {
  getSpotifyPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  }
};
