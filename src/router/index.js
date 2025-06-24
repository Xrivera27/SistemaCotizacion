import { createRouter, createWebHistory } from 'vue-router';
import authService from '@/services/auth';

// Layouts y Componentes
import AppLayout from '@/components/common/AppLayout.vue';
import LoginView from '@/views/auth/Login.vue';

// Vistas Compartidas
import Cotizacion from '@/views/shared/Cotizacion.vue';
import Configuracion from '@/views/shared/Configuracion.vue';

// Vistas para Admin
import AdminDashboard from '@/views/admin/Dashboard.vue';
import MisCotizacione from '@/views/admin/MisCotizaciones.vue';
import MisUsuarios from '@/views/admin/MisUsuarios.vue';
import MisClientes from '@/views/admin/MisClientes.vue';
import MisCategorias from '@/views/admin/MisCategorias.vue';
import MisServicios from '@/views/admin/MisServicios.vue';
import MisReportes from '@/views/admin/MisReportes.vue';

// Vistas para SuperUsuario
import SuperDashboard from '@/views/super/Dashboard.vue';
import MisCotizacionesSuper from '@/views/super/MisCotizaciones.vue';
import MisReportesSuper from '@/views/super/MisReportes.vue';

//Vistas Para Vendedor
import MisCotizaciones from '@/views/vendedor/MisCotizaciones.vue';
import VendedorDashboard from '@/views/vendedor/Dashboard.vue';

// Guard de autenticación mejorado
async function requireAuth(to, from, next) {
  console.log('🛡️ Verificando acceso a:', to.path);
  
  try {
    // Verificar autenticación con el backend
    const result = await authService.checkAuth();
    
    if (result.success) {
      console.log('✅ Usuario autenticado, acceso permitido');
      
      // Iniciar heartbeat si no está activo
      authService.startHeartbeat(5);
      
      next();
    } else {
      console.log('❌ No autenticado, redirigiendo a login');
      next('/login');
    }
    
  } catch (error) {
    console.error('💥 Error en guard de autenticación:', error);
    next('/login');
  }
}

// Guard para evitar acceso a login si ya está autenticado
async function redirectIfAuthenticated(to, from, next) {
  console.log('🔍 Verificando si ya está logueado...');
  
  try {
    const result = await authService.checkAuth();
    
    if (result.success) {
      console.log('✅ Ya está logueado, redirigiendo al dashboard');
      
      // Redirigir según el tipo de usuario
      const redirectPath = authService.getRedirectPath(result.user.tipo_usuario);
      next(redirectPath);
    } else {
      console.log('❌ No está logueado, continuar a login');
      next();
    }
    
  } catch (error) {
    console.error('💥 Error verificando autenticación:', error);
    next(); // Continuar al login en caso de error
  }
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: redirectIfAuthenticated
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
      {
        path: 'vendedor/cotizaciones',
        name: 'MisCotizaciones',
        component: MisCotizaciones
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
        path: '/admin/categorias',
        name: 'MisCategorias',
        component: MisCategorias
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
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;