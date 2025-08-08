// services/auth.js
import api from './api';

class AuthService {
 constructor() {
   this.heartbeatInterval = null;
   this.tokenCheckInterval = null;
   this.isHeartbeatRunning = false;
 }
 
 // Login con el backend real
 async login(usuario, password, recordar = false) {
   try {
     console.log('🔍 Antes del login - cookies:', document.cookie);
     
     const response = await api.post('/auth/login', {
       usuario,
       password
     });

     if (response.data.success) {
       // ✅ DEBUG DESPUÉS DEL LOGIN
       console.log('🔍 Después del login:');
       console.log('📋 Response headers:', response.headers);
       console.log('🍪 Document cookies después:', document.cookie);
       console.log('🏠 Current domain:', window.location.hostname);
       console.log('🌐 Current protocol:', window.location.protocol);
       
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

       // 🆕 Iniciar heartbeat optimizado después del login exitoso
       this.startOptimizedHeartbeat();

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
     // 🆕 Siempre limpiar datos locales y detener heartbeat
     this.stopHeartbeat();
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
     // 🆕 Detener heartbeat y limpiar datos
     this.stopHeartbeat();
     this.clearLocalUserData();
   }
 }

 // 🆕 PING AL SERVIDOR (SIN BD)
 async pingServer() {
   try {
     // Usar endpoint que NO toca la base de datos
     const response = await api.get('/auth/ping');
     
     if (response.data.success) {
       return {
         success: true,
         needsRenewal: response.data.needsRenewal,
         expiresIn: response.data.expiresIn
       };
     }
   } catch (error) {
     console.error('❌ Error en ping:', error);
     return {
       success: false,
       message: 'Error conectando al servidor'
     };
   }
 }

 // 🆕 RENOVAR TOKEN SOLO CUANDO SEA NECESARIO
 async renewTokenWhenNeeded() {
   try {
     const response = await api.post('/auth/renew');
     
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

 // Renovar token (heartbeat) - MÉTODO ORIGINAL MANTENIDO PARA COMPATIBILIDAD
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

 // 🆕 HEARTBEAT INTELIGENTE Y OPTIMIZADO
 startOptimizedHeartbeat() {
   // Limpiar intervals previos
   this.stopHeartbeat();
   
   if (this.isHeartbeatRunning) return;
   this.isHeartbeatRunning = true;

   console.log('🔄 Iniciando heartbeat optimizado');

   // ✅ CAMBIO: 5 minutos en lugar de 2 minutos
   this.heartbeatInterval = setInterval(async () => {
     if (!this.isAuthenticated()) {
       this.stopHeartbeat();
       return;
     }

     // Solo si la pestaña está visible
     if (document.hidden) return;

     try {
       // ✅ Usar /auth/me en lugar de ping
       const response = await api.get('/auth/me');
       
       if (!response.data.success) {
         console.warn('⚠️ Verificación de auth falló');
         await this.logout();
         this.redirectToLogin();
       }
     } catch (error) {
       console.error('❌ Error en heartbeat:', error);
       
       // Solo logout si es un error 401/403
       if (error.response?.status === 401 || error.response?.status === 403) {
         console.log('🚨 Sesión inválida, cerrando...');
         await this.logout();
         this.redirectToLogin();
       }
     }

   }, 300000); // ✅ 5 minutos en lugar de 2

   // ✅ Renovación cada 30 minutos
   this.tokenCheckInterval = setInterval(async () => {
     if (!this.isAuthenticated() || document.hidden) return;

     try {
       await this.renewToken();
       console.log('🔄 Token renovado automáticamente');
     } catch (error) {
       console.error('❌ Error renovando token:', error);
     }
   }, 1800000); // ✅ 30 minutos
 }

 // Detener heartbeat
 stopHeartbeat() {
   if (this.heartbeatInterval) {
     clearInterval(this.heartbeatInterval);
     this.heartbeatInterval = null;
   }
   
   if (this.tokenCheckInterval) {
     clearInterval(this.tokenCheckInterval);
     this.tokenCheckInterval = null;
   }
   
   this.isHeartbeatRunning = false;
   console.log('🛑 Heartbeat detenido');
 }

 // 🆕 Método auxiliar para redirección
 redirectToLogin() {
   if (window.location.pathname !== '/login') {
     window.location.href = '/login';
   }
 }

 // 🆕 REEMPLAZAR el método startHeartbeat original
 startHeartbeat() {
   console.warn('⚠️ startHeartbeat deprecado, usando startOptimizedHeartbeat');
   this.startOptimizedHeartbeat();
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

 // Forgot Password - MÉTODO EXISTENTE
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