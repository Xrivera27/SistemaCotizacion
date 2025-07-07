// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://sistemacotizacionbackend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ INTERCEPTOR PARA DEBUG
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url)
    console.log('🍪 Cookies:', document.cookie)
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
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api