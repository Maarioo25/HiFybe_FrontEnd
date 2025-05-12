// src/pages/AuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    userService.getCurrentUser()
      .then(res => {
        navigate('/');
      })
      .catch(() => {
        navigate('/login?error=oauth_failed');
      });
  }, []);

  return <p>Verificando sesión...</p>;
}
