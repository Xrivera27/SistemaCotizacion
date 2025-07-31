<template>
<div class="admin-cotizaciones-container">
<!-- Loading overlay -->
<div v-if="loading" class="loading-overlay">
<div class="loading-spinner">
<i class="fas fa-spinner fa-spin"></i>
<span>{{ loadingMessage || 'Cargando cotizaciones...' }}</span>
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
<button class="btn btn-secondary" @click="cargarDatos">
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
    @input="buscarConDebounce"
  />
</div>

<div class="filtros-grid">
  <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
    <option value="">Todos los estados</option>
    <option v-for="estado in estadosDisponibles" :key="estado.value" :value="estado.value">
      {{ estado.label }}
    </option>
  </select>
  
  <select v-model="filtros.vendedor" class="filter-select" @change="aplicarFiltros">
    <option value="">Todos los vendedores</option>
    <option v-for="vendedor in vendedoresUnicos" :key="vendedor" :value="vendedor">
      {{ vendedor }}
    </option>
  </select>
  
  <select v-model="filtros.periodo" class="filter-select" @change="aplicarFiltros">
    <option v-for="periodo in periodosDisponibles" :key="periodo.value" :value="periodo.value">
      {{ periodo.label }}
    </option>
  </select>

  <select v-model="filtros.limit" class="filter-select" @change="cambiarItemsPorPagina">
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
  <div class="stat-number">{{ estadisticas.vendedoresActivos || 0 }}</div>
  <div class="stat-label">Vendedores Activos</div>
</div>
</div>
</div>

<!-- Tabla de cotizaciones -->
<div class="cotizaciones-section">
<div class="section-header">
<h2 class="section-title">
  {{ pagination.totalItems || 0 }} Cotizaciones encontradas
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
<div class="paginacion-info" v-if="pagination.totalItems">
<span class="items-info">
  Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ pagination.totalItems }} cotizaciones
</span>
<div class="pagination-jump">
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
        <th @click="ordenarPor('id')" class="sortable">
          # Cotización
          <span class="sort-icon">{{ getSortIcon('id') }}</span>
        </th>
        <th @click="ordenarPor('cliente')" class="sortable">
          Cliente
          <span class="sort-icon">{{ getSortIcon('cliente') }}</span>
        </th>
        <th>Servicios</th>
        <th @click="ordenarPor('fechaCreacion')" class="sortable">
          Fecha Creación
          <span class="sort-icon">{{ getSortIcon('fechaCreacion') }}</span>
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
        <th style="min-width: 240px;">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="cotizacion in cotizacionesFormateadas" :key="cotizacion.id">
        <td>
          <span class="numero-cotizacion">{{ cotizacionService.formatNumeroCotizacion(cotizacion.id) }}</span>
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
                {{ servicio.nombre }}
              </span>
              <span v-if="cotizacion.servicios.length > 2" class="servicios-mas">
                +{{ cotizacion.servicios.length - 2 }} más
              </span>
            </div>
          </div>
        </td>
        <td>
          <span class="fecha">{{ cotizacionService.formatDate(cotizacion.fechaCreacion) }}</span>
        </td>
        <td>
          <div class="vendedor-info">
            <span class="vendedor-nombre">{{ cotizacion.vendedor.nombre }}</span>
            <span class="vendedor-rol">{{ cotizacion.vendedor.rol }}</span>
          </div>
        </td>
        <td>
          <div class="total-info">
            <span class="monto">{{ cotizacionService.formatPrice(cotizacion.total) }}</span>
            <div v-if="cotizacion.tiene_descuento" class="descuento-aplicado">
              <i class="fas fa-percentage"></i>
              {{ cotizacion.descuento_porcentaje }}% desc.
            </div>
            <div v-if="cotizacion.tiene_meses_gratis" class="meses-gratis-aplicado">
              <i class="fas fa-gift"></i>
              {{ cotizacion.meses_gratis }} meses gratis
            </div>
          </div>
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
            
            <!-- Botones de Aprobar/Rechazar para esperando aprobación -->
            <template v-if="cotizacion.estado === 'pendiente_aprobacion'">
              <button 
                class="btn-accion aceptar"
                @click="confirmarAprobacion(cotizacion)"
                title="Aprobar cotización"
              >
                <i class="fas fa-check"></i>
              </button>
              <button 
                class="btn-accion cancelar"
                @click="rechazarCotizacion(cotizacion)"
                title="Rechazar cotización"
              >
                <i class="fas fa-times"></i>
              </button>
            </template>

            <!-- Botón efectiva para pendientes -->
            <template v-if="cotizacion.estado === 'pendiente'">
              <button 
                class="btn-accion aceptar"
                @click="marcarComoEfectiva(cotizacion)"
                title="Marcar como efectiva"
              >
                <i class="fas fa-handshake"></i>
              </button>
              <button 
                class="btn-accion gestionar"
                @click="abrirModalGestionComercial(cotizacion)"
                title="Aplicar descuentos"
              >
                <i class="fas fa-tags"></i>
              </button>
              <button 
                class="btn-accion cancelar"
                @click="cancelarCotizacion(cotizacion)"
                title="Cancelar cotización"
              >
                <i class="fas fa-times"></i>
              </button>
            </template>

            <!-- Botón Observaciones para todas -->
            <button 
              class="btn-accion observaciones"
              @click="editarObservaciones(cotizacion)"
              title="Observaciones internas"
            >
              <i class="fas fa-sticky-note"></i>
            </button>
            
            <button 
              v-if="cotizacion.pdfGenerado"
              class="btn-accion imprimir"
              @click="mostrarModalPDF(cotizacion)"
              title="Vista previa PDF"
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
    v-for="cotizacion in cotizacionesFormateadas" 
    :key="cotizacion.id"
    class="cotizacion-card"
  >
    <div class="card-header">
      <div class="card-numero">{{ cotizacionService.formatNumeroCotizacion(cotizacion.id) }}</div>
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
            {{ servicio.nombre }}
          </span>
          <span v-if="cotizacion.servicios.length > 3" class="servicios-mas">
            +{{ cotizacion.servicios.length - 3 }} más
          </span>
        </div>
      </div>
      
      <div class="card-details">
        <div class="detail">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ cotizacionService.formatDate(cotizacion.fechaCreacion) }}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Vendedor:</span>
          <span class="detail-value">{{ cotizacion.vendedor.nombre }}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Total:</span>
          <div class="detail-value">
            <span class="monto">{{ cotizacionService.formatPrice(cotizacion.total) }}</span>
            <div v-if="cotizacion.tiene_descuento" class="descuento-tag">
              <i class="fas fa-percentage"></i> {{ cotizacion.descuento_porcentaje }}% desc.
            </div>
            <div v-if="cotizacion.tiene_meses_gratis" class="meses-gratis-tag">
              <i class="fas fa-gift"></i> {{ cotizacion.meses_gratis }} meses gratis
            </div>
          </div>
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
      
      <!-- Botones de Aprobar/Rechazar en tarjetas -->
      <template v-if="cotizacion.estado === 'pendiente_aprobacion'">
        <button class="btn btn-sm btn-success" @click="confirmarAprobacion(cotizacion)">
          <i class="fas fa-check"></i> Aprobar
        </button>
        <button class="btn btn-sm btn-danger" @click="rechazarCotizacion(cotizacion)">
          <i class="fas fa-times"></i> Rechazar
        </button>
      </template>

      <!-- Botones para pendientes -->
      <template v-if="cotizacion.estado === 'pendiente'">
        <button class="btn btn-sm btn-success" @click="marcarComoEfectiva(cotizacion)">
          <i class="fas fa-handshake"></i> Efectiva
        </button>
        <button class="btn btn-sm btn-warning" @click="abrirModalGestionComercial(cotizacion)">
          <i class="fas fa-tags"></i> Descuentos
        </button>
        <button class="btn btn-sm btn-danger" @click="cancelarCotizacion(cotizacion)">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </template>
      
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
<div v-if="cotizacionesFormateadas.length === 0 && !loading" class="empty-state">
<div class="empty-icon"><i class="fas fa-file-alt"></i></div>
<h3 class="empty-title">No hay cotizaciones</h3>
<p class="empty-description">
  {{ tieneActiveFiltros 
    ? 'No se encontraron cotizaciones con los filtros aplicados.' 
    : 'Aún no se han creado cotizaciones en el sistema.' }}
</p>
</div>

