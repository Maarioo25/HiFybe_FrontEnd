import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      document.cookie = [
        `token=`,
        `Domain=.mariobueno.info`,
        `Path=/`,
        `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `Secure`,
        `SameSite=None`
      ].join('; ');
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_refresh');
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          }
        }
      });
    }
    if (error.response?.status === 500) {
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Error en el servidor. Por favor, verifica que todos los campos estén correctamente completados.'
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
