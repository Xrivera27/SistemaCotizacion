<template>
<div class="admin-unidades-container">
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
     <h1 class="page-title">Gestión de Unidades de Medida</h1>
     <p class="page-subtitle">Administración y control de todas las unidades de medida del sistema</p>
   </div>
   <div class="header-actions">
     <button class="btn btn-primary" @click="nuevaUnidad">
       <i class="fas fa-plus btn-icon"></i>
       Nueva Unidad
     </button>
     <button class="btn btn-secondary" @click="cargarUnidades">
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
         placeholder="Buscar por nombre, descripción o abreviación..."
         class="search-input"
         @input="buscarUnidades"
       />
     </div>
     
     <div class="filtros-grid">
       <select v-model="filtros.tipo" class="filter-select" @change="aplicarFiltros">
         <option value="">Todos los tipos</option>
         <option value="cantidad">Cantidad</option>
         <option value="capacidad">Capacidad</option>
         <option value="tiempo">Tiempo</option>
         <option value="usuarios">Usuarios</option>
         <option value="sesiones">Sesiones</option>
       </select>
       
       <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
         <option value="">Todos los estados</option>
         <option value="1">Activas</option>
         <option value="0">Inactivas</option>
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

 <!-- Estadísticas rápidas -->
 <div class="estadisticas-grid">
   <div class="stat-card total">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.total }}</div>
       <div class="stat-label">Total Unidades</div>
     </div>
   </div>
   
   <div class="stat-card activos">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.activas }}</div>
       <div class="stat-label">Unidades Activas</div>
     </div>
   </div>
   
   <div class="stat-card inactivos">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.inactivas }}</div>
       <div class="stat-label">Unidades Inactivas</div>
     </div>
   </div>
   
   <div class="stat-card tipos">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.tipos_disponibles }}</div>
       <div class="stat-label">Tipos Disponibles</div>
     </div>
   </div>
 </div>

 <!-- Unidades section -->
 <div class="unidades-section">
   <div class="section-header">
     <h2 class="section-title">
       {{ pagination ? pagination.totalItems : unidades.length }} Unidades encontradas
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
       de {{ pagination.totalItems }} unidades
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
       <table class="unidades-tabla">
         <thead>
           <tr>
             <th>ID</th>
             <th>Nombre</th>
             <th>Abreviación</th>
             <th>Tipo</th>
             <th>Descripción</th>
             <th>Estado</th>
             <th>Fecha Creación</th>
             <th>Acciones</th>
           </tr>
         </thead>
         <tbody>
           <tr v-for="unidad in unidades" :key="unidad.unidades_medida_id">
             <td>
               <span class="unidad-id">#{{ String(unidad.unidades_medida_id).padStart(4, '0') }}</span>
             </td>
             <td>
               <div class="unidad-info">
                 <span class="unidad-nombre">{{ unidad.nombre }}</span>
               </div>
             </td>
             <td>
               <div class="abreviacion-info">
                 <span class="abreviacion-badge">{{ unidad.abreviacion }}</span>
               </div>
             </td>
             <td>
               <span class="tipo-badge" :class="unidad.tipo">
                 {{ formatearTipo(unidad.tipo) }}
               </span>
             </td>
             <td>
               <div class="descripcion-info">
                 <span class="descripcion-texto">{{ truncarTexto(unidad.descripcion, 80) }}</span>
               </div>
             </td>
             <td>
               <span class="estado-badge" :class="unidad.activo ? 'activo' : 'inactivo'">
                 {{ unidad.activo ? 'Activa' : 'Inactiva' }}
               </span>
             </td>
             <td>
               <span class="fecha">{{ formatearFecha(unidad.created_at) }}</span>
             </td>
             <td>
               <div class="acciones">
                 <button 
                   class="btn-accion ver"
                   @click="verUnidad(unidad)"
                   title="Ver detalles"
                 >
                   <i class="fas fa-eye"></i>
                 </button>
                 <button 
                   class="btn-accion editar"
                   @click="editarUnidad(unidad)"
                   title="Editar unidad"
                 >
                   <i class="fas fa-edit"></i>
                 </button>
                 <button 
                   class="btn-accion" 
                   :class="unidad.activo ? 'deshabilitar' : 'habilitar'"
                   @click="mostrarModalCambiarEstado(unidad)"
                   :title="unidad.activo ? 'Desactivar unidad' : 'Activar unidad'"
                 >
                   <i :class="unidad.activo ? 'fas fa-ban' : 'fas fa-check'"></i>
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
         v-for="unidad in unidades" 
         :key="unidad.unidades_medida_id"
         class="unidad-card"
       >
         <div class="card-header">
           <div class="card-numero">#{{ String(unidad.unidades_medida_id).padStart(4, '0') }}</div>
           <span class="estado-badge" :class="unidad.activo ? 'activo' : 'inactivo'">
             {{ unidad.activo ? 'Activa' : 'Inactiva' }}
           </span>
         </div>
         
         <div class="card-content">
           <h3 class="unidad-nombre-card">
             <i class="fas fa-ruler"></i>
             {{ unidad.nombre }}
           </h3>
           
           <div class="abreviacion-card">
             <span class="abreviacion-display">{{ unidad.abreviacion }}</span>
           </div>
           
           <div class="descripcion-card">
             <p>{{ unidad.descripcion }}</p>
           </div>
           
           <div class="unidad-details">
             <div class="detail">
               <span class="detail-label">
                 <i class="fas fa-tag"></i>
                 Tipo:
               </span>
               <span class="detail-value tipo-card" :class="unidad.tipo">
                 {{ formatearTipo(unidad.tipo) }}
               </span>
             </div>
             
             <div class="detail">
               <span class="detail-label">
                 <i class="fas fa-calendar-alt"></i>
                 Creación:
               </span>
               <span class="detail-value">{{ formatearFecha(unidad.created_at) }}</span>
             </div>
           </div>
         </div>
         
         <div class="card-actions">
           <button class="btn btn-sm btn-outline" @click="verUnidad(unidad)">
             <i class="fas fa-eye"></i>
             Ver Detalles
           </button>
           <button class="btn btn-sm btn-primary" @click="editarUnidad(unidad)">
             <i class="fas fa-edit"></i> Editar
           </button>
           <button 
             class="btn btn-sm"
             :class="unidad.activo ? 'btn-danger' : 'btn-success'"
             @click="mostrarModalCambiarEstado(unidad)"
           >
             <i :class="unidad.activo ? 'fas fa-ban' : 'fas fa-check'"></i>
             {{ unidad.activo ? 'Desactivar' : 'Activar' }}
           </button>
         </div>
       </div>
     </div>
   </div>

   <!-- Mensaje cuando no hay unidades -->
   <div v-if="unidades.length === 0 && !loading" class="empty-state">
     <div class="empty-icon"><i class="fas fa-ruler"></i></div>
     <h3 class="empty-title">No hay unidades de medida</h3>
     <p class="empty-description">
       {{ filtros.busqueda || filtros.tipo || filtros.estado 
         ? 'No se encontraron unidades con los filtros aplicados.' 
         : 'Aún no se han registrado unidades de medida en el sistema.' }}
     </p>
     <button class="btn btn-primary" @click="nuevaUnidad">
       <i class="fas fa-plus"></i>
       Crear Primera Unidad
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
 <div v-if="modalUnidad" class="modal-overlay" @click="cerrarModal">
   <div class="modal-content" @click.stop>
     <div class="modal-header">
       <h3>Unidad #{{ String(modalUnidad.unidades_medida_id).padStart(4, '0') }} - {{ modalUnidad.nombre }}</h3>
       <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
     </div>
     <div class="modal-body">
       <div class="unidad-detalle">
         <div class="detalle-grid">
           <div class="detalle-item">
             <strong><i class="fas fa-ruler"></i> Nombre:</strong> {{ modalUnidad.nombre }}
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-code"></i> Abreviación:</strong> 
             <span class="abreviacion-badge">{{ modalUnidad.abreviacion }}</span>
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-tag"></i> Tipo:</strong> 
             <span class="tipo-badge" :class="modalUnidad.tipo">{{ formatearTipo(modalUnidad.tipo) }}</span>
           </div>
           <div class="detalle-item descripcion-completa">
             <strong><i class="fas fa-align-left"></i> Descripción:</strong> 
             <span class="descripcion-texto">{{ modalUnidad.descripcion }}</span>
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-calendar-alt"></i> Fecha de Creación:</strong> {{ formatearFecha(modalUnidad.created_at) }}
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
             <span class="estado-badge" :class="modalUnidad.activo ? 'activo' : 'inactivo'">
               {{ modalUnidad.activo ? 'Activa' : 'Inactiva' }}
             </span>
           </div>
         </div>
       </div>
     </div>
     <div class="modal-footer">
       <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
       <button class="btn btn-primary" @click="editarUnidad(modalUnidad)">
         Editar Unidad
       </button>
     </div>
   </div>
 </div>

 <!-- Modal de formulario -->
 <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
   <div class="modal-content modal-formulario" @click.stop>
     <div class="modal-header">
       <h3>{{ unidadEditando ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida' }}</h3>
       <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
     </div>
     <div class="modal-body">
       <form @submit.prevent="guardarUnidad" class="formulario-unidad">
         <div class="form-sections">
           <!-- Información Principal -->
           <div class="form-section">
             <h4 class="section-title">
               <i class="fas fa-ruler"></i>
               Información de la Unidad de Medida
             </h4>
             <div class="form-grid">
               <div class="form-group">
                 <label for="nombre">Nombre de la Unidad *</label>
                 <input 
                   id="nombre"
                   v-model="formulario.nombre" 
                   type="text" 
                   required 
                   class="form-input"
                   placeholder="Equipos, Gigabytes, Usuarios, etc."
                 >
               </div>

               <div class="form-group">
                 <label for="abreviacion">Abreviación *</label>
                 <input 
                   id="abreviacion"
                   v-model="formulario.abreviacion" 
                   type="text" 
                   required 
                   class="form-input"
                   placeholder="eq, GB, usr, etc."
                   maxlength="20"
                 >
               </div>

               <div class="form-group">
                 <label for="tipo">Tipo de Unidad *</label>
                 <select 
                   id="tipo"
                   v-model="formulario.tipo" 
                   required 
                   class="form-select"
                 >
                   <option value="">Selecciona un tipo</option>
                   <option value="cantidad">Cantidad</option>
                   <option value="capacidad">Capacidad</option>
                   <option value="tiempo">Tiempo</option>
                   <option value="usuarios">Usuarios</option>
                   <option value="sesiones">Sesiones</option>
                 </select>
               </div>
               
               <div class="form-group full-width">
                 <label for="descripcion">Descripción *</label>
                 <textarea 
                   id="descripcion"
                   v-model="formulario.descripcion" 
                   required 
                   class="form-textarea"
                   placeholder="Describe detalladamente para qué se utiliza esta unidad de medida..."
                   rows="4"
                 ></textarea>
               </div>
               
               <div class="form-group" v-if="unidadEditando">
                 <label for="activo">Estado</label>
                 <select id="activo" v-model="formulario.activo" class="form-select">
                   <option :value="1">Activa</option>
                   <option :value="0">Inactiva</option>
                 </select>
               </div>
             </div>
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
         @click="guardarUnidad"
         :disabled="guardandoUnidad"
       >
         {{ guardandoUnidad ? 'Guardando...' : (unidadEditando ? 'Actualizar' : 'Crear') }} Unidad
       </button>
     </div>
   </div>
 </div>

 <!-- Modal de confirmación para cambiar estado -->
 <div v-if="modalCambiarEstado" class="modal-overlay" @click="cerrarModalCambiarEstado">
   <div class="modal-content modal-confirmacion" @click.stop>
     <div class="modal-header">
       <h3>
         <i :class="unidadParaCambiarEstado.activo ? 'fas fa-ban text-danger' : 'fas fa-check text-success'"></i>
         {{ unidadParaCambiarEstado.activo ? 'Desactivar Unidad' : 'Activar Unidad' }}
       </h3>
       <button class="btn-close" @click="cerrarModalCambiarEstado">
         <i class="fas fa-times"></i>
       </button>
     </div>
     
     <div class="modal-body">
       <div class="confirmacion-content">
         <div class="unidad-info-resumen">
           <div class="unidad-avatar">
             <i class="fas fa-ruler"></i>
           </div>
           <div class="unidad-datos">
             <h4>{{ unidadParaCambiarEstado.nombre }}</h4>
             <p class="unidad-descripcion">{{ truncarTexto(unidadParaCambiarEstado.descripcion, 100) }}</p>
             <div class="unidad-badges">
               <span class="unidad-id">#{{ String(unidadParaCambiarEstado.unidades_medida_id).padStart(4, '0') }}</span>
               <span class="abreviacion-count">{{ unidadParaCambiarEstado.abreviacion }}</span>
               <span class="tipo-count" :class="unidadParaCambiarEstado.tipo">
                 {{ formatearTipo(unidadParaCambiarEstado.tipo) }}
               </span>
             </div>
           </div>
         </div>
         
         <div class="mensaje-confirmacion">
           <div class="icono-estado" :class="unidadParaCambiarEstado.activo ? 'desactivar' : 'activar'">
             <i :class="unidadParaCambiarEstado.activo ? 'fas fa-ban' : 'fas fa-check'"></i>
           </div>
           
           <div class="texto-confirmacion">
             <p class="pregunta-principal">
               ¿Está seguro que desea 
               <strong :class="unidadParaCambiarEstado.activo ? 'text-danger' : 'text-success'">
                 {{ unidadParaCambiarEstado.activo ? 'desactivar' : 'activar' }}
               </strong> 
               esta unidad de medida?
             </p>
             
             <div class="advertencia-estado" v-if="unidadParaCambiarEstado.activo">
               <i class="fas fa-exclamation-triangle"></i>
               <span>Al desactivar esta unidad, no estará disponible para ser asignada a nuevas categorías hasta que sea activada nuevamente.</span>
             </div>
             
             <div class="info-estado" v-else>
               <i class="fas fa-info-circle"></i>
               <span>Al activar esta unidad, estará disponible para ser asignada a categorías.</span>
             </div>
           </div>
         </div>
         
         <div class="cambio-estado-visual">
           <div class="estado-actual">
             <span class="label">Estado actual:</span>
             <span class="estado-badge" :class="unidadParaCambiarEstado.activo ? 'activo' : 'inactivo'">
               {{ unidadParaCambiarEstado.activo ? 'Activa' : 'Inactiva' }}
             </span>
           </div>
           
           <div class="flecha-cambio">
             <i class="fas fa-arrow-right"></i>
           </div>
           
           <div class="estado-nuevo">
             <span class="label">Nuevo estado:</span>
             <span class="estado-badge" :class="unidadParaCambiarEstado.activo ? 'inactivo' : 'activo'">
               {{ unidadParaCambiarEstado.activo ? 'Inactiva' : 'Activa' }}
             </span>
           </div>
         </div>
       </div>
     </div>
     
     <div class="modal-footer">
       <button class="btn btn-outline" @click="cerrarModalCambiarEstado">
         <i class="fas fa-times"></i>
         Cancelar
       </button>
       <button 
         class="btn"
         :class="unidadParaCambiarEstado.activo ? 'btn-danger' : 'btn-success'"
         @click="confirmarCambiarEstado"
         :disabled="cambiandoEstado"
       >
         <i :class="cambiandoEstado ? 'fas fa-spinner fa-spin' : (unidadParaCambiarEstado.activo ? 'fas fa-ban' : 'fas fa-check')"></i>
         {{ cambiandoEstado ? 'Procesando...' : (unidadParaCambiarEstado.activo ? 'Desactivar' : 'Activar') }} Unidad
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
import unidadesMedidaService from '@/services/unidadesMedidaService';

export default {
 name: 'MisUnidadesMedida',
 data() {
   return {
     loading: false,
     loadingMessage: 'Cargando unidades de medida...',
     vistaActual: 'tabla',
     modalUnidad: null,
     modalFormulario: false,
     modalCambiarEstado: false,
     unidadEditando: null,
     unidadParaCambiarEstado: null,
     guardandoUnidad: false,
     cambiandoEstado: false,
     paginaSalto: 1,
     itemsPorPagina: 25,

     // Datos del backend
     unidades: [],
     pagination: null,
     estadisticas: {
       total: 0,
       activas: 0,
       inactivas: 0,
       tipos_disponibles: 0
     },

     filtros: {
       busqueda: '',
       tipo: '',
       estado: ''
     },

     formulario: {
       nombre: '',
       descripcion: '',
       abreviacion: '',
       tipo: '',
       activo: 1
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
     this.loadingMessage = 'Cargando unidades de medida...';
     
     try {
       await Promise.all([
         this.cargarUnidades(),
         this.cargarEstadisticas()
       ]);
     } catch (error) {
       console.error('❌ Error cargando datos iniciales:', error);
       this.showNotification('Error cargando datos del sistema', 'error');
     } finally {
       this.loading = false;
     }
   },

   async cargarUnidades() {
     try {
       
       const params = {
         page: this.pagination?.currentPage || 1,
         limit: this.itemsPorPagina,
         search: this.filtros.busqueda || undefined,
         tipo: this.filtros.tipo || undefined,
         activo: this.filtros.estado || undefined
       };
       
       const result = await unidadesMedidaService.getUnidades(params);
       
       if (result.success) {
         this.unidades = result.unidades;
         this.pagination = result.pagination;
       } else {
         this.showNotification(result.message || 'Error cargando unidades', 'error');
       }
       
     } catch (error) {
       console.error('❌ Error cargando unidades:', error);
       this.showNotification('Error de conexión al cargar unidades', 'error');
     }
   },

   async cargarEstadisticas() {
     try {
       
       const result = await unidadesMedidaService.getEstadisticas();
       
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
   buscarUnidades() {
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
     
     await this.cargarUnidades();
   },

   limpiarFiltros() {
     this.filtros = {
       busqueda: '',
       tipo: '',
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
     await this.cargarUnidades();
   },

   async irAPrimera() {
     if (this.pagination && this.pagination.currentPage !== 1) {
       this.pagination.currentPage = 1;
       await this.cargarUnidades();
     }
   },

   async irAUltima() {
     if (this.pagination && this.pagination.currentPage !== this.pagination.totalPages) {
       this.pagination.currentPage = this.pagination.totalPages;
       await this.cargarUnidades();
     }
   },

   async paginaAnterior() {
     if (this.pagination && this.pagination.hasPrevPage) {
       this.pagination.currentPage--;
       await this.cargarUnidades();
     }
   },

   async paginaSiguiente() {
     if (this.pagination && this.pagination.hasNextPage) {
       this.pagination.currentPage++;
       await this.cargarUnidades();
     }
   },

   async irAPagina(pagina = null) {
     const targetPage = pagina || this.paginaSalto;
     
     if (this.pagination && targetPage >= 1 && targetPage <= this.pagination.totalPages) {
       this.pagination.currentPage = targetPage;
       await this.cargarUnidades();
     } else {
       this.showNotification(`Por favor ingresa un número entre 1 y ${this.pagination?.totalPages || 1}`, 'warning');
       this.paginaSalto = this.pagination?.currentPage || 1;
     }
   },

   // ==================== GESTIÓN DE UNIDADES ====================
   nuevaUnidad() {
     this.unidadEditando = null;
     this.limpiarFormulario();
     this.modalFormulario = true;
   },

   verUnidad(unidad) {
     this.modalUnidad = unidad;
   },

   editarUnidad(unidad) {
     this.unidadEditando = unidad;
     this.llenarFormulario(unidad);
     this.modalFormulario = true;
     this.modalUnidad = null;
   },

   async guardarUnidad() {
     if (this.guardandoUnidad) return;
     
     this.erroresFormulario = [];
     
     if (!this.validarFormulario()) {
       return;
     }
     
     this.guardandoUnidad = true;
     this.loadingMessage = this.unidadEditando ? 'Actualizando unidad...' : 'Creando unidad...';
     
     try {
       const formularioData = JSON.parse(JSON.stringify(this.formulario));
       
       let result;
       
       if (this.unidadEditando) {
         result = await unidadesMedidaService.updateUnidad(this.unidadEditando.unidades_medida_id, formularioData);
       } else {
         result = await unidadesMedidaService.createUnidad(formularioData);
       }
       
       if (result.success) {
         this.showNotification(
           result.message || (this.unidadEditando ? 'Unidad actualizada exitosamente' : 'Unidad creada exitosamente'), 
           'success'
         );
         
         this.cerrarModalFormulario();
         
         // Recargar datos
         await Promise.all([
           this.cargarUnidades(),
           this.cargarEstadisticas()
         ]);
         
       } else {
         // Manejar errores de validación
         if (result.errors) {
           this.erroresFormulario = result.errors;
         } else {
           this.showNotification(result.message || 'Error al guardar unidad', 'error');
         }
       }
       
     } catch (error) {
       console.error('❌ Error guardando unidad:', error);
       this.showNotification('Error de conexión al guardar unidad', 'error');
     } finally {
       this.guardandoUnidad = false;
     }
   },

   validarFormulario() {
     const errores = [];
     
     if (!this.formulario.nombre?.trim()) {
       errores.push({ field: 'nombre', message: 'El nombre de la unidad es requerido' });
     }
     
     if (this.formulario.nombre && this.formulario.nombre.trim().length < 2) {
       errores.push({ field: 'nombre', message: 'El nombre debe tener al menos 2 caracteres' });
     }
     
     if (this.formulario.nombre && this.formulario.nombre.trim().length > 100) {
       errores.push({ field: 'nombre', message: 'El nombre no puede exceder 100 caracteres' });
     }
     
     if (!this.formulario.abreviacion?.trim()) {
       errores.push({ field: 'abreviacion', message: 'La abreviación es requerida' });
     }
     
     if (this.formulario.abreviacion && this.formulario.abreviacion.trim().length > 20) {
       errores.push({ field: 'abreviacion', message: 'La abreviación no puede exceder 20 caracteres' });
     }
     
     if (!this.formulario.tipo) {
       errores.push({ field: 'tipo', message: 'El tipo de unidad es requerido' });
     }
     
     if (!this.formulario.descripcion?.trim()) {
       errores.push({ field: 'descripcion', message: 'La descripción es requerida' });
     }
     
     if (this.formulario.descripcion && this.formulario.descripcion.trim().length > 500) {
       errores.push({ field: 'descripcion', message: 'La descripción no puede exceder 500 caracteres' });
     }
     
     this.erroresFormulario = errores;
     
     if (errores.length > 0) {
       this.showNotification('Por favor corrige los errores en el formulario', 'warning');
       return false;
     }
     
     return true;
   },

   llenarFormulario(unidad) {
     this.formulario = {
       nombre: unidad.nombre,
       descripcion: unidad.descripcion || '',
       abreviacion: unidad.abreviacion,
       tipo: unidad.tipo,
       activo: unidad.activo ? 1 : 0
     };
   },

   limpiarFormulario() {
     this.formulario = {
       nombre: '',
       descripcion: '',
       abreviacion: '',
       tipo: '',
       activo: 1
     };
     this.erroresFormulario = [];
   },

   // ==================== CAMBIO DE ESTADO ====================
   mostrarModalCambiarEstado(unidad) {
     this.unidadParaCambiarEstado = unidad;
     this.modalCambiarEstado = true;
   },

   async confirmarCambiarEstado() {
     if (this.cambiandoEstado || !this.unidadParaCambiarEstado) return;
     
     this.cambiandoEstado = true;
     
     try {
       const nuevoEstado = this.unidadParaCambiarEstado.activo ? 0 : 1;
       
       let result;
       if (nuevoEstado === 1) {
         result = await unidadesMedidaService.restoreUnidad(this.unidadParaCambiarEstado.unidades_medida_id);
       } else {
         result = await unidadesMedidaService.deleteUnidad(this.unidadParaCambiarEstado.unidades_medida_id);
       }
       
       if (result.success) {
         const accion = nuevoEstado === 1 ? 'activada' : 'desactivada';
         this.showNotification(`Unidad ${accion} exitosamente`, 'success');
         
         // Actualizar el estado local
         this.unidadParaCambiarEstado.activo = nuevoEstado;
         
         // Recargar datos
         await Promise.all([
           this.cargarUnidades(),
           this.cargarEstadisticas()
         ]);
         
       } else {
         this.showNotification(result.message || 'Error al cambiar estado de la unidad', 'error');
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
     this.unidadParaCambiarEstado = null;
   },

   // ==================== MODALES ====================
   cerrarModal() {
     this.modalUnidad = null;
   },

   cerrarModalFormulario() {
     this.modalFormulario = false;
     this.unidadEditando = null;
     this.limpiarFormulario();
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

   formatearTipo(tipo) {
     const tipos = {
       cantidad: 'Cantidad',
       capacidad: 'Capacidad',
       tiempo: 'Tiempo',
       usuarios: 'Usuarios',
       sesiones: 'Sesiones'
     };
     return tipos[tipo] || tipo;
   },

   truncarTexto(texto, limite = 80) {
     if (!texto) return '';
     if (texto.length <= limite) return texto;
     return texto.substring(0, limite) + '...';
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
/* Estilos base heredados del componente de categorías */
.admin-unidades-container {
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
 background: rgba(0, 0, 0, 0.8);
 padding: 2rem;
 border-radius: 12px;
 box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.loading-spinner i {
 font-size: 3rem;
 color: #3498db;
}

/* Header */
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

/* Botones */
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
.stat-card.inactivos { border-left: 4px solid #95a5a6; }
.stat-card.tipos { border-left: 4px solid #9c27b0; }

/* Sección de unidades */
.unidades-section {
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

/* Paginación info */
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

/* Tabla */
.tabla-wrapper {
 overflow-x: auto;
}

.unidades-tabla {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 1rem;
}

.unidades-tabla th {
 background: #f8f9fa;
 padding: 1rem;
 text-align: left;
 font-weight: 600;
 color: #2c3e50;
 border-bottom: 2px solid #e9ecef;
 white-space: nowrap;
}

.unidades-tabla td {
 padding: 1rem;
 border-bottom: 1px solid #e9ecef;
 vertical-align: middle;
}

.unidad-id {
 font-weight: 600;
 color: #3498db;
 font-family: monospace;
 font-size: 1rem;
}

.unidad-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.unidad-nombre {
 font-weight: 500;
 color: #2c3e50;
}

.descripcion-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.descripcion-texto {
 color: #7f8c8d;
 font-size: 0.9rem;
 line-height: 1.4;
}

.fecha {
 color: #7f8c8d;
 font-size: 0.85rem;
}

/* ESTILOS ESPECÍFICOS PARA UNIDADES DE MEDIDA */

/* Badge para abreviaciones */
.abreviacion-badge {
 background: linear-gradient(135deg, #37474f, #455a64);
 color: white;
 padding: 0.375rem 0.75rem;
 border-radius: 6px;
 font-family: monospace;
 font-weight: 700;
 font-size: 0.9rem;
 letter-spacing: 0.5px;
 text-transform: uppercase;
 box-shadow: 0 2px 6px rgba(55, 71, 79, 0.3);
 border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Badges específicos para tipos de unidades */
.tipo-badge {
 padding: 0.375rem 0.75rem;
 border-radius: 20px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: capitalize;
 letter-spacing: 0.5px;
 border: 1px solid;
}

.tipo-badge.cantidad {
 background: linear-gradient(135deg, #e3f2fd, #bbdefb);
 color: #1976d2;
 border-color: #90caf9;
}

.tipo-badge.capacidad {
 background: linear-gradient(135deg, #f3e5f5, #e1bee7);
 color: #7b1fa2;
 border-color: #ce93d8;
}

.tipo-badge.tiempo {
 background: linear-gradient(135deg, #fff3e0, #ffcc02);
 color: #f57c00;
 border-color: #ffb74d;
}

.tipo-badge.usuarios {
 background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
 color: #2e7d32;
 border-color: #a5d6a7;
}

.tipo-badge.sesiones {
 background: linear-gradient(135deg, #fce4ec, #f8bbd9);
 color: #c2185b;
 border-color: #f48fb1;
}

/* Estados */
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
 flex-direction: row !important;
 gap: 0.5rem;
 align-items: center;
 justify-content: flex-start;
 flex-wrap: nowrap !important;
 min-width: 120px;
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
 flex-shrink: 0;
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

/* Vista de tarjetas */
.tarjetas-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
 gap: 1.5rem;
}

.unidad-card {
 border: 1px solid #e9ecef;
 border-radius: 12px;
 padding: 1.5rem;
 transition: all 0.3s ease;
 background: white;
}

.unidad-card:hover {
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

.unidad-nombre-card {
 color: #2c3e50;
 margin-bottom: 1rem;
 font-size: 1.3rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.abreviacion-card {
 margin-bottom: 1rem;
 text-align: center;
}

.abreviacion-display {
 background: linear-gradient(135deg, #37474f, #455a64);
 color: white;
 padding: 0.75rem 1.5rem;
 border-radius: 10px;
 font-family: monospace;
 font-weight: 700;
 font-size: 1.4rem;
 letter-spacing: 1px;
 text-transform: uppercase;
 display: inline-block;
 box-shadow: 0 4px 12px rgba(55, 71, 79, 0.4);
 border: 2px solid rgba(255, 255, 255, 0.1);
 position: relative;
 overflow: hidden;
}

.abreviacion-display::before {
 content: '';
 position: absolute;
 top: 0;
 left: -100%;
 width: 100%;
 height: 100%;
 background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
 transition: left 0.5s;
}

.abreviacion-display:hover::before {
 left: 100%;
}

.descripcion-card {
 margin-bottom: 1.5rem;
 padding: 1rem;
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 border-radius: 8px;
 border-left: 4px solid #607d8b;
 position: relative;
 overflow: hidden;
}

.descripcion-card::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 height: 2px;
 background: linear-gradient(90deg, #607d8b, #455a64);
}

.descripcion-card p {
 margin: 0;
 color: #2c3e50;
 line-height: 1.5;
}

.unidad-details {
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
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.detail-value {
 color: #2c3e50;
 font-weight: 500;
 font-size: 0.9rem;
}

/* Tipos en tarjetas */
.tipo-card {
 padding: 0.375rem 0.75rem;
 border-radius: 12px;
 font-size: 0.85rem;
 font-weight: 600;
 text-transform: capitalize;
 border: 1px solid;
}

.tipo-card.cantidad { background: #e3f2fd; color: #1976d2; border-color: #90caf9; }
.tipo-card.capacidad { background: #f3e5f5; color: #7b1fa2; border-color: #ce93d8; }
.tipo-card.tiempo { background: #fff3e0; color: #f57c00; border-color: #ffb74d; }
.tipo-card.usuarios { background: #e8f5e8; color: #2e7d32; border-color: #a5d6a7; }
.tipo-card.sesiones { background: #fce4ec; color: #c2185b; border-color: #f48fb1; }

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

/* Paginación completa */
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

/* Modales */
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
 backdrop-filter: blur(4px);
}

.modal-content {
 background: white;
 border-radius: 12px;
 max-width: 800px;
 width: 100%;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
 animation: modalSlideIn 0.3s ease-out;
}

.modal-formulario {
 max-width: 900px;
}

.modal-confirmacion {
 max-width: 600px;
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

/* Detalle de unidad */
.unidad-detalle {
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

.detalle-item.descripcion-completa {
 flex-direction: column;
 align-items: flex-start;
 gap: 0.5rem;
}

.detalle-item strong {
 color: #2c3e50;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.detalle-item.descripcion-completa .descripcion-texto {
 color: #2c3e50;
 line-height: 1.6;
 margin-top: 0.5rem;
 padding: 0.75rem;
 background: #f8f9fa;
 border-radius: 6px;
 border-left: 3px solid #607d8b;
}

/* Formulario */
.formulario-unidad {
 padding: 1rem 0;
}

.form-sections {
 display: flex;
 flex-direction: column;
 gap: 2rem;
}

.form-section {
 border: 1px solid #e9ecef;
 border-radius: 8px;
 padding: 1.5rem;
 background: #fafafa;
}

.section-title {
 color: #2c3e50;
 font-size: 1.1rem;
 font-weight: 600;
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 border-bottom: 1px solid #e9ecef;
 padding-bottom: 0.5rem;
}

.form-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
 gap: 1.5rem;
}

.form-group {
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
}

.form-group.full-width {
 grid-column: 1 / -1;
}

.form-group label {
 font-weight: 600;
 color: #2c3e50;
 font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
 padding: 0.75rem 1rem;
 border: 2px solid #e1e8ed;
 border-radius: 8px;
 font-size: 1rem;
 transition: border-color 0.3s ease;
 font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
 outline: none;
 border-color: #3498db;
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-textarea {
 resize: vertical;
 min-height: 100px;
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

/* Modal de confirmación */
.confirmacion-content {
 display: flex;
 flex-direction: column;
 gap: 2rem;
}

.unidad-info-resumen {
 display: flex;
 align-items: center;
 gap: 1rem;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 8px;
 border-left: 4px solid #607d8b;
}

.unidad-avatar {
 width: 60px;
 height: 60px;
 background: linear-gradient(135deg, #607d8b, #455a64);
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 color: white;
 font-size: 1.5rem;
 flex-shrink: 0;
}

.unidad-datos h4 {
 margin: 0 0 0.25rem 0;
 color: #2c3e50;
 font-size: 1.2rem;
}

.unidad-descripcion {
 margin: 0 0 0.25rem 0;
 color: #7f8c8d;
 font-size: 0.9rem;
}

.unidad-badges {
 display: flex;
 gap: 0.5rem;
 align-items: center;
 flex-wrap: wrap;
}

.unidad-id {
 font-family: monospace;
 background: #e3f2fd;
 color: #1976d2;
 padding: 0.2rem 0.5rem;
 border-radius: 4px;
 font-size: 0.8rem;
 font-weight: 600;
}

.abreviacion-count {
background: #37474f;
color: white;
padding: 0.2rem 0.5rem;
border-radius: 4px;
font-size: 0.8rem;
font-weight: 600;
font-family: monospace;
letter-spacing: 0.5px;
}

.tipo-count {
padding: 0.2rem 0.5rem;
border-radius: 4px;
font-size: 0.8rem;
font-weight: 600;
text-transform: capitalize;
border: 1px solid;
}

.tipo-count.cantidad { background: #e3f2fd; color: #1976d2; border-color: #90caf9; }
.tipo-count.capacidad { background: #f3e5f5; color: #7b1fa2; border-color: #ce93d8; }
.tipo-count.tiempo { background: #fff3e0; color: #f57c00; border-color: #ffb74d; }
.tipo-count.usuarios { background: #e8f5e8; color: #2e7d32; border-color: #a5d6a7; }
.tipo-count.sesiones { background: #fce4ec; color: #c2185b; border-color: #f48fb1; }

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

/* Animaciones */
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

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.admin-unidades-container {
animation: fadeIn 0.5s ease-out;
}

.unidad-card,
.stat-card {
animation: fadeIn 0.3s ease-out;
}

/* Estados de hover mejorados */
.btn:hover:not(:disabled) {
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.unidades-tabla tbody tr:hover {
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
.form-textarea:focus,
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

/* Transiciones suaves */
* {
transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
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

/* Personalización de scrollbars para modales */
.modal-content::-webkit-scrollbar {
width: 6px;
}

.modal-content::-webkit-scrollbar-track {
background: #f1f1f1;
}

.modal-content::-webkit-scrollbar-thumb {
background: #c1c1c1;
border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
background: #a8a8a8;
}

/* Efectos especiales para abreviaciones */
.abreviacion-badge:hover {
transform: scale(1.05);
box-shadow: 0 4px 16px rgba(55, 71, 79, 0.4);
}

/* Efectos para tipos */
.tipo-badge:hover {
transform: scale(1.05);
filter: brightness(1.1);
}

/* Estados específicos de badges */
.estado-badge {
position: relative;
overflow: hidden;
}

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

.estado-badge:hover::before {
left: 100%;
}

/* Mejoras para la navegación con teclado */
.btn-pag:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}

.page-input:invalid {
border-color: #e74c3c;
box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

/* Estados de validación para formularios */
.form-input:invalid,
.form-select:invalid,
.form-textarea:invalid {
border-color: #e74c3c;
}

.form-input:valid,
.form-select:valid,
.form-textarea:valid {
border-color: #27ae60;
}

.form-group.success .form-input,
.form-group.success .form-select,
.form-group.success .form-textarea {
border-color: #27ae60;
box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.form-group.error .form-input,
.form-group.error .form-select,
.form-group.error .form-textarea {
border-color: #e74c3c;
box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* Animación especial para estadísticas */
.stat-number {
background: linear-gradient(135deg, #2c3e50, #34495e);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
}

/* Responsive Design */
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
.admin-unidades-container {
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

.unidades-tabla {
  min-width: 900px;
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

.unidad-info-resumen {
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

.abreviacion-display {
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
}

/* Mantener botones de acción horizontales en móvil */
.acciones {
  gap: 0.25rem;
}

.btn-accion {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}
}

@media (max-width: 480px) {
.estadisticas-grid {
  grid-template-columns: 1fr;
}

.filtros-section,
.unidades-section {
  padding: 1rem;
}

.stat-card {
  padding: 1rem;
}

.unidad-card {
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

.unidad-avatar {
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

.abreviacion-display {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

/* Asegurar que los botones se mantengan horizontales */
.acciones {
  min-width: 90px;
  overflow-x: auto;
}

.btn-accion {
  width: 26px;
  height: 26px;
  font-size: 0.75rem;
  flex-shrink: 0;
}
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

.unidades-tabla td {
  padding: 1.5rem 1rem;
}

.acciones {
  gap: 0.75rem;
}
}

/* Efectos de pulso para elementos importantes */
@keyframes pulse {
0% {
  box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7);
}
70% {
  box-shadow: 0 0 0 10px rgba(52, 152, 219, 0);
}
100% {
  box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
}
}

.btn-primary:focus {
animation: pulse 2s infinite;
}

/* Modo de contraste alto */
@media (prefers-contrast: high) {
.tipo-badge,
.estado-badge,
.abreviacion-badge {
  border-width: 2px;
  font-weight: 700;
}
}

/* Modo sin animaciones */
@media (prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
}

/* Indicadores de estado de conexión */
.status-indicator {
transition: all 0.3s ease;
}

.status-indicator.online i {
text-shadow: 0 0 8px rgba(39, 174, 96, 0.5);
}

.status-indicator.offline i {
text-shadow: 0 0 8px rgba(231, 76, 60, 0.5);
}

/* Estados de notificaciones con salida */
.notification.hide {
animation: slideOutRight 0.3s ease-in forwards;
}

/* Mejoras en sombras */
.unidad-card,
.modal-content,
.unidades-section,
.filtros-section {
box-shadow: 
  0 1px 3px rgba(0, 0, 0, 0.12),
  0 1px 2px rgba(0, 0, 0, 0.24);
}

.unidad-card:hover {
box-shadow: 
  0 14px 28px rgba(0, 0, 0, 0.25),
  0 10px 10px rgba(0, 0, 0, 0.22);
}

/* Indicadores activos mejorados */
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

/* Transiciones de vista */
.tabla-container,
.tarjetas-container {
animation: fadeIn 0.4s ease-out;
}

/* Focus visible mejorado */
.stat-card:focus-within {
outline: 2px solid #3498db;
outline-offset: 2px;
}

.unidad-card:focus-within {
outline: 2px solid #3498db;
outline-offset: 2px;
}

/* Corrección final para botones de acciones - IMPORTANTE */
.unidades-tabla th:last-child,
.unidades-tabla td:last-child {
width: 140px;
min-width: 140px;
text-align: center;
}

.acciones {
display: flex !important;
flex-direction: row !important;
align-items: center !important;
justify-content: center !important;
gap: 0.5rem !important;
flex-wrap: nowrap !important;
white-space: nowrap !important;
}

.btn-accion {
flex: 0 0 auto !important;
display: inline-flex !important;
margin: 0 !important;
}
</style>