<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Logo y título -->
      <div class="login-header">
        <div class="logo-login">
          <span class="logo-circle">P</span>
          <div class="brand-info">
            <h1 class="brand-name">Perdomo y Asociados</h1>
          </div>
        </div>
        <p class="login-subtitle">Sistema de Cotización</p>
      </div>

      <!-- Formulario de Login -->
      <div class="login-form-container" v-if="currentView === 'login'">
        <h2 class="form-title">Iniciar Sesión</h2>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Campo Usuario/Email -->
          <div class="form-group">
            <label for="usuario" class="form-label">Usuario o Email</label>
            <div class="input-container">
              <i class="fas fa-user input-icon"></i>
              <input
                id="usuario"
                v-model="loginForm.usuario"
                type="text"
                class="form-input"
                :class="{ 'error': errors.usuario }"
                placeholder="Ingresa tu usuario o email"
                required
              />
            </div>
            <span v-if="errors.usuario" class="error-message">{{ errors.usuario }}</span>
          </div>

          <!-- Campo Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-container">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="Ingresa tu contraseña"
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

          <!-- Recordar y Olvidé contraseña -->
          <div class="form-options">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                v-model="loginForm.recordar"
                class="checkbox-input"
              />
              <span class="checkbox-mark"></span>
              Recordar sesión
            </label>
            <button
              type="button"
              class="forgot-link"
              @click="currentView = 'forgot'"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="generalError" class="alert alert-error">
            <i class="fas fa-exclamation-triangle alert-icon"></i>
            {{ generalError }}
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            class="btn-login"
            :disabled="isLoading"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="!isLoading">Iniciar Sesión</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </form>

        <!-- Información de usuarios de prueba -->
        <div class="demo-users">
          <h3 class="demo-title">Usuarios de Prueba:</h3>
          <div class="demo-grid">
            <div class="demo-user">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div class="demo-user">
              <strong>Vendedor:</strong> carlos / carlos123
            </div>
            <div class="demo-user">
              <strong>SuperUser:</strong> super / super123
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de Recuperación -->
      <div class="login-form-container" v-if="currentView === 'forgot'">
        <h2 class="form-title">Recuperar Contraseña</h2>
        <p class="form-description">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <form @submit.prevent="handleForgotPassword" class="login-form">
          <!-- Campo Email -->
          <div class="form-group">
            <label for="email-forgot" class="form-label">Email</label>
            <div class="input-container">
              <i class="fas fa-envelope input-icon"></i>
              <input
                id="email-forgot"
                v-model="forgotForm.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="tu@email.com"
                required
              />
            </div>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="emailSent" class="alert alert-success">
            <i class="fas fa-check-circle alert-icon"></i>
            Se ha enviado un enlace de recuperación a tu email.
          </div>

          <!-- Mensaje de error -->
          <div v-if="generalError" class="alert alert-error">
            <i class="fas fa-exclamation-triangle alert-icon"></i>
            {{ generalError }}
          </div>

          <!-- Botones -->
          <div class="form-buttons">
            <button
              type="button"
              class="btn-secondary"
              @click="goBackToLogin"
            >
              Volver al Login
            </button>
            <button
              type="submit"
              class="btn-login"
              :disabled="isLoading || emailSent"
              :class="{ 'loading': isLoading }"
            >
              <span v-if="!isLoading">Enviar Enlace</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Decoración de fondo profesional -->
    <div class="background-decoration">
      <div class="geometric-pattern"></div>
      <div class="grid-overlay"></div>
      <div class="accent-line accent-line-1"></div>
      <div class="accent-line accent-line-2"></div>
      <div class="floating-elements">
        <div class="element element-1"></div>
        <div class="element element-2"></div>
        <div class="element element-3"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      currentView: 'login', // 'login' o 'forgot'
      showPassword: false,
      isLoading: false,
      emailSent: false,
      generalError: '',
      loginForm: {
        usuario: '',
        password: '',
        recordar: false
      },
      forgotForm: {
        email: ''
      },
      errors: {},
      // Usuarios simulados ampliados
      usuarios: [
        // ADMINISTRADORES (Rol 1)
        {
          id: 1,
          usuario: 'admin',
          email: 'admin@cloudtech.com',
          password: 'admin123',
          nombre: 'Juan Pérez',
          rol: 1,
          iniciales: 'JP',
          rolTexto: 'Administrador',
          departamento: 'Administración',
          activo: true
        },
        {
          id: 2,
          usuario: 'director',
          email: 'director@cloudtech.com',
          password: 'director123',
          nombre: 'María González',
          rol: 1,
          iniciales: 'MG',
          rolTexto: 'Directora',
          departamento: 'Dirección General',
          activo: true
        },

        // VENDEDORES (Rol 2)
        {
          id: 3,
          usuario: 'carlos',
          email: 'carlos@cloudtech.com',
          password: 'carlos123',
          nombre: 'Carlos Mendoza',
          rol: 2,
          iniciales: 'CM',
          rolTexto: 'Vendedor',
          departamento: 'Ventas',
          activo: true
        },
        {
          id: 4,
          usuario: 'ana',
          email: 'ana.torres@cloudtech.com',
          password: 'ana123',
          nombre: 'Ana Torres',
          rol: 2,
          iniciales: 'AT',
          rolTexto: 'Vendedora',
          departamento: 'Ventas',
          activo: true
        },
        {
          id: 5,
          usuario: 'luis',
          email: 'luis.rodriguez@cloudtech.com',
          password: 'luis123',
          nombre: 'Luis Rodríguez',
          rol: 2,
          iniciales: 'LR',
          rolTexto: 'Vendedor Senior',
          departamento: 'Ventas',
          activo: true
        },
        {
          id: 6,
          usuario: 'sofia',
          email: 'sofia.martinez@cloudtech.com',
          password: 'sofia123',
          nombre: 'Sofía Martínez',
          rol: 2,
          iniciales: 'SM',
          rolTexto: 'Ejecutiva de Ventas',
          departamento: 'Ventas',
          activo: true
        },

        // LICENCIADOS SUPERUSUARIOS (Rol 3)
        {
          id: 7,
          usuario: 'super',
          email: 'super@cloudtech.com',
          password: 'super123',
          nombre: 'Roberto Fernández',
          rol: 3,
          iniciales: 'RF',
          rolTexto: 'SuperUsuario',
          departamento: 'Supervisión',
          activo: true
        },
        {
          id: 8,
          usuario: 'licenciado',
          email: 'licenciado@cloudtech.com',
          password: 'lic123',
          nombre: 'Patricia Vargas',
          rol: 3,
          iniciales: 'PV',
          rolTexto: 'Supervisor',
          departamento: 'Supervisión',
          activo: true
        },
        {
          id: 9,
          usuario: 'supervisor',
          email: 'supervisor@cloudtech.com',
          password: 'sup123',
          nombre: 'Miguel Herrera',
          rol: 3,
          iniciales: 'MH',
          rolTexto: 'SuperUsuario',
          departamento: 'Supervisión',
          activo: true
        },

        // USUARIOS DE PRUEBA ADICIONALES
        {
          id: 10,
          usuario: 'demo',
          email: 'demo@cloudtech.com',
          password: 'demo123',
          nombre: 'Usuario Demo',
          rol: 2,
          iniciales: 'UD',
          rolTexto: 'Demo Vendedor',
          departamento: 'Pruebas',
          activo: true
        },
        {
          id: 11,
          usuario: 'test',
          email: 'test@cloudtech.com',
          password: 'test123',
          nombre: 'Usuario Test',
          rol: 1,
          iniciales: 'UT',
          rolTexto: 'Test Admin',
          departamento: 'Pruebas',
          activo: false // Usuario desactivado para pruebas
        }
      ]
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    goBackToLogin() {
      this.currentView = 'login';
      this.emailSent = false;
      this.generalError = '';
      this.errors = {};
      this.forgotForm.email = '';
    },
    
    validateLogin() {
      this.errors = {};
      
      if (!this.loginForm.usuario.trim()) {
        this.errors.usuario = 'El usuario o email es requerido';
      }
      
      if (!this.loginForm.password.trim()) {
        this.errors.password = 'La contraseña es requerida';
      } else if (this.loginForm.password.length < 6) {
        this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
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
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Buscar usuario
        const usuario = this.usuarios.find(u => 
          (u.usuario.toLowerCase() === this.loginForm.usuario.toLowerCase() || 
           u.email.toLowerCase() === this.loginForm.usuario.toLowerCase()) &&
          u.password === this.loginForm.password
        );
        
        if (usuario) {
          // Verificar si el usuario está activo
          if (!usuario.activo) {
            this.generalError = 'Tu cuenta está desactivada. Contacta al administrador.';
            return;
          }

          // Login exitoso
          const userData = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            iniciales: usuario.iniciales,
            email: usuario.email,
            rolTexto: usuario.rolTexto,
            departamento: usuario.departamento
          };
          
          // Guardar en localStorage si recordar está marcado
          if (this.loginForm.recordar) {
            localStorage.setItem('cloudtech_user', JSON.stringify(userData));
            localStorage.setItem('cloudtech_remember', 'true');
          } else {
            sessionStorage.setItem('cloudtech_user', JSON.stringify(userData));
          }
          
          // Emitir evento de login exitoso
          this.$emit('login-success', userData);
          
          // Redirigir según el rol
          this.redirectByRole(usuario.rol);
          
        } else {
          this.generalError = 'Usuario o contraseña incorrectos';
        }
        
      } catch (error) {
        this.generalError = 'Error de conexión. Intenta nuevamente.';
        console.error('Error en login:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleForgotPassword() {
      if (!this.validateEmail()) return;
      
      this.isLoading = true;
      this.generalError = '';
      
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar si el email existe
        const usuario = this.usuarios.find(u => 
          u.email.toLowerCase() === this.forgotForm.email.toLowerCase()
        );
        
        if (usuario) {
          // Simular envío de email
          console.log(`Enviando email de recuperación a: ${this.forgotForm.email}`);
          console.log(`Usuario encontrado: ${usuario.nombre} (${usuario.rolTexto})`);
          this.emailSent = true;
        } else {
          this.generalError = 'No se encontró una cuenta con este email';
        }
        
      } catch (error) {
        this.generalError = 'Error al enviar el email. Intenta nuevamente.';
        console.error('Error en forgot password:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    redirectByRole(rol) {
      switch(rol) {
        case 1: // Administrador
          this.$router.push('/admin/dashboard');
          break;
        case 2: // Vendedor
          this.$router.push('/vendedor/dashboard');
          break;
        case 3: // SuperUsuario
          this.$router.push('/super/dashboard');
          break;
        default:
          this.$router.push('/vendedor/dashboard');
      }
    }
  },
  
  mounted() {
    // Verificar si hay sesión guardada
    const rememberedUser = localStorage.getItem('cloudtech_user');
    const sessionUser = sessionStorage.getItem('cloudtech_user');
    
    if (rememberedUser || sessionUser) {
      const userData = JSON.parse(rememberedUser || sessionUser);
      this.$emit('login-success', userData);
      this.redirectByRole(userData.rol);
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #334155 35%, #475569 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

/* Patrón geométrico sutil */
.geometric-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%), 
    linear-gradient(-45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%), 
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%);
  background-size: 60px 60px;
  background-position: 0 0, 0 30px, 30px -30px, -30px 0px;
}

