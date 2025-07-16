<template>
<div class="servicio-card">
  <div class="servicio-header">
    <span class="servicio-icon">
      <i class="fas fa-cloud"></i>
    </span>
    <h3>{{ servicio.nombre }}</h3>
  </div>
  
  <p class="servicio-descripcion">{{ servicio.descripcion || 'Servicio cloud empresarial' }}</p>

  <!-- ✅ Mostrar TODAS las unidades de medida del servicio -->
  <div v-if="unidadesMedida.length > 0" class="unidades-info">
    <div v-for="unidad in unidadesMedida" :key="unidad.id" class="unidad-badge" :class="`tipo-${unidad.tipo}`">
      <i :class="obtenerIconoTipo(unidad.tipo)"></i>
      {{ unidad.nombre }}
    </div>
  </div>

  <!-- Precios del backend -->
  <div class="precios-servicio">
    <div class="precio-item">
      <span class="precio-label">Mínimo:</span>
      <span class="precio-valor minimo">{{ formatCurrency(servicio.precio_minimo || servicio.precioMinimo) }}</span>
    </div>
    <div class="precio-item">
      <span class="precio-label">Recomendado:</span>
      <span class="precio-valor recomendado">{{ formatCurrency(servicio.precio_recomendado || servicio.precioRecomendado) }}</span>
    </div>
    <div class="precio-item">
      <span class="precio-label">Venta:</span>
      <span class="precio-valor venta">{{ formatCurrency(precioVentaLocal || servicio.precio_recomendado || servicio.precioRecomendado) }}</span>
    </div>
  </div>

  <!-- Información del contrato -->
  <div class="contrato-info">
    <div class="contrato-años">
      <i class="fas fa-calendar-alt"></i>
      <span class="años-valor">{{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</span>
    </div>
    <div class="precio-total">
      <span class="total-label">Total contrato:</span>
      <span class="total-valor">{{ formatCurrency(calcularTotalContrato()) }}</span>
    </div>
  </div>

  <div class="precio-venta-container">
    <label>Precio de Venta Anual (opcional):</label>
    <input 
      v-model.number="precioVentaLocal" 
      type="number" 
      :min="servicio.precio_minimo || servicio.precioMinimo || 0" 
      step="0.01"
      :placeholder="`Mínimo: ${formatCurrency(servicio.precio_minimo || servicio.precioMinimo)}`"
      class="input-precio-venta"
      :class="{ 'precio-bajo-minimo': esPrecioBajoMinimo }"
      @input="actualizarPrecioVenta"
      @blur="validarPrecioMinimo"
    >
    <small v-if="!precioVentaLocal || precioVentaLocal === 0" class="precio-defecto">
      Se usará precio recomendado: {{ formatCurrency(servicio.precio_recomendado || servicio.precioRecomendado) }}
    </small>
    <small v-if="esPrecioBajoMinimo" class="precio-advertencia">
      ⚠️ Precio por debajo del mínimo. Requerirá aprobación administrativa.
    </small>
  </div>
  
  <!-- ✅ CORREGIDO: Un control por cada CATEGORÍA con layout horizontal -->
  <div class="cantidades-container" :data-categorias="categoriasDelServicio.length">
    
    <!-- ✅ NUEVO: Un input por cada CATEGORÍA del servicio -->
    <div v-for="categoria in categoriasDelServicio" :key="categoria.id" class="servicio-controls" :class="`control-${categoria.unidad_tipo}`">
      <label>{{ categoria.etiqueta }}:</label>
      <div class="cantidad-controls">
        <button @click="decrementarCantidad(categoria.id)" :disabled="cantidadesPorCategoria[categoria.id] <= 0" class="btn-cantidad">
          <i class="fas fa-minus"></i>
        </button>
        <input 
          v-model.number="cantidadesPorCategoria[categoria.id]" 
          type="number" 
          min="0" 
          :step="obtenerStepTipo(categoria.unidad_tipo)"
          :class="['input-cantidad', `input-${categoria.unidad_tipo}`]"
          @input="actualizarCantidad(categoria.id)"
          :placeholder="categoria.placeholder"
        >
        <button @click="incrementarCantidad(categoria.id)" class="btn-cantidad">
          <i class="fas fa-plus"></i>
        </button>
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
emits: ['update:modelValue', 'update:cantidadEquipos', 'update:precioVenta', 'update:cantidadesPorTipo'],
setup(props, { emit }) {
  const { servicio, precioVenta, añosContrato } = toRefs(props)
  
  // Estados reactivos
  const precioVentaLocal = ref(precioVenta.value || 0)
  
  // ✅ CORREGIDO: Objeto reactivo para manejar cantidades POR CATEGORÍA
  const cantidadesPorCategoria = reactive({})

  // ✅ CORREGIDO: Computed para obtener TODAS las categorías del servicio
  const categoriasDelServicio = computed(() => {
    const categorias = []
    
    // 🔥 DEBUG TEMPORAL - AGREGAR ESTO
    console.log('🔥 SERVICIO COMPLETO:', servicio.value)
    console.log('🔥 CATEGORIAS_COMPLETAS:', servicio.value.categorias_completas)
    console.log('🔥 CATEGORIA SIMPLE:', servicio.value.categoria)
    
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
      console.log(`🔥 KEYS DISPONIBLES:`, Object.keys(categoria))
      
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

  // Función de formateo
  const formatCurrency = (amount) => {
    const valor = amount || 0
    return `$${valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const calcularSubtotalAnual = () => {
    const precio = precioVentaLocal.value || servicio.value.precio_recomendado || servicio.value.precioRecomendado || 0
    return precio * totalUnidadesPorTipo.value
  }

  const calcularTotalContrato = () => {
    return calcularSubtotalAnual() * añosContrato.value
  }

  const validarPrecioMinimo = () => {
    if (precioVentaLocal.value) {
      const precioMinimo = servicio.value.precio_minimo || servicio.value.precioMinimo || 0
      if (precioVentaLocal.value < precioMinimo) {
        console.warn(`⚠️ Precio ${precioVentaLocal.value} está por debajo del mínimo ${precioMinimo} para ${servicio.value.nombre}`)
      }
    }
  }

  // ✅ CORREGIDO: Métodos para manejar cantidades POR CATEGORÍA
  const incrementarCantidad = (categoriaId) => {
    const categoria = categoriasDelServicio.value.find(c => c.id === categoriaId)
    if (categoria) {
      const step = obtenerStepTipo(categoria.unidad_tipo)
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

  // ✅ CORREGIDO: Método actualizarCantidad con datos estructurados
  const actualizarCantidad = (categoriaId) => {
    if (cantidadesPorCategoria[categoriaId] < 0) {
      cantidadesPorCategoria[categoriaId] = 0
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
      }))
    }
    
    console.log('📤 EMITIENDO DATOS:', datosParaEmitir)
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
    
    // Computed existentes
    esPrecioBajoMinimo,
    totalUnidadesPorTipo,
    
    // ✅ NUEVO: Métodos helper
    obtenerEtiquetaCategoria,
    obtenerPlaceholderCategoria,
    obtenerIconoTipo,
    obtenerStepTipo,
    
    // Métodos
    formatCurrency,
    calcularSubtotalAnual,
    calcularTotalContrato,
    validarPrecioMinimo,
    
    // ✅ CORREGIDO: Métodos para múltiples categorías
    incrementarCantidad,
    decrementarCantidad,
    actualizarCantidad,
    actualizarPrecioVenta,
    inicializarCantidades
  }
}
}
</script>

<style scoped>
/* ✅ NUEVOS ESTILOS para múltiples unidades */
.unidades-info {
 margin-bottom: 0.75rem;
 text-align: center;
 display: flex;
 flex-wrap: wrap;
 gap: 0.25rem;
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

/* ✅ CORREGIDO: Layout horizontal más compacto */
.cantidades-container {
 margin-top: auto;
 background: #f8f9fa;
 padding: 0.5rem;
 border-radius: 6px;
 border: 1px solid #ced4da;
 display: grid;
 grid-template-columns: 1fr 1fr;
 gap: 0.3rem;
 align-items: start;
}

/* ✅ NUEVO: Para 3+ categorías, elementos más pequeños */
.cantidades-container[data-categorias="3"] .servicio-controls,
.cantidades-container[data-categorias="4"] .servicio-controls {
 transform: scale(0.9);
}

.cantidades-container[data-categorias="5"] .servicio-controls,
.cantidades-container[data-categorias="6"] .servicio-controls {
 transform: scale(0.8);
}

.servicio-controls {
 display: flex;
 flex-direction: column;
 align-items: center;
 min-width: 80px;
}

.servicio-controls label {
 font-weight: 600;
 color: #495057;
 font-size: 0.7rem;
 margin-bottom: 0.15rem;
 text-align: center;
 line-height: 1.1;
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
 gap: 0.2rem;
 justify-content: center;
}

.btn-cantidad {
 width: 1.3rem;
 height: 1.3rem;
 border: 1px solid #007bff;
 background: white;
 color: #007bff;
 border-radius: 3px;
 cursor: pointer;
 font-size: 0.65rem;
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
 width: 2rem;
 height: 1.3rem;
 text-align: center;
 border: 1px solid #007bff;
 border-radius: 3px;
 font-size: 0.7rem;
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
 width: 2.2rem !important;
}

.input-usuarios {
 border-color: #7b1fa2 !important;
 width: 2.2rem !important;
}

.input-sesiones {
 border-color: #2e7d32 !important;
 width: 2.2rem !important;
}

.input-tiempo {
 border-color: #ef6c00 !important;
 width: 2.2rem !important;
}

/* ✅ NUEVO: Info múltiple abajo de todo */
.info-multiple {
 grid-column: 1 / -1;
 text-align: center;
 margin-top: 0.3rem;
 padding-top: 0.3rem;
 border-top: 1px solid #dee2e6;
}

.info-multiple small {
 color: #6c757d;
 font-size: 0.6rem;
 font-style: italic;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.25rem;
}

.info-multiple i {
 color: #007bff;
}

/* ✅ MANTENER todos los estilos existentes */
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
 min-height: 400px;
 max-height: 460px;
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

.servicio-descripcion {
 color: #6c757d;
 margin-bottom: 0.75rem;
 font-size: 0.85rem;
 line-height: 1.4;
 overflow: hidden;
 display: -webkit-box;
 -webkit-line-clamp: 2;
 -webkit-box-orient: vertical;
}

.precios-servicio {
 display: flex;
 gap: 0.25rem;
 margin-bottom: 0.75rem;
 flex-wrap: wrap;
}

.precio-item {
 flex: 1;
 min-width: 60px;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 0.25rem;
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
 padding: 0.5rem;
 border-radius: 6px;
 border: 1px solid #ced4da;
}

.precio-venta-container label {
 display: block;
 margin-bottom: 0.25rem;
 font-weight: 600;
 color: #495057;
 font-size: 0.8rem;
}

.input-precio-venta {
 width: 100%;
 height: 2rem;
 padding: 0.25rem 0.5rem;
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
 margin-top: 0.25rem;
 color: #6c757d;
 font-size: 0.7rem;
 font-weight: 500;
 text-align: center;
}

.precio-advertencia {
 display: block;
 margin-top: 0.25rem;
 color: #dc3545;
 font-size: 0.7rem;
 font-weight: 600;
 text-align: center;
}

.contrato-info {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 padding: 0.5rem;
 border-radius: 6px;
 margin-bottom: 0.75rem;
 border: 1px solid #ced4da;
 border-left: 3px solid #007bff;
}

.contrato-años {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 0.25rem;
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
 padding: 0.15rem 0.35rem;
 border-radius: 4px;
 border: 1px solid #ced4da;
}

.precio-total {
 display: flex;
 justify-content: space-between;
 align-items: center;
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
 padding: 0.15rem 0.35rem;
 border-radius: 4px;
 border: 1px solid #ced4da;
}

/* Responsive */
@media (max-width: 768px) {
 .servicio-card {
   min-height: 380px;
   max-height: 440px;
 }
 
 .cantidades-container {
   gap: 0.25rem;
   padding: 0.4rem;
   grid-template-columns: 1fr;
 }
 
 .servicio-controls {
   min-width: auto;
 }
 
 .servicio-controls label {
   font-size: 0.65rem;
   white-space: normal;
 }
 
 .cantidades-container[data-categorias="3"] .servicio-controls,
 .cantidades-container[data-categorias="4"] .servicio-controls,
 .cantidades-container[data-categorias="5"] .servicio-controls,
 .cantidades-container[data-categorias="6"] .servicio-controls {
   transform: none;
 }
}

@media (max-width: 480px) {
 .servicio-card {
   padding: 0.75rem;
   min-height: 360px;
   max-height: 420px;
 }
 
 .precios-servicio {
   flex-direction: column;
   gap: 0.25rem;
 }
 
 .precio-item {
   flex-direction: row;
   justify-content: space-between;
   padding: 0.25rem 0.5rem;
 }
 
 .cantidades-container {
   padding: 0.4rem;
   gap: 0.2rem;
 }
 
 .servicio-controls label {
   font-size: 0.6rem;
   margin-bottom: 0.1rem;
 }
 
 .unidades-info {
   gap: 0.2rem;
 }
 
 .unidad-badge {
   font-size: 0.55rem;
   padding: 0.15rem 0.3rem;
 }
 
 .cantidad-controls {
   gap: 0.15rem;
 }
 
 .btn-cantidad {
   width: 1.1rem;
   height: 1.1rem;
   font-size: 0.6rem;
 }
 
 .input-cantidad {
   width: 1.8rem;
   height: 1.1rem;
   font-size: 0.65rem;
 }
 
 .input-capacidad,
 .input-usuarios,
 .input-sesiones,
 .input-tiempo {
   width: 2rem !important;
 }
 
 .info-multiple small {
   font-size: 0.55rem;
 }
}

/* Animaciones suaves */
.cantidades-container {
 transition: all 0.3s ease;
}

.servicio-controls {
 transition: all 0.2s ease;
}

.unidad-badge {
 transition: all 0.2s ease;
}

.unidad-badge:hover {
 transform: scale(1.05);
}

/* Separadores visuales entre controles solo en móvil */
@media (max-width: 768px) {
 .servicio-controls:not(:last-child) {
   padding-bottom: 0.2rem;
   margin-bottom: 0.2rem;
   border-bottom: 1px solid #e9ecef;
 }
}

/* Quitar separadores en desktop */
@media (min-width: 769px) {
 .servicio-controls:not(:last-child) {
   padding-bottom: 0;
   margin-bottom: 0;
   border-bottom: none;
 }
}

/* Mejoras visuales para focus */
.servicio-controls:focus-within label {
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

/* Estados de validación */
.input-cantidad.error {
 border-color: #dc3545 !important;
 background: #fff5f5;
}

.input-cantidad.success {
 border-color: #28a745 !important;
 background: #f8fff8;
}

/* Hover effects mejorados */
.servicio-controls:hover {
 background: rgba(0, 123, 255, 0.05);
 border-radius: 4px;
 padding: 0.2rem;
 margin: -0.2rem;
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
</style>