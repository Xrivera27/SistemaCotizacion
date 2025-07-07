<template>
  <header class="app-header">
    <div class="header-left">
      <button class="btn-sidebar-toggle" @click="toggleSidebar">
        ☰
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <div class="user-menu" ref="userMenuRef">
        <button class="btn-user" @click="toggleUserMenu">
          <span class="user-avatar">{{ userInitials }}</span>
        </button>
        
        <!-- Menú desplegable -->
        <div class="user-dropdown" v-if="showUserMenu">
          <div class="user-info">
            <div class="user-name">{{ currentUser?.nombre_completo || 'Usuario' }}</div>
            <div class="user-role">{{ getUserRoleDisplay() }}</div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-menu">
            <button class="dropdown-item" @click="goToConfig">
              <i class="dropdown-icon fas fa-cog"></i>
              Configuración
            </button>
            <button class="dropdown-item logout-item" @click="logout">
              <i class="dropdown-icon fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import authService from '@/services/auth';

export default {
  name: 'AppHeader',
  data() {
    return {
      notificationCount: 3,
      showUserMenu: false,
      currentUser: null
    };
  },
  
  computed: {
    userInitials() {
      const currentUser = this.currentUser || authService.getCurrentUser();
      
      if (currentUser && currentUser.nombre_completo) {
        const nombres = currentUser.nombre_completo.trim().split(' ');
        
        if (nombres.length >= 2) {
          // Si tiene al menos 2 nombres, tomar las primeras 2 iniciales
          return (nombres[0][0] + nombres[1][0]).toUpperCase();
        } else if (nombres.length === 1) {
          // Si solo tiene un nombre, tomar las primeras 2 letras
          return nombres[0].substring(0, 2).toUpperCase();
        }
      }
      
      // Fallback si no hay nombre completo
      return 'U';
    },
    
    pageTitle() {
      const titles = {
        // Rutas compartidas
        '/shared/cotizacion': 'Crear Cotización',
        
        // Rutas de Administrador
        '/admin/dashboard': 'Dashboard',
        '/admin/usuarios': 'Usuarios',
        '/admin/clientes': 'Clientes',
        '/admin/categorias': 'Categorías',
        '/admin/servicios': 'Servicios',
        '/admin/cotizaciones': 'Cotizaciones',
        '/admin/reportes': 'Reportes',
        '/admin/configuracion': 'Configuración',
        
        // Rutas de Vendedor
        '/vendedor/dashboard': 'Dashboard',
        '/vendedor/cotizaciones': 'Mis Cotizaciones',
        '/vendedor/configuracion': 'Configuración',
        
        // Rutas de SuperUsuario
        '/super/dashboard': 'Dashboard',
        '/super/cotizaciones': 'Cotizaciones',
        '/super/reportes': 'Reportes',
        '/super/configuracion': 'Configuración'
      };
      return titles[this.$route.path] || 'Sistema de Cotización';
    }
  },
  
  mounted() {
    this.currentUser = authService.getCurrentUser();
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
  },
  
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    
    handleClickOutside(event) {
      if (this.$refs.userMenuRef && !this.$refs.userMenuRef.contains(event.target)) {
        this.showUserMenu = false;
      }
    },
    
    getUserRoleDisplay() {
      if (!this.currentUser) return '';
      
      const roleMap = {
        'admin': 'Administrador',
        'vendedor': 'Vendedor',
        'super': 'Super Usuario'
      };
      
      return roleMap[this.currentUser.tipo_usuario] || this.currentUser.tipo_usuario;
    },
    
    goToConfig() {
      this.showUserMenu = false;
      
      // Determinar la ruta de configuración según el tipo de usuario
      const configRoutes = {
        'admin': '/admin/configuracion',
        'vendedor': '/vendedor/configuracion',
        'super': '/super/configuracion'
      };
      
      const userType = this.currentUser?.tipo_usuario;
      const configRoute = configRoutes[userType] || '/vendedor/configuracion';
      
      this.$router.push(configRoute);
    },
    
    async logout() {
      try {
        this.showUserMenu = false;
        
        // Llamar al servicio de logout
        await authService.logout();
        
        // Redirigir a login
        this.$router.push('/login');
        
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Aun si hay error, redirigir al login
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
.app-header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-sidebar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.btn-sidebar-toggle:hover {
  background: #f8f9fa;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
}

.btn-user {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: transform 0.2s;
}

.btn-user:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.user-info {
  padding: 1rem;
  background: #f8f9fa;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.875rem;
  color: #6c757d;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
}

.dropdown-menu {
  padding: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #2c3e50;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.logout-item {
  color: #dc3545;
}

.dropdown-item.logout-item:hover {
  background: #fff5f5;
}

.dropdown-icon {
  font-size: 1rem;
  width: 16px;
  text-align: center;
  color: inherit;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 1rem;
  }
  
  .btn-sidebar-toggle {
    display: block;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
  
  .user-dropdown {
    right: -1rem;
    min-width: 180px;
  }
}
</style>