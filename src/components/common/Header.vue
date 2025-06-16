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
export default {
  name: 'AppHeader',
  data() {
    return {
      notificationCount: 3,
      userInitials: 'CM'
    };
  },
  computed: {
    pageTitle() {
      const titles = {
        // Rutas compartidas
        '/shared/cotizacion': 'Crear Cotización',
        
        // Rutas de Administrador
        '/admin/dashboard': 'Dashboard',
        '/admin/usuarios': 'Usuarios',
        '/admin/clientes': 'Clientes',
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

.btn-notification {
  position: relative;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-notification:hover {
  background: #f8f9fa;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
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