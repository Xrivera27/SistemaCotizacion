<template>
  <header class="app-header">
    <div class="header-left">
      <button class="btn-sidebar-toggle" @click="toggleSidebar">
        ☰
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <div class="user-menu">
        <button class="btn-user" @click="toggleUserMenu">
          <span class="user-avatar">{{ userInitials }}</span>
        </button>
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
      notificationCount: 3
    };
  },
  
  computed: {
    userInitials() {
      const currentUser = authService.getCurrentUser();
      
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
  
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    showNotifications() {
      console.log('Mostrar notificaciones');
    },
    toggleUserMenu() {
      console.log('Mostrar menú de usuario');
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

.btn-user {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
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
}
</style>