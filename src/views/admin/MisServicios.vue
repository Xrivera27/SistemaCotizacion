<template>
  <div class="admin-servicios-container">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Gestión de Servicios</h1>
        <p class="page-subtitle">Administración y control de todos los servicios del sistema</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="nuevoServicio">
          <i class="fas fa-plus btn-icon"></i>
          Nuevo Servicio
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
            placeholder="Buscar por nombre o descripción..."
            class="search-input"
          />
        </div>
        
        <div class="filtros-grid">
          <select v-model="filtros.rangoPrecio" class="filter-select">
            <option value="">Todos los rangos</option>
            <option value="bajo">Bajo (menos de L. 5,000)</option>
            <option value="medio">Medio (L. 5,000 - L. 20,000)</option>
            <option value="alto">Alto (más de L. 20,000)</option>
          </select>
          
          <select v-model="filtros.estado" class="filter-select">
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

    <!-- Estadísticas rápidas -->
    <div class="estadisticas-grid">
      <div class="stat-card total">
        <div class="stat-content">
          <div class="stat-number">{{ estadisticas.total }}</div>
          <div class="stat-label">Total Servicios</div>
        </div>
      </div>
      
      <div class="stat-card activos">
        <div class="stat-content">
          <div class="stat-number">{{ estadisticas.activos }}</div>
          <div class="stat-label">Servicios Activos</div>
        </div>
      </div>

      <div class="stat-card inactivos">
        <div class="stat-content">
          <div class="stat-number">{{ estadisticas.inactivos }}</div>
          <div class="stat-label">Servicios Inactivos</div>
        </div>
      </div>
    </div>

    <!-- Servicios section -->
    <div class="servicios-section">
      <div class="section-header">
        <h2 class="section-title">
          {{ serviciosFiltrados.length }} Servicios encontrados
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
          Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ serviciosFiltrados.length }} servicios
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
          <table class="servicios-tabla">
            <thead>
              <tr>
                <th @click="ordenarPor('id')" class="sortable">
                  ID
                  <span class="sort-icon">{{ getSortIcon('id') }}</span>
                </th>
                <th @click="ordenarPor('nombre')" class="sortable">
                  Nombre
                  <span class="sort-icon">{{ getSortIcon('nombre') }}</span>
                </th>
                <th>Descripción</th>
                <th @click="ordenarPor('precioMinimo')" class="sortable">
                  Precio Mínimo
                  <span class="sort-icon">{{ getSortIcon('precioMinimo') }}</span>
                </th>
                <th @click="ordenarPor('precioRecomendado')" class="sortable">
                  Precio Recomendado
                  <span class="sort-icon">{{ getSortIcon('precioRecomendado') }}</span>
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="servicio in serviciosPaginados" :key="servicio.id">
                <td>
                  <span class="servicio-id">#{{ String(servicio.id).padStart(4, '0') }}</span>
                </td>
                <td>
                  <div class="servicio-info">
                    <span class="servicio-nombre">{{ servicio.nombre }}</span>
                  </div>
                </td>
                <td>
                  <div class="descripcion-info">
                    <span class="descripcion-texto">{{ truncarTexto(servicio.descripcion, 80) }}</span>
                  </div>
                </td>
                <td>
                  <span class="precio minimo">{{ formatearMoneda(servicio.precioMinimo) }}</span>
                </td>
                <td>
                  <span class="precio recomendado">{{ formatearMoneda(servicio.precioRecomendado) }}</span>
                </td>
                <td>
                  <span class="estado-badge" :class="servicio.estado">
                    {{ getEstadoTexto(servicio.estado) }}
                  </span>
                </td>
                <td>
                  <div class="acciones">
                    <button 
                      class="btn-accion ver"
                      @click="verServicio(servicio)"
                      title="Ver detalles"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn-accion editar"
                      @click="editarServicio(servicio)"
                      title="Editar servicio"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-accion" 
                      :class="servicio.estado === 'activo' ? 'deshabilitar' : 'habilitar'"
                      @click="cambiarEstadoServicio(servicio)"
                      :title="servicio.estado === 'activo' ? 'Desactivar servicio' : 'Activar servicio'"
                    >
                      <i :class="servicio.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
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
            v-for="servicio in serviciosPaginados" 
            :key="servicio.id"
            class="servicio-card"
          >
            <div class="card-header">
              <div class="card-numero">#{{ String(servicio.id).padStart(4, '0') }}</div>
              <span class="estado-badge" :class="servicio.estado">
                {{ getEstadoTexto(servicio.estado) }}
              </span>
            </div>
            
            <div class="card-content">
              <h3 class="servicio-nombre-card">
                <i class="fas fa-cogs"></i>
                {{ servicio.nombre }}
              </h3>
              
              <div class="descripcion-card">
                <p>{{ servicio.descripcion }}</p>
              </div>
              
              <div class="precios-card">
                <div class="precio-item">
                  <span class="precio-label">
                    <i class="fas fa-tag"></i>
                    Precio Mínimo:
                  </span>
                  <span class="precio-valor minimo">{{ formatearMoneda(servicio.precioMinimo) }}</span>
                </div>
                
                <div class="precio-item">
                  <span class="precio-label">
                    <i class="fas fa-star"></i>
                    Precio Recomendado:
                  </span>
                  <span class="precio-valor recomendado">{{ formatearMoneda(servicio.precioRecomendado) }}</span>
                </div>
                
                <div class="precio-item">
                  <span class="precio-label">
                    <i class="fas fa-calendar-alt"></i>
                    Fecha Creación:
                  </span>
                  <span class="precio-valor">{{ formatearFecha(servicio.fechaCreacion) }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-sm btn-outline" @click="verServicio(servicio)">
                <i class="fas fa-eye"></i>
                Ver Detalles
              </button>
              <button class="btn btn-sm btn-primary" @click="editarServicio(servicio)">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button 
                class="btn btn-sm"
                :class="servicio.estado === 'activo' ? 'btn-danger' : 'btn-success'"
                @click="cambiarEstadoServicio(servicio)"
              >
                <i :class="servicio.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
                {{ servicio.estado === 'activo' ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay servicios -->
      <div v-if="serviciosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fas fa-cogs"></i></div>
        <h3 class="empty-title">No hay servicios</h3>
        <p class="empty-description">
          {{ filtros.busqueda || filtros.rangoPrecio || filtros.estado 
            ? 'No se encontraron servicios con los filtros aplicados.' 
            : 'Aún no se han registrado servicios en el sistema.' }}
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
    <div v-if="modalServicio" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Servicio #{{ String(modalServicio.id).padStart(4, '0') }} - {{ modalServicio.nombre }}</h3>
          <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="servicio-detalle">
            <div class="detalle-grid">
              <div class="detalle-item">
                <strong><i class="fas fa-cogs"></i> Nombre:</strong> {{ modalServicio.nombre }}
              </div>
              <div class="detalle-item descripcion-completa">
                <strong><i class="fas fa-align-left"></i> Descripción:</strong> 
                <span class="descripcion-texto">{{ modalServicio.descripcion }}</span>
              </div>
              <div class="detalle-item">
                <strong><i class="fas fa-tag"></i> Precio Mínimo:</strong> {{ formatearMoneda(modalServicio.precioMinimo) }}
              </div>
              <div class="detalle-item">
                <strong><i class="fas fa-star"></i> Precio Recomendado:</strong> {{ formatearMoneda(modalServicio.precioRecomendado) }}
              </div>
              <div class="detalle-item">
                <strong><i class="fas fa-calculator"></i> Diferencia:</strong> {{ formatearMoneda(modalServicio.precioRecomendado - modalServicio.precioMinimo) }}
              </div>
              <div class="detalle-item">
                <strong><i class="fas fa-calendar-alt"></i> Fecha de Creación:</strong> {{ formatearFecha(modalServicio.fechaCreacion) }}
              </div>
              <div class="detalle-item">
                <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
                <span class="estado-badge" :class="modalServicio.estado">
                  {{ getEstadoTexto(modalServicio.estado) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
          <button class="btn btn-primary" @click="editarServicio(modalServicio)">
            <i class="fas fa-edit"></i> Editar Servicio
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de formulario -->
    <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
      <div class="modal-content modal-formulario" @click.stop>
        <div class="modal-header">
          <h3>{{ servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
          <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarServicio" class="formulario-servicio">
            <div class="form-grid">
              <div class="form-group">
                <label for="nombre">Nombre del Servicio *</label>
                <input 
                  id="nombre"
                  v-model="formulario.nombre" 
                  type="text" 
                  required 
                  class="form-input"
                  placeholder="Desarrollo Web, Consultoría, etc."
                >
              </div>
              
              <div class="form-group full-width">
                <label for="descripcion">Descripción *</label>
                <textarea 
                  id="descripcion"
                  v-model="formulario.descripcion" 
                  required 
                  class="form-textarea"
                  placeholder="Describe detalladamente el servicio que se ofrece..."
                  rows="4"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="precioMinimo">Precio Mínimo (HNL) *</label>
                <input 
                  id="precioMinimo"
                  v-model.number="formulario.precioMinimo" 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="0.00"
                >
              </div>
              
              <div class="form-group">
                <label for="precioRecomendado">Precio Recomendado (HNL) *</label>
                <input 
                  id="precioRecomendado"
                  v-model.number="formulario.precioRecomendado" 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="0.00"
                >
              </div>
              
              <div class="form-group" v-if="servicioEditando">
                <label for="estado">Estado</label>
                <select id="estado" v-model="formulario.estado" class="form-select">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <!-- Validación visual de precios -->
            <div v-if="formulario.precioMinimo && formulario.precioRecomendado" class="precio-validacion">
              <div v-if="formulario.precioRecomendado < formulario.precioMinimo" class="validacion-error">
                <i class="fas fa-exclamation-triangle"></i>
                El precio recomendado debe ser mayor o igual al precio mínimo
              </div>
              <div v-else class="validacion-exito">
                <i class="fas fa-check-circle"></i>
                Diferencia: {{ formatearMoneda(formulario.precioRecomendado - formulario.precioMinimo) }}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="cerrarModalFormulario">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarServicio" :disabled="!formularioValido">
            <i class="fas fa-save"></i> {{ servicioEditando ? 'Actualizar' : 'Crear' }} Servicio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminServicios',
  data() {
    return {
      vistaActual: 'tabla',
      modalServicio: null,
      modalFormulario: false,
      servicioEditando: null,
      paginaActual: 1,
      itemsPorPagina: 25,
      paginaSalto: 1,
      ordenActual: { campo: 'id', direccion: 'desc' },
      
      filtros: {
        busqueda: '',
        rangoPrecio: '',
        estado: ''
      },
      
      formulario: {
        nombre: '',
        descripcion: '',
        precioMinimo: '',
        precioRecomendado: '',
        estado: 'activo'
      },
      
      servicios: [
        {
          id: 1,
          nombre: 'Desarrollo Web',
          descripcion: 'Desarrollo de sitios web responsivos y modernos utilizando las últimas tecnologías. Incluye diseño UX/UI, desarrollo frontend y backend, integración con bases de datos y optimización SEO.',
          precioMinimo: 15000.00,
          precioRecomendado: 25000.00,
          estado: 'activo',
          fechaCreacion: '2024-01-15'
        },
        {
          id: 2,
          nombre: 'Consultoría en TI',
          descripcion: 'Asesoría especializada en tecnologías de la información para optimizar procesos empresariales, implementación de sistemas y transformación digital.',
          precioMinimo: 5000.00,
          precioRecomendado: 8000.00,
          estado: 'activo',
          fechaCreacion: '2024-01-20'
        },
        {
          id: 3,
          nombre: 'Marketing Digital',
          descripcion: 'Estrategias integrales de marketing digital incluyendo manejo de redes sociales, campañas publicitarias, SEO/SEM y análisis de métricas.',
          precioMinimo: 8000.00,
          precioRecomendado: 15000.00,
          estado: 'activo',
          fechaCreacion: '2024-01-25'
        },
        {
          id: 4,
          nombre: 'Diseño Gráfico',
          descripcion: 'Creación de identidad visual corporativa, diseño de logotipos, brochures, material publicitario y elementos gráficos para medios digitales.',
          precioMinimo: 3000.00,
          precioRecomendado: 6000.00,
          estado: 'activo',
          fechaCreacion: '2024-02-01'
        },
        {
          id: 5,
          nombre: 'Desarrollo de E-commerce',
          descripcion: 'Plataformas de comercio electrónico completas con carrito de compras, pasarelas de pago, gestión de inventario y panel administrativo.',
          precioMinimo: 20000.00,
          precioRecomendado: 35000.00,
          estado: 'inactivo',
          fechaCreacion: '2024-02-05'
        },
        {
          id: 6,
          nombre: 'Aplicaciones Móviles',
          descripcion: 'Desarrollo de aplicaciones nativas y multiplataforma para iOS y Android con interfaces intuitivas y funcionalidades avanzadas.',
          precioMinimo: 25000.00,
          precioRecomendado: 45000.00,
          estado: 'activo',
          fechaCreacion: '2024-02-10'
        },
        {
          id: 7,
          nombre: 'Auditoría de Sistemas',
          descripcion: 'Revisión integral de infraestructura tecnológica, evaluación de seguridad, rendimiento y recomendaciones de mejoras.',
          precioMinimo: 10000.00,
          precioRecomendado: 18000.00,
          estado: 'activo',
          fechaCreacion: '2024-02-15'
        },
        {
          id: 8,
          nombre: 'Capacitación Tecnológica',
          descripcion: 'Programas de entrenamiento personalizados en diversas tecnologías para equipos de trabajo y empresas.',
          precioMinimo: 2500.00,
          precioRecomendado: 5000.00,
          estado: 'activo',
          fechaCreacion: '2024-03-01'
        }
      ]
    }
  },
  
  computed: {
    serviciosFiltrados() {
      let resultado = [...this.servicios];
      
      if (this.filtros.busqueda) {
        const busqueda = this.filtros.busqueda.toLowerCase();
        resultado = resultado.filter(servicio => 
          servicio.nombre.toLowerCase().includes(busqueda) ||
          servicio.descripcion.toLowerCase().includes(busqueda)
        );
      }
      
      if (this.filtros.rangoPrecio) {
        resultado = resultado.filter(servicio => {
          if (this.filtros.rangoPrecio === 'bajo') {
            return servicio.precioRecomendado < 5000;
          } else if (this.filtros.rangoPrecio === 'medio') {
            return servicio.precioRecomendado >= 5000 && servicio.precioRecomendado <= 20000;
          } else if (this.filtros.rangoPrecio === 'alto') {
            return servicio.precioRecomendado > 20000;
          }
          return true;
        });
      }

      if (this.filtros.estado) {
        resultado = resultado.filter(servicio => 
          servicio.estado === this.filtros.estado
        );
      }
      
      resultado.sort((a, b) => {
        let valorA = a[this.ordenActual.campo];
        let valorB = b[this.ordenActual.campo];
        
        if (this.ordenActual.campo === 'fechaCreacion') {
          valorA = new Date(valorA);
          valorB = new Date(valorB);
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
    
    serviciosPaginados() {
      const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
      const fin = inicio + this.itemsPorPagina;
      return this.serviciosFiltrados.slice(inicio, fin);
    },
    
    totalPaginas() {
      return Math.ceil(this.serviciosFiltrados.length / this.itemsPorPagina);
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
      return Math.min(this.paginaActual * this.itemsPorPagina, this.serviciosFiltrados.length);
    },
    
    estadisticas() {
      const serviciosActivos = this.servicios.filter(s => s.estado === 'activo');
      const precios = serviciosActivos.map(s => s.precioRecomendado);
      
      return {
        total: this.servicios.length,
        activos: serviciosActivos.length,
        inactivos: this.servicios.filter(s => s.estado === 'inactivo').length,
precioPromedio: precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0,
precioMaximo: precios.length > 0 ? Math.max(...precios) : 0
};
},
formularioValido() {
  return this.formulario.nombre && 
         this.formulario.descripcion && 
         this.formulario.precioMinimo >= 0 && 
         this.formulario.precioRecomendado >= 0 &&
         this.formulario.precioRecomendado >= this.formulario.precioMinimo;
}
},
watch: {
'filtros.busqueda'() {
this.paginaActual = 1;
},
'filtros.rangoPrecio'() {
this.paginaActual = 1;
},
'filtros.estado'() {
this.paginaActual = 1;
},
paginaActual(newVal) {
  this.paginaSalto = newVal;
}
},
methods: {
nuevoServicio() {
this.servicioEditando = null;
this.limpiarFormulario();
this.modalFormulario = true;
},
verServicio(servicio) {
  this.modalServicio = servicio;
},

editarServicio(servicio) {
  this.servicioEditando = servicio;
  this.llenarFormulario(servicio);
  this.modalFormulario = true;
  this.modalServicio = null;
},

cambiarEstadoServicio(servicio) {
  const accion = servicio.estado === 'activo' ? 'desactivar' : 'activar';
  const confirmacion = confirm(`¿Está seguro que desea ${accion} el servicio ${servicio.nombre}?`);
  
  if (confirmacion) {
    servicio.estado = servicio.estado === 'activo' ? 'inactivo' : 'activo';
    alert(`Servicio ${accion === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
  }
},

guardarServicio() {
  if (!this.formularioValido) {
    alert('Por favor complete todos los campos correctamente');
    return;
  }
  
  if (this.formulario.precioRecomendado < this.formulario.precioMinimo) {
    alert('El precio recomendado debe ser mayor o igual al precio mínimo');
    return;
  }
  
  const nombreExiste = this.servicios.some(s => 
    s.nombre.toLowerCase() === this.formulario.nombre.toLowerCase() && 
    (!this.servicioEditando || s.id !== this.servicioEditando.id)
  );
  
  if (nombreExiste) {
    alert('Ya existe un servicio con ese nombre');
    return;
  }
  
  if (this.servicioEditando) {
    Object.assign(this.servicioEditando, {
      nombre: this.formulario.nombre,
      descripcion: this.formulario.descripcion,
      precioMinimo: parseFloat(this.formulario.precioMinimo),
      precioRecomendado: parseFloat(this.formulario.precioRecomendado),
      estado: this.formulario.estado
    });
    alert('Servicio actualizado exitosamente');
  } else {
    const nuevoServicio = {
      id: Math.max(...this.servicios.map(s => s.id)) + 1,
      nombre: this.formulario.nombre,
      descripcion: this.formulario.descripcion,
      precioMinimo: parseFloat(this.formulario.precioMinimo),
      precioRecomendado: parseFloat(this.formulario.precioRecomendado),
      estado: 'activo',
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    this.servicios.push(nuevoServicio);
    alert('Servicio creado exitosamente');
  }
  
  this.cerrarModalFormulario();
},

llenarFormulario(servicio) {
  this.formulario = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precioMinimo: servicio.precioMinimo,
    precioRecomendado: servicio.precioRecomendado,
    estado: servicio.estado
  };
},

limpiarFormulario() {
  this.formulario = {
    nombre: '',
    descripcion: '',
    precioMinimo: '',
    precioRecomendado: '',
    estado: 'activo'
  };
},

truncarTexto(texto, limite) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
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
    rangoPrecio: '',
    estado: ''
  };
  this.paginaActual = 1;
  this.paginaSalto = 1;
},

cerrarModal() {
  this.modalServicio = null;
},

cerrarModalFormulario() {
  this.modalFormulario = false;
  this.servicioEditando = null;
  this.limpiarFormulario();
},

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
    activo: 'Activo',
    inactivo: 'Inactivo'
  };
  return estados[estado] || estado;
}
}
}
</script>
<style scoped>
.admin-servicios-container {
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

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #219a52;
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
.stat-card.promedio { border-left: 4px solid #f39c12; }
.stat-card.maximo { border-left: 4px solid #9b59b6; }
.stat-card.inactivos { border-left: 4px solid #95a5a6; }

.servicios-section {
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

.tabla-wrapper {
  overflow-x: auto;
}

.servicios-tabla {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.servicios-tabla th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.servicios-tabla th.sortable {
  cursor: pointer;
  user-select: none;
}

.servicios-tabla th.sortable:hover {
  background: #e9ecef;
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.servicios-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.servicio-id {
  font-weight: 600;
  color: #3498db;
  font-family: monospace;
  font-size: 1rem;
}

.servicio-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.servicio-nombre {
  font-weight: 500;
  color: #2c3e50;
  font-size: 1rem;
}

.descripcion-info {
  max-width: 300px;
}

.descripcion-texto {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.precio {
  font-weight: 600;
  font-family: monospace;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.precio.minimo {
  background: #fff3cd;
  color: #856404;
}

.precio.recomendado {
  background: #d4edda;
  color: #155724;
}

.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.servicio-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  background: white;
}

.servicio-card:hover {
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

.servicio-nombre-card {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.descripcion-card {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.descripcion-card p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
}

.precios-card {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.precio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.precio-label {
  color: #7f8c8d;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.precio-valor {
  font-weight: 600;
  font-family: monospace;
}

.precio-valor.minimo {
  color: #856404;
}

.precio-valor.recomendado {
  color: #155724;
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
  max-width: 700px;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.servicio-detalle {
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

.formulario-servicio {
  padding: 1rem 0;
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

.precio-validacion {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.validacion-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.validacion-exito {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 1200px) {
  .estadisticas-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-servicios-container {
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
.servicios-tabla {
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
}
@media (max-width: 480px) {
.estadisticas-grid {
grid-template-columns: 1fr;
}
.filtros-section,
.servicios-section {
padding: 1rem;
}
.stat-card {
padding: 1rem;
}
.servicio-card {
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
}
</style>