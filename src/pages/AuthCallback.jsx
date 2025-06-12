import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      console.log("🔁 Entrando en AuthCallback...");
      try {
        const res = await fetch('https://api.mariobueno.info/usuarios/me', {
          credentials: 'include'
        });
  
        console.log("📡 Fetch /usuarios/me status:", res.status);
        const data = await res.json();
        console.log("📦 Datos recibidos:", data);
  
        if (data?._id || data?.email || data?.usuario) {
          console.log("✅ Usuario recibido, redirigiendo a /");
          setUser(data.usuario || data);
          navigate('/');
        } else {
          console.warn("⚠️ Datos inválidos, redirigiendo a /auth");
          navigate('/auth');
        }
      } catch (err) {
        console.error("❌ Error en AuthCallback:", err);
        navigate('/auth');
      }
    })();
  }, []);
  

  return <p className="text-center mt-10">Iniciando sesión...</p>;
}
