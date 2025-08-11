<template>
<div class="cotizacion-form-container">
 <!-- Loading overlay -->
 <div v-if="loading" class="loading-overlay">
   <div class="loading-spinner">
     <i class="fas fa-spinner fa-spin"></i>
     <p>{{ loadingMessage }}</p>
   </div>
 </div>

 <!-- Selector de meses global -->
 <div class="meses-selector">
   <div class="meses-container">
     <label for="meses-contrato">
       <i class="fas fa-calendar-alt"></i>
       Duración del contrato (meses):
     </label>
     <div class="meses-controls">
       <button @click="decrementarMeses" :disabled="mesesContrato <= 1" class="btn-meses">
         <i class="fas fa-minus"></i>
       </button>
       <input 
         v-model.number="mesesContrato" 
         type="number" 
         min="1"
         class="input-meses"
         @input="validarMeses"
         @keydown="handleKeydown"
         @focus="handleFocus"
       >
       <button @click="incrementarMeses" class="btn-meses">
         <i class="fas fa-plus"></i>
       </button>
     </div>
     <small class="meses-info">
       <i class="fas fa-info-circle"></i>
       Todos los servicios se contratarán por {{ mesesContrato }} mes{{ mesesContrato > 1 ? 'es' : '' }}
     </small>
   </div>
 </div>

 <!-- Indicador de servicios acumulados -->
 <div v-if="totalServiciosAcumulados > 0" class="servicios-acumulados-indicator">
   <div class="indicator-content">
     <i class="fas fa-shopping-cart"></i>
     <span class="indicator-text">
       {{ totalServiciosAcumulados }} servicio{{ totalServiciosAcumulados > 1 ? 's' : '' }} en la cotización
     </span>
     <button @click="limpiarServiciosAcumulados" class="btn-limpiar-acumulados" title="Limpiar todos los servicios">
       <i class="fas fa-trash"></i>
       Limpiar Todo
     </button>
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
           placeholder="Buscar por nombre..."
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
         <option v-for="rango in rangosPrecioDisponibles" :key="rango.value" :value="rango.value">
           {{ rango.label }}
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
       <span v-if="totalServiciosAcumulados > 0" class="servicios-badge">
         {{ totalServiciosAcumulados }} en cotización
       </span>
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
       :mesesContrato="mesesContrato"
       :yaSeleccionado="esServicioSeleccionado(servicio.servicios_id)"
       @update:cantidadEquipos="actualizarCantidadEquipos(servicio.servicios_id, $event)"
       @update:precioVenta="actualizarPrecioVenta(servicio.servicios_id, $event)"
       @update:cantidadesPorTipo="actualizarCantidadesPorTipo($event)"
       @mostrar-notificacion="mostrarNotificacionHijo"
       @remover-servicio="removerServicioSeleccionado(servicio.servicios_id)"
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

 <!-- Mostrar errores de límites globales -->
 <div v-if="tieneErroresGlobales" class="errores-limites">
   <div class="error-header">
     <i class="fas fa-exclamation-triangle"></i>
     <h4>Errores de Límites de Cantidad</h4>
   </div>
   <p>Algunos servicios tienen cantidades fuera de los límites permitidos. Corrige estos errores antes de continuar:</p>
   <ul class="error-list">
     <li v-for="(servicioErrores, servicioId) in validacionErrores" :key="servicioId">
       <div v-for="(error, categoriaId) in servicioErrores" :key="categoriaId">
         <strong v-if="!error.esValido">
           {{ obtenerNombreServicio(servicioId) }}: {{ error.mensaje }}
         </strong>
       </div>
     </li>
   </ul>
 </div>

