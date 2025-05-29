import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await userService.getCurrentUser();
      setUser(data.user);
    } catch {
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
      if (showToast) toast.success('Bienvenido a HiFybe!');
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
      if (res.mensaje && res.mensaje.includes("Inicia sesión")) {
        throw new Error("Error en email.");
      }
      await login(
        { email: userData.email, password: userData.password },
        false
      );
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error en el registro');
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
      toast.success('¡Sesión cerrada!');
      navigate('/auth');
    } catch (error) {
      toast.error(error?.response?.data?.mensaje || 'Error al cerrar sesión');
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
    spotifyLogin
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