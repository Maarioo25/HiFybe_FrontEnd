// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          }
        }
      });
    }

    return Promise.reject({
      response: {
        data: {
          mensaje: error.response?.data?.mensaje || 'Ha ocurrido un error. Por favor, intenta nuevamente.'
        }
      }
    });
  }
);

export default api;
