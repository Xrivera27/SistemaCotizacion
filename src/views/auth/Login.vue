<template>
  <div class="login-container">
    <!-- Background decoration -->
    <div class="background-decoration">
      <div class="geometric-pattern"></div>
      <div class="floating-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <div class="login-wrapper" v-if="currentView === 'login'">
      <!-- Logo y Header -->
      <div class="login-header">
        <div class="logo-container">
          <img 
            src="https://perdomoyasociados.com/wp-content/uploads/2023/09/logo_perdomo_2023_dorado-768x150.png" 
            alt="Perdomo y Asociados - Auditores y Consultores"
            class="company-logo-img"
            @error="handleImageError"
          />
        </div>
        <p class="brand-subtitle">Sistema de Cotización</p>
        <div class="access-text">
          <p>Acceso seguro al sistema</p>
        </div>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Campo Usuario -->
        <div class="form-group">
          <label for="usuario" class="form-label">USUARIO</label>
          <input
            id="usuario"
            v-model="loginForm.usuario"
            type="text"
            class="form-input"
            :class="{ 'error': errors.usuario }"
            placeholder="Ingrese su usuario"
            required
          />
          <span v-if="errors.usuario" class="error-message">{{ errors.usuario }}</span>
        </div>

        <!-- Campo Contraseña -->
        <div class="form-group">
          <label for="password" class="form-label">CONTRASEÑA</label>
          <div class="password-container">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': errors.password }"
              placeholder="Ingrese su contraseña"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <!-- Mensaje de error general -->
        <div v-if="generalError" class="alert alert-error">
          <i class="fas fa-exclamation-triangle alert-icon"></i>
          {{ generalError }}
        </div>

        <!-- Botón de Login -->
        <button
          type="submit"
          class="btn-login"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="!isLoading">INGRESAR AL SISTEMA</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <!-- Link de contraseña olvidada -->
        <div class="forgot-password">
          <button
            type="button"
            class="forgot-link"
            @click="currentView = 'forgot'"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>

      <!-- Usuarios de prueba -->
      <div class="demo-users">
        <h3 class="demo-title">Usuarios de Prueba</h3>
        <div class="demo-grid">
          <div class="demo-user">
            <span class="demo-label">Admin:</span>
            <span class="demo-credentials">admin / Admin123.</span>
          </div>
          <div class="demo-user">
            <span class="demo-label">Vendedor:</span>
            <span class="demo-credentials">juan.perez / 123456</span>
          </div>
          <div class="demo-user">
            <span class="demo-label">SuperUser:</span>
            <span class="demo-credentials">roberto.super / super123</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de Recuperación -->
    <div class="login-wrapper" v-if="currentView === 'forgot'">
      <div class="login-header">
        <div class="logo-container">
          <img 
            src="https://perdomoyasociados.com/wp-content/uploads/2023/09/logo_perdomo_2023_dorado-768x150.png" 
            alt="Perdomo y Asociados - Auditores y Consultores"
            class="company-logo-img"
            @error="handleImageError"
          />
        </div>
        <p class="brand-subtitle">Recuperar Contraseña</p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="login-form">
        <div class="form-group">
          <label for="email-forgot" class="form-label">EMAIL</label>
          <input
            id="email-forgot"
            v-model="forgotForm.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="Ingrese su email"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="emailSent" class="alert alert-success">
          <i class="fas fa-check-circle alert-icon"></i>
          {{ successMessage }}
        </div>

        <!-- Mensaje de error -->
        <div v-if="generalError" class="alert alert-error">
          <i class="fas fa-exclamation-triangle alert-icon"></i>
          {{ generalError }}
        </div>

        <button
          type="submit"
          class="btn-login"
          :disabled="isLoading || emailSent"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="!isLoading">ENVIAR CONTRASEÑA TEMPORAL</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <div class="forgot-password">
          <button
            type="button"
            class="forgot-link"
            @click="goBackToLogin"
          >
            Volver al login
          </button>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Sistema de cotizacion v1.0 © 2025 Perdomo y Asociados</p>
    </div>
  </div>
