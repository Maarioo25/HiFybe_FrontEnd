// src/services/playlistService.js
import api from './api';

export const playlistService = {
  getSpotifyPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  },
  getSpotifyPlaylistById: async (userId, playlistId) => {
    const res = await api.get(`/playlists/friends/${userId}/playlists/${playlistId}`);
    return res.data;
  }
};
