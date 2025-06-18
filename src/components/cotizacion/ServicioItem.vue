<template>
  <div class="servicio-card">
    <div class="servicio-header">
      <span class="servicio-icon">{{ servicio.icon }}</span>
      <h3>{{ servicio.nombre }}</h3>
    </div>
    <p class="servicio-descripcion">{{ servicio.descripcion }}</p>
    
    <div class="servicio-equipos">
      <strong>Equipos incluidos:</strong>
      <p>{{ servicio.equipos }}</p>
    </div>

    <!-- CORREGIDO: Mostrar los 3 precios -->
    <div class="precios-servicio">
      <div class="precio-item">
        <span class="precio-label">Mínimo:</span>
        <span class="precio-valor minimo">${{ servicio.precioMinimo }}/año</span>
      </div>
      <div class="precio-item">
        <span class="precio-label">Recomendado:</span>
        <span class="precio-valor recomendado">${{ servicio.precioModerado }}/año</span>
      </div>
      <div class="precio-item">
        <span class="precio-label">Venta:</span>
        <span class="precio-valor venta">${{ precioVentaLocal || servicio.precioModerado }}/año</span>
      </div>
    </div>

    <div class="contrato-info">
      <div class="contrato-años">
        <i class="fas fa-calendar-alt"></i>
        <span class="años-valor">{{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</span>
      </div>
      <div class="precio-total">
        <span class="total-label">Total contrato:</span>
        <span class="total-valor">${{ ((precioVentaLocal || servicio.precioModerado) * añosContrato).toLocaleString() }}</span>
      </div>
    </div>

    <div class="precio-venta-container">
      <label for="precio-venta">Precio de Venta Anual (opcional):</label>
      <input 
        v-model.number="precioVentaLocal" 
        type="number" 
        min="0" 
        step="0.01"
        placeholder="Deja vacío para usar precio recomendado"
        class="input-precio-venta"
        @input="actualizarPrecioVenta"
      >
      <small v-if="!precioVentaLocal || precioVentaLocal === 0" class="precio-defecto">
        Se usará precio recomendado: ${{ servicio.precioModerado }}/año
      </small>
    </div>
    
    <!-- Condición para mostrar diferentes controles según la categoría -->
    <div class="cantidades-container">
      <!-- Para servicios de backup -->
      <div v-if="esServicioBackup" class="servicio-controls gb-controls">
        <label>Cantidad de GB:</label>
        <div class="cantidad-controls">
          <button @click="decrementarGB" :disabled="cantidadGB <= 0" class="btn-cantidad">-</button>
          <input 
            v-model.number="cantidadGBInput" 
            type="number" 
            min="0" 
            step="100"
            class="input-cantidad gb-input"
            @input="actualizarCantidadGB"
            @blur="redondearGB"
            placeholder="GB"
          >
          <button @click="incrementarGB" class="btn-cantidad">+</button>
        </div>
        <small v-if="cantidadGBInput !== cantidadGB && cantidadGBInput > 0" class="gb-redondeo">
          Se redondeará a: {{ cantidadGB }} GB
        </small>
      </div>

      <!-- Para servicios normales -->
      <template v-else>
        <div class="servicio-controls">
          <label>Cantidad de servidores:</label>
          <div class="cantidad-controls">
            <button @click="decrementarServidores" :disabled="cantidadServidores <= 0" class="btn-cantidad">-</button>
            <input 
              v-model.number="cantidadServidores" 
              type="number" 
              min="0" 
              class="input-cantidad"
              @input="actualizarCantidadServidores"
            >
            <button @click="incrementarServidores" class="btn-cantidad">+</button>
          </div>
        </div>

        <div class="servicio-controls">
          <label>Cantidad de equipos:</label>
          <div class="cantidad-controls">
            <button @click="decrementarEquipos" :disabled="cantidadEquiposLocal <= 0" class="btn-cantidad">-</button>
            <input 
              v-model.number="cantidadEquiposLocal" 
              type="number" 
              min="0" 
              class="input-cantidad"
              @input="actualizarCantidadEquipos"
            >
            <button @click="incrementarEquipos" class="btn-cantidad">+</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      precioVentaLocal: this.precioVenta || 0,
      cantidadEquiposLocal: this.cantidadEquipos || 0,
      cantidadGB: 0,
      cantidadGBInput: 0
    };
  },
  computed: {
    cantidadServidores: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    esServicioBackup() {
      return this.servicio.categoria === 'backup' || this.servicio.categoria === 'respaldo';
    }
  },
  watch: {
    precioVenta(newVal) {
      this.precioVentaLocal = newVal || 0;
    },
    cantidadEquipos(newVal) {
      this.cantidadEquiposLocal = newVal || 0;
    },
    // NUEVO: Escuchar cambios en modelValue para resetear GB
    modelValue(newVal) {
      if (this.esServicioBackup && newVal === 0) {
        // Si es un servicio de backup y el valor se resetea a 0, limpiar GB
        this.cantidadGB = 0;
        this.cantidadGBInput = 0;
      }
    }
  },
  methods: {
    // Métodos para servicios normales
    incrementarServidores() {
      this.cantidadServidores++;
    },
    decrementarServidores() {
      if (this.cantidadServidores > 0) {
        this.cantidadServidores--;
      }
    },
    actualizarCantidadServidores() {
      if (this.cantidadServidores < 0) {
        this.cantidadServidores = 0;
      }
    },
    incrementarEquipos() {
      this.cantidadEquiposLocal++;
      this.$emit('update:cantidadEquipos', this.cantidadEquiposLocal);
    },
    decrementarEquipos() {
      if (this.cantidadEquiposLocal > 0) {
        this.cantidadEquiposLocal--;
        this.$emit('update:cantidadEquipos', this.cantidadEquiposLocal);
      }
    },
    actualizarCantidadEquipos() {
      if (this.cantidadEquiposLocal < 0) {
        this.cantidadEquiposLocal = 0;
      }
      this.$emit('update:cantidadEquipos', this.cantidadEquiposLocal);
    },

    // Métodos para servicios de backup (GB)
    redondearAMultiploDe100(cantidad) {
      if (cantidad <= 0) return 0;
      return Math.ceil(cantidad / 100) * 100;
    },
    incrementarGB() {
      this.cantidadGBInput += 100;
      this.actualizarCantidadGB();
    },
    decrementarGB() {
      if (this.cantidadGBInput >= 100) {
        this.cantidadGBInput -= 100;
        this.actualizarCantidadGB();
      }
    },
    actualizarCantidadGB() {
      if (this.cantidadGBInput < 0) {
        this.cantidadGBInput = 0;
      }
      
      // Redondear automáticamente a múltiplo de 100
      this.cantidadGB = this.redondearAMultiploDe100(this.cantidadGBInput);
      
      // Para servicios de backup, emitimos como cantidad de servidores
      // y ponemos equipos en 0
      this.$emit('update:modelValue', this.cantidadGB);
      this.$emit('update:cantidadEquipos', 0);
    },
    redondearGB() {
      // Al salir del campo, actualizar el input con el valor redondeado
      if (this.cantidadGBInput > 0) {
        this.cantidadGBInput = this.cantidadGB;
      }
    },
    actualizarPrecioVenta() {
      this.$emit('update:precioVenta', this.precioVentaLocal || 0);
    },
    // NUEVO: Método para limpiar datos internos
    limpiarDatosInternos() {
      this.cantidadGB = 0;
      this.cantidadGBInput = 0;
      this.precioVentaLocal = this.servicio.precioVenta || 0;
      this.cantidadEquiposLocal = 0;
    }
  }
}
</script>

