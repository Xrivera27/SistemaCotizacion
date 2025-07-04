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
          <th style="min-width: 200px;">Acciones</th>
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
            <span class="monto">{{ cotizacionService.formatPrice(cotizacion.total) }}</span>
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
                  class="btn-accion cancelar"
                  @click="cancelarCotizacion(cotizacion)"
                  title="Cancelar cotización"
                >
                  <i class="fas fa-times"></i>
                </button>
              </template>
              
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
            <span class="detail-value monto">{{ cotizacionService.formatPrice(cotizacion.total) }}</span>
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
          <strong>Total:</strong> {{ cotizacionService.formatPrice(modalCotizacion.total) }}
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
        <strong>{{ cotizacionService.formatNumeroCotizacion(cotizacionSeleccionada?.id) }}</strong> 
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

.monto {
font-weight: 600;
color: #27ae60;
font-family: monospace;
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

.fecha-auditoria {
font-size: 0.85em;
color: #6c757d;
font-weight: 400;
font-style: italic;
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

.card-actions .btn {
flex: 1;
justify-content: center;
min-width: 80px;
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

.modal-header .text-success {
color: #27ae60;
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

.modal-confirmacion {
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

.modal-actions {
flex-direction: column;
gap: 0.5rem;
}

.modal-actions .btn {
width: 100%;
justify-content: center;
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

.modal-actions {
flex-direction: column;
gap: 0.5rem;
width: 100%;
}

.modal-actions .btn {
width: 100%;
justify-content: center;
}
}
</style>