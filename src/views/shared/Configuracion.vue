<template>
  <div class="configuracion-container">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Configuración de Usuario</h1>
        <p class="page-subtitle">Administra tu información personal y configuración de cuenta</p>
      </div>
    </div>

    <div class="configuracion-content">
      <!-- Información Personal -->
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">
           <i class="fa fa-id-card section-icon" aria-hidden="true"></i>
            Información Personal
          </h2>
          <p class="section-description">Actualiza tu información personal y de contacto</p>
        </div>

        <form @submit.prevent="guardarInformacionPersonal" class="config-form">
          <div class="form-grid">
            <!-- Nombre Completo -->
            <div class="form-group">
              <label for="nombre" class="form-label">
                <span class="label-text">
                 <i class="fas fa-user label-icon"></i>
                  Nombre Completo
                </span>
                <span class="label-required">*</span>
              </label>
              <input
                id="nombre"
                v-model="formData.nombre"
                type="text"
                class="form-input"
                :class="{ 'error': errors.nombre }"
                placeholder="Ingresa tu nombre completo"
                required
              />
              <span v-if="errors.nombre" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.nombre }}
              </span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                <span class="label-text">
                  <i class="fas fa-envelope label-icon"></i>
                  Correo Electrónico
                </span>
                <span class="label-required">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="tu@email.com"
                required
              />
              <span v-if="errors.email" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.email }}
              </span>
            </div>

            <!-- Usuario -->
            <div class="form-group">
              <label for="usuario" class="form-label">
                <span class="label-text">
                  <i class="fas fa-at label-icon"></i>
                  Nombre de Usuario
                </span>
                <span class="label-required">*</span>
              </label>
              <input
                id="usuario"
                v-model="formData.usuario"
                type="text"
                class="form-input"
                :class="{ 'error': errors.usuario }"
                placeholder="Nombre de usuario único"
                required
              />
              <span v-if="errors.usuario" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.usuario }}
              </span>
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <label for="telefono" class="form-label">
                <span class="label-text">
                  <i class="fas fa-phone label-icon"></i>
                  Teléfono
                </span>
              </label>
              <input
                id="telefono"
                v-model="formData.telefono"
                type="tel"
                class="form-input"
                :class="{ 'error': errors.telefono }"
                placeholder="+504 0000-0000"
              />
              <span v-if="errors.telefono" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.telefono }}
              </span>
            </div>
          </div>

          <!-- Mensaje de éxito/error -->
          <div v-if="mensajePersonal.texto" class="alert" :class="mensajePersonal.tipo">
            <i class="fas alert-icon" 
               :class="mensajePersonal.tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'">
            </i>
            {{ mensajePersonal.texto }}
          </div>

          <!-- Botones -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-danger"
              @click="cancelarCambiosPersonales"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-success"
              :disabled="isLoadingPersonal"
              :class="{ 'loading': isLoadingPersonal }"
            >
              <span v-if="!isLoadingPersonal">
                Guardar Cambios
              </span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <!-- Cambiar Contraseña -->
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-lock section-icon"></i>
            Cambiar Contraseña
          </h2>
          <p class="section-description">Actualiza tu contraseña para mantener tu cuenta segura</p>
        </div>

        <form @submit.prevent="cambiarContrasena" class="config-form">
          <div class="form-grid password-grid">
            <!-- Contraseña Actual -->
            <div class="form-group">
              <label for="currentPassword" class="form-label">
                <span class="label-text">
                  <i class="fas fa-key label-icon"></i>
                  Contraseña Actual
                </span>
                <span class="label-required">*</span>
              </label>
              <div class="input-container">
                <input
                  id="currentPassword"
                  v-model="passwordData.actual"
                  :type="showPasswords.actual ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'error': errors.currentPassword }"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPasswords.actual = !showPasswords.actual"
                >
                  <i class="fas" :class="showPasswords.actual ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.currentPassword" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.currentPassword }}
              </span>
            </div>

            <!-- Nueva Contraseña -->
            <div class="form-group">
              <label for="newPassword" class="form-label">
                <span class="label-text">
                  <i class="fas fa-lock label-icon"></i>
                  Nueva Contraseña
                </span>
                <span class="label-required">*</span>
              </label>
              <div class="input-container">
                <input
                  id="newPassword"
                  v-model="passwordData.nueva"
                  :type="showPasswords.nueva ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'error': errors.newPassword }"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPasswords.nueva = !showPasswords.nueva"
                >
                  <i class="fas" :class="showPasswords.nueva ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.newPassword" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.newPassword }}
              </span>
            </div>

            <!-- Confirmar Nueva Contraseña -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                <span class="label-text">
                  <i class="fas fa-shield-alt label-icon"></i>
                  Confirmar Nueva Contraseña
                </span>
                <span class="label-required">*</span>
              </label>
              <div class="input-container">
                <input
                  id="confirmPassword"
                  v-model="passwordData.confirmar"
                  :type="showPasswords.confirmar ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'error': errors.confirmPassword }"
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPasswords.confirmar = !showPasswords.confirmar"
                >
                  <i class="fas" :class="showPasswords.confirmar ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ errors.confirmPassword }}
              </span>
            </div>
          </div>

          <!-- Requisitos de contraseña -->
          <div class="password-requirements">
            <h4 class="requirements-title">
              <i class="fas fa-info-circle"></i>
              Requisitos de la contraseña:
            </h4>
            <ul class="requirements-list">
              <li :class="{ 'valid': passwordValidation.length }">
                <i class="fas requirement-icon" 
                   :class="passwordValidation.length ? 'fa-check-circle' : 'fa-times-circle'">
                </i>
                Mínimo 6 caracteres
              </li>
              <li :class="{ 'valid': passwordValidation.uppercase }">
                <i class="fas requirement-icon" 
                   :class="passwordValidation.uppercase ? 'fa-check-circle' : 'fa-times-circle'">
                </i>
                Al menos una letra mayúscula
              </li>
              <li :class="{ 'valid': passwordValidation.lowercase }">
                <i class="fas requirement-icon" 
                   :class="passwordValidation.lowercase ? 'fa-check-circle' : 'fa-times-circle'">
                </i>
                Al menos una letra minúscula
              </li>
              <li :class="{ 'valid': passwordValidation.number }">
                <i class="fas requirement-icon" 
                   :class="passwordValidation.number ? 'fa-check-circle' : 'fa-times-circle'">
                </i>
                Al menos un número
              </li>
            </ul>
          </div>

          <!-- Mensaje de éxito/error -->
          <div v-if="mensajePassword.texto" class="alert" :class="mensajePassword.tipo">
            <i class="fas alert-icon" 
               :class="mensajePassword.tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'">
            </i>
            {{ mensajePassword.texto }}
          </div>

          <!-- Botones -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-danger"
              @click="cancelarCambiosPassword"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-success"
              :disabled="isLoadingPassword || !isPasswordValid"
              :class="{ 'loading': isLoadingPassword }"
            >
              <span v-if="!isLoadingPassword">
                Cambiar Contraseña
              </span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracionUsuario',
  data() {
    return {
      // Datos del formulario personal
      formData: {
        nombre: '',
        email: '',
        usuario: '',
        telefono: '',
        departamento: '',
        rolTexto: ''
      },
      
      // Datos originales para comparar cambios
      originalData: {},
      
      // Datos de contraseña
      passwordData: {
        actual: '',
        nueva: '',
        confirmar: ''
      },
      
      // Estados de visibilidad de contraseñas
      showPasswords: {
        actual: false,
        nueva: false,
        confirmar: false
      },
      
      // Estados de carga
      isLoadingPersonal: false,
      isLoadingPassword: false,
      
      // Mensajes
      mensajePersonal: { texto: '', tipo: '' },
      mensajePassword: { texto: '', tipo: '' },
      
      // Errores
      errors: {}
    }
  },
  
  computed: {
    // Validación de contraseña en tiempo real
    passwordValidation() {
      const password = this.passwordData.nueva;
      return {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password)
      };
    },
    
    // Verificar si la contraseña es válida
    isPasswordValid() {
      return Object.values(this.passwordValidation).every(valid => valid) &&
             this.passwordData.nueva === this.passwordData.confirmar;
    }
  },
  
  mounted() {
    this.cargarDatosUsuario();
  },
  
  methods: {
    cargarDatosUsuario() {
      // Cargar datos del usuario desde localStorage/sessionStorage
      const user = localStorage.getItem('cloudtech_user') || sessionStorage.getItem('cloudtech_user');
      if (user) {
        const userData = JSON.parse(user);
        this.formData = {
          nombre: userData.nombre || '',
          email: userData.email || '',
          usuario: userData.usuario || '',
          telefono: userData.telefono || '',
          departamento: userData.departamento || '',
          rolTexto: userData.rolTexto || ''
        };
        
        // Guardar datos originales
        this.originalData = { ...this.formData };
      }
    },
    
    validarInformacionPersonal() {
      this.errors = {};
      
      if (!this.formData.nombre.trim()) {
        this.errors.nombre = 'El nombre es requerido';
      }
      
      if (!this.formData.email.trim()) {
        this.errors.email = 'El email es requerido';
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = 'Ingresa un email válido';
      }
      
      if (!this.formData.usuario.trim()) {
        this.errors.usuario = 'El usuario es requerido';
      } else if (this.formData.usuario.length < 3) {
        this.errors.usuario = 'El usuario debe tener al menos 3 caracteres';
      }
      
      if (this.formData.telefono && !this.isValidPhone(this.formData.telefono)) {
        this.errors.telefono = 'Formato de teléfono inválido';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    validarContrasena() {
      this.errors = {};
      
      if (!this.passwordData.actual.trim()) {
        this.errors.currentPassword = 'La contraseña actual es requerida';
      }
      
      if (!this.passwordData.nueva.trim()) {
        this.errors.newPassword = 'La nueva contraseña es requerida';
      } else if (!this.isPasswordValid) {
        this.errors.newPassword = 'La contraseña no cumple con los requisitos';
      }
      
      if (this.passwordData.nueva !== this.passwordData.confirmar) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    async guardarInformacionPersonal() {
      if (!this.validarInformacionPersonal()) return;
      
      this.isLoadingPersonal = true;
      this.mensajePersonal = { texto: '', tipo: '' };
      
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Aquí iría la llamada al backend
        console.log('Guardando información personal:', this.formData);
        
        // Actualizar datos en localStorage/sessionStorage
        const user = localStorage.getItem('cloudtech_user') || sessionStorage.getItem('cloudtech_user');
        if (user) {
          const userData = JSON.parse(user);
          const updatedUser = {
            ...userData,
            nombre: this.formData.nombre,
            email: this.formData.email,
            usuario: this.formData.usuario,
            telefono: this.formData.telefono
          };
          
          // Actualizar en ambos storages si existen
          if (localStorage.getItem('cloudtech_user')) {
            localStorage.setItem('cloudtech_user', JSON.stringify(updatedUser));
          }
          if (sessionStorage.getItem('cloudtech_user')) {
            sessionStorage.setItem('cloudtech_user', JSON.stringify(updatedUser));
          }
        }
        
        this.originalData = { ...this.formData };
        this.mensajePersonal = {
          texto: 'Información personal actualizada correctamente',
          tipo: 'success'
        };
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajePersonal = { texto: '', tipo: '' };
        }, 5000);
        
      } catch (error) {
        this.mensajePersonal = {
          texto: 'Error al guardar la información. Intenta nuevamente.',
          tipo: 'error'
        };
        console.error('Error al guardar:', error);
      } finally {
        this.isLoadingPersonal = false;
      }
    },
    
    async cambiarContrasena() {
      if (!this.validarContrasena()) return;
      
      this.isLoadingPassword = true;
      this.mensajePassword = { texto: '', tipo: '' };
      
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Aquí iría la validación de contraseña actual con el backend
        // Por ahora simulamos que es correcta
        console.log('Cambiando contraseña...');
        
        this.mensajePassword = {
          texto: 'Contraseña cambiada exitosamente',
          tipo: 'success'
        };
        
        // Limpiar formulario de contraseñas
        this.cancelarCambiosPassword();
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajePassword = { texto: '', tipo: '' };
        }, 5000);
        
      } catch (error) {
        this.mensajePassword = {
          texto: 'Error al cambiar la contraseña. Intenta nuevamente.',
          tipo: 'error'
        };
        console.error('Error al cambiar contraseña:', error);
      } finally {
        this.isLoadingPassword = false;
      }
    },
    
    cancelarCambiosPersonales() {
      this.formData = { ...this.originalData };
      this.errors = {};
      this.mensajePersonal = { texto: '', tipo: '' };
    },
    
    cancelarCambiosPassword() {
      this.passwordData = {
        actual: '',
        nueva: '',
        confirmar: ''
      };
      this.showPasswords = {
        actual: false,
        nueva: false,
        confirmar: false
      };
      this.errors = {};
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    isValidPhone(phone) {
      // Formato hondureño: +504 0000-0000 o variaciones
      const phoneRegex = /^(\+504\s?)?[0-9]{4}-?[0-9]{4}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    }
  }
}
</script>

<style scoped>
.configuracion-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 3rem;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.configuracion-content {
  display: grid;
  gap: 3rem;
}

.config-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 2rem;
  color: #3498db;
}

.section-description {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.config-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.password-grid {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.label-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.label-icon {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.label-required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
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

.form-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  color: #7f8c8d;
}

.toggle-password:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #3498db;
}

.form-help {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
}

.error-message {
  margin-top: 0.5rem;
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-requirements {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.requirements-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.requirements-title i {
  color: #3498db;
}

.requirements-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
  transition: color 0.3s ease;
}

.requirements-list li.valid {
  color: #27ae60;
}

.requirement-icon {
  font-size: 0.9rem;
  width: 16px;
  text-align: center;
}

.requirements-list li:not(.valid) .requirement-icon {
  color: #e74c3c;
}

.requirements-list li.valid .requirement-icon {
  color: #27ae60;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  min-height: 48px;
}

.btn-success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #219a52, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
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

/* Responsive */
@media (max-width: 768px) {
  .configuracion-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .config-section {
    padding: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .section-title {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .password-requirements {
    padding: 1rem;
  }
  
  .form-actions {
    gap: 0.75rem;
  }
}
</style>