// services/api.js
import axios from 'axios'

const api = axios.create({
 baseURL: process.env.VUE_APP_API_URL || 'https://sistemacotizacionbackend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ INTERCEPTOR CORREGIDO
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url)
    // ✅ NO intentar leer cookies HttpOnly
    console.log('🍪 Cookies will be sent automatically (HttpOnly)')
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data)
    return response
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data)
    
    // ✅ MANEJO DE ERRORES 401
    if (error.response?.status === 401) {
      console.log('🚨 Error 401 detectado')
      
      // No hacer logout en rutas de heartbeat
      const sensitiveRoutes = ['/auth/me', '/auth/heartbeat', '/auth/ping'];
      const isHeartbeatRoute = sensitiveRoutes.some(route => 
        error.config?.url?.includes(route)
      );
      
      if (!isHeartbeatRoute) {
        console.log('🚪 Redirigiendo a login...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error)
  }
)

export default api