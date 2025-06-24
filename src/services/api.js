// services/api.js
import axios from 'axios';

// Configuración base de axios
const api = axios.create({
 baseURL: 'http://localhost:3000/api',
 withCredentials: true, // Importante: envía cookies automáticamente
 timeout: 10000,
 headers: {
   'Content-Type': 'application/json',
 }
});

// Interceptor para requests
api.interceptors.request.use(
 (config) => {
   console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
   return config;
 },
 (error) => {
   console.error('❌ Request error:', error);
   return Promise.reject(error);
 }
);

// Interceptor para responses
api.interceptors.response.use(
 (response) => {
   console.log(`✅ ${response.status} ${response.config.url}`);
   return response;
 },
 (error) => {
   console.error('❌ Response error:', error.response?.status, error.response?.data);
   
   // Si recibimos 401, el usuario no está autenticado
   if (error.response?.status === 401) {
     // Limpiar cualquier dato local de usuario
     localStorage.removeItem('cloudtech_user');
     sessionStorage.removeItem('cloudtech_user');
     
     // Redirigir a login si no estamos ya ahí
     if (window.location.pathname !== '/login') {
       window.location.href = '/login';
     }
   }
   
   return Promise.reject(error);
 }
);

export default api;