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

      <!-- Filtro por tipo de unidad -->
      <div class="unidades-filter">
        <label>
          <i class="fas fa-ruler"></i>
          Tipo de Unidad:
        </label>
        <select v-model="filtros.tipoUnidad" @change="filtrarPorTipoUnidad" class="select-unidad">
          <option value="">Todos los tipos</option>
          <option v-for="tipo in tiposUnidadDisponibles" :key="tipo.value" :value="tipo.value">
            {{ tipo.label }}
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
        :key="`${servicio.servicios_id}-${formularioKey}`"
        :servicio="servicio"
        v-model="cantidades[servicio.servicios_id]"
        :cantidadEquipos="cantidadesEquipos[servicio.servicios_id]"
        :precioVenta="preciosVenta[servicio.servicios_id]"
        :añosContrato="añosContrato"
        @update:cantidadEquipos="actualizarCantidadEquipos(servicio.servicios_id, $event)"
        @update:precioVenta="actualizarPrecioVenta(servicio.servicios_id, $event)"
        @update:cantidadesPorTipo="actualizarCantidadesPorTipo($event)"
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

  <!-- TOAST DE NOTIFICACIONES -->
  <div v-if="showToast" class="toast-notification" :class="toastType">
    <i :class="toastIcon"></i>
    <span>{{ toastMessage }}</span>
    <button @click="hideToast" class="toast-close">×</button>
  </div>
