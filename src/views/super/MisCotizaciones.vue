<template>
 <div class="admin-cotizaciones-container">
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
         />
       </div>
       
       <div class="filtros-grid">
         <select v-model="filtros.estado" class="filter-select">
           <option value="">Todos los estados</option>
           <option value="esperando">Esperando Aprobación</option>
           <option value="pendiente">Pendiente</option>
           <option value="efectiva">Efectiva</option>
           <option value="cancelada">Cancelada</option>
         </select>
         
         <select v-model="filtros.vendedor" class="filter-select">
           <option value="">Todos los vendedores</option>
           <option v-for="vendedor in vendedoresUnicos" :key="vendedor" :value="vendedor">
             {{ vendedor }}
           </option>
         </select>
         
         <select v-model="filtros.periodo" class="filter-select">
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
         <div class="stat-number">{{ estadisticas.total }}</div>
         <div class="stat-label">Total Cotizaciones</div>
       </div>
     </div>
     
     <div class="stat-card esperando">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.esperandoAprobacion }}</div>
         <div class="stat-label">Esperando Aprobación</div>
       </div>
     </div>
     
     <div class="stat-card pendientes">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.pendientes }}</div>
         <div class="stat-label">Pendientes</div>
       </div>
     </div>
     
     <div class="stat-card efectivas">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.efectivas }}</div>
         <div class="stat-label">Efectivas</div>
       </div>
     </div>

     <div class="stat-card vendedores">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.vendedoresActivos }}</div>
         <div class="stat-label">Vendedores Activos</div>
       </div>
     </div>
   </div>

   <!-- Tabla de cotizaciones -->
   <div class="cotizaciones-section">
     <div class="section-header">
       <h2 class="section-title">
         {{ cotizacionesFiltradas.length }} Cotizaciones encontradas
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
     <div class="paginacion-info">
       <span class="items-info">
         Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ cotizacionesFiltradas.length }} cotizaciones
       </span>
       <div class="pagination-jump">
         <label for="jump-page">Ir a página:</label>
         <input 
           id="jump-page"
           type="number" 
           v-model.number="paginaSalto" 
           @keyup.enter="irAPagina"
           :min="1" 
           :max="totalPaginas"
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
               <th style="min-width: 200px;">Acciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="cotizacion in cotizacionesPaginadas" :key="cotizacion.id">
               <td>
                 <span class="numero-cotizacion">CT{{ String(cotizacion.id).padStart(6, '0') }}</span>
               </td>
               <td>
                 <div class="cliente-info">
                   <span class="cliente-nombre">{{ cotizacion.cliente.nombre }}</span>
                   <span class="cliente-email">{{ cotizacion.cliente.email }}</span>
                 </div>
               </td>
               <td>
                 <div class="servicios-info">
                   <span class="servicios-count">{{ cotizacion.servicios.length }} servicio(s)</span>
                   <div class="servicios-preview">
                     <span v-for="(servicio, index) in cotizacion.servicios.slice(0, 2)" 
                           :key="index" 
                           class="servicio-tag">
                       {{ servicio }}
                     </span>
                     <span v-if="cotizacion.servicios.length > 2" class="servicios-mas">
                       +{{ cotizacion.servicios.length - 2 }} más
                     </span>
                   </div>
                 </div>
               </td>
               <td>
                 <span class="fecha">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
               </td>
               <td>
                 <div class="vendedor-info">
                   <span class="vendedor-nombre">{{ cotizacion.vendedor.nombre }}</span>
                   <span class="vendedor-rol">{{ cotizacion.vendedor.rol }}</span>
                 </div>
               </td>
               <td>
                 <span class="monto">{{ formatearMoneda(cotizacion.total) }}</span>
               </td>
               <td>
                 <span class="estado-badge" :class="cotizacion.estado">
                   {{ getEstadoTexto(cotizacion.estado) }}
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
                   
                   <!-- Botones de Aceptar/Cancelar para "esperando" y "pendiente" -->
                   <template v-if="cotizacion.estado === 'esperando' || cotizacion.estado === 'pendiente'">
                     <button 
                       class="btn-accion aceptar"
                       @click="aceptarCotizacion(cotizacion)"
                       :title="cotizacion.estado === 'esperando' ? 'Aprobar cotización' : 'Marcar como efectiva'"
                     >
                       <i class="fas fa-check"></i>
                     </button>
                     <button 
                       class="btn-accion cancelar"
                       @click="rechazarCotizacion(cotizacion)"
                       :title="cotizacion.estado === 'esperando' ? 'Rechazar cotización' : 'Cancelar cotización'"
                     >
                       <i class="fas fa-times"></i>
                     </button>
                   </template>
                   
                   <button 
                     v-if="cotizacion.pdfGenerado"
                     class="btn-accion imprimir"
                     @click="descargarPDF(cotizacion)"
                     title="Descargar PDF"
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
           v-for="cotizacion in cotizacionesPaginadas" 
           :key="cotizacion.id"
           class="cotizacion-card"
         >
           <div class="card-header">
             <div class="card-numero">CT{{ String(cotizacion.id).padStart(6, '0') }}</div>
             <span class="estado-badge" :class="cotizacion.estado">
               {{ getEstadoTexto(cotizacion.estado) }}
             </span>
           </div>
           
           <div class="card-content">
             <h3 class="cliente-nombre">{{ cotizacion.cliente.nombre }}</h3>
             <p class="cliente-email">{{ cotizacion.cliente.email }}</p>
             
             <div class="servicios-card">
               <strong>Servicios ({{ cotizacion.servicios.length }}):</strong>
               <div class="servicios-list">
                 <span v-for="(servicio, index) in cotizacion.servicios.slice(0, 3)" 
                       :key="index" 
                       class="servicio-tag">
                   {{ servicio }}
                 </span>
                 <span v-if="cotizacion.servicios.length > 3" class="servicios-mas">
                   +{{ cotizacion.servicios.length - 3 }} más
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
                 <span class="detail-value">{{ cotizacion.vendedor.nombre }}</span>
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
             
             <!-- Botones de Aceptar/Cancelar en tarjetas -->
             <template v-if="cotizacion.estado === 'esperando' || cotizacion.estado === 'pendiente'">
               <button class="btn btn-sm btn-success" @click="aceptarCotizacion(cotizacion)">
                 <i class="fas fa-check"></i> 
                 {{ cotizacion.estado === 'esperando' ? 'Aprobar' : 'Efectiva' }}
               </button>
               <button class="btn btn-sm btn-danger" @click="rechazarCotizacion(cotizacion)">
                 <i class="fas fa-times"></i> 
                 {{ cotizacion.estado === 'esperando' ? 'Rechazar' : 'Cancelar' }}
               </button>
             </template>
             
             <button 
               v-if="cotizacion.pdfGenerado"
               class="btn btn-sm btn-secondary" 
               @click="descargarPDF(cotizacion)"
             >
               <i class="fas fa-file-pdf"></i> PDF
             </button>
           </div>
         </div>
       </div>
     </div>

     <!-- Mensaje cuando no hay cotizaciones -->
     <div v-if="cotizacionesFiltradas.length === 0" class="empty-state">
       <div class="empty-icon"><i class="fas fa-file-alt"></i></div>
       <h3 class="empty-title">No hay cotizaciones</h3>
       <p class="empty-description">
         {{ filtros.busqueda || filtros.estado || filtros.periodo 
           ? 'No se encontraron cotizaciones con los filtros aplicados.' 
           : 'Aún no se han creado cotizaciones en el sistema.' }}
       </p>
     </div>

     <!-- Paginación -->
     <div v-if="totalPaginas > 1" class="paginacion-completa">
       <div class="paginacion">
         <button 
           class="btn-pag"
           @click="irAPrimera"
           :disabled="paginaActual === 1"
           title="Primera página"
         >
           <i class="fas fa-angle-double-left"></i>
         </button>

         <button 
           class="btn-pag"
           @click="paginaActual = paginaActual - 1"
           :disabled="paginaActual === 1"
           title="Página anterior"
         >
           <i class="fas fa-chevron-left"></i>
         </button>
         
         <div class="paginas">
           <button
             v-if="paginasVisibles[0] > 1"
             class="btn-pag"
             @click="paginaActual = 1"
           >
             1
           </button>
           
           <span v-if="paginasVisibles[0] > 2" class="pagina-separador">...</span>
           
           <button
             v-for="pagina in paginasVisibles"
             :key="pagina"
             class="btn-pag"
             :class="{ active: pagina === paginaActual }"
             @click="paginaActual = pagina"
           >
             {{ pagina }}
           </button>
           
           <span v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1" class="pagina-separador">...</span>
           
           <button
             v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas"
             class="btn-pag"
             @click="paginaActual = totalPaginas"
           >
             {{ totalPaginas }}
           </button>
         </div>
         
         <button 
           class="btn-pag"
           @click="paginaActual = paginaActual + 1"
           :disabled="paginaActual === totalPaginas"
           title="Página siguiente"
         >
           <i class="fas fa-chevron-right"></i>
         </button>

         <button 
           class="btn-pag"
           @click="irAUltima"
           :disabled="paginaActual === totalPaginas"
           title="Última página"
         >
           <i class="fas fa-angle-double-right"></i>
         </button>
       </div>

       <div class="paginacion-info-bottom">
         <span class="pagina-actual">
           Página {{ paginaActual }} de {{ totalPaginas }}
         </span>
       </div>
     </div>
   </div>

   <!-- Modal de vista previa -->
   <div v-if="modalCotizacion" class="modal-overlay" @click="cerrarModal">
     <div class="modal-content" @click.stop>
       <div class="modal-header">
         <h3>Cotización CT{{ String(modalCotizacion.id).padStart(6, '0') }}</h3>
         <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <div class="cotizacion-detalle">
           <div class="detalle-grid">
             <div class="detalle-item">
               <strong>Cliente:</strong> {{ modalCotizacion.cliente.nombre }}
             </div>
             <div class="detalle-item">
               <strong>Email:</strong> {{ modalCotizacion.cliente.email }}
             </div>
             <div class="detalle-item">
               <strong>Vendedor:</strong> {{ modalCotizacion.vendedor.nombre }}
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
                 {{ getEstadoTexto(modalCotizacion.estado) }}
               </span>
             </div>
             <div class="detalle-item">
               <strong>PDF:</strong> 
               <span :class="modalCotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                 <i :class="modalCotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                 {{ modalCotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
               </span>
             </div>
             <div v-if="modalCotizacion.motivoRechazo" class="detalle-item">
               <strong>Motivo de Rechazo:</strong> 
               <span class="motivo-rechazo">{{ modalCotizacion.motivoRechazo }}</span>
             </div>
           </div>
           
           <div class="servicios-detalle">
             <h4>Servicios Incluidos ({{ modalCotizacion.servicios.length }})</h4>
             <div class="servicios-modal-list">
               <span v-for="(servicio, index) in modalCotizacion.servicios" 
                     :key="index" 
                     class="servicio-modal-tag">
                 {{ servicio }}
               </span>
             </div>
           </div>
           
           <!-- Acciones en modal para cotizaciones esperando o pendientes -->
           <div v-if="modalCotizacion.estado === 'esperando' || modalCotizacion.estado === 'pendiente'" class="modal-actions">
             <button class="btn btn-success" @click="aceptarCotizacion(modalCotizacion)">
               <i class="fas fa-check"></i> 
               {{ modalCotizacion.estado === 'esperando' ? 'Aprobar Cotización' : 'Marcar como Efectiva' }}
             </button>
             <button class="btn btn-danger" @click="rechazarCotizacion(modalCotizacion)">
               <i class="fas fa-times"></i> 
               {{ modalCotizacion.estado === 'esperando' ? 'Rechazar Cotización' : 'Cancelar Cotización' }}
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>

   <!-- Modal de rechazo -->
   <div v-if="modalRechazo" class="modal-overlay" @click="cerrarModalRechazo">
     <div class="modal-content modal-rechazo" @click.stop>
       <div class="modal-header">
         <h3>{{ cotizacionSeleccionada?.estado === 'esperando' ? 'Rechazar Cotización' : 'Cancelar Cotización' }}</h3>
         <button class="btn-close" @click="cerrarModalRechazo"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <div class="rechazo-form">
           <p>¿Estás seguro que deseas {{ cotizacionSeleccionada?.estado === 'esperando' ? 'rechazar' : 'cancelar' }} la cotización <strong>CT{{ String(cotizacionSeleccionada?.id).padStart(6, '0') }}</strong>?</p>
           
           <div class="form-group">
             <label for="motivo-rechazo">Motivo {{ cotizacionSeleccionada?.estado === 'esperando' ? 'del rechazo' : 'de la cancelación' }} *</label>
             <textarea 
               id="motivo-rechazo"
               v-model="motivoRechazo"
               class="form-textarea"
               rows="4"
               :placeholder="cotizacionSeleccionada?.estado === 'esperando' ? 'Explica brevemente por qué se rechaza esta cotización...' : 'Explica brevemente por qué se cancela esta cotización...'"
               required
             ></textarea>
           </div>
           
           <div class="modal-actions">
             <button class="btn btn-secondary" @click="cerrarModalRechazo">
               Cancelar
             </button>
             <button 
               class="btn btn-danger" 
               @click="confirmarRechazo"
               :disabled="!motivoRechazo.trim()"
             >
               <i class="fas fa-times"></i> 
               {{ cotizacionSeleccionada?.estado === 'esperando' ? 'Confirmar Rechazo' : 'Confirmar Cancelación' }}
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
export default {
 name: 'AdminCotizaciones',
 data() {
   return {
     vistaActual: 'tabla',
     modalCotizacion: null,
     modalRechazo: false,
     cotizacionSeleccionada: null,
     motivoRechazo: '',
     paginaActual: 1,
     itemsPorPagina: 25,
     paginaSalto: 1,
     ordenActual: { campo: 'fecha', direccion: 'desc' },
     
     filtros: {
       busqueda: '',
       estado: '',
       vendedor: '',
       periodo: ''
     },
     
     // Datos simulados para demostración
     cotizaciones: [
       {
         id: 1,
         cliente: {
           nombre: 'Empresa ABC S.A.',
           email: 'contacto@empresaabc.com'
         },
         servicios: ['Desarrollo Web', 'SEO', 'Marketing Digital'],
         fechaCreacion: '2024-01-15',
         vendedor: {
           nombre: 'Carlos Mendoza',
           rol: 'Vendedor Senior'
         },
         estado: 'efectiva',
         total: 25000.00,
         pdfGenerado: true
       },
       {
         id: 2,
         cliente: {
           nombre: 'Constructora XYZ',
           email: 'info@xyz.com'
         },
         servicios: ['Consultoría', 'Auditoría'],
         fechaCreacion: '2024-01-20',
         vendedor: {
           nombre: 'Ana García',
           rol: 'Vendedor'
         },
         estado: 'pendiente',
         total: 35000.00,
         pdfGenerado: true
       },
       {
         id: 3,
         cliente: {
           nombre: 'Comercial DEF',
           email: 'ventas@def.com'
         },
         servicios: ['Diseño Gráfico'],
         fechaCreacion: '2024-01-25',
         vendedor: {
           nombre: 'Luis Rodríguez',
           rol: 'Vendedor'
         },
         estado: 'esperando',
         total: 1500.00,
         pdfGenerado: false
       },
       {
         id: 4,
         cliente: {
           nombre: 'Industrias GHI',
           email: 'compras@ghi.com'
         },
         servicios: ['ERP', 'Capacitación', 'Soporte', 'Mantenimiento'],
         fechaCreacion: '2024-02-01',
         vendedor: {
           nombre: 'María López',
           rol: 'Vendedor Senior'
         },
         estado: 'cancelada',
         total: 45000.00,
         pdfGenerado: true,
         motivoRechazo: 'El presupuesto excede las expectativas del cliente'
       },
       {
         id: 5,
         cliente: {
           nombre: 'Servicios JKL',
           email: 'info@jkl.com'
         },
         servicios: ['E-commerce'],
         fechaCreacion: '2024-02-05',
         vendedor: {
           nombre: 'Pedro Sánchez',
           rol: 'Vendedor'
         },
         estado: 'esperando',
         total: 800.00,
         pdfGenerado: false
       },
       // Agregar más datos para demostración
       ...Array.from({ length: 45 }, (_, i) => ({
         id: i + 6,
         cliente: {
           nombre: `Cliente ${i + 6}`,
           email: `cliente${i + 6}@email.com`
         },
         servicios: [
           'Desarrollo Web', 'Marketing Digital', 'Consultoría', 'Diseño Gráfico', 'E-commerce'
         ].slice(0, Math.floor(Math.random() * 3) + 1),
         fechaCreacion: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
         vendedor: {
           nombre: ['Carlos Mendoza', 'Ana García', 'Luis Rodríguez', 'María López', 'Pedro Sánchez'][Math.floor(Math.random() * 5)],
           rol: ['Vendedor', 'Vendedor Senior'][Math.floor(Math.random() * 2)]
         },
         estado: ['esperando', 'pendiente', 'efectiva', 'cancelada'][Math.floor(Math.random() * 4)],
         total: Math.floor(Math.random() * 50000) + 1000,
         pdfGenerado: Math.random() > 0.3,
         motivoRechazo: Math.random() > 0.7 ? 'Motivo de ejemplo para cotización rechazada' : null
       }))
     ]
   }
 },
 
 computed: {
   vendedoresUnicos() {
     const vendedores = [...new Set(this.cotizaciones.map(c => c.vendedor.nombre))];
     return vendedores.sort();
   },

   cotizacionesFiltradas() {
     let resultado = [...this.cotizaciones];
     
     // Filtro por búsqueda
     if (this.filtros.busqueda) {
       const busqueda = this.filtros.busqueda.toLowerCase();
       resultado = resultado.filter(cotizacion => 
         `CT${String(cotizacion.id).padStart(6, '0')}`.toLowerCase().includes(busqueda) ||
         cotizacion.cliente.nombre.toLowerCase().includes(busqueda) ||
         cotizacion.cliente.email.toLowerCase().includes(busqueda) ||
         cotizacion.vendedor.nombre.toLowerCase().includes(busqueda)
       );
     }
     
     // Filtro por estado
     if (this.filtros.estado) {
       resultado = resultado.filter(cotizacion => 
         cotizacion.estado === this.filtros.estado
       );
     }

     // Filtro por vendedor
     if (this.filtros.vendedor) {
       resultado = resultado.filter(cotizacion => 
         cotizacion.vendedor.nombre === this.filtros.vendedor
       );
     }
     
     // Filtro por período
     if (this.filtros.periodo) {
       const hoy = new Date();
       resultado = resultado.filter(cotizacion => {
         const fecha = new Date(cotizacion.fechaCreacion);
         
         if (this.filtros.periodo === 'hoy') {
           return fecha.toDateString() === hoy.toDateString();
         }
         
         if (this.filtros.periodo === 'semana') {
           const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
           return fecha >= semanaAtras;
         }
         
         if (this.filtros.periodo === 'mes') {
           return fecha.getMonth() === hoy.getMonth() && 
                  fecha.getFullYear() === hoy.getFullYear();
         }
         
         if (this.filtros.periodo === 'trimestre') {
           const trimestre = Math.floor(hoy.getMonth() / 3);
           const fechaTrimestre = Math.floor(fecha.getMonth() / 3);
           return fechaTrimestre === trimestre && 
                  fecha.getFullYear() === hoy.getFullYear();
         }
         
         return true;
       });
     }
     
     // Ordenamiento
     resultado.sort((a, b) => {
       let valorA = a[this.ordenActual.campo];
       let valorB = b[this.ordenActual.campo];
       
       if (this.ordenActual.campo === 'cliente') {
         valorA = a.cliente.nombre;
         valorB = b.cliente.nombre;
       }

       if (this.ordenActual.campo === 'vendedor') {
         valorA = a.vendedor.nombre;
         valorB = b.vendedor.nombre;
       }
       
       if (this.ordenActual.campo === 'fecha') {
         valorA = new Date(a.fechaCreacion);
         valorB = new Date(b.fechaCreacion);
       }
       
       if (valorA < valorB) {
         return this.ordenActual.direccion === 'asc' ? -1 : 1;
       }
       if (valorA > valorB) {
         return this.ordenActual.direccion === 'asc' ? 1 : -1;
       }
       return 0;
     });
     
     return resultado;
   },
   
   cotizacionesPaginadas() {
     const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
     const fin = inicio + this.itemsPorPagina;
     return this.cotizacionesFiltradas.slice(inicio, fin);
   },
   
   totalPaginas() {
     return Math.ceil(this.cotizacionesFiltradas.length / this.itemsPorPagina);
   },
   
   paginasVisibles() {
     const total = this.totalPaginas;
     const actual = this.paginaActual;
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
   },
   
   rangoInicio() {
     return (this.paginaActual - 1) * this.itemsPorPagina + 1;
   },
   
   rangoFin() {
     return Math.min(this.paginaActual * this.itemsPorPagina, this.cotizacionesFiltradas.length);
   },
   
   estadisticas() {
     const vendedoresActivos = new Set(this.cotizaciones.map(c => c.vendedor.nombre)).size;
     const ingresosTotales = this.cotizaciones
       .filter(c => c.estado === 'efectiva')
       .reduce((total, c) => total + c.total, 0);

     return {
       total: this.cotizaciones.length,
       esperandoAprobacion: this.cotizaciones.filter(c => c.estado === 'esperando').length,
      pendientes: this.cotizaciones.filter(c => c.estado === 'pendiente').length,
      efectivas: this.cotizaciones.filter(c => c.estado === 'efectiva').length,
      canceladas: this.cotizaciones.filter(c => c.estado === 'cancelada').length,
      vendedoresActivos,
      ingresosTotales
    };
  }
},

watch: {
  // Resetear a la primera página cuando cambien los filtros
  'filtros.busqueda'() {
    this.paginaActual = 1;
  },
  'filtros.estado'() {
    this.paginaActual = 1;
  },
  'filtros.vendedor'() {
    this.paginaActual = 1;
  },
  'filtros.periodo'() {
    this.paginaActual = 1;
  },
  
  // Actualizar paginaSalto cuando cambie la página actual
  paginaActual(newVal) {
    this.paginaSalto = newVal;
  }
},

methods: {
  nuevaCotizacion() {
    this.$router.push('/shared/cotizacion');
  },
  
  verCotizacion(cotizacion) {
    this.modalCotizacion = cotizacion;
  },

  // Método para aceptar cotización - flujo corregido
  aceptarCotizacion(cotizacion) {
    const accion = cotizacion.estado === 'esperando' ? 'aprobar' : 'marcar como efectiva';
    const nuevoEstado = cotizacion.estado === 'esperando' ? 'pendiente' : 'efectiva';
    
    if (confirm(`¿Estás seguro que deseas ${accion} la cotización CT${String(cotizacion.id).padStart(6, '0')}?`)) {
      const index = this.cotizaciones.findIndex(c => c.id === cotizacion.id);
      if (index !== -1) {
        this.cotizaciones[index].estado = nuevoEstado;
        this.cotizaciones[index].fechaAprobacion = new Date().toISOString().split('T')[0];
        
        const mensaje = cotizacion.estado === 'esperando' 
          ? `Cotización CT${String(cotizacion.id).padStart(6, '0')} aprobada exitosamente`
          : `Cotización CT${String(cotizacion.id).padStart(6, '0')} marcada como efectiva`;
        
        alert(mensaje);
        
        // Cerrar modal si está abierto
        if (this.modalCotizacion && this.modalCotizacion.id === cotizacion.id) {
          this.modalCotizacion = null;
        }
      }
    }
  },

  rechazarCotizacion(cotizacion) {
    this.cotizacionSeleccionada = cotizacion;
    this.motivoRechazo = '';
    this.modalRechazo = true;
  },

  confirmarRechazo() {
    if (!this.motivoRechazo.trim()) {
      alert('Por favor ingresa un motivo para el rechazo/cancelación');
      return;
    }

    const index = this.cotizaciones.findIndex(c => c.id === this.cotizacionSeleccionada.id);
    if (index !== -1) {
      this.cotizaciones[index].estado = 'cancelada';
      this.cotizaciones[index].motivoRechazo = this.motivoRechazo.trim();
      this.cotizaciones[index].fechaRechazo = new Date().toISOString().split('T')[0];
      
      const accion = this.cotizacionSeleccionada.estado === 'esperando' ? 'rechazada' : 'cancelada';
      alert(`Cotización CT${String(this.cotizacionSeleccionada.id).padStart(6, '0')} ${accion} exitosamente`);
      
      // Cerrar modales
      this.cerrarModalRechazo();
      if (this.modalCotizacion && this.modalCotizacion.id === this.cotizacionSeleccionada.id) {
        this.modalCotizacion = null;
      }
    }
  },

  cerrarModalRechazo() {
    this.modalRechazo = false;
    this.cotizacionSeleccionada = null;
    this.motivoRechazo = '';
  },
  
  descargarPDF(cotizacion) {
    if (!cotizacion.pdfGenerado) {
      alert('Esta cotización no tiene PDF generado');
      return;
    }
    console.log('Descargando PDF:', `CT${String(cotizacion.id).padStart(6, '0')}`);
    alert(`Descargando PDF de CT${String(cotizacion.id).padStart(6, '0')}`);
  },
  
  exportarDatos() {
    console.log('Exportando datos de cotizaciones...');
    alert('Funcionalidad de exportación en desarrollo');
  },
  
  ordenarPor(campo) {
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual = { campo, direccion: 'asc' };
    }
  },
  
  getSortIcon(campo) {
    if (this.ordenActual.campo !== campo) return '↕';
    return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
  },
  
  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      estado: '',
      vendedor: '',
      periodo: ''
    };
    this.paginaActual = 1;
    this.paginaSalto = 1;
  },
  
  cerrarModal() {
    this.modalCotizacion = null;
  },
  
  // Métodos de paginación
  cambiarItemsPorPagina() {
    this.paginaActual = 1;
    this.paginaSalto = 1;
  },
  
  irAPrimera() {
    this.paginaActual = 1;
  },
  
  irAUltima() {
    this.paginaActual = this.totalPaginas;
  },
  
  irAPagina() {
    if (this.paginaSalto >= 1 && this.paginaSalto <= this.totalPaginas) {
      this.paginaActual = this.paginaSalto;
    } else {
      alert(`Por favor ingresa un número entre 1 y ${this.totalPaginas}`);
      this.paginaSalto = this.paginaActual;
    }
  },
  
  formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  formatearMoneda(monto) {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(monto);
  },

  formatearMonedaCorta(monto) {
    if (monto >= 1000000) {
      return `L${(monto / 1000000).toFixed(1)}M`;
    } else if (monto >= 1000) {
      return `L${(monto / 1000).toFixed(0)}K`;
    }
    return this.formatearMoneda(monto);
  },
  
  getEstadoTexto(estado) {
    const estados = {
      esperando: 'Esperando Aprobación',
      pendiente: 'Pendiente',
      efectiva: 'Efectiva',
      cancelada: 'Cancelada'
    };
    return estados[estado] || estado;
  }
}
}
</script>

