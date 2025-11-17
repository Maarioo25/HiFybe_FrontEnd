import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// ⬇️ INTERCEPTOR DE REQUEST - AÑADE EL TOKEN A LOS HEADERS ⬇️
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    console.log('📤 Enviando petición con token:', token ? 'Presente' : 'Ausente');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de respuesta para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('🔴 Error 401 - Token inválido o expirado');
      localStorage.removeItem('token'); // Limpiar token inválido
      
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
