<template>
 <div class="admin-cotizaciones-container">
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
       <h1 class="page-title">Gestión de Cotizaciones</h1>
       <p class="page-subtitle">Supervisión y control de todas las cotizaciones del sistema</p>
     </div>
     <div class="header-actions">
       <button class="btn btn-primary" @click="nuevaCotizacion">
         <i class="fas fa-plus btn-icon"></i>
         Nueva Cotización
       </button>
       <button class="btn btn-secondary" @click="cargarCotizaciones">
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
           placeholder="Buscar por CT número, cliente, vendedor..."
           class="search-input"
           @input="buscarCotizaciones"
         />
       </div>
       
       <div class="filtros-grid">
         <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
           <option value="">Todos los estados</option>
           <option value="pendiente">Pendiente</option>
           <option value="pendiente_aprobacion">Esperando Aprobación</option>
           <option value="efectiva">Efectiva</option>
           <option value="rechazada">Rechazada</option>
         </select>
         
         <select v-model="filtros.vendedor" class="filter-select" @change="aplicarFiltros">
           <option value="">Todos los vendedores</option>
           <option v-for="vendedor in vendedoresUnicos" :key="vendedor" :value="vendedor">
             {{ vendedor }}
           </option>
         </select>
         
         <select v-model="filtros.periodo" class="filter-select" @change="aplicarFiltros">
           <option value="">Todo el tiempo</option>
           <option value="hoy">Hoy</option>
           <option value="semana">Esta semana</option>
           <option value="mes">Este mes</option>
           <option value="trimestre">Este trimestre</option>
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
         <div class="stat-number">{{ estadisticas.total || 0 }}</div>
         <div class="stat-label">Total Cotizaciones</div>
       </div>
     </div>
     
     <div class="stat-card esperando">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.esperando || 0 }}</div>
         <div class="stat-label">Esperando Aprobación</div>
       </div>
     </div>
     
     <div class="stat-card pendientes">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.pendientes || 0 }}</div>
         <div class="stat-label">Pendientes</div>
       </div>
     </div>
     
     <div class="stat-card efectivas">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.efectivas || 0 }}</div>
         <div class="stat-label">Efectivas</div>
       </div>
     </div>

     <div class="stat-card vendedores">
       <div class="stat-content">
         <div class="stat-number">{{ vendedoresUnicos.length }}</div>
         <div class="stat-label">Vendedores Activos</div>
       </div>
     </div>
   </div>

   <!-- Tabla de cotizaciones -->
   <div class="cotizaciones-section">
     <div class="section-header">
       <h2 class="section-title">
         {{ pagination ? pagination.totalItems : cotizaciones.length }} Cotizaciones encontradas
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
         de {{ pagination.totalItems }} cotizaciones
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
         <table class="cotizaciones-tabla">
           <thead>
             <tr>
               <th @click="ordenarPor('numero')" class="sortable">
                 # Cotización
                 <span class="sort-icon">{{ getSortIcon('numero') }}</span>
               </th>
               <th @click="ordenarPor('cliente')" class="sortable">
                 Cliente
                 <span class="sort-icon">{{ getSortIcon('cliente') }}</span>
               </th>
               <th>Servicios</th>
               <th @click="ordenarPor('fecha')" class="sortable">
                 Fecha Creación
                 <span class="sort-icon">{{ getSortIcon('fecha') }}</span>
               </th>
               <th @click="ordenarPor('vendedor')" class="sortable">
                 Vendedor
                 <span class="sort-icon">{{ getSortIcon('vendedor') }}</span>
               </th>
               <th @click="ordenarPor('total')" class="sortable">
                 Total
                 <span class="sort-icon">{{ getSortIcon('total') }}</span>
               </th>
               <th>Estado</th>
               <th>PDF</th>
               <th>Acciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="cotizacion in cotizaciones" :key="cotizacion.id">
               <td>
                 <span class="numero-cotizacion">{{ formatearNumeroCotizacion(cotizacion.id) }}</span>
               </td>
               <td>
                 <div class="cliente-info">
                   <span class="cliente-nombre">{{ cotizacion.cliente_info?.nombre_completo || 'Sin cliente' }}</span>
                   <span class="cliente-email">{{ cotizacion.cliente_info?.email_principal || 'Sin email' }}</span>
                 </div>
               </td>
               <td>
                 <div class="servicios-info">
                   <span class="servicios-count">{{ cotizacion.servicios?.length || 0 }} servicio(s)</span>
                   <div class="servicios-preview">
                     <span v-for="(servicio, index) in (cotizacion.servicios || []).slice(0, 2)" 
                           :key="index" 
                           class="servicio-tag">
                       {{ servicio }}
                     </span>
                     <span v-if="(cotizacion.servicios || []).length > 2" class="servicios-mas">
                       +{{ (cotizacion.servicios || []).length - 2 }} más
                     </span>
                   </div>
                 </div>
               </td>
               <td>
                 <span class="fecha">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
               </td>
               <td>
                 <div class="vendedor-info">
                   <span class="vendedor-nombre">{{ cotizacion.vendedor_info?.nombre_completo || 'Sin vendedor' }}</span>
                   <span class="vendedor-rol">{{ cotizacion.vendedor_info?.rol_formateado || 'Sin rol' }}</span>
                 </div>
               </td>
               <td>
                 <span class="monto">{{ formatearMoneda(cotizacion.total) }}</span>
               </td>
               <td>
                 <span class="estado-badge" :class="cotizacion.estado">
                   {{ cotizacion.estado_label || getEstadoTexto(cotizacion.estado) }}
                 </span>
               </td>
               <td>
                 <div class="pdf-status">
                   <span v-if="cotizacion.pdfGenerado" class="pdf-disponible">
                     <i class="fas fa-check-circle"></i> Disponible
                   </span>
                   <span v-else class="pdf-no-disponible">
                     <i class="fas fa-times-circle"></i> No generado
                   </span>
                 </div>
               </td>
               <td>
                 <div class="acciones">
                   <button 
                     class="btn-accion ver"
                     @click="verCotizacion(cotizacion)"
                     title="Ver detalles"
                   >
                     <i class="fas fa-eye"></i>
                   </button>
                   <button 
                     v-if="cotizacion.pdfGenerado"
                     class="btn-accion imprimir"
                     @click="mostrarModalPDF(cotizacion)"
                     title="Ver/Descargar PDF"
                   >
                     <i class="fas fa-file-pdf"></i>
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
           v-for="cotizacion in cotizaciones" 
           :key="cotizacion.id"
           class="cotizacion-card"
         >
           <div class="card-header">
             <div class="card-numero">{{ formatearNumeroCotizacion(cotizacion.id) }}</div>
             <span class="estado-badge" :class="cotizacion.estado">
               {{ cotizacion.estado_label || getEstadoTexto(cotizacion.estado) }}
             </span>
           </div>
           
           <div class="card-content">
             <h3 class="cliente-nombre">{{ cotizacion.cliente_info?.nombre_completo || 'Sin cliente' }}</h3>
             <p class="cliente-email">{{ cotizacion.cliente_info?.email_principal || 'Sin email' }}</p>
             
             <div class="servicios-card">
               <strong>Servicios ({{ (cotizacion.servicios || []).length }}):</strong>
               <div class="servicios-list">
                 <span v-for="(servicio, index) in (cotizacion.servicios || []).slice(0, 3)" 
                       :key="index" 
                       class="servicio-tag">
                   {{ servicio }}
                 </span>
                 <span v-if="(cotizacion.servicios || []).length > 3" class="servicios-mas">
                   +{{ (cotizacion.servicios || []).length - 3 }} más
                 </span>
               </div>
             </div>
             
             <div class="card-details">
               <div class="detail">
                 <span class="detail-label">Fecha:</span>
                 <span class="detail-value">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
               </div>
               <div class="detail">
                 <span class="detail-label">Vendedor:</span>
                 <span class="detail-value">{{ cotizacion.vendedor_info?.nombre_completo || 'Sin vendedor' }}</span>
               </div>
               <div class="detail">
                 <span class="detail-label">Total:</span>
                 <span class="detail-value monto">{{ formatearMoneda(cotizacion.total) }}</span>
               </div>
               <div class="detail">
                 <span class="detail-label">PDF:</span>
                 <span class="detail-value" :class="cotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                   <i :class="cotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                   {{ cotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
                 </span>
               </div>
             </div>
           </div>
           
           <div class="card-actions">
             <button class="btn btn-sm btn-outline" @click="verCotizacion(cotizacion)">
               Ver Detalles
             </button>
             <button 
               v-if="cotizacion.pdfGenerado"
               class="btn btn-sm btn-secondary" 
               @click="mostrarModalPDF(cotizacion)"
             >
               <i class="fas fa-file-pdf"></i> PDF
             </button>
           </div>
         </div>
       </div>
     </div>

     <!-- Mensaje cuando no hay cotizaciones -->
     <div v-if="cotizaciones.length === 0 && !loading" class="empty-state">
       <div class="empty-icon"><i class="fas fa-file-alt"></i></div>
       <h3 class="empty-title">No hay cotizaciones</h3>
       <p class="empty-description">
         {{ filtros.busqueda || filtros.estado || filtros.periodo 
           ? 'No se encontraron cotizaciones con los filtros aplicados.' 
           : 'Aún no se han creado cotizaciones en el sistema.' }}
       </p>
       <button class="btn btn-primary" @click="nuevaCotizacion">
         <i class="fas fa-plus"></i>
         Crear Primera Cotización
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

   <!-- Modal de vista previa de cotización -->
   <div v-if="modalCotizacion" class="modal-overlay" @click="cerrarModal">
     <div class="modal-content" @click.stop>
       <div class="modal-header">
         <h3>Cotización {{ formatearNumeroCotizacion(modalCotizacion.id) }}</h3>
         <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <div class="cotizacion-detalle">
           <div class="detalle-grid">
             <div class="detalle-item">
               <strong>Cliente:</strong> {{ modalCotizacion.cliente_info?.nombre_completo || 'Sin cliente' }}
             </div>
             <div class="detalle-item">
               <strong>Email:</strong> {{ modalCotizacion.cliente_info?.email_principal || 'Sin email' }}
             </div>
             <div class="detalle-item">
               <strong>Vendedor:</strong> {{ modalCotizacion.vendedor_info?.nombre_completo || 'Sin vendedor' }}
             </div>
             <div class="detalle-item">
               <strong>Fecha de Creación:</strong> {{ formatearFecha(modalCotizacion.fechaCreacion) }}
             </div>
             <div class="detalle-item">
               <strong>Total:</strong> {{ formatearMoneda(modalCotizacion.total) }}
             </div>
             <div class="detalle-item">
               <strong>Estado:</strong> 
               <span class="estado-badge" :class="modalCotizacion.estado">
                 {{ modalCotizacion.estado_label || getEstadoTexto(modalCotizacion.estado) }}
               </span>
             </div>
             <div class="detalle-item">
               <strong>PDF:</strong> 
               <span :class="modalCotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                 <i :class="modalCotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                 {{ modalCotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
               </span>
             </div>
           </div>
           
           <div class="servicios-detalle">
             <h4>Servicios Incluidos ({{ (modalCotizacion.servicios || []).length }})</h4>
             <div class="servicios-modal-list">
               <span v-for="(servicio, index) in (modalCotizacion.servicios || [])" 
                     :key="index" 
                     class="servicio-modal-tag">
                 {{ servicio }}
               </span>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>

   <!-- Modal de vista previa del PDF -->
   <div v-if="modalPDF" class="modal-overlay" @click="cerrarModalPDF">
     <div class="modal-content modal-pdf" @click.stop>
       <div class="modal-header">
         <h3>
           <i class="fas fa-file-pdf"></i>
           Vista Previa PDF - {{ formatearNumeroCotizacion(cotizacionPDF.id) }}
         </h3>
         <button class="btn-close" @click="cerrarModalPDF">
           <i class="fas fa-times"></i>
         </button>
       </div>
       
       <div class="modal-body">
         <!-- Controles del PDF -->
         <div class="pdf-controls">
           <div class="tipo-documento">
             <button 
               class="btn-tipo"
               :class="{ active: tipoDocumento === 'copia' }"
               @click="cambiarTipoDocumento('copia')"
             >
               <i class="fas fa-copy"></i>
               Copia
             </button>
             <button 
               class="btn-tipo"
               :class="{ active: tipoDocumento === 'original' }"
               @click="cambiarTipoDocumento('original')"
             >
               <i class="fas fa-certificate"></i>
               Original
             </button>
           </div>
           
           <div class="info-documento">
             <span class="documento-tipo" :class="tipoDocumento">
               <i :class="tipoDocumento === 'copia' ? 'fas fa-copy' : 'fas fa-certificate'"></i>
               {{ tipoDocumento === 'copia' ? 'COPIA' : 'ORIGINAL' }}
             </span>
           </div>
         </div>

         <!-- Vista previa simulada del PDF -->
         <div class="pdf-preview">
           <div class="pdf-page">
             <div class="pdf-header">
               <div class="empresa-logo">
                 <i class="fas fa-building"></i>
                 <span>EMPRESA SERVICIOS</span>
               </div>
               <div class="documento-marca" :class="tipoDocumento">
                 {{ tipoDocumento === 'copia' ? 'COPIA' : 'ORIGINAL' }}
               </div>
             </div>
             
             <div class="pdf-content">
               <h2>COTIZACIÓN</h2>
               <div class="cotizacion-numero">
                 {{ formatearNumeroCotizacion(cotizacionPDF.id) }}
               </div>
               
               <div class="pdf-info-grid">
                 <div class="info-section">
                   <h4>Cliente:</h4>
                   <p>{{ cotizacionPDF.cliente_info?.nombre_completo || 'Sin cliente' }}</p>
                   <p>{{ cotizacionPDF.cliente_info?.email_principal || 'Sin email' }}</p>
                 </div>
                 
                 <div class="info-section">
                   <h4>Vendedor:</h4>
                   <p>{{ cotizacionPDF.vendedor_info?.nombre_completo || 'Sin vendedor' }}</p>
                   <p>{{ cotizacionPDF.vendedor_info?.rol_formateado || 'Sin rol' }}</p>
                 </div>
                 
                 <div class="info-section">
                   <h4>Fecha:</h4>
                   <p>{{ formatearFecha(cotizacionPDF.fechaCreacion) }}</p>
                 </div>
               </div>
               
               <div class="servicios-pdf">
                 <h4>Servicios:</h4>
                 <ul>
                   <li v-for="(servicio, index) in (cotizacionPDF.servicios || [])" :key="index">
                     {{ servicio }}
                   </li>
                 </ul>
               </div>
               
               <div class="total-pdf">
                 <strong>Total: {{ formatearMoneda(cotizacionPDF.total) }}</strong>
               </div>
             </div>
             
             <div class="pdf-footer">
               <div class="marca-agua" v-if="tipoDocumento === 'copia'">COPIA</div>
               <p>Este documento es {{ tipoDocumento === 'copia' ? 'una copia' : 'el original' }} de la cotización</p>
             </div>
           </div>
         </div>
       </div>
       
       <div class="modal-footer">
         <button class="btn btn-outline" @click="cerrarModalPDF">
           <i class="fas fa-times"></i>
           Cancelar
         </button>
         <button class="btn btn-primary" @click="descargarPDF" :disabled="descargandoPDF">
           <i :class="descargandoPDF ? 'fas fa-spinner fa-spin' : 'fas fa-download'"></i>
           {{ descargandoPDF ? 'Descargando...' : `Descargar ${tipoDocumento === 'copia' ? 'Copia' : 'Original'}` }}
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
import cotizacionesService from '@/services/cotizacionesService';

export default {
 name: 'AdminCotizaciones',
 data() {
   return {
     loading: false,
     loadingMessage: 'Cargando cotizaciones...',
     vistaActual: 'tabla',
     modalCotizacion: null,
     modalPDF: false,
     cotizacionPDF: null,
     tipoDocumento: 'copia',
     descargandoPDF: false,
     paginaSalto: 1,
     itemsPorPagina: 25,
     ordenActual: { campo: 'fechaCreacion', direccion: 'desc' },

     // Datos del backend
     cotizaciones: [],
     vendedoresUnicos: [],
     pagination: null,
     estadisticas: {
       total: 0,
       esperando: 0,
       pendientes: 0,
       efectivas: 0,
       rechazadas: 0
     },
     
     filtros: {
       busqueda: '',
       estado: '',
       vendedor: '',
       periodo: ''
     },

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
     this.loadingMessage = 'Cargando datos del sistema...';
     
     try {
       // Cargar cotizaciones, vendedores y estadísticas
       this.loadingMessage = 'Cargando cotizaciones...';
       await this.cargarCotizaciones();
       
       this.loadingMessage = 'Cargando vendedores...';
       await this.cargarVendedores();
       
       this.loadingMessage = 'Cargando estadísticas...';
       await this.cargarEstadisticas();
       
     } catch (error) {
       this.showNotification('Error cargando datos del sistema', 'error');
     } finally {
       this.loading = false;
     }
   },

   async cargarCotizaciones() {
     try {
       const params = {
         page: this.pagination?.currentPage || 1,
         limit: this.itemsPorPagina,
         search: this.filtros.busqueda || undefined,
         estado: this.filtros.estado || undefined,
         vendedor: this.filtros.vendedor || undefined,
         periodo: this.filtros.periodo || undefined
       };
       
       const result = await cotizacionesService.getCotizaciones(params);
       
       if (result.success) {
         // Formatear cada cotización usando el helper del servicio
         this.cotizaciones = result.cotizaciones.map(cotizacion => 
           cotizacionesService.formatCotizacionDisplay(cotizacion)
         );
         this.pagination = result.pagination;
       } else {
         this.showNotification(result.message || 'Error cargando cotizaciones', 'error');
       }
       
     } catch (error) {
       this.showNotification('Error de conexión al cargar cotizaciones', 'error');
     }
   },

   async cargarVendedores() {
     try {
       const result = await cotizacionesService.getVendedores();
       if (result.success) {
         this.vendedoresUnicos = result.vendedores || [];
       } else {
         this.vendedoresUnicos = [];
       }
       
     } catch (error) {
       this.vendedoresUnicos = [];
     }
   },

   async cargarEstadisticas() {
     try {
       const result = await cotizacionesService.getEstadisticas();
       
       if (result.success) {
         this.estadisticas = result.estadisticas;
       }
       
     } catch (error) {
       // Error silencioso para estadísticas
     }
   },

   // ==================== BÚSQUEDA Y FILTROS ====================
   buscarCotizaciones() {
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
     
     await this.cargarCotizaciones();
   },

   limpiarFiltros() {
     this.filtros = {
       busqueda: '',
       estado: '',
       vendedor: '',
       periodo: ''
     };
     
     this.aplicarFiltros();
   },

   // ==================== PAGINACIÓN ====================
   async cambiarItemsPorPagina() {
     if (this.pagination) {
       this.pagination.currentPage = 1;
     }
     this.paginaSalto = 1;
     await this.cargarCotizaciones();
   },

   async irAPrimera() {
     if (this.pagination && this.pagination.currentPage !== 1) {
       this.pagination.currentPage = 1;
       await this.cargarCotizaciones();
     }
   },

   async irAUltima() {
     if (this.pagination && this.pagination.currentPage !== this.pagination.totalPages) {
       this.pagination.currentPage = this.pagination.totalPages;
       await this.cargarCotizaciones();
     }
   },

   async paginaAnterior() {
     if (this.pagination && this.pagination.hasPrevPage) {
       this.pagination.currentPage--;
       await this.cargarCotizaciones();
     }
   },

   async paginaSiguiente() {
     if (this.pagination && this.pagination.hasNextPage) {
       this.pagination.currentPage++;
       await this.cargarCotizaciones();
     }
   },

   async irAPagina(pagina = null) {
     const targetPage = pagina || this.paginaSalto;
     
     if (this.pagination && targetPage >= 1 && targetPage <= this.pagination.totalPages) {
       this.pagination.currentPage = targetPage;
       await this.cargarCotizaciones();
     } else {
       this.showNotification(`Por favor ingresa un número entre 1 y ${this.pagination?.totalPages || 1}`, 'warning');
       this.paginaSalto = this.pagination?.currentPage || 1;
     }
   },

   // ==================== GESTIÓN DE COTIZACIONES ====================
   nuevaCotizacion() {
     this.$router.push('/shared/cotizacion');
   },
  
   verCotizacion(cotizacion) {
     this.modalCotizacion = cotizacion;
   },
  
   // ==================== PDF ====================
   mostrarModalPDF(cotizacion) {
     this.cotizacionPDF = cotizacion;
     this.tipoDocumento = 'copia';
     this.modalPDF = true;
   },
  
   cambiarTipoDocumento(tipo) {
     this.tipoDocumento = tipo;
   },
  
   async descargarPDF() {
     if (this.descargandoPDF || !this.cotizacionPDF) return;
     
     this.descargandoPDF = true;
     
     try {
       const result = await cotizacionesService.generarPDF(this.cotizacionPDF.id, this.tipoDocumento);
       
       if (result.success) {
         this.showNotification(result.message || 'PDF descargado exitosamente', 'success');
         this.cerrarModalPDF();
       } else {
         this.showNotification(result.message || 'Error al generar PDF', 'error');
       }
       
     } catch (error) {
       this.showNotification('Error de conexión al generar PDF', 'error');
     } finally {
       this.descargandoPDF = false;
     }
   },
  
   cerrarModalPDF() {
     this.modalPDF = false;
     this.cotizacionPDF = null;
     this.tipoDocumento = 'copia';
   },

   // ==================== ORDENAMIENTO ====================
   ordenarPor(campo) {
     if (this.ordenActual.campo === campo) {
       this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
     } else {
       this.ordenActual = { campo, direccion: 'asc' };
     }
     
     // Aplicar ordenamiento localmente ya que el servicio tiene helper para esto
     this.cotizaciones = cotizacionesService.sortCotizaciones(
       this.cotizaciones, 
       this.ordenActual.campo, 
       this.ordenActual.direccion
     );
   },
  
   getSortIcon(campo) {
     if (this.ordenActual.campo !== campo) return '↕';
     return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
   },

   // ==================== MODALES ====================
   cerrarModal() {
     this.modalCotizacion = null;
   },

   // ==================== HELPERS ====================
   formatearNumeroCotizacion(id) {
     return cotizacionesService.formatNumeroCotizacion(id);
   },

   formatearFecha(fecha) {
     return cotizacionesService.formatDate(fecha);
   },
  
   formatearMoneda(monto) {
     return cotizacionesService.formatPrice(monto);
   },

   getEstadoTexto(estado) {
     const estados = cotizacionesService.getEstados();
     const estadoObj = estados.find(e => e.value === estado);
     return estadoObj?.label || estado;
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
/* Estilos existentes... */
.admin-cotizaciones-container {
 padding: 2rem;
 max-width: 1400px;
 margin: 0 auto;
}

.loading-overlay {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(255, 255, 255, 0.9);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 9999;
}

.loading-spinner {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 1rem;
 padding: 2rem;
 background: white;
 border-radius: 12px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner i {
 font-size: 2rem;
 color: #3498db;
}

.loading-spinner span {
 color: #2c3e50;
 font-weight: 500;
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

.btn-primary {
 background: linear-gradient(135deg, #3498db, #2980b9);
 color: white;
}

.btn-primary:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
 background: #bdc3c7;
 cursor: not-allowed;
 transform: none;
 box-shadow: none;
}

.btn-secondary {
 background: #95a5a6;
 color: white;
}

.btn-secondary:hover {
 background: #7f8c8d;
}

.btn-outline {
 background: transparent;
 color: #3498db;
 border: 2px solid #3498db;
}

.btn-outline:hover {
 background: #3498db;
 color: white;
}

.btn-sm {
 padding: 0.5rem 1rem;
 font-size: 0.85rem;
}

/* Estilos específicos para el modal del PDF */
.modal-pdf {
 max-width: 900px;
 max-height: 95vh;
}

.pdf-controls {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 8px;
 margin-bottom: 1.5rem;
 border: 1px solid #e9ecef;
}

.tipo-documento {
 display: flex;
 gap: 0.5rem;
}

.btn-tipo {
 padding: 0.5rem 1rem;
 border: 2px solid #e1e8ed;
 background: white;
 border-radius: 6px;
 cursor: pointer;
 transition: all 0.3s ease;
 font-size: 0.85rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.btn-tipo:hover {
 border-color: #3498db;
 color: #3498db;
}

.btn-tipo.active {
 background: #3498db;
 color: white;
 border-color: #3498db;
}

.info-documento {
 display: flex;
 align-items: center;
}

.documento-tipo {
 padding: 0.5rem 1rem;
 border-radius: 20px;
 font-weight: 600;
 font-size: 0.9rem;
 text-transform: uppercase;
 letter-spacing: 1px;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.documento-tipo.copia {
 background: #fff3cd;
 color: #856404;
 border: 1px solid #ffeaa7;
}

.documento-tipo.original {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.pdf-preview {
 background: #f5f5f5;
 padding: 2rem;
 border-radius: 8px;
 display: flex;
 justify-content: center;
 min-height: 500px;
}

.pdf-page {
 background: white;
 width: 100%;
 max-width: 600px;
 padding: 2rem;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
 border-radius: 4px;
 position: relative;
}

.pdf-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding-bottom: 1rem;
 border-bottom: 2px solid #e9ecef;
 margin-bottom: 1.5rem;
}

.empresa-logo {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 font-weight: 700;
 color: #2c3e50;
 font-size: 1.2rem;
}

.empresa-logo i {
 font-size: 1.5rem;
 color: #3498db;
}

.documento-marca {
 padding: 0.5rem 1rem;
 border-radius: 4px;
 font-weight: 700;
 font-size: 0.9rem;
 text-transform: uppercase;
 letter-spacing: 1px;
}

.documento-marca.copia {
 background: #fff3cd;
 color: #856404;
 border: 2px solid #f39c12;
}

.documento-marca.original {
 background: #d4edda;
 color: #155724;
 border: 2px solid #27ae60;
}

.pdf-content h2 {
 text-align: center;
 color: #2c3e50;
 margin-bottom: 0.5rem;
 font-size: 1.8rem;
}

.cotizacion-numero {
 text-align: center;
 font-family: monospace;
 font-size: 1.2rem;
 font-weight: 600;
 color: #3498db;
 margin-bottom: 1.5rem;
}

.pdf-info-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
 gap: 1rem;
 margin-bottom: 1.5rem;
}

.info-section h4 {
 color: #2c3e50;
 margin-bottom: 0.5rem;
 font-size: 0.9rem;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.info-section p {
 margin: 0.25rem 0;
 color: #555;
 font-size: 0.9rem;
}

.servicios-pdf {
 margin-bottom: 1.5rem;
}

.servicios-pdf h4 {
 color: #2c3e50;
 margin-bottom: 0.5rem;
 font-size: 0.9rem;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.servicios-pdf ul {
 margin: 0;
 padding-left: 1.5rem;
}

.servicios-pdf li {
 margin: 0.25rem 0;
 color: #555;
 font-size: 0.9rem;
}

.total-pdf {
 text-align: right;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 4px;
 border-left: 4px solid #3498db;
 font-size: 1.1rem;
 color: #2c3e50;
}

.pdf-footer {
 margin-top: 2rem;
 padding-top: 1rem;
 border-top: 1px solid #e9ecef;
 text-align: center;
 position: relative;
}

.marca-agua {
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%) rotate(-45deg);
 font-size: 3rem;
 font-weight: 700;
 color: rgba(243, 156, 18, 0.1);
 text-transform: uppercase;
 letter-spacing: 0.5rem;
 pointer-events: none;
}

.pdf-footer p {
 margin: 0;
 color: #7f8c8d;
 font-size: 0.8rem;
 font-style: italic;
}

/* Resto de estilos existentes del componente base... */
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
.stat-card.esperando { border-left: 4px solid #f39c12; }
.stat-card.pendientes { border-left: 4px solid #17a2b8; }
.stat-card.efectivas { border-left: 4px solid #27ae60; }
.stat-card.vendedores { border-left: 4px solid #9b59b6; }

/* Servicios */
.servicios-info {
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
}

.servicios-count {
 font-weight: 600;
 color: #2c3e50;
 font-size: 0.85rem;
}

.servicios-preview {
 display: flex;
 flex-wrap: wrap;
 gap: 0.25rem;
}

.servicio-tag {
 background: #e3f2fd;
 color: #1976d2;
 padding: 0.2rem 0.5rem;
 border-radius: 12px;
 font-size: 0.75rem;
 font-weight: 500;
}

.servicios-mas {
 background: #f5f5f5;
 color: #757575;
 padding: 0.2rem 0.5rem;
 border-radius: 12px;
 font-size: 0.75rem;
 font-style: italic;
}

/* Información del vendedor */
.vendedor-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.vendedor-nombre {
 font-weight: 500;
 color: #2c3e50;
}

.vendedor-rol {
 color: #7f8c8d;
 font-size: 0.85rem;
}

/* Servicios en cards */
.servicios-card {
 margin: 1rem 0;
 padding: 0.75rem;
 background: #f8f9fa;
 border-radius: 6px;
}

.servicios-list {
 display: flex;
 flex-wrap: wrap;
 gap: 0.5rem;
 margin-top: 0.5rem;
}

/* Modal servicios */
.servicios-detalle {
 margin-top: 1.5rem;
 padding-top: 1.5rem;
 border-top: 1px solid #e9ecef;
}

.servicios-detalle h4 {
 color: #2c3e50;
 margin-bottom: 1rem;
 font-size: 1.1rem;
}

.servicios-modal-list {
 display: flex;
 flex-wrap: wrap;
 gap: 0.5rem;
}

.servicio-modal-tag {
 background: #e3f2fd;
 color: #1976d2;
 padding: 0.5rem 1rem;
 border-radius: 20px;
 font-size: 0.9rem;
 font-weight: 500;
}

/* Tabla y resto de componentes... */
.cotizaciones-section {
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

/* Tabla */
.tabla-wrapper {
 overflow-x: auto;
}

.cotizaciones-tabla {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 1rem;
}

.cotizaciones-tabla th {
 background: #f8f9fa;
 padding: 1rem;
 text-align: left;
 font-weight: 600;
 color: #2c3e50;
 border-bottom: 2px solid #e9ecef;
 white-space: nowrap;
}

.cotizaciones-tabla th.sortable {
 cursor: pointer;
 user-select: none;
}

.cotizaciones-tabla th.sortable:hover {
 background: #e9ecef;
}

.sort-icon {
 margin-left: 0.5rem;
 opacity: 0.5;
}

.cotizaciones-tabla td {
 padding: 1rem;
 border-bottom: 1px solid #e9ecef;
 vertical-align: middle;
}

.numero-cotizacion {
 font-weight: 600;
 color: #3498db;
 font-family: monospace;
 font-size: 1rem;
}

.cliente-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.cliente-nombre {
 font-weight: 500;
 color: #2c3e50;
}

.cliente-email {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.fecha {
 color: #2c3e50;
 white-space: nowrap;
}

.estado-badge {
 padding: 0.375rem 0.75rem;
 border-radius: 20px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.estado-badge.pendiente {
 background: #d1ecf1;
 color: #0c5460;
 border: 1px solid #bee5eb;
}

.estado-badge.pendiente_aprobacion {
 background: #fff3cd;
 color: #856404;
 border: 1px solid #ffeaa7;
}

.estado-badge.efectiva {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.estado-badge.rechazada {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
}

.monto {
 font-weight: 600;
 color: #27ae60;
 font-family: monospace;
}

.acciones {
 display: flex !important;
 flex-direction: row !important;
 gap: 0.5rem;
 flex-wrap: nowrap;
 align-items: center;
 justify-content: flex-start;
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

.btn-accion.imprimir {
 background: #e8f5e8;
 color: #388e3c;
}

.btn-accion.imprimir:hover {
 background: #c8e6c9;
}

/* PDF status */
.pdf-status {
 text-align: center;
}

.pdf-disponible {
 color: #27ae60;
 font-weight: 600;
 font-size: 0.85rem;
}

.pdf-no-disponible {
 color: #e74c3c;
 font-weight: 600;
 font-size: 0.85rem;
}

.pdf-ok {
 color: #27ae60;
 font-weight: 600;
}

.pdf-no {
 color: #e74c3c;
 font-weight: 600;
}

/* Vista de tarjetas */
.tarjetas-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
 gap: 1.5rem;
}

.cotizacion-card {
 border: 1px solid #e9ecef;
 border-radius: 12px;
 padding: 1.5rem;
 transition: all 0.3s ease;
 background: white;
}

.cotizacion-card:hover {
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

.card-content p {
 color: #7f8c8d;
 font-size: 0.9rem;
 margin-bottom: 1rem;
}

.card-details {
 display: grid;
 gap: 0.5rem;
 margin-bottom: 1.5rem;
}

.detail {
 display: flex;
 justify-content: space-between;
 align-items: center;
}

.detail-label {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.detail-value {
 color: #2c3e50;
 font-weight: 500;
 font-size: 0.9rem;
}

.detail-value.monto {
 color: #27ae60;
 font-family: monospace;
}

.card-actions {
 display: flex !important;
 flex-direction: row !important;
 gap: 0.75rem;
 flex-wrap: wrap;
}

.card-actions .btn {
 flex: 1;
 justify-content: center;
 min-width: 80px;
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

.cotizacion-detalle {
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
}

/* ESTILOS PARA TOAST DE NOTIFICACIONES */
.notification {
 position: fixed;
 top: 20px;
 right: 20px;
 min-width: 320px;
 max-width: 500px;
 padding: 1rem 1.25rem;
 border-radius: 12px;
 color: white;
 font-weight: 500;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
 display: flex;
 align-items: center;
 gap: 0.75rem;
 z-index: 10000;
 animation: slideInRight 0.3s ease-out;
 transform: translateX(0);
 transition: all 0.3s ease;
}

.notification.notification-success {
 background: linear-gradient(135deg, #27ae60, #2ecc71);
 border-left: 4px solid #1e8449;
}

.notification.notification-error {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
 border-left: 4px solid #a93226;
}

.notification.notification-warning {
 background: linear-gradient(135deg, #f39c12, #e67e22);
 border-left: 4px solid #d68910;
}

.notification.notification-info {
 background: linear-gradient(135deg, #3498db, #2980b9);
 border-left: 4px solid #2471a3;
}

.notification i {
 font-size: 1.25rem;
 flex-shrink: 0;
}

.notification span {
 flex: 1;
 line-height: 1.4;
}

.notification-close {
 background: none;
 border: none;
 color: white;
 font-size: 1.1rem;
 cursor: pointer;
 padding: 0.25rem;
 border-radius: 50%;
 transition: background 0.2s ease;
 flex-shrink: 0;
 opacity: 0.8;
}

.notification-close:hover {
 background: rgba(255, 255, 255, 0.2);
 opacity: 1;
}

@keyframes slideInRight {
 from {
   transform: translateX(100%);
   opacity: 0;
 }
 to {
   transform: translateX(0);
   opacity: 1;
 }
}

/* Responsive Design */
@media (max-width: 1200px) {
 .estadisticas-grid {
   grid-template-columns: repeat(3, 1fr);
 }
 
 .pdf-preview {
   padding: 1rem;
 }
 
 .pdf-page {
   padding: 1.5rem;
 }
}

@media (max-width: 768px) {
 .admin-cotizaciones-container {
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

 .cotizaciones-tabla {
   min-width: 900px;
 }

 .tarjetas-grid {
   grid-template-columns: 1fr;
 }

 .acciones {
   display: flex !important;
   flex-direction: row !important;
   gap: 0.4rem;
   flex-wrap: nowrap;
   justify-content: flex-start;
 }

 .btn-accion {
   width: 30px;
   height: 30px;
   font-size: 0.8rem;
   flex-shrink: 0;
 }

 .card-actions {
   display: flex !important;
   flex-direction: row !important;
   gap: 0.5rem;
   flex-wrap: wrap;
 }

 .card-actions .btn {
   flex: 1;
   justify-content: center;
   min-width: 80px;
 }

 .detalle-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.5rem;
 }
 
 /* Modal PDF responsive */
 .modal-pdf {
   max-width: 95%;
   margin: 1rem;
 }
 
 .pdf-controls {
   flex-direction: column;
   gap: 1rem;
   align-items: stretch;
   text-align: center;
 }
 
 .tipo-documento {
   justify-content: center;
 }
 
 .pdf-preview {
   padding: 0.5rem;
 }
 
 .pdf-page {
   padding: 1rem;
 }
 
 .pdf-header {
   flex-direction: column;
   gap: 1rem;
   text-align: center;
 }
 
 .pdf-info-grid {
   grid-template-columns: 1fr;
 }
}

@media (max-width: 480px) {
 .estadisticas-grid {
   grid-template-columns: 1fr;
 }

 .filtros-section,
 .cotizaciones-section {
   padding: 1rem;
 }

 .stat-card {
   padding: 1rem;
 }

 .cotizacion-card {
   padding: 1rem;
 }

 .modal-content {
   margin: 0.5rem;
 }

 .btn-pag {
   min-width: 35px;
   padding: 0.375rem 0.5rem;
 }

 .acciones {
   display: flex !important;
   flex-direction: row !important;
   gap: 0.3rem;
   flex-wrap: nowrap;
   justify-content: flex-start;
 }

 .btn-accion {
   width: 28px;
   height: 28px;
   font-size: 0.75rem;
   flex-shrink: 0;
 }

 .card-actions {
   display: flex !important;
   flex-direction: row !important;
   gap: 0.5rem;
   flex-wrap: wrap;
 }

 .card-actions .btn {
   flex: 1;
   min-width: 70px;
   font-size: 0.8rem;
   padding: 0.4rem 0.8rem;
 }
 
 .modal-pdf {
   max-width: 100%;
   margin: 0.5rem;
 }
 
 .modal-footer {
   flex-direction: column;
 }
 
 .btn-tipo {
   padding: 0.4rem 0.8rem;
   font-size: 0.8rem;
 }
 
 .documento-tipo {
   padding: 0.4rem 0.8rem;
   font-size: 0.8rem;
 }
 
 .pdf-page {
   padding: 0.75rem;
 }
 
 .pdf-content h2 {
   font-size: 1.4rem;
 }
 
 .cotizacion-numero {
   font-size: 1rem;
 }

 .notification {
   left: 10px;
   right: 10px;
   min-width: auto;
   max-width: none;
 }
}
</style>