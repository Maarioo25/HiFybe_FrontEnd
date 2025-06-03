import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';

export default function UserSettingsModal({ isOpen, onClose, user }) {
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [foto, setFoto] = useState(user?.foto_perfil || '');

  if (!isOpen) return null;

  const handleGuardar = async () => {
    try {
      await userService.updateUser(user._id, { nombre, foto_perfil: foto });
      toast.success('Perfil actualizado');
      onClose();
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      toast.error('Error al actualizar perfil');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-harmony-primary rounded-2xl shadow-2xl border border-harmony-accent/20 w-[95%] md:w-[80%] max-w-3xl p-6 relative text-white">
        <button
          className="absolute top-4 right-4 text-harmony-accent hover:text-red-400 text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-harmony-accent text-center">
          Ajustes de perfil
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm text-harmony-text-secondary">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-harmony-text-secondary/20 bg-harmony-secondary/30 text-white placeholder-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-harmony-accent/40 transition"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-harmony-text-secondary">Foto de perfil (URL)</label>
            <input
              type="text"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-harmony-text-secondary/20 bg-harmony-secondary/30 text-white placeholder-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-harmony-accent/40 transition"
              placeholder="https://..."
            />
          </div>
        </div>

        {foto && (
          <div className="flex justify-center mt-6">
            <img
              src={foto}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-harmony-accent shadow-md"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-500 hover:bg-gray-400 text-white transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-5 py-2 rounded-full bg-harmony-accent hover:bg-harmony-accent/80 text-white transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