<!-- Paginación -->
<div v-if="pagination.totalPages > 1" class="paginacion-completa">
<div class="paginacion">
  <button 
    class="btn-pag"
    @click="irAPrimera"
    :disabled="!pagination.hasPrevPage"
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
    :disabled="!pagination.hasNextPage"
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
<div v-if="modalCotizacion" class="modal-overlay" @click="cerrarModal">
<div class="modal-content" @click.stop>
<div class="modal-header">
  <h3>Cotización {{ cotizacionService.formatNumeroCotizacion(modalCotizacion.id) }}</h3>
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
        <strong>Fecha de Creación:</strong> {{ cotizacionService.formatDate(modalCotizacion.fechaCreacion) }}
      </div>
      <div class="detalle-item">
        <strong>Total:</strong> 
        <div class="total-detalle">
          <span class="monto">{{ cotizacionService.formatPrice(modalCotizacion.total) }}</span>
          <div v-if="modalCotizacion.tiene_descuento" class="descuento-info">
            <i class="fas fa-percentage"></i>
            Descuento {{ modalCotizacion.descuento_porcentaje }}% aplicado
            <br>
            <small>Original: {{ cotizacionService.formatPrice(modalCotizacion.total_original) }}</small>
          </div>
          <div v-if="modalCotizacion.tiene_meses_gratis" class="meses-gratis-info">
            <i class="fas fa-gift"></i>
            {{ modalCotizacion.meses_gratis }} meses gratis aplicados
          </div>
        </div>
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
      
      <!-- INFORMACIÓN DE DESCUENTO -->
      <div v-if="modalCotizacion.tiene_descuento" class="detalle-item">
        <strong>Descuento otorgado por:</strong>
        <span class="auditoria-info descuento">
          <i class="fas fa-user-tag"></i>
          {{ modalCotizacion.descuento_otorgado_por_nombre }}
          <span class="fecha-auditoria">
            ({{ formatearFechaAuditoria(modalCotizacion.fecha_descuento) }})
          </span>
        </span>
      </div>

      <div v-if="modalCotizacion.comentario_descuento" class="detalle-item">
        <strong>Motivo del descuento:</strong>
        <span class="comentario-descuento">{{ modalCotizacion.comentario_descuento }}</span>
      </div>

      <!-- INFORMACIÓN DE MESES GRATIS -->
      <div v-if="modalCotizacion.tiene_meses_gratis" class="detalle-item">
        <strong>Meses gratis otorgados por:</strong>
        <span class="auditoria-info meses-gratis">
          <i class="fas fa-gift"></i>
          {{ modalCotizacion.meses_gratis_otorgado_por_nombre }}
          <span class="fecha-auditoria">
            ({{ formatearFechaAuditoria(modalCotizacion.fecha_meses_gratis) }})
          </span>
        </span>
      </div>

      <!-- OBSERVACIONES INTERNAS -->
      <div v-if="modalCotizacion.observaciones" class="detalle-item">
        <strong>Observaciones internas:</strong>
        <span class="observaciones-texto">{{ modalCotizacion.observaciones }}</span>
      </div>
      
      <!-- INFORMACIÓN DE AUDITORÍA -->
      <div v-if="modalCotizacion.estado === 'efectiva' && modalCotizacion.auditoria?.aprobadoPorNombre" class="detalle-item">
        <strong>Aprobado por:</strong> 
        <span class="auditoria-info aprobado">
          <i class="fas fa-user-check"></i>
          {{ modalCotizacion.auditoria.aprobadoPorNombre }}
          <span class="fecha-auditoria">
            ({{ formatearFechaAuditoria(modalCotizacion.auditoria.fechaAprobacion) }})
          </span>
        </span>
      </div>

      <div v-if="modalCotizacion.estado === 'rechazada' && modalCotizacion.auditoria?.rechazadoPorNombre" class="detalle-item">
        <strong>Rechazado por:</strong> 
        <span class="auditoria-info rechazado">
          <i class="fas fa-user-times"></i>
          {{ modalCotizacion.auditoria.rechazadoPorNombre }}
          <span class="fecha-auditoria">
            ({{ formatearFechaAuditoria(modalCotizacion.auditoria.fechaRechazo) }})
          </span>
        </span>
      </div>
      
      <div v-if="modalCotizacion.comentario" class="detalle-item">
        <strong>Comentario:</strong> 
        <span class="motivo-rechazo">{{ modalCotizacion.comentario }}</span>
      </div>
    </div>
    
    <div class="servicios-detalle">
      <h4>Servicios Incluidos ({{ modalCotizacion.servicios.length }})</h4>
      <div class="servicios-modal-list">
        <span v-for="(servicio, index) in modalCotizacion.servicios" 
              :key="index" 
              class="servicio-tag">
          {{ servicio.nombre }}
        </span>
      </div>
    </div>
    
    <!-- Acciones en modal para cotizaciones esperando o pendientes -->
    <div v-if="modalCotizacion.estado === 'pendiente_aprobacion' || modalCotizacion.estado === 'pendiente'" class="modal-actions">
      <button v-if="modalCotizacion.estado === 'pendiente_aprobacion'" class="btn btn-success" @click="confirmarAprobacion(modalCotizacion)">
        <i class="fas fa-check"></i> Aprobar Cotización
      </button>
      <button v-if="modalCotizacion.estado === 'pendiente'" class="btn btn-success" @click="marcarComoEfectiva(modalCotizacion)">
        <i class="fas fa-handshake"></i> Marcar como Efectiva
      </button>
      <button v-if="modalCotizacion.estado === 'pendiente'" class="btn btn-warning" @click="abrirModalGestionComercial(modalCotizacion)">
        <i class="fas fa-tags"></i> Gestión de Descuentos
      </button>
      <button class="btn btn-danger" @click="rechazarCotizacion(modalCotizacion)">
        <i class="fas fa-times"></i> 
        {{ modalCotizacion.estado === 'pendiente_aprobacion' ? 'Rechazar Cotización' : 'Cancelar Cotización' }}
      </button>
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
    Vista Previa PDF - {{ cotizacionService.formatNumeroCotizacion(pdfCotizacion.id) }}
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
        :class="{ active: esCopia === true }"
        @click="esCopia = true"
      >
        <i class="fas fa-copy"></i>
        Copia
      </button>
      <button 
        class="btn-tipo"
        :class="{ active: esCopia === false }"
        @click="esCopia = false"
      >
        <i class="fas fa-certificate"></i>
        Original
      </button>
    </div>
    
    <div class="info-documento">
      <span class="documento-tipo" :class="esCopia ? 'copia' : 'original'">
        <i :class="esCopia ? 'fas fa-copy' : 'fas fa-certificate'"></i>
        {{ esCopia ? 'COPIA' : 'ORIGINAL' }}
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
      <div class="documento-marca" :class="esCopia ? 'copia' : 'original'">
        {{ esCopia ? 'COPIA' : 'ORIGINAL' }}
      </div>
    </div>
    
    <div class="pdf-content">
      <h2>COTIZACIÓN</h2>
      <div class="cotizacion-numero">
        {{ cotizacionService.formatNumeroCotizacion(pdfCotizacion.id) }}
      </div>
      
      <div class="pdf-info-grid">
        <div class="info-section">
          <h4>Cliente:</h4>
          <p>{{ pdfCotizacion.cliente.nombre }}</p>
          <p>{{ pdfCotizacion.cliente.email }}</p>
        </div>
        
        <div class="info-section">
          <h4>Vendedor:</h4>
          <p>{{ pdfCotizacion.vendedor.nombre }}</p>
          <p>{{ pdfCotizacion.vendedor.rol }}</p>
        </div>
        
        <div class="info-section">
          <h4>Fecha:</h4>
          <p>{{ cotizacionService.formatDate(pdfCotizacion.fechaCreacion) }}</p>
        </div>
      </div>
      
      <div class="servicios-pdf">
        <h4>Servicios:</h4>
        <ul>
          <li v-for="(servicio, index) in pdfCotizacion.servicios" :key="index">
            {{ servicio.nombre }}
          </li>
        </ul>
      </div>
      
      <div class="total-pdf">
       <div v-if="pdfCotizacion.tiene_descuento" class="total-original-pdf">
       <small>Total original: {{ cotizacionService.formatPrice(pdfCotizacion.total_original) }}</small>
        <div class="descuento-pdf">
          <i class="fas fa-percentage"></i>
          Descuento {{ pdfCotizacion.descuento_porcentaje }}%: 
          -{{ cotizacionService.formatPrice(pdfCotizacion.total_original - pdfCotizacion.total) }}
        </div>
      </div>
      <div v-if="pdfCotizacion.tiene_meses_gratis" class="meses-gratis-pdf">
        <i class="fas fa-gift"></i>
        {{ pdfCotizacion.meses_gratis }} meses gratis aplicados
      </div>
      <strong>Total: {{ cotizacionService.formatPrice(pdfCotizacion.total) }}</strong>
    </div>
  </div>
  
  <div class="pdf-footer">
    <div class="marca-agua" v-if="esCopia">COPIA</div>
    <p>Este documento es {{ esCopia ? 'una copia' : 'el original' }} de la cotización</p>
  </div>
</div>
</div>
</div>

<div class="modal-footer">
<button class="btn btn-outline" @click="cerrarModalPDF">
<i class="fas fa-times"></i>
Cancelar
</button>
<button class="btn btn-primary" @click="descargarPDF">
<i class="fas fa-download"></i>
Descargar {{ esCopia ? 'Copia' : 'Original' }}
</button>
</div>
</div>
</div>

