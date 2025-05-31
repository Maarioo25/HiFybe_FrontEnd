import axios from 'axios';

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
  getSpotifyRecommendations: async (token) => {
    if (!token) throw new Error("Token de Spotify no disponible");

    const res = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        seed_genres: 'pop',
        limit: 10
      }
    });

    return res.data.tracks.map(track => ({
      spotifyUri: track.uri,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      img: track.album.images?.[0]?.url || ''
    }));
  }
};
