import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function AuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener token de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const spotifyToken = urlParams.get('spotify_token');

        console.log('🔍 URL actual:', window.location.href);
        console.log('🔑 Token recibido:', token);
        console.log('🎵 Spotify token:', spotifyToken);

        if (token) {
          // Guardar token en localStorage
          localStorage.setItem('token', token);
          console.log('✅ Token guardado en localStorage');
          
          // Si hay token de Spotify, también guardarlo
          if (spotifyToken) {
            localStorage.setItem('sptoken', spotifyToken);
            console.log('✅ Spotify token guardado');
          }

          // Obtener información del usuario usando el token
          const userData = await userService.getCurrentUser();
          console.log('👤 Usuario obtenido:', userData);
          
          setUser(userData);
          navigate('/', { replace: true });
        } else {
          console.error('❌ No se encontró token en la URL');
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('❌ Error en AuthCallback:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [setUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg text-white">Iniciando sesión...</p>
      </div>
    </div>
  );
}
