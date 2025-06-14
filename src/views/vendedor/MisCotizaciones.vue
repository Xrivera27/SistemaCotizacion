<template>
  <div class="mis-cotizaciones-container">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Mis Cotizaciones</h1>
        <p class="page-subtitle">Gestiona y da seguimiento a todas tus cotizaciones</p>
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
            placeholder="Buscar por cliente, número de cotización..."
            class="search-input"
          />
        </div>
        
        <div class="filtros-grid">
          <select v-model="filtros.estado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="esperando">Esperando Aprobación</option>
            <option value="pendiente">Pendiente</option>
            <option value="efectivo">Efectivo</option>
            <option value="rechazado">Rechazado</option>
          </select>
          
          <select v-model="filtros.periodo" class="filter-select">
            <option value="">Todo el tiempo</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Este trimestre</option>
          </select>

          <select v-model="itemsPorPagina" class="filter-select" @change="cambiarItemsPorPagina">
            <option value="5">5 por página</option>
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
      
      <div class="stat-card efectivos">
        <div class="stat-content">
          <div class="stat-number">{{ estadisticas.efectivos }}</div>
          <div class="stat-label">Efectivos</div>
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
                <th @click="ordenarPor('fecha')" class="sortable">
                  Fecha
                  <span class="sort-icon">{{ getSortIcon('fecha') }}</span>
                </th>
                <th>Estado</th>
                <th @click="ordenarPor('total')" class="sortable">
                  Total
                  <span class="sort-icon">{{ getSortIcon('total') }}</span>
                </th>
                <th>PDF</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cotizacion in cotizacionesPaginadas" :key="cotizacion.id">
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
                  <span class="fecha">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
                </td>
                <td>
                  <span class="estado-badge" :class="cotizacion.estado">
                    {{ getEstadoTexto(cotizacion.estado) }}
                  </span>
                </td>
                <td>
                  <span class="monto">{{ formatearMoneda(cotizacion.total) }}</span>
                  <div v-if="cotizacion.estado === 'esperando'" class="monto-warning">
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
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn-accion editar"
                      @click="editarCotizacion(cotizacion)"
                      title="Editar"
                      :disabled="!puedeEditar(cotizacion)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="cotizacion.pdfGenerado"
                      class="btn-accion imprimir"
                      @click="imprimirCotizacion(cotizacion)"
                      title="Descargar PDF"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <button 
                      v-if="cotizacion.estado === 'esperando'"
                      class="btn-accion aprobar"
                      @click="solicitarAprobacion(cotizacion)"
                      title="Solicitar aprobación manual"
                    >
                      <i class="fas fa-hand-paper"></i>
                    </button>
                    <button 
                      class="btn-accion duplicar"
                      @click="duplicarCotizacion(cotizacion)"
                      title="Duplicar"
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
      <div v-if="vistaActual === 'tarjetas'" class="tarjetas-container">
        <div class="tarjetas-grid">
          <div 
            v-for="cotizacion in cotizacionesPaginadas" 
            :key="cotizacion.id"
            class="cotizacion-card"
          >
            <div class="card-header">
              <div class="card-numero">{{ cotizacion.numero }}</div>
              <span class="estado-badge" :class="cotizacion.estado">
                {{ getEstadoTexto(cotizacion.estado) }}
              </span>
            </div>
            
            <div class="card-content">
              <h3 class="cliente-nombre">{{ cotizacion.cliente.nombre }}</h3>
              <p class="cliente-email">{{ cotizacion.cliente.email }}</p>
              
              <div class="card-details">
                <div class="detail">
                  <span class="detail-label">Fecha:</span>
                  <span class="detail-value">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
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
              
              <div v-if="cotizacion.estado === 'esperando'" class="card-warning">
                <i class="fas fa-exclamation-triangle"></i> Esta cotización requiere aprobación manual por estar bajo el monto mínimo
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-sm btn-outline" @click="verCotizacion(cotizacion)">
                Ver
              </button>
              <button 
                class="btn btn-sm btn-primary" 
                @click="editarCotizacion(cotizacion)"
                :disabled="!puedeEditar(cotizacion)"
              >
                Editar
              </button>
              <button 
                v-if="cotizacion.pdfGenerado"
                class="btn btn-sm btn-secondary" 
                @click="imprimirCotizacion(cotizacion)"
              >
                PDF
              </button>
              <button 
                v-if="cotizacion.estado === 'esperando'"
                class="btn btn-sm btn-warning" 
                @click="solicitarAprobacion(cotizacion)"
              >
                Solicitar
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
            : 'Aún no has creado ninguna cotización.' }}
        </p>
        <button class="btn btn-primary" @click="nuevaCotizacion">
          Crear Primera Cotización
        </button>
      </div>

      <!-- Paginación mejorada -->
      <div v-if="totalPaginas > 1" class="paginacion-completa">
        <div class="paginacion">
          <!-- Botón Primera página -->
          <button 
            class="btn-pag"
            @click="irAPrimera"
            :disabled="paginaActual === 1"
            title="Primera página"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>

          <!-- Botón Anterior -->
          <button 
            class="btn-pag"
            @click="paginaActual = paginaActual - 1"
            :disabled="paginaActual === 1"
            title="Página anterior"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <!-- Páginas visibles -->
          <div class="paginas">
            <!-- Página 1 si no está en el rango visible -->
            <button
              v-if="paginasVisibles[0] > 1"
              class="btn-pag"
              @click="paginaActual = 1"
            >
              1
            </button>
            
            <!-- Separador si hay salto -->
            <span v-if="paginasVisibles[0] > 2" class="pagina-separador">...</span>
            
            <!-- Páginas del rango visible -->
            <button
              v-for="pagina in paginasVisibles"
              :key="pagina"
              class="btn-pag"
              :class="{ active: pagina === paginaActual }"
              @click="paginaActual = pagina"
            >
              {{ pagina }}
            </button>
            
            <!-- Separador si hay salto al final -->
            <span v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1" class="pagina-separador">...</span>
            
            <!-- Última página si no está en el rango visible -->
            <button
              v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas"
              class="btn-pag"
              @click="paginaActual = totalPaginas"
            >
              {{ totalPaginas }}
            </button>
          </div>
          
          <!-- Botón Siguiente -->
          <button 
            class="btn-pag"
            @click="paginaActual = paginaActual + 1"
            :disabled="paginaActual === totalPaginas"
            title="Página siguiente"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Botón Última página -->
          <button 
            class="btn-pag"
            @click="irAUltima"
            :disabled="paginaActual === totalPaginas"
            title="Última página"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>

        <!-- Información adicional de paginación -->
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
            </div>
            
            <div v-if="modalCotizacion.estado === 'esperando'" class="modal-warning">
              <h4><i class="fas fa-exclamation-triangle"></i> Requiere Aprobación</h4>
              <p>Esta cotización está bajo el monto mínimo y requiere aprobación manual del supervisor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MisCotizaciones',
  data() {
    return {
      vistaActual: 'tabla',
      modalCotizacion: null,
      paginaActual: 1,
      itemsPorPagina: 10,
      paginaSalto: 1,
      ordenActual: { campo: 'fecha', direccion: 'desc' },
      
      filtros: {
        busqueda: '',
        estado: '',
        periodo: ''
      },
      
      // Datos simulados con más cotizaciones para probar la paginación
      cotizaciones: [
        {
          id: 1,
          numero: 'COT-2024-001',
          cliente: {
            nombre: 'Empresa ABC S.A.',
            email: 'contacto@empresaabc.com',
            telefono: '+504 2234-5678'
          },
          fechaCreacion: '2024-01-15',
          estado: 'efectivo',
          total: 25000.00,
          items: 5,
          pdfGenerado: true
        },
        {
          id: 2,
          numero: 'COT-2024-002',
          cliente: {
            nombre: 'Constructora XYZ',
            email: 'info@xyz.com',
            telefono: '+504 2345-6789'
          },
          fechaCreacion: '2024-01-20',
          estado: 'pendiente',
          total: 35000.00,
          items: 8,
          pdfGenerado: true
        },
        {
          id: 3,
          numero: 'COT-2024-003',
          cliente: {
            nombre: 'Comercial DEF',
            email: 'ventas@def.com',
            telefono: '+504 2456-7890'
          },
          fechaCreacion: '2024-01-25',
          estado: 'esperando',
          total: 1500.00,
          items: 2,
          pdfGenerado: false
        },
        {
          id: 4,
          numero: 'COT-2024-004',
          cliente: {
            nombre: 'Industrias GHI',
            email: 'compras@ghi.com',
            telefono: '+504 2567-8901'
          },
          fechaCreacion: '2024-02-01',
          estado: 'rechazado',
          total: 45000.00,
          items: 12,
          pdfGenerado: true
        },
        {
          id: 5,
          numero: 'COT-2024-005',
          cliente: {
            nombre: 'Servicios JKL',
            email: 'info@jkl.com',
            telefono: '+504 2678-9012'
          },
          fechaCreacion: '2024-02-05',
          estado: 'esperando',
          total: 800.00,
          items: 1,
          pdfGenerado: false
        },
        {
          id: 6,
          numero: 'COT-2024-006',
          cliente: {
            nombre: 'Tech Solutions',
            email: 'contacto@techsol.com',
            telefono: '+504 2789-0123'
          },
          fechaCreacion: '2024-02-10',
          estado: 'pendiente',
          total: 18000.00,
          items: 6,
          pdfGenerado: true
        },
        // Agregamos más datos para probar la paginación
        ...Array.from({ length: 50 }, (_, i) => ({
          id: i + 7,
          numero: `COT-2024-${String(i + 7).padStart(3, '0')}`,
          cliente: {
            nombre: `Cliente ${i + 7}`,
            email: `cliente${i + 7}@email.com`,
            telefono: '+504 2000-0000'
          },
          fechaCreacion: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          estado: ['esperando', 'pendiente', 'efectivo', 'rechazado'][Math.floor(Math.random() * 4)],
          total: Math.floor(Math.random() * 50000) + 1000,
          items: Math.floor(Math.random() * 15) + 1,
          pdfGenerado: Math.random() > 0.3
        }))
      ]
    }
  },
  
  computed: {
    cotizacionesFiltradas() {
      let resultado = [...this.cotizaciones];
      
      // Filtro por búsqueda
      if (this.filtros.busqueda) {
        const busqueda = this.filtros.busqueda.toLowerCase();
        resultado = resultado.filter(cotizacion => 
          cotizacion.numero.toLowerCase().includes(busqueda) ||
          cotizacion.cliente.nombre.toLowerCase().includes(busqueda) ||
          cotizacion.cliente.email.toLowerCase().includes(busqueda)
        );
      }
      
      // Filtro por estado
      if (this.filtros.estado) {
        resultado = resultado.filter(cotizacion => 
          cotizacion.estado === this.filtros.estado
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
    
    rangoInicio() {
      return (this.paginaActual - 1) * this.itemsPorPagina + 1;
    },
    
    rangoFin() {
      return Math.min(this.paginaActual * this.itemsPorPagina, this.cotizacionesFiltradas.length);
    },
    
    estadisticas() {
      return {
        total: this.cotizaciones.length,
        esperandoAprobacion: this.cotizaciones.filter(c => c.estado === 'esperando').length,
        pendientes: this.cotizaciones.filter(c => c.estado === 'pendiente').length,
        efectivos: this.cotizaciones.filter(c => c.estado === 'efectivo').length,
        rechazados: this.cotizaciones.filter(c => c.estado === 'rechazado').length,
        montoTotal: this.cotizaciones
          .filter(c => c.estado === 'efectivo')
          .reduce((total, c) => total + c.total, 0)
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
    
    editarCotizacion(cotizacion) {
      this.$router.push(`/shared/cotizacion?edit=${cotizacion.id}`);
    },
    
    imprimirCotizacion(cotizacion) {
      if (!cotizacion.pdfGenerado) {
        alert('Esta cotización no tiene PDF generado');
        return;
      }
      console.log('Descargando PDF:', cotizacion.numero);
      alert(`Descargando PDF de ${cotizacion.numero}`);
    },
    
    duplicarCotizacion(cotizacion) {
      if (confirm(`¿Deseas crear una nueva cotización basada en ${cotizacion.numero}?`)) {
        this.$router.push(`/shared/cotizacion?duplicate=${cotizacion.id}`);
      }
    },
    
    solicitarAprobacion(cotizacion) {
      if (confirm(`¿Solicitar aprobación manual para ${cotizacion.numero}?`)) {
       console.log('Solicitando aprobación para:', cotizacion.numero);
       alert('Solicitud de aprobación enviada al supervisor');
     }
   },
   
   puedeEditar(cotizacion) {
     return ['esperando', 'pendiente'].includes(cotizacion.estado);
   },
   
   ordenarPor(campo) {
     if (this.ordenActual.campo === campo) {
       this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
     } else {
       this.ordenActual = { campo, direccion: 'asc' };
     }
   },
   
   getSortIcon(campo) {
     if (this.ordenActual.campo !== campo) return '↕️';
     return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
   },
   
   limpiarFiltros() {
     this.filtros = {
       busqueda: '',
       estado: '',
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
   
   getEstadoTexto(estado) {
     const estados = {
       esperando: 'Esperando Aprobación',
       pendiente: 'Pendiente',
       efectivo: 'Efectivo',
       rechazado: 'Rechazado'
     };
     return estados[estado] || estado;
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

.btn-accion.editar {
background: #f3e5f5;
color: #7b1fa2;
}

.btn-accion.editar:hover:not(:disabled) {
background: #e1bee7;
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

.btn-accion.aprobar {
 background: #fff3cd;
 color: #856404;
}

.btn-accion.aprobar:hover {
 background: #ffeaa7;
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

.btn-warning {
 background: #f39c12;
 color: white;
}

.btn-warning:hover {
 background: #e67e22;
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

.modal-content {
  margin: 0.5rem;
}

.btn-pag {
  min-width: 35px;
  padding: 0.375rem 0.5rem;
}

.estadisticas-grid {
  grid-template-columns: 1fr;
}
}
</style>