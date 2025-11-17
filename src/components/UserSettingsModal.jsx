import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit } from 'react-icons/fa';
import ReactCountryFlag from 'react-country-flag';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// UserSettingsModal component
export default function UserSettingsModal({ isOpen, onClose, user }) {
  const { t, i18n } = useTranslation();
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [bio, setBio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [generos, setGeneros] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const fileInputRef = React.useRef(null);

  // useEffect para cargar los datos del usuario
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

  // Renderiza el modal
  if (!isOpen) return null;

  // Función para guardar los cambios
  const handleGuardar = async () => {
    try {
      const updates = [];
  
      // Perfil
      const perfil = {};
      if (nombre.trim()) perfil.nombre = nombre.trim();
      if (bio.trim()) perfil.biografia = bio.trim();
      if (foto.trim()) perfil.foto_perfil = foto.trim();
      if (Object.keys(perfil).length > 0) {
        updates.push(userService.updateProfile(user._id, perfil));
      }
  
      // Preferencias
      const preferencias = {};
      if (ciudad.trim()) preferencias.ciudad = ciudad.trim();
  
      const generosArray = generos
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g); // elimina vacíos
      if (generosArray.length > 0) {
        preferencias.generos_favoritos = generosArray;
      }
  
      if (Object.keys(preferencias).length > 0) {
        updates.push(userService.updatePreferencias(user._id, preferencias));
      }
  
      // Redes sociales
      const redes = {};
      if (instagram.trim()) redes.instagram = instagram.trim();
      if (twitter.trim()) redes.twitter = twitter.trim();
      if (tiktok.trim()) redes.tiktok = tiktok.trim();
  
      if (Object.keys(redes).length > 0) {
        updates.push(userService.updateRedesSociales(user._id, redes));
      }
  
      await Promise.all(updates);
      toast.success(t('settings.profileUpdated'));
      onClose();
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      toast.error(t('settings.profileUpdateError'));
    }
  };

  // Función para subir una imagen
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await userService.updateFotoPerfil(user._id, file);
      if (res?.url) {
        setFoto(res.url.startsWith('uploads') ? `${import.meta.env.VITE_API_URL}/${res.url}` : res.url);
        toast.success(t('settings.uploadSuccess'));
      } else {
        throw new Error('No se recibió una URL');
      }
    } catch (err) {
      console.error('Error al subir imagen:', err);
      toast.error(t('settings.uploadError'));
    }
  };

  // Clase para los inputs
  const inputClass =
    'w-full px-4 py-2 rounded-xl border border-harmony-text-secondary/20 bg-harmony-secondary/30 text-white placeholder-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-harmony-accent/40 transition';

  // Renderiza el modal
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-2 z-[999]">
      <div className="bg-harmony-primary rounded-2xl md:rounded-2xl rounded-t-3xl shadow-2xl border border-harmony-accent/20 w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 md:p-6 relative text-white scrollbar-thin scrollbar-thumb-harmony-accent/40 scrollbar-track-transparent">
        <button
          className="absolute top-4 right-4 text-harmony-accent hover:text-red-400 text-xl"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-harmony-accent text-center">
          {t('settings.title')}
        </h2>

        {/* Selector de idioma con banderas coloreadas */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => i18n.changeLanguage('es')}
            className="p-2 rounded-full bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
            aria-label="Español"
            title="Español"
          >
            <ReactCountryFlag
              countryCode="ES"
              svg
              style={{ width: '1.5em', height: '1.5em' }}
              alt="🇪🇸"
            />
          </button>

          <button
            onClick={() => i18n.changeLanguage('en')}
            className="p-2 rounded-full bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
            aria-label="English"
            title="English"
          >
            <ReactCountryFlag
              countryCode="GB"
              svg
              style={{ width: '1.5em', height: '1.5em' }}
              alt="🇬🇧"
            />
          </button>

          <button
            onClick={() => i18n.changeLanguage('de')}
            className="p-2 rounded-full bg-harmony-secondary/20 hover:bg-harmony-secondary/30 transition"
            aria-label="Deutsch"
            title="Deutsch"
          >
            <ReactCountryFlag
              countryCode="DE"
              svg
              style={{ width: '1.5em', height: '1.5em' }}
              alt="🇩🇪"
            />
          </button>
        </div>

        {/* Foto y nombre */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group w-28 h-28">
            <img
              src={foto || 'https://via.placeholder.com/150?text=Foto'}
              alt={nombre || ''}
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

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={`${inputClass} w-64`}
            placeholder={t('settings.namePlaceholder')}
          />
        </div>

        {/* Información personal */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-harmony-accent mb-4">
            {t('settings.personalInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-harmony-text-secondary">
                {t('settings.bio')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder={t('settings.bioPlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm text-harmony-text-secondary">
                {t('settings.city')}
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className={inputClass}
                placeholder={t('settings.cityPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Géneros */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-harmony-accent mb-4">
            {t('settings.musicPrefs')}
          </h3>
          <input
            type="text"
            value={generos}
            onChange={(e) => setGeneros(e.target.value)}
            className={inputClass}
            placeholder={t('settings.musicPlaceholder')}
          />
        </div>

        {/* Redes sociales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-harmony-accent mb-4">
            {t('settings.socialMedia')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-harmony-text-secondary">
                {t('settings.instagram')}
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className={inputClass}
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="text-sm text-harmony-text-secondary">
                {t('settings.twitter')}
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className={inputClass}
                placeholder="@usuario"
              />
            </div>
            <div>
              <label className="text-sm text-harmony-text-secondary">
                {t('settings.tiktok')}
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className={inputClass}
                placeholder="@usuario"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-500 hover:bg-gray-400 text-white transition"
          >
            {t('settings.cancel')}
          </button>
          <button
            onClick={handleGuardar}
            className="px-5 py-2 rounded-full bg-harmony-accent hover:bg-harmony-accent/80 text-white transition"
          >
            {t('settings.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