</div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
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
  const route = useRoute()
  
  // Estados reactivos
  const servicios = ref([])
  const serviciosOriginales = ref([])
  const loading = ref(false)
  const loadingServicios = ref(false)
  const loadingMessage = ref('')
  
  const cantidades = reactive({})
  const cantidadesEquipos = reactive({})
  const preciosVenta = reactive({})
  
  // ✅ NUEVO: Estados para manejar cantidades por categoría
  const cantidadesPorCategoria = reactive({})
  
  // ✅ NUEVO: Key reactivo para forzar re-render
  const formularioKey = ref(0)
  
  const serviciosSeleccionados = ref([])
  const añosContrato = ref(1)
  
  // Estados para duplicación
  const esDuplicacion = ref(false)
  const cotizacionOrigen = ref(null)
  
  // TOAST SYSTEM
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('success') // success, error, warning, info
  
  // Filtros con tipo de unidad
  const filtros = reactive({
    busqueda: '',
    categoria: '',
    tipoUnidad: '',
    rangoPrecio: ''
  })
  
  // Paginación
  const paginaActual = ref(1)
  const serviciosPorPagina = ref(9)
  const paginaInput = ref(1)
  
  // Cache para búsquedas
  const cacheResultados = reactive({})
  const timeoutBusqueda = ref(null)
  // COMPUTED PARA TOAST
  const toastIcon = computed(() => {
    const iconos = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return iconos[toastType.value] || 'fas fa-info-circle';
  })
  // MÉTODOS DE TOAST
  const mostrarToast = (mensaje, tipo = 'info') => {
    toastMessage.value = mensaje
    toastType.value = tipo
    showToast.value = true
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      hideToast()
    }, 5000)
  }
  const hideToast = () => {
    showToast.value = false
  }
  // Helper para determinar tipo de unidad de un servicio
  const obtenerTipoUnidad = (servicio) => {
    return servicio.categoria?.unidad_medida?.tipo || 'cantidad'
  }
  // ===== VERIFICACIÓN DE DUPLICACIÓN =====
  const verificarDuplicacion = async () => {
    console.log('🔍 Verificando si es duplicación...', route.query)
    
    if (route.query.duplicar === 'true') {
      console.log('📋 Es una duplicación, cargando datos...')
      esDuplicacion.value = true
      cotizacionOrigen.value = route.query.origen
      await cargarDatosParaDuplicar()
    } else {
      console.log('📄 Creación normal de cotización')
      esDuplicacion.value = false
      await cargarServicios()
    }
  }
  const cargarDatosParaDuplicar = async () => {
    try {
      loading.value = true
      loadingMessage.value = 'Cargando datos para duplicar...'
      
      // Obtener datos del sessionStorage
      const datosGuardados = sessionStorage.getItem('datosParaDuplicar')
      
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados)
        
        console.log('✅ Datos para duplicar encontrados:', datos)
        
        // Cargar servicios primero
        await cargarServicios()
        
        // Luego precargar el formulario
        await precargarFormulario(datos)
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('datosParaDuplicar')
        
        mostrarToast(`Cotización duplicada exitosamente desde ${cotizacionOrigen.value}`, 'success')
        
      } else {
        console.warn('⚠️ No se encontraron datos para duplicar, cargando normalmente')
        mostrarToast('No se encontraron datos para duplicar', 'warning')
        await cargarServicios()
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos para duplicar:', error)
      mostrarToast('Error cargando datos para duplicar', 'error')
      await cargarServicios()
    } finally {
      loading.value = false
      loadingMessage.value = ''
    }
  }
  // ✅ ACTUALIZADO: Precarga con manejo de categorías
  const precargarFormulario = async (datos) => {
    console.log('🔄 Precargando formulario con datos:', datos)
    
    try {
      // PASO 1: Configurar años del contrato
      if (datos.servicios && datos.servicios.length > 0) {
        añosContrato.value = datos.servicios[0].cantidadAnos || 1
      }
      
      // PASO 2: Precargar servicios usando datos directos
      if (datos.servicios && datos.servicios.length > 0) {
        for (const servicioData of datos.servicios) {
          const servicioId = servicioData.id
          
          const servicioExistente = servicios.value.find(s => s.servicios_id === servicioId)
          
          if (servicioExistente) {
            console.log(`📝 Precargando servicio: ${servicioExistente.nombre}`)
            
            // Configurar cantidad principal (para compatibilidad)
            cantidades[servicioId] = servicioData.cantidadServicios || 0
            cantidadesEquipos[servicioId] = servicioData.cantidadEquipos || 0
            preciosVenta[servicioId] = servicioData.precioUsadoOriginal || 0
            
            // ✅ NUEVO: Configurar cantidades por categoría si están disponibles
            if (servicioData.cantidadesPorCategoria) {
              cantidadesPorCategoria[servicioId] = { ...servicioData.cantidadesPorCategoria }
            }
            
            console.log(`✅ Servicio ${servicioExistente.nombre} configurado:`, {
              cantidadPrincipal: cantidades[servicioId],
              cantidadEquipos: cantidadesEquipos[servicioId],
              precioUsado: preciosVenta[servicioId],
              cantidadesPorCategoria: cantidadesPorCategoria[servicioId]
            })
          }
        }
      }
      
      await nextTick()
      console.log('✅ Formulario precargado exitosamente')
      
    } catch (error) {
      console.error('❌ Error precargando formulario:', error)
      mostrarToast('Error precargando formulario', 'error')
      throw error
    }
  }
  // Función para resetear paginación
  const resetearPaginacion = () => {
    paginaActual.value = 1
    paginaInput.value = 1
  }
  // ===== FUNCIÓN CARGAR SERVICIOS =====
 const cargarServicios = async (params = {}) => {
  try {
    console.log('🔄 Iniciando carga de servicios...')
    const resultado = await serviciosService.getServiciosWithExpandedCategories({
      estado: 'activo',
      limit: 100,
      ...params
    })
    if (resultado.success) {
      servicios.value = resultado.servicios
      serviciosOriginales.value = [...servicios.value]
      
      // 🔥 DEBUG TEMPORAL - AGREGAR ESTO
      console.log('🔥 ESTRUCTURA DE SERVICIOS CARGADOS:', servicios.value)
      if (servicios.value.length > 0) {
        console.log('🔥 PRIMER SERVICIO DETALLADO:', servicios.value[0])
        console.log('🔥 CATEGORIAS_COMPLETAS:', servicios.value[0].categorias_completas)
      }
      
      inicializarDatos()
      console.log('✅ Servicios cargados:', servicios.value.length)
    }
  } catch (err) {
    console.error('❌ Error cargando servicios:', err)
  }
}
  // ===== FUNCIÓN BUSCAR =====
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
          cacheResultados[termino] = resultado.servicios
          servicios.value = resultado.servicios
          aplicarFiltros()
          console.log(`🔍 Búsqueda "${termino}": ${resultado.servicios.length} resultados`)
          
          mostrarToast(`${resultado.servicios.length} servicios encontrados para "${termino}"`, 'info')
        } else {
          throw new Error(resultado.message)
        }
      } catch (err) {
        console.error('❌ Error en búsqueda:', err)
        mostrarToast('Error en la búsqueda de servicios', 'error')
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
  // Función para filtrar por tipo de unidad
  const filtrarPorTipoUnidad = () => {
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
        // ✅ NUEVO: Inicializar cantidades por categoría
        cantidadesPorCategoria[id] = {}
      }
    })
  }
  // Función recargar servicios
  const recargarServicios = () => {
    mostrarToast('Recargando servicios...', 'info')
    cargarServicios()
  }
  // ✅ NUEVO: Computed properties con tipo de unidad
  const categoriasDisponibles = computed(() => {
    const categorias = [...new Set(servicios.value.map(s => s.categoria?.nombre || 'Sin categoría'))]
    return categorias.map(cat => ({
      value: cat,
      label: cat
    })).sort((a, b) => a.label.localeCompare(b.label))
  })
  // Tipos de unidad disponibles
  const tiposUnidadDisponibles = computed(() => {
    const tipos = [...new Set(servicios.value.map(s => s.categoria?.unidad_medida?.tipo || 'cantidad'))]
    
    const etiquetas = {
      'cantidad': 'Cantidad/Equipos',
      'capacidad': 'Capacidad (GB/TB)',
      'usuarios': 'Usuarios',
      'sesiones': 'Sesiones',
      'tiempo': 'Tiempo'
    }
    
    return tipos.map(tipo => ({
      value: tipo,
      label: etiquetas[tipo] || tipo
    })).sort((a, b) => a.label.localeCompare(b.label))
  })
  const serviciosFiltrados = computed(() => {
    let filtrados = [...servicios.value]
    if (filtros.categoria) {
      filtrados = filtrados.filter(servicio => 
        (servicio.categoria?.nombre || 'Sin categoría') === filtros.categoria
      )
    }
    if (filtros.tipoUnidad) {
      filtrados = filtrados.filter(servicio => 
        obtenerTipoUnidad(servicio) === filtros.tipoUnidad
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
    return filtros.busqueda || filtros.categoria || filtros.tipoUnidad || filtros.rangoPrecio
  })
  // ✅ CORREGIDO: Verificar servicios usando cantidades por categoría
  const hayServicios = computed(() => {
    // Verificar si hay cantidades por categoría
    const cantidadesPorCategoriaTotales = Object.values(cantidadesPorCategoria).some(categoriasServicio => 
      Object.values(categoriasServicio).some(cantidad => cantidad > 0)
    )
    
    return cantidadesPorCategoriaTotales
  })
  // ✅ ACTUALIZADO: Método para actualizar cantidades por categoría
  const actualizarCantidadesPorTipo = (datosActualizacion) => {
    const { servicioId, cantidadesPorCategoria: categorias, categoriasDetalle } = datosActualizacion
    
    console.log(`📊 Actualizando cantidades para servicio ${servicioId}:`, categorias)
    
    // Actualizar cantidades por categoría
    cantidadesPorCategoria[servicioId] = { ...categorias }
    
    // ✅ NUEVO: Guardar detalles de categorías para el resultado
    if (!window.categoriasDetallePorServicio) {
      window.categoriasDetallePorServicio = {}
    }
    window.categoriasDetallePorServicio[servicioId] = categoriasDetalle || []
    
    console.log(`✅ Categorías detalladas guardadas:`, window.categoriasDetallePorServicio[servicioId])
  }
  // Métodos existentes
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
   mostrarToast('Búsqueda limpiada', 'info')
 }
 const limpiarFiltros = () => {
   filtros.busqueda = ''
   filtros.categoria = ''
   filtros.tipoUnidad = ''
   filtros.rangoPrecio = ''
   servicios.value = [...serviciosOriginales.value]
   resetearPaginacion()
   mostrarToast('Filtros limpiados', 'info')
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
    mostrarToast(`Por favor ingresa un número entre 1 y ${totalPaginas.value}`, 'warning')
    paginaInput.value = paginaActual.value
  }
}
// ✅ FUNCIÓN PRINCIPAL CORREGIDA: calcularCotizacion con cantidades por categoría
const calcularCotizacion = () => {
 serviciosSeleccionados.value = servicios.value
   .filter(servicio => {
     const id = servicio.servicios_id
     const categorias = cantidadesPorCategoria[id] || {}
     const tieneCantidades = Object.values(categorias).some(cantidad => cantidad > 0)
     return tieneCantidades
   })
   .map(servicio => {
     const id = servicio.servicios_id
     const precioVentaFinal = preciosVenta[id] || servicio.precio_recomendado || servicio.precio_minimo
     const categorias = cantidadesPorCategoria[id] || {}
     
     // ✅ OBTENER DETALLES DE CATEGORÍAS
     const categoriasDetalle = window.categoriasDetallePorServicio?.[id] || []
     
     console.log(`🔥 DEBUG MAPEO - Servicio ${servicio.nombre}:`, {
       categorias,
       categoriasDetalle
     })
     
     // ✅ CREAR OBJETO BASE CON CANTIDADES INICIALIZADAS
     const datosServicio = {
       servicio: {
         servicios_id: id,
         nombre: servicio.nombre,
         categoria: servicio.categoria?.nombre || 'Sin categoría',
         precioMinimo: servicio.precio_minimo,
         precio_recomendado: servicio.precio_recomendado,
         descripcion: servicio.descripcion,
         unidad_medida: servicio.categoria?.unidad_medida
       },
       precioVentaFinal,
       añosContrato: añosContrato.value
     }
     
     // ✅ INICIALIZAR CANTIDADES CON VALORES QUE SERÁN ACTUALIZADOS
     let cantidadServidores = 0
     let cantidadEquipos = 0
     let cantidadGb = 0
     let cantidadUsuarios = 0
     let cantidadSesiones = 0
     let cantidadTiempo = 0
     
     // ✅ MAPEAR CATEGORÍAS A CAMPOS ESPECÍFICOS
     categoriasDetalle.forEach(categoria => {
       if (categoria.cantidad > 0) {
         console.log(`🎯 Mapeando categoría: ${categoria.unidad_nombre} (${categoria.unidad_tipo}) = ${categoria.cantidad}`)
         
         switch (categoria.unidad_tipo) {
           case 'capacidad':
             cantidadGb = categoria.cantidad
             cantidadServidores = categoria.cantidad // Para compatibilidad con fallback
             break
           case 'usuarios':
             cantidadUsuarios = categoria.cantidad
             cantidadServidores = categoria.cantidad // Para compatibilidad con fallback
             break
           case 'sesiones':
             cantidadSesiones = categoria.cantidad
             cantidadServidores = categoria.cantidad // Para compatibilidad con fallback
             break
           case 'tiempo':
             cantidadTiempo = categoria.cantidad
             cantidadServidores = categoria.cantidad // Para compatibilidad con fallback
             break
           case 'cantidad':
           default:
             if (categoria.unidad_nombre.toLowerCase().includes('equipo')) {
               cantidadEquipos = categoria.cantidad
             } else {
               cantidadServidores = categoria.cantidad
             }
             break
         }
       }
     })
     
     // ✅ ASIGNAR LAS CANTIDADES FINALES AL OBJETO
     datosServicio.cantidadServidores = cantidadServidores
     datosServicio.cantidadEquipos = cantidadEquipos
     datosServicio.cantidadGb = cantidadGb
     datosServicio.cantidadUsuarios = cantidadUsuarios
     datosServicio.cantidadSesiones = cantidadSesiones
     datosServicio.cantidadTiempo = cantidadTiempo
     
     // ✅ DATOS PARA EL FRONTEND
     datosServicio.cantidadesPorCategoria = categorias
     datosServicio.categoriasDetalle = categoriasDetalle
     datosServicio.totalUnidadesParaPrecio = Object.values(categorias).reduce((sum, cant) => sum + cant, 0)
     
     console.log(`🔥 SERVICIO FINAL PARA BACKEND:`, datosServicio)
     return datosServicio
   })
 console.log('🔥 SERVICIOS FINALES PARA BACKEND:', serviciosSeleccionados.value)
 
 if (serviciosSeleccionados.value.length > 0) {
   mostrarToast(`Cotización calculada con ${serviciosSeleccionados.value.length} servicio${serviciosSeleccionados.value.length > 1 ? 's' : ''}`, 'success')
 } else {
   mostrarToast('Debes seleccionar al menos un servicio', 'warning')
 }
}
// Al final del método calcularCotizacion() en CotizacionForm.vue:
console.log('🔥 DEBUG FINAL - serviciosSeleccionados:', JSON.stringify(serviciosSeleccionados.value, null, 2))

