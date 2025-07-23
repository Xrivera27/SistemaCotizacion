<template>
<div class="servicio-card" :class="{ 'tiene-errores': tieneErroresLimites }">
  <div class="servicio-header">
    <span class="servicio-icon">
      <i class="fas fa-cloud"></i>
    </span>
    <h3>{{ servicio.nombre }}</h3>
  </div>

  <!-- ✅ NUEVO: Información de límites y unidades en fila -->
  <div class="info-horizontal">
    <div class="limites-info">
      <div class="limites-badge">
        <i class="fas fa-ruler-horizontal"></i>
        <span>{{ infoLimites }}</span>
      </div>
    </div>

    <!-- ✅ Mostrar TODAS las unidades de medida del servicio -->
    <div v-if="unidadesMedida.length > 0" class="unidades-info">
      <div v-for="unidad in unidadesMedida" :key="unidad.id" class="unidad-badge" :class="`tipo-${unidad.tipo}`">
        <i :class="obtenerIconoTipo(unidad.tipo)"></i>
        {{ unidad.nombre }}
      </div>
    </div>
  </div>

  <!-- ✅ CORREGIDO: Precios del backend con /mes -->
  <div class="precios-servicio">
    <div class="precio-item">
      <span class="precio-label">Mínimo:</span>
      <span class="precio-valor minimo">{{ formatCurrency(servicio.precio_minimo || servicio.precioMinimo) }}/mes</span>
    </div>
    <div class="precio-item">
      <span class="precio-label">Recomendado:</span>
      <span class="precio-valor recomendado">{{ formatCurrency(servicio.precio_recomendado || servicio.precioRecomendado) }}/mes</span>
    </div>
    <div class="precio-item">
      <span class="precio-label">Venta:</span>
      <span class="precio-valor venta">{{ formatCurrency(precioVentaLocal || servicio.precio_recomendado || servicio.precioRecomendado) }}/mes</span>
    </div>
  </div>

  <!-- ✅ NUEVA: Información del contrato con precios mensuales y anuales -->
  <div class="contrato-info">
    <div class="contrato-años">
      <i class="fas fa-calendar-alt"></i>
      <span class="años-valor">{{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</span>
    </div>
    <div class="precios-calculados">
      <div class="precio-mensual-total">
        <span class="precio-label">Mensual:</span>
        <span class="precio-valor">{{ formatCurrency(calcularSubtotalMensual()) }}/mes</span>
      </div>
      <div class="precio-anual-total">
        <span class="precio-label">Anual:</span>
        <span class="precio-valor">{{ formatCurrency(calcularSubtotalAnual()) }}/año</span>
      </div>
      <div class="precio-total">
        <span class="total-label">Total contrato:</span>
        <span class="total-valor">{{ formatCurrency(calcularTotalContrato()) }}</span>
      </div>
    </div>
  </div>

  <div class="precio-venta-container">
    <label>Precio de Venta Mensual (opcional):</label>
    <input 
      v-model.number="precioVentaLocal" 
      type="number" 
      :min="servicio.precio_minimo || servicio.precioMinimo || 0" 
      step="0.01"
      :placeholder="`Mínimo: ${formatCurrency(servicio.precio_minimo || servicio.precioMinimo)}/mes`"
      class="input-precio-venta"
      :class="{ 'precio-bajo-minimo': esPrecioBajoMinimo }"
      @input="actualizarPrecioVenta"
      @blur="validarPrecioMinimo"
    >
    <small v-if="!precioVentaLocal || precioVentaLocal === 0" class="precio-defecto">
      Se usará precio recomendado: {{ formatCurrency(servicio.precio_recomendado || servicio.precioRecomendado) }}/mes
    </small>
    <small v-if="esPrecioBajoMinimo" class="precio-advertencia">
      ⚠️ Precio por debajo del mínimo. Requerirá aprobación administrativa.
    </small>
  </div>
  
  <!-- ✅ ACTUALIZADO: Controles en fila horizontal -->
  <div class="cantidades-container-horizontal" :data-categorias="categoriasDelServicio.length">
    
    <div v-for="categoria in categoriasDelServicio" :key="categoria.id" 
         class="servicio-controls-horizontal" 
         :class="[
           `control-${categoria.unidad_tipo}`,
           validacionLimites[categoria.id]?.tipo === 'error' ? 'error' : '',
           validacionLimites[categoria.id]?.tipo === 'warning' ? 'warning' : '',
           validacionLimites[categoria.id]?.tipo === 'success' && cantidadesPorCategoria[categoria.id] > 0 ? 'success' : ''
         ]">
      
      <label>{{ categoria.etiqueta }}:</label>
      
      <div class="cantidad-controls">
        <button @click="decrementarCantidad(categoria.id)" 
                :disabled="cantidadesPorCategoria[categoria.id] <= 0" 
                class="btn-cantidad">
          <i class="fas fa-minus"></i>
        </button>
        
        <input 
          v-model.number="cantidadesPorCategoria[categoria.id]" 
          type="number" 
          :min="0"
          :max="servicio.limite_maximo || 999999"
          :step="obtenerStepTipo(categoria.unidad_tipo)"
          :class="[
            'input-cantidad', 
            `input-${categoria.unidad_tipo}`,
            validacionLimites[categoria.id]?.tipo === 'error' ? 'error' : '',
            validacionLimites[categoria.id]?.tipo === 'warning' ? 'warning' : '',
            validacionLimites[categoria.id]?.tipo === 'success' && cantidadesPorCategoria[categoria.id] > 0 ? 'success' : ''
          ]"
          @input="actualizarCantidad(categoria.id)"
          :placeholder="categoria.placeholder"
        >
        
        <button @click="incrementarCantidad(categoria.id)" 
                :disabled="servicio.limite_maximo && cantidadesPorCategoria[categoria.id] >= servicio.limite_maximo"
                class="btn-cantidad"
                :class="{ 'limite-alcanzado': servicio.limite_maximo && cantidadesPorCategoria[categoria.id] >= servicio.limite_maximo }">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      
      <!-- ✅ NUEVO: Mensaje de validación por categoría -->
      <div v-if="validacionLimites[categoria.id]?.mensaje" 
           class="validacion-mensaje"
           :class="validacionLimites[categoria.id]?.tipo">
        <i :class="[
          validacionLimites[categoria.id]?.tipo === 'error' ? 'fas fa-exclamation-circle' : '',
          validacionLimites[categoria.id]?.tipo === 'warning' ? 'fas fa-exclamation-triangle' : '',
          validacionLimites[categoria.id]?.tipo === 'success' ? 'fas fa-check-circle' : ''
        ]"></i>
        <span>{{ validacionLimites[categoria.id].mensaje }}</span>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import { ref, computed, watch, toRefs, reactive } from 'vue'

