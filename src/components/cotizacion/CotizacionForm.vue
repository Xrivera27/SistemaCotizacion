<template>
  <div class="cotizacion-form-container">
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

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
              @input="buscarServicios"
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
          <select v-model="filtros.categoria" @change="filtrarPorCategoria" class="select-categoria">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categoriasDisponibles" :key="categoria.value" :value="categoria.value">
              {{ categoria.label }}
            </option>
          </select>
        </div>

        <!-- Filtro por precio -->
        <div class="precio-filter">
          <label>
            <i class="fas fa-dollar-sign"></i>
            Rango de precio:
          </label>
          <select v-model="filtros.rangoPrecio" @change="filtrarPorPrecio" class="select-precio">
            <option value="">Todos los precios</option>
            <option value="economico">Económico (menor a $. 1,000)</option>
            <option value="medio">Medio ($. 1,000 - $. 5,000)</option>
            <option value="premium">Premium (mayor a $. 5,000)</option>
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
      <div class="servicios-grid" v-if="serviciosPaginados.length > 0" :class="{ loading: loadingServicios }">
        <ServicioItem
          v-for="servicio in serviciosPaginados"
          :key="servicio.servicios_id"
          :servicio="servicio"
          v-model="cantidades[servicio.servicios_id]"
          :cantidadEquipos="cantidadesEquipos[servicio.servicios_id]"
          :precioVenta="preciosVenta[servicio.servicios_id]"
          :añosContrato="añosContrato"
          @update:cantidadEquipos="actualizarCantidadEquipos(servicio.servicios_id, $event)"
          @update:precioVenta="actualizarPrecioVenta(servicio.servicios_id, $event)"
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

    <!-- Error message -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="recargarServicios" class="btn-reintentar">
        <i class="fas fa-redo"></i>
        Reintentar
      </button>
    </div>

    <div class="form-actions">
      <button @click="calcularCotizacion" class="btn-calcular" :disabled="!hayServicios || loading">
        <i class="fas fa-calculator"></i>
        Calcular Cotización
      </button>
      <button @click="limpiarFormulario" class="btn-limpiar" :disabled="loading">
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
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import ServicioItem from './ServicioItem.vue'
import ResultadoCotizacion from './ResultadoCotizacion.vue'
import serviciosService from '@/services/serviciosService'

