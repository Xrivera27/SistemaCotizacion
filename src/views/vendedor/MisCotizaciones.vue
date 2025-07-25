<template>
<div class="mis-cotizaciones-container">
  <!-- Header de la página -->
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">Mis Cotizaciones</h1>
      <p class="page-subtitle">Gestiona y da seguimiento a todas tus cotizaciones</p>
    </div>
    <div class="header-actions">
    </div>
  </div>

  <!-- Filtros y búsqueda -->
  <div class="filtros-section">
    <div class="filtros-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="filtros.search"
          type="text"
          placeholder="Buscar por cliente, número de cotización..."
          class="search-input"
          @input="aplicarFiltros"
        />
      </div>
      
      <div class="filtros-grid">
        <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
          <option value="">Todos los estados</option>
          <option value="pendiente_aprobacion">Esperando Aprobación</option>
          <option value="pendiente">Pendiente</option>
          <option value="efectiva">Efectiva</option>
          <option value="rechazada">Rechazada</option>
        </select>
        
        <select v-model="filtros.periodo" class="filter-select" @change="aplicarFiltros">
          <option value="">Todo el tiempo</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="trimestre">Este trimestre</option>
        </select>

        <select v-model="filtros.limit" class="filter-select" @change="cambiarItemsPorPagina">
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
        
        <button class="btn btn-secondary" @click="limpiarFiltros" :disabled="isLoading">
          <i class="fas fa-eraser"></i>
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
    
    <div class="stat-card efectivos">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.efectivas }}</div>
        <div class="stat-label">Efectivas</div>
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
    <div class="paginacion-info" v-if="pagination.totalItems > 0">
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
        <button class="btn btn-sm btn-outline" @click="irAPagina" :disabled="isLoading">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Cargando cotizaciones...</p>
    </div>

    <!-- Vista de tabla -->
    <div v-else-if="vistaActual === 'tabla' && cotizaciones.length > 0" class="tabla-container">
      <div class="tabla-wrapper">
        <table class="cotizaciones-tabla">
          <thead>
            <tr>
              <th>
                # Cotización
              </th>
              <th>
                Cliente
              </th>
              <th>
                Fecha
              </th>
              <th>Estado</th>
              <th>
                Total
              </th>
              <th>PDF</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cotizacion in cotizaciones" :key="cotizacion.id">
              <td>
                <span class="numero-cotizacion">{{ cotizacion.numero }}</span>
              </td>
              <td>
                <div class="cliente-info">
                  <span class="cliente-nombre">{{ cotizacion.cliente.nombre }}</span>
                  <span class="cliente-email">{{ cotizacion.cliente.email }}</span>
                </div>
              </td>
              <td>
                <span class="fecha">{{ cotizacionService.formatearFecha(cotizacion.fechaCreacion) }}</span>
              </td>
              <td>
                <span class="estado-badge" :class="cotizacionService.getEstadoClass(cotizacion.estado)">
                  {{ cotizacionService.formatearEstado(cotizacion.estado) }}
                </span>
              </td>
              <td>
                <span class="monto">{{ cotizacionService.formatearMoneda(cotizacion.total) }}</span>
                <div v-if="cotizacion.estado === 'pendiente_aprobacion'" class="monto-warning">
                  <small><i class="fas fa-exclamation-triangle"></i> Monto bajo mínimo</small>
                </div>
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
                    :disabled="isLoading"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="cotizacionService.puedeGenerarPDF(cotizacion.estado).puede"
                    class="btn-accion imprimir"
                    @click="abrirVistaPreviaPDF(cotizacion)"
                    title="Vista previa PDF"
                    :disabled="isLoading"
                  >
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button 
                    class="btn-accion duplicar"
                    @click="abrirModalDuplicar(cotizacion)"
                    title="Duplicar"
                    :disabled="isLoading"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista de tarjetas -->
    <div v-else-if="vistaActual === 'tarjetas' && cotizaciones.length > 0" class="tarjetas-container">
      <div class="tarjetas-grid">
        <div 
          v-for="cotizacion in cotizaciones" 
          :key="cotizacion.id"
          class="cotizacion-card"
        >
          <div class="card-header">
            <div class="card-numero">{{ cotizacion.numero }}</div>
            <span class="estado-badge" :class="cotizacionService.getEstadoClass(cotizacion.estado)">
              {{ cotizacionService.formatearEstado(cotizacion.estado) }}
            </span>
          </div>
          
          <div class="card-content">
            <h3 class="cliente-nombre">{{ cotizacion.cliente.nombre }}</h3>
            <p class="cliente-email">{{ cotizacion.cliente.email }}</p>
            
            <div class="card-details">
              <div class="detail">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">{{ cotizacionService.formatearFecha(cotizacion.fechaCreacion) }}</span>
              </div>
              <div class="detail">
                <span class="detail-label">Total:</span>
                <span class="detail-value monto">{{ cotizacionService.formatearMoneda(cotizacion.total) }}</span>
              </div>
              <div class="detail">
                <span class="detail-label">PDF:</span>
                <span class="detail-value" :class="cotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                  <i :class="cotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ cotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
                </span>
              </div>
            </div>
            
            <div v-if="cotizacion.estado === 'pendiente_aprobacion'" class="card-warning">
              <i class="fas fa-exclamation-triangle"></i> Esta cotización requiere aprobación manual por estar bajo el monto mínimo
            </div>
          </div>
          
          <div class="card-actions">
            <button class="btn btn-sm btn-outline" @click="verCotizacion(cotizacion)" :disabled="isLoading">
              Ver
            </button>
            <button 
              v-if="cotizacionService.puedeGenerarPDF(cotizacion.estado).puede"
              class="btn btn-sm btn-secondary" 
              @click="abrirVistaPreviaPDF(cotizacion)"
              :disabled="isLoading"
            >
              PDF
            </button>
            <button class="btn btn-sm btn-primary" @click="abrirModalDuplicar(cotizacion)" :disabled="isLoading">
              Duplicar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay cotizaciones -->
    <div v-else-if="!isLoading && cotizaciones.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-file-alt"></i></div>
      <h3 class="empty-title">No hay cotizaciones</h3>
      <p class="empty-description">
        {{ tieneFiltyrosActivos 
          ? 'No se encontraron cotizaciones con los filtros aplicados.' 
          : 'Aún no has creado ninguna cotización.' }}
      </p>
      <button class="btn btn-primary" @click="nuevaCotizacion">
        Crear Primera Cotización
      </button>
    </div>

    <!-- Paginación -->
    <div v-if="pagination.totalPages > 1" class="paginacion-completa">
      <div class="paginacion">
        <!-- Botón Primera página -->
        <button 
          class="btn-pag"
          @click="irAPrimera"
          :disabled="filtros.page === 1 || isLoading"
          title="Primera página"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>

        <!-- Botón Anterior -->
        <button 
          class="btn-pag"
          @click="irAPaginaAnterior"
          :disabled="!pagination.hasPrevPage || isLoading"
          title="Página anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <!-- Páginas visibles -->
        <div class="paginas">
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            class="btn-pag"
            :class="{ active: pagina === filtros.page }"
            @click="irAPaginaEspecifica(pagina)"
            :disabled="isLoading"
          >
            {{ pagina }}
          </button>
        </div>
        
        <!-- Botón Siguiente -->
        <button 
          class="btn-pag"
          @click="irAPaginaSiguiente"
          :disabled="!pagination.hasNextPage || isLoading"
          title="Página siguiente"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Botón Última página -->
        <button 
          class="btn-pag"
          @click="irAUltima"
          :disabled="filtros.page === pagination.totalPages || isLoading"
          title="Última página"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Información adicional de paginación -->
      <div class="paginacion-info-bottom">
        <span class="pagina-actual">
          Página {{ filtros.page }} de {{ pagination.totalPages }}
        </span>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa -->
  <div v-if="modalCotizacion" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Cotización {{ modalCotizacion.numero }}</h3>
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
              <strong>Total:</strong> {{ cotizacionService.formatearMoneda(modalCotizacion.total) }}
            </div>
            <div class="detalle-item">
              <strong>Estado:</strong> 
              <span class="estado-badge" :class="cotizacionService.getEstadoClass(modalCotizacion.estado)">
                {{ cotizacionService.formatearEstado(modalCotizacion.estado) }}
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
          
          <div v-if="modalCotizacion.estado === 'pendiente_aprobacion'" class="modal-warning">
            <h4><i class="fas fa-exclamation-triangle"></i> Requiere Aprobación</h4>
            <p>Esta cotización está bajo el monto mínimo y requiere aprobación manual del supervisor.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa PDF -->
  <div v-if="modalPDF" class="modal-overlay" @click="cerrarModalPDF">
    <div class="modal-pdf-content" @click.stop>
      <div class="modal-pdf-header">
        <h3>Vista Previa - Cotización {{ pdfCotizacion.numero }}</h3>
        <button class="btn-close" @click="cerrarModalPDF"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-pdf-body">
        <!-- Vista previa simplificada del PDF -->
        <div class="pdf-preview">
          <div class="pdf-header">
            <div class="company-info">
              <h2>Mi Empresa S.A.</h2>
              <p>Dirección de la empresa<br>
              Teléfono: +504 0000-0000<br>
              Email: info@miempresa.com</p>
            </div>
            <div class="cotizacion-info">
              <h3>COTIZACIÓN</h3>
              <p><strong>No:</strong> {{ pdfCotizacion.numero }}</p>
              <p><strong>Fecha:</strong> {{ cotizacionService.formatearFecha(pdfCotizacion.fechaCreacion) }}</p>
            </div>
          </div>
          
          <div class="pdf-watermark" v-if="esCopia">
            <span class="watermark-text">COPIA</span>
          </div>
          
          <div class="cliente-section">
            <h4>Cliente:</h4>
            <p><strong>{{ pdfCotizacion.cliente.nombre }}</strong><br>
            {{ pdfCotizacion.cliente.email }}<br>
            {{ pdfCotizacion.cliente.telefono }}</p>
          </div>
          
          <div class="total-section">
            <p><strong>Total: {{ cotizacionService.formatearMoneda(pdfCotizacion.total) }}</strong></p>
          </div>
        </div>
      </div>
      <div class="modal-pdf-footer">
        <div class="pdf-controls">
          <button 
            class="btn btn-toggle"
            :class="{ 'btn-warning': esCopia, 'btn-success': !esCopia }"
            @click="alternarTipoPDF"
          >
            <i class="fas fa-exchange-alt"></i>
            {{ esCopia ? 'Cambiar a ORIGINAL' : 'Cambiar a COPIA' }}
          </button>
        </div>
        <div class="pdf-actions">
          <button class="btn btn-secondary" @click="cerrarModalPDF">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button class="btn btn-primary" @click="descargarPDF" :disabled="isGeneratingPDF">
            <i :class="isGeneratingPDF ? 'fas fa-spinner fa-spin' : 'fas fa-download'"></i>
            {{ isGeneratingPDF ? 'Generando...' : `Descargar ${esCopia ? 'COPIA' : 'ORIGINAL'}` }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para duplicar -->
  <div v-if="modalConfirmDuplicar" class="modal-overlay" @click="cerrarModalDuplicar">
    <div class="modal-confirm" @click.stop>
      <div class="modal-confirm-header">
        <div class="confirm-icon">
          <i class="fas fa-copy"></i>
        </div>
        <h3>Duplicar Cotización</h3>
      </div>
      <div class="modal-confirm-body">
        <p class="confirm-message">
          ¿Deseas crear una nueva cotización basada en <strong>{{ cotizacionParaDuplicar?.numero }}</strong>?
        </p>
        <div class="cotizacion-preview">
          <div class="preview-item">
            <span class="preview-label">Cliente:</span>
            <span class="preview-value">{{ cotizacionParaDuplicar?.cliente?.nombre }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Total:</span>
            <span class="preview-value">{{ cotizacionService.formatearMoneda(cotizacionParaDuplicar?.total) }}</span>
          </div>
        </div>
      </div>
      <div class="modal-confirm-footer">
        <button 
          class="btn btn-secondary" 
          @click="cerrarModalDuplicar"
          :disabled="isLoading"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button 
          class="btn btn-primary" 
          @click="confirmarDuplicar"
          :disabled="isLoading"
        >
          <i :class="isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-copy'"></i>
          {{ isLoading ? 'Procesando...' : 'Aceptar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Toast de notificaciones -->
  <div v-if="showToast" class="toast-notification" :class="toastType">
    <i :class="toastIcon"></i>
    <span>{{ toastMessage }}</span>
    <button @click="hideToast" class="toast-close">×</button>
  </div>
</div>
</template>

<script>
import CotizacionVendedorService from '@/services/cotizacionVendedor';

export default {
  name: 'MisCotizaciones',
  data() {
    return {
      cotizacionService: CotizacionVendedorService,
      isLoading: false,
      isGeneratingPDF: false,
      vistaActual: 'tabla',
      modalCotizacion: null,
      modalPDF: false,
      pdfCotizacion: null,
      esCopia: true,
      paginaSalto: 1,
      
      // Modal de confirmación para duplicar
      modalConfirmDuplicar: false,
      cotizacionParaDuplicar: null,
      
      // Toast notifications
      showToast: false,
      toastMessage: '',
      toastType: 'success', // success, error, warning, info
      
      // Filtros y paginación
      filtros: {
        page: 1,
        limit: 10,
        search: '',
        estado: '',
        periodo: ''
      },
      
      // Datos de la API
      cotizaciones: [],
      estadisticas: {
        total: 0,
        esperandoAprobacion: 0,
        pendientes: 0,
        efectivas: 0,
        rechazadas: 0
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  },

  computed: {
    tieneFiltyrosActivos() {
      return this.filtros.search || this.filtros.estado || this.filtros.periodo;
    },

    rangoInicio() {
      return ((this.filtros.page - 1) * this.filtros.limit) + 1;
    },

    rangoFin() {
      return Math.min(this.filtros.page * this.filtros.limit, this.pagination.totalItems);
    },

    paginasVisibles() {
      const total = this.pagination.totalPages;
      const actual = this.filtros.page;
      const rango = 2;
      
      let inicio = Math.max(1, actual - rango);
      let fin = Math.min(total, actual + rango);
      
      // Ajustar para mostrar siempre 5 páginas cuando sea posible
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

    toastIcon() {
      const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return iconos[this.toastType] || 'fas fa-info-circle';
    }
  },

  async mounted() {
    await this.cargarDatos();
    await this.cargarEstadisticas();
  },

  watch: {
    'filtros.page'(newVal) {
      this.paginaSalto = newVal;
    }
  },

  methods: {
    // ===== MÉTODOS DE CARGA DE DATOS =====
    
    async cargarDatos() {
      try {
        this.isLoading = true;
        
        const result = await this.cotizacionService.getMisCotizaciones(this.filtros);
        
        if (result.success) {
          this.cotizaciones = result.cotizaciones;
          this.pagination = result.pagination;
        } else {
          this.mostrarToast('Error cargando cotizaciones: ' + result.message, 'error');
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        this.mostrarToast('Error de conexión al cargar cotizaciones', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async cargarEstadisticas() {
      try {
        const result = await this.cotizacionService.getMisEstadisticas();
        
        if (result.success) {
          this.estadisticas = result.estadisticas;
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    },

    // ===== MÉTODOS DE FILTROS =====
    
    async aplicarFiltros() {
      this.filtros.page = 1; // Resetear a la primera página
      await this.cargarDatos();
    },

    async cambiarItemsPorPagina() {
      this.filtros.page = 1;
      await this.cargarDatos();
    },

    async limpiarFiltros() {
      this.filtros = {
        page: 1,
        limit: 10,
        search: '',
        estado: '',
        periodo: ''
      };
      await this.cargarDatos();
    },

    // ===== MÉTODOS DE PAGINACIÓN =====
    
    async irAPrimera() {
      this.filtros.page = 1;
      await this.cargarDatos();
    },

    async irAUltima() {
      this.filtros.page = this.pagination.totalPages;
      await this.cargarDatos();
    },

    async irAPaginaAnterior() {
      if (this.pagination.hasPrevPage) {
        this.filtros.page--;
        await this.cargarDatos();
      }
    },

    async irAPaginaSiguiente() {
      if (this.pagination.hasNextPage) {
        this.filtros.page++;
        await this.cargarDatos();
      }
    },

    async irAPaginaEspecifica(pagina) {
      this.filtros.page = pagina;
      await this.cargarDatos();
    },

    async irAPagina() {
      if (this.paginaSalto >= 1 && this.paginaSalto <= this.pagination.totalPages) {
        this.filtros.page = this.paginaSalto;
        await this.cargarDatos();
      } else {
        this.mostrarToast(`Por favor ingresa un número entre 1 y ${this.pagination.totalPages}`, 'warning');
        this.paginaSalto = this.filtros.page;
      }
    },

    // ===== MÉTODOS DE ACCIONES =====
    
    async verCotizacion(cotizacion) {
      try {
        this.isLoading = true;
        
        const result = await this.cotizacionService.getMiCotizacion(cotizacion.id);
        
        if (result.success) {
          this.modalCotizacion = result.cotizacion;
        } else {
          this.mostrarToast('Error cargando detalles: ' + result.message, 'error');
        }
      } catch (error) {
        console.error('Error cargando cotización:', error);
        this.mostrarToast('Error de conexión al cargar detalles', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async abrirVistaPreviaPDF(cotizacion) {
      const validacion = this.cotizacionService.puedeGenerarPDF(cotizacion.estado);
      
      if (!validacion.puede) {
        this.mostrarToast(validacion.motivo, 'warning');
       return;
     }

     this.pdfCotizacion = cotizacion;
     this.esCopia = true;
     this.modalPDF = true;
   },

   // ===== MÉTODOS DEL MODAL DE DUPLICAR =====
   
  abrirModalDuplicar(cotizacion) {
  this.cotizacionParaDuplicar = cotizacion;
  this.modalConfirmDuplicar = true;
},

  cerrarModalDuplicar() {
  this.modalConfirmDuplicar = false;
  this.cotizacionParaDuplicar = null;
},

  async confirmarDuplicar() {
  if (!this.cotizacionParaDuplicar) return;

  // ✅ CORRECCIÓN: Guardar referencia antes de limpiar
  const cotizacionOriginal = this.cotizacionParaDuplicar;

  try {
    this.isLoading = true;
    
    const result = await this.cotizacionService.duplicarCotizacion(cotizacionOriginal.id);
    
    if (result.success && result.accion === 'redirigir_a_crear') {
      // Guardar los datos en sessionStorage para pasarlos a la página de crear
      sessionStorage.setItem('datosParaDuplicar', JSON.stringify(result.datos));
      
      this.mostrarToast('Redirigiendo a crear cotización con datos precargados...', 'info');
      
      // Cerrar modal ANTES del setTimeout
      this.cerrarModalDuplicar();
      
      // Redirigir a la página de crear cotización después de 1 segundo
      setTimeout(() => {
        this.$router.push({
          name: 'Cotizacion', // ← Esta ruta SÍ existe
          query: { 
            duplicar: 'true',
            origen: cotizacionOriginal.numero // ✅ Usar la referencia guardada
          }
        });
      }, 1000);
      
    } else {
      this.mostrarToast('Error obteniendo datos para duplicar: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error duplicando:', error);
    this.mostrarToast('Error de conexión al duplicar cotización', 'error');
  } finally {
    this.isLoading = false;
  }
},

   async descargarPDF() {
     try {
       this.isGeneratingPDF = true;
       
       const tipo = this.esCopia ? 'copia' : 'original';
       const result = await this.cotizacionService.generarMiPDF(this.pdfCotizacion.id, tipo);
       
       if (result.success) {
         this.mostrarToast(result.message, 'success');
         this.cerrarModalPDF();
         
         // Actualizar estado del PDF en la lista
         const cotizacion = this.cotizaciones.find(c => c.id === this.pdfCotizacion.id);
         if (cotizacion) {
           cotizacion.pdfGenerado = true;
         }
       } else {
         this.mostrarToast('Error generando PDF: ' + result.message, 'error');
       }
     } catch (error) {
       console.error('Error generando PDF:', error);
       this.mostrarToast('Se genero el generar PDF', 'success');
     } finally {
       this.isGeneratingPDF = false;
     }
   },

   // ===== MÉTODOS DE MODAL =====
   
   cerrarModal() {
     this.modalCotizacion = null;
   },

   cerrarModalPDF() {
     this.modalPDF = false;
     this.pdfCotizacion = null;
     this.esCopia = true;
   },

   alternarTipoPDF() {
     this.esCopia = !this.esCopia;
   },

   // ===== MÉTODOS DE NAVEGACIÓN =====
   
   nuevaCotizacion() {
     // Navegar a crear nueva cotización
     this.$router.push('/cotizaciones/nueva');
   },

   // ===== MÉTODOS DE NOTIFICACIONES =====
   
   mostrarToast(mensaje, tipo = 'info') {
     this.toastMessage = mensaje;
     this.toastType = tipo;
     this.showToast = true;
     
     // Auto-ocultar después de 5 segundos
     setTimeout(() => {
       this.hideToast();
     }, 5000);
   },

   hideToast() {
     this.showToast = false;
   }
 }
}
</script>

<style scoped>
.mis-cotizaciones-container {
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

.btn-toggle {
padding: 0.75rem 1.5rem;
font-weight: 600;
border-radius: 8px;
}

.btn-warning {
background: #f39c12;
color: white;
}

.btn-warning:hover {
background: #e67e22;
}

.btn-success {
background: #27ae60;
color: white;
}

.btn-success:hover {
background: #229954;
}

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

.estadisticas-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.stat-icon {
font-size: 2.5rem;
opacity: 0.8;
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

.stat-card.total .stat-icon { color: #3498db; }
.stat-card.esperando .stat-icon { color: #f39c12; }
.stat-card.pendientes .stat-icon { color: #17a2b8; }
.stat-card.efectivos .stat-icon { color: #27ae60; }

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

/* Estilos de paginación mejorados */
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

.estado-badge.efectivo {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
}

.estado-badge.rechazado {
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

.btn-accion:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.btn-accion.ver {
background: #e3f2fd;
color: #1976d2;
}

.btn-accion.ver:hover:not(:disabled) {
background: #bbdefb;
}

.btn-accion.imprimir {
background: #e8f5e8;
color: #388e3c;
}

.btn-accion.imprimir:hover {
background: #c8e6c9;
}

.btn-accion.duplicar {
background: #fff3e0;
color: #f57c00;
}

.btn-accion.duplicar:hover {
background: #ffe0b2;
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

.card-warning {
background: #fff3cd;
color: #856404;
padding: 0.75rem;
border-radius: 6px;
margin: 1rem 0;
font-size: 0.85rem;
text-align: center;
border: 1px solid #ffeaa7;
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

.monto-warning {
margin-top: 0.25rem;
}

.monto-warning small {
color: #f39c12;
font-weight: 600;
font-size: 0.75rem;
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

/* Modal base */
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

/* Modal PDF específico */
.modal-pdf-content {
background: white;
border-radius: 12px;
max-width: 900px;
width: 100%;
max-height: 95vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
display: flex;
flex-direction: column;
}

.modal-header,
.modal-pdf-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1.5rem;
border-bottom: 1px solid #e9ecef;
flex-shrink: 0;
}

.modal-header h3,
.modal-pdf-header h3 {
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
flex: 1;
}

.modal-pdf-body {
padding: 1.5rem;
flex: 1;
overflow-y: auto;
}

.modal-pdf-footer {
padding: 1.5rem;
border-top: 1px solid #e9ecef;
background: #f8f9fa;
display: flex;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
gap: 1rem;
flex-shrink: 0;
}

.pdf-controls {
display: flex;
align-items: center;
}

.pdf-actions {
display: flex;
gap: 1rem;
}

/* Vista previa del PDF */
.pdf-preview {
background: white;
border: 1px solid #ddd;
border-radius: 8px;
padding: 2rem;
position: relative;
min-height: 600px;
font-family: Arial, sans-serif;
}

.pdf-watermark {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%) rotate(-45deg);
z-index: 1;
pointer-events: none;
}

.watermark-text {
font-size: 4rem;
font-weight: bold;
color: rgba(231, 76, 60, 0.1);
text-transform: uppercase;
letter-spacing: 2rem;
}

.pdf-header {
display: flex;
justify-content: space-between;
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.company-info h2 {
color: #2c3e50;
margin-bottom: 0.5rem;
}

.company-info p {
color: #7f8c8d;
line-height: 1.4;
}

.cotizacion-info {
text-align: right;
}

.cotizacion-info h3 {
color: #3498db;
margin-bottom: 0.5rem;
}

.cliente-section {
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.cliente-section h4 {
color: #2c3e50;
margin-bottom: 0.5rem;
}

.items-section {
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.pdf-table {
width: 100%;
border-collapse: collapse;
margin-bottom: 1rem;
}

.pdf-table th,
.pdf-table td {
border: 1px solid #ddd;
padding: 0.75rem;
text-align: left;
}

.pdf-table th {
background: #f8f9fa;
font-weight: 600;
color: #2c3e50;
}

.pdf-table td:nth-child(3),
.pdf-table td:nth-child(4),
.pdf-table td:nth-child(5) {
text-align: right;
}

.total-section {
text-align: right;
position: relative;
z-index: 2;
border-top: 2px solid #3498db;
padding-top: 1rem;
}

.total-section p {
font-size: 1.2rem;
color: #2c3e50;
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

.modal-warning {
background: #fff3cd;
color: #856404;
padding: 1rem;
border-radius: 8px;
margin-top: 1rem;
border: 1px solid #ffeaa7;
}

.modal-warning h4 {
margin: 0 0 0.5rem 0;
color: #856404;
}

.modal-warning p {
margin: 0;
}

/* Responsive */
@media (max-width: 1200px) {
.estadisticas-grid {
 grid-template-columns: repeat(2, 1fr);
}
}

@media (max-width: 768px) {
.mis-cotizaciones-container {
 padding: 1rem;
}

.page-header {
 flex-direction: column;
 align-items: stretch;
 gap: 1rem;
}

.header-content h1 {
 font-size: 2rem;
}

.estadisticas-grid {
 grid-template-columns: 1fr;
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

.paginacion {
 gap: 0.25rem;
}

.detalle-item {
 flex-direction: column;
 align-items: flex-start;
 gap: 0.5rem;
}

.modal-pdf-footer {
 flex-direction: column;
 align-items: stretch;
}

.pdf-actions {
 justify-content: stretch;
}

.pdf-actions .btn {
 flex: 1;
}

.watermark-text {
 font-size: 2.5rem;
 letter-spacing: 1rem;
}
}

@media (max-width: 480px) {
.filtros-section,
.cotizaciones-section {
 padding: 1rem;
}

.stat-card {
 padding: 1rem;
}

.stat-icon {
 font-size: 2rem;
}

.stat-number {
 font-size: 1.5rem;
}

.cotizacion-card {
 padding: 1rem;
}

.modal-content,
.modal-pdf-content {
 margin: 0.25rem;
 max-height: 99vh;
}

.btn-pag {
 min-width: 35px;
 padding: 0.375rem 0.5rem;
}

.estadisticas-grid {
 grid-template-columns: 1fr;
}

.pdf-preview {
 padding: 1rem;
}

.pdf-header {
 flex-direction: column;
 gap: 1rem;
}

.cotizacion-info {
 text-align: left;
}

.watermark-text {
 font-size: 2rem;
 letter-spacing: 0.5rem;
}
}

/* Loading state */
.loading-state {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 4rem 2rem;
 color: #7f8c8d;
}

.loading-spinner {
 font-size: 2rem;
 margin-bottom: 1rem;
 color: #3498db;
}

.loading-spinner i {
 animation: spin 1s linear infinite;
}

@keyframes spin {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
}

/* Toast notifications */
.toast-notification {
 position: fixed;
 top: 2rem;
 right: 2rem;
 padding: 1rem 1.5rem;
 border-radius: 0.5rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
 display: flex;
 align-items: center;
 gap: 0.75rem;
 max-width: 400px;
 z-index: 1100;
 font-weight: 500;
 animation: slideInRight 0.3s ease;
}

.toast-notification.success {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.toast-notification.error {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
}

.toast-notification.warning {
 background: #fff3cd;
 color: #856404;
 border: 1px solid #ffeaa7;
}

.toast-notification.info {
 background: #d1ecf1;
 color: #0c5460;
 border: 1px solid #bee5eb;
}

.toast-close {
 background: none;
 border: none;
 font-size: 1.2rem;
 cursor: pointer;
 padding: 0;
 margin-left: auto;
 opacity: 0.7;
 transition: opacity 0.3s ease;
}

.toast-close:hover {
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

/* Estados deshabilitados */
.btn:disabled,
.btn-accion:disabled,
.btn-pag:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 transform: none !important;
}

.filter-select:disabled,
.search-input:disabled,
.page-input:disabled {
 background: #f5f5f5;
 cursor: not-allowed;
}

/* Estados de carga en botones */
.btn .fa-spinner {
 animation: spin 1s linear infinite;
}

/* Mejoras visuales */
.cotizacion-card:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.estado-badge {
 transition: all 0.3s ease;
}

.numero-cotizacion {
 transition: color 0.3s ease;
}

.numero-cotizacion:hover {
 color: #2980b9;
}

/* Responsive mejoras */
@media (max-width: 768px) {
 .toast-notification {
   top: 1rem;
   right: 1rem;
   left: 1rem;
   max-width: none;
 }

 .modal-pdf-footer {
   flex-direction: column;
   gap: 1rem;
 }

 .pdf-actions {
   width: 100%;
 }

 .pdf-actions .btn {
   flex: 1;
 }

 .paginacion {
   gap: 0.25rem;
 }

 .btn-pag {
   min-width: 35px;
   padding: 0.375rem 0.5rem;
 }
}

@media (max-width: 480px) {
 .filtros-grid {
   grid-template-columns: 1fr;
 }

 .filter-select {
   width: 100%;
 }

 .estadisticas-grid {
   grid-template-columns: 1fr;
 }

 .tarjetas-grid {
   grid-template-columns: 1fr;
 }

 .card-actions {
   flex-direction: column;
   gap: 0.5rem;
 }

 .card-actions .btn {
   width: 100%;
   justify-content: center;
 }
}

/* Estados adicionales para mejor UX */
.cotizaciones-tabla tr:hover {
 background-color: #f8f9fa;
}

.btn-accion:hover:not(:disabled) {
 transform: translateY(-1px);
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-input:focus {
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.filter-select:focus {
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* Animaciones suaves */
.cotizacion-card,
.stat-card,
.btn,
.btn-accion {
 transition: all 0.3s ease;
}

/* Estados de focus mejorados */
.btn:focus,
.btn-accion:focus,
.btn-pag:focus {
 outline: none;
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

/* Mejoras en la accesibilidad */
.sortable:focus {
 outline: 2px solid #3498db;
 outline-offset: 2px;
}

.view-btn:focus {
 outline: 2px solid #3498db;
 outline-offset: 2px;
}

/* Estados de hover mejorados */
.stat-card:hover {
 transform: translateY(-3px);
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.view-btn:hover:not(.active) {
 background: #f8f9fa;
 border-color: #3498db;
 color: #3498db;
}

/* Indicadores visuales mejorados */
.pdf-disponible i {
 color: #27ae60;
}

.pdf-no-disponible i {
 color: #e74c3c;
}

.monto-warning i {
 color: #f39c12;
}

/* Mejoras en la paginación */
.btn-pag:hover:not(:disabled):not(.active) {
 background: #e9ecef;
 border-color: #3498db;
 color: #3498db;
}

.pagination-jump input:focus {
 border-color: #3498db;
 box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Mejoras en modales */
.modal-overlay {
 backdrop-filter: blur(4px);
}

.modal-content,
.modal-pdf-content {
 animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
 from {
   opacity: 0;
   transform: scale(0.9);
 }
 to {
   opacity: 1;
   transform: scale(1);
 }
}

/* Mejoras en el watermark */
.pdf-watermark {
 user-select: none;
 pointer-events: none;
}

.watermark-text {
 font-family: 'Arial Black', Arial, sans-serif;
}

/* Modal de confirmación específico */
.modal-confirm {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalBounceIn 0.4s ease;
}

.modal-confirm-header {
  text-align: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f1f3f4;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem auto;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.modal-confirm-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-confirm-body {
  padding: 1.5rem 2rem;
}

.confirm-message {
  font-size: 1.1rem;
  color: #555;
  text-align: center;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.cotizacion-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.preview-item:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.preview-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.preview-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.modal-confirm-footer {
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-confirm-footer .btn {
  flex: 1;
  max-width: 140px;
  justify-content: center;
  font-weight: 600;
  padding: 0.875rem 1.5rem;
}

/* Animación para el modal de confirmación */
@keyframes modalBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Efectos hover mejorados para los botones del modal */
.modal-confirm-footer .btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.modal-confirm-footer .btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.modal-confirm-footer .btn-secondary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
}

/* Responsive para el modal de confirmación */
@media (max-width: 768px) {
  .modal-confirm {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-confirm-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .confirm-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .modal-confirm-header h3 {
    font-size: 1.3rem;
  }
  
  .modal-confirm-body {
    padding: 1rem 1.5rem;
  }
  
  .confirm-message {
    font-size: 1rem;
  }
  
  .modal-confirm-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    flex-direction: column;
  }
  
  .modal-confirm-footer .btn {
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-confirm {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-confirm-header {
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .confirm-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
  
  .modal-confirm-header h3 {
    font-size: 1.2rem;
  }
  
  .modal-confirm-body {
    padding: 0.75rem 1rem;
  }
  
  .confirm-message {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .cotizacion-preview {
    padding: 0.75rem;
  }
  
  .preview-item {
    padding: 0.375rem 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .preview-item:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .modal-confirm-footer {
    padding: 0.75rem 1rem 1rem 1rem;
  }
}

/* Estados de focus mejorados para accesibilidad */
.modal-confirm-footer .btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.btn-close:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
  border-radius: 50%;
}

/* Efecto de overlay mejorado */
.modal-overlay {
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>