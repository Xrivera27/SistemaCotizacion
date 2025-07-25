<template>
 <div class="admin-usuarios-container">
   <!-- Loading overlay -->
   <div v-if="loading" class="loading-overlay">
     <div class="loading-spinner">
       <i class="fas fa-spinner fa-spin"></i>
       <span>{{ loadingMessage }}</span>
     </div>
   </div>

   <!-- Header de la página -->
   <div class="page-header">
     <div class="header-content">
       <h1 class="page-title">Gestión de Usuarios</h1>
       <p class="page-subtitle">Administración y control de todos los usuarios del sistema</p>
     </div>
     <div class="header-actions">
       <button class="btn btn-primary" @click="nuevoUsuario">
         <i class="fas fa-plus btn-icon"></i>
         Nuevo Usuario
       </button>
       <button class="btn btn-secondary" @click="cargarUsuarios">
         <i class="fas fa-sync-alt btn-icon"></i>
         Actualizar
       </button>
     </div>
   </div>

   <!-- Filtros y búsqueda -->
   <div class="filtros-section">
     <div class="filtros-container">
       <div class="search-box">
         <i class="fas fa-search search-icon"></i>
         <input
           v-model="filtros.busqueda"
           type="text"
           placeholder="Buscar por nombre, correo, usuario..."
           class="search-input"
           @input="buscarUsuarios"
         />
       </div>
       
       <div class="filtros-grid">
         <select v-model="filtros.tipoUsuario" class="filter-select" @change="aplicarFiltros">
           <option value="">Todos los tipos</option>
           <option value="admin">Administrador</option>
           <option value="vendedor">Vendedor</option>
           <option value="super_usuario">SuperUsuario</option>
         </select>
         
         <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
           <option value="">Todos los estados</option>
           <option value="activo">Activos</option>
           <option value="inactivo">Inactivos</option>
         </select>
         
         <select v-model="itemsPorPagina" class="filter-select" @change="cambiarItemsPorPagina">
           <option value="10">10 por página</option>
           <option value="25">25 por página</option>
           <option value="50">50 por página</option>
           <option value="100">100 por página</option>
         </select>
         
         <button class="btn btn-secondary" @click="limpiarFiltros">
           Limpiar Filtros
         </button>
       </div>
     </div>
   </div>

   <!-- Estadísticas rápidas - CORREGIDO: Agregada tarjeta de SuperUsuarios -->
   <div class="estadisticas-grid">
     <div class="stat-card total">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.total }}</div>
         <div class="stat-label">Total Usuarios</div>
       </div>
     </div>
     
     <div class="stat-card activos">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.activos }}</div>
         <div class="stat-label">Usuarios Activos</div>
       </div>
     </div>
     
     <div class="stat-card admins">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.por_tipo.administradores }}</div>
         <div class="stat-label">Administradores</div>
       </div>
     </div>
     
     <div class="stat-card vendedores">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.por_tipo.vendedores }}</div>
         <div class="stat-label">Vendedores</div>
       </div>
     </div>

     <!-- NUEVO: Tarjeta de SuperUsuarios -->
     <div class="stat-card super-usuarios">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.por_tipo.super_usuarios }}</div>
         <div class="stat-label">SuperUsuarios</div>
       </div>
     </div>

     <div class="stat-card inactivos">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.inactivos }}</div>
         <div class="stat-label">Usuarios Inactivos</div>
       </div>
     </div>
   </div>

   <!-- Usuarios section -->
   <div class="usuarios-section">
     <div class="section-header">
       <h2 class="section-title">
         {{ pagination ? pagination.totalItems : usuarios.length }} Usuarios encontrados
       </h2>
       <div class="view-controls">
         <button 
           class="view-btn"
           :class="{ active: vistaActual === 'tabla' }"
           @click="vistaActual = 'tabla'"
         >
           <i class="fas fa-table"></i> Tabla
         </button>
         <button 
           class="view-btn"
           :class="{ active: vistaActual === 'tarjetas' }"
           @click="vistaActual = 'tarjetas'"
         >
           <i class="fas fa-th-large"></i> Tarjetas
         </button>
       </div>
     </div>

     <!-- Información de paginación superior -->
     <div v-if="pagination" class="paginacion-info">
       <span class="items-info">
         Mostrando {{ pagination.totalItems > 0 ? ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) : 0 }} - 
         {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} 
         de {{ pagination.totalItems }} usuarios
       </span>
       <div class="pagination-jump" v-if="pagination.totalPages > 1">
         <label for="jump-page">Ir a página:</label>
         <input 
           id="jump-page"
           type="number" 
           v-model.number="paginaSalto" 
           @keyup.enter="irAPagina"
           :min="1" 
           :max="pagination.totalPages"
           class="page-input"
         >
         <button class="btn btn-sm btn-outline" @click="irAPagina">
           <i class="fas fa-arrow-right"></i>
         </button>
       </div>
     </div>

     <!-- Vista de tabla -->
     <div v-if="vistaActual === 'tabla'" class="tabla-container">
       <div class="tabla-wrapper">
         <table class="usuarios-tabla">
           <thead>
             <tr>
               <th>ID</th>
               <th>Nombre Completo</th>
               <th>Correo Electrónico</th>
               <th>Usuario</th>
               <th>Tipo de Usuario</th>
               <th>Estado</th>
               <th>Acciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="usuario in usuarios" :key="usuario.usuarios_id">
               <td>
                 <span class="usuario-id">#{{ String(usuario.usuarios_id).padStart(4, '0') }}</span>
               </td>
               <td>
                 <div class="usuario-info">
                   <span class="usuario-nombre">{{ usuario.nombre_completo }}</span>
                 </div>
               </td>
               <td>
                 <span class="usuario-correo">{{ usuario.correo }}</span>
               </td>
               <td>
                 <span class="usuario-username">{{ usuario.usuario }}</span>
               </td>
               <td>
                 <span class="tipo-badge" :class="usuario.tipo_usuario">
                   {{ getTipoTexto(usuario.tipo_usuario) }}
                 </span>
               </td>
               <td>
                 <span class="estado-badge" :class="usuario.estado">
                   {{ getEstadoTexto(usuario.estado) }}
                 </span>
               </td>
               <td>
                 <div class="acciones">
                   <button 
                     class="btn-accion ver"
                     @click="verUsuario(usuario)"
                     title="Ver detalles"
                   >
                     <i class="fas fa-eye"></i>
                   </button>
                   <button 
                     class="btn-accion editar"
                     @click="editarUsuario(usuario)"
                     title="Editar usuario"
                   >
                     <i class="fas fa-edit"></i>
                   </button>
                   <button 
                     class="btn-accion" 
                     :class="usuario.estado === 'activo' ? 'deshabilitar' : 'habilitar'"
                     @click="mostrarModalCambiarEstado(usuario)"
                     :title="usuario.estado === 'activo' ? 'Deshabilitar cuenta' : 'Habilitar cuenta'"
                   >
                     <i :class="usuario.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
                   </button>
                 </div>
               </td>
             </tr>
           </tbody>
         </table>
       </div>
     </div>

     <!-- Vista de tarjetas -->
     <div v-if="vistaActual === 'tarjetas'" class="tarjetas-container">
       <div class="tarjetas-grid">
         <div 
           v-for="usuario in usuarios" 
           :key="usuario.usuarios_id"
           class="usuario-card"
         >
           <div class="card-header">
             <div class="card-numero">#{{ String(usuario.usuarios_id).padStart(4, '0') }}</div>
             <span class="estado-badge" :class="usuario.estado">
               {{ getEstadoTexto(usuario.estado) }}
             </span>
           </div>
           
           <div class="card-content">
             <h3 class="usuario-nombre-card">{{ usuario.nombre_completo }}</h3>
             <p class="usuario-email-card">{{ usuario.correo }}</p>
             
             <div class="usuario-details">
               <div class="detail">
                 <span class="detail-label">Usuario:</span>
                 <span class="detail-value usuario-username-card">{{ usuario.usuario }}</span>
               </div>
               
               <div class="detail">
                 <span class="detail-label">Tipo:</span>
                 <span class="tipo-badge" :class="usuario.tipo_usuario">
                   {{ getTipoTexto(usuario.tipo_usuario) }}
                 </span>
               </div>
               
               <div class="detail">
                 <span class="detail-label">Teléfono:</span>
                 <span class="detail-value">{{ usuario.telefono || 'No registrado' }}</span>
               </div>
               
               <div class="detail">
                 <span class="detail-label">Registro:</span>
                 <span class="detail-value">{{ formatearFecha(usuario.created_at) }}</span>
               </div>
             </div>
           </div>
           
           <div class="card-actions">
             <button class="btn btn-sm btn-outline" @click="verUsuario(usuario)">
               Ver Detalles
             </button>
             <button class="btn btn-sm btn-primary" @click="editarUsuario(usuario)">
               <i class="fas fa-edit"></i> Editar
             </button>
             <button 
               class="btn btn-sm"
               :class="usuario.estado === 'activo' ? 'btn-danger' : 'btn-success'"
               @click="mostrarModalCambiarEstado(usuario)"
             >
               <i :class="usuario.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
               {{ usuario.estado === 'activo' ? 'Deshabilitar' : 'Habilitar' }}
             </button>
           </div>
         </div>
       </div>
     </div>

     <!-- Mensaje cuando no hay usuarios -->
     <div v-if="usuarios.length === 0 && !loading" class="empty-state">
       <div class="empty-icon"><i class="fas fa-users"></i></div>
       <h3 class="empty-title">No hay usuarios</h3>
       <p class="empty-description">
         {{ filtros.busqueda || filtros.tipoUsuario || filtros.estado 
           ? 'No se encontraron usuarios con los filtros aplicados.' 
           : 'Aún no se han registrado usuarios en el sistema.' }}
       </p>
       <button class="btn btn-primary" @click="nuevoUsuario">
         <i class="fas fa-plus"></i>
         Crear Primer Usuario
       </button>
     </div>

     <!-- Paginación -->
     <div v-if="pagination && pagination.totalPages > 1" class="paginacion-completa">
       <div class="paginacion">
         <button 
           class="btn-pag"
           @click="irAPrimera"
           :disabled="pagination.currentPage === 1"
           title="Primera página"
         >
           <i class="fas fa-angle-double-left"></i>
         </button>

         <button 
           class="btn-pag"
           @click="paginaAnterior"
           :disabled="!pagination.hasPrevPage"
           title="Página anterior"
         >
           <i class="fas fa-chevron-left"></i>
         </button>
         
         <div class="paginas">
           <button
             v-for="pagina in paginasVisibles"
             :key="pagina"
             class="btn-pag"
             :class="{ active: pagina === pagination.currentPage }"
             @click="irAPagina(pagina)"
           >
             {{ pagina }}
           </button>
         </div>
         
         <button 
           class="btn-pag"
           @click="paginaSiguiente"
           :disabled="!pagination.hasNextPage"
           title="Página siguiente"
         >
           <i class="fas fa-chevron-right"></i>
         </button>

         <button 
           class="btn-pag"
           @click="irAUltima"
           :disabled="pagination.currentPage === pagination.totalPages"
           title="Última página"
         >
           <i class="fas fa-angle-double-right"></i>
         </button>
       </div>

       <div class="paginacion-info-bottom">
         <span class="pagina-actual">
           Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
         </span>
       </div>
     </div>
   </div>

   <!-- Modal de vista previa -->
   <div v-if="modalUsuario" class="modal-overlay" @click="cerrarModal">
     <div class="modal-content" @click.stop>
       <div class="modal-header">
         <h3>Usuario #{{ String(modalUsuario.usuarios_id).padStart(4, '0') }}</h3>
         <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <div class="usuario-detalle">
           <div class="detalle-grid">
             <div class="detalle-item">
               <strong><i class="fas fa-user"></i> Nombre Completo:</strong> {{ modalUsuario.nombre_completo }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-envelope"></i> Correo Electrónico:</strong> {{ modalUsuario.correo }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-at"></i> Usuario:</strong> {{ modalUsuario.usuario }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-user-tag"></i> Tipo de Usuario:</strong> 
               <span class="tipo-badge" :class="modalUsuario.tipo_usuario">
                 {{ getTipoTexto(modalUsuario.tipo_usuario) }}
               </span>
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-phone"></i> Teléfono:</strong> {{ modalUsuario.telefono || 'No registrado' }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-calendar-alt"></i> Fecha de Registro:</strong> {{ formatearFecha(modalUsuario.created_at) }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
               <span class="estado-badge" :class="modalUsuario.estado">
                 {{ getEstadoTexto(modalUsuario.estado) }}
               </span>
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-clock"></i> Última Actualización:</strong> {{ formatearFecha(modalUsuario.updated_at) }}
             </div>
           </div>
         </div>
       </div>
       <div class="modal-footer">
         <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
         <button class="btn btn-primary" @click="editarUsuario(modalUsuario)">
           Editar Usuario
         </button>
       </div>
     </div>
   </div>

   <!-- Modal de formulario - CORREGIDO: Agregado campo de contraseña para edición -->
   <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
     <div class="modal-content modal-formulario" @click.stop>
       <div class="modal-header">
         <h3>{{ usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
         <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <form @submit.prevent="guardarUsuario" class="formulario-usuario">
           <div class="form-grid">
             <div class="form-group">
               <label for="nombreCompleto">Nombre Completo *</label>
               <input 
                 id="nombreCompleto"
                 v-model="formulario.nombre_completo" 
                 type="text" 
                 required 
                 class="form-input"
                 placeholder="Ingrese el nombre completo"
               >
             </div>
             
             <div class="form-group">
               <label for="correo">Correo Electrónico *</label>
               <input 
                 id="correo"
                 v-model="formulario.correo" 
                 type="email" 
                 required 
                 class="form-input"
                 placeholder="correo@ejemplo.com"
               >
             </div>
             
             <div class="form-group">
               <label for="usuario">Usuario *</label>
               <input 
                 id="usuario"
                 v-model="formulario.usuario" 
                 type="text" 
                 required 
                 class="form-input"
                 placeholder="Nombre de usuario"
               >
             </div>
             
             <div class="form-group">
               <label for="telefono">Teléfono</label>
               <input 
                 id="telefono"
                 v-model="formulario.telefono" 
                 type="tel" 
                 class="form-input"
                 placeholder="+504 0000-0000"
               >
             </div>
             
             <div class="form-group">
               <label for="tipoUsuario">Tipo de Usuario *</label>
               <select id="tipoUsuario" v-model="formulario.tipo_usuario" required class="form-select">
                 <option value="">Seleccione un tipo</option>
                 <option value="admin">Administrador</option>
                 <option value="vendedor">Vendedor</option>
                 <option value="super_usuario">SuperUsuario</option>
               </select>
             </div>
             
             <!-- NUEVO: Campo de contraseña siempre visible, opcional para edición -->
             <div class="form-group">
               <label for="password">
                 {{ usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña *' }}
               </label>
               <div class="password-input">
                 <input 
                   id="password"
                   v-model="formulario.password" 
                   :type="mostrarPassword ? 'text' : 'password'"
                   :required="!usuarioEditando" 
                   class="form-input"
                   :placeholder="usuarioEditando ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'"
                 >
                 <button 
                   type="button" 
                   class="password-toggle"
                   @click="mostrarPassword = !mostrarPassword"
                 >
                   <i :class="mostrarPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                 </button>
               </div>
               <!-- NUEVO: Mensaje de ayuda para edición -->
               <small v-if="usuarioEditando" class="password-help">
                 <i class="fas fa-info-circle"></i>
                 Solo ingrese una nueva contraseña si desea cambiarla. Dejar vacío mantendrá la contraseña actual.
               </small>
             </div>
             
             <div class="form-group" v-if="usuarioEditando">
               <label for="estado">Estado</label>
               <select id="estado" v-model="formulario.estado" class="form-select">
                 <option value="activo">Activo</option>
                 <option value="inactivo">Inactivo</option>
               </select>
             </div>
           </div>
           
           <!-- Errores de validación -->
           <div v-if="erroresFormulario.length > 0" class="form-errors">
             <div class="error-item" v-for="error in erroresFormulario" :key="error.field">
               <i class="fas fa-exclamation-triangle"></i>
               <span>{{ error.message }}</span>
             </div>
           </div>
         </form>
       </div>
       <div class="modal-footer">
         <button type="button" class="btn btn-outline" @click="cerrarModalFormulario">Cancelar</button>
         <button 
           type="button" 
           class="btn btn-primary" 
           @click="guardarUsuario"
           :disabled="guardandoUsuario"
         >
           
           {{ guardandoUsuario ? 'Guardando...' : (usuarioEditando ? 'Actualizar' : 'Crear') }} Usuario
         </button>
       </div>
     </div>
   </div>

   <!-- Modal de confirmación para cambiar estado -->
   <div v-if="modalCambiarEstado" class="modal-overlay" @click="cerrarModalCambiarEstado">
     <div class="modal-content modal-confirmacion" @click.stop>
       <div class="modal-header">
         <h3>
           <i :class="usuarioParaCambiarEstado.estado === 'activo' ? 'fas fa-ban text-danger' : 'fas fa-check text-success'"></i>
           {{ usuarioParaCambiarEstado.estado === 'activo' ? 'Deshabilitar Cuenta' : 'Habilitar Cuenta' }}
         </h3>
         <button class="btn-close" @click="cerrarModalCambiarEstado">
           <i class="fas fa-times"></i>
         </button>
       </div>
       
       <div class="modal-body">
         <div class="confirmacion-content">
           <div class="usuario-info-resumen">
             <div class="usuario-avatar" :class="usuarioParaCambiarEstado.tipo_usuario">
               <i class="fas fa-user"></i>
             </div>
             <div class="usuario-datos">
               <h4>{{ usuarioParaCambiarEstado.nombre_completo }}</h4>
               <p class="usuario-email">{{ usuarioParaCambiarEstado.correo }}</p>
               <div class="usuario-badges">
                 <span class="usuario-id">#{{ String(usuarioParaCambiarEstado.usuarios_id).padStart(4, '0') }}</span>
                 <span class="tipo-badge" :class="usuarioParaCambiarEstado.tipo_usuario">
                   {{ getTipoTexto(usuarioParaCambiarEstado.tipo_usuario) }}
                 </span>
               </div>
             </div>
           </div>
           
           <div class="mensaje-confirmacion">
             <div class="icono-estado" :class="usuarioParaCambiarEstado.estado === 'activo' ? 'desactivar' : 'activar'">
               <i :class="usuarioParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
             </div>
             
             <div class="texto-confirmacion">
               <p class="pregunta-principal">
                 ¿Está seguro que desea 
                 <strong :class="usuarioParaCambiarEstado.estado === 'activo' ? 'text-danger' : 'text-success'">
                   {{ usuarioParaCambiarEstado.estado === 'activo' ? 'deshabilitar' : 'habilitar' }}
                 </strong> 
                 la cuenta de este usuario?
               </p>
               
               <div class="advertencia-estado" v-if="usuarioParaCambiarEstado.estado === 'activo'">
                 <i class="fas fa-exclamation-triangle"></i>
                 <span>Al deshabilitar este usuario, no podrá acceder al sistema hasta que sea habilitado nuevamente.</span>
               </div>
               
               <div class="info-estado" v-else>
                 <i class="fas fa-info-circle"></i>
                 <span>Al habilitar este usuario, podrá acceder al sistema y realizar sus funciones normalmente.</span>
               </div>
             </div>
           </div>
           
           <div class="cambio-estado-visual">
             <div class="estado-actual">
               <span class="label">Estado actual:</span>
               <span class="estado-badge" :class="usuarioParaCambiarEstado.estado">
                 {{ getEstadoTexto(usuarioParaCambiarEstado.estado) }}
               </span>
             </div>
             
             <div class="flecha-cambio">
               <i class="fas fa-arrow-right"></i>
             </div>
             
             <div class="estado-nuevo">
               <span class="label">Nuevo estado:</span>
               <span class="estado-badge" :class="usuarioParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo'">
                 {{ usuarioParaCambiarEstado.estado === 'activo' ? 'Inactivo' : 'Activo' }}
               </span>
             </div>
           </div>
         </div>
       </div>
       
       <div class="modal-footer">
         <button class="btn btn-outline" @click="cerrarModalCambiarEstado">
           
           Cancelar
         </button>
         <button 
           class="btn"
           :class="usuarioParaCambiarEstado.estado === 'activo' ? 'btn-danger' : 'btn-success'"
           @click="confirmarCambiarEstado"
           :disabled="cambiandoEstado"
         >
           
           {{ cambiandoEstado ? 'Procesando...' : (usuarioParaCambiarEstado.estado === 'activo' ? 'Deshabilitar' : 'Habilitar') }} Cuenta
         </button>
       </div>
     </div>
   </div>

   <!-- Toast de notificaciones -->
   <div v-if="notification.show" :class="['notification', `notification-${notification.type}`]">
     <i class="fas" :class="notification.icon"></i>
     <span>{{ notification.message }}</span>
     <button class="notification-close" @click="closeNotification">
       <i class="fas fa-times"></i>
     </button>
   </div>
 </div>
</template>

<script>
import usuariosService from '@/services/usuarios';

export default {
 name: 'AdminUsuarios',
 data() {
   return {
     loading: false,
     loadingMessage: 'Cargando usuarios...',
     vistaActual: 'tabla',
     modalUsuario: null,
     modalFormulario: false,
     modalCambiarEstado: false,
     usuarioEditando: null,
     usuarioParaCambiarEstado: null,
     mostrarPassword: false,
     guardandoUsuario: false,
     cambiandoEstado: false,
     paginaSalto: 1,
     itemsPorPagina: 25,
     
     // Datos reales del backend
     usuarios: [],
     pagination: null,
     estadisticas: {
       total: 0,
       activos: 0,
       inactivos: 0,
       por_tipo: {
         administradores: 0,
         vendedores: 0,
         super_usuarios: 0  // CORREGIDO: Agregado campo super_usuarios
       }
     },
     
     filtros: {
       busqueda: '',
       tipoUsuario: '',
       estado: ''
     },
     
     formulario: {
       nombre_completo: '',
       correo: '',
       usuario: '',
       telefono: '',
       tipo_usuario: '',
       password: '',
       estado: 'activo'
     },
     
     erroresFormulario: [],
     busquedaTimeout: null,
     
     // Sistema de notificaciones
     notification: {
       show: false,
       type: 'success',
       message: '',
       icon: 'fa-check'
     }
   }
 },
 
 computed: {
   paginasVisibles() {
     if (!this.pagination) return [];
     
     const total = this.pagination.totalPages;
     const actual = this.pagination.currentPage;
     const rango = 2;
     
     let inicio = Math.max(1, actual - rango);
     let fin = Math.min(total, actual + rango);
     
     if (fin - inicio < 4) {
       if (inicio === 1) {
         fin = Math.min(total, inicio + 4);
       } else if (fin === total) {
         inicio = Math.max(1, fin - 4);
       }
     }
     
     const paginas = [];
     for (let i = inicio; i <= fin; i++) {
       paginas.push(i);
     }
     return paginas;
   }
 },
 
 watch: {
   // Actualizar paginaSalto cuando cambie la página actual
   'pagination.currentPage'(newVal) {
     if (newVal) {
       this.paginaSalto = newVal;
     }
   }
 },
 
async mounted() {
  
  await this.cargarDatosIniciales();
},

methods: {
  // ==================== CARGA DE DATOS ====================
  async cargarDatosIniciales() {
    this.loading = true;
    this.loadingMessage = 'Cargando usuarios...';
    
    try {
      await Promise.all([
        this.cargarUsuarios(),
        this.cargarEstadisticas()
      ]);
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      this.showNotification('Error cargando datos del sistema', 'error');
    } finally {
      this.loading = false;
    }
  },
  
  async cargarUsuarios() {
    try {
      
      const params = {
        page: this.pagination?.currentPage || 1,
        limit: this.itemsPorPagina,
        search: this.filtros.busqueda || undefined,
        tipo_usuario: this.filtros.tipoUsuario || undefined,
        estado: this.filtros.estado || undefined
      };
      
      const result = await usuariosService.getUsuarios(params);
      
      if (result.success) {
        this.usuarios = result.usuarios;
        this.pagination = result.pagination;
      } else {
        this.showNotification(result.message || 'Error cargando usuarios', 'error');
      }
      
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      this.showNotification('Error de conexión al cargar usuarios', 'error');
    }
  },
  
  async cargarEstadisticas() {
    try {
      
      const result = await usuariosService.getEstadisticas();
      
      if (result.success) {
        this.estadisticas = result.estadisticas;

      } else {
        console.error('❌ Error cargando estadísticas:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  },
  
  // ==================== BÚSQUEDA Y FILTROS ====================
  buscarUsuarios() {
    // Debounce para evitar muchas llamadas
    clearTimeout(this.busquedaTimeout);
    this.busquedaTimeout = setTimeout(() => {
      this.aplicarFiltros();
    }, 500);
  },
  
  async aplicarFiltros() {
    
    // Resetear a la primera página
    if (this.pagination) {
      this.pagination.currentPage = 1;
    }
    
    await this.cargarUsuarios();
  },
  
  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      tipoUsuario: '',
      estado: ''
    };
    
    this.aplicarFiltros();
  },
  
  // ==================== PAGINACIÓN ====================
  async cambiarItemsPorPagina() {
    if (this.pagination) {
      this.pagination.currentPage = 1;
    }
    this.paginaSalto = 1;
    await this.cargarUsuarios();
  },
  
  async irAPrimera() {
    if (this.pagination && this.pagination.currentPage !== 1) {
      this.pagination.currentPage = 1;
      await this.cargarUsuarios();
    }
  },
  
  async irAUltima() {
    if (this.pagination && this.pagination.currentPage !== this.pagination.totalPages) {
      this.pagination.currentPage = this.pagination.totalPages;
      await this.cargarUsuarios();
    }
  },
  
  async paginaAnterior() {
    if (this.pagination && this.pagination.hasPrevPage) {
      this.pagination.currentPage--;
      await this.cargarUsuarios();
    }
  },
  
  async paginaSiguiente() {
    if (this.pagination && this.pagination.hasNextPage) {
      this.pagination.currentPage++;
      await this.cargarUsuarios();
    }
  },
  
  async irAPagina(pagina = null) {
    const targetPage = pagina || this.paginaSalto;
    
    if (this.pagination && targetPage >= 1 && targetPage <= this.pagination.totalPages) {
      this.pagination.currentPage = targetPage;
      await this.cargarUsuarios();
    } else {
      this.showNotification(`Por favor ingresa un número entre 1 y ${this.pagination?.totalPages || 1}`, 'warning');
      this.paginaSalto = this.pagination?.currentPage || 1;
    }
  },
  
  // ==================== GESTIÓN DE USUARIOS ====================
  nuevoUsuario() {
    this.usuarioEditando = null;
    this.limpiarFormulario();
    this.modalFormulario = true;
  },
  
  verUsuario(usuario) {
    this.modalUsuario = usuario;
  },

  editarUsuario(usuario) {
    this.usuarioEditando = usuario;
    this.llenarFormulario(usuario);
    this.modalFormulario = true;
    this.modalUsuario = null;
  },

  async guardarUsuario() {
    if (this.guardandoUsuario) return;
    
    this.erroresFormulario = [];
    
    // Validaciones básicas
    if (!this.validarFormulario()) {
      return;
    }
    
    this.guardandoUsuario = true;
    this.loadingMessage = this.usuarioEditando ? 'Actualizando usuario...' : 'Creando usuario...';
    
    try {
      let result;
      
      // CORREGIDO: Manejo de contraseña para edición
      const datosUsuario = { ...this.formulario };
      
      // Si estamos editando y no se ingresó nueva contraseña, eliminarla del objeto
      if (this.usuarioEditando && !datosUsuario.password?.trim()) {
        delete datosUsuario.password;
      }
      
      if (this.usuarioEditando) {
        // Actualizar usuario existente
        result = await usuariosService.updateUsuario(this.usuarioEditando.usuarios_id, datosUsuario);
      } else {
        // Crear nuevo usuario
        result = await usuariosService.createUsuario(datosUsuario);
      }
      
      if (result.success) {
        this.showNotification(
          result.message || (this.usuarioEditando ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'), 
          'success'
        );
        
        this.cerrarModalFormulario();
        
        // Recargar datos
        await Promise.all([
          this.cargarUsuarios(),
          this.cargarEstadisticas()
        ]);
        
      } else {
        // Manejar errores de validación
        if (result.errors) {
          this.erroresFormulario = result.errors;
        } else {
          this.showNotification(result.message || 'Error al guardar usuario', 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ Error guardando usuario:', error);
      this.showNotification('Error de conexión al guardar usuario', 'error');
    } finally {
      this.guardandoUsuario = false;
    }
  },
  
  validarFormulario() {
    const errores = [];
    
    if (!this.formulario.nombre_completo?.trim()) {
      errores.push({ field: 'nombre_completo', message: 'El nombre completo es requerido' });
    }
    
    if (!this.formulario.correo?.trim()) {
      errores.push({ field: 'correo', message: 'El correo es requerido' });
    } else if (!this.isValidEmail(this.formulario.correo)) {
      errores.push({ field: 'correo', message: 'Ingrese un correo válido' });
    }
    
    if (!this.formulario.usuario?.trim()) {
      errores.push({ field: 'usuario', message: 'El nombre de usuario es requerido' });
    }
    
    if (!this.formulario.tipo_usuario) {
      errores.push({ field: 'tipo_usuario', message: 'Seleccione un tipo de usuario' });
    }
    
    // CORREGIDO: Validación de contraseña mejorada para edición
    if (!this.usuarioEditando && !this.formulario.password) {
      errores.push({ field: 'password', message: 'La contraseña es requerida para usuarios nuevos' });
    }
    
    if (this.formulario.password && this.formulario.password.length < 6) {
      errores.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    this.erroresFormulario = errores;
    
    if (errores.length > 0) {
      this.showNotification('Por favor corrige los errores en el formulario', 'warning');
      return false;
    }
    
    return true;
  },
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  llenarFormulario(usuario) {
    this.formulario = {
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      usuario: usuario.usuario,
      telefono: usuario.telefono || '',
      tipo_usuario: usuario.tipo_usuario,
      password: '', // CORREGIDO: Siempre vacío para edición
      estado: usuario.estado
    };
  },

  limpiarFormulario() {
    this.formulario = {
      nombre_completo: '',
      correo: '',
      usuario: '',
      telefono: '',
      tipo_usuario: '',
      password: '',
      estado: 'activo'
    };
    this.erroresFormulario = [];
  },

  // ==================== CAMBIO DE ESTADO ====================
  mostrarModalCambiarEstado(usuario) {
    this.usuarioParaCambiarEstado = usuario;
    this.modalCambiarEstado = true;
  },

  async confirmarCambiarEstado() {
    if (this.cambiandoEstado || !this.usuarioParaCambiarEstado) return;
    
    this.cambiandoEstado = true;
    
    try {
      const nuevoEstado = this.usuarioParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo';
      
      let result;
      if (nuevoEstado === 'activo') {
        result = await usuariosService.restoreUsuario(this.usuarioParaCambiarEstado.usuarios_id);
      } else {
        result = await usuariosService.deleteUsuario(this.usuarioParaCambiarEstado.usuarios_id);
      }
      
      if (result.success) {
        const accion = nuevoEstado === 'activo' ? 'habilitada' : 'deshabilitada';
        this.showNotification(`Cuenta ${accion} exitosamente`, 'success');
        
        // Actualizar el estado local
        this.usuarioParaCambiarEstado.estado = nuevoEstado;
        
        // Recargar datos
        await Promise.all([
          this.cargarUsuarios(),
          this.cargarEstadisticas()
        ]);
        
      } else {
        this.showNotification(result.message || 'Error al cambiar estado del usuario', 'error');
      }
      
    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
      this.showNotification('Error de conexión al cambiar estado', 'error');
    } finally {
      this.cambiandoEstado = false;
      this.cerrarModalCambiarEstado();
    }
  },

  cerrarModalCambiarEstado() {
    this.modalCambiarEstado = false;
    this.usuarioParaCambiarEstado = null;
  },

  // ==================== MODALES ====================
  cerrarModal() {
    this.modalUsuario = null;
  },

  cerrarModalFormulario() {
    this.modalFormulario = false;
    this.usuarioEditando = null;
    this.limpiarFormulario();
    this.mostrarPassword = false;
  },

  // ==================== HELPERS ====================
  formatearFecha(fecha) {
    if (!fecha) return 'No disponible';
    
    try {
      return new Date(fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  },

  getTipoTexto(tipo) {
    const tipos = {
      admin: 'Administrador',
      vendedor: 'Vendedor',
      super_usuario: 'SuperUsuario'
    };
    return tipos[tipo] || tipo;
  },

  getEstadoTexto(estado) {
    const estados = {
      activo: 'Activo',
      inactivo: 'Inactivo'
    };
    return estados[estado] || estado;
  },
  
  // ==================== NOTIFICACIONES ====================
  showNotification(message, type = 'success') {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    this.notification = {
      show: true,
      type,
      message,
      icon: icons[type] || icons.info
    };
    
    // Auto-close después de 5 segundos
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  },
  
  closeNotification() {
    this.notification.show = false;
  }
},

// Limpiar timeouts al destruir el componente
beforeUnmount() {
  if (this.busquedaTimeout) {
    clearTimeout(this.busquedaTimeout);
  }
}
}
</script>

<style scoped>
/* Estilos base heredados del componente de cotizaciones */
.admin-usuarios-container {
padding: 2rem;
max-width: 1400px;
margin: 0 auto;
}

/* Loading overlay */
.loading-overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
z-index: 2000;
backdrop-filter: blur(4px);
}

.loading-spinner {
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
color: white;
font-size: 1.1rem;
}

.loading-spinner i {
font-size: 3rem;
color: #3498db;
}

.page-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 2rem;
gap: 2rem;
}

.header-content h1 {
font-size: 2.5rem;
font-weight: 700;
color: #2c3e50;
margin-bottom: 0.5rem;
}

.page-subtitle {
color: #7f8c8d;
font-size: 1.1rem;
margin: 0;
}

.header-actions {
flex-shrink: 0;
display: flex;
gap: 1rem;
}

.btn {
padding: 0.875rem 1.5rem;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s ease;
display: inline-flex;
align-items: center;
gap: 0.5rem;
text-decoration: none;
font-size: 0.9rem;
}

.btn:disabled {
opacity: 0.6;
cursor: not-allowed;
transform: none !important;
}

.btn-primary {
background: linear-gradient(135deg, #3498db, #2980b9);
color: white;
}

.btn-primary:hover:not(:disabled) {
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
background: #95a5a6;
color: white;
}

.btn-secondary:hover:not(:disabled) {
background: #7f8c8d;
}

.btn-outline {
background: transparent;
color: #3498db;
border: 2px solid #3498db;
}

.btn-outline:hover:not(:disabled) {
background: #3498db;
color: white;
}

.btn-danger {
background: #e74c3c;
color: white;
}

.btn-danger:hover:not(:disabled) {
background: #c0392b;
}

.btn-success {
background: #27ae60;
color: white;
}

.btn-success:hover:not(:disabled) {
background: #219a52;
}

.btn-sm {
padding: 0.5rem 1rem;
font-size: 0.85rem;
}

/* Filtros */
.filtros-section {
background: white;
border-radius: 12px;
padding: 1.5rem;
margin-bottom: 2rem;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filtros-container {
display: grid;
gap: 1rem;
}

.search-box {
position: relative;
max-width: 400px;
}

.search-icon {
position: absolute;
left: 1rem;
top: 50%;
transform: translateY(-50%);
font-size: 1.2rem;
color: #7f8c8d;
}

.search-input {
width: 100%;
padding: 0.875rem 1rem 0.875rem 3rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 1rem;
transition: border-color 0.3s ease;
}

.search-input:focus {
outline: none;
border-color: #3498db;
}

.filtros-grid {
display: flex;
gap: 1rem;
flex-wrap: wrap;
align-items: center;
}

.filter-select {
padding: 0.75rem 1rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 0.9rem;
min-width: 180px;
cursor: pointer;
}

/* Estadísticas */
.estadisticas-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1.5rem;
margin-bottom: 2rem;
}

.stat-card {
background: white;
border-radius: 12px;
padding: 1.5rem;
display: flex;
align-items: center;
gap: 1rem;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
transition: transform 0.3s ease;
}

.stat-card:hover {
transform: translateY(-2px);
}

.stat-number {
font-size: 2rem;
font-weight: 700;
color: #2c3e50;
line-height: 1;
}

.stat-label {
color: #7f8c8d;
font-size: 0.9rem;
margin-top: 0.25rem;
}

.stat-card.total { border-left: 4px solid #3498db; }
.stat-card.activos { border-left: 4px solid #27ae60; }
.stat-card.admins { border-left: 4px solid #e74c3c; }
.stat-card.vendedores { border-left: 4px solid #f39c12; }
.stat-card.super-usuarios { border-left: 4px solid #9b59b6; } /* NUEVO: Estilo para SuperUsuarios */
.stat-card.inactivos { border-left: 4px solid #95a5a6; }

/* Usuarios section */
.usuarios-section {
background: white;
border-radius: 12px;
padding: 1.5rem;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1.5rem;
flex-wrap: wrap;
gap: 1rem;
}

.section-title {
font-size: 1.5rem;
font-weight: 600;
color: #2c3e50;
margin: 0;
}

.view-controls {
display: flex;
gap: 0.5rem;
}

.view-btn {
padding: 0.5rem 1rem;
border: 2px solid #e1e8ed;
background: white;
border-radius: 6px;
cursor: pointer;
transition: all 0.3s ease;
font-size: 0.85rem;
display: flex;
align-items: center;
gap: 0.5rem;
}

.view-btn.active {
background: #3498db;
color: white;
border-color: #3498db;
}

/* NUEVO: Estilo para mensaje de ayuda de contraseña */
.password-help {
display: flex;
align-items: center;
gap: 0.5rem;
color: #6c757d;
font-size: 0.8rem;
margin-top: 0.5rem;
font-style: italic;
}

.password-help i {
color: #17a2b8;
}

/* Tabla */
.tabla-wrapper {
overflow-x: auto;
}

.usuarios-tabla {
width: 100%;
border-collapse: collapse;
margin-bottom: 1rem;
}

.usuarios-tabla th {
background: #f8f9fa;
padding: 1rem;
text-align: left;
font-weight: 600;
color: #2c3e50;
border-bottom: 2px solid #e9ecef;
white-space: nowrap;
}

.usuarios-tabla th.sortable {
cursor: pointer;
user-select: none;
}

.usuarios-tabla th.sortable:hover {
background: #e9ecef;
}

.sort-icon {
margin-left: 0.5rem;
opacity: 0.5;
}

.usuarios-tabla td {
padding: 1rem;
border-bottom: 1px solid #e9ecef;
vertical-align: middle;
}

.usuario-id {
font-weight: 600;
color: #3498db;
font-family: monospace;
font-size: 1rem;
}

.usuario-info {
display: flex;
flex-direction: column;
gap: 0.25rem;
}

.usuario-nombre {
font-weight: 500;
color: #2c3e50;
}

.usuario-correo {
color: #7f8c8d;
font-size: 0.9rem;
}

.usuario-username {
font-family: monospace;
background: #f8f9fa;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.85rem;
color: #2c3e50;
}

/* Vista de tarjetas */
.tarjetas-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
gap: 1.5rem;
}

.usuario-card {
border: 1px solid #e9ecef;
border-radius: 12px;
padding: 1.5rem;
transition: all 0.3s ease;
background: white;
}

.usuario-card:hover {
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.card-numero {
font-weight: 600;
color: #3498db;
font-family: monospace;
font-size: 1.1rem;
}

.card-content h3 {
color: #2c3e50;
margin-bottom: 0.5rem;
font-size: 1.2rem;
}

.usuario-nombre-card {
color: #2c3e50;
margin-bottom: 0.5rem;
font-size: 1.2rem;
}

.usuario-email-card {
color: #7f8c8d;
font-size: 0.9rem;
margin-bottom: 1rem;
}

.usuario-details {
display: grid;
gap: 0.75rem;
margin-bottom: 1.5rem;
}

.detail {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.5rem;
background: #f8f9fa;
border-radius: 6px;
}

.detail-label {
color: #7f8c8d;
font-size: 0.85rem;
font-weight: 500;
}

.detail-value {
color: #2c3e50;
font-weight: 500;
font-size: 0.9rem;
}

.usuario-username-card {
font-family: monospace;
background: #e3f2fd;
color: #1976d2;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.85rem;
}

.card-actions {
display: flex;
gap: 0.75rem;
flex-wrap: wrap;
}

.card-actions .btn {
flex: 1;
justify-content: center;
min-width: auto;
}

/* Badges de tipo de usuario */
.tipo-badge {
padding: 0.375rem 0.75rem;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
}

.tipo-badge.admin {
background: #fee2e2;
color: #dc2626;
border: 1px solid #fecaca;
}

.tipo-badge.vendedor {
background: #fef3c7;
color: #d97706;
border: 1px solid #fed7aa;
}

.tipo-badge.super_usuario {
background: #dbeafe;
color: #2563eb;
border: 1px solid #bfdbfe;
}

.tipo-badge.supervisor {
background: #dbeafe;
color: #2563eb;
border: 1px solid #bfdbfe;
}

.tipo-badge.cliente {
background: #d1fae5;
color: #059669;
border: 1px solid #a7f3d0;
}

/* Badges de estado */
.estado-badge {
padding: 0.375rem 0.75rem;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
}

.estado-badge.activo {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
}

.estado-badge.inactivo {
background: #f8d7da;
color: #721c24;
border: 1px solid #f5c6cb;
}

/* Acciones */
.acciones {
display: flex;
gap: 0.5rem;
flex-wrap: wrap;
}

.btn-accion {
width: 32px;
height: 32px;
border: none;
border-radius: 6px;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
font-size: 0.9rem;
transition: all 0.3s ease;
}

.btn-accion.ver {
background: #e3f2fd;
color: #1976d2;
}

.btn-accion.ver:hover {
background: #bbdefb;
}

.btn-accion.editar {
background: #fff3e0;
color: #f57c00;
}

.btn-accion.editar:hover {
background: #ffe0b2;
}

.btn-accion.deshabilitar {
background: #ffebee;
color: #d32f2f;
}

.btn-accion.deshabilitar:hover {
background: #ffcdd2;
}

.btn-accion.habilitar {
background: #e8f5e8;
color: #388e3c;
}

.btn-accion.habilitar:hover {
background: #c8e6c9;
}

/* Estado vacío */
.empty-state {
text-align: center;
padding: 4rem 2rem;
color: #7f8c8d;
}

.empty-icon {
font-size: 4rem;
margin-bottom: 1rem;
opacity: 0.5;
}

.empty-title {
font-size: 1.5rem;
color: #2c3e50;
margin-bottom: 0.5rem;
}

.empty-description {
margin-bottom: 2rem;
font-size: 1rem;
line-height: 1.5;
}

/* Paginación */
.paginacion-info {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
flex-wrap: wrap;
gap: 1rem;
}

.items-info {
color: #6c757d;
font-size: 0.9rem;
font-weight: 500;
}

.pagination-jump {
display: flex;
align-items: center;
gap: 0.5rem;
}

.pagination-jump label {
color: #6c757d;
font-size: 0.85rem;
font-weight: 500;
}

.page-input {
width: 60px;
padding: 0.375rem 0.5rem;
border: 1px solid #ced4da;
border-radius: 4px;
text-align: center;
font-size: 0.85rem;
}

.page-input:focus {
outline: none;
border-color: #3498db;
box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.paginacion-completa {
margin-top: 2rem;
padding-top: 1.5rem;
border-top: 1px solid #e9ecef;
}

.paginacion {
display: flex;
justify-content: center;
align-items: center;
gap: 0.5rem;
flex-wrap: wrap;
margin-bottom: 1rem;
}

.btn-pag {
padding: 0.5rem 0.75rem;
border: 1px solid #dee2e6;
background: white;
border-radius: 6px;
cursor: pointer;
transition: all 0.3s ease;
font-size: 0.9rem;
min-width: 40px;
display: flex;
align-items: center;
justify-content: center;
gap: 0.25rem;
}

.btn-pag:hover:not(:disabled) {
background: #e9ecef;
transform: translateY(-1px);
}

.btn-pag:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.btn-pag.active {
background: #3498db;
color: white;
border-color: #3498db;
font-weight: 600;
}

.paginas {
display: flex;
gap: 0.25rem;
align-items: center;
}

.pagina-separador {
padding: 0.5rem 0.25rem;
color: #6c757d;
font-weight: bold;
}

.paginacion-info-bottom {
text-align: center;
margin-top: 1rem;
}

.pagina-actual {
color: #6c757d;
font-size: 0.9rem;
font-weight: 500;
background: #f8f9fa;
padding: 0.5rem 1rem;
border-radius: 20px;
}

/* Modal */
.modal-overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
padding: 1rem;
}

.modal-content {
background: white;
border-radius: 12px;
max-width: 800px;
width: 100%;
max-height: 90vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-formulario {
max-width: 900px;
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1.5rem;
border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
margin: 0;
color: #2c3e50;
display: flex;
align-items: center;
gap: 0.5rem;
}

.btn-close {
background: none;
border: none;
font-size: 1.5rem;
cursor: pointer;
color: #7f8c8d;
padding: 0.5rem;
border-radius: 50%;
transition: all 0.3s ease;
}

.btn-close:hover {
background: #f8f9fa;
color: #e74c3c;
}

.modal-body {
padding: 1.5rem;
}

.modal-footer {
display: flex;
justify-content: flex-end;
gap: 1rem;
padding: 1.5rem;
border-top: 1px solid #e9ecef;
background: #f8f9fa;
}

/* Detalle de usuario */
.usuario-detalle {
padding: 1rem 0;
}

.detalle-grid {
display: grid;
gap: 1rem;
margin-bottom: 1.5rem;
}

.detalle-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.75rem;
background: #f8f9fa;
border-radius: 6px;
}

.detalle-item strong {
color: #2c3e50;
font-weight: 600;
display: flex;
align-items: center;
gap: 0.5rem;
}

/* Formulario */
.formulario-usuario {
padding: 1rem 0;
}

.form-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 1.5rem;
margin-bottom: 1.5rem;
}

.form-group {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.form-group label {
font-weight: 600;
color: #2c3e50;
font-size: 0.9rem;
}

.form-input,
.form-select {
padding: 0.75rem 1rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 1rem;
transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
outline: none;
border-color: #3498db;
box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.password-input {
position: relative;
}

.password-toggle {
position: absolute;
right: 1rem;
top: 50%;
transform: translateY(-50%);
background: none;
border: none;
color: #7f8c8d;
cursor: pointer;
font-size: 1rem;
padding: 0.25rem;
}

.password-toggle:hover {
color: #2c3e50;
}

/* Errores de formulario */
.form-errors {
background: #fff5f5;
border: 1px solid #fed7d7;
border-radius: 8px;
padding: 1rem;
margin-top: 1rem;
}

.error-item {
display: flex;
align-items: center;
gap: 0.5rem;
color: #e53e3e;
font-size: 0.9rem;
margin-bottom: 0.5rem;
}

.error-item:last-child {
margin-bottom: 0;
}

.error-item i {
color: #e53e3e;
}

/* Estilos específicos para el modal de confirmación de usuarios */
.modal-confirmacion {
max-width: 600px;
}

.confirmacion-content {
display: flex;
flex-direction: column;
gap: 2rem;
}

.usuario-info-resumen {
display: flex;
align-items: center;
gap: 1rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border-left: 4px solid #3498db;
}

.usuario-avatar {
width: 60px;
height: 60px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
color: white;
font-size: 1.5rem;
flex-shrink: 0;
}

.usuario-avatar.admin {
background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.usuario-avatar.vendedor {
background: linear-gradient(135deg, #f39c12, #e67e22);
}

.usuario-avatar.super_usuario {
background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.usuario-avatar.supervisor {
background: linear-gradient(135deg, #3498db, #2980b9);
}

.usuario-avatar.cliente {
background: linear-gradient(135deg, #27ae60, #219a52);
}

.usuario-datos h4 {
margin: 0 0 0.25rem 0;
color: #2c3e50;
font-size: 1.2rem;
}

.usuario-email {
margin: 0 0 0.25rem 0;
color: #7f8c8d;
font-size: 0.9rem;
}

.usuario-badges {
display: flex;
gap: 0.5rem;
align-items: center;
}

.usuario-id {
font-family: monospace;
background: #e3f2fd;
color: #1976d2;
padding: 0.2rem 0.5rem;
border-radius: 4px;
font-size: 0.8rem;
font-weight: 600;
}

.mensaje-confirmacion {
text-align: center;
padding: 1.5rem;
}

.icono-estado {
width: 80px;
height: 80px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
margin: 0 auto 1.5rem;
font-size: 2rem;
color: white;
}

.icono-estado.desactivar {
background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.icono-estado.activar {
background: linear-gradient(135deg, #27ae60, #219a52);
}

.texto-confirmacion {
max-width: 400px;
margin: 0 auto;
}

.pregunta-principal {
font-size: 1.1rem;
color: #2c3e50;
margin-bottom: 1rem;
line-height: 1.5;
}

.text-danger {
color: #e74c3c;
}

.text-success {
color: #27ae60;
}

.advertencia-estado,
.info-estado {
display: flex;
align-items: flex-start;
gap: 0.5rem;
padding: 1rem;
border-radius: 6px;
font-size: 0.9rem;
line-height: 1.4;
text-align: left;
}

.advertencia-estado {
background: #fff3cd;
color: #856404;
border: 1px solid #ffeaa7;
}

.advertencia-estado i {
color: #f39c12;
margin-top: 0.1rem;
}

.info-estado {
background: #d1ecf1;
color: #0c5460;
border: 1px solid #bee5eb;
}

.info-estado i {
color: #17a2b8;
margin-top: 0.1rem;
}

.cambio-estado-visual {
display: flex;
align-items: center;
justify-content: center;
gap: 1.5rem;
padding: 1.5rem;
background: #f8f9fa;
border-radius: 8px;
border: 1px solid #e9ecef;
}

.estado-actual,
.estado-nuevo {
display: flex;
flex-direction: column;
align-items: center;
gap: 0.5rem;
}

.label {
font-size: 0.8rem;
color: #6c757d;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.5px;
}

.flecha-cambio {
color: #6c757d;
font-size: 1.5rem;
}

/* Notificaciones */
.notification {
position: fixed;
top: 2rem;
right: 2rem;
padding: 1rem 1.5rem;
border-radius: 8px;
color: white;
font-weight: 500;
z-index: 3000;
display: flex;
align-items: center;
gap: 0.5rem;
min-width: 300px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
animation: slideInRight 0.3s ease-out;
}

.notification-success {
background: #27ae60;
}

.notification-error {
background: #e74c3c;
}

.notification-warning {
background: #f39c12;
}

.notification-info {
background: #3498db;
}

.notification-close {
background: none;
border: none;
color: white;
cursor: pointer;
padding: 0.25rem;
border-radius: 50%;
transition: all 0.3s ease;
margin-left: auto;
}

.notification-close:hover {
background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
from {
  opacity: 0;
  transform: translateX(100%);
}
to {
  opacity: 1;
  transform: translateX(0);
}
}

/* Responsive */
@media (max-width: 1200px) {
.estadisticas-grid {
 grid-template-columns: repeat(3, 1fr);
}

.confirmacion-content {
 gap: 1.5rem;
}

.cambio-estado-visual {
 flex-direction: column;
 gap: 1rem;
}

.flecha-cambio {
 transform: rotate(90deg);
}
}

@media (max-width: 768px) {
.admin-usuarios-container {
 padding: 1rem;
}

.page-header {
 flex-direction: column;
 align-items: stretch;
 gap: 1rem;
}

.header-actions {
 flex-direction: column;
}

.header-content h1 {
 font-size: 2rem;
}

.estadisticas-grid {
 grid-template-columns: repeat(2, 1fr);
}

.filtros-grid {
 flex-direction: column;
 align-items: stretch;
}

.filter-select {
 min-width: auto;
}

.section-header {
 flex-direction: column;
 align-items: stretch;
}

.paginacion-info {
 flex-direction: column;
 align-items: stretch;
 text-align: center;
}

.tabla-wrapper {
 overflow-x: scroll;
}

.usuarios-tabla {
 min-width: 800px;
}

.tarjetas-grid {
 grid-template-columns: 1fr;
}

.card-actions {
 justify-content: stretch;
}

.card-actions .btn {
 flex: 1;
 justify-content: center;
}

.detalle-item {
 flex-direction: column;
 align-items: flex-start;
 gap: 0.5rem;
}

.form-grid {
 grid-template-columns: 1fr;
}

.modal-footer {
 flex-direction: column;
}

.modal-confirmacion {
 max-width: 95%;
 margin: 1rem;
}

.usuario-info-resumen {
 flex-direction: column;
 text-align: center;
 gap: 0.75rem;
}

.icono-estado {
 width: 60px;
 height: 60px;
 font-size: 1.5rem;
}

.cambio-estado-visual {
 padding: 1rem;
}

.notification {
 right: 1rem;
 left: 1rem;
 min-width: auto;
}
}

@media (max-width: 480px) {
.estadisticas-grid {
 grid-template-columns: 1fr;
}

.filtros-section,
.usuarios-section {
 padding: 1rem;
}

.stat-card {
 padding: 1rem;
}

.usuario-card {
 padding: 1rem;
}

.modal-content {
 margin: 0.5rem;
}

.btn-pag {
 min-width: 35px;
 padding: 0.375rem 0.5rem;
}

.card-actions {
 flex-direction: column;
}

.card-actions .btn {
 width: 100%;
}

.modal-confirmacion {
 max-width: 100%;
 margin: 0.5rem;
}

.usuario-avatar {
 width: 50px;
 height: 50px;
 font-size: 1.2rem;
}

.pregunta-principal {
 font-size: 1rem;
}

.advertencia-estado,
.info-estado {
 padding: 0.75rem;
 font-size: 0.85rem;
}

.notification {
 top: 1rem;
 right: 0.5rem;
 left: 0.5rem;
 padding: 0.75rem 1rem;
 font-size: 0.9rem;
}

.loading-spinner {
 font-size: 1rem;
}

.loading-spinner i {
 font-size: 2rem;
}
}

/* Animaciones adicionales */
@keyframes fadeIn {
from {
 opacity: 0;
 transform: translateY(20px);
}
to {
 opacity: 1;
 transform: translateY(0);
}
}

.admin-usuarios-container {
animation: fadeIn 0.5s ease-out;
}

.usuario-card,
.stat-card {
animation: fadeIn 0.3s ease-out;
}

/* Estados de hover mejorados */
.btn:hover:not(:disabled) {
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.usuarios-tabla tbody tr:hover {
background-color: #f8f9fa;
transform: scale(1.01);
transition: all 0.2s ease;
}

.btn-accion:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mejoras de accesibilidad */
.btn:focus,
.form-input:focus,
.form-select:focus,
.btn-accion:focus,
.view-btn:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}

/* Estados de carga específicos */
.btn.loading {
pointer-events: none;
opacity: 0.7;
}

.btn.loading i {
animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

/* Transiciones suaves */
* {
transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Mejoras visuales para la paginación */
.btn-pag:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}

.page-input:invalid {
border-color: #e74c3c;
box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

/* Mejoras para el formulario */
.form-input:invalid,
.form-select:invalid {
border-color: #e74c3c;
}

.form-input:valid,
.form-select:valid {
border-color: #27ae60;
}

/* Mejoras para la búsqueda */
.search-input:focus + .search-icon {
color: #3498db;
}

/* Estados específicos para notificaciones */
.notification.hide {
animation: slideOutRight 0.3s ease-in forwards;
}

@keyframes slideOutRight {
from {
 opacity: 1;
 transform: translateX(0);
}
to {
 opacity: 0;
 transform: translateX(100%);
}
}

/* Mejoras para el modal */
.modal-overlay {
backdrop-filter: blur(4px);
}

.modal-content {
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

/* Indicadores de estado mejorados */
.tipo-badge,
.estado-badge {
position: relative;
overflow: hidden;
}

.tipo-badge::before,
.estado-badge::before {
content: '';
position: absolute;
top: 0;
left: -100%;
width: 100%;
height: 100%;
background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
transition: left 0.5s;
}

.tipo-badge:hover::before,
.estado-badge:hover::before {
left: 100%;
}

/* Mejoras para el loading */
.loading-overlay {
animation: fadeIn 0.3s ease-out;
}

/* Sombras mejoradas */
.card,
.modal-content,
.usuarios-section,
.filtros-section {
box-shadow: 
 0 1px 3px rgba(0, 0, 0, 0.12),
 0 1px 2px rgba(0, 0, 0, 0.24);
}

.card:hover,
.usuario-card:hover {
box-shadow: 
 0 14px 28px rgba(0, 0, 0, 0.25),
 0 10px 10px rgba(0, 0, 0, 0.22);
}

/* Scroll personalizado para la tabla */
.tabla-wrapper::-webkit-scrollbar {
height: 8px;
}

.tabla-wrapper::-webkit-scrollbar-track {
background: #f1f1f1;
border-radius: 4px;
}

.tabla-wrapper::-webkit-scrollbar-thumb {
background: #c1c1c1;
border-radius: 4px;
}

.tabla-wrapper::-webkit-scrollbar-thumb:hover {
background: #a8a8a8;
}

/* Estados de éxito y error para formularios */
.form-group.success .form-input,
.form-group.success .form-select {
border-color: #27ae60;
box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.form-group.error .form-input,
.form-group.error .form-select {
border-color: #e74c3c;
box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* Mejoras para dispositivos táctiles */
@media (hover: none) and (pointer: coarse) {
.btn-accion {
 width: 40px;
 height: 40px;
}

.btn {
 padding: 1rem 1.5rem;
}

.usuarios-tabla td {
 padding: 1.5rem 1rem;
}
}
</style>;