// ✅ MÉTODO CORREGIDO: limpiarFormulario con key reactivo
const limpiarFormulario = () => {
  servicios.value.forEach(servicio => {
    const id = servicio.servicios_id
    cantidades[id] = 0
    cantidadesEquipos[id] = 0
    preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
    // ✅ LIMPIAR: Cantidades por categoría
    cantidadesPorCategoria[id] = {}
  })
  
  serviciosSeleccionados.value = []
  añosContrato.value = 1
  esDuplicacion.value = false
  cotizacionOrigen.value = null
  
  // ✅ LIMPIAR: Datos de categorías detalladas
  if (window.categoriasDetallePorServicio) {
    window.categoriasDetallePorServicio = {}
  }
  
  // ✅ FORZAR RE-RENDER de todos los ServicioItem
  formularioKey.value++
  
  console.log('🧹 Formulario limpiado completamente')
  mostrarToast('Formulario limpiado correctamente', 'success')
}
// ===== CICLO DE VIDA =====
onMounted(async () => {
  console.log('🚀 Componente montado')
  console.log('🔍 Query params:', route.query)
  
  await verificarDuplicacion()
})
// Watchers
watch([() => filtros.categoria, () => filtros.tipoUnidad, () => filtros.rangoPrecio], () => {
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
  cantidades,
  cantidadesEquipos,
  preciosVenta,
  serviciosSeleccionados,
  añosContrato,
  filtros,
  paginaActual,
  serviciosPorPagina,
  paginaInput,
  
  // ✅ NUEVOS: Estados de cantidades por categoría
  cantidadesPorCategoria,
  formularioKey, // ✅ NUEVO: Key reactivo
  
  // Estados de duplicación
  esDuplicacion,
  cotizacionOrigen,
  
  // TOAST STATES
  showToast,
  toastMessage,
  toastType,
  
  // Computed
  categoriasDisponibles,
  tiposUnidadDisponibles,
  serviciosFiltrados,
  totalPaginas,
  serviciosPaginados,
  paginasVisibles,
  hayFiltrosActivos,
  hayServicios,
  toastIcon,
  
  // Funciones
  cargarServicios,
  buscarServicios,
  aplicarFiltros,
  filtrarPorCategoria,
  filtrarPorTipoUnidad,
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
  limpiarFormulario,
  
  // ✅ NUEVO: Función para manejar cantidades por categoría
  actualizarCantidadesPorTipo,
  
  // Funciones de duplicación
  verificarDuplicacion,
  cargarDatosParaDuplicar,
  precargarFormulario,
  
  // TOAST METHODS
  mostrarToast,
  hideToast,
  
  // HELPERS
  obtenerTipoUnidad
}
}
}
</script>