<div class="form-actions">
</div>

 <ResultadoCotizacion
   :servicios-seleccionados="serviciosSeleccionados"
   :meses-contrato="mesesContrato"
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
 
 // Estados para manejar cantidades por categoría
 const cantidadesPorCategoria = reactive({})
 
 // Key reactivo para forzar re-render
 const formularioKey = ref(0)
 
 const serviciosSeleccionados = ref([])
 const mesesContrato = ref(12)
 
 // ===== NUEVOS ESTADOS PARA ACUMULACIÓN DE SERVICIOS =====
 const serviciosSeleccionadosAcumulados = ref([])
 const serviciosIdsSeleccionados = ref(new Set())
 
 // Estados para duplicación
 const esDuplicacion = ref(false)
 const cotizacionOrigen = ref(null)
 
 // Estados para validación de límites
 const validacionErrores = reactive({})
 
 // TOAST SYSTEM
 const showToast = ref(false)
 const toastMessage = ref('')
 const toastType = ref('success')
 
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

 // Computed para verificar errores de límites globales
 const tieneErroresGlobales = computed(() => {
   return Object.values(validacionErrores).some(servicioErrores => 
     Object.values(servicioErrores).some(error => !error.esValido)
   )
 })

 // ===== NUEVOS COMPUTED PARA SERVICIOS ACUMULADOS =====
 const esServicioSeleccionado = computed(() => {
   return (servicioId) => serviciosIdsSeleccionados.value.has(servicioId)
 })

 const totalServiciosAcumulados = computed(() => {
   return serviciosSeleccionadosAcumulados.value.length
 })

 const hayServiciosAcumulados = computed(() => {
   return serviciosSeleccionadosAcumulados.value.length > 0
 })

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

 // ===== NUEVOS MÉTODOS PARA MANEJO DE SERVICIOS ACUMULADOS =====
 const agregarServicioSeleccionado = (servicioData) => {
   const servicioId = servicioData.servicio.servicios_id
   
   // Si ya existe, actualizarlo en lugar de duplicar
   const indiceExistente = serviciosSeleccionadosAcumulados.value.findIndex(
     item => item.servicio.servicios_id === servicioId
   )
   
   if (indiceExistente !== -1) {
     // Actualizar servicio existente
     serviciosSeleccionadosAcumulados.value[indiceExistente] = servicioData
     console.log(`✅ Servicio actualizado: ${servicioData.servicio.nombre}`)
     mostrarToast(`Servicio "${servicioData.servicio.nombre}" actualizado en la cotización`, 'info')
   } else {
     // Agregar nuevo servicio
     serviciosSeleccionadosAcumulados.value.push(servicioData)
     serviciosIdsSeleccionados.value.add(servicioId)
     console.log(`✅ Servicio agregado: ${servicioData.servicio.nombre}`)
     mostrarToast(`Servicio "${servicioData.servicio.nombre}" agregado a la cotización`, 'success')
   }
 }

 const removerServicioSeleccionado = (servicioId) => {
   const indice = serviciosSeleccionadosAcumulados.value.findIndex(
     item => item.servicio.servicios_id === servicioId
   )
   
   if (indice !== -1) {
     const nombreServicio = serviciosSeleccionadosAcumulados.value[indice].servicio.nombre
     serviciosSeleccionadosAcumulados.value.splice(indice, 1)
     serviciosIdsSeleccionados.value.delete(servicioId)
     console.log(`❌ Servicio removido: ${nombreServicio}`)
     mostrarToast(`Servicio "${nombreServicio}" removido de la cotización`, 'warning')
     
     // Limpiar cantidades del servicio removido
     if (cantidades[servicioId]) {
       cantidades[servicioId] = 0
     }
     if (cantidadesEquipos[servicioId]) {
       cantidadesEquipos[servicioId] = 0
     }
     if (cantidadesPorCategoria[servicioId]) {
       cantidadesPorCategoria[servicioId] = {}
     }
     
     // Actualizar serviciosSeleccionados para el componente ResultadoCotizacion
     serviciosSeleccionados.value = [...serviciosSeleccionadosAcumulados.value]
   }
 }

 const limpiarServiciosAcumulados = () => {
   serviciosSeleccionadosAcumulados.value = []
   serviciosIdsSeleccionados.value.clear()
   serviciosSeleccionados.value = []
   mostrarToast('Todos los servicios removidos de la cotización', 'info')
 }

 // Helper para obtener nombre del servicio por ID
 const obtenerNombreServicio = (servicioId) => {
   const servicio = servicios.value.find(s => s.servicios_id == servicioId)
   return servicio ? servicio.nombre : `Servicio #${servicioId}`
 }

 // Manejar notificaciones de ServicioItem
 const mostrarNotificacionHijo = (notificacion) => {
   mostrarToast(notificacion.mensaje, notificacion.tipo)
 }

 // MÉTODOS DE TOAST
 const mostrarToast = (mensaje, tipo = 'info') => {
   toastMessage.value = mensaje
   toastType.value = tipo
   showToast.value = true
   
   setTimeout(() => {
     hideToast()
   }, 5000)
 }

 const hideToast = () => {
   showToast.value = false
 }

 // Métodos para manejar el input de meses
 const handleKeydown = (event) => {
   if (event.key === 'Backspace' || event.key === 'Delete') {
     return
   }
 }

 const handleFocus = (event) => {
   event.target.select()
 }

 // Helper para determinar tipo de unidad de un servicio
 const obtenerTipoUnidad = (servicio) => {
   return servicio.categoria?.unidad_medida?.tipo || 'cantidad'
 }

 // 🔧 ACTUALIZADO: Formatear moneda con soporte para 4 decimales
 const formatCurrency = (amount) => {
   if (amount === null || amount === undefined) return '$0.00';
   
   // Convertir a número para hacer las verificaciones
   const numero = parseFloat(amount);
   
   // Verificar si tiene más de 2 decimales significativos
   const tieneDecimalesExtras = (numero * 10000) % 100 !== 0;
   
   // Si tiene decimales extras (más de 2), mostrar 4 decimales, sino mostrar 2
   const decimales = tieneDecimalesExtras ? 4 : 2;
   
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     minimumFractionDigits: 2,
     maximumFractionDigits: decimales
   }).format(numero);
 }

 // Reinicializar precios correctamente
 const reinicializarPrecios = () => {
   servicios.value.forEach(servicio => {
     const id = servicio.servicios_id
     if (!preciosVenta[id] || preciosVenta[id] === 0) {
       preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
     }
   })
 }

 // ===== VERIFICACIÓN DE DUPLICACIÓN =====
 const verificarDuplicacion = async () => {
   
   if (route.query.duplicar === 'true') {
     esDuplicacion.value = true
     cotizacionOrigen.value = route.query.origen
     await cargarDatosParaDuplicar()
   } else {
     esDuplicacion.value = false
     await cargarServicios()
   }
 }