</template>

<script>
import authService from '@/services/auth';

export default {
  name: 'LoginView',
  data() {
    return {
      currentView: 'login', // 'login' o 'forgot'
      showPassword: false,
      isLoading: false,
      emailSent: false,
      successMessage: '',
      generalError: '',
      loginForm: {
        usuario: '',
        password: '',
        recordar: false
      },
      forgotForm: {
        email: ''
      },
      errors: {}
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    handleImageError(event) {
      // Fallback en caso de que la imagen no cargue
      console.log('Error cargando imagen del logo');
      // Crear un fallback visual simple
      event.target.style.display = 'none';
      // Opcional: mostrar texto alternativo
      const fallback = document.createElement('div');
      fallback.innerHTML = '<div class="logo-fallback">PERDOMO Y ASOCIADOS<br><small>Auditores y Consultores</small></div>';
      event.target.parentNode.appendChild(fallback);
    },
    
    goBackToLogin() {
      this.currentView = 'login';
      this.emailSent = false;
      this.successMessage = '';
      this.generalError = '';
      this.errors = {};
      this.forgotForm.email = '';
    },
    
    validateLogin() {
      this.errors = {};
      
      if (!this.loginForm.usuario.trim()) {
        this.errors.usuario = 'El usuario es requerido';
      }
      
      if (!this.loginForm.password.trim()) {
        this.errors.password = 'La contraseña es requerida';
      } else if (this.loginForm.password.length < 6) {
        this.errors.password = 'Mínimo 6 caracteres';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    validateEmail() {
      this.errors = {};
      
      if (!this.forgotForm.email.trim()) {
        this.errors.email = 'El email es requerido';
      } else if (!this.isValidEmail(this.forgotForm.email)) {
        this.errors.email = 'Ingresa un email válido';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    async handleLogin() {
      if (!this.validateLogin()) return;
      
      this.isLoading = true;
      this.generalError = '';
      
      try {
        console.log('🔐 Iniciando login con backend real...');
        
        // Hacer login real con el backend
        const result = await authService.login(
          this.loginForm.usuario,
          this.loginForm.password,
          this.loginForm.recordar
        );
        
        if (result.success) {
          console.log('✅ Login exitoso:', result.user);
          
          // Emitir evento de login exitoso
          this.$emit('login-success', result.user);
          
          // Iniciar heartbeat automático
          authService.startHeartbeat(5); // cada 5 minutos
          
          // Redirigir según el tipo de usuario
          const redirectPath = authService.getRedirectPath(result.user.tipo_usuario);
          console.log('🔀 Redirigiendo a:', redirectPath);
          
          this.$router.push(redirectPath);
          
        } else {
          console.error('❌ Login falló:', result.message);
          this.generalError = result.message || 'Usuario o contraseña incorrectos';
        }
        
      } catch (error) {
        console.error('💥 Error inesperado en login:', error);
        this.generalError = 'Error de conexión. Verifica que el servidor esté funcionando.';
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleForgotPassword() {
      if (!this.validateEmail()) return;
      
      this.isLoading = true;
      this.generalError = '';
      this.successMessage = '';
      
      try {
        console.log(`📧 Enviando email de recuperación a: ${this.forgotForm.email}`);
        
        // Usar el método real del authService
        const result = await authService.forgotPassword(this.forgotForm.email);
        
        if (result.success) {
          console.log('✅ Email enviado exitosamente');
          this.emailSent = true;
          this.successMessage = result.message;
          this.generalError = ''; // Limpiar errores
        } else {
          console.error('❌ Error enviando email:', result.message);
          this.generalError = result.message;
          this.emailSent = false;
        }
        
      } catch (error) {
        console.error('💥 Error inesperado en forgot password:', error);
        this.generalError = 'Error de conexión. Verifica que el servidor esté funcionando.';
        this.emailSent = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async checkExistingAuth() {
      console.log('🔍 Verificando autenticación existente...');
      
      try {
        // Verificar si hay sesión válida en el backend
        const result = await authService.checkAuth();
        
        if (result.success) {
          console.log('✅ Sesión válida encontrada:', result.user);
          
          // Emitir evento de login exitoso
          this.$emit('login-success', result.user);
          
          // Iniciar heartbeat
          authService.startHeartbeat(5);
          
          // Redirigir según el tipo de usuario
          const redirectPath = authService.getRedirectPath(result.user.tipo_usuario);
          this.$router.push(redirectPath);
          
          return true;
        } else {
          console.log('❌ No hay sesión válida');
          // Limpiar cualquier dato local inválido
          authService.clearLocalUserData();
          return false;
        }
        
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        authService.clearLocalUserData();
        return false;
      }
    }
  },
  
  async mounted() {
    console.log('🚀 Login component mounted');
    
    // Verificar si ya hay una sesión activa
    await this.checkExistingAuth();
  },
  
  beforeUnmount() {
    // Detener heartbeat si el componente se desmonta
    authService.stopHeartbeat();
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* Decoración de fondo */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.geometric-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
}

.floating-orbs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.03);
  backdrop-filter: blur(20px);
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: 15%;
  animation-delay: 7s;
}

.orb-3 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  33% { transform: translateY(-20px) translateX(15px); opacity: 0.6; }
  66% { transform: translateY(10px) translateX(-10px); opacity: 0.2; }
}

/* Container principal */
.login-wrapper {
  background: #2a2a2a;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(212, 175, 55, 0.1);
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-container {
  margin-bottom: 1.5rem;
}

/* Logo de la empresa - Imagen real con proporción correcta */
.company-logo-img {
  width: 250px;
  height: auto;
  max-width: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.02);
  padding: 0.75rem;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
}

.company-logo-img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
}

/* Fallback para logo */
.logo-fallback {
  color: #d4af37;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.logo-fallback small {
  font-size: 0.8rem;
  font-weight: normal;
  color: #b0b0b0;
}

.brand-subtitle {
  color: #ffffff;
  font-size: 1.2rem;
  margin: 1rem 0;
  font-weight: 600;
}

.access-text {
  margin-top: 1rem;
}

.access-text p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* Formulario */
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: #d4af37;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 1rem;
  background: #3a3a3a;
  border: 1px solid #555;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
}

.form-input::placeholder {
  color: #888;
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.password-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #d4af37;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* Alertas */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.alert-icon {
  font-size: 1.1rem;
}

/* Botón principal */
.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #d4af37, #f4d03f);
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  letter-spacing: 0.5px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
  background: linear-gradient(135deg, #f4d03f, #d4af37);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(26, 26, 26, 0.3);
  border-top: 2px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Link de contraseña olvidada */
.forgot-password {
  text-align: center;
  margin-top: 1.5rem;
}

.forgot-link {
  background: none;
  border: none;
  color: #d4af37;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
}

.forgot-link:hover {
  color: #f4d03f;
  text-decoration: underline;
}

/* Usuarios de prueba */
.demo-users {
  padding: 1.5rem;
  background: rgba(26, 26, 26, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.demo-title {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.demo-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-user {
  background: rgba(58, 58, 58, 0.5);
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
}

.demo-label {
  color: #d4af37;
  font-weight: 600;
}

.demo-credentials {
  color: #b0b0b0;
  margin-left: 0.5rem;
}

/* Footer */
.footer {
  position: relative;
  z-index: 2;
  margin-top: 2rem;
  text-align: center;
}

.footer p {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-wrapper {
    padding: 2rem;
  }
  
  .company-logo-img {
    width: 200px;
  }
  
  .brand-subtitle {
    font-size: 1.1rem;
  }
  
  .orb-1, .orb-2, .orb-3 {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 1.5rem;
  }
  
  .company-logo-img {
    width: 170px;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
  
  .demo-users {
    padding: 1rem;
  }
}
</style>
