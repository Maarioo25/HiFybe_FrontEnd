// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 Comprobando autenticación...");
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("🔍 Ejecutando checkAuth...");
    try {
      const data = await userService.getCurrentUser();
      console.log("📦 Respuesta de /usuarios/me:", data);
  
      if (data.usuario) {
        console.log("✅ Usuario válido encontrado (data.usuario):", data.usuario);
        setUser(data.usuario);
      } else if (data._id) {
        console.log("✅ Usuario válido encontrado (data._id):", data);
        setUser(data);
      } else {
        console.warn("⚠️ Usuario no válido, data sin usuario ni _id:", data);
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Error en checkAuth:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  const login = async ({ email, password }, showToast = true) => {
    setLoading(true);
    try {
      const data = await userService.login(email, password);
      if (data.usuario) setUser(data.usuario);
      if (showToast) toast.success(t('auth.welcome'));
      navigate('/');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await userService.register(userData);
      if (res.mensaje && res.mensaje.includes('Inicia sesión')) {
        throw new Error(t('auth.email_error'));
      }
      await login(
        { email: userData.email, password: userData.password },
        false
      );
    } catch (error) {
      toast.error(error.response?.data?.mensaje || t('auth.register_error'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await userService.logout();
      localStorage.removeItem('sp_token');
      setUser(null);
      toast.success(t('auth.logged_out'));
      navigate('/auth');
    } catch (error) {
      toast.error(
        error?.response?.data?.mensaje || t('auth.logout_error')
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = 'https://api.mariobueno.info/usuarios/google';
  };

  const spotifyLogin = () => {
    window.location.href = 'http://api.mariobueno.info/usuarios/spotify';
  };

  const appleLogin = () => {};

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleLogin,
    appleLogin,
    spotifyLogin,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