const cargarDatosParaDuplicar = async () => {
 try {
   loading.value = true
   loadingMessage.value = 'Cargando datos para duplicar...'
   
   const datosGuardados = sessionStorage.getItem('datosParaDuplicar')
   
   if (datosGuardados) {
     const datos = JSON.parse(datosGuardados)
     // Primero cargar servicios completamente
     await cargarServicios()
     
     // Esperar múltiples ticks para asegurar que todo esté inicializado
     await nextTick()
     await nextTick()
     await nextTick()

     if (servicios.value.length > 0) {
       // Ahora sí precargar el formulario
       await precargarFormulario(datos)
     } else {
       console.error('❌ No se pudieron cargar los servicios')
       mostrarToast('Error: No se pudieron cargar los servicios', 'error')
     }
     
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

const precargarFormulario = async (datos) => {
 try {
   // Cargar meses en lugar de años
   if (datos.servicios && datos.servicios.length > 0) {
mesesContrato.value = datos.servicios[0].cantidadMeses || datos.servicios[0].cantidadAnos || 12
   }
   
   // Verificar que los servicios estén cargados
   if (servicios.value.length === 0) {
     console.error('❌ Servicios aún no están cargados, abortando precarga')
     return
   }
   
   if (datos.servicios && datos.servicios.length > 0) {
     for (const servicioData of datos.servicios) {
       const servicioId = servicioData.id

       const servicioExistente = servicios.value.find(s => s.servicios_id === servicioId)
       
       if (servicioExistente) {
         // Usar cantidadPorCategoria
         const cantidad = servicioData.cantidadPorCategoria || servicioData.cantidadServicios || 0

         // Configurar todas las cantidades
         cantidades[servicioId] = cantidad
         cantidadesEquipos[servicioId] = servicioData.cantidadEquipos || 0
         preciosVenta[servicioId] = servicioData.precioUsadoOriginal || servicioData.precioRecomendado || 0

         // Configurar cantidades por categoría
         if (cantidad > 0) {
           const categoriaId = servicioData.categoriaId || servicioExistente.categoria?.categorias_id

           if (categoriaId) {
             // Asegurar que el objeto existe
             if (!cantidadesPorCategoria[servicioId]) {
               cantidadesPorCategoria[servicioId] = {}
             }
             
             cantidadesPorCategoria[servicioId][categoriaId] = cantidad

             // Configurar categorías detalle
             if (!window.categoriasDetallePorServicio) {
               window.categoriasDetallePorServicio = {}
             }
             
             window.categoriasDetallePorServicio[servicioId] = [{
               categoria_id: categoriaId,
               categoria_nombre: servicioExistente.categoria?.nombre || 'Sin categoría',
               unidad_id: servicioData.unidadMedida?.id || servicioExistente.categoria?.unidad_medida?.unidades_medida_id,
               unidad_nombre: servicioData.unidadMedida?.nombre || servicioExistente.categoria?.unidad_medida?.nombre,
               unidad_abreviacion: servicioData.unidadMedida?.abreviacion || servicioExistente.categoria?.unidad_medida?.abreviacion,
               unidad_tipo: servicioData.unidadMedida?.tipo || servicioExistente.categoria?.unidad_medida?.tipo,
               cantidad: cantidad,
               limite_minimo: servicioExistente.limite_minimo || 1,
               limite_maximo: servicioExistente.limite_maximo || null
             }]
           }
         }
         
       } else {
         console.error(`❌ Servicio ${servicioId} NO ENCONTRADO en la lista actual`)
       }
     }
   }
   
   await nextTick()
   
   // Forzar re-render con múltiples cambios
   formularioKey.value++
   
   await nextTick()
   await nextTick()
   
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
     const resultado = await serviciosService.getServiciosWithExpandedCategories({
       estado: 'activo',
       limit: 99999999,
       ...params
     })
     if (resultado.success) {
       servicios.value = resultado.servicios
       serviciosOriginales.value = [...servicios.value]
       
       inicializarDatos()
     }
   } catch (err) {
     console.error('❌ Error cargando servicios:', err)
   }
 }

// ===== FUNCIÓN BUSCAR CORREGIDA =====
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
        // ✅ CORRECCIÓN PRINCIPAL: usar servicioOriginal completo
        const serviciosConPreciosCorrectos = resultado.servicios.map(servicioEncontrado => {
          const servicioOriginal = serviciosOriginales.value.find(
            orig => orig.servicios_id === servicioEncontrado.servicios_id
          )
          
          if (servicioOriginal) {
            return {
              ...servicioOriginal, // ✅ USAR EL ORIGINAL COMPLETO (tiene categorías)
              // Solo sobrescribir campos específicos si es necesario
              precio_minimo: servicioOriginal.precio_minimo,
              precio_recomendado: servicioOriginal.precio_recomendado,
              precioMinimo: servicioOriginal.precioMinimo || servicioOriginal.precio_minimo,
              precioRecomendado: servicioOriginal.precioRecomendado || servicioOriginal.precio_recomendado
            }
          }
          
          // ⚠️ FALLBACK: si no está en originales, usar el encontrado (puede no tener categorías completas)
          console.warn(`⚠️ Servicio ${servicioEncontrado.servicios_id} no encontrado en originales`)
          return servicioEncontrado
        })
        
        cacheResultados[termino] = serviciosConPreciosCorrectos
        servicios.value = serviciosConPreciosCorrectos
        aplicarFiltros()
        
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
      cantidadesPorCategoria[id] = {}
    } else {
      if (!preciosVenta[id] || preciosVenta[id] === 0) {
        preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
      }
    }
  })
}