<!-- Modal de rechazo -->
<div v-if="modalRechazo" class="modal-overlay" @click="cerrarModalRechazo">
<div class="modal-content modal-rechazo" @click.stop>
<div class="modal-header">
<h3>{{ cotizacionSeleccionada?.estado === 'pendiente_aprobacion' ? 'Rechazar Cotización' : 'Cancelar Cotización' }}</h3>
<button class="btn-close" @click="cerrarModalRechazo"><i class="fas fa-times"></i></button>
</div>
<div class="modal-body">
<div class="rechazo-form">
<p>¿Estás seguro que deseas {{ cotizacionSeleccionada?.estado === 'pendiente_aprobacion' ? 'rechazar' : 'cancelar' }} la cotización <strong>{{ cotizacionService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</strong>?</p>

<div class="form-group">
  <label for="motivo-rechazo">Motivo {{ cotizacionSeleccionada?.estado === 'pendiente_aprobacion' ? 'del rechazo' : 'de la cancelación' }} *</label>
  <textarea 
    id="motivo-rechazo"
    v-model="motivoRechazo"
    class="form-textarea"
    rows="4"
    :placeholder="cotizacionSeleccionada?.estado === 'pendiente_aprobacion' ? 'Explica brevemente por qué se rechaza esta cotización...' : 'Explica brevemente por qué se cancela esta cotización...'"
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
    {{ cotizacionSeleccionada?.estado === 'pendiente_aprobacion' ? 'Confirmar Rechazo' : 'Confirmar Cancelación' }}
  </button>
</div>
</div>
</div>
</div>
</div>

<!-- Modal de confirmación para marcar como efectiva -->
<div v-if="modalConfirmacionEfectiva" class="modal-overlay" @click="cerrarModalConfirmacionEfectiva">
<div class="modal-content modal-confirmacion" @click.stop>
<div class="modal-header">
<h3>
<i class="fas fa-handshake text-success"></i>
Marcar como Efectiva
</h3>
<button class="btn-close" @click="cerrarModalConfirmacionEfectiva">
<i class="fas fa-times"></i>
</button>
</div>
<div class="modal-body">
<div class="confirmacion-form">
<div class="confirmacion-icon">
  <i class="fas fa-handshake"></i>
</div>
<h4>¿Confirmar cotización como efectiva?</h4>
<p class="confirmacion-text">
  Estás a punto de marcar la cotización 
  <strong>{{ cotizationService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</strong> 
  como <strong class="text-success">EFECTIVA</strong>.
</p>
<p class="confirmacion-details">
  <i class="fas fa-info-circle"></i>
  Una vez marcada como efectiva, esta cotización se considerará cerrada exitosamente.
</p>

<div class="modal-actions">
  <button class="btn btn-secondary" @click="cerrarModalConfirmacionEfectiva">
    <i class="fas fa-times"></i>
    Cancelar
  </button>
  <button 
    class="btn btn-success" 
    @click="confirmarMarcarComoEfectiva"
  >
    <i class="fas fa-handshake"></i>
    Confirmar como Efectiva
  </button>
</div>
</div>
</div>
</div>
</div>

<!-- Modal de confirmación para aprobar cotización -->
<div v-if="modalConfirmacionAprobacion" class="modal-overlay" @click="cerrarModalConfirmacionAprobacion">
<div class="modal-content modal-confirmacion" @click.stop>
<div class="modal-header">
<h3>
<i class="fas fa-check-circle text-success"></i>
Aprobar Cotización
</h3>
<button class="btn-close" @click="cerrarModalConfirmacionAprobacion">
<i class="fas fa-times"></i>
</button>
</div>
<div class="modal-body">
<div class="confirmacion-form">
<div class="confirmacion-icon aprobacion">
  <i class="fas fa-check-circle"></i>
</div>
<h4>¿Confirmar aprobación de cotización?</h4>
<p class="confirmacion-text">
  Estás a punto de aprobar la cotización 
  <strong>{{ cotizacionService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</strong>.
</p>
<p class="confirmacion-details">
  <i class="fas fa-info-circle"></i>
  Una vez aprobada, la cotización cambiará a estado <strong class="text-info">PENDIENTE</strong>
</p>

<div class="modal-actions">
  <button class="btn btn-secondary" @click="cerrarModalConfirmacionAprobacion">
    <i class="fas fa-times"></i>
    Cancelar
  </button>
  <button 
    class="btn btn-success" 
    @click="confirmarAprobacionFinal"
  >
    <i class="fas fa-check-circle"></i>
    Confirmar Aprobación
  </button>
</div>
</div>
</div>
</div>
</div>

<!-- 🔧 MODAL DE GESTIÓN DE DESCUENTOS ACTUALIZADO -->
<div v-if="modalGestionComercial" class="modal-overlay" @click="cerrarModalGestionComercial">
<div class="modal-content modal-gestion-comercial" @click.stop>
<div class="modal-header">
<h3>
<i class="fas fa-tags text-primary"></i>
Gestión de Descuentos
</h3>
<button class="btn-close" @click="cerrarModalGestionComercial">
<i class="fas fa-times"></i>
</button>
</div>

<div class="modal-body">
<!-- Información de la cotización -->
<div class="cotizacion-info">
<h4>{{ cotizacionService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</h4>
<p><strong>Cliente:</strong> {{ cotizacionSeleccionada?.cliente?.nombre }}</p>
</div>

<!-- RESUMEN FINANCIERO ACTUAL -->
<div class="resumen-financiero original">
<h5><i class="fas fa-calculator"></i> RESUMEN FINANCIERO ACTUAL:</h5>
<div class="financiero-grid">
  <div class="financiero-item">
    <span class="label">Costo mensual actual:</span>
    <span class="valor">${{ costoMensualOriginal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
  </div>
  <div class="financiero-item">
    <span class="label">Duración del contrato:</span>
    <span class="valor">{{ duracionContratoMeses }} mes{{ duracionContratoMeses > 1 ? 'es' : '' }}</span>
  </div>
  <div class="financiero-item total">
    <span class="label"><strong>TOTAL ACTUAL DEL CONTRATO:</strong></span>
    <span class="valor"><strong>${{ totalOriginalContrato.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></span>
  </div>
</div>
</div>

<!-- SECCIÓN DE DESCUENTO PORCENTUAL -->
<div class="gestion-section">
<label class="section-toggle">
  <input type="checkbox" v-model="aplicarDescuento" @change="calcularTotales">
  <span class="toggle-content">
    <i class="fas fa-percentage"></i>
    <span class="toggle-text">Aplicar Descuento Porcentual</span>
  </span>
</label>

<div v-if="aplicarDescuento" class="section-content">
  <!-- Mostrar descuento actual si existe -->
  <div v-if="cotizacionSeleccionada?.tiene_descuento" class="descuento-actual-info">
    <h6><i class="fas fa-info-circle"></i> DESCUENTO PORCENTUAL ACTUAL:</h6>
    <div class="info-actual">
      <span><strong>{{ cotizacionSeleccionada.descuento_porcentaje }}%</strong> otorgado por {{ cotizacionSeleccionada.descuento_otorgado_por_nombre }}</span>
    </div>
  </div>

  <div class="form-group">
    <label for="descuento-porcentaje">{{ cotizacionSeleccionada?.tiene_descuento ? 'Nuevo porcentaje de descuento' : 'Porcentaje de descuento' }} *</label>
    <div class="input-group">
      <input 
        id="descuento-porcentaje"
        v-model.number="descuentoPorcentaje"
        type="number"
        class="form-input"
        placeholder="15"
        min="0.01"
        max="100"
        step="0.01"
        @input="calcularTotales"
        required
      >
      <span class="input-addon">%</span>
    </div>
  </div>

  <!-- PREVIEW DEL DESCUENTO -->
  <div v-if="descuentoPorcentaje > 0" class="preview-descuento">
    <div class="preview-item">
      <span class="preview-label">Descuento aplicado:</span>
      <span class="preview-valor descuento">-${{ montoDescuentoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Nuevo costo mensual:</span>
      <span class="preview-valor">${{ costoMensualConDescuento.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
    </div>
  </div>
</div>
</div>

<!-- SECCIÓN DE MESES GRATIS -->
<div class="gestion-section">
<label class="section-toggle">
  <input type="checkbox" v-model="aplicarMesesGratis" @change="calcularTotales">
  <span class="toggle-content">
    <i class="fas fa-gift"></i>
    <span class="toggle-text">Aplicar Meses Gratis</span>
  </span>
</label>

<div v-if="aplicarMesesGratis" class="section-content">
  <!-- Mostrar meses gratis actuales si existen -->
  <div v-if="cotizacionSeleccionada?.tiene_meses_gratis" class="meses-gratis-actual-info">
    <h6><i class="fas fa-info-circle"></i> MESES GRATIS ACTUALES:</h6>
    <div class="info-actual">
      <span><strong>{{ cotizacionSeleccionada.meses_gratis }} mes{{ cotizacionSeleccionada.meses_gratis > 1 ? 'es' : '' }}</strong> otorgados por {{ cotizacionSeleccionada.meses_gratis_otorgado_por_nombre }}</span>
    </div>
  </div>

  <div class="form-group">
    <label for="meses-gratis-cantidad">{{ cotizacionSeleccionada?.tiene_meses_gratis ? 'Nueva cantidad de meses gratis' : 'Meses gratis a otorgar' }} *</label>
    <div class="input-group">
      <input 
        id="meses-gratis-cantidad"
        v-model.number="mesesGratisCantidad"
        type="number"
        class="form-input"
        placeholder="3"
        min="0"
        :max="duracionContratoMeses - 1"
        step="1"
        @input="calcularTotales"
        required
      >
      <span class="input-addon">meses</span>
    </div>
    <small class="form-help">Máximo {{ duracionContratoMeses - 1 }} meses (debe quedar al menos 1 mes para facturar)</small>
  </div>

  <!-- PREVIEW DE MESES GRATIS -->
  <div v-if="mesesGratisCantidad > 0" class="preview-meses-gratis">
    <div class="preview-item">
      <span class="preview-label">Meses a facturar:</span>
      <span class="preview-valor">{{ mesesFacturables }} mes{{ mesesFacturables > 1 ? 'es' : '' }}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Beneficio en meses gratis:</span>
      <span class="preview-valor meses-gratis">${{ ahorroMesesGratis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
    </div>
  </div>
</div>
</div>

<!-- RESUMEN FINAL -->
<div v-if="aplicarDescuento || aplicarMesesGratis" class="resumen-final">
<h5><i class="fas fa-chart-line"></i> RESUMEN FINAL:</h5>
<div class="resumen-grid">
  <div class="resumen-item total-original">
    <span class="resumen-label">Total original:</span>
    <span class="resumen-valor">${{ totalOriginalContrato.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
  </div>
  
  <div v-if="aplicarDescuento && descuentoPorcentaje > 0" class="resumen-item descuento">
    <span class="resumen-label">Descuento ({{ descuentoPorcentaje }}%):</span>
    <span class="resumen-valor descuento">-${{ montoDescuentoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
  </div>
  
  <div v-if="aplicarMesesGratis && mesesGratisCantidad > 0" class="resumen-item meses-gratis">
    <span class="resumen-label">Meses gratis ({{ mesesGratisCantidad }}):</span>
    <span class="resumen-valor meses-gratis">-${{ ahorroMesesGratis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
  </div>
  
  <div class="resumen-item total-final">
    <span class="resumen-label"><strong>TOTAL FINAL:</strong></span>
    <span class="resumen-valor"><strong>${{ totalFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></span>
  </div>
  
  <div class="resumen-item ahorro-total">
    <span class="resumen-label">Ahorro total para el cliente:</span>
    <span class="resumen-valor ahorro"><strong>${{ ahorroTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></span>
  </div>
</div>
</div>

<!-- COMENTARIO PARA DESCUENTOS -->
<div v-if="aplicarDescuento || aplicarMesesGratis" class="form-group">
<label for="comentario-gestion">Motivo del descuento *</label>
<textarea 
  id="comentario-gestion"
  v-model="comentarioGestion"
  class="form-textarea"
  rows="3"
  placeholder="Explica el motivo del descuento y/o meses gratis (ej: Cliente fiel, promoción especial, etc.)"
  required
></textarea>
</div>

<!-- ACCIONES DEL MODAL -->
<div class="modal-actions">
<button class="btn btn-secondary" @click="cerrarModalGestionComercial">
  <i class="fas fa-times"></i>
  Cancelar
</button>

<button 
  v-if="aplicarDescuento || aplicarMesesGratis"
  class="btn btn-primary" 
  @click="confirmarGestionComercial"
  :disabled="!validarFormulario"
>
  <i class="fas fa-tags"></i>
  Aplicar Descuentos
</button>
</div>
</div>
</div>
</div>

<!-- MODAL SEPARADO PARA OBSERVACIONES INTERNAS -->
<div v-if="modalObservaciones" class="modal-overlay" @click="cerrarModalObservaciones">
<div class="modal-content modal-observaciones" @click.stop>
<div class="modal-header">
<h3>
<i class="fas fa-sticky-note text-info"></i>
{{ cotizacionSeleccionada?.observaciones ? 'Editar Observaciones Internas' : 'Agregar Observaciones Internas' }}
</h3>
<button class="btn-close" @click="cerrarModalObservaciones">
<i class="fas fa-times"></i>
</button>
</div>
<div class="modal-body">
<div class="observaciones-form">
<!-- Información de la cotización -->
<div class="cotizacion-info">
  <h4>{{ cotizacionService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</h4>
  <p><strong>Cliente:</strong> {{ cotizacionSeleccionada?.cliente?.nombre }}</p>
</div>

<div class="info-note">
  <i class="fas fa-info-circle"></i>
  <span>Las observaciones internas son solo para uso del equipo y no aparecen en documentos del cliente.</span>
</div>

<!-- Campo de observaciones -->
<div class="form-group">
  <label for="observaciones-texto-separado">Observaciones internas *</label>
  <textarea 
    id="observaciones-texto-separado"
    v-model="observacionesTextoSeparado"
    class="form-textarea"
    rows="6"
    placeholder="Escribe observaciones internas sobre esta cotización (solo para el equipo)..."
    required
  ></textarea>
</div>

<!-- Acciones -->
<div class="modal-actions">
  <button class="btn btn-secondary" @click="cerrarModalObservaciones">
    <i class="fas fa-times"></i>
    Cancelar
  </button>
  <button 
    class="btn btn-info" 
    @click="confirmarObservacionesSeparado"
    :disabled="!observacionesTextoSeparado.trim()"
  >
    <i class="fas fa-save"></i>
    {{ cotizacionSeleccionada?.observaciones ? 'Actualizar Observaciones' : 'Guardar Observaciones' }}
  </button>
</div>
</div>
</div>
</div>
</div>

<!-- Toast notifications -->
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
import cotizacionService from '@/services/cotizacionesService';

export default {
name: 'AdminCotizaciones',
data() {
return {
// Estado de carga
loading: false,
loadingMessage: 'Cargando cotizaciones...',

// Modal de confirmación efectiva
modalConfirmacionEfectiva: false,
comentarioEfectiva: '',

// Modal de confirmación aprobación
modalConfirmacionAprobacion: false,

// 🆕 MODAL DE GESTIÓN COMERCIAL UNIFICADO
modalGestionComercial: false,
aplicarDescuento: false,        // Checkbox para activar descuento
aplicarMesesGratis: false,      // Checkbox para activar meses gratis
comentarioGestion: '',          // Un solo comentario para ambos

// Variables para descuento
descuentoPorcentaje: 0,
montoDescuento: 0,
nuevoTotal: 0,
costoMensualOriginal: 0,
totalOriginalContrato: 0,
duracionContratoMeses: 1,
montoDescuentoTotal: 0,
costoMensualConDescuento: 0,
nuevoTotalContrato: 0,

// Variables para meses gratis
mesesGratisCantidad: 0,
mesesFacturables: 0,
nuevoTotalConMesesGratis: 0,
ahorroMesesGratis: 0,

// Variables para cálculos finales
totalFinal: 0,
ahorroTotal: 0,

// Variables para observaciones internas (separadas)
observacionesTextoSeparado: '',
modalObservaciones: false,

// Datos del service
cotizaciones: [],
estadisticas: {},
pagination: {},
vendedoresUnicos: [],

// UI State
vistaActual: 'tabla',
modalCotizacion: null,
modalPDF: false,
pdfCotizacion: null,
esCopia: true,
modalRechazo: false,
cotizacionSeleccionada: null,
motivoRechazo: '',

// Filtros y paginación
filtros: {
busqueda: '',
search: '',
estado: '',
vendedor: '',
periodo: '',
page: 1,
limit: 25
},

paginaSalto: 1,
debounceTimer: null,

// Ordenamiento
ordenActual: { campo: 'fechaCreacion', direccion: 'desc' },

// Sistema de notificaciones
notification: {
show: false,
type: 'success',
message: '',
icon: 'fa-check'
},

// Service reference
cotizacionService
}
},

computed: {
estadosDisponibles() {
return this.cotizacionService.getEstados();
},

periodosDisponibles() {
return this.cotizacionService.getPeriodos();
},

cotizacionesFormateadas() {
const formateadas = this.cotizaciones.map(cotizacion => 
 this.cotizacionService.formatCotizacionDisplay(cotizacion)
);

return this.aplicarPrioridadEstados(formateadas);
},

tieneActiveFiltros() {
return this.filtros.search || this.filtros.estado || this.filtros.vendedor || this.filtros.periodo;
},

rangoInicio() {
return ((this.pagination.currentPage || 1) - 1) * (this.pagination.itemsPerPage || 25) + 1;
},

rangoFin() {
const inicio = this.rangoInicio - 1;
const fin = inicio + (this.pagination.itemsPerPage || 25);
return Math.min(fin, this.pagination.totalItems || 0);
},

paginasVisibles() {
const total = this.pagination.totalPages || 1;
const actual = this.pagination.currentPage || 1;
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


// 🔧 COMPUTED CORREGIDO
validarFormulario() {
  // Debe tener al menos una opción seleccionada
  if (!this.aplicarDescuento && !this.aplicarMesesGratis) return false;

  // Si aplica descuento, debe tener porcentaje válido
  if (this.aplicarDescuento) {
    if (!this.descuentoPorcentaje || this.descuentoPorcentaje <= 0 || this.descuentoPorcentaje > 100) {
      return false;
    }
  }

  // Si aplica meses gratis, debe tener cantidad válida
  if (this.aplicarMesesGratis) {
    // 🔧 CAMBIO AQUÍ: > en lugar de >=
    if (!this.mesesGratisCantidad || this.mesesGratisCantidad <= 0 || this.mesesGratisCantidad > (this.duracionContratoMeses - 1)) {
      return false;
    }
  }

  // Debe tener comentario obligatorio
  if (!this.comentarioGestion || !this.comentarioGestion.trim()) {
    return false;
  }

  return true;
}
},

async mounted() {
await this.cargarDatos();
},

methods: {
// ==================== PRIORIDAD DE ESTADOS ====================
aplicarPrioridadEstados(cotizaciones) {
return cotizaciones.sort((a, b) => {
 const prioridades = {
   'pendiente_aprobacion': 1,
   'pendiente': 2,
   'efectiva': 3,
   'rechazada': 4
 };
 
 const prioridadA = prioridades[a.estado] || 99;
 const prioridadB = prioridades[b.estado] || 99;
 
 if (prioridadA !== prioridadB) {
   return prioridadA - prioridadB;
 }
 
 return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
});
},

// ==================== CARGA DE DATOS ====================
async cargarDatos() {
this.loading = true;
this.loadingMessage = 'Cargando datos del sistema...';

try {
 await Promise.all([
   this.cargarCotizaciones(),
   this.cargarEstadisticas(),
   this.cargarVendedores()
 ]);
} catch (error) {
 this.showNotification('Error cargando datos', 'error');
 console.error('Error cargando datos:', error);
} finally {
 this.loading = false;
}
},

async cargarCotizaciones() {
const params = this.cotizacionService.validateFilterParams(this.filtros);
const response = await this.cotizacionService.getCotizaciones(params);

if (response.success) {
this.cotizaciones = response.cotizaciones;
this.pagination = response.pagination;
} else {
this.showNotification(response.message, 'error');
}
},

async cargarEstadisticas() {
const response = await this.cotizacionService.getEstadisticas();

if (response.success) {
this.estadisticas = response.estadisticas;
}
},

async cargarVendedores() {
const response = await this.cotizacionService.getVendedores();

if (response.success) {
this.vendedoresUnicos = response.vendedores;
}
},

// ==================== FILTRADO Y BÚSQUEDA ====================
buscarConDebounce() {
clearTimeout(this.debounceTimer);
this.debounceTimer = setTimeout(() => {
this.filtros.search = this.filtros.busqueda;
this.aplicarFiltros();
}, 500);
},

async aplicarFiltros() {
this.filtros.page = 1;
await this.cargarCotizaciones();
},

limpiarFiltros() {
this.filtros = {
busqueda: '',
search: '',
estado: '',
vendedor: '',
periodo: '',
page: 1,
limit: this.filtros.limit
};
this.cargarCotizaciones();
},

// ==================== PAGINACIÓN ====================
async cambiarItemsPorPagina() {
this.filtros.page = 1;
await this.cargarCotizaciones();
},

async irAPagina(pagina = null) {
const nuevaPagina = pagina || this.paginaSalto;

if (nuevaPagina >= 1 && nuevaPagina <= (this.pagination.totalPages || 1)) {
this.filtros.page = nuevaPagina;
await this.cargarCotizaciones();
this.paginaSalto = nuevaPagina;
} else {
this.showNotification(`Página debe estar entre 1 y ${this.pagination.totalPages || 1}`, 'warning');
this.paginaSalto = this.pagination.currentPage || 1;
}
},

async irAPrimera() {
await this.irAPagina(1);
},

async irAUltima() {
await this.irAPagina(this.pagination.totalPages);
},

async paginaAnterior() {
if (this.pagination.hasPrevPage) {
await this.irAPagina(this.pagination.currentPage - 1);
}
},

async paginaSiguiente() {
if (this.pagination.hasNextPage) {
await this.irAPagina(this.pagination.currentPage + 1);
}
},

// ==================== ACCIONES DE COTIZACIONES ====================
confirmarAprobacion(cotizacion) {
this.cotizacionSeleccionada = cotizacion;
this.modalConfirmacionAprobacion = true;
if (this.modalCotizacion) {
this.modalCotizacion = null;
}
},

async confirmarAprobacionFinal() {
try {
const response = await this.cotizacionService.aprobarCotizacion(this.cotizacionSeleccionada.id);

if (response.success) {
  this.showNotification('Cotización aprobada exitosamente. Estado cambiado a PENDIENTE', 'success');
  await this.cargarDatos();
  this.cerrarModalConfirmacionAprobacion();
} else {
  this.showNotification(response.message, 'error');
}
} catch (error) {
this.showNotification('Error aprobando cotización', 'error');
console.error('Error:', error);
}
},

cerrarModalConfirmacionAprobacion() {
this.modalConfirmacionAprobacion = false;
this.cotizacionSeleccionada = null;
},

marcarComoEfectiva(cotizacion) {
this.cotizacionSeleccionada = cotizacion;
this.comentarioEfectiva = '';
this.modalConfirmacionEfectiva = true;
if (this.modalCotizacion) {
this.modalCotizacion = null;
}
},

async confirmarMarcarComoEfectiva() {
try {
const response = await this.cotizacionService.cambiarEstado(
  this.cotizacionSeleccionada.id, 
  'efectiva',
  this.comentarioEfectiva.trim() || null
);

if (response.success) {
  this.showNotification('Cotización marcada como efectiva exitosamente', 'success');
  await this.cargarDatos();
  this.cerrarModalConfirmacionEfectiva();
} else {
  this.showNotification(response.message, 'error');
}
} catch (error) {
this.showNotification('Error marcando cotización como efectiva', 'error');
console.error('Error:', error);
}
},

cerrarModalConfirmacionEfectiva() {
this.modalConfirmacionEfectiva = false;
this.cotizacionSeleccionada = null;
this.comentarioEfectiva = '';
},

rechazarCotizacion(cotizacion) {
this.cotizacionSeleccionada = cotizacion;
this.motivoRechazo = '';
this.modalRechazo = true;
if (this.modalCotizacion) {
this.modalCotizacion = null;
}
},

cancelarCotizacion(cotizacion) {
this.rechazarCotizacion(cotizacion);
},

async confirmarRechazo() {
if (!this.motivoRechazo.trim()) {
this.showNotification('El motivo es obligatorio', 'warning');
return;
}

try {
const response = await this.cotizacionService.rechazarCotizacion(
  this.cotizacionSeleccionada.id, 
  this.motivoRechazo.trim()
);

if (response.success) {
  this.showNotification(response.message, 'success');
  await this.cargarDatos();
  this.cerrarModalRechazo();
} else {
  this.showNotification(response.message, 'error');
}
} catch (error) {
this.showNotification('Error procesando rechazo', 'error');
console.error('Error:', error);
}
},

// ==================== 🆕 MODAL DE GESTIÓN COMERCIAL UNIFICADO ====================
abrirModalGestionComercial(cotizacion) {
if (cotizacion.estado !== 'pendiente') {
this.showNotification('Solo se pueden gestionar cotizaciones pendientes', 'warning');
return;
}

this.cotizacionSeleccionada = cotizacion;

// Inicializar datos del modal
this.inicializarDatosGestionComercial(cotizacion);

this.modalGestionComercial = true;

if (this.modalCotizacion) {
this.modalCotizacion = null;
}
},

inicializarDatosGestionComercial(cotizacion) {
// Obtener total original
let totalOriginal;
if (cotizacion.tiene_descuento && cotizacion.total_original) {
totalOriginal = parseFloat(cotizacion.total_original);
} else {
totalOriginal = parseFloat(cotizacion.total);
}

// Calcular duración en meses
this.duracionContratoMeses = this.extraerDuracionContratoMeses(cotizacion);
this.totalOriginalContrato = totalOriginal;
this.costoMensualOriginal = totalOriginal / this.duracionContratoMeses;

// Inicializar checkboxes según estado actual
this.aplicarDescuento = cotizacion.tiene_descuento || false;
this.aplicarMesesGratis = cotizacion.tiene_meses_gratis || false;

// Inicializar valores existentes
if (cotizacion.tiene_descuento) {
this.descuentoPorcentaje = parseFloat(cotizacion.descuento_porcentaje) || 0;
} else {
this.descuentoPorcentaje = 0;
}

if (cotizacion.tiene_meses_gratis) {
this.mesesGratisCantidad = parseInt(cotizacion.meses_gratis) || 0;
} else {
this.mesesGratisCantidad = 0;
}

// Usar el comentario existente (campo compartido)
this.comentarioGestion = cotizacion.comentario_descuento || '';

// Calcular valores iniciales
this.calcularTotales();
},

extraerDuracionContratoMeses(cotizacion) {
if (cotizacion.serviciosDetalles && cotizacion.serviciosDetalles.length > 0) {
const mesesContrato = cotizacion.serviciosDetalles[0].cantidadAnos || 1;
return mesesContrato;
}
return 1;
},

// 🔧 MÉTODO MEJORADO - Resetear valores cuando se desactivan checkboxes
calcularTotales() {
// Resetear valores
this.montoDescuentoTotal = 0;
this.costoMensualConDescuento = this.costoMensualOriginal;
this.nuevoTotalContrato = this.totalOriginalContrato;
this.ahorroMesesGratis = 0;
this.mesesFacturables = this.duracionContratoMeses;
this.nuevoTotalConMesesGratis = this.totalOriginalContrato;

// Si se desactiva el descuento, resetear el porcentaje
if (!this.aplicarDescuento) {
 this.descuentoPorcentaje = 0;
}

// Si se desactiva meses gratis, resetear la cantidad
if (!this.aplicarMesesGratis) {
 this.mesesGratisCantidad = 0;
}

// Calcular descuento si está activado Y tiene valor
if (this.aplicarDescuento && this.descuentoPorcentaje > 0) {
this.montoDescuentoTotal = (this.totalOriginalContrato * this.descuentoPorcentaje) / 100;
this.nuevoTotalContrato = this.totalOriginalContrato - this.montoDescuentoTotal;
this.costoMensualConDescuento = this.nuevoTotalContrato / this.duracionContratoMeses;
}

// Calcular meses gratis si está activado Y tiene valor
if (this.aplicarMesesGratis && this.mesesGratisCantidad > 0) {
this.mesesFacturables = this.duracionContratoMeses - this.mesesGratisCantidad;
this.ahorroMesesGratis = this.costoMensualOriginal * this.mesesGratisCantidad;
this.nuevoTotalConMesesGratis = this.costoMensualOriginal * this.mesesFacturables;
}

// Calcular total final y ahorro total
this.calcularTotalFinal();
},

calcularTotalFinal() {
 let totalConMesesGratis = this.totalOriginalContrato;

 // PASO 1: Aplicar meses gratis
 if (this.aplicarMesesGratis && this.mesesGratisCantidad > 0) {
   this.mesesFacturables = this.duracionContratoMeses - this.mesesGratisCantidad;
   totalConMesesGratis = this.costoMensualOriginal * this.mesesFacturables;
   this.ahorroMesesGratis = this.costoMensualOriginal * this.mesesGratisCantidad;
 }

 // PASO 2: Aplicar descuento porcentual
 if (this.aplicarDescuento && this.descuentoPorcentaje > 0) {
   this.montoDescuentoTotal = (totalConMesesGratis * this.descuentoPorcentaje) / 100;
   this.totalFinal = totalConMesesGratis - this.montoDescuentoTotal;
 } else {
   this.totalFinal = totalConMesesGratis;
 }

 this.ahorroTotal = this.totalOriginalContrato - this.totalFinal;
},

// 🔧 MÉTODO CORREGIDO - cambiar la validación
async confirmarGestionComercial() {
if (!this.validarFormulario) {  // ✅ Correcto - es un computed property
 this.showNotification('Completa todos los campos requeridos', 'warning');
 return;
}

try {
 const promesas = [];

 // Aplicar descuento si está seleccionado Y tiene valor válido
 if (this.aplicarDescuento && this.descuentoPorcentaje > 0) {
   promesas.push(
     this.cotizacionService.aplicarDescuento(
       this.cotizacionSeleccionada.id,
       this.descuentoPorcentaje,
       this.comentarioGestion.trim()
     )
   );
 }

 // Aplicar meses gratis si está seleccionado Y tiene valor válido
 if (this.aplicarMesesGratis && this.mesesGratisCantidad > 0) {
   promesas.push(
     this.cotizacionService.aplicarMesesGratis(
       this.cotizacionSeleccionada.id,
       this.mesesGratisCantidad,
       this.comentarioGestion.trim()
     )
   );
 }

 // Verificar que tengamos al menos una operación para ejecutar
 if (promesas.length === 0) {
   this.showNotification('Debe configurar al menos un descuento o meses gratis', 'warning');
   return;
 }

 // Ejecutar todas las operaciones
 const resultados = await Promise.all(promesas);

 // Verificar que todas fueron exitosas
 const todosExitosos = resultados.every(resultado => resultado.success);

 if (todosExitosos) {
   const acciones = [];
   if (this.aplicarDescuento && this.descuentoPorcentaje > 0) {
     acciones.push(`descuento del ${this.descuentoPorcentaje}%`);
   }
   if (this.aplicarMesesGratis && this.mesesGratisCantidad > 0) {
     acciones.push(`${this.mesesGratisCantidad} meses gratis`);
   }
   
   const mensaje = `Gestión comercial aplicada exitosamente: ${acciones.join(' y ')}.`;
   this.showNotification(mensaje, 'success');
   
   await this.cargarDatos();
   this.cerrarModalGestionComercial();
 } else {
   // Si alguna falló, mostrar el primer error
   const primerError = resultados.find(resultado => !resultado.success);
   this.showNotification(primerError.message, 'error');
 }

} catch (error) {
 this.showNotification('Error aplicando gestión comercial', 'error');
 console.error('Error:', error);
}
},

cerrarModalGestionComercial() {
this.modalGestionComercial = false;
this.cotizacionSeleccionada = null;

// Resetear todas las variables
this.aplicarDescuento = false;
this.aplicarMesesGratis = false;
this.comentarioGestion = '';
this.descuentoPorcentaje = 0;
this.mesesGratisCantidad = 0;
this.montoDescuentoTotal = 0;
this.costoMensualConDescuento = 0;
this.nuevoTotalContrato = 0;
this.ahorroMesesGratis = 0;
this.mesesFacturables = 0;
this.nuevoTotalConMesesGratis = 0;
this.totalFinal = 0;
this.ahorroTotal = 0;
this.costoMensualOriginal = 0;
this.totalOriginalContrato = 0;
this.duracionContratoMeses = 1;
},

// ==================== 🆕 MÉTODOS PARA OBSERVACIONES INTERNAS ====================
editarObservaciones(cotizacion) {
this.cotizacionSeleccionada = cotizacion;
this.observacionesTextoSeparado = cotizacion.observaciones || '';
this.modalObservaciones = true;

if (this.modalCotizacion) {
this.modalCotizacion = null;
}
},

async confirmarObservacionesSeparado() {
if (!this.observacionesTextoSeparado.trim()) {
this.showNotification('Las observaciones no pueden estar vacías', 'warning');
return;
}

try {
const response = await this.cotizacionService.actualizarObservaciones(
  this.cotizacionSeleccionada.id,
  this.observacionesTextoSeparado.trim()
);

if (response.success) {
  this.showNotification('Observaciones internas actualizadas exitosamente', 'success');
  await this.cargarDatos();
  this.cerrarModalObservaciones();
} else {
  this.showNotification(response.message, 'error');
}
} catch (error) {
this.showNotification('Error actualizando observaciones', 'error');
console.error('Error:', error);
}
},

cerrarModalObservaciones() {
this.modalObservaciones = false;
this.cotizacionSeleccionada = null;
this.observacionesTextoSeparado = '';
},

// ==================== PDF ====================
mostrarModalPDF(cotizacion) {
if (!cotizacion.pdfGenerado) {
this.showNotification('Esta cotización no tiene PDF generado', 'warning');
return;
}
this.pdfCotizacion = cotizacion;
this.esCopia = true;
this.modalPDF = true;
},

async descargarPDF() {
try {
const tipo = this.esCopia ? 'copia' : 'original';
const response = await this.cotizacionService.generarPDF(this.pdfCotizacion.id, tipo);

if (response.success) {
  this.showNotification(response.message, 'success');
  this.cerrarModalPDF();
} else {
  this.showNotification(response.message, 'error');
}
} catch (error) {
this.showNotification('Error descargando PDF', 'error');
console.error('Error:', error);
}
},

cerrarModalPDF() {
this.modalPDF = false;
this.pdfCotizacion = null;
this.esCopia = true;
},

// ==================== UTILIDAD ====================
getEstadoTexto(estado) {
const estadoObj = this.estadosDisponibles.find(e => e.value === estado);
return estadoObj ? estadoObj.label : estado;
},

getEstadoClase(estado) {
return estado;
},

ordenarPor(campo) {
if (this.ordenActual.campo === campo) {
this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
} else {
this.ordenActual = { campo, direccion: 'asc' };
}
this.cargarCotizaciones();
},

getSortIcon(campo) {
if (this.ordenActual.campo !== campo) return '↕';
return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
},

formatearFechaAuditoria(fecha) {
if (!fecha) return '';

try {
const date = new Date(fecha);
return date.toLocaleString('es-HN', {
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

// ==================== NAVEGACIÓN ====================
nuevaCotizacion() {
this.$router.push('/cotizaciones/nueva');
},

async verCotizacion(cotizacion) {
try {
const response = await this.cotizacionService.getCotizacionById(cotizacion.id);

if (response.success) {
  this.modalCotizacion = response.cotizacion;
} else {
  this.showNotification('Error cargando detalles de la cotización', 'error');
}
} catch (error) {
this.showNotification('Error de conexión', 'error');
console.error('Error:', error);
}
},

// ==================== MODALES ====================
cerrarModal() {
this.modalCotizacion = null;
},

cerrarModalRechazo() {
this.modalRechazo = false;
this.cotizacionSeleccionada = null;
this.motivoRechazo = '';
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

setTimeout(() => {
this.closeNotification();
}, 5000);
},

closeNotification() {
this.notification.show = false;
}
},

beforeUnmount() {
if (this.debounceTimer) {
clearTimeout(this.debounceTimer);
}
}
}
</script>

<style scoped>

/* ==================== ESTILOS BASE ==================== */
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

/* ==================== BOTONES ==================== */
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

.btn-success {
 background: #27ae60;
 color: white;
}

.btn-success:hover {
 background: #219a52;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-danger {
 background: #e74c3c;
 color: white;
}

.btn-danger:hover {
 background: #c0392b;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-warning {
 background: #f39c12;
 color: white;
}

.btn-warning:hover {
 background: #e67e22;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-info {
 background: #17a2b8;
 color: white;
}

.btn-info:hover {
 background: #138496;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
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
 box-shadow: none !important;
}

/* ==================== FILTROS ==================== */
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

/* ==================== ESTADÍSTICAS ==================== */
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

/* ==================== SECCIÓN PRINCIPAL ==================== */
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

/* ==================== PAGINACIÓN ==================== */
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

/* ==================== TABLA ==================== */
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

.fecha {
 color: #2c3e50;
 white-space: nowrap;
}

.total-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.monto {
 font-weight: 600;
 color: #27ae60;
 font-family: monospace;
}

.descuento-aplicado {
 background: #fff3cd;
 color: #856404;
 padding: 0.2rem 0.4rem;
 border-radius: 10px;
 font-size: 0.7rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.2rem;
 width: fit-content;
}

.descuento-tag {
 background: #fff3cd;
 color: #856404;
 padding: 0.15rem 0.3rem;
 border-radius: 8px;
 font-size: 0.7rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.2rem;
 margin-top: 0.25rem;
}

/* NUEVOS ESTILOS PARA MESES GRATIS */
.meses-gratis-aplicado {
 background: #d1ecf1;
 color: #0c5460;
 padding: 0.2rem 0.4rem;
 border-radius: 10px;
 font-size: 0.7rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.2rem;
 width: fit-content;
 margin-top: 0.25rem;
}

.meses-gratis-tag {
 background: #d1ecf1;
 color: #0c5460;
 padding: 0.15rem 0.3rem;
 border-radius: 8px;
 font-size: 0.7rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.2rem;
 margin-top: 0.25rem;
}

.meses-gratis-info {
 background: #d1ecf1;
 color: #0c5460;
 padding: 0.5rem;
 border-radius: 6px;
 font-size: 0.8rem;
 border-left: 3px solid #17a2b8;
 margin-top: 0.25rem;
}

.meses-gratis-pdf {
 color: #17a2b8;
 font-weight: 600;
 margin-bottom: 0.5rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 justify-content: flex-end;
}

/* ==================== ESTADOS CON BORDES DE COLORES ==================== */
.estado-badge {
 padding: 0.375rem 0.75rem;
 border-radius: 20px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 border: 2px solid;
}

.estado-badge.pendiente {
 background: #d1ecf1;
 color: #0c5460;
 border-color: #17a2b8;
}

.estado-badge.pendiente_aprobacion {
 background: #fff3cd;
 color: #856404;
 border-color: #f39c12;
}

.estado-badge.efectiva {
 background: #d4edda;
 color: #155724;
 border-color: #27ae60;
}

.estado-badge.rechazada {
 background: #f8d7da;
 color: #721c24;
 border-color: #e74c3c;
}

.estado-badge.cancelada {
 background: #f8d7da;
 color: #721c24;
 border-color: #e74c3c;
}

.estado-badge.secondary {
 background: #e2e3e5;
 color: #383d41;
 border-color: #6c757d;
}

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

/* ==================== ACCIONES ==================== */
.acciones {
 display: flex;
 gap: 0.4rem;
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

.btn-accion.aceptar {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.btn-accion.aceptar:hover {
 background: #c3e6cb;
 transform: translateY(-1px);
 box-shadow: 0 2px 8px rgba(21, 87, 36, 0.2);
}

.btn-accion.cancelar {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
}

.btn-accion.cancelar:hover {
 background: #f5c6cb;
 transform: translateY(-1px);
 box-shadow: 0 2px 8px rgba(114, 28, 36, 0.2);
}

/* NUEVO BOTÓN GESTIONAR */
.btn-accion.gestionar {
 background: #e1f5fe;
 color: #0277bd;
 border: 1px solid #b3e5fc;
}

.btn-accion.gestionar:hover {
 background: #b3e5fc;
 transform: translateY(-1px);
 box-shadow: 0 2px 8px rgba(2, 119, 189, 0.3);
}

/* NUEVO BOTÓN OBSERVACIONES */
.btn-accion.observaciones {
 background: #fef3c7;
 color: #92400e;
 border: 1px solid #fde68a;
}

.btn-accion.observaciones:hover {
 background: #fde68a;
 transform: translateY(-1px);
 box-shadow: 0 2px 8px rgba(146, 64, 14, 0.3);
}

/* ==================== INFORMACIÓN DE AUDITORÍA ==================== */
.auditoria-info {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 font-weight: 500;
}

.auditoria-info.aprobado {
 color: #27ae60;
}

.auditoria-info.aprobado i {
 color: #27ae60;
}

.auditoria-info.rechazado {
 color: #e74c3c;
}

.auditoria-info.rechazado i {
 color: #e74c3c;
}

.auditoria-info.descuento {
 color: #f39c12;
}

.auditoria-info.descuento i {
 color: #f39c12;
}

/* NUEVA AUDITORÍA MESES GRATIS */
.auditoria-info.meses-gratis {
 color: #17a2b8;
}

.auditoria-info.meses-gratis i {
 color: #17a2b8;
}

.fecha-auditoria {
 font-size: 0.85em;
 color: #6c757d;
 font-weight: 400;
 font-style: italic;
}

.total-detalle {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.descuento-info {
 background: #fff3cd;
 color: #856404;
 padding: 0.5rem;
 border-radius: 6px;
 font-size: 0.8rem;
 border-left: 3px solid #f39c12;
}

.comentario-descuento {
 color: #f39c12;
 font-style: italic;
 background: #fffcf0;
 padding: 0.5rem;
 border-radius: 4px;
 border-left: 3px solid #f39c12;
}

/* NUEVA CLASE OBSERVACIONES */
.observaciones-texto {
 color: #6c757d;
 font-style: italic;
 background: #f8f9fa;
 padding: 0.5rem;
 border-radius: 4px;
 border-left: 3px solid #6c757d;
}

/* ==================== VISTA DE TARJETAS ==================== */
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

.card-details {
 display: grid;
 gap: 0.5rem;
 margin-bottom: 1.5rem;
}

.detail {
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
}

.detail-label {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.detail-value {
 color: #2c3e50;
 font-weight: 500;
 font-size: 0.9rem;
 text-align: right;
}

.detail-value.monto {
 color: #27ae60;
 font-family: monospace;
}

.card-actions {
 display: flex;
 gap: 0.5rem;
 flex-wrap: wrap;
}

.card-actions .btn {
 flex: 1;
 justify-content: center;
 min-width: 70px;
}

/* ==================== ESTADO VACÍO ==================== */
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

/* ==================== PAGINACIÓN COMPLETA ==================== */
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

/* ==================== MODALES ==================== */
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

/* ==================== MODAL DE GESTIÓN COMERCIAL ==================== */
.modal-gestion-comercial {
 max-width: 1000px;
 max-height: 95vh;
}

.cotizacion-info {
 background: #f8f9fa;
 padding: 1rem;
 border-radius: 8px;
 margin-bottom: 1.5rem;
 border-left: 4px solid #3498db;
}

.cotizacion-info h4 {
 margin: 0 0 0.5rem 0;
 color: #2c3e50;
 font-size: 1.2rem;
 font-weight: 600;
}

.cotizacion-info p {
 margin: 0;
 color: #6c757d;
}

/* ==================== SECCIONES DE GESTIÓN ==================== */
.gestion-section {
 border: 2px solid #e9ecef;
 border-radius: 12px;
 margin-bottom: 1.5rem;
 overflow: hidden;
 transition: all 0.3s ease;
}

.gestion-section:has(input:checked) {
 border-color: #3498db;
 box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.section-toggle {
 display: flex;
 align-items: center;
 padding: 1rem;
 background: #f8f9fa;
 cursor: pointer;
 user-select: none;
 transition: all 0.3s ease;
 border-bottom: 1px solid #e9ecef;
}

.section-toggle:hover {
 background: #e9ecef;
}

.section-toggle input[type="checkbox"] {
 margin-right: 1rem;
 transform: scale(1.2);
 accent-color: #3498db;
}

.toggle-content {
 display: flex;
 align-items: center;
 gap: 0.75rem;
 flex: 1;
}

.toggle-content i {
 font-size: 1.2rem;
 color: #3498db;
}

.toggle-text {
 font-weight: 600;
 color: #2c3e50;
 font-size: 1rem;
}

.section-content {
 padding: 1.5rem;
 background: white;
}

/* ==================== INFORMACIÓN ACTUAL ==================== */
.descuento-actual-info,
.meses-gratis-actual-info {
 background: #fff3cd;
 border: 1px solid #ffeaa7;
 border-radius: 8px;
 padding: 1rem;
 margin-bottom: 1rem;
 border-left: 4px solid #f39c12;
}

.descuento-actual-info h6,
.meses-gratis-actual-info h6 {
 margin: 0 0 0.5rem 0;
 color: #856404;
 font-size: 0.9rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.info-actual {
 color: #2c3e50;
 font-size: 0.9rem;
}

/* ==================== PREVIEWS ==================== */
.preview-descuento,
.preview-meses-gratis {
 background: #e8f5e8;
 border: 1px solid #c3e6cb;
 border-radius: 8px;
 padding: 1rem;
 margin-top: 1rem;
}

.preview-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.25rem 0;
}

.preview-label {
 color: #495057;
 font-weight: 500;
 font-size: 0.9rem;
}

.preview-valor {
 color: #2c3e50;
 font-weight: 600;
 font-family: monospace;
}

.preview-valor.descuento {
 color: #dc3545;
}

.preview-valor.meses-gratis {
 color: #28a745;
}

/* ==================== RESUMEN FINAL ==================== */
.resumen-final {
 background: #f8f9fa;
 border: 2px solid #dee2e6;
 border-radius: 12px;
 padding: 1.5rem;
 margin: 1.5rem 0;
}

.resumen-final h5 {
 margin: 0 0 1rem 0;
 color: #2c3e50;
 font-size: 1.1rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.resumen-grid {
 display: grid;
 gap: 0.75rem;
}

.resumen-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.75rem;
 background: white;
 border-radius: 8px;
 border-left: 4px solid #dee2e6;
}

.resumen-item.total-original {
 border-left-color: #6c757d;
}

.resumen-item.descuento {
 border-left-color: #dc3545;
 background: #fff5f5;
}

.resumen-item.meses-gratis {
 border-left-color: #28a745;
 background: #f8fff8;
}

.resumen-item.total-final {
 border-left-color: #007bff;
 background: #f0f8ff;
 font-size: 1.1rem;
}

.resumen-item.ahorro-total {
 border-left-color: #17a2b8;
 background: #f0fffe;
}

.resumen-label {
 color: #495057;
 font-weight: 500;
}

.resumen-valor {
 color: #2c3e50;
 font-weight: 600;
 font-family: monospace;
}

.resumen-valor.descuento {
 color: #dc3545;
}

.resumen-valor.meses-gratis {
 color: #28a745;
}

.resumen-valor.ahorro {
 color: #17a2b8;
}

/* ==================== RESUMEN FINANCIERO ==================== */
.resumen-financiero {
 margin: 1.5rem 0;
 padding: 1rem;
 border-radius: 8px;
 border: 2px solid;
}

.resumen-financiero.original {
 background: #f8f9fa;
 border-color: #6c757d;
}

.resumen-financiero h5 {
 margin: 0 0 1rem 0;
 color: #2c3e50;
 font-size: 1rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.financiero-grid {
 display: grid;
 gap: 0.75rem;
}

.financiero-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.5rem 0;
}

.financiero-item.total {
 border-top: 2px solid #dee2e6;
 padding-top: 0.75rem;
 margin-top: 0.5rem;
 font-size: 1.1rem;
}

.financiero-item .label {
 color: #495057;
 font-weight: 500;
}

.financiero-item .valor {
 color: #2c3e50;
 font-weight: 600;
 font-family: monospace;
}

/* ==================== FORMULARIOS ==================== */
.form-group {
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
 margin-bottom: 1rem;
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
 background: white;
}

.form-textarea:focus {
 outline: none;
 border-color: #3498db;
 box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-textarea::placeholder {
 color: #7f8c8d;
}

.input-group {
 display: flex;
 align-items: center;
}

.form-input {
 padding: 0.75rem 1rem;
 border: 2px solid #e1e8ed;
 border-radius: 8px 0 0 8px;
 border-right: none;
 font-size: 1rem;
 transition: border-color 0.3s ease;
 flex: 1;
}

.form-input:focus {
 outline: none;
 border-color: #3498db;
}

.input-addon {
 background: #e9ecef;
 border: 2px solid #e1e8ed;
 border-left: none;
 padding: 0.75rem 1rem;
 border-radius: 0 8px 8px 0;
 font-weight: 600;
 color: #495057;
}

.input-group .form-input:focus + .input-addon {
 border-color: #3498db;
}

.form-help {
 color: #6c757d;
 font-size: 0.8rem;
 margin-top: 0.25rem;
}

/* ==================== MODAL DE OBSERVACIONES ==================== */
.modal-observaciones {
 max-width: 600px;
}

.observaciones-form {
 display: flex;
 flex-direction: column;
 gap: 1.5rem;
}

.info-note {
 background: #e1f5fe;
 border: 1px solid #b3e5fc;
 border-radius: 8px;
 padding: 1rem;
 display: flex;
 align-items: flex-start;
 gap: 0.75rem;
 color: #0277bd;
 font-size: 0.9rem;
}

.info-note i {
 color: #0288d1;
 margin-top: 0.1rem;
 flex-shrink: 0;
}

/* ==================== MODAL PDF ==================== */
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

.total-original-pdf {
 color: #666;
 font-size: 0.9rem;
 margin-bottom: 0.5rem;
}

.descuento-pdf {
 color: #f39c12;
 font-weight: 600;
 margin-bottom: 0.5rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 justify-content: flex-end;
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

/* ==================== MODAL DE RECHAZO ==================== */
.modal-rechazo {
 max-width: 500px;
}

.rechazo-form {
 display: flex;
 flex-direction: column;
 gap: 1.5rem;
}

.modal-actions {
 display: flex;
 gap: 1rem;
 justify-content: flex-end;
 margin-top: 2rem;
 padding-top: 1.5rem;
 border-top: 1px solid #e9ecef;
 flex-wrap: wrap;
}

.motivo-rechazo {
 color: #e74c3c;
 font-style: italic;
 background: #ffeaea;
 padding: 0.5rem;
 border-radius: 4px;
 border-left: 3px solid #e74c3c;
}

/* ==================== MODAL DE CONFIRMACIÓN EFECTIVA ==================== */
.modal-confirmacion {
 max-width: 550px;
}

.confirmacion-form {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 1.5rem;
 text-align: center;
}

.confirmacion-icon {
 width: 80px;
 height: 80px;
 border-radius: 50%;
 background: linear-gradient(135deg, #27ae60, #2ecc71);
 display: flex;
 align-items: center;
 justify-content: center;
 color: white;
 font-size: 2rem;
 box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
}

/* ==================== MODAL DE CONFIRMACIÓN APROBACIÓN ==================== */
.confirmacion-icon.aprobacion {
 background: linear-gradient(135deg, #3498db, #2980b9);
 box-shadow: 0 10px 30px rgba(52, 152, 219, 0.3);
}

.confirmacion-form h4 {
 color: #2c3e50;
 margin: 0;
 font-size: 1.4rem;
 font-weight: 600;
}

.confirmacion-text {
 color: #555;
 font-size: 1rem;
 line-height: 1.6;
 margin: 0;
}

.confirmacion-details {
 color: #7f8c8d;
 font-size: 0.9rem;
 background: #f8f9fa;
 padding: 1rem;
 border-radius: 8px;
 border-left: 4px solid #3498db;
 display: flex;
 align-items: flex-start;
 gap: 0.5rem;
 text-align: left;
 width: 100%;
}

.confirmacion-details i {
 color: #3498db;
 margin-top: 0.2rem;
 flex-shrink: 0;
}

.text-success {
 color: #27ae60 !important;
}

.text-info {
 color: #17a2b8 !important;
}

.text-warning {
 color: #f39c12 !important;
}

.text-primary {
 color: #3498db !important;
}

.modal-header .text-success {
 color: #27ae60;
}

.modal-header .text-warning {
 color: #f39c12;
}

.modal-header .text-primary {
 color: #3498db;
}

.modal-header .text-info {
 color: #17a2b8;
}

/* ==================== DETALLES DE COTIZACIÓN ==================== */
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
 align-items: flex-start;
 padding: 0.75rem;
 background: #f8f9fa;
 border-radius: 6px;
 gap: 1rem;
}

.detalle-item strong {
 color: #2c3e50;
 font-weight: 600;
 flex-shrink: 0;
}

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

/* ==================== NOTIFICACIONES ==================== */
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

/* ==================== RESPONSIVE DESIGN ==================== */
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

 .modal-gestion-comercial {
   max-width: 95%;
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

 .acciones {
   gap: 0.3rem;
   flex-wrap: nowrap;
   justify-content: flex-start;
 }

 .btn-accion {
   width: 28px;
   height: 28px;
   font-size: 0.8rem;
   flex-shrink: 0;
 }

 .card-actions {
   gap: 0.4rem;
   flex-wrap: wrap;
 }

 .card-actions .btn {
   flex: 1;
   justify-content: center;
   min-width: 70px;
   font-size: 0.8rem;
 }

 .detalle-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.5rem;
 }

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

 .modal-confirmacion,
 .modal-gestion-comercial {
   max-width: 95%;
   margin: 1rem;
 }

 .confirmacion-icon {
   width: 60px;
   height: 60px;
   font-size: 1.5rem;
 }

 .confirmacion-form h4 {
   font-size: 1.2rem;
 }

 .confirmacion-details {
   flex-direction: column;
   text-align: center;
 }

 .modal-actions {
   flex-direction: column;
   gap: 0.5rem;
 }

 .modal-actions .btn {
   width: 100%;
   justify-content: center;
 }

 .financiero-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.25rem;
 }

 .resumen-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.25rem;
 }

 .preview-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.25rem;
 }

 .input-group {
   flex-direction: column;
 }

 .form-input {
   border-radius: 8px;
   border-right: 2px solid #e1e8ed;
 }

 .input-addon {
   border-radius: 8px;
   border-left: 2px solid #e1e8ed;
   border-top: none;
   text-align: center;
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
   gap: 0.25rem;
   flex-wrap: nowrap;
   justify-content: flex-start;
 }

 .btn-accion {
   width: 26px;
   height: 26px;
   font-size: 0.75rem;
   flex-shrink: 0;
 }

 .card-actions {
   gap: 0.4rem;
   flex-wrap: wrap;
 }

 .card-actions .btn {
   flex: 1;
   min-width: 60px;
   font-size: 0.75rem;
   padding: 0.4rem 0.6rem;
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

 .confirmacion-form {
   gap: 1rem;
   }

 .modal-gestion-comercial {
   max-width: 100%;
   margin: 0.5rem;
 }

 .resumen-financiero {
   margin: 1rem 0;
   padding: 0.75rem;
 }

 .financiero-grid {
   gap: 0.5rem;
 }

 .financiero-item {
   padding: 0.4rem 0;
 }

 .resumen-final {
   padding: 1rem;
   margin: 1rem 0;
 }

 .resumen-grid {
   gap: 0.5rem;
 }

 .resumen-item {
   padding: 0.5rem;
 }

 .preview-descuento,
 .preview-meses-gratis {
   padding: 0.75rem;
   margin-top: 0.75rem;
 }

 .preview-item {
   padding: 0.2rem 0;
 }

 .descuento-actual-info,
 .meses-gratis-actual-info {
   padding: 0.75rem;
   margin-bottom: 1rem;
 }

 .section-content {
   padding: 1rem;
 }

 .gestion-section {
   margin-bottom: 1rem;
 }

 .section-toggle {
   padding: 0.75rem;
 }

 .toggle-content {
   gap: 0.5rem;
 }

 .toggle-content i {
   font-size: 1rem;
 }

 .toggle-text {
   font-size: 0.9rem;
 }

 .form-group {
   margin-bottom: 0.75rem;
 }

 .form-textarea {
   padding: 0.5rem;
   min-height: 80px;
 }

 .form-input {
   padding: 0.5rem 0.75rem;
 }

 .input-addon {
   padding: 0.5rem 0.75rem;
 }

 .modal-header {
   padding: 1rem;
 }

 .modal-body {
   padding: 1rem;
 }

 .modal-footer {
   padding: 1rem;
 }

 .modal-header h3 {
   font-size: 1.1rem;
 }

 .cotizacion-info {
   padding: 0.75rem;
   margin-bottom: 1rem;
 }

 .cotizacion-info h4 {
   font-size: 1.1rem;
 }

 .resumen-final h5 {
   font-size: 1rem;
 }

 .resumen-financiero h5 {
   font-size: 0.9rem;
 }

 .info-note {
   padding: 0.75rem;
   font-size: 0.8rem;
 }

 .observaciones-form {
   gap: 1rem;
 }

 .modal-observaciones {
   max-width: 100%;
   margin: 0.5rem;
 }

 .modal-rechazo {
   max-width: 100%;
   margin: 0.5rem;
 }

 .rechazo-form {
   gap: 1rem;
 }

 .confirmacion-form {
   gap: 1rem;
 }

 .confirmacion-icon {
   width: 50px;
   height: 50px;
   font-size: 1.2rem;
 }

 .confirmacion-form h4 {
   font-size: 1.1rem;
 }

 .confirmacion-text {
   font-size: 0.9rem;
 }

 .confirmacion-details {
   padding: 0.75rem;
   font-size: 0.8rem;
 }

 .modal-actions {
   margin-top: 1rem;
   padding-top: 1rem;
 }

 .detalle-grid {
   gap: 0.75rem;
   margin-bottom: 1rem;
 }

 .detalle-item {
   padding: 0.5rem;
 }

 .servicios-detalle {
   margin-top: 1rem;
   padding-top: 1rem;
 }

 .servicios-detalle h4 {
   font-size: 1rem;
   margin-bottom: 0.75rem;
 }

 .servicios-modal-list {
   gap: 0.375rem;
 }

 .servicio-tag {
   padding: 0.15rem 0.4rem;
   font-size: 0.7rem;
 }

 .total-detalle {
   gap: 0.2rem;
 }

 .descuento-info {
   padding: 0.4rem;
   font-size: 0.75rem;
 }

 .comentario-descuento {
   padding: 0.4rem;
   font-size: 0.75rem;
 }

 .observaciones-texto {
   padding: 0.4rem;
   font-size: 0.75rem;
 }

 .meses-gratis-info {
   padding: 0.4rem;
   font-size: 0.75rem;
 }

 .auditoria-info {
   gap: 0.375rem;
   font-size: 0.8rem;
 }

 .fecha-auditoria {
   font-size: 0.75em;
 }

 .precio {
   font-size: 0.85rem;
 }

 .monto {
   font-size: 0.9rem;
 }

 .numero-cotizacion {
   font-size: 0.9rem;
 }

 .card-numero {
   font-size: 1rem;
 }

 .cliente-nombre {
   font-size: 0.9rem;
 }

 .cliente-email {
   font-size: 0.8rem;
 }

 .vendedor-nombre {
   font-size: 0.9rem;
 }

 .vendedor-rol {
   font-size: 0.8rem;
 }

 .fecha {
   font-size: 0.85rem;
 }

 .servicios-count {
   font-size: 0.8rem;
 }

 .estado-badge {
   padding: 0.3rem 0.6rem;
   font-size: 0.7rem;
 }

 .pdf-disponible,
 .pdf-no-disponible {
   font-size: 0.8rem;
 }

 .stat-number {
   font-size: 1.5rem;
 }

 .stat-label {
   font-size: 0.8rem;
 }

 .page-subtitle {
   font-size: 1rem;
 }

 .section-title {
   font-size: 1.3rem;
 }

 .view-btn {
   padding: 0.4rem 0.8rem;
   font-size: 0.8rem;
 }

 .items-info {
   font-size: 0.8rem;
 }

 .pagination-jump label {
   font-size: 0.8rem;
 }

 .page-input {
   width: 50px;
   padding: 0.3rem 0.4rem;
   font-size: 0.8rem;
 }

 .pagina-actual {
   font-size: 0.8rem;
   padding: 0.4rem 0.8rem;
 }

 .empty-title {
   font-size: 1.3rem;
 }

 .empty-description {
   font-size: 0.9rem;
 }

 .empty-icon {
   font-size: 3rem;
 }

 .btn {
   padding: 0.6rem 1rem;
   font-size: 0.8rem;
 }

 .btn-sm {
   padding: 0.4rem 0.8rem;
   font-size: 0.75rem;
 }

 .filtros-section {
   padding: 1rem;
 }

 .search-input {
   padding: 0.6rem 0.8rem 0.6rem 2.5rem;
   font-size: 0.9rem;
 }

 .search-icon {
   font-size: 1rem;
   left: 0.8rem;
 }

 .filter-select {
   padding: 0.6rem 0.8rem;
   font-size: 0.8rem;
 }

 .cotizaciones-section {
   padding: 1rem;
 }

 .cotizaciones-tabla th {
   padding: 0.75rem 0.5rem;
   font-size: 0.8rem;
 }

 .cotizaciones-tabla td {
   padding: 0.75rem 0.5rem;
   font-size: 0.85rem;
 }

 .card-content h3 {
   font-size: 1.1rem;
 }

 .card-content p {
   font-size: 0.8rem;
 }

 .servicios-card {
   padding: 0.5rem;
 }

 .detail-label {
   font-size: 0.8rem;
 }

 .detail-value {
   font-size: 0.8rem;
 }
}

/* ==================== ESTILOS ADICIONALES PARA PANTALLAS MUY PEQUEÑAS ==================== */
@media (max-width: 360px) {
 .admin-cotizaciones-container {
   padding: 0.5rem;
 }

 .header-content h1 {
   font-size: 1.8rem;
 }

 .btn {
   padding: 0.5rem 0.8rem;
   font-size: 0.75rem;
 }

 .btn-sm {
   padding: 0.3rem 0.6rem;
   font-size: 0.7rem;
 }

 .modal-content {
   margin: 0.25rem;
 }

 .modal-header,
 .modal-body,
 .modal-footer {
   padding: 0.75rem;
 }

 .filtros-section,
 .cotizaciones-section {
   padding: 0.75rem;
 }

 .stat-card {
   padding: 0.75rem;
 }

 .cotizacion-card {
   padding: 0.75rem;
 }

 .section-toggle {
   padding: 0.5rem;
 }

 .section-content {
   padding: 0.75rem;
 }

 .resumen-financiero,
 .resumen-final {
   padding: 0.5rem;
 }

 .preview-descuento,
 .preview-meses-gratis {
   padding: 0.5rem;
 }

 .descuento-actual-info,
 .meses-gratis-actual-info {
   padding: 0.5rem;
 }

 .info-note {
   padding: 0.5rem;
 }

 .confirmacion-details {
   padding: 0.5rem;
 }

 .detalle-item {
   padding: 0.375rem;
 }

 .notification {
   left: 5px;
   right: 5px;
   padding: 0.75rem 1rem;
 }

 .btn-accion {
   width: 24px;
   height: 24px;
   font-size: 0.7rem;
 }

 .acciones {
   gap: 0.2rem;
 }

 .estado-badge {
   padding: 0.25rem 0.5rem;
   font-size: 0.65rem;
 }

 .servicio-tag {
   padding: 0.1rem 0.3rem;
   font-size: 0.65rem;
 }

 .servicios-mas {
   padding: 0.1rem 0.3rem;
   font-size: 0.65rem;
 }

 .descuento-aplicado,
 .meses-gratis-aplicado {
   padding: 0.15rem 0.3rem;
   font-size: 0.65rem;
 }

 .descuento-tag,
 .meses-gratis-tag {
   padding: 0.1rem 0.25rem;
   font-size: 0.65rem;
 }

 .pdf-page {
   padding: 0.5rem;
 }

 .pdf-content h2 {
   font-size: 1.2rem;
 }

 .cotizacion-numero {
   font-size: 0.9rem;
 }

 .empresa-logo {
   font-size: 1rem;
 }

 .empresa-logo i {
   font-size: 1.2rem;
 }

 .documento-marca {
   padding: 0.3rem 0.6rem;
   font-size: 0.7rem;
 }

 .documento-tipo {
   padding: 0.3rem 0.6rem;
   font-size: 0.7rem;
 }

 .btn-tipo {
   padding: 0.3rem 0.6rem;
   font-size: 0.7rem;
 }

 .total-pdf {
   padding: 0.75rem;
   font-size: 1rem;
 }

 .info-section h4 {
   font-size: 0.8rem;
 }

 .info-section p {
   font-size: 0.8rem;
 }

 .servicios-pdf h4 {
   font-size: 0.8rem;
 }

 .servicios-pdf li {
   font-size: 0.8rem;
 }

 .form-textarea {
   padding: 0.4rem;
   min-height: 70px;
   font-size: 0.8rem;
 }

 .form-input {
   padding: 0.4rem 0.6rem;
   font-size: 0.8rem;
 }

 .input-addon {
   padding: 0.4rem 0.6rem;
   font-size: 0.8rem;
 }

 .toggle-text {
   font-size: 0.8rem;
 }

 .toggle-content i {
   font-size: 0.9rem;
 }

 .confirmacion-icon {
   width: 40px;
   height: 40px;
   font-size: 1rem;
 }

 .confirmacion-form h4 {
   font-size: 1rem;
 }

 .confirmacion-text {
   font-size: 0.8rem;
 }

 .confirmacion-details {
   font-size: 0.75rem;
 }

 .modal-header h3 {
   font-size: 1rem;
 }

 .cotizacion-info h4 {
   font-size: 1rem;
 }

 .resumen-final h5,
 .resumen-financiero h5 {
   font-size: 0.85rem;
 }

 .financiero-item,
 .resumen-item,
 .preview-item {
   font-size: 0.8rem;
 }
}

/* ==================== MEJORAS DE ACCESIBILIDAD ==================== */
@media (prefers-reduced-motion: reduce) {
 * {
   animation-duration: 0.01ms !important;
   animation-iteration-count: 1 !important;
   transition-duration: 0.01ms !important;
 }
}

@media (prefers-color-scheme: dark) {
 /* Los estilos de tema oscuro pueden agregarse aquí en el futuro */
}

/* ==================== PRINT STYLES ==================== */
@media print {
 .admin-cotizaciones-container {
   padding: 0;
   max-width: none;
 }

 .loading-overlay,
 .notification,
 .header-actions,
 .filtros-section,
 .view-controls,
 .paginacion-info,
 .paginacion-completa,
 .acciones,
 .card-actions,
 .modal-overlay {
   display: none !important;
 }

 .page-header {
   margin-bottom: 1rem;
 }

 .cotizaciones-section {
   box-shadow: none;
   border: 1px solid #ddd;
 }

 .cotizaciones-tabla {
   font-size: 12px;
 }

 .cotizaciones-tabla th,
 .cotizaciones-tabla td {
   padding: 8px 4px;
 }

 .estado-badge {
   border: 1px solid #333;
   color: #333 !important;
   background: white !important;
 }

 .btn,
 .btn-accion {
   display: none;
 }
}

/* ==================== FOCUS STYLES FOR ACCESSIBILITY ==================== */
.btn:focus,
.btn-accion:focus,
.view-btn:focus,
.btn-pag:focus,
.btn-tipo:focus,
.search-input:focus,
.filter-select:focus,
.form-input:focus,
.form-textarea:focus,
.page-input:focus {
 outline: 2px solid #3498db;
 outline-offset: 2px;
}

.btn-close:focus {
 outline: 2px solid #e74c3c;
 outline-offset: 2px;
}

/* ==================== HIGH CONTRAST MODE SUPPORT ==================== */
@media (prefers-contrast: high) {
 .btn,
 .btn-accion,
 .estado-badge {
   border: 2px solid;
 }

 .modal-content {
   border: 2px solid #000;
 }

 .notification {
   border: 2px solid #fff;
 }
}

/* ==================== UTILS CLASSES ==================== */
.sr-only {
 position: absolute;
 width: 1px;
 height: 1px;
 padding: 0;
 margin: -1px;
 overflow: hidden;
 clip: rect(0, 0, 0, 0);
 white-space: nowrap;
 border: 0;
}

.no-scroll {
 overflow: hidden;
}

.text-truncate {
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}

.d-none {
 display: none !important;
}

.d-block {
 display: block !important;
}

.d-flex {
 display: flex !important;
}

.justify-center {
 justify-content: center !important;
}

.align-center {
 align-items: center !important;
}

.w-100 {
 width: 100% !important;
}

.h-100 {
 height: 100% !important;
}

.m-0 {
 margin: 0 !important;
}

.p-0 {
 padding: 0 !important;
}

.mt-1 {
 margin-top: 0.25rem !important;
}

.mb-1 {
 margin-bottom: 0.25rem !important;
}

.pt-1 {
 padding-top: 0.25rem !important;
}

.pb-1 {
 padding-bottom: 0.25rem !important;
}
</style>