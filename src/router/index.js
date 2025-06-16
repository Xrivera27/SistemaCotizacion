import { createRouter, createWebHistory } from 'vue-router';

// Layouts y Componentes
import AppLayout from '@/components/common/AppLayout.vue';
import LoginView from '@/views/auth/Login.vue';

// Vistas Compartidas
import Cotizacion from '@/views/shared/Cotizacion.vue';
import Configuracion from '@/views/shared/Configuracion.vue';

// Vistas por Rol



// Vistas para Admin
import AdminDashboard from '@/views/admin/Dashboard.vue';
import MisCotizacione from '@/views/admin/MisCotizaciones.vue';
import MisUsuarios from '@/views/admin/MisUsuarios.vue';
import MisClientes from '@/views/admin/MisClientes.vue';
import MisServicios from '@/views/admin/MisServicios.vue';
import MisReportes from '@/views/admin/MisReportes.vue';


// Vistas para SuperUsuario
import SuperDashboard from '@/views/super/Dashboard.vue';
import MisCotizacionesSuper from '@/views/super/MisCotizaciones.vue';
import MisReportesSuper from '@/views/super/MisReportes.vue';


//Vistas Para Vendedor
import MisCotizaciones from '@/views/vendedor/MisCotizaciones.vue';
import VendedorDashboard from '@/views/vendedor/Dashboard.vue';

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
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },

      {
        path: 'admin/configuracion',
        name: 'AdminConfiguracion',
        component: Configuracion
      },
       {
        path: '/admin/cotizaciones',
        name: 'MisCotizacionesAdmin',
        component: MisCotizacione
      },
      {
        path: '/admin/usuarios',
        name: 'MisUsuarios',
        component: MisUsuarios
      },
      {
        path: '/admin/clientes',
        name: 'MisClientes',
        component: MisClientes
      },

       {
        path: '/admin/servicios',
        name: 'MisServicios',
        component: MisServicios
      },

      {
        path: '/admin/reportes',
        name: 'MisReportes',
        component: MisReportes
      },
      
      // Rutas de SuperUsuario
      {
        path: '/super/dashboard',
        name: 'SuperDashboard',
        component: SuperDashboard
      },

       {
        path: '/super/cotizaciones',
        name: 'MisCotizacionesSuper',
        component: MisCotizacionesSuper
      },

      
       {
        path: '/super/reportes',
        name: 'MisReportesSuper',
        component: MisReportesSuper
      },


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