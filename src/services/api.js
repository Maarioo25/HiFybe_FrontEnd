import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Interceptor de respuesta para manejar errores
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
