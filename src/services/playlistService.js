// src/services/playlistService.js
import api from './api';

export const playlistService = {
  getSpotifyPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  },
  getSpotifyPlaylistById: async (playlistId) => {
    const res = await api.get(`/spotify/playlists/detail/${playlistId}`);
    return res.data;
  }
};
