<template>
  <div class="sidebar-container">
    <!-- Overlay para móvil -->
    <div 
      v-if="isMobile && isOpen" 
      class="sidebar-overlay"
      @click="cerrarSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'sidebar',
        { 'sidebar-abierto': isOpen },
        { 'sidebar-cerrado': !isOpen }
      ]"
    >
      <!-- Header del sidebar -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo" v-if="isOpen">
            <span class="logo-text">CloudTech</span>
          </div>
          <span 
            class="logo-mini" 
            v-else
            :title="'CloudTech - Sistema de Cotización'"
          >CT</span>
        </div>
        <button 
          class="btn-toggle"
          @click="toggleSidebar"
          :title="isOpen ? 'Cerrar menú' : 'Abrir menú'"
        >
          <span class="toggle-icon">{{ isOpen ? '←' : '→' }}</span>
        </button>
      </div>

      <!-- Información del usuario -->
      <div class="user-info" v-if="isOpen">
        <div class="user-avatar">
          <span>{{ usuarioActual.iniciales }}</span>
        </div>
        <div class="user-details">
          <p class="user-name">{{ usuarioActual.nombre }}</p>
          <p class="user-role">{{ usuarioActual.rolTexto }}</p>
        </div>
      </div>

      <!-- Navegación principal -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li 
            v-for="item in menuItems" 
            :key="item.id"
            class="nav-item"
          >
            <router-link 
              :to="item.ruta"
              class="nav-link"
              :class="{ 'active': rutaActiva === item.ruta }"
              :title="!isOpen ? item.texto : ''"
              @click="cerrarSidebarMobile"
            >
              <span class="nav-icon">{{ item.icono }}</span>
              <span class="nav-text" v-if="isOpen">{{ item.texto }}</span>
              <span 
                v-if="item.badge && isOpen" 
                class="nav-badge"
              >
                {{ item.badge }}
              </span>
              <!-- Badge para sidebar contraído -->
              <span 
                v-if="item.badge && !isOpen" 
                class="nav-badge-mini"
                :title="`${item.badge} ${item.texto.toLowerCase()}`"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer del sidebar -->
      <div class="sidebar-footer">
        <button 
          class="btn-logout"
          @click="cerrarSesion"
          :title="isOpen ? 'Cerrar sesión' : 'Cerrar sesión'"
        >
          <span class="logout-icon">🚪</span>
          <span class="logout-text" v-if="isOpen">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isMobile: false,
      rutaActiva: this.$route.path,
      usuarioActual: {
        nombre: 'Carlos Mendoza',
        rol: 2,
        iniciales: 'CM',
        rolTexto: 'Vendedor'
      }
    };
  },
  computed: {
    menuItems() {
      const menus = {
        1: [ // Administrador
          {
            id: 'dashboard-admin',
            texto: 'Dashboard',
            icono: '📊',
            ruta: '/admin/dashboard'
          },
          {
            id: 'usuarios',
            texto: 'Usuarios',
            icono: '👥',
            ruta: '/admin/usuarios'
          },
          {
            id: 'clientes',
            texto: 'Clientes',
            icono: '🏢',
            ruta: '/admin/clientes'
          },
          {
            id: 'servicios',
            texto: 'Servicios',
            icono: '⚙️',
            ruta: '/admin/servicios'
          },
          {
            id: 'cotizaciones-admin',
            texto: 'Cotizaciones',
            icono: '📋',
            ruta: '/admin/cotizaciones',
            badge: '12'
          },
          {
            id: 'reportes-admin',
            texto: 'Reportes',
            icono: '📈',
            ruta: '/admin/reportes'
          },
          {
            id: 'crear-cotizacion-admin',
            texto: 'Crear Cotización',
            icono: '➕',
            ruta: '/shared/cotizacion'
          },
          {
            id: 'configuracion-admin',
            texto: 'Configuración',
            icono: '⚙️',
            ruta: '/admin/configuracion'
          }
        ],
        2: [ // Vendedor
          {
            id: 'dashboard-vendedor',
            texto: 'Dashboard',
            icono: '📊',
            ruta: '/vendedor/dashboard'
          },
          {
            id: 'crear-cotizacion',
            texto: 'Crear Cotización',
            icono: '➕',
            ruta: '/shared/cotizacion'
          },
          {
            id: 'historial-cotizaciones',
            texto: 'Mis Cotizaciones',
            icono: '📋',
            ruta: '/vendedor/cotizaciones',
          },
          {
            id: 'configuracion-vendedor',
            texto: 'Configuración',
            icono: '⚙️',
            ruta: '/vendedor/configuracion'
          }
        ],
        3: [ // Lic SuperUsuario
          {
            id: 'dashboard-super',
            texto: 'Dashboard',
            icono: '📊',
            ruta: '/super/dashboard'
          },
          {
            id: 'cotizaciones-super',
            texto: 'Cotizaciones',
            icono: '📋',
            ruta: '/super/cotizaciones',
            badge: '8'
          },
          {
            id: 'crear-cotizacion-super',
            texto: 'Crear Cotización',
            icono: '➕',
            ruta: '/shared/cotizacion'
          },
          {
            id: 'reportes-super',
            texto: 'Reportes',
            icono: '📈',
            ruta: '/super/reportes'
          },
          {
            id: 'configuracion-super',
            texto: 'Configuración',
            icono: '⚙️',
            ruta: '/super/configuracion'
          }
        ]
      };

      return menus[this.usuarioActual.rol] || [];
    }
  },
  mounted() {
    this.checkMobile();
    this.loadUserData();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  watch: {
    $route(to) {
      this.rutaActiva = to.path;
    }
  },
  methods: {
    loadUserData() {
      // Cargar datos del usuario desde localStorage o sessionStorage
      const user = localStorage.getItem('cloudtech_user') || sessionStorage.getItem('cloudtech_user');
      if (user) {
        const userData = JSON.parse(user);
        this.usuarioActual = {
          nombre: userData.nombre,
          rol: userData.rol,
          iniciales: userData.iniciales,
          rolTexto: userData.rolTexto || this.getRolTexto(userData.rol),
          departamento: userData.departamento || ''
        };
      }
    },
    
    getRolTexto(rol) {
      const roles = {
        1: 'Administrador',
        2: 'Vendedor',
        3: 'Lic. SuperUsuario'
      };
      return roles[rol] || 'Usuario';
    },
    
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    
    cerrarSidebar() {
      if (this.isMobile) {
        this.$emit('toggle-sidebar');
      }
    },
    
    cerrarSidebarMobile() {
      if (this.isMobile) {
        this.$emit('toggle-sidebar');
      }
    },
    
    cerrarSesion() {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        try {
          // Limpiar todo el almacenamiento de sesión
          localStorage.removeItem('cloudtech_user');
          localStorage.removeItem('cloudtech_remember');
          sessionStorage.removeItem('cloudtech_user');
          
          // Log de la acción
          console.log('Sesión cerrada correctamente');
          
          // Redirigir al login
          this.$router.push('/login');
          
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          // Aún así intentar redirigir
          this.$router.push('/login');
        }
      }
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  position: relative;
  z-index: 1000;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.sidebar-abierto {
  width: 280px;
}

.sidebar-cerrado {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

/* AJUSTES PARA SIDEBAR CONTRAÍDO */
.sidebar-cerrado .sidebar-header {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0.5rem;
  min-height: 120px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.sidebar-cerrado .logo-container {
  flex: none;
  margin: 0;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #3498db, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-mini {
  font-size: 1.2rem;
  font-weight: bold;
  color: #3498db;
  background: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

/* BOTÓN TOGGLE MEJORADO */
.btn-toggle {
  background: #3498db;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.3rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  flex-shrink: 0;
}

/* Botón cuando sidebar está contraído */
.sidebar-cerrado .btn-toggle {
  width: 45px;
  height: 45px;
  font-size: 1.4rem;
  border-width: 3px;
  box-shadow: 0 3px 12px rgba(52, 152, 219, 0.4);
}

.btn-toggle:hover {
  background: #2980b9;
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.5);
}

.btn-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 1.2rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.sidebar-cerrado .toggle-icon {
  font-size: 1.3rem;
}

.btn-toggle:hover .toggle-icon {
  transform: scale(1.1);
}

.user-info {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0;
  font-size: 0.8rem;
  color: #bdc3c7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  gap: 0.75rem;
  border-radius: 0;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
}

/* Ajustes para nav-links cuando está contraído */
.sidebar-cerrado .nav-link {
  margin: 0 0.25rem;
  padding: 0.875rem 0.5rem;
  justify-content: center;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(3px);
}

.sidebar-cerrado .nav-link:hover {
  transform: none;
}

.nav-link.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 100%;
  background: #ecf0f1;
  border-radius: 0 2px 2px 0;
}

.sidebar-cerrado .nav-link.active::before {
  left: -0.25rem;
  width: 3px;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}

/* Badge mini para sidebar contraído */
.nav-badge-mini {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #e74c3c;
  color: white;
  font-size: 0.6rem;
  padding: 0.15rem 0.3rem;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
  font-weight: 600;
  line-height: 1;
  cursor: help;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-cerrado .sidebar-footer {
  padding: 1rem 0.5rem;
}

.btn-logout {
  width: 100%;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.sidebar-cerrado .btn-logout {
  padding: 0.75rem 0.5rem;
  min-height: 45px;
}

.btn-logout:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.5);
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 1.1rem;
}

/* Tooltips mejorados */
[title] {
  position: relative;
}

/* Scrollbar personalizada */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-abierto {
    width: 280px;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  }
  
  .sidebar-cerrado {
    width: 0;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .user-info {
    padding: 0.75rem 1rem;
  }

  .nav-link {
    padding: 1rem;
    margin: 0;
    border-radius: 0;
  }

  .nav-link:hover {
    transform: none;
  }

  .sidebar-footer {
    padding: 1rem;
  }

  .btn-toggle {
    width: 38px;
    height: 38px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .sidebar-abierto {
    width: 100vw;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-role {
    font-size: 0.75rem;
  }

  .nav-text {
    font-size: 0.85rem;
  }
}
</style>