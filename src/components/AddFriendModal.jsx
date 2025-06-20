import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AddFriendModal({ currentUserId, existingFriends, onClose }) {
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');

  // Carga los usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      const users = await userService.getAllUsers();
      const amigosIds = new Set(existingFriends.map(f => f.id));
      const filtrados = users.filter(
        u => u._id !== currentUserId && !amigosIds.has(u._id)
      );
      setAllUsers(filtrados);
    };
    fetchUsers();
  }, [currentUserId, existingFriends]);

  // Envía una solicitud de amistad
  const handleAddFriend = async (targetId) => {
    try {
      const res = await userService.getCurrentUser();
      const user = res?.usuario || res;
      const nombreEmisor = user.nombre;

      await friendService.sendRequest(user._id || user.id, targetId);

      await notificationService.crear(
        targetId,
        t('addFriend.notification', { name: nombreEmisor })
      );

      toast.success(t('addFriend.success'));
      onClose();
    } catch {
      toast.error(t('addFriend.error'));
    }
  };

  // Renderiza el modal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-harmony-primary rounded-xl w-11/12 max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-harmony-accent hover:text-red-400"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <FaTimes />
        </button>
        <h2 className="text-lg font-bold mb-4 text-harmony-accent">{t('addFriend.title')}</h2>
        <input
          type="text"
          className="w-full px-4 py-2 mb-4 rounded-full border border-harmony-text-secondary/10 bg-harmony-secondary/30 text-white placeholder-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-harmony-accent/40 transition"
          placeholder={t('addFriend.searchPlaceholder')}
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
                  onClick={() => handleAddFriend(u._id)}
                  className="px-3 py-1 rounded-full bg-harmony-accent text-sm text-white hover:bg-harmony-accent/80 transition"
                >
                  {t('addFriend.sendRequest')}
                </button>
              </div>
            ))}
          {allUsers.length === 0 && (
            <p className="text-center text-harmony-text-secondary">
              {t('addFriend.noUsers')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
