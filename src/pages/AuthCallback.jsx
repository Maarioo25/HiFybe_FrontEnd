import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.mariobueno.info/usuarios/me', {
          credentials: 'include'
        });
        const data = await res.json();

        if (data?._id || data?.email || data?.usuario) {
          setUser(data.usuario || data);
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch {
        navigate('/auth');
      }
    })();
  }, []);

  return <p className="text-center mt-10">Iniciando sesión...</p>;
}
