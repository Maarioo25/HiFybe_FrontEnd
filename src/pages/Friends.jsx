// components/Friends.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';
import { notificationService } from '../services/notificationService';

export default function Friends() {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        const userId = currentUser.user?._id || currentUser.user?.id;
        setCurrentUserId(userId);
        const data = await friendService.getFriends(userId);
        setFriendsList(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al cargar amigos');
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, []);

  const openAddFriendModal = async () => {
    const users = await userService.getAllUsers();
    const amigosIds = new Set(friendsList.map(f => f.id));
    const filtrados = users.filter(
      u => u._id !== currentUserId && !amigosIds.has(u._id)
    );
    setAllUsers(filtrados);
    setShowModal(true);
  };

  const handleAddFriend = async (targetId, nombre) => {
    try {
      await friendService.sendRequest(currentUserId, targetId);
      await notificationService.createNotification(
        targetId,
        `${nombre} te ha enviado una solicitud de amistad`
      );
      alert('Solicitud enviada correctamente');
      setShowModal(false);
    } catch {
      alert('Error al enviar solicitud');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-harmony-accent mb-6">Mis Amigos</h2>
            <div className="overflow-y-auto scrollbar-thin h-[calc(60vh-24px)] px-4 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(friendsList.length === 0 ? [{ id: 'add' }] : [...friendsList, { id: 'add' }]).map(amigo => (
                amigo.id === 'add' ? (
                  <div key="add" className="friend-card relative group w-full h-50" onClick={openAddFriendModal}>
                    <div className="flex items-center justify-center w-full h-full bg-harmony-secondary/20 rounded-xl hover:bg-harmony-secondary/30 transition-colors duration-200 cursor-pointer">
                      <FaPlus className="text-4xl text-harmony-accent" />
                    </div>
                  </div>
                ) : (
                  <Link to={`/friends/${amigo.id}`} key={amigo.id} className="friend-card relative group w-full h-50">
                    <div className="relative w-full h-full rounded-xl overflow-hidden group">
                      <div className="absolute inset-0">
                        <img
                          src={amigo.foto_perfil}
                          alt={amigo.nombre}
                          className="w-full h-full object-cover blur-lg group-hover:blur-none transition-all duration-300"
                        />
                      </div>
                      <div className="relative w-full h-full flex flex-col p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="absolute top-4 right-4">
                          <div className={`w-2 h-2 rounded-full ${amigo.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        <div className="flex items-center gap-4 mt-auto">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                            <img src={amigo.foto_perfil} alt={amigo.nombre} className="w-full h-full object-cover" />
                          </div>
                          <h3 className="text-xl font-bold text-white">{amigo.nombre}</h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      <FooterPlayer />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-harmony-primary rounded-xl w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-harmony-accent hover:text-red-400"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-bold mb-4 text-harmony-accent">Añadir amigo</h2>
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 rounded-lg bg-harmony-secondary/20 text-white placeholder-harmony-text-secondary"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent pr-1">
              {allUsers
                .filter(u => u.nombre.toLowerCase().includes(search.toLowerCase()))
                .map(u => (
                  <div key={u._id} className="flex items-center justify-between px-4 py-2 rounded-lg bg-harmony-secondary/10 hover:bg-harmony-secondary/20 transition">
                    <div className="flex items-center gap-3">
                      <img src={u.foto_perfil || ''} alt={u.nombre} className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-white truncate max-w-[140px]">{u.nombre}</span>
                    </div>
                    <button
                      onClick={() => handleAddFriend(u._id, u.nombre)}
                      className="px-3 py-1 rounded-full bg-harmony-accent text-sm text-white hover:bg-harmony-accent/80 transition"
                    >
                      Enviar solicitud
                    </button>
                  </div>
                ))}
              {allUsers.length === 0 && (
                <p className="text-center text-harmony-text-secondary">No hay usuarios disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
