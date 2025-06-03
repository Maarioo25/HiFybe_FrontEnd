import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit } from 'react-icons/fa';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';


export default function UserSettingsModal({ isOpen, onClose, user }) {
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [bio, setBio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [generos, setGeneros] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const fileInputRef = React.useRef(null);


  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setFoto(user.foto_perfil || '');
      setBio(user.biografia || '');
      setCiudad(user.ciudad || '');
      setGeneros((user.generos_favoritos || []).join(', '));
      setInstagram(user.redes?.instagram || '');
      setTwitter(user.redes?.twitter || '');
      setTiktok(user.redes?.tiktok || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleGuardar = async () => {
    try {
        await Promise.all([
            userService.updateProfile(user._id, {
              nombre,
              biografia: bio,
              foto_perfil: foto
            }),
            userService.updatePreferencias(user._id, {
              ciudad,
              generos_favoritos: generos.split(',').map(g => g.trim())
            }),
            userService.updateRedesSociales(user._id, {
              instagram,
              twitter,
              tiktok
            })
          ]);          
      toast.success('Perfil actualizado');
      onClose();
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      toast.error('Error al actualizar perfil');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const res = await userService.updateFotoPerfil(user._id, file);
      if (res?.url) {
        setFoto(res.url);
        toast.success("Imagen subida con éxito");
      } else {
        throw new Error("No se recibió una URL");
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      toast.error("Error al subir imagen");
    }
  };  
  

  const inputClass = "w-full px-4 py-2 rounded-xl border border-harmony-text-secondary/20 bg-harmony-secondary/30 text-white placeholder-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-harmony-accent/40 transition";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-harmony-primary rounded-2xl shadow-2xl border border-harmony-accent/20 w-[95%] md:w-[85%] max-w-4xl p-6 relative text-white">
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

        <div className="flex justify-center mb-6">
          <div className="relative group w-28 h-28">
            <img
              src={foto || 'https://via.placeholder.com/150?text=Foto'}
              alt="Foto de perfil"
              className="w-full h-full rounded-full object-cover border-4 border-harmony-accent shadow-md transition-all duration-300"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute top-0 left-0 w-full h-full rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <FaEdit className="text-white text-xl" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-harmony-text-secondary">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-harmony-text-secondary">Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
            />
          </div>

          <div>
            <label className="text-sm text-harmony-text-secondary">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className={inputClass}
              placeholder="Madrid, Barcelona..."
            />
          </div>

          <div>
            <label className="text-sm text-harmony-text-secondary">Géneros favoritos</label>
            <input
              type="text"
              value={generos}
              onChange={(e) => setGeneros(e.target.value)}
              className={inputClass}
              placeholder="rock, pop, indie..."
            />
          </div>

          <div>
            <label className="text-sm text-harmony-text-secondary">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={inputClass}
              placeholder="@usuario"
            />
          </div>

          <div>
            <label className="text-sm text-harmony-text-secondary">Twitter</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className={inputClass}
              placeholder="@usuario"
            />
          </div>

          <div>
            <label className="text-sm text-harmony-text-secondary">TikTok</label>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className={inputClass}
              placeholder="@usuario"
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
