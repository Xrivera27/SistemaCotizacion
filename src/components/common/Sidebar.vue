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
           <img 
             src="https://perdomoyasociados.com/wp-content/uploads/2023/09/logo_perdomo_2023_dorado-768x150.png" 
             alt="Perdomo y Asociados"
             class="logo-img"
             @error="handleLogoError"
           />
         </div>
         <span 
           class="logo-mini" 
           v-else
           :title="'P - Sistema de Cotización'"
         >P</span>
       </div>
       <button 
         class="btn-toggle"
         @click="toggleSidebar"
         :title="isOpen ? 'Cerrar menú' : 'Abrir menú'"
       >
         <i class="fas" :class="isOpen ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
       </button>
     </div>

     <!-- Información del usuario -->
     <div class="user-info" v-if="isOpen">
       <div class="user-avatar">
         <span>{{ usuarioActual.iniciales }}</span>
       </div>
       <div class="user-details">
         <p class="user-name">{{ usuarioActual.nombre_completo || usuarioActual.nombre }}</p>
         <p class="user-role">{{ usuarioActual.rolTexto }}</p>
         <p class="user-email" v-if="usuarioActual.correo">{{ usuarioActual.correo }}</p>
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
             <i class="nav-icon" :class="item.icono"></i>
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
         @click="mostrarModalCerrarSesion"
         :title="isOpen ? 'Cerrar sesión' : 'Cerrar sesión'"
         :disabled="isLoggingOut"
       >
         <i class="fas logout-icon" :class="isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'"></i>
         <span class="logout-text" v-if="isOpen">
           {{ isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión' }}
         </span>
       </button>
     </div>
   </aside>

   <!-- Modal de Cerrar Sesión -->
   <div v-if="modalCerrarSesion" class="modal-overlay" @click="cerrarModalCerrarSesion">
     <div class="modal-content" @click.stop>
       <div class="modal-header">
         <h3 class="modal-title">
           <i class="fas fa-sign-out-alt"></i>
           Cerrar Sesión
         </h3>
         <button class="btn-close" @click="cerrarModalCerrarSesion">
           <i class="fas fa-times"></i>
         </button>
       </div>
       
       <div class="modal-body">
         <div class="logout-content">
           <div class="logout-icon-large">
             <i class="fas fa-exclamation-triangle"></i>
           </div>
           <div class="logout-message">
             <h4>¿Estás seguro que deseas cerrar sesión?</h4>
             <p>Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder al sistema.</p>
           </div>
           <div class="user-info-logout">
             <div class="user-avatar-logout">
               <span>{{ usuarioActual.iniciales }}</span>
             </div>
             <div class="user-details-logout">
               <p class="user-name-logout">{{ usuarioActual.nombre_completo || usuarioActual.nombre }}</p>
               <p class="user-role-logout">{{ usuarioActual.rolTexto }}</p>
               <p class="user-email-logout" v-if="usuarioActual.correo">{{ usuarioActual.correo }}</p>
             </div>
           </div>

           <!-- Opciones de cierre de sesión -->
           <div class="logout-options" v-if="isOpen">
             <div class="logout-option">
               <label class="checkbox-container">
                 <input 
                   type="checkbox" 
                   v-model="logoutAllSessions"
                   class="checkbox-input"
                 />
                 <span class="checkbox-mark"></span>
                 <span class="checkbox-text">Cerrar todas las sesiones activas</span>
               </label>
               <p class="option-description">
                 Esto cerrará tu sesión en todos los dispositivos donde hayas iniciado sesión.
               </p>
             </div>
           </div>
         </div>
       </div>
       
       <div class="modal-footer">
         <button 
           class="btn btn-secondary" 
           @click="cerrarModalCerrarSesion"
           :disabled="isLoggingOut"
         >
           <i class="fas fa-times"></i>
           Cancelar
         </button>
         <button 
           class="btn btn-danger" 
           @click="confirmarCerrarSesion"
           :disabled="isLoggingOut"
         >
           <i class="fas" :class="isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'"></i>
           {{ isLoggingOut ? 'Cerrando...' : 'Sí, Cerrar Sesión' }}
         </button>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
import authService from '@/services/auth';

export default {
 name: 'AppSidebar',
 props: {
   isOpen: {
     type: Boolean,
     default: false
   }
 },
 emits: ['toggle-sidebar'],
 data() {
   return {
     isMobile: false,
     rutaActiva: this.$route.path,
     modalCerrarSesion: false,
     isLoggingOut: false,
     logoutAllSessions: false,
     isOnline: navigator.onLine,
     usuarioActual: {
       id: null,
       nombre_completo: 'Usuario',
       correo: '',
       usuario: '',
       tipo_usuario: 'vendedor',
       telefono: '',
       iniciales: 'U',
       rolTexto: 'Usuario'
     }
   };
 },
 computed: {
   menuItems() {
     const menus = {
       'admin': [ // Administrador
         {
           id: 'dashboard-admin',
           texto: 'Dashboard',
           icono: 'fa fa-home',
           ruta: '/admin/dashboard'
         },
         {
           id: 'usuarios',
           texto: 'Usuarios',
           icono: 'fas fa-users',
           ruta: '/admin/usuarios'
         },
         {
           id: 'clientes',
           texto: 'Clientes',
           icono: 'fas fa-building',
           ruta: '/admin/clientes'
         },
         {
           id: 'MisUnidadesMedida',
           texto: 'Unidades de Medida',
           icono: 'fas fa-ruler',
           ruta: '/admin/unidades-medida'
         },
         {
           id: 'categorias',
           texto: 'Categorías',
           icono: 'fas fa-tags',
           ruta: '/admin/categorias'
         },
         {
           id: 'servicios',
           texto: 'Servicios',
           icono: 'fas fa-cogs',
           ruta: '/admin/servicios'
         },
         
         {
           id: 'cotizaciones-admin',
           texto: 'Cotizaciones',
           icono: 'fas fa-file-invoice',
           ruta: '/admin/cotizaciones',
         },
         {
           id: 'reportes-admin',
           texto: 'Reportes',
           icono: 'fas fa-chart-line',
           ruta: '/admin/reportes'
         },
         {
           id: 'crear-cotizacion-admin',
           texto: 'Crear Cotización',
           icono: 'fas fa-plus-circle',
           ruta: '/shared/cotizacion'
         },
         {
           id: 'configuracion-admin',
           texto: 'Configuración',
           icono: 'fas fa-cog',
           ruta: '/admin/configuracion'
         }
       ],
       'vendedor': [ // Vendedor
         {
           id: 'dashboard-vendedor',
           texto: 'Dashboard',
           icono: 'fa fa-home',
           ruta: '/vendedor/dashboard'
         },
         {
           id: 'crear-cotizacion',
           texto: 'Crear Cotización',
           icono: 'fas fa-plus-circle',
           ruta: '/shared/cotizacion'
         },
         {
           id: 'historial-cotizaciones',
           texto: 'Mis Cotizaciones',
           icono: 'fas fa-file-invoice',
           ruta: '/vendedor/cotizaciones',
         },
         {
           id: 'configuracion-vendedor',
           texto: 'Configuración',
           icono: 'fas fa-cog',
           ruta: '/vendedor/configuracion'
         }
       ],
       'super_usuario': [ // SuperUsuario
         {
           id: 'dashboard-super',
           texto: 'Dashboard',
           icono: 'fa fa-home',
           ruta: '/super/dashboard'
         },
         {
           id: 'cotizaciones-super',
           texto: 'Cotizaciones',
           icono: 'fas fa-file-invoice',
           ruta: '/super/cotizaciones',
         },
         {
           id: 'crear-cotizacion-super',
           texto: 'Crear Cotización',
           icono: 'fas fa-plus-circle',
           ruta: '/shared/cotizacion'
         },
         {
           id: 'reportes-super',
           texto: 'Reportes',
           icono: 'fas fa-chart-line',
           ruta: '/super/reportes'
         },
         {
           id: 'configuracion-super',
           texto: 'Configuración',
           icono: 'fas fa-cog',
           ruta: '/super/configuracion'
         }
       ]
     };

     return menus[this.usuarioActual.tipo_usuario] || menus['vendedor'];
   }
 },
 mounted() {
   this.checkMobile();
   this.loadUserData();
   this.setupConnectionListener();
   window.addEventListener('resize', this.checkMobile);
 },
 beforeUnmount() {
   window.removeEventListener('resize', this.checkMobile);
   window.removeEventListener('online', this.handleOnline);
   window.removeEventListener('offline', this.handleOffline);
 },
 watch: {
   $route(to) {
     this.rutaActiva = to.path;
   }
 },
 methods: {
   handleLogoError(event) {
     // Crear un fallback visual
     event.target.style.display = 'none';
     const fallback = document.createElement('div');
     fallback.innerHTML = '<span class="logo-text-fallback">Perdomo y Asociados</span>';
     fallback.className = 'logo-fallback';
     event.target.parentNode.appendChild(fallback);
   },

   async loadUserData() {
     try {
       // Primero intentar obtener del servicio de auth
       const currentUser = authService.getCurrentUser();
       
       if (currentUser) {
         this.usuarioActual = {
           id: currentUser.id,
           nombre_completo: currentUser.nombre_completo || currentUser.nombre,
           correo: currentUser.correo,
           usuario: currentUser.usuario,
           tipo_usuario: currentUser.tipo_usuario,
           telefono: currentUser.telefono,
           iniciales: this.generateInitials(currentUser.nombre_completo || currentUser.nombre),
           rolTexto: this.getTipoUsuarioTexto(currentUser.tipo_usuario)
         };
       } else {
         console.warn('⚠️ No se encontraron datos del usuario');
         
         // Verificar autenticación con el backend
         const result = await authService.checkAuth();
         
         if (result.success) {
           this.usuarioActual = {
             id: result.user.id,
             nombre_completo: result.user.nombre_completo,
             correo: result.user.correo,
             usuario: result.user.usuario,
             tipo_usuario: result.user.tipo_usuario,
             telefono: result.user.telefono,
             iniciales: this.generateInitials(result.user.nombre_completo),
             rolTexto: this.getTipoUsuarioTexto(result.user.tipo_usuario)
           };
         }
       }
       
     } catch (error) {
       console.error('❌ Error cargando datos del usuario:', error);
     }
   },
   
   generateInitials(nombreCompleto) {
     if (!nombreCompleto) return 'U';
     
     const nombres = nombreCompleto.trim().split(' ');
     
     if (nombres.length >= 2) {
       return (nombres[0][0] + nombres[1][0]).toUpperCase();
     } else {
       return nombres[0].substring(0, 2).toUpperCase();
     }
   },
   
   getTipoUsuarioTexto(tipoUsuario) {
     const tipos = {
       'admin': 'Administrador',
       'vendedor': 'Vendedor',
       'super_usuario': 'SuperUsuario'
     };
     return tipos[tipoUsuario] || 'Usuario';
   },
   
   setupConnectionListener() {
     window.addEventListener('online', this.handleOnline);
     window.addEventListener('offline', this.handleOffline);
   },
   
   handleOnline() {
     this.isOnline = true;
   },
   
   handleOffline() {
     this.isOnline = false;
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
   
   // MÉTODOS PARA EL MODAL
   mostrarModalCerrarSesion() {
     this.modalCerrarSesion = true;
     this.logoutAllSessions = false;
   },
   
   cerrarModalCerrarSesion() {
     if (!this.isLoggingOut) {
       this.modalCerrarSesion = false;
       this.logoutAllSessions = false;
     }
   },
   
   async confirmarCerrarSesion() {
     if (this.isLoggingOut) return;
     
     this.isLoggingOut = true;
     
     try { 
       if (this.logoutAllSessions) {
         await authService.logoutAll();
       } else {
         await authService.logout();
       }
       // Cerrar modal
       this.modalCerrarSesion = false;
       
       // Detener heartbeat
       authService.stopHeartbeat();
       
       // Pequeño delay para que se vea el cambio
       setTimeout(() => {
         // Redirigir al login
         this.$router.push('/login');
       }, 500);
       
     } catch (error) {
       console.error('❌ Error al cerrar sesión:', error);
       
       // Incluso si hay error, limpiar localmente y redirigir
       authService.clearLocalUserData();
       authService.stopHeartbeat();
       
       this.modalCerrarSesion = false;
       
       setTimeout(() => {
         this.$router.push('/login');
       }, 500);
       
     } finally {
       this.isLoggingOut = false;
       this.logoutAllSessions = false;
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
 justify-content: center;
 width: 100%;
}

/* Imagen del logo */
.logo-img {
 height: 40px;
 width: auto;
 max-width: 200px;
 filter: brightness(1.1);
 transition: all 0.3s ease;
}

.logo-img:hover {
 filter: brightness(1.2);
 transform: scale(1.02);
}

/* Fallback para cuando no carga el logo */
.logo-fallback {
 display: flex;
 align-items: center;
 justify-content: center;
 width: 100%;
}

.logo-text-fallback {
 font-size: 1.2rem;
 font-weight: bold;
 color: #d4af37;
 text-align: center;
 line-height: 1.2;
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
 font-size: 1rem;
 font-weight: bold;
 box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
 flex-shrink: 0;
}

/* Botón cuando sidebar está contraído */
.sidebar-cerrado .btn-toggle {
 width: 45px;
 height: 45px;
 font-size: 1.1rem;
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

.btn-toggle i {
 transition: transform 0.2s ease;
}

.btn-toggle:hover i {
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

.user-email {
 margin: 0;
 font-size: 0.75rem;
 color: #95a5a6;
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
 font-size: 1.1rem;
 width: 24px;
 text-align: center;
 flex-shrink: 0;
 display: flex;
 align-items: center;
 justify-content: center;
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

.btn-logout:disabled {
 opacity: 0.6;
 cursor: not-allowed;
}

.sidebar-cerrado .btn-logout {
 padding: 0.75rem 0.5rem;
 min-height: 45px;
}

.btn-logout:hover:not(:disabled) {
 background: rgba(231, 76, 60, 0.3);
 border-color: rgba(231, 76, 60, 0.5);
 transform: translateY(-1px);
}

.logout-icon {
 font-size: 1.1rem;
}

/* ESTILOS DEL MODAL DE CERRAR SESIÓN */
.modal-overlay {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(0, 0, 0, 0.6);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 2000;
 padding: 1rem;
 backdrop-filter: blur(4px);
}

.modal-content {
 background: white;
 border-radius: 16px;
 max-width: 500px;
 width: 100%;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
 animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
 from {
   opacity: 0;
   transform: scale(0.9) translateY(-20px);
 }
 to {
   opacity: 1;
   transform: scale(1) translateY(0);
 }
}

.modal-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 1.5rem 2rem;
 border-bottom: 1px solid #e9ecef;
 background: #f8f9fa;
 border-radius: 16px 16px 0 0;
}

.modal-title {
 margin: 0;
 color: #2c3e50;
 font-size: 1.3rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.75rem;
}

.modal-title i {
 color: #e74c3c;
 font-size: 1.2rem;
}

.btn-close {
 background: none;
 border: none;
 font-size: 1.3rem;
 cursor: pointer;
 color: #7f8c8d;
 padding: 0.5rem;
 border-radius: 50%;
 transition: all 0.3s ease;
 width: 40px;
 height: 40px;
 display: flex;
 align-items: center;
 justify-content: center;
}

.btn-close:hover {
 background: #e9ecef;
 color: #e74c3c;
 transform: scale(1.1);
}

.modal-body {
 padding: 2rem;
}

.logout-content {
 text-align: center;
}

.logout-icon-large {
 font-size: 4rem;
 color: #f39c12;
 margin-bottom: 1.5rem;
}

.logout-message h4 {
 color: #2c3e50;
 margin-bottom: 0.75rem;
 font-size: 1.3rem;
 font-weight: 600;
}

.logout-message p {
 color: #7f8c8d;
 margin-bottom: 2rem;
 line-height: 1.5;
 font-size: 1rem;
}

.user-info-logout {
 display: flex;
 align-items: center;
 gap: 1rem;
 background: #f8f9fa;
 padding: 1.5rem;
 border-radius: 12px;
 border-left: 4px solid #3498db;
 margin-bottom: 1.5rem;
}

.user-avatar-logout {
 width: 50px;
 height: 50px;
 border-radius: 50%;
 background: linear-gradient(135deg, #3498db, #2980b9);
 display: flex;
 align-items: center;
 justify-content: center;
 font-weight: bold;
 font-size: 1.2rem;
 color: white;
 flex-shrink: 0;
}

.user-details-logout {
 flex: 1;
 text-align: left;
}

.user-name-logout {
 margin: 0;
 font-size: 1.1rem;
 font-weight: 600;
 color: #2c3e50;
}

.user-role-logout {
 margin: 0;
 font-size: 0.9rem;
 color: #7f8c8d;
}

.user-email-logout {
 margin: 0;
 font-size: 0.85rem;
 color: #95a5a6;
}

/* Opciones de logout */
.logout-options {
 margin-top: 1.5rem;
 text-align: left;
}

.logout-option {
 background: #f8f9fa;
 padding: 1rem;
 border-radius: 8px;
 border: 1px solid #e9ecef;
}

.checkbox-container {
 display: flex;
 align-items: flex-start;
 cursor: pointer;
 font-size: 0.9rem;
 color: #2c3e50;
 gap: 0.75rem;
}

.checkbox-input {
 display: none;
}

.checkbox-mark {
 width: 20px;
 height: 20px;
 border: 2px solid #cbd5e1;
 border-radius: 4px;
 position: relative;
 transition: all 0.3s ease;
 flex-shrink: 0;
 margin-top: 2px;
}

.checkbox-input:checked + .checkbox-mark {
 background: #e74c3c;
 border-color: #e74c3c;
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

.checkbox-text {
 font-weight: 600;
 color: #2c3e50;
}

.option-description {
 margin: 0.5rem 0 0 2.75rem;
 font-size: 0.8rem;
 color: #7f8c8d;
 line-height: 1.4;
}

.modal-footer {
 display: flex;
 justify-content: flex-end;
 gap: 1rem;
 padding: 1.5rem 2rem;
 border-top: 1px solid #e9ecef;
 background: #f8f9fa;
 border-radius: 0 0 16px 16px;
}

.btn {
 padding: 0.75rem 1.5rem;
 border: none;
 border-radius: 8px;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 display: inline-flex;
 align-items: center;
 gap: 0.5rem;
 font-size: 0.9rem;
 min-width: 120px;
 justify-content: center;
}

.btn:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 transform: none !important;
}

.btn-secondary {
 background: #95a5a6;
 color: white;
}

.btn-secondary:hover:not(:disabled) {
 background: #7f8c8d;
 transform: translateY(-1px);
}

.btn-danger {
 background: #e74c3c;
 color: white;
}

.btn-danger:hover:not(:disabled) {
 background: #c0392b;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
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

 .logo-img {
   height: 35px;
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
   font-size: 0.9rem;
 }

 .modal-content {
   margin: 0.5rem;
   max-width: calc(100vw - 1rem);
 }

 .modal-header,
 .modal-footer {
   padding: 1rem 1.5rem;
 }

 .modal-body {
   padding: 1.5rem;
 }

 .modal-footer {
   flex-direction: column;
 }

 .btn {
   width: 100%;
 }

 .user-info-logout {
   flex-direction: column;
   text-align: center;
   gap: 1rem;
 }

 .user-details-logout {
   text-align: center;
 }
}

@media (max-width: 480px) {
 .sidebar-abierto {
   width: 100vw;
 }

 .logo-img {
   height: 30px;
 }

 .user-name {
   font-size: 0.9rem;
 }

 .user-role {
   font-size: 0.75rem;
 }

 .user-email {
   font-size: 0.7rem;
 }

 .nav-text {
   font-size: 0.85rem;
 }

 .modal-title {
   font-size: 1.1rem;
 }

 .logout-message h4 {
   font-size: 1.1rem;
 }

 .logout-message p {
   font-size: 0.9rem;
 }

 .checkbox-text {
   font-size: 0.85rem;
 }

 .option-description {
   font-size: 0.75rem;
 }
}

/* Animaciones para loading */
@keyframes spin {
 0% { transform: rotate(0deg); }
 100% { transform: rotate(360deg); }
}

.fa-spin {
 animation: spin 1s linear infinite;
}

/* Estados de conexión */
.status-indicator {
 transition: all 0.3s ease;
}

.status-indicator.online i {
 text-shadow: 0 0 8px rgba(39, 174, 96, 0.5);
}

.status-indicator.offline i {
 text-shadow: 0 0 8px rgba(231, 76, 60, 0.5);
}

/* Mejoras de accesibilidad */
.btn:focus,
.checkbox-container:focus {
 outline: 2px solid #3498db;
 outline-offset: 2px;
}

/* Transiciones suaves */
.sidebar * {
 transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

/* Efectos hover mejorados */
.checkbox-container:hover .checkbox-mark {
 border-color: #e74c3c;
 transform: scale(1.05);
}

.user-info:hover .user-avatar {
 transform: scale(1.05);
}

/* Indicadores visuales mejorados */
.nav-link.active {
 position: relative;
 overflow: hidden;
}

.nav-link.active::after {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
 animation: shimmer 2s infinite;
}

@keyframes shimmer {
 0% { transform: translateX(-100%); }
 100% { transform: translateX(100%); }
}
</style>