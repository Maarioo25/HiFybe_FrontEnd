import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';
import FooterPlayer from '../components/FooterPlayer';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';
import { notificationService } from '../services/notificationService';
import { usePlayer } from '../context/PlayerContext';
import { toast } from 'react-hot-toast';
import AddFriendModal from '../components/AddFriendModal';

export default function Friends() {
  const [friendsList, setFriendsList] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('amigos');
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        const userId = currentUser.user?._id || currentUser.user?.id;
        setCurrentUserId(userId);
        const [friends, requests] = await Promise.all([
          friendService.getFriends(userId),
          friendService.getRequests(userId)
        ]);
        setFriendsList(friends);
        setSolicitudes(requests);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openAddFriendModal = () => {
    setShowModal(true);
  };

  const handleRespondRequest = async (id, estado) => {
    try {
      await friendService.respondRequest(id, estado);
      setSolicitudes(prev => prev.filter(s => s._id !== id));
      if (estado === 'aceptada') {
        const updated = await friendService.getFriends(currentUserId);
        setFriendsList(updated);
        toast.success('Solicitud aceptada');
      } else {
        toast.success('Solicitud rechazada');
      }
    } catch {
      toast.error('Error al responder solicitud');
    }
  };

  if (error) 
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)} />
        <div className="flex-1 flex items-center justify-center text-white">
          {error}
        </div>
        <FooterPlayer />
      </div>
    );
  

  return (
    <div className="flex flex-col h-screen bg-harmony-primary">
      <HeaderBar onSongSelect={(uri) => playTrack(uri, 0, false, true)}/>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <div className="container mx-auto px-6">
          <div className="container mx-auto px-6">
          <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl border border-harmony-text-secondary/10 mt-6 mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-harmony-accent mb-6">Mis Amigos</h2>

                <div className="flex items-center mb-4 gap-2">
                  <button
                    onClick={() => setActiveTab('amigos')}
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                      activeTab === 'amigos'
                        ? 'bg-harmony-accent text-white border-harmony-accent'
                        : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                    }`}
                  >
                    Amigos
                  </button>
                  <button
                    onClick={() => setActiveTab('solicitudes')}
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-sm transition border shadow-sm focus:outline-none ${
                      activeTab === 'solicitudes'
                        ? 'bg-harmony-accent text-white border-harmony-accent'
                        : 'bg-transparent text-harmony-accent border-transparent hover:bg-harmony-accent/10'
                    }`}
                  >
                    Solicitudes
                  </button>
                </div>

                <div className="h-[46vh] max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent px-4 mb-8">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-white">Cargando datos...</div>
                  ) : activeTab === 'amigos' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  ) : (
                    <div className="space-y-4">
                      {solicitudes.length === 0 ? (
                        <p className="text-harmony-text-secondary">No tienes solicitudes pendientes</p>
                      ) : (
                        solicitudes.map(s => (
                          <div key={s._id} className="bg-harmony-secondary/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow border border-harmony-secondary/30">
                            <div className="flex items-center gap-4">
                              <img
                                src={s.de_usuario_id?.foto_perfil || ''}
                                alt={s.de_usuario_id?.nombre || 'Usuario'}
                                className="w-12 h-12 rounded-full object-cover border-2 border-harmony-accent"
                              />
                              <span className="text-white text-lg font-semibold truncate max-w-[180px]">
                                {s.de_usuario_id?.nombre || 'Usuario desconocido'}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleRespondRequest(s._id, 'aceptada')}
                                className="px-4 py-1.5 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleRespondRequest(s._id, 'rechazada')}
                                className="px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterPlayer />

      {showModal && (
        <AddFriendModal
          currentUserId={currentUserId}
          existingFriends={friendsList}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