<style scoped>
.servicio-card {
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 520px;
  max-height: 580px;
}

.servicio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.servicio-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.6rem;
}

.servicio-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.servicio-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  font-weight: 600;
}

.servicio-descripcion {
  color: #6c757d;
  margin-bottom: 0.8rem;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.servicio-equipos {
  background: linear-gradient(135deg, #e3f2fd, #f0f7ff);
  padding: 0.6rem;
  border-radius: 0.5rem;
  margin-bottom: 0.8rem;
  border-left: 3px solid #2196f3;
  border: 1px solid #bbdefb;
}

.servicio-equipos strong {
  color: #1976d2;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
}

.servicio-equipos p {
  color: #424242;
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.precios-servicio {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.precio-item {
  flex: 1;
  min-width: 75px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0.2rem;
  border-radius: 0.4rem;
  border: 2px solid transparent;
}

.precio-item:first-child {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border-color: #f44336;
}

.precio-item:nth-child(2) {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-color: #ff9800;
}

.precio-item:last-child {
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  border-color: #4caf50;
}

.precio-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.precio-valor {
  font-weight: bold;
  font-size: 0.8rem;
  line-height: 1.1;
  text-align: center;
}

.precio-valor.minimo {
  color: #d32f2f;
}

.precio-valor.recomendado {
  color: #f57c00;
}

.precio-valor.venta {
  color: #2e7d32;
}

.contrato-info {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  padding: 0.6rem;
  border-radius: 0.4rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ffcc02;
  border-left: 3px solid #ff9800;
}

.contrato-años {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.años-label {
  font-size: 0.75rem;
  color: #e65100;
  font-weight: 600;
}

.años-valor {
  font-size: 0.8rem;
  color: #bf360c;
  font-weight: bold;
  background: white;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
}

.precio-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 0.75rem;
  color: #e65100;
  font-weight: 600;
}

.total-valor {
  font-size: 0.8rem;
  color: #bf360c;
  font-weight: bold;
  background: white;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
}

.precio-venta-container {
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  padding: 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid #c8e6c9;
}

.precio-venta-container label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #2e7d32;
  font-size: 0.8rem;
}

.input-precio-venta {
  width: 100%;
  height: 2.2rem;
  padding: 0.5rem;
  border: 2px solid #4caf50;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  box-sizing: border-box;
  background: white;
  transition: all 0.2s ease;
}

.input-precio-venta:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.precio-defecto {
  display: block;
  margin-top: 0.4rem;
  color: #388e3c;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.3rem 0.4rem;
  border-radius: 0.3rem;
  text-align: center;
}

.cantidades-container {
  margin-top: auto;
  display: flex;
  gap: 0.6rem;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  padding: 0.7rem;
  border-radius: 0.4rem;
  border: 1px solid #e0e0e0;
}

/* Estilos específicos para servicios de backup */
.gb-controls {
  width: 100%;
  text-align: center;
}

.gb-controls label {
  color: #673ab7 !important;
  font-size: 0.85rem !important;
}

.gb-input {
  width: 3.5rem !important;
  background: linear-gradient(135deg, #f3e5f5, #e1bee7) !important;
  border-color: #9c27b0 !important;
  color: #4a148c !important;
}

.gb-redondeo {
  display: block;
  margin-top: 0.4rem;
  color: #673ab7;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(156, 39, 176, 0.1);
  padding: 0.3rem 0.4rem;
  border-radius: 0.3rem;
  text-align: center;
}

.servicio-controls {
  flex: 1;
}

.servicio-controls label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #424242;
  font-size: 0.8rem;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
}

.btn-cantidad {
  width: 1.8rem;
  height: 1.8rem;
  border: 2px solid #2196f3;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-cantidad:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  transform: translateY(-1px);
}

.btn-cantidad:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #bdbdbd;
  border-color: #bdbdbd;
}

.input-cantidad {
  width: 2.5rem;
  height: 1.8rem;
  text-align: center;
  border: 2px solid #2196f3;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
  background: white;
  color: #1976d2;
}

.input-cantidad:focus {
  outline: none;
  border-color: #1565c0;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

/* Responsive para cards ultra-compactas */
@media (min-width: 768px) {
  .servicio-card {
    padding: 1.2rem;
    min-height: 560px;
    max-height: 620px;
  }
  
  .servicio-header h3 {
    font-size: 1.2rem;
  }
  
  .servicio-descripcion {
    font-size: 0.9rem;
  }
  
  .precio-label {
    font-size: 0.75rem;
  }
  
  .precio-valor {
    font-size: 0.85rem;
  }
}

@media (min-width: 1200px) {
  .servicio-card {
    min-height: 580px;
    max-height: 640px;
  }
  
  .cantidades-container:not(.gb-controls) {
    flex-direction: column;
    gap: 0.7rem;
  }
  
  .servicio-header h3 {
    font-size: 1.25rem;
  }
  
  .servicio-descripcion {
    font-size: 0.95rem;
  }
}

@media (max-width: 320px) {
  .servicio-card {
    padding: 0.8rem;
    min-height: 480px;
  }
  
  .precios-servicio {
    flex-direction: column;
    gap: 0.4rem;
  }
  
  .precio-item {
    min-width: auto;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.4rem 0.6rem;
  }
  
  .cantidades-container:not(.gb-controls) {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .servicio-header h3 {
    font-size: 1rem;
  }
  
  .servicio-descripcion {
    font-size: 0.8rem;
  }
}

/* Responsive específico para 3 precios */
@media (min-width: 321px) and (max-width: 480px) {
  .precios-servicio {
    gap: 0.25rem;
  }
  
  .precio-item {
    min-width: 70px;
    padding: 0.35rem 0.1rem;
  }
  
  .precio-label {
    font-size: 0.65rem;
  }
  
  .precio-valor {
    font-size: 0.75rem;
  }
}

/* Para pantallas medianas ajustar el tamaño de los precios */
@media (min-width: 768px) and (max-width: 1199px) {
  .precio-item {
    min-width: 80px;
    padding: 0.45rem 0.25rem;
  }
  
  .precio-label {
    font-size: 0.75rem;
  }
  
  .precio-valor {
    font-size: 0.85rem;
  }
}

/* Ajustes adicionales para mejor distribución en grids */
@media (min-width: 1600px) {
  .servicio-card {
    min-height: 600px;
    max-height: 660px;
    padding: 1.4rem;
  }
  
  .servicio-header h3 {
    font-size: 1.3rem;
  }
  
  .servicio-descripcion {
    font-size: 1rem;
  }
  
  .servicio-equipos strong {
    font-size: 0.85rem;
  }
  
  .servicio-equipos p {
    font-size: 0.8rem;
  }
}
</style>