export default {
  name: 'CotizacionForm',
  components: {
    ServicioItem,
    ResultadoCotizacion
  },
  setup() {
    // Estados reactivos
    const servicios = ref([])
    const serviciosOriginales = ref([])
    const loading = ref(false)
    const loadingServicios = ref(false)
    const loadingMessage = ref('')
    const error = ref('')
    
    const cantidades = reactive({})
    const cantidadesEquipos = reactive({})
    const preciosVenta = reactive({})
    
    const serviciosSeleccionados = ref([])
    const añosContrato = ref(1)
    
    // Filtros
    const filtros = reactive({
      busqueda: '',
      categoria: '',
      rangoPrecio: ''
    })
    
    // Paginación
    const paginaActual = ref(1)
    const serviciosPorPagina = ref(9)
    const paginaInput = ref(1)
    
    // Cache para búsquedas
    const cacheResultados = reactive({})
    const timeoutBusqueda = ref(null)

    // Función para resetear paginación
    const resetearPaginacion = () => {
      paginaActual.value = 1
      paginaInput.value = 1
    }

    // Función para cargar servicios desde el backend
    const cargarServicios = async (params = {}) => {
      try {
        loading.value = true
        loadingMessage.value = 'Cargando servicios...'
        error.value = ''

        console.log('🔄 Iniciando carga de servicios...')

        const resultado = await serviciosService.getServicios({
          estado: 'activo',
          limit: 100,
          ...params
        })

        console.log('📊 Resultado del backend:', resultado)

        if (resultado.success) {
          // Formatear servicios usando el helper del servicio
          servicios.value = resultado.servicios.map(servicio => {
            const servicioFormateado = serviciosService.formatServicioDisplay(servicio)
            console.log('📝 Servicio formateado:', servicioFormateado)
            return servicioFormateado
          })
          
          serviciosOriginales.value = [...servicios.value]
          inicializarDatos()
          console.log('✅ Servicios cargados:', servicios.value.length)
        } else {
          throw new Error(resultado.message || 'Error cargando servicios')
        }
      } catch (err) {
        console.error('❌ Error cargando servicios:', err)
        error.value = err.message || 'Error al cargar los servicios. Verifique su conexión.'
        servicios.value = []
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    // Función para buscar servicios con debounce
    const buscarServicios = async () => {
      const termino = filtros.busqueda.trim()
      
      if (timeoutBusqueda.value) {
        clearTimeout(timeoutBusqueda.value)
      }

      if (!termino) {
        servicios.value = [...serviciosOriginales.value]
        aplicarFiltros()
        return
      }

      if (cacheResultados[termino]) {
        servicios.value = cacheResultados[termino]
        aplicarFiltros()
        return
      }

      timeoutBusqueda.value = setTimeout(async () => {
        try {
          loadingServicios.value = true
          
          const resultado = await serviciosService.searchServicios(termino, 50)
          
          if (resultado.success) {
            const serviciosFormateados = resultado.servicios.map(serviciosService.formatServicioDisplay)
            cacheResultados[termino] = serviciosFormateados
            servicios.value = serviciosFormateados
            aplicarFiltros()
            console.log(`🔍 Búsqueda "${termino}": ${serviciosFormateados.length} resultados`)
          } else {
            throw new Error(resultado.message)
          }
        } catch (err) {
          console.error('❌ Error en búsqueda:', err)
          error.value = 'Error en la búsqueda de servicios'
        } finally {
          loadingServicios.value = false
        }
      }, 300)
    }

    // Función para aplicar filtros locales
    const aplicarFiltros = () => {
      resetearPaginacion()
    }

    // Función para filtrar por categoría
    const filtrarPorCategoria = () => {
      aplicarFiltros()
    }

    // Función para filtrar por precio
    const filtrarPorPrecio = () => {
      aplicarFiltros()
    }

    // Función para inicializar datos reactivos
    const inicializarDatos = () => {
      servicios.value.forEach(servicio => {
        const id = servicio.servicios_id
        if (!(id in cantidades)) {
          cantidades[id] = 0
          cantidadesEquipos[id] = 0
          preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
        }
      })
    }

    // Función para recargar servicios
    const recargarServicios = () => {
      cargarServicios()
    }

    // Computed properties
    const categoriasDisponibles = computed(() => {
      const categorias = [...new Set(servicios.value.map(s => s.categoria?.nombre || 'Sin categoría'))]
      return categorias.map(cat => ({
        value: cat,
        label: cat
      })).sort((a, b) => a.label.localeCompare(b.label))
    })

    const serviciosFiltrados = computed(() => {
      let filtrados = [...servicios.value]

      if (filtros.categoria) {
        filtrados = filtrados.filter(servicio => 
          (servicio.categoria?.nombre || 'Sin categoría') === filtros.categoria
        )
      }

      if (filtros.rangoPrecio) {
        filtrados = filtrados.filter(servicio => {
          const precio = servicio.precio_recomendado || servicio.precio_minimo || 0
          switch (filtros.rangoPrecio) {
            case 'economico':
              return precio < 1000
            case 'medio':
              return precio >= 1000 && precio <= 5000
            case 'premium':
              return precio > 5000
            default:
              return true
          }
        })
      }

      return filtrados
    })

    const totalPaginas = computed(() => {
      return Math.ceil(serviciosFiltrados.value.length / serviciosPorPagina.value)
    })

    const serviciosPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * serviciosPorPagina.value
      const fin = inicio + serviciosPorPagina.value
      return serviciosFiltrados.value.slice(inicio, fin)
    })

    const paginasVisibles = computed(() => {
      const total = totalPaginas.value
      const actual = paginaActual.value
      const rango = 2

      let inicio = Math.max(1, actual - rango)
      let fin = Math.min(total, actual + rango)

      if (fin - inicio < rango * 2) {
        if (inicio === 1) {
          fin = Math.min(total, inicio + rango * 2)
        } else if (fin === total) {
          inicio = Math.max(1, fin - rango * 2)
        }
      }

      const paginas = []
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i)
      }
      return paginas
    })

    const hayFiltrosActivos = computed(() => {
      return filtros.busqueda || filtros.categoria || filtros.rangoPrecio
    })

    const hayServicios = computed(() => {
      return Object.values(cantidades).some(cantidad => cantidad > 0) ||
             Object.values(cantidadesEquipos).some(cantidad => cantidad > 0)
    })

    // Métodos
    const actualizarCantidadEquipos = (servicioId, nuevaCantidad) => {
      cantidadesEquipos[servicioId] = nuevaCantidad || 0
    }
    
    const actualizarPrecioVenta = (servicioId, nuevoPrecio) => {
      preciosVenta[servicioId] = nuevoPrecio || 0
    }
    
    const incrementarAños = () => {
      if (añosContrato.value < 10) {
        añosContrato.value++
      }
    }
    
    const decrementarAños = () => {
      if (añosContrato.value > 1) {
        añosContrato.value--
      }
    }
    
    const validarAños = () => {
      if (añosContrato.value < 1) {
        añosContrato.value = 1
      } else if (añosContrato.value > 10) {
        añosContrato.value = 10
      }
    }

    const limpiarBusqueda = () => {
      filtros.busqueda = ''
      servicios.value = [...serviciosOriginales.value]
      aplicarFiltros()
    }

    const limpiarFiltros = () => {
      filtros.busqueda = ''
      filtros.categoria = ''
      filtros.rangoPrecio = ''
      servicios.value = [...serviciosOriginales.value]
      resetearPaginacion()
    }

    const cambiarPagina = (pagina) => {
      if (pagina >= 1 && pagina <= totalPaginas.value) {
        paginaActual.value = pagina
        paginaInput.value = pagina
        nextTick(() => {
          const elemento = document.querySelector('.servicios-section')
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    }

    const irAPagina = () => {
      if (paginaInput.value >= 1 && paginaInput.value <= totalPaginas.value) {
        cambiarPagina(paginaInput.value)
      } else {
        paginaInput.value = paginaActual.value
      }
    }

    const calcularCotizacion = () => {
      serviciosSeleccionados.value = servicios.value
        .filter(servicio => 
          cantidades[servicio.servicios_id] > 0 || 
          cantidadesEquipos[servicio.servicios_id] > 0
        )
        .map(servicio => {
          const id = servicio.servicios_id
          const precioVentaFinal = preciosVenta[id] || servicio.precio_recomendado || servicio.precio_minimo
          
          return {
            servicio: {
              servicios_id: id,
              nombre: servicio.nombre,
              categoria: servicio.categoria?.nombre || 'Sin categoría',
              precioMinimo: servicio.precio_minimo,
              precio_recomendado: servicio.precio_recomendado,
              descripcion: servicio.descripcion
            },
            cantidadServidores: cantidades[id] || 0,
            cantidadEquipos: cantidadesEquipos[id] || 0,
            precioVentaFinal,
            añosContrato: añosContrato.value
          }
        })

      console.log('📋 Servicios seleccionados:', serviciosSeleccionados.value)
    }

    const limpiarFormulario = () => {
      servicios.value.forEach(servicio => {
        const id = servicio.servicios_id
        cantidades[id] = 0
        cantidadesEquipos[id] = 0
        preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
      })
      
      serviciosSeleccionados.value = []
      añosContrato.value = 1
      
      console.log('🧹 Formulario limpiado')
    }

    // Cargar servicios al montar el componente
    onMounted(() => {
      console.log('🚀 Componente montado, cargando servicios...')
      cargarServicios()
    })

    // Watchers
    watch([() => filtros.categoria, () => filtros.rangoPrecio], () => {
      if (filtros.busqueda) {
        const terminoBusqueda = filtros.busqueda
        filtros.busqueda = ''
        nextTick(() => {
          filtros.busqueda = terminoBusqueda
          buscarServicios()
        })
      }
    })

    watch(paginaActual, (newVal) => {
      paginaInput.value = newVal
    })

    return {
      // Estados
      servicios,
      serviciosOriginales,
      loading,
      loadingServicios,
      loadingMessage,
      error,
      cantidades,
      cantidadesEquipos,
      preciosVenta,
      serviciosSeleccionados,
      añosContrato,
      filtros,
      paginaActual,
      serviciosPorPagina,
      paginaInput,
      
      // Computed
      categoriasDisponibles,
      serviciosFiltrados,
      totalPaginas,
      serviciosPaginados,
      paginasVisibles,
      hayFiltrosActivos,
      hayServicios,
      
      // Funciones
      cargarServicios,
      buscarServicios,
      aplicarFiltros,
      filtrarPorCategoria,
      filtrarPorPrecio,
      inicializarDatos,
      recargarServicios,
      resetearPaginacion,
      actualizarCantidadEquipos,
      actualizarPrecioVenta,
      incrementarAños,
      decrementarAños,
      validarAños,
      limpiarBusqueda,
      limpiarFiltros,
      cambiarPagina,
      irAPagina,
      calcularCotizacion,
      limpiarFormulario
    }
  }
}
</script>


<style scoped>
.cotizacion-form-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

/* Años selector - Más sobrio */
.años-selector {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.años-container {
  text-align: center;
}

.años-container label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #495057;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  margin-bottom: 1rem;
}

.años-container label i {
  color: #6c757d;
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
  border: 2px solid #6c757d;
  background: white;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-años:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #495057;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-años:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #adb5bd;
  border-color: #dee2e6;
}

.input-años {
  width: 4rem;
  height: 3rem;
  text-align: center;
  border: 2px solid #ced4da;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  background: white;
  color: #495057;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-años:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.años-info {
  color: #6c757d;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  font-style: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.años-info i {
  color: #007bff;
  font-size: 0.9em;
}

/* Filtros - Diseño corporativo */
.filtros-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.filtros-header h3 {
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.filtros-header h3 i {
  color: #6c757d;
}

.servicios-count {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.9rem;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #e9ecef;
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
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.input-busqueda:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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
  border-radius: 4px;
  transition: all 0.2s;
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
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.categorias-filter label i,
.precio-filter label i {
  color: #6c757d;
}

.select-categoria,
.select-precio {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #495057;
  transition: all 0.2s;
}

.select-categoria:focus,
.select-precio:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn-limpiar-filtros {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-limpiar-filtros:hover {
  background: linear-gradient(135deg, #5a6268, #343a40);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.servicios-header h3 {
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.servicios-header h3 i {
  color: #6c757d;
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
  font-weight: 500;
}

.items-por-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-por-pagina label {
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.select-items {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-weight: 500;
}

/* Servicios Grid */
.servicios-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  grid-template-columns: 1fr;
  width: 100%;
  box-sizing: border-box;
}

/* No resultados */
.no-resultados {
  text-align: center;
  padding: 4rem 1rem;
  color: #6c757d;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.no-resultados-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
  color: #adb5bd;
}

.no-resultados-content h4 {
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 600;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.btn-link:hover {
  color: #0056b3;
}

/* Paginación - Diseño profesional */
.paginacion-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-paginacion:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #212529;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #adb5bd;
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
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-numero:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #212529;
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
  font-size: 0.9rem;
}

.input-pagina {
  width: 4rem;
  padding: 0.4rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  text-align: center;
  color: #495057;
}

.input-pagina:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.btn-ir {
  padding: 0.4rem 0.8rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-ir:hover {
  background: #0056b3;
}

/* Form Actions - Botón limpiar en rojo */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-calcular, .btn-limpiar {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-calcular {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-calcular:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e7e34, #17a2b8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
}

.btn-calcular:disabled {
  background: linear-gradient(135deg, #6c757d, #adb5bd);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botón limpiar en rojo */
.btn-limpiar {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-limpiar:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3);
}

.btn-limpiar:active {
  background: linear-gradient(135deg, #a71e2a, #8b1a1a);
  transform: translateY(0);
}

.btn-calcular i,
.btn-limpiar i {
  font-size: 1.1em;
}

/* Responsive */
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
  
  .paginacion-container {
    flex-direction: column;
    align-items: center;
  }
  
  .servicios-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-calcular, .btn-limpiar {
    min-width: 150px;
    padding: 0.75rem 1.5rem;
  }
}

@media (min-width: 768px) {
  .servicios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .servicios-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 320px) {
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
    padding: 0.7rem 1.2rem;
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
.select-precio:focus,
.btn-calcular:focus,
.btn-limpiar:focus {
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