/* Grid overlay profesional */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100px 100px;
}

/* Líneas de acento elegantes */
.accent-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  height: 1px;
}

.accent-line-1 {
  top: 20%;
  left: 0;
  right: 0;
  animation: pulse-line 4s ease-in-out infinite;
}

.accent-line-2 {
  bottom: 30%;
  left: 0;
  right: 0;
  animation: pulse-line 4s ease-in-out infinite 2s;
}

/* Elementos flotantes sutiles */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
}

.element-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 5%;
  animation: float-professional 12s ease-in-out infinite;
}

.element-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 8%;
  animation: float-professional 15s ease-in-out infinite reverse;
}

.element-3 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 15%;
  animation: float-professional 18s ease-in-out infinite;
}

@keyframes float-professional {
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
  33% { transform: translateY(-15px) translateX(10px) rotate(120deg); opacity: 0.5; }
  66% { transform: translateY(10px) translateX(-5px) rotate(240deg); opacity: 0.2; }
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50% { opacity: 0.6; transform: scaleX(1); }
}

.login-wrapper {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(25px);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4af37, #f4d03f, #d4af37);
  border-radius: 16px 16px 0 0;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-size: 1.8rem;
  font-weight: bold;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 0 2px #d4af37,
    inset 0 2px 4px rgba(212, 175, 55, 0.2);
}