<style scoped>
/* Reutilizamos la mayoría de los estilos del componente base */
.admin-cotizaciones-container {
padding: 2rem;
max-width: 1400px;
margin: 0 auto;
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

.btn-secondary {
background: #95a5a6;
color: white;
}

.btn-secondary:hover {
background: #7f8c8d;
}

.btn-success {
background: #27ae60;
color: white;
}

.btn-success:hover {
background: #219a52;
transform: translateY(-1px);
}

.btn-danger {
background: #e74c3c;
color: white;
}

.btn-danger:hover {
background: #c0392b;
transform: translateY(-1px);
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

.btn:disabled {
opacity: 0.6;
cursor: not-allowed;
transform: none !important;
}

/* Nuevos estilos para botones de acción */
.btn-accion.aceptar {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
}

.btn-accion.aceptar:hover {
background: #c3e6cb;
transform: translateY(-1px);
}

.btn-accion.cancelar {
background: #f8d7da;
color: #721c24;
border: 1px solid #f5c6cb;
}

.btn-accion.cancelar:hover {
background: #f5c6cb;
transform: translateY(-1px);
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
.stat-card.esperando { border-left: 4px solid #f39c12; }
.stat-card.pendientes { border-left: 4px solid #17a2b8; }
.stat-card.efectivas { border-left: 4px solid #27ae60; }
.stat-card.vendedores { border-left: 4px solid #9b59b6; }
.stat-card.ingresos { border-left: 4px solid #e74c3c; }

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

/* Resto de estilos heredados */
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

.estado-badge.esperando {
background: #fff3cd;
color: #856404;
border: 1px solid #ffeaa7;
}

.estado-badge.pendiente {
background: #d1ecf1;
color: #0c5460;
border: 1px solid #bee5eb;
}

.estado-badge.efectiva {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
}

.estado-badge.cancelada {
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
display: flex;
gap: 0.75rem;
flex-wrap: wrap;
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

.modal-rechazo {
max-width: 500px;
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

.motivo-rechazo {
color: #e74c3c;
font-style: italic;
background: #ffeaea;
padding: 0.5rem;
border-radius: 4px;
border-left: 3px solid #e74c3c;
}

/* Modal de rechazo */
.rechazo-form {
display: flex;
flex-direction: column;
gap: 1.5rem;
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

.form-textarea {
padding: 0.75rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 0.9rem;
font-family: inherit;
resize: vertical;
min-height: 100px;
transition: border-color 0.3s ease;
}

.form-textarea:focus {
outline: none;
border-color: #3498db;
}

.form-textarea::placeholder {
color: #7f8c8d;
}

/* Acciones en modal */
.modal-actions {
display: flex;
gap: 1rem;
justify-content: flex-end;
margin-top: 2rem;
padding-top: 1.5rem;
border-top: 1px solid #e9ecef;
flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 1200px) {
.estadisticas-grid {
  grid-template-columns: repeat(3, 1fr);
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
  min-width: 1000px;
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

.acciones {
  justify-content: center;
}

.modal-actions {
  justify-content: stretch;
}

.modal-actions .btn {
  flex: 1;
  justify-content: center;
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
  flex-direction: column;
  gap: 0.25rem;
}

.btn-accion {
  width: 100%;
  height: auto;
  padding: 0.5rem;
  border-radius: 4px;
}
}
</style>