export default {
name: 'ServicioItem',
props: {
  servicio: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Number,
    default: 0
  },
  cantidadEquipos: {
    type: Number,
    default: 0
  },
  precioVenta: {
    type: Number,
    default: 0
  },
  añosContrato: {
    type: Number,
    default: 1
  }
},
emits: ['update:modelValue', 'update:cantidadEquipos', 'update:precioVenta', 'update:cantidadesPorTipo', 'mostrar-notificacion'],
setup(props, { emit }) {
  const { servicio, precioVenta, añosContrato } = toRefs(props)
  
  // Estados reactivos
  const precioVentaLocal = ref(precioVenta.value || 0)
  
  // ✅ CORREGIDO: Objeto reactivo para manejar cantidades POR CATEGORÍA
  const cantidadesPorCategoria = reactive({})

  // ✅ CORREGIDO: Computed para obtener TODAS las categorías del servicio
  const categoriasDelServicio = computed(() => {
    const categorias = []
    
    // Obtener todas las categorías del servicio
    let categoriasData = []
    
    if (servicio.value.categorias_completas && Array.isArray(servicio.value.categorias_completas)) {
      categoriasData = servicio.value.categorias_completas
    } else if (servicio.value.categoria) {
      categoriasData = [servicio.value.categoria]
    }
    
    console.log('📋 Categorías del servicio:', servicio.value.nombre, categoriasData)
      
    // Mapear cada categoría individual
    categoriasData.forEach((categoria, index) => {
      console.log(`🔥 CATEGORIA ${index}:`, categoria)
      
      if (categoria.unidad_medida) {
        const categoriaInfo = {
          // ✅ CORRECCIÓN: Usar múltiples opciones para el ID
          id: categoria.id || categoria.categorias_id || categoria.categoria_id,
          nombre: categoria.nombre,
          unidad_id: categoria.unidad_medida.unidades_medida_id,
          unidad_nombre: categoria.unidad_medida.nombre,
          unidad_abreviacion: categoria.unidad_medida.abreviacion,
          unidad_tipo: categoria.unidad_medida.tipo,
          etiqueta: obtenerEtiquetaCategoria(categoria),
          placeholder: obtenerPlaceholderCategoria(categoria)
        }
        
        console.log(`✅ CATEGORIA MAPEADA ${index}:`, categoriaInfo)
        
        categorias.push(categoriaInfo)
        
        // ✅ Inicializar cantidad para esta categoría si no existe
        if (categoriaInfo.id && !(categoriaInfo.id in cantidadesPorCategoria)) {
          cantidadesPorCategoria[categoriaInfo.id] = 0
        }
      }
    })
    
    console.log('🎯 Categorías mapeadas:', categorias)
    console.log('📊 Cantidades por categoría:', cantidadesPorCategoria)
    return categorias
  })

  // ✅ NUEVO: Computed para unidades de medida únicas (para badges)
  const unidadesMedida = computed(() => {
    const unidades = []
    const unidadesVistas = new Set()
    
    categoriasDelServicio.value.forEach(categoria => {
      if (!unidadesVistas.has(categoria.unidad_id)) {
        unidades.push({
          id: categoria.unidad_id,
          nombre: categoria.unidad_nombre,
          abreviacion: categoria.unidad_abreviacion,
          tipo: categoria.unidad_tipo
        })
        unidadesVistas.add(categoria.unidad_id)
      }
    })
    
    return unidades
  })

  // ✅ NUEVO: Computed para validar límites por categoría
  const validacionLimites = computed(() => {
    const errores = {}
    
    categoriasDelServicio.value.forEach(categoria => {
      const cantidad = cantidadesPorCategoria[categoria.id] || 0
      const limiteMin = servicio.value.limite_minimo || 1
      const limiteMax = servicio.value.limite_maximo
      
      const validacion = {
        esValido: true,
        mensaje: '',
        tipo: 'success' // success, warning, error
      }
      
      // Validar límite mínimo
      if (cantidad > 0 && cantidad < limiteMin) {
        validacion.esValido = false
        validacion.tipo = 'error'
      }
      // Validar límite máximo
      else if (limiteMax && cantidad > limiteMax) {
        validacion.esValido = false
        validacion.tipo = 'error'
      }
      // Advertencia si está cerca del límite máximo
      else if (limiteMax && cantidad > 0 && cantidad > (limiteMax * 0.8)) {
        validacion.tipo = 'warning'
      }
      // Éxito
      else if (cantidad > 0) {
        validacion.tipo = 'success'
      }
      
      errores[categoria.id] = validacion
    })
    
    return errores
  })

  // ✅ NUEVO: Computed para saber si hay errores de validación
  const tieneErroresLimites = computed(() => {
    return Object.values(validacionLimites.value).some(val => !val.esValido)
  })

  // ✅ NUEVO: Computed para mostrar info de límites del servicio
  const infoLimites = computed(() => {
    const limiteMin = servicio.value.limite_minimo || 1
    const limiteMax = servicio.value.limite_maximo
    
    if (!limiteMax) {
      return `Mínimo: ${limiteMin}`
    }
    return `Límites: ${limiteMin} - ${limiteMax}`
  })

  // ✅ CORREGIDO: Funciones helper para categorías
  const obtenerEtiquetaCategoria = (categoria) => {
    // ✅ CAMBIAR: Usar el nombre de la UNIDAD DE MEDIDA, no de la categoría
    const nombreUnidad = categoria.unidad_medida.nombre
    const tipoUnidad = categoria.unidad_medida.tipo
    const abreviacion = categoria.unidad_medida.abreviacion
    
    switch (tipoUnidad) {
      case 'capacidad':
        return `${nombreUnidad} (${abreviacion})`
      case 'usuarios':
        return `${nombreUnidad}`
      case 'sesiones':
        return `${nombreUnidad}`
      case 'tiempo':
        return `${nombreUnidad} (${abreviacion})`
      case 'cantidad':
      default:
        return nombreUnidad
    }
  }

  const obtenerPlaceholderCategoria = (categoria) => {
    const tipoUnidad = categoria.unidad_medida.tipo
    const abreviacion = categoria.unidad_medida.abreviacion
    
    switch (tipoUnidad) {
      case 'capacidad':
        return `0 ${abreviacion}`
      case 'usuarios':
        return '0 usuarios'
      case 'sesiones':
        return '0 sesiones'
      case 'tiempo':
        return `0 ${abreviacion}`
      default:
        return '0'
    }
  }

  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case 'capacidad':
        return 'fas fa-hdd'
      case 'usuarios':
        return 'fas fa-users'
      case 'sesiones':
        return 'fas fa-link'
      case 'tiempo':
        return 'fas fa-clock'
      case 'cantidad':
      default:
        return 'fas fa-boxes'
    }
  }

  const obtenerStepTipo = (tipo) => {
    switch (tipo) {
      case 'capacidad':
        return 1
      case 'tiempo':
        return 0.5
      default:
        return 1
    }
  }

  // Computed properties existentes
  const esPrecioBajoMinimo = computed(() => {
    if (!precioVentaLocal.value) return false
    const precioMinimo = servicio.value.precio_minimo || servicio.value.precioMinimo || 0
    return precioVentaLocal.value < precioMinimo
  })

  // ✅ CORREGIDO: Total de unidades para cálculo de precio
  const totalUnidadesPorTipo = computed(() => {
    let totalParaPrecio = 0
    
    categoriasDelServicio.value.forEach(categoria => {
      const cantidad = cantidadesPorCategoria[categoria.id] || 0
      totalParaPrecio += cantidad
    })
    
    return Math.max(totalParaPrecio, 1)
  })

  // ✅ NUEVO: Computed para obtener cantidades por tipo
  const cantidadesPorTipo = computed(() => {
    const cantidades = {}
    
    categoriasDelServicio.value.forEach(categoria => {
      const cantidad = cantidadesPorCategoria[categoria.id] || 0
      const tipo = categoria.unidad_tipo
      
      if (!cantidades[tipo]) {
        cantidades[tipo] = 0
      }
      cantidades[tipo] += cantidad
    })
    
    return cantidades
  })

  // ✅ NUEVAS: Funciones para calcular precios mensuales y anuales
  const calcularSubtotalMensual = () => {
    const precio = precioVentaLocal.value || servicio.value.precio_recomendado || servicio.value.precioRecomendado || 0
    return precio * totalUnidadesPorTipo.value
  }

  const calcularSubtotalAnual = () => {
    return calcularSubtotalMensual() * 12
  }

  const calcularTotalContrato = () => {
    return calcularSubtotalAnual() * añosContrato.value
  }

  // Función de formateo
  const formatCurrency = (amount) => {
    const valor = amount || 0
    return `$${valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const validarPrecioMinimo = () => {
    if (precioVentaLocal.value) {
      const precioMinimo = servicio.value.precio_minimo || servicio.value.precioMinimo || 0
      if (precioVentaLocal.value < precioMinimo) {
        console.warn(`⚠️ Precio ${precioVentaLocal.value} está por debajo del mínimo ${precioMinimo} para ${servicio.value.nombre}`)
      }
    }
  }

  // ✅ NUEVO: Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    // Emitir evento para mostrar toast en el componente padre
    emit('mostrar-notificacion', { mensaje, tipo })
  }

  // ✅ CORREGIDO: Métodos para manejar cantidades POR CATEGORÍA con validación
  const incrementarCantidad = (categoriaId) => {
    const categoria = categoriasDelServicio.value.find(c => c.id === categoriaId)
    if (categoria) {
      const step = obtenerStepTipo(categoria.unidad_tipo)
      const limiteMax = servicio.value.limite_maximo
      
      // Verificar límite máximo antes de incrementar
      if (limiteMax && cantidadesPorCategoria[categoriaId] >= limiteMax) {
        mostrarNotificacion(`Cantidad máxima alcanzada: ${limiteMax}`, 'warning')
        return
      }
      
      cantidadesPorCategoria[categoriaId] = (cantidadesPorCategoria[categoriaId] || 0) + step
      actualizarCantidad(categoriaId)
    }
  }

  const decrementarCantidad = (categoriaId) => {
    const categoria = categoriasDelServicio.value.find(c => c.id === categoriaId)
    if (categoria) {
      const step = obtenerStepTipo(categoria.unidad_tipo)
      if (cantidadesPorCategoria[categoriaId] >= step) {
        cantidadesPorCategoria[categoriaId] = cantidadesPorCategoria[categoriaId] - step
        actualizarCantidad(categoriaId)
      }
    }
  }

  // ✅ CORREGIDO: Método actualizarCantidad SIN variable no usada
  const actualizarCantidad = (categoriaId) => {
    if (cantidadesPorCategoria[categoriaId] < 0) {
      cantidadesPorCategoria[categoriaId] = 0
    }
    
    // ✅ VALIDAR LÍMITES EN TIEMPO REAL
    const cantidad = cantidadesPorCategoria[categoriaId]
    const limiteMax = servicio.value.limite_maximo
    
    // Corregir automáticamente si excede límites
    if (cantidad > 0 && limiteMax && cantidad > limiteMax) {
      cantidadesPorCategoria[categoriaId] = limiteMax
      mostrarNotificacion(`Cantidad ajustada al límite máximo: ${limiteMax}`, 'warning')
    }
    
    // ✅ ENVIAR DATOS ESTRUCTURADOS CORRECTAMENTE
    const datosParaEmitir = {
      servicioId: servicio.value.servicios_id,
      cantidadesPorCategoria: { ...cantidadesPorCategoria },
      cantidadesPorTipo: cantidadesPorTipo.value,
      totalUnidades: totalUnidadesPorTipo.value,
      // ✅ AGREGAR: Información detallada de categorías
      categoriasDetalle: categoriasDelServicio.value.map(cat => ({
        id: cat.id,
        categorias_id: cat.id, // ✅ Para compatibilidad con backend
        nombre: cat.nombre,
        unidad_id: cat.unidad_id,
        unidad_nombre: cat.unidad_nombre,
        unidad_tipo: cat.unidad_tipo,
        unidad_abreviacion: cat.unidad_abreviacion,
        cantidad: cantidadesPorCategoria[cat.id] || 0
      })),
      // ✅ NUEVO: Agregar información de validación
      validacion: {
        tieneErrores: tieneErroresLimites.value,
        errores: validacionLimites.value
      }
    }
    
    console.log('📤 EMITIENDO DATOS CON VALIDACIÓN:', datosParaEmitir)
    emit('update:cantidadesPorTipo', datosParaEmitir)
    
    const categoria = categoriasDelServicio.value.find(c => c.id === categoriaId)
    console.log(`📊 ${categoria?.nombre} actualizada a ${cantidadesPorCategoria[categoriaId]}. Total: ${totalUnidadesPorTipo.value}`)
  }

  const actualizarPrecioVenta = () => {
    emit('update:precioVenta', precioVentaLocal.value || 0)
  }

  // ✅ CORREGIDO: Inicialización simplificada
  const inicializarCantidades = () => {
    // Solo inicializar las cantidades a 0 si no existen
    categoriasDelServicio.value.forEach(categoria => {
      if (categoria.id && !(categoria.id in cantidadesPorCategoria)) {
        cantidadesPorCategoria[categoria.id] = 0
      }
    })
  }

  // Watchers
  watch(precioVenta, (newVal) => {
    precioVentaLocal.value = newVal || 0
  })

  // ✅ NUEVO: Watcher para categorías del servicio
  watch(categoriasDelServicio, (newCategorias) => {
    console.log('🔄 Categorías del servicio actualizadas:', newCategorias)
    inicializarCantidades()
  }, { immediate: true })

  return {
    // Estados
    precioVentaLocal,
    cantidadesPorCategoria,
    
    // ✅ NUEVO: Computed para múltiples categorías
    categoriasDelServicio,
    unidadesMedida,
    cantidadesPorTipo,
    
    // ✅ NUEVOS: Validación de límites
    validacionLimites,
    tieneErroresLimites,
    infoLimites,
    
    // Computed existentes
    esPrecioBajoMinimo,
    totalUnidadesPorTipo,
    
    // ✅ NUEVO: Métodos helper
    obtenerEtiquetaCategoria,
    obtenerPlaceholderCategoria,
    obtenerIconoTipo,
    obtenerStepTipo,
    
    // ✅ NUEVAS: Funciones de cálculo
    calcularSubtotalMensual,
    calcularSubtotalAnual,
    calcularTotalContrato,
    
    // Métodos
    formatCurrency,
    validarPrecioMinimo,
    
    // ✅ CORREGIDO: Métodos para múltiples categorías con validación
    incrementarCantidad,
    decrementarCantidad,
    actualizarCantidad,
    actualizarPrecioVenta,
    inicializarCantidades,
    
    // ✅ NUEVO
    mostrarNotificacion
  }
}
}
</script>

<style scoped>
/* ✅ NUEVOS ESTILOS para validación de límites */

/* Información de límites */
.limites-info {
 margin-bottom: 0;
}

.limites-badge {
 display: inline-flex;
 align-items: center;
 gap: 0.25rem;
 padding: 0.25rem 0.5rem;
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 border: 1px solid #ced4da;
 border-radius: 10px;
 font-size: 0.7rem;
 font-weight: 600;
 color: #495057;
}

.limites-badge i {
 color: #6c757d;
}

/* ✅ NUEVO: Contenedor horizontal para límites y unidades */
.info-horizontal {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 0.75rem;
 gap: 0.5rem;
 flex-wrap: wrap;
}

/* Estados de validación para controles */
.servicio-controls-horizontal.error {
 background: rgba(220, 53, 69, 0.1);
 border-radius: 4px;
 padding: 0.25rem;
 margin: -0.25rem;
 border: 1px solid rgba(220, 53, 69, 0.3);
}

.servicio-controls-horizontal.warning {
 background: rgba(255, 193, 7, 0.1);
 border-radius: 4px;
 padding: 0.25rem;
 margin: -0.25rem;
 border: 1px solid rgba(255, 193, 7, 0.3);
}

.servicio-controls-horizontal.success {
 background: rgba(40, 167, 69, 0.1);
 border-radius: 4px;
 padding: 0.25rem;
 margin: -0.25rem;
 border: 1px solid rgba(40, 167, 69, 0.3);
}

/* Estados de validación para inputs */
.input-cantidad.error {
 border-color: #dc3545 !important;
 background: #fff5f5;
 box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.input-cantidad.warning {
 border-color: #ffc107 !important;
 background: #fffbf0;
 box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
}

.input-cantidad.success {
 border-color: #28a745 !important;
 background: #f8fff8;
 box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

/* Mensajes de validación */
.validacion-mensaje {
 display: flex;
 align-items: center;
 gap: 0.25rem;
 font-size: 0.6rem;
 margin-top: 0.25rem;
 padding: 0.15rem 0.3rem;
 border-radius: 4px;
 font-weight: 600;
 text-align: center;
 justify-content: center;
}

.validacion-mensaje.error {
 background: rgba(220, 53, 69, 0.1);
 color: #721c24;
 border: 1px solid rgba(220, 53, 69, 0.2);
}

.validacion-mensaje.warning {
 background: rgba(255, 193, 7, 0.1);
 color: #856404;
 border: 1px solid rgba(255, 193, 7, 0.2);
}

.validacion-mensaje.success {
 background: rgba(40, 167, 69, 0.1);
 color: #155724;
 border: 1px solid rgba(40, 167, 69, 0.2);
}

.validacion-mensaje i {
 font-size: 0.55rem;
}

/* Estado de error general para la tarjeta */
.servicio-card.tiene-errores {
 border-color: #dc3545;
 box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
}

.servicio-card.tiene-errores .servicio-header h3 {
 color: #dc3545;
}

/* Botones deshabilitados por límites */
.btn-cantidad:disabled.limite-alcanzado {
 background: #f8d7da;
 border-color: #dc3545;
 color: #721c24;
 cursor: not-allowed;
}

.btn-cantidad.limite-alcanzado {
 background: #f8d7da;
 border-color: #dc3545;
 color: #721c24;
 cursor: not-allowed;
}

/* ✅ MANTENER todos los estilos existentes pero con ALTURAS CORREGIDAS */
.servicio-card {
 border: 1px solid #dee2e6;
 border-radius: 8px;
 padding: 1rem;
 background: white;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
 transition: all 0.2s ease;
 height: 100%;
 display: flex;
 flex-direction: column;
 box-sizing: border-box;
 /* ✅ CAMBIO PRINCIPAL: Aumentar alturas para evitar cortes */
 min-height: 520px; /* Aumentado de 380px */
 max-height: 580px; /* Aumentado de 420px */
}

.servicio-card:hover {
 transform: translateY(-2px);
 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
 border-color: #007bff;
}

.servicio-header {
 display: flex;
 align-items: center;
 margin-bottom: 0.75rem;
 gap: 0.5rem;
 padding-bottom: 0.5rem;
 border-bottom: 1px solid #e9ecef;
 flex-shrink: 0; /* ✅ No permitir que el header se comprima */
}

.servicio-icon {
 font-size: 1.2rem;
 flex-shrink: 0;
 color: #495057;
}

.servicio-header h3 {
 margin: 0;
 color: #495057;
 font-size: 1rem;
 line-height: 1.2;
 flex: 1;
 min-width: 0;
 font-weight: 600;
}

/* ✅ NUEVOS ESTILOS para múltiples unidades */
.unidades-info {
 margin-bottom: 0;
 display: flex;
 flex-wrap: wrap;
 gap: 0.2rem;
 justify-content: center;
}

.unidad-badge {
 display: inline-flex;
 align-items: center;
 gap: 0.25rem;
 padding: 0.2rem 0.4rem;
 border-radius: 10px;
 font-size: 0.65rem;
 font-weight: 600;
 text-transform: uppercase;
 letter-spacing: 0.3px;
}

.unidad-badge.tipo-capacidad {
 background: linear-gradient(135deg, #e3f2fd, #bbdefb);
 color: #1565c0;
 border: 1px solid #90caf9;
}

.unidad-badge.tipo-usuarios {
 background: linear-gradient(135deg, #f3e5f5, #e1bee7);
 color: #7b1fa2;
 border: 1px solid #ce93d8;
}

.unidad-badge.tipo-sesiones {
 background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
 color: #2e7d32;
 border: 1px solid #a5d6a7;
}

.unidad-badge.tipo-tiempo {
 background: linear-gradient(135deg, #fff3e0, #ffe0b2);
 color: #ef6c00;
 border: 1px solid #ffcc02;
}

.unidad-badge.tipo-cantidad {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 color: #495057;
 border: 1px solid #ced4da;
}

.precios-servicio {
 display: flex;
 gap: 0.25rem;
 margin-bottom: 0.75rem;
 flex-wrap: wrap;
 flex-shrink: 0; /* ✅ No permitir compresión */
}

.precio-item {
 flex: 1;
 min-width: 60px;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 0.3rem; /* ✅ Aumentado para más espacio */
 border-radius: 4px;
 border: 1px solid;
 background: white;
 font-size: 0.75rem;
}

.precio-item:first-child {
 border-color: #dc3545;
 color: #721c24;
}

.precio-item:nth-child(2) {
 border-color: #ffc107;
 color: #856404;
}

.precio-item:last-child {
 border-color: #28a745;
 color: #155724;
}

.precio-label {
 font-size: 0.6rem;
 font-weight: 600;
 margin-bottom: 0.15rem;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.precio-valor {
 font-weight: 700;
 font-size: 0.7rem;
 text-align: center;
 line-height: 1;
}

.precio-venta-container {
 margin-bottom: 0.75rem;
 background: #f8f9fa;
 padding: 0.6rem; /* ✅ Aumentado para más espacio */
 border-radius: 6px;
 border: 1px solid #ced4da;
 flex-shrink: 0; /* ✅ No permitir compresión */
}

.precio-venta-container label {
 display: block;
 margin-bottom: 0.3rem; /* ✅ Más espacio */
 font-weight: 600;
 color: #495057;
 font-size: 0.8rem;
}

.input-precio-venta {
 width: 100%;
 height: 2.2rem; /* ✅ Aumentado de 2rem */
 padding: 0.3rem 0.5rem; /* ✅ Más padding */
 border: 1px solid #ced4da;
 border-radius: 4px;
 font-size: 0.85rem;
 box-sizing: border-box;
 background: white;
 color: #495057;
}

.input-precio-venta:focus {
 outline: none;
 border-color: #007bff;
 box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.precio-bajo-minimo {
 border-color: #dc3545 !important;
 background: #fff5f5 !important;
}

.precio-defecto {
 display: block;
 margin-top: 0.3rem; /* ✅ Más espacio */
 color: #6c757d;
 font-size: 0.7rem;
 font-weight: 500;
 text-align: center;
}

.precio-advertencia {
 display: block;
 margin-top: 0.3rem; /* ✅ Más espacio */
 color: #dc3545;
 font-size: 0.7rem;
 font-weight: 600;
 text-align: center;
}

.contrato-info {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 padding: 0.6rem; /* ✅ Aumentado para más espacio */
 border-radius: 6px;
 margin-bottom: 0.75rem;
 border: 1px solid #ced4da;
 border-left: 3px solid #007bff;
 flex-shrink: 0; /* ✅ No permitir compresión */
}

.contrato-años {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 0.3rem; /* ✅ Más espacio */
}

.contrato-años i {
 color: #007bff;
 margin-right: 0.25rem;
}

.años-valor {
 font-size: 0.8rem;
 color: #495057;
 font-weight: 600;
 background: white;
 padding: 0.2rem 0.4rem; /* ✅ Más padding */
 border-radius: 4px;
 border: 1px solid #ced4da;
}

.precios-calculados {
 display: flex;
 flex-direction: column;
 gap: 0.25rem; /* ✅ Espacio entre elementos */
}

.precio-mensual-total,
.precio-anual-total {
 display: flex;
 justify-content: space-between;
 align-items: center;
}

.precio-total {
 display: flex;
 justify-content: space-between;
 align-items: center;
 border-top: 1px solid #ced4da;
 padding-top: 0.25rem;
 margin-top: 0.25rem;
}

.total-label {
 font-size: 0.75rem;
 color: #495057;
 font-weight: 600;
}

.total-valor {
 font-size: 0.8rem;
 color: #495057;
 font-weight: 700;
 background: white;
 padding: 0.2rem 0.4rem; /* ✅ Más padding */
 border-radius: 4px;
 border: 1px solid #ced4da;
}

/* ✅ NUEVO: Controles en fila horizontal con MÁS ESPACIO */
.cantidades-container-horizontal {
 margin-top: auto;
 background: #f8f9fa;
 padding: 0.7rem; /* ✅ Aumentado para más espacio */
 border-radius: 6px;
 border: 1px solid #ced4da;
 display: flex;
 flex-direction: row;
 gap: 0.6rem; /* ✅ Más gap */
 align-items: flex-start; /* ✅ Cambio para mejor alineación */
 flex-wrap: wrap;
 justify-content: space-around;
 min-height: 80px; /* ✅ Altura mínima para evitar cortes */
}

.servicio-controls-horizontal {
 display: flex;
 flex-direction: column;
 align-items: center;
 min-width: 110px; /* ✅ Aumentado */
 flex: 1;
 padding: 0.3rem; /* ✅ Padding interno */
}

.servicio-controls-horizontal label {
 font-weight: 600;
 color: #495057;
 font-size: 0.75rem; /* ✅ Ligeramente más grande */
 margin-bottom: 0.3rem; /* ✅ Más margen */
 text-align: center;
 line-height: 1.2; /* ✅ Mejor line-height */
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
 max-width: 100%;
}

/* ✅ ESTILOS específicos por tipo de control */
.control-capacidad label {
 color: #1565c0;
}

.control-usuarios label {
 color: #7b1fa2;
}

.control-sesiones label {
 color: #2e7d32;
}

.control-tiempo label {
 color: #ef6c00;
}

.cantidad-controls {
 display: flex;
 align-items: center;
 gap: 0.3rem; /* ✅ Más gap */
 justify-content: center;
 margin-bottom: 0.25rem; /* ✅ Margen para mensajes de validación */
}

.btn-cantidad {
 width: 1.4rem; /* ✅ Ligeramente más grande */
 height: 1.4rem; /* ✅ Ligeramente más grande */
 border: 1px solid #007bff;
 background: white;
 color: #007bff;
 border-radius: 3px;
 cursor: pointer;
 font-size: 0.7rem; /* ✅ Fuente ligeramente más grande */
 font-weight: 700;
 display: flex;
 align-items: center;
 justify-content: center;
 transition: all 0.2s ease;
 flex-shrink: 0;
}

.btn-cantidad:hover:not(:disabled) {
 background: #007bff;
 color: white;
}

.btn-cantidad:disabled {
 opacity: 0.4;
 cursor: not-allowed;
 color: #6c757d;
 border-color: #ced4da;
}

.input-cantidad {
 width: 2.2rem; /* ✅ Ligeramente más ancho */
 height: 1.4rem; /* ✅ Ligeramente más alto */
 text-align: center;
 border: 1px solid #007bff;
 border-radius: 3px;
 font-size: 0.75rem; /* ✅ Fuente ligeramente más grande */
 font-weight: 600;
 flex-shrink: 0;
 background: white;
 color: #495057;
}

.input-cantidad:focus {
 outline: none;
 border-color: #0056b3;
 box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.2);
}

/* ✅ NUEVOS: Estilos específicos por tipo de input */
.input-capacidad {
 border-color: #1565c0 !important;
 width: 2.4rem !important; /* ✅ Más ancho */
}

.input-usuarios {
 border-color: #7b1fa2 !important;
 width: 2.4rem !important; /* ✅ Más ancho */
}

.input-sesiones {
 border-color: #2e7d32 !important;
 width: 2.4rem !important; /* ✅ Más ancho */
}

.input-tiempo {
 border-color: #ef6c00 !important;
 width: 2.4rem !important; /* ✅ Más ancho */
}

/* ✅ Responsive MEJORADO para diseño horizontal */
@media (max-width: 768px) {
 .servicio-card {
   min-height: 500px; /* ✅ Aumentado para móvil */
   max-height: 560px; /* ✅ Aumentado para móvil */
   padding: 0.9rem; /* ✅ Más padding en móvil */
 }
 
 .cantidades-container-horizontal {
   flex-direction: column;
   gap: 0.5rem;
   padding: 0.8rem; /* ✅ Más padding */
   min-height: 120px; /* ✅ Más altura en móvil */
 }
 
 .servicio-controls-horizontal {
   min-width: auto;
   width: 100%;
   padding: 0.4rem; /* ✅ Más padding */
 }
 
 .servicio-controls-horizontal label {
   font-size: 0.7rem;
   white-space: normal;
   margin-bottom: 0.4rem; /* ✅ Más margen */
 }
 
 .info-horizontal {
   flex-direction: column;
   align-items: stretch;
   gap: 0.6rem; /* ✅ Más gap */
 }
 
 .unidades-info {
   justify-content: center;
 }
 
 .validacion-mensaje {
   font-size: 0.6rem; /* ✅ Fuente ligeramente más grande */
   padding: 0.2rem 0.3rem; /* ✅ Más padding */
 }
 
 .limites-badge {
   font-size: 0.7rem; /* ✅ Fuente ligeramente más grande */
   padding: 0.3rem 0.5rem; /* ✅ Más padding */
 }
}

@media (max-width: 480px) {
 .servicio-card {
   padding: 0.8rem;
   min-height: 480px; /* ✅ Aumentado para móvil pequeño */
   max-height: 540px; /* ✅ Aumentado para móvil pequeño */
 }
 
 .precios-servicio {
   flex-direction: column;
   gap: 0.3rem; /* ✅ Más gap */
 }
 
 .precio-item {
   flex-direction: row;
   justify-content: space-between;
   padding: 0.3rem 0.6rem; /* ✅ Más padding */
 }
 
 .servicio-controls-horizontal {
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
   padding: 0.5rem; /* ✅ Más padding */
 }
 
 .servicio-controls-horizontal label {
   margin-bottom: 0;
   margin-right: 0.6rem; /* ✅ Más margen */
   font-size: 0.65rem;
 }
 
 .unidades-info {
   gap: 0.3rem; /* ✅ Más gap */
 }
 
 .unidad-badge {
   font-size: 0.6rem; /* ✅ Fuente ligeramente más grande */
   padding: 0.2rem 0.4rem; /* ✅ Más padding */
 }
 
 .cantidad-controls {
   gap: 0.2rem;
 }
 
 .btn-cantidad {
   width: 1.2rem;
   height: 1.2rem;
   font-size: 0.65rem;
 }
 
 .input-cantidad {
   width: 2rem;
   height: 1.2rem;
   font-size: 0.7rem;
 }
 
 .input-capacidad,
 .input-usuarios,
 .input-sesiones,
 .input-tiempo {
   width: 2.2rem !important; /* ✅ Más ancho en móvil */
 }
 
 .validacion-mensaje {
   font-size: 0.6rem;
   padding: 0.2rem 0.3rem; /* ✅ Más padding */
 }
 
 .cantidades-container-horizontal {
   min-height: 140px; /* ✅ Más altura en móvil pequeño */
   padding: 0.9rem; /* ✅ Más padding */
 }
}

/* Animaciones suaves */
.cantidades-container-horizontal {
 transition: all 0.3s ease;
}

.servicio-controls-horizontal {
 transition: all 0.2s ease;
}

.unidad-badge {
 transition: all 0.2s ease;
}

.unidad-badge:hover {
 transform: scale(1.05);
}

/* Mejoras visuales para focus */
.servicio-controls-horizontal:focus-within label {
 color: #007bff;
 font-weight: 700;
}

.control-capacidad:focus-within label {
 color: #1565c0;
}

.control-usuarios:focus-within label {
 color: #7b1fa2;
}

.control-sesiones:focus-within label {
 color: #2e7d32;
}

.control-tiempo:focus-within label {
 color: #ef6c00;
}

/* Hover effects mejorados */
.servicio-controls-horizontal:hover {
 background: rgba(0, 123, 255, 0.05);
 border-radius: 4px;
 padding: 0.3rem; /* ✅ Más padding en hover */
 margin: -0.3rem; /* ✅ Compensar el padding */
}

.control-capacidad:hover {
 background: rgba(21, 101, 192, 0.05);
}

.control-usuarios:hover {
 background: rgba(123, 31, 162, 0.05);
}

.control-sesiones:hover {
 background: rgba(46, 125, 50, 0.05);
}

.control-tiempo:hover {
 background: rgba(239, 108, 0, 0.05);
}

/* ✅ NUEVO: Asegurar que el contenido no se desborde */
.servicio-card > * {
 flex-shrink: 0;
}

.cantidades-container-horizontal {
 flex-shrink: 1; /* ✅ Permitir que se ajuste si es necesario */
 overflow: visible; /* ✅ Asegurar que el contenido sea visible */
}

/* ✅ NUEVO: Mejorar el scroll si es necesario */
.servicio-card {
 overflow-y: auto;
 overflow-x: hidden;
}

.servicio-card::-webkit-scrollbar {
 width: 4px;
}

.servicio-card::-webkit-scrollbar-track {
 background: #f1f1f1;
 border-radius: 2px;
}

.servicio-card::-webkit-scrollbar-thumb {
 background: #c1c1c1;
 border-radius: 2px;
}

.servicio-card::-webkit-scrollbar-thumb:hover {
 background: #a8a8a8;
}
</style>