.brand-name {
  font-size: 2.2rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-description {
  color: #64748b;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #64748b;
  font-size: 1rem;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
}

.form-input:focus ~ .input-icon {
  color: #1e293b;
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.toggle-password:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1e293b;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e293b;
}

.checkbox-input {
  display: none;
}

.checkbox-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-mark {
  background: #1e293b;
  border-color: #1e293b;
}

.checkbox-input:checked + .checkbox-mark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.forgot-link {
  background: none;
  border: none;
  color: #1e293b;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #334155;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.alert-error {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0fdf4;
  color: #22c55e;
  border: 1px solid #bbf7d0;
}

.alert-icon {
  font-size: 1.1rem;
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.25);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 1rem 2rem;
  background: #64748b;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.form-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-buttons .btn-login {
  flex: 1;
  min-width: 150px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Sección de usuarios demo */
.demo-users {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(30, 41, 59, 0.1);
}

.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.demo-grid {
  display: grid;
  gap: 0.75rem;
}

.demo-user {
  font-size: 0.85rem;
  color: #334155;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  text-align: center;
  border: 1px solid rgba(30, 41, 59, 0.05);
}

.demo-user strong {
  color: #1e293b;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-wrapper {
    padding: 2rem;
  }
  
  .logo-login {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .brand-name {
    font-size: 1.8rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-buttons {
    flex-direction: column;
  }

  .demo-grid {
    gap: 0.5rem;
  }
  
  .element-1, .element-2, .element-3 {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 1.5rem;
  }
  
  .logo-circle {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .brand-name {
    font-size: 1.6rem;
  }

  .demo-users {
    padding: 1rem;
  }
  
  .geometric-pattern {
    background-size: 40px 40px;
  }
  
  .grid-overlay {
    background-size: 60px 60px;
  }
}

/* Mejoras adicionales para la profesionalidad */
.login-wrapper {
  position: relative;
  overflow: hidden;
}

.login-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
}

/* Efecto de profundidad en el formulario */
.login-form-container {
  position: relative;
}

.login-form-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 20px;
  z-index: -1;
  filter: blur(10px);
}

/* Animaciones mejoradas */
.login-wrapper {
  animation: fadeInUp 0.6s ease-out;
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

/* Efectos de hover mejorados */
.form-input:hover {
  border-color: #cbd5e1;
}

.checkbox-container:hover .checkbox-mark {
  border-color: #1e293b;
  transform: scale(1.05);
}

/* Estados de focus mejorados para accesibilidad */
.form-input:focus,
.btn-login:focus,
.btn-secondary:focus,
.forgot-link:focus,
.toggle-password:focus {
  outline: 2px solid #1e293b;
  outline-offset: 2px;
}

/* Sombras más sutiles y profesionales */
.logo-circle:hover {
  transform: scale(1.05);
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.4),
    0 0 0 3px #d4af37,
    inset 0 2px 4px rgba(212, 175, 55, 0.3);
}

/* Transición suave para cambios de vista */
.login-form-container {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>