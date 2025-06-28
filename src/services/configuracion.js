// services/configuracion.js
import api from './api';

class ConfiguracionService {
  
  // Obtener información personal del usuario logueado
  async getInformacionPersonal() {
    try {
      console.log('👤 Obteniendo información personal...');
      
      const response = await api.get('/configuracion/perfil');
      
      if (response.data.success) {
        console.log('✅ Información personal obtenida:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo información personal'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo información personal:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Actualizar información personal del usuario logueado
  async actualizarInformacionPersonal(datosUsuario) {
    try {
      console.log('✏️ Actualizando información personal:', datosUsuario);
      
      const response = await api.put('/configuracion/perfil', datosUsuario);
      
      if (response.data.success) {
        console.log('✅ Información personal actualizada:', response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error actualizando información personal'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando información personal:', error);
      
      if (error.response?.data?.errors) {
        return {
          success: false,
          message: error.response.data.message,
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Cambiar contraseña del usuario logueado
  async cambiarContrasena(passwordData) {
    try {
      console.log('🔐 Cambiando contraseña...');
      
      const response = await api.patch('/configuracion/cambiar-password', passwordData);
      
      if (response.data.success) {
        console.log('✅ Contraseña cambiada exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error cambiando contraseña'
      };
      
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      if (error.response?.data?.errors) {
        return {
          success: false,
          message: error.response.data.message,
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Helper para validar formato de teléfono hondureño
  isValidPhone(phone) {
    if (!phone) return true; // Teléfono es opcional
    const phoneRegex = /^(\+504\s?)?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  // Helper para validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Helper para validar contraseña
  validatePassword(password) {
    const validation = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    
    return {
      ...validation,
      isValid: Object.values(validation).every(valid => valid)
    };
  }
  
  // Helper para formatear datos antes de enviar
  formatDataForUpdate(formData) {
    const dataToSend = {};
    
    // Solo incluir campos que no estén vacíos
    if (formData.nombre && formData.nombre.trim()) {
      dataToSend.nombre = formData.nombre.trim();
    }
    
    if (formData.email && formData.email.trim()) {
      dataToSend.email = formData.email.trim();
    }
    
    if (formData.usuario && formData.usuario.trim()) {
      dataToSend.usuario = formData.usuario.trim();
    }
    
    // Teléfono puede ser vacío para limpiar
    if (formData.telefono !== undefined) {
      dataToSend.telefono = formData.telefono.trim();
    }
    
    return dataToSend;
  }
  
  // Helper para obtener tipos de usuario legibles
  getTipoUsuarioText(tipoUsuario) {
    const tipos = {
      'admin': 'Administrador',
      'super_usuario': 'Super Usuario',
      'vendedor': 'Vendedor'
    };
    
    return tipos[tipoUsuario] || 'Sin Rol';
  }
  
  // Helper para sincronizar datos con localStorage/sessionStorage
  syncUserData(userData) {
    try {
      // Actualizar localStorage si existe
      const localUser = localStorage.getItem('cloudtech_user');
      if (localUser) {
        const user = JSON.parse(localUser);
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('cloudtech_user', JSON.stringify(updatedUser));
      }
      
      // Actualizar sessionStorage si existe
      const sessionUser = sessionStorage.getItem('cloudtech_user');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        const updatedUser = { ...user, ...userData };
        sessionStorage.setItem('cloudtech_user', JSON.stringify(updatedUser));
      }
      
      console.log('✅ Datos de usuario sincronizados con localStorage/sessionStorage');
      
    } catch (error) {
      console.error('❌ Error sincronizando datos de usuario:', error);
    }
  }
}

// Exportar instancia única
export default new ConfiguracionService();