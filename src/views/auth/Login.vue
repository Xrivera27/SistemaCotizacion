<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Logo y título -->
      <div class="login-header">
        <div class="logo-login">
          <span class="logo-circle">CT</span>
          <h1 class="brand-name">CloudTech</h1>
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
              <span class="input-icon">👤</span>
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
              <span class="input-icon">🔒</span>
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
                {{ showPassword ? '🙈' : '👁️' }}
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
            <span class="alert-icon">⚠️</span>
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
              <span class="input-icon">📧</span>
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
            <span class="alert-icon">✅</span>
            Se ha enviado un enlace de recuperación a tu email.
          </div>

          <!-- Mensaje de error -->
          <div v-if="generalError" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
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

    <!-- Decoración de fondo -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
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
          rolTexto: 'Lic. SuperUsuario',
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
          rolTexto: 'Lic. Supervisor',
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
          rolTexto: 'Lic. SuperUsuario',
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.brand-name {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3498db, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-description {
  color: #7f8c8d;
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
  color: #2c3e50;
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
  font-size: 1.2rem;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.toggle-password:hover {
  background: rgba(0, 0, 0, 0.05);
}

.error-message {
  display: block;
  color: #e74c3c;
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
  color: #2c3e50;
}

.checkbox-input {
  display: none;
}

.checkbox-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-mark {
  background: #3498db;
  border-color: #3498db;
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
  color: #3498db;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #2980b9;
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
  background: #fdf2f2;
  color: #e74c3c;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0f9ff;
  color: #27ae60;
  border: 1px solid #bfdbfe;
}

.alert-icon {
  font-size: 1.1rem;
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
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
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 1rem 2rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #7f8c8d;
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
  background: rgba(52, 152, 219, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(52, 152, 219, 0.1);
}

.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.demo-grid {
  display: grid;
  gap: 0.75rem;
}

.demo-user {
  font-size: 0.85rem;
  color: #34495e;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  text-align: center;
}

.demo-user strong {
  color: #2c3e50;
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
}
</style>