<style scoped>
/* Estilos para el nuevo filtro de unidades */
.unidades-filter {
display: flex;
flex-direction: column;
}

.unidades-filter label {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.5rem;
font-weight: 600;
color: #495057;
font-size: 0.9rem;
}

.unidades-filter label i {
color: #6c757d;
}

.select-unidad {
width: 100%;
padding: 0.75rem;
border: 2px solid #e9ecef;
border-radius: 8px;
font-size: 1rem;
background: white;
color: #495057;
transition: all 0.2s;
}

.select-unidad:focus {
outline: none;
border-color: #007bff;
box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Actualizar grid de filtros para incluir el nuevo filtro */
.filtros-content {
display: grid;
grid-template-columns: 2fr 1fr 1fr 1fr auto;
gap: 1rem;
align-items: end;
}

/* Responsive para el nuevo filtro */
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
}

/* MANTENER TODOS LOS DEMÁS ESTILOS EXISTENTES... */
.cotizacion-form-container {
width: 100%;
max-width: 1400px;
margin: 0 auto;
padding: 0;
box-sizing: border-box;
}

/* Loading overlay */
.loading-overlay {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background: rgba(0, 0, 0, 0.7);
display: flex;
justify-content: center;
align-items: center;
z-index: 9999;
backdrop-filter: blur(3px);
}

.loading-spinner {
text-align: center;
color: white;
}

.loading-spinner i {
font-size: 3rem;
margin-bottom: 1rem;
animation: spin 1s linear infinite;
}

.loading-spinner p {
font-size: 1.1rem;
margin: 0;
}

@keyframes spin {
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
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

/* TOAST NOTIFICATIONS */
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

/* Estados de carga */
.servicios-grid.loading {
opacity: 0.7;
pointer-events: none;
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

/* TOAST RESPONSIVE */
.toast-notification {
  top: 1rem;
  right: 1rem;
  left: 1rem;
  max-width: none;
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
.form-actions,
.toast-notification {
  display: none;
}

.servicios-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
}
</style>