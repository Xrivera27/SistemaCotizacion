// services/auth.js
import api from './api';

class AuthService {
  
  // Login con el backend real
  async login(usuario, password, recordar = false) {
    try {
      
      const response = await api.post('/auth/login', {
        usuario,
        password
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        
        // Guardar datos del usuario (el JWT ya está en la cookie)
        const userToStore = {
          id: userData.id,
          nombre_completo: userData.nombre_completo,
          correo: userData.correo,
          usuario: userData.usuario,
          tipo_usuario: userData.tipo_usuario,
          // Mapear tipo_usuario a rol numérico para compatibilidad
          rol: this.mapTipoUsuarioToRol(userData.tipo_usuario)
        };

        // Guardar según si quiere recordar o no
        if (recordar) {
          localStorage.setItem('cloudtech_user', JSON.stringify(userToStore));
          localStorage.setItem('cloudtech_remember', 'true');
        } else {
          sessionStorage.setItem('cloudtech_user', JSON.stringify(userToStore));
        }

        return {
          success: true,
          user: userToStore,
          expiresAt: response.data.data.expiresAt
        };
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      let message = 'Error de conexión';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      return {
        success: false,
        message: message
      };
    }
  }

  // Verificar si el usuario está autenticado
  async checkAuth() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const userData = response.data.data.user;
        
        // Actualizar datos locales
        const userToStore = {
          id: userData.id,
          nombre_completo: userData.nombre_completo,
          correo: userData.correo,
          usuario: userData.usuario,
          tipo_usuario: userData.tipo_usuario,
          telefono: userData.telefono,
          rol: this.mapTipoUsuarioToRol(userData.tipo_usuario)
        };

        // Verificar dónde está almacenado y actualizar
        if (localStorage.getItem('cloudtech_user')) {
          localStorage.setItem('cloudtech_user', JSON.stringify(userToStore));
        } else {
          sessionStorage.setItem('cloudtech_user', JSON.stringify(userToStore));
        }

        return {
          success: true,
          user: userToStore
        };
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      
      // Limpiar datos locales si hay error
      this.clearLocalUserData();
      
      return {
        success: false,
        message: 'No autenticado'
      };
    }
  }

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      // Siempre limpiar datos locales
      this.clearLocalUserData();
    }
  }

  // Logout de todas las sesiones
  async logoutAll() {
    try {
      await api.post('/auth/logout-all');

    } catch (error) {
      console.error('❌ Error en logout all:', error);
    } finally {
      this.clearLocalUserData();
    }
  }

  // Renovar token (heartbeat)
  async renewToken() {
    try {
      const response = await api.get('/auth/heartbeat');
      
      if (response.data.success) {
        return {
          success: true,
          expiresAt: response.data.data.expiresAt
        };
      }
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      return {
        success: false,
        message: 'Error renovando sesión'
      };
    }
  }

  // Obtener sesiones activas
  async getSessions() {
    try {
      const response = await api.get('/auth/sessions');
      
      if (response.data.success) {
        return {
          success: true,
          sessions: response.data.data.sesiones
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo sesiones:', error);
      return {
        success: false,
        sessions: []
      };
    }
  }

  // Revocar sesión específica
  async revokeSession(sessionId) {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      return {
        success: true,
        message: 'Sesión revocada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error revocando sesión:', error);
      return {
        success: false,
        message: 'Error revocando sesión'
      };
    }
  }

  // Obtener usuario actual desde localStorage/sessionStorage
  getCurrentUser() {
    const user = localStorage.getItem('cloudtech_user') || 
                 sessionStorage.getItem('cloudtech_user');
    
    if (user) {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('❌ Error parseando usuario:', error);
        this.clearLocalUserData();
        return null;
      }
    }
    
    return null;
  }

  // Verificar si está logueado
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Limpiar datos locales
  clearLocalUserData() {
    localStorage.removeItem('cloudtech_user');
    localStorage.removeItem('cloudtech_remember');
    sessionStorage.removeItem('cloudtech_user');
  }

  // Mapear tipo_usuario del backend a rol numérico para compatibilidad
  mapTipoUsuarioToRol(tipoUsuario) {
    const mapping = {
      'admin': 1,
      'vendedor': 2,
      'super_usuario': 3
    };
    
    return mapping[tipoUsuario] || 2; // Default vendedor
  }

  // Mapear rol numérico a tipo_usuario
  mapRolToTipoUsuario(rol) {
    const mapping = {
      1: 'admin',
      2: 'vendedor',
      3: 'super_usuario'
    };
    
    return mapping[rol] || 'vendedor';
  }

  // Redirigir según el tipo de usuario
  getRedirectPath(tipoUsuario) {
    const redirects = {
      'admin': '/admin/dashboard',
      'vendedor': '/vendedor/dashboard',
      'super_usuario': '/super/dashboard'
    };
    
    return redirects[tipoUsuario] || '/vendedor/dashboard';
  }

  // Iniciar heartbeat automático
  startHeartbeat(intervalMinutes = 5) {
    // Limpiar interval previo si existe
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        const result = await this.renewToken();
        
        if (!result.success) {
          console.warn('⚠️ Heartbeat falló, cerrando sesión');
          await this.logout();
          
          // Redirigir a login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }, intervalMinutes * 60 * 1000);

  }

  // Detener heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Forgot Password - NUEVO MÉTODO
async forgotPassword(email) {
  try {
    
    const response = await api.post('/auth/forgot-password', {
      email
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
  } catch (error) {
    console.error('❌ Error en forgot password:', error);
    
    let message = 'Error enviando email de recuperación';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    
    return {
      success: false,
      message: message
    };
  }
}
}



// Exportar instancia única
export default new AuthService();