<template>
  <div id="app">
    <router-view @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import authService from '@/services/auth';

export default {
  name: 'App',
  async mounted() {
    // Verificar autenticación al cargar la app
    await this.checkAuthentication();
    
    // Configurar listener para cambios de visibilidad (para heartbeat)
    this.setupVisibilityListener();
  },
  
  methods: {
    handleLoginSuccess(userData) {
      console.log('✅ Usuario logueado desde App:', userData);
      
      // Aquí puedes hacer cualquier configuración global post-login
      // Por ejemplo, configurar interceptores adicionales, analytics, etc.
    },
    
    async checkAuthentication() {
      const currentRoute = this.$route.path;
      
      // Si estamos en login, no verificar
      if (currentRoute === '/login') {
        return;
      }
      
      try {
        // Verificar autenticación con el backend
        const result = await authService.checkAuth();
        
        if (result.success) {
          
          // Iniciar heartbeat si no está activo
          authService.startHeartbeat(5);
          
          // Verificar si está en la ruta correcta según su rol
          const expectedPath = authService.getRedirectPath(result.user.tipo_usuario);
          
          if (currentRoute === '/' || currentRoute === '') {
            this.$router.push(expectedPath);
          }
          
        } else {
          
          // Detener heartbeat
          authService.stopHeartbeat();
          
          // Redirigir a login
          this.$router.push('/login');
        }
        
      } catch (error) {
        console.error('💥 Error verificando autenticación:', error);
        
        // En caso de error, redirigir a login por seguridad
        authService.stopHeartbeat();
        this.$router.push('/login');
      }
    },
    
    setupVisibilityListener() {
      // Manejar cuando la página se vuelve visible (para renovar token si es necesario)
      document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && authService.isAuthenticated()) {
          
          try {
            const result = await authService.renewToken();
            
            if (!result.success) {
              console.warn('⚠️ Token no se pudo renovar, cerrando sesión');
              await this.handleSessionExpired();
            }
          } catch (error) {
            console.error('❌ Error renovando token:', error);
            await this.handleSessionExpired();
          }
        }
      });
    },
    
    async handleSessionExpired() {
      
      // Cerrar sesión
      await authService.logout();
      
      // Redirigir a login
      this.$router.push('/login');
      
      // Opcional: mostrar notificación
      // this.showNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  },
  
  watch: {
    // Observar cambios en la ruta para verificar autenticación
    '$route'(to, from) {
      console.log('🛣️ Cambio de ruta:', from.path, '→', to.path);
      
      // Solo verificar si no vamos a login
      if (to.path !== '/login') {
        this.checkAuthentication();
      }
    }
  },
  
  beforeUnmount() {
    // Limpiar listeners y detener heartbeat al destruir el componente
    authService.stopHeartbeat();
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fa;
  line-height: 1.6;
  color: #333;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Variables globales */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --success-color: #27ae60;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  
  --sidebar-width: 280px;
  --header-height: 70px;
  
  --border-radius: 0.5rem;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Clases utilitarias globales */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--box-shadow);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background: #1a252f;
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover {
  background: #219a52;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: var(--primary-color);
}

.text-success {
  color: var(--success-color);
}

.text-danger {
  color: var(--danger-color);
}

.text-warning {
  color: var(--warning-color);
}

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }
.p-4 { padding: 2rem; }

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-center {
  justify-content: center;
}

.gap-1 { gap: 0.5rem; }
.gap-2 { gap: 1rem; }
.gap-3 { gap: 1.5rem; }

/* Responsive utilities */
@media (max-width: 768px) {
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
  
  .card {
    padding: 1rem;
  }
}

/* Scrollbar personalizada global */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animaciones globales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Estados de loading */
.loading {
  pointer-events: none;
  opacity: 0.6;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus styles mejorados */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Mejoras de accesibilidad */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Transiciones suaves para el cambio de tema */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

/* Estilos específicos para el login */
.login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Animación para las transiciones entre páginas */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>