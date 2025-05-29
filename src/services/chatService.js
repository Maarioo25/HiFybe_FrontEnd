export const chatService = {
  getConversations: async () => {
    const res = await api.get('/conversaciones');
    return res.data;
  },
  getMessages: async cid => {
    const res = await api.get(`/conversaciones/${cid}/mensajes`);
    return res.data;
  },
  sendMessage: async (cid, message) => {
    const res = await api.post(`/conversaciones/${cid}/mensajes`, { message });
    return res.data;
  }
};