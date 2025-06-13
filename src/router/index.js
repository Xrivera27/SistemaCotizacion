import { createRouter, createWebHistory } from 'vue-router';

// Layouts y Componentes
import AppLayout from '@/components/common/AppLayout.vue';
import LoginView from '@/views/auth/Login.vue';

// Vistas Compartidas
import Cotizacion from '@/views/shared/Cotizacion.vue';
import Configuracion from '@/views/shared/Configuracion.vue';

// Vistas por Rol
import VendedorDashboard from '@/views/vendedor/Dashboard.vue';

//Vistas Para Vendedor
import MisCotizaciones from '@/views/vendedor/MisCotizaciones.vue';

// Guard de autenticación
function requireAuth(to, from, next) {
  const user = localStorage.getItem('cloudtech_user') || sessionStorage.getItem('cloudtech_user');
  if (user) {
    next();
  } else {
    next('/login');
  }
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    component: AppLayout,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        redirect: '/vendedor/dashboard'
      },
      // Rutas compartidas
      {
        path: 'shared/cotizacion',
        name: 'Cotizacion',
        component: Cotizacion
      },
      {
        path: 'shared/configuracion',
        name: 'ConfiguracionShared',
        component: Configuracion
      },
      
      // Rutas de Vendedor
      {
        path: 'vendedor/dashboard',
        name: 'VendedorDashboard',
        component: VendedorDashboard
      },
      {
        path: 'vendedor/configuracion',
        name: 'VendedorConfiguracion',
        component: Configuracion
      },
      
      // Rutas de Admin
      {
        path: 'admin/configuracion',
        name: 'AdminConfiguracion',
        component: Configuracion
      },
      
      // Rutas de SuperUsuario
      {
        path: 'super/configuracion',
        name: 'SuperConfiguracion',
        component: Configuracion
      },

      {
  path: 'vendedor/cotizaciones',
  name: 'MisCotizaciones',
  component: MisCotizaciones
}
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;