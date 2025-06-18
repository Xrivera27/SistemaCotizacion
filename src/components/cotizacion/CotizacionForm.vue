<template>
  <div class="cotizacion-form-container">
    <!-- Selector de años global -->
    <div class="años-selector">
      <div class="años-container">
        <label for="años-contrato">
          <i class="fas fa-calendar-alt"></i>
          Duración del contrato (años):
        </label>
        <div class="años-controls">
          <button @click="decrementarAños" :disabled="añosContrato <= 1" class="btn-años">
            <i class="fas fa-minus"></i>
          </button>
          <input 
            v-model.number="añosContrato" 
            type="number" 
            min="1" 
            max="10"
            class="input-años"
            @input="validarAños"
          >
          <button @click="incrementarAños" :disabled="añosContrato >= 10" class="btn-años">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <small class="años-info">
          <i class="fas fa-info-circle"></i>
          Todos los servicios se contratarán por {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
        </small>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filtros-container">
      <div class="filtros-header">
        <h3>
          <i class="fas fa-filter"></i>
          Filtrar Servicios
        </h3>
        <span class="servicios-count">
          {{ serviciosFiltrados.length }} de {{ servicios.length }} servicios
        </span>
      </div>
      
      <div class="filtros-content">
        <!-- Búsqueda por texto -->
        <div class="busqueda-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="filtros.busqueda" 
              type="text" 
              placeholder="Buscar por nombre o descripción..."
              class="input-busqueda"
              @input="resetearPaginacion"
            >
            <button 
              v-if="filtros.busqueda" 
              @click="limpiarBusqueda" 
              class="btn-limpiar-busqueda"
              title="Limpiar búsqueda"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Filtros por categoría -->
        <div class="categorias-filter">
          <label>
            <i class="fas fa-tags"></i>
            Categoría:
          </label>
          <select v-model="filtros.categoria" @change="resetearPaginacion" class="select-categoria">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categoriasDisponibles" :key="categoria.value" :value="categoria.value">
              {{ categoria.label }}
            </option>
          </select>
        </div>

       

        <!-- Botón limpiar filtros -->
        <div class="filtros-actions">
          <button @click="limpiarFiltros" class="btn-limpiar-filtros" v-if="hayFiltrosActivos">
            <i class="fas fa-eraser"></i>
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Grid de servicios con paginación -->
    <div class="servicios-section">
      <div class="servicios-header">
        <h3>
          <i class="fas fa-cloud"></i>
          Servicios Disponibles
        </h3>
        
        <!-- Controles de paginación superior -->
        <div class="paginacion-info">
          <span class="resultados-info">
            Mostrando {{ (paginaActual - 1) * serviciosPorPagina + 1 }} - 
            {{ Math.min(paginaActual * serviciosPorPagina, serviciosFiltrados.length) }} 
            de {{ serviciosFiltrados.length }} servicios
          </span>
          <div class="items-por-pagina">
            <label>Mostrar:</label>
            <select v-model.number="serviciosPorPagina" @change="resetearPaginacion" class="select-items">
              <option :value="6">6</option>
              <option :value="9">9</option>
              <option :value="12">12</option>
              <option :value="18">18</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Grid de servicios -->
      <div class="servicios-grid" v-if="serviciosPaginados.length > 0">
        <ServicioItem
          v-for="servicio in serviciosPaginados"
          :key="servicio.id"
          :servicio="servicio"
          v-model="cantidades[servicio.id]"
          :cantidadEquipos="cantidadesEquipos[servicio.id]"
          :precioVenta="preciosVenta[servicio.id]"
          :añosContrato="añosContrato"
          @update:cantidadEquipos="actualizarCantidadEquipos(servicio.id, $event)"
          @update:precioVenta="actualizarPrecioVenta(servicio.id, $event)"
        />
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div v-else class="no-resultados">
        <div class="no-resultados-content">
          <i class="fas fa-search"></i>
          <h4>No se encontraron servicios</h4>
          <p v-if="hayFiltrosActivos">
            No hay servicios que coincidan con los filtros aplicados.
            <button @click="limpiarFiltros" class="btn-link">Limpiar filtros</button>
          </p>
          <p v-else>No hay servicios disponibles en este momento.</p>
        </div>
      </div>

      <!-- Paginación inferior -->
      <div class="paginacion-container" v-if="totalPaginas > 1">
        <div class="paginacion">
          <!-- Botón anterior -->
          <button 
            @click="cambiarPagina(paginaActual - 1)" 
            :disabled="paginaActual <= 1"
            class="btn-paginacion btn-anterior"
          >
            <i class="fas fa-chevron-left"></i>
            Anterior
          </button>

          <!-- Números de página -->
          <div class="numeros-pagina">
            <!-- Primera página -->
            <button 
              v-if="paginaActual > 3"
              @click="cambiarPagina(1)"
              class="btn-numero"
            >
              1
            </button>
            <span v-if="paginaActual > 4" class="puntos-suspension">...</span>

            <!-- Páginas cercanas -->
            <button 
              v-for="pagina in paginasVisibles"
              :key="pagina"
              @click="cambiarPagina(pagina)"
              :class="['btn-numero', { 'activa': pagina === paginaActual }]"
            >
              {{ pagina }}
            </button>

            <!-- Última página -->
            <span v-if="paginaActual < totalPaginas - 3" class="puntos-suspension">...</span>
            <button 
              v-if="paginaActual < totalPaginas - 2"
              @click="cambiarPagina(totalPaginas)"
              class="btn-numero"
            >
              {{ totalPaginas }}
            </button>
          </div>

          <!-- Botón siguiente -->
          <button 
            @click="cambiarPagina(paginaActual + 1)" 
            :disabled="paginaActual >= totalPaginas"
            class="btn-paginacion btn-siguiente"
          >
            Siguiente
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Ir a página específica -->
        <div class="ir-a-pagina">
          <label>Ir a página:</label>
          <input 
            v-model.number="paginaInput" 
            type="number" 
            :min="1" 
            :max="totalPaginas"
            @keyup.enter="irAPagina"
            class="input-pagina"
          >
          <button @click="irAPagina" class="btn-ir">Ir</button>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button @click="calcularCotizacion" class="btn-calcular" :disabled="!hayServicios">
        <i class="fas fa-calculator"></i>
        Calcular Cotización
      </button>
      <button @click="limpiarFormulario" class="btn-limpiar">
        <i class="fas fa-trash-alt"></i>
        Limpiar Todo
      </button>
    </div>

    <ResultadoCotizacion
      :servicios-seleccionados="serviciosSeleccionados"
      :años-contrato="añosContrato"
      @reiniciar="limpiarFormulario"
      @limpiar-formulario="limpiarFormulario"
    />
  </div>
</template>

<script>
import { reactive } from 'vue'
import ServicioItem from './ServicioItem.vue';
import ResultadoCotizacion from './ResultadoCotizacion.vue';
import { servicios } from '@/data/servicios.js';

export default {
  name: 'CotizacionForm',
  components: {
    ServicioItem,
    ResultadoCotizacion
  },
  setup() {
    const cantidades = reactive({});
    const cantidadesEquipos = reactive({});
    const preciosVenta = reactive({});
    
    const inicializarDatos = () => {
      servicios.forEach(servicio => {
        cantidades[servicio.id] = 0;
        cantidadesEquipos[servicio.id] = 0;
        preciosVenta[servicio.id] = servicio.precioVenta || 0;
      });
    };

    inicializarDatos();

    return {
      cantidades,
      cantidadesEquipos,
      preciosVenta,
      inicializarDatos
    };
  },
  data() {
    return {
      servicios,
      serviciosSeleccionados: [],
      añosContrato: 1,
      
      // Filtros
      filtros: {
        busqueda: '',
        categoria: '',
        rangoPrecio: ''
      },
      
      // Paginación
      paginaActual: 1,
      serviciosPorPagina: 9,
      paginaInput: 1
    };
  },
  computed: {
    // Categorías disponibles
    categoriasDisponibles() {
      const categorias = [...new Set(this.servicios.map(s => s.categoria))];
      return categorias.map(cat => ({
        value: cat,
        label: this.obtenerNombreCategoria(cat)
      }));
    },

    // Servicios filtrados
    serviciosFiltrados() {
      let filtrados = [...this.servicios];

      // Filtro de búsqueda
      if (this.filtros.busqueda) {
        const termino = this.filtros.busqueda.toLowerCase();
        filtrados = filtrados.filter(servicio => 
          servicio.nombre.toLowerCase().includes(termino) ||
          servicio.descripcion.toLowerCase().includes(termino) ||
          servicio.equipos.toLowerCase().includes(termino)
        );
      }

      // Filtro de categoría
      if (this.filtros.categoria) {
        filtrados = filtrados.filter(servicio => servicio.categoria === this.filtros.categoria);
      }

      // Filtro de rango de precio
      if (this.filtros.rangoPrecio) {
        filtrados = filtrados.filter(servicio => {
          const precio = servicio.precioModerado;
          switch (this.filtros.rangoPrecio) {
            case 'economico':
              return precio < 500;
            case 'medio':
              return precio >= 500 && precio <= 1000;
            case 'premium':
              return precio > 1000;
            default:
              return true;
          }
        });
      }

      return filtrados;
    },

    // Paginación
    totalPaginas() {
      return Math.ceil(this.serviciosFiltrados.length / this.serviciosPorPagina);
    },

    serviciosPaginados() {
      const inicio = (this.paginaActual - 1) * this.serviciosPorPagina;
      const fin = inicio + this.serviciosPorPagina;
      return this.serviciosFiltrados.slice(inicio, fin);
    },

    paginasVisibles() {
      const total = this.totalPaginas;
      const actual = this.paginaActual;
      const rango = 2; // Mostrar 2 páginas a cada lado de la actual

      let inicio = Math.max(1, actual - rango);
      let fin = Math.min(total, actual + rango);

      // Ajustar si estamos cerca del inicio o fin
      if (fin - inicio < rango * 2) {
        if (inicio === 1) {
          fin = Math.min(total, inicio + rango * 2);
        } else if (fin === total) {
          inicio = Math.max(1, fin - rango * 2);
        }
      }

      const paginas = [];
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      return paginas;
    },

    // Estados
    hayFiltrosActivos() {
      return this.filtros.busqueda || this.filtros.categoria || this.filtros.rangoPrecio;
    },

    hayServicios() {
      return Object.values(this.cantidades).some(cantidad => cantidad > 0) ||
             Object.values(this.cantidadesEquipos).some(cantidad => cantidad > 0);
    }
  },
  methods: {
    // Métodos de años
    actualizarCantidadEquipos(servicioId, nuevaCantidad) {
      this.cantidadesEquipos[servicioId] = nuevaCantidad || 0;
    },
    actualizarPrecioVenta(servicioId, nuevoPrecio) {
      this.preciosVenta[servicioId] = nuevoPrecio || 0;
    },
    incrementarAños() {
      if (this.añosContrato < 10) {
        this.añosContrato++;
      }
    },
    decrementarAños() {
      if (this.añosContrato > 1) {
        this.añosContrato--;
      }
    },
    validarAños() {
      if (this.añosContrato < 1) {
        this.añosContrato = 1;
      } else if (this.añosContrato > 10) {
        this.añosContrato = 10;
      }
    },

    // Métodos de filtros
    obtenerNombreCategoria(categoria) {
      const nombres = {
        hosting: 'Hosting',
        database: 'Base de Datos',
        cdn: 'CDN',
        backup: 'Backup',
        monitoring: 'Monitoreo',
        'load-balancer': 'Balanceador',
        security: 'Seguridad'
      };
      return nombres[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
    },

    limpiarBusqueda() {
      this.filtros.busqueda = '';
      this.resetearPaginacion();
    },

    limpiarFiltros() {
      this.filtros = {
        busqueda: '',
        categoria: '',
        rangoPrecio: ''
      };
      this.resetearPaginacion();
    },

    // Métodos de paginación
    resetearPaginacion() {
      this.paginaActual = 1;
      this.paginaInput = 1;
    },

    cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina;
        this.paginaInput = pagina;
        // Scroll suave al inicio de los servicios
        this.$nextTick(() => {
          const elemento = this.$el.querySelector('.servicios-section');
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    },

    irAPagina() {
      if (this.paginaInput >= 1 && this.paginaInput <= this.totalPaginas) {
        this.cambiarPagina(this.paginaInput);
      } else {
        this.paginaInput = this.paginaActual;
      }
    },

    // Métodos principales
    calcularCotizacion() {
      this.serviciosSeleccionados = this.servicios
        .filter(servicio => 
          this.cantidades[servicio.id] > 0 || 
          this.cantidadesEquipos[servicio.id] > 0
        )
        .map(servicio => {
          const precioVentaFinal = this.preciosVenta[servicio.id] || servicio.precioModerado;
          return {
            servicio,
            cantidadServidores: this.cantidades[servicio.id],
            cantidadEquipos: this.cantidadesEquipos[servicio.id],
            precioVentaFinal,
            añosContrato: this.añosContrato
          };
        });
    },

    limpiarFormulario() {
      this.servicios.forEach(servicio => {
        this.cantidades[servicio.id] = 0;
        this.cantidadesEquipos[servicio.id] = 0;
        this.preciosVenta[servicio.id] = servicio.precioVenta || 0;
      });
      this.serviciosSeleccionados = [];
      this.añosContrato = 1;
      // No limpiar filtros al limpiar formulario
    }
  },

  // Watcher para mantener paginaInput sincronizado
  watch: {
    paginaActual(newVal) {
      this.paginaInput = newVal;
    }
  }
}
</script>

<style scoped>
/* CSS existente más los nuevos estilos para filtros y paginación */
.cotizacion-form-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

/* Filtros */
.filtros-container {
  background: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(52, 152, 219, 0.2);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filtros-header h3 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.servicios-count {
  color: #7f8c8d;
  font-weight: 500;
  font-size: 0.9rem;
}

.filtros-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
}

.input-busqueda {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-busqueda:focus {
  outline: none;
  border-color: #3498db;
}

.btn-limpiar-busqueda {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.btn-limpiar-busqueda:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.categorias-filter label,
.precio-filter label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-categoria,
.select-precio {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
}

.btn-limpiar-filtros {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-limpiar-filtros:hover {
  background: #c0392b;
}

/* Servicios Section */
.servicios-section {
  margin-bottom: 2rem;
}

.servicios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.servicios-header h3 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.paginacion-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.resultados-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.items-por-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-por-pagina label {
  color: #495057;
  font-weight: 500;
}

.select-items {
  padding: 0.4rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background: white;
}

/* No resultados */
.no-resultados {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.no-resultados-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-resultados-content h4 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.btn-link:hover {
  color: #0056b3;
}

/* Paginación */
.paginacion-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.paginacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-paginacion {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-paginacion:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.numeros-pagina {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-numero {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-numero:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-numero.activa {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.puntos-suspension {
  padding: 0 0.5rem;
  color: #6c757d;
}

.ir-a-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ir-a-pagina label {
  color: #495057;
  font-weight: 500;
}

.input-pagina {
  width: 4rem;
  padding: 0.4rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  text-align: center;
}

.btn-ir {
  padding: 0.4rem 0.8rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-ir:hover {
  background: #218838;
}

/* Responsive */
@media (max-width: 768px) {
  .filtros-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .servicios-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .paginacion-info {
    justify-content: space-between;
  }
  
  .paginacion-container {
    flex-direction: column;
    align-items: center;
  }
  
  .numeros-pagina {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* CSS existente del componente... */
.años-selector {
  background: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(52, 152, 219, 0.2);
}

.años-container {
  text-align: center;
}

.años-container label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  margin-bottom: 1rem;
}

.años-container label i {
  color: #3498db;
  font-size: 1.1em;
}

.años-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.btn-años {
  width: 3rem;
  height: 3rem;
  border: 2px solid #3498db;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-años:hover:not(:disabled) {
  background: rgba(52, 152, 219, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-años:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: #95a5a6;
}

.input-años {
  width: 4rem;
  height: 3rem;
  text-align: center;
  border: 2px solid #3498db;
  border-radius: 0.75rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: white;
  color: #2c3e50;
}

.input-años:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.años-info {
 color: #34495e;
 font-size: clamp(0.85rem, 2.5vw, 1rem);
 font-style: italic;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
}

.años-info i {
 color: #3498db;
 font-size: 0.9em;
}

.servicios-grid {
 display: grid;
 gap: 1rem;
 margin-bottom: 2rem;
 grid-template-columns: 1fr;
 width: 100%;
 box-sizing: border-box;
}

.form-actions {
 display: flex;
 justify-content: center;
 gap: 1rem;
 margin-bottom: 2rem;
 flex-wrap: wrap;
}

.btn-calcular, .btn-limpiar {
 padding: 0.75rem 1.5rem;
 border: none;
 border-radius: 0.5rem;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 min-width: 150px;
 flex: 1;
 max-width: 200px;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
}

.btn-calcular {
 background: linear-gradient(135deg, #11998e, #38ef7d);
 color: white;
 box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
}

.btn-calcular:hover:not(:disabled) {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(17, 153, 142, 0.6);
}

.btn-calcular:disabled {
 background: #bdc3c7;
 cursor: not-allowed;
 transform: none;
 box-shadow: none;
}

.btn-calcular:disabled i {
 color: #7f8c8d;
}

.btn-limpiar {
 background: linear-gradient(135deg, #fc4a1a, #f7b733);
 color: white;
 box-shadow: 0 4px 15px rgba(252, 74, 26, 0.4);
}

.btn-limpiar:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(252, 74, 26, 0.6);
}

.btn-calcular i,
.btn-limpiar i {
 font-size: 1.1em;
}

/* Responsive adicional para filtros */
@media (max-width: 1200px) {
 .filtros-content {
   grid-template-columns: 1fr 1fr;
   gap: 1rem;
 }
 
 .busqueda-container {
   grid-column: 1 / -1;
 }
 
 .filtros-actions {
   grid-column: 1 / -1;
   text-align: center;
 }
}

@media (max-width: 768px) {
 .cotizacion-form-container {
   padding: 0;
 }
 
 .servicios-grid {
   gap: 1.5rem;
   grid-template-columns: 1fr;
 }
 
 .años-selector {
   padding: 2rem;
 }
 
 .filtros-container {
   padding: 1rem;
 }
 
 .filtros-header {
   flex-direction: column;
   align-items: stretch;
   gap: 0.5rem;
 }
 
 .filtros-content {
   grid-template-columns: 1fr;
 }
 
 .servicios-header {
   flex-direction: column;
   align-items: stretch;
   gap: 1rem;
 }
 
 .paginacion-info {
   flex-direction: column;
   align-items: stretch;
   gap: 0.5rem;
 }
 
 .resultados-info {
   text-align: center;
 }
 
 .items-por-pagina {
   justify-content: center;
 }
 
 .paginacion {
   justify-content: center;
   flex-wrap: wrap;
 }
 
 .btn-paginacion {
   padding: 0.4rem 0.8rem;
   font-size: 0.9rem;
 }
 
 .btn-numero {
   width: 2.2rem;
   height: 2.2rem;
 }
 
 .ir-a-pagina {
   justify-content: center;
   flex-wrap: wrap;
 }
}

@media (min-width: 480px) {
 .cotizacion-form-container {
   padding: 0;
 }
 
 .servicios-grid {
   gap: 1.5rem;
 }
 
 .años-selector {
   padding: 2rem;
 }
}

@media (min-width: 768px) {
 .servicios-grid {
   grid-template-columns: repeat(2, 1fr);
   gap: 1.5rem;
 }
 
 .btn-calcular, .btn-limpiar {
   padding: 1rem 2rem;
   font-size: 1rem;
   flex: none;
   min-width: 180px;
 }
}

@media (min-width: 1024px) {
 .servicios-grid {
   grid-template-columns: repeat(2, 1fr);
   gap: 2rem;
 }
}

@media (min-width: 1200px) {
 .servicios-grid {
   grid-template-columns: repeat(3, 1fr);
   gap: 1.5rem;
 }
}

@media (min-width: 1600px) {
 .servicios-grid {
   grid-template-columns: repeat(3, 1fr);
   gap: 2rem;
 }
}

@media (max-width: 320px) {
 .servicios-grid {
   gap: 1rem;
 }
 
 .años-selector {
   padding: 1rem;
 }
 
 .filtros-container {
   padding: 0.75rem;
 }
 
 .años-controls {
   gap: 0.5rem;
 }
 
 .btn-años {
   width: 2.5rem;
   height: 2.5rem;
   font-size: 1rem;
 }
 
 .input-años {
   width: 3.5rem;
   height: 2.5rem;
   font-size: 1.1rem;
 }
 
 .años-info {
   font-size: 0.8rem;
 }
 
 .btn-calcular, .btn-limpiar {
   min-width: 120px;
   font-size: 0.85rem;
   gap: 0.4rem;
 }
 
 .btn-calcular i,
 .btn-limpiar i {
   font-size: 1em;
 }
 
 .filtros-header h3 {
   font-size: 1rem;
 }
 
 .servicios-count {
   font-size: 0.8rem;
 }
 
 .input-busqueda {
   padding: 0.6rem 2.5rem 0.6rem 2rem;
   font-size: 0.9rem;
 }
 
 .search-icon {
   left: 0.75rem;
 }
 
 .btn-limpiar-busqueda {
   right: 0.4rem;
 }
 
 .select-categoria,
 .select-precio {
   padding: 0.6rem;
   font-size: 0.9rem;
 }
 
 .btn-limpiar-filtros {
   padding: 0.6rem 0.8rem;
   font-size: 0.9rem;
 }
 
 .resultados-info {
   font-size: 0.8rem;
 }
 
 .items-por-pagina label {
   font-size: 0.9rem;
 }
 
 .no-resultados-content i {
   font-size: 2rem;
 }
 
 .no-resultados-content h4 {
   font-size: 1rem;
 }
 
 .paginacion-container {
   gap: 0.5rem;
 }
 
 .btn-paginacion {
   padding: 0.4rem 0.6rem;
   font-size: 0.8rem;
 }
 
 .btn-numero {
   width: 2rem;
   height: 2rem;
   font-size: 0.8rem;
 }
 
 .input-pagina {
   width: 3rem;
   padding: 0.3rem;
   font-size: 0.8rem;
 }
 
 .btn-ir {
   padding: 0.3rem 0.6rem;
   font-size: 0.8rem;
 }
 
 .ir-a-pagina label {
   font-size: 0.8rem;
 }
}

.cotizacion-form-container * {
 box-sizing: border-box;
}

/* Animaciones para transiciones suaves */
.servicios-grid {
 transition: all 0.3s ease;
}

.filtros-container,
.años-selector {
 transition: all 0.3s ease;
}

/* Estados de carga */
.servicios-grid.loading {
 opacity: 0.7;
 pointer-events: none;
}

/* Mejoras de accesibilidad */
.btn-numero:focus,
.btn-paginacion:focus,
.input-busqueda:focus,
.select-categoria:focus,
.select-precio:focus {
 outline: 2px solid #007bff;
 outline-offset: 2px;
}

/* Estilos para impresión */
@media print {
 .filtros-container,
 .paginacion-container,
 .form-actions {
   display: none;
 }
 
 .servicios-grid {
   grid-template-columns: repeat(2, 1fr);
   gap: 1rem;
 }
}
</style>