// Función recargar servicios
const recargarServicios = () => {
  mostrarToast('Recargando servicios...', 'info')
  cargarServicios()
}

// COMPUTED PROPERTIES ACTUALIZADOS
const categoriasDisponibles = computed(() => {
  const categorias = [...new Set(servicios.value.map(s => s.categoria?.nombre || 'Sin categoría'))]
  return categorias.map(cat => ({
    value: cat,
    label: cat
  })).sort((a, b) => a.label.localeCompare(b.label))
})

// Tipos de unidad dinámicos basados en servicios reales
const tiposUnidadDisponibles = computed(() => {
  const tiposSet = new Set()
  
  servicios.value.forEach(servicio => {
    // Verificar en categoría principal
    if (servicio.categoria?.unidad_medida?.tipo) {
      tiposSet.add(servicio.categoria.unidad_medida.tipo)
    }
    
    // Verificar en categorías completas (múltiples categorías)
    if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
      servicio.categorias_completas.forEach(categoria => {
        if (categoria.unidad_medida?.tipo) {
          tiposSet.add(categoria.unidad_medida.tipo)
        }
      })
    }
  })
  
  // Mapear tipos a etiquetas descriptivas
  const etiquetas = {
    'cantidad': 'Cantidad/Equipos',
    'capacidad': 'Capacidad (GB/TB)', 
    'usuarios': 'Usuarios',
    'sesiones': 'Sesiones',
    'tiempo': 'Tiempo (Horas/Días)',
    'licencias': 'Licencias',
    'conexiones': 'Conexiones',
    'cuentas': 'Cuentas',
    'dispositivos': 'Dispositivos',
    'almacenamiento': 'Almacenamiento',
    'ancho_banda': 'Ancho de Banda'
  }
  
  return Array.from(tiposSet)
    .map(tipo => ({
      value: tipo,
      label: etiquetas[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

// Rangos de precio dinámicos basados en precios mínimos reales
const rangosPrecioDisponibles = computed(() => {
  // Obtener todos los precios mínimos de servicios activos
  const preciosMinimos = servicios.value
    .filter(servicio => servicio.estado === 'activo')
    .map(servicio => parseFloat(servicio.precio_minimo) || 0)
    .filter(precio => precio > 0)
    .sort((a, b) => a - b)
  
  if (preciosMinimos.length === 0) {
    return []
  }
  
  const min = preciosMinimos[0]
  const max = preciosMinimos[preciosMinimos.length - 1]
  // Calcular cuartiles para rangos dinámicos
  const q1 = preciosMinimos[Math.floor(preciosMinimos.length * 0.25)]
  const q2 = preciosMinimos[Math.floor(preciosMinimos.length * 0.5)]
  const q3 = preciosMinimos[Math.floor(preciosMinimos.length * 0.75)]
  
  return [
    { 
      value: 'economico', 
      label: ` (${formatCurrency(min)} - ${formatCurrency(q1)})`,
     min: min,
     max: q1
   },
   { 
     value: 'medio_bajo', 
     label: `(${formatCurrency(q1)} - ${formatCurrency(q2)})`,
     min: q1,
     max: q2
   },
   { 
     value: 'medio_alto', 
     label: ` (${formatCurrency(q2)} - ${formatCurrency(q3)})`,
     min: q2,
     max: q3
   },
   { 
     value: 'premium', 
     label: ` (${formatCurrency(q3)} - ${formatCurrency(max)})`,
     min: q3,
     max: max
   }
 ]
})

const serviciosFiltrados = computed(() => {
 let filtrados = [...servicios.value]
 
 if (filtros.categoria) {
   filtrados = filtrados.filter(servicio => 
     (servicio.categoria?.nombre || 'Sin categoría') === filtros.categoria
   )
 }
 
 if (filtros.tipoUnidad) {
   filtrados = filtrados.filter(servicio => {
     // Verificar en categoría principal
     if (servicio.categoria?.unidad_medida?.tipo === filtros.tipoUnidad) {
       return true
     }
     
     // Verificar en categorías completas
     if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
       return servicio.categorias_completas.some(categoria => 
         categoria.unidad_medida?.tipo === filtros.tipoUnidad
       )
     }
     
     return false
   })
 }
 
 // Filtro de precio dinámico
 if (filtros.rangoPrecio) {
   const rangoSeleccionado = rangosPrecioDisponibles.value.find(r => r.value === filtros.rangoPrecio)
   
   if (rangoSeleccionado) {
     filtrados = filtrados.filter(servicio => {
       const precio = parseFloat(servicio.precio_minimo) || 0
       return precio >= rangoSeleccionado.min && precio <= rangoSeleccionado.max
     })
   }
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

// MODIFICAR el computed hayServicios para usar solo servicios acumulados
const hayServicios = computed(() => {
  return hayServiciosAcumulados.value && !tieneErroresGlobales.value
})

// Método para actualizar cantidades por categoría con validación Y AGREGAR AUTOMÁTICAMENTE
const actualizarCantidadesPorTipo = (datosActualizacion) => {
  const { servicioId, cantidadesPorCategoria: categorias, categoriasDetalle, validacion } = datosActualizacion

  cantidadesPorCategoria[servicioId] = { ...categorias }
  
  if (validacion) {
    validacionErrores[servicioId] = validacion.errores || {}
  }
  
  if (!window.categoriasDetallePorServicio) {
    window.categoriasDetallePorServicio = {}
  }
  window.categoriasDetallePorServicio[servicioId] = categoriasDetalle || []

  // 🔥 NUEVO: Agregar automáticamente si tiene cantidades válidas
  const tieneCantidadesValidas = Object.values(categorias).some(cantidad => cantidad > 0)
  const tieneErrores = validacion?.tieneErrores || false
  
  if (tieneCantidadesValidas && !tieneErrores) {
    agregarServicioAutomaticamente(servicioId)
  } else if (!tieneCantidadesValidas) {
    // Si no tiene cantidades, remover de la cotización
    removerServicioSeleccionado(servicioId)
  }
}

// 🔥 NUEVO: Método para agregar servicio automáticamente cuando se ponen cantidades
const agregarServicioAutomaticamente = (servicioId) => {
  // Buscar el servicio en la lista actual
  const servicio = servicios.value.find(s => s.servicios_id === servicioId)
  
  if (!servicio) {
    console.warn(`⚠️ No se encontró el servicio ${servicioId} para agregar automáticamente`)
    return
  }

  const precioVentaFinal = preciosVenta[servicioId] || servicio.precio_recomendado || servicio.precio_minimo
  const categorias = cantidadesPorCategoria[servicioId] || {}
  
  const categoriasDetalle = window.categoriasDetallePorServicio?.[servicioId] || []
  
  const datosServicio = {
    servicio: {
      servicios_id: servicioId,
      nombre: servicio.nombre,
      categoria: servicio.categoria?.nombre || 'Sin categoría',
      precioMinimo: servicio.precio_minimo,
      precio_recomendado: servicio.precio_recomendado,
      descripcion: servicio.descripcion,
      unidad_medida: servicio.categoria?.unidad_medida
    },
    precioVentaFinal,
    mesesContrato: mesesContrato.value
  }
  
  let cantidadServidores = 0
  let cantidadEquipos = 0
  let cantidadGb = 0
  let cantidadUsuarios = 0
  let cantidadSesiones = 0
  let cantidadTiempo = 0
  
  categoriasDetalle.forEach(categoria => {
    if (categoria.cantidad > 0) {
      switch (categoria.unidad_tipo) {
        case 'capacidad':
          cantidadGb = categoria.cantidad
          cantidadServidores = categoria.cantidad
          break
        case 'usuarios':
          cantidadUsuarios = categoria.cantidad
          cantidadServidores = categoria.cantidad
          break
        case 'sesiones':
          cantidadSesiones = categoria.cantidad
          cantidadServidores = categoria.cantidad
          break
        case 'tiempo':
          cantidadTiempo = categoria.cantidad
          cantidadServidores = categoria.cantidad
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
  
  datosServicio.cantidadServidores = cantidadServidores
  datosServicio.cantidadEquipos = cantidadEquipos
  datosServicio.cantidadGb = cantidadGb
  datosServicio.cantidadUsuarios = cantidadUsuarios
  datosServicio.cantidadSesiones = cantidadSesiones
  datosServicio.cantidadTiempo = cantidadTiempo
  
  datosServicio.cantidadesPorCategoria = categorias
  datosServicio.categoriasDetalle = categoriasDetalle
  datosServicio.totalUnidadesParaPrecio = Object.values(categorias).reduce((sum, cant) => sum + cant, 0)
  
  // Agregar a la lista acumulada (sin mostrar toast para evitar spam)
  agregarServicioSeleccionadoSilencioso(datosServicio)
  
  // Actualizar serviciosSeleccionados para ResultadoCotizacion
  serviciosSeleccionados.value = [...serviciosSeleccionadosAcumulados.value]
}

// 🔥 NUEVO: Versión silenciosa para agregar servicios automáticamente
const agregarServicioSeleccionadoSilencioso = (servicioData) => {
  const servicioId = servicioData.servicio.servicios_id
  
  // Si ya existe, actualizarlo en lugar de duplicar
  const indiceExistente = serviciosSeleccionadosAcumulados.value.findIndex(
    item => item.servicio.servicios_id === servicioId
  )
  
  if (indiceExistente !== -1) {
    // Actualizar servicio existente silenciosamente
    serviciosSeleccionadosAcumulados.value[indiceExistente] = servicioData
    console.log(`🔄 Servicio actualizado automáticamente: ${servicioData.servicio.nombre}`)
  } else {
    // Agregar nuevo servicio
    serviciosSeleccionadosAcumulados.value.push(servicioData)
    serviciosIdsSeleccionados.value.add(servicioId)
    console.log(`✅ Servicio agregado automáticamente: ${servicioData.servicio.nombre}`)
    mostrarToast(`"${servicioData.servicio.nombre}" agregado a la cotización`, 'success')
  }
}

// Métodos existentes
const actualizarCantidadEquipos = (servicioId, nuevaCantidad) => {
 cantidadesEquipos[servicioId] = nuevaCantidad || 0
}

const actualizarPrecioVenta = (servicioId, nuevoPrecio) => {
 preciosVenta[servicioId] = nuevoPrecio || 0
}

// Funciones de meses en lugar de años
const incrementarMeses = () => {
 mesesContrato.value++
}

const decrementarMeses = () => {
 if (mesesContrato.value > 1) {
   mesesContrato.value--
 }
}

// Método actualizado: validarMeses con mejor manejo
const validarMeses = (event) => {
 const valor = event.target.value
 
 // Si está vacío, no validar aún (permite borrar temporalmente)
 if (valor === '' || valor === null || valor === undefined) {
   return
 }
 
 // Usar nextTick para permitir que el input se procese
 nextTick(() => {
   // Convertir a número
   const meses = parseInt(valor)
   
   // Si es menor a 1 o no es un número válido, resetear a 1
   if (isNaN(meses) || meses < 1) {
     mesesContrato.value = 12
   } else {
     mesesContrato.value = meses
   }
 })
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

// calcularCotizacion SIMPLIFICADO - solo actualiza la vista final
const calcularCotizacion = () => {
  if (tieneErroresGlobales.value) {
    mostrarToast('Corrige los errores de límites de cantidad antes de continuar', 'error')
    return
  }

  // Solo actualizar serviciosSeleccionados con la lista acumulada
  serviciosSeleccionados.value = [...serviciosSeleccionadosAcumulados.value]

  if (totalServiciosAcumulados.value > 0) {
    mostrarToast(`Cotización lista con ${totalServiciosAcumulados.value} servicio${totalServiciosAcumulados.value > 1 ? 's' : ''}`, 'success')
  } else {
    mostrarToast('Agrega servicios poniendo cantidades para crear la cotización', 'info')
  }
}

// limpiarFormulario MODIFICADO para limpiar también servicios acumulados
const limpiarFormulario = () => {
servicios.value.forEach(servicio => {
  const id = servicio.servicios_id
  cantidades[id] = 0
  cantidadesEquipos[id] = 0
  preciosVenta[id] = servicio.precio_recomendado || servicio.precio_minimo || 0
  cantidadesPorCategoria[id] = {}
})

// Limpiar servicios acumulados
limpiarServiciosAcumulados()

mesesContrato.value = 12
esDuplicacion.value = false
cotizacionOrigen.value = null

if (window.categoriasDetallePorServicio) {
  window.categoriasDetallePorServicio = {}
}

Object.keys(validacionErrores).forEach(key => {
  delete validacionErrores[key]
})

formularioKey.value++

mostrarToast('Formulario y cotización limpiados correctamente', 'success')
}

// ===== CICLO DE VIDA =====
onMounted(async () => {

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
mesesContrato,
filtros,
paginaActual,
serviciosPorPagina,
paginaInput,

// Estados de cantidades por categoría
cantidadesPorCategoria,
formularioKey,

agregarServicioAutomaticamente,
  agregarServicioSeleccionadoSilencioso,

// Estados de validación
validacionErrores,
tieneErroresGlobales,

// Estados de duplicación
esDuplicacion,
cotizacionOrigen,

// NUEVOS: Estados y métodos para servicios acumulados
serviciosSeleccionadosAcumulados,
serviciosIdsSeleccionados,
totalServiciosAcumulados,
hayServiciosAcumulados,
esServicioSeleccionado,
agregarServicioSeleccionado,
removerServicioSeleccionado,
limpiarServiciosAcumulados,

// TOAST STATES
showToast,
toastMessage,
toastType,

// Computed
categoriasDisponibles,
tiposUnidadDisponibles,
rangosPrecioDisponibles,
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
reinicializarPrecios,
actualizarCantidadEquipos,
actualizarPrecioVenta,
incrementarMeses,
decrementarMeses,
validarMeses,
limpiarBusqueda,
limpiarFiltros,
cambiarPagina,
irAPagina,
calcularCotizacion,
limpiarFormulario,

// NUEVOS MÉTODOS PARA EL INPUT
handleKeydown,
handleFocus,

// Función para manejar cantidades por categoría
actualizarCantidadesPorTipo,

// Funciones de duplicación
verificarDuplicacion,
cargarDatosParaDuplicar,
precargarFormulario,

// TOAST METHODS
mostrarToast,
hideToast,

// Funciones de validación
obtenerNombreServicio,
mostrarNotificacionHijo,

// HELPERS
obtenerTipoUnidad,
formatCurrency
}
}
}
</script>

<style scoped>
/* Indicador de servicios acumulados */
.servicios-acumulados-indicator {
 background: linear-gradient(135deg, #e8f5e8, #d4edda);
 border: 1px solid #c3e6cb;
 border-left: 4px solid #28a745;
 border-radius: 8px;
 padding: 1rem;
 margin-bottom: 2rem;
 box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
}

.indicator-content {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 1rem;
}

.indicator-content i {
 color: #28a745;
 font-size: 1.2rem;
}

.indicator-text {
 color: #155724;
 font-weight: 600;
 font-size: 1rem;
 flex: 1;
}

.btn-limpiar-acumulados {
 background: #dc3545;
 color: white;
 border: none;
 padding: 0.4rem 0.8rem;
 border-radius: 4px;
 cursor: pointer;
 font-size: 0.8rem;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 0.3rem;
}

.btn-limpiar-acumulados:hover {
 background: #c82333;
 transform: scale(1.05);
}

.servicios-badge {
 background: #28a745;
 color: white;
 padding: 0.2rem 0.6rem;
 border-radius: 12px;
 font-size: 0.7rem;
 font-weight: 600;
 margin-left: 0.5rem;
}

/* Responsive para indicador */
@media (max-width: 768px) {
 .indicator-content {
   flex-direction: column;
   text-align: center;
   gap: 0.75rem;
 }
 
 .indicator-text {
   font-size: 0.9rem;
 }
}

/* CAMBIO: Estilos de meses en lugar de años */
.meses-selector {
background: linear-gradient(135deg, #f8f9fa, #e9ecef);
border-radius: 12px;
padding: 1.5rem;
margin-bottom: 2rem;
border: 1px solid #dee2e6;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.meses-container {
text-align: center;
}

.meses-container label {
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
color: #495057;
font-size: clamp(1rem, 3vw, 1.2rem);
font-weight: 600;
margin-bottom: 1rem;
}

.meses-container label i {
color: #6c757d;
font-size: 1.1em;
}

.meses-controls {
display: flex;
align-items: center;
justify-content: center;
gap: 1rem;
margin-bottom: 0.75rem;
}

.btn-meses {
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

.btn-meses:hover:not(:disabled) {
background: #f8f9fa;
border-color: #495057;
transform: translateY(-1px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-meses:disabled {
opacity: 0.4;
cursor: not-allowed;
transform: none;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
color: #adb5bd;
border-color: #dee2e6;
}

.input-meses {
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

.input-meses:focus {
outline: none;
border-color: #007bff;
box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.meses-info {
color: #6c757d;
font-size: clamp(0.85rem, 2.5vw, 1rem);
font-style: normal;
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
}

.meses-info i {
color: #007bff;
font-size: 0.9em;
}

/* ✅ NUEVOS ESTILOS para validación de límites */
/* Errores de límites globales */
.errores-limites {
background: linear-gradient(135deg, #f8d7da, #f5c2c7);
border: 1px solid #dc3545;
border-radius: 8px;
padding: 1rem;
margin-bottom: 1rem;
color: #721c24;
box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);
}

.error-header {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.75rem;
}

.error-header i {
color: #dc3545;
font-size: 1.2rem;
}

.error-header h4 {
margin: 0;
color: #721c24;
font-weight: 600;
}

.errores-limites p {
margin: 0 0 0.75rem 0;
font-weight: 500;
line-height: 1.4;
}

.error-list {
margin: 0;
padding-left: 1.5rem;
}

.error-list li {
margin-bottom: 0.5rem;
}

.error-list li div {
margin-bottom: 0.25rem;
}

.error-list strong {
font-weight: 600;
color: #721c24;
}

/* Badge de error en botón calcular */
.btn-error-badge {
margin-left: 0.5rem;
background: rgba(255, 255, 255, 0.2);
padding: 0.2rem 0.4rem;
border-radius: 50%;
font-size: 0.8rem;
animation: pulse 2s infinite;
}

@keyframes pulse {
0% {
  opacity: 1;
}
50% {
  opacity: 0.5;
}
100% {
  opacity: 1;
}
}

/* Estado deshabilitado mejorado para botón calcular */
.btn-calcular:disabled {
background: linear-gradient(135deg, #6c757d, #adb5bd);
cursor: not-allowed;
transform: none;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
position: relative;
}

.btn-calcular:disabled:hover {
background: linear-gradient(135deg, #6c757d, #adb5bd);
transform: none;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* MANTENER TODOS LOS ESTILOS EXISTENTES... */
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
grid-template-columns: 2fr 1fr 1fr 1fr auto;
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
.unidades-filter label,
.precio-filter label {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.5rem;
font-weight: 600;
color: #495057;
font-size: 0.9rem;
}

.categorias-filter label i,
.unidades-filter label i,
.precio-filter label i {
color: #6c757d;
}

.select-categoria,
.select-unidad,
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
.select-unidad:focus,
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

/* Errores responsive */
.errores-limites {
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.error-header {
  flex-direction: column;
  text-align: center;
  gap: 0.25rem;
}

.error-list {
  padding-left: 1rem;
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
.meses-selector {
  padding: 1rem;
}

.filtros-container {
  padding: 0.75rem;
}

.meses-controls {
  gap: 0.5rem;
}

.btn-meses {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1rem;
}

.input-meses {
  width: 3.5rem;
  height: 2.5rem;
  font-size: 1.1rem;
}

.meses-info {
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

.errores-limites {
  padding: 0.5rem;
}

.error-header h4 {
  font-size: 0.9rem;
}

.error-list {
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
.meses-selector,
.errores-limites,
.servicios-acumulados-indicator {
transition: all 0.3s ease;
}

/* Mejoras de accesibilidad */
.btn-numero:focus,
.btn-paginacion:focus,
.input-busqueda:focus,
.select-categoria:focus,
.select-unidad:focus,
.select-precio:focus,
.btn-calcular:focus,
.btn-limpiar:focus,
.btn-limpiar-acumulados:focus {
outline: 2px solid #007bff;
outline-offset: 2px;
}

/* Estilos para impresión */
@media print {
.filtros-container,
.paginacion-container,
.form-actions,
.toast-notification,
.errores-limites,
.servicios-acumulados-indicator {
  display: none;
}

.servicios-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
}
</style>