import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { notificacionesService } from '../services/notificacionesService';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && user?._id) {
      notificacionesService.get(user._id).then(setNotifications).catch(() => {});
    }
  }, [open, user]);

  const handleMarkAsRead = async (id) => {
    await notificacionesService.marcarLeida(id);
    setNotifications((prev) => prev.map(n => n._id === id ? { ...n, leido: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.leido).length;

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 text-harmony-accent hover:text-harmony-accent/80 focus:outline-none text-2xl"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-harmony-primary"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-harmony-primary/95 rounded-xl shadow-xl border border-harmony-accent/20 z-50 animate-fade-in-down text-sm">
          <div className="px-4 py-3 border-b border-harmony-accent/10 font-semibold text-harmony-accent">
            Notificaciones
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-4 text-center text-harmony-text-secondary">
              No tienes ninguna notificación pendiente
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`px-4 py-2 cursor-pointer hover:bg-harmony-accent/10 ${
                    n.leido ? 'text-harmony-text-secondary' : 'text-harmony-text-primary font-semibold'
                  }`}
                  onClick={() => handleMarkAsRead(n._id)}
                >
                  {n.contenido}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
