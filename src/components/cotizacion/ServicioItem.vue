<template>
  <div class="servicio-card">
    <div class="servicio-header">
      <span class="servicio-icon">
        <i class="fas fa-cloud"></i>
      </span>
      <h3>{{ servicio.nombre }}</h3>
    </div>
    
    <p class="servicio-descripcion">{{ servicio.descripcion || 'Servicio cloud empresarial' }}</p>

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

    <!-- ✅ MANTENER: Información del contrato -->
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
    
    <!-- Controles según el tipo de servicio -->
    <div class="cantidades-container">
      <!-- Para servicios de backup -->
      <div v-if="esServicioBackup" class="servicio-controls gb-controls">
        <label>Cantidad de GB:</label>
        <div class="cantidad-controls">
          <button @click="decrementarGB" :disabled="cantidadGB <= 0" class="btn-cantidad">
            <i class="fas fa-minus"></i>
          </button>
          <input 
            v-model.number="cantidadGB" 
            type="number" 
            min="0" 
            step="1"
            class="input-cantidad gb-input"
            @input="actualizarCantidadGB"
            placeholder="0"
          >
          <button @click="incrementarGB" class="btn-cantidad">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Para servicios normales -->
      <template v-else>
        <div class="servicio-controls">
          <label>Servidores:</label>
          <div class="cantidad-controls">
            <button @click="decrementarServidores" :disabled="cantidadServidores <= 0" class="btn-cantidad">
              <i class="fas fa-minus"></i>
            </button>
            <input 
              v-model.number="cantidadServidores" 
              type="number" 
              min="0" 
              class="input-cantidad"
              @input="actualizarCantidadServidores"
              placeholder="0"
            >
            <button @click="incrementarServidores" class="btn-cantidad">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div class="servicio-controls">
          <label>Equipos:</label>
          <div class="cantidad-controls">
            <button @click="decrementarEquipos" :disabled="cantidadEquiposLocal <= 0" class="btn-cantidad">
              <i class="fas fa-minus"></i>
            </button>
            <input 
              v-model.number="cantidadEquiposLocal" 
              type="number" 
              min="0" 
              class="input-cantidad"
              @input="actualizarCantidadEquipos"
              placeholder="0"
            >
            <button @click="incrementarEquipos" class="btn-cantidad">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue'

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
  emits: ['update:modelValue', 'update:cantidadEquipos', 'update:precioVenta'],
  setup(props, { emit }) {
    const { servicio, modelValue, cantidadEquipos, precioVenta, añosContrato } = toRefs(props)
    
    // Estados reactivos
    const precioVentaLocal = ref(precioVenta.value || 0)
    const cantidadEquiposLocal = ref(cantidadEquipos.value || 0)
    const cantidadGB = ref(0)

    // Computed properties
    const cantidadServidores = computed({
      get() {
        return modelValue.value
      },
      set(value) {
        emit('update:modelValue', value || 0)
      }
    })

    const esServicioBackup = computed(() => {
      const categoria = servicio.value.categoria?.nombre?.toLowerCase() || 
                       servicio.value.categoria?.toLowerCase() || ''
      return categoria.includes('backup') || categoria.includes('respaldo')
    })

    const esPrecioBajoMinimo = computed(() => {
      if (!precioVentaLocal.value) return false
      const precioMinimo = servicio.value.precio_minimo || servicio.value.precioMinimo || 0
      return precioVentaLocal.value < precioMinimo
    })

    const totalUnidades = computed(() => {
      return (cantidadServidores.value || 0) + (cantidadEquiposLocal.value || 0)
    })

    // ✅ FUNCIÓN CORREGIDA - Formatear en dólares
    const formatCurrency = (amount) => {
      const valor = amount || 0
      return `$${valor.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }

    // ✅ MANTENER: Métodos de cálculo para el contrato
    const calcularSubtotalAnual = () => {
      const precio = precioVentaLocal.value || servicio.value.precio_recomendado || servicio.value.precioRecomendado || 0
      
      if (esServicioBackup.value) {
        return precio * (cantidadGB.value || 0)
      }
      
      return precio * totalUnidades.value
    }

    const calcularTotalContrato = () => {
      return calcularSubtotalAnual() * añosContrato.value
    }

    // Resto de métodos (sin cambios)...
    const validarPrecioMinimo = () => {
      if (precioVentaLocal.value) {
        const precioMinimo = servicio.value.precio_minimo || servicio.value.precioMinimo || 0
        if (precioVentaLocal.value < precioMinimo) {
          console.warn(`⚠️ Precio ${precioVentaLocal.value} está por debajo del mínimo ${precioMinimo} para ${servicio.value.nombre}`)
        }
      }
    }

    // Métodos para servicios normales
    const incrementarServidores = () => {
      cantidadServidores.value = (cantidadServidores.value || 0) + 1
    }

    const decrementarServidores = () => {
      if (cantidadServidores.value > 0) {
        cantidadServidores.value = cantidadServidores.value - 1
      }
    }

    const actualizarCantidadServidores = () => {
      if (cantidadServidores.value < 0) {
        cantidadServidores.value = 0
      }
    }

    const incrementarEquipos = () => {
      cantidadEquiposLocal.value = (cantidadEquiposLocal.value || 0) + 1
      emit('update:cantidadEquipos', cantidadEquiposLocal.value)
    }

    const decrementarEquipos = () => {
      if (cantidadEquiposLocal.value > 0) {
        cantidadEquiposLocal.value = cantidadEquiposLocal.value - 1
        emit('update:cantidadEquipos', cantidadEquiposLocal.value)
      }
    }

    const actualizarCantidadEquipos = () => {
      if (cantidadEquiposLocal.value < 0) {
        cantidadEquiposLocal.value = 0
      }
      emit('update:cantidadEquipos', cantidadEquiposLocal.value)
    }

    // Métodos para servicios de backup
    const incrementarGB = () => {
      cantidadGB.value = Math.floor(cantidadGB.value || 0) + 1
      actualizarCantidadGB()
    }

    const decrementarGB = () => {
      if (cantidadGB.value >= 1) {
        cantidadGB.value = Math.floor(cantidadGB.value) - 1
        actualizarCantidadGB()
      }
    }

    const actualizarCantidadGB = () => {
      if (cantidadGB.value < 0) {
        cantidadGB.value = 0
      } else {
        cantidadGB.value = Math.floor(cantidadGB.value || 0)
      }
      
      emit('update:modelValue', cantidadGB.value)
      emit('update:cantidadEquipos', 0)
    }

    const actualizarPrecioVenta = () => {
      emit('update:precioVenta', precioVentaLocal.value || 0)
    }

    // Watchers
    watch(precioVenta, (newVal) => {
      precioVentaLocal.value = newVal || 0
    })

    watch(cantidadEquipos, (newVal) => {
      cantidadEquiposLocal.value = newVal || 0
    })

    watch(modelValue, (newVal) => {
      if (esServicioBackup.value && newVal === 0) {
        cantidadGB.value = 0
      } else if (esServicioBackup.value) {
        cantidadGB.value = newVal || 0
      }
    })

    // Inicialización
    if (esServicioBackup.value && modelValue.value) {
      cantidadGB.value = modelValue.value
    }

    return {
      // Estados
      precioVentaLocal,
      cantidadEquiposLocal,
      cantidadGB,
      
      // Computed
      cantidadServidores,
      esServicioBackup,
      esPrecioBajoMinimo,
      totalUnidades,
      
      // Métodos
      formatCurrency,
      calcularSubtotalAnual,
      calcularTotalContrato,
      validarPrecioMinimo,
      incrementarServidores,
      decrementarServidores,
      actualizarCantidadServidores,
      incrementarEquipos,
      decrementarEquipos,
      actualizarCantidadEquipos,
      incrementarGB,
      decrementarGB,
      actualizarCantidadGB,
      actualizarPrecioVenta
    }
  }
}
</script>

<style scoped>
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
  min-height: 360px;
  max-height: 400px;
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

.cantidades-container {
  margin-top: auto;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ced4da;
}

.cantidades-container:not(.gb-controls) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.gb-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.servicio-controls {
  display: flex;
  flex-direction: column;
}

.servicio-controls label {
  font-weight: 600;
  color: #495057;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  text-align: center;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
}

.btn-cantidad {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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
  width: 2.5rem;
  height: 1.5rem;
  text-align: center;
  border: 1px solid #007bff;
  border-radius: 4px;
  font-size: 0.8rem;
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

.gb-input {
  width: 3rem !important;
  border-color: #6f42c1 !important;
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

@media (max-width: 768px) {
  .cantidades-container:not(.gb-controls) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .servicio-card {
    min-height: 320px;
    max-height: 360px;
  }
}

@media (max-width: 480px) {
  .servicio-card {
    padding: 0.75rem;
    min-height: 300px;
    max-height: 340px;
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
}
</style>