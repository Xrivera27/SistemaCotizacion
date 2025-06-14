//components/Servicios
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
    
    <div class="cantidades-container">
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
      cantidadEquiposLocal: this.cantidadEquipos || 0
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
    }
  },
  watch: {
    precioVenta(newVal) {
      this.precioVentaLocal = newVal || 0;
    },
    cantidadEquipos(newVal) {
      this.cantidadEquiposLocal = newVal || 0;
    }
  },
  methods: {
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
    actualizarPrecioVenta() {
      this.$emit('update:precioVenta', this.precioVentaLocal || 0);
    }
  }
}
</script>

<style scoped>
.servicio-card {
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  padding: 0.6rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 420px;
  max-height: 450px;
}

.servicio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.servicio-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.4rem;
}

.servicio-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.servicio-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  font-weight: 600;
}

.servicio-descripcion {
  color: #6c757d;
  margin-bottom: 0.6rem;
  font-size: 0.75rem;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.servicio-equipos {
  background: linear-gradient(135deg, #e3f2fd, #f0f7ff);
  padding: 0.4rem;
  border-radius: 0.4rem;
  margin-bottom: 0.6rem;
  border-left: 3px solid #2196f3;
  border: 1px solid #bbdefb;
}

.servicio-equipos strong {
  color: #1976d2;
  font-size: 0.7rem;
  display: block;
  margin-bottom: 0.2rem;
  font-weight: 600;
}

.servicio-equipos p {
  color: #424242;
  font-size: 0.65rem;
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.precios-servicio {
  display: flex;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}

.precio-item {
  flex: 1;
  min-width: 65px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.3rem 0.1rem;
  border-radius: 0.3rem;
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
  font-size: 0.6rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.precio-valor {
  font-weight: bold;
  font-size: 0.7rem;
  line-height: 1;
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
  padding: 0.4rem;
  border-radius: 0.3rem;
  margin-bottom: 0.6rem;
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
  font-size: 0.65rem;
  color: #e65100;
  font-weight: 600;
}

.años-valor {
  font-size: 0.7rem;
  color: #bf360c;
  font-weight: bold;
  background: white;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
}

.precio-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 0.65rem;
  color: #e65100;
  font-weight: 600;
}

.total-valor {
  font-size: 0.7rem;
  color: #bf360c;
  font-weight: bold;
  background: white;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
}

.precio-venta-container {
  margin-bottom: 0.6rem;
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  padding: 0.4rem;
  border-radius: 0.3rem;
  border: 1px solid #c8e6c9;
}

.precio-venta-container label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #2e7d32;
  font-size: 0.7rem;
}

.input-precio-venta {
  width: 100%;
  height: 1.8rem;
  padding: 0.4rem;
  border: 2px solid #4caf50;
  border-radius: 0.3rem;
  font-size: 0.75rem;
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
  margin-top: 0.3rem;
  color: #388e3c;
  font-size: 0.65rem;
  font-weight: 500;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.2rem 0.3rem;
  border-radius: 0.2rem;
  text-align: center;
}

.cantidades-container {
  margin-top: auto;
  display: flex;
  gap: 0.4rem;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid #e0e0e0;
}

.servicio-controls {
  flex: 1;
}

.servicio-controls label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #424242;
  font-size: 0.7rem;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  justify-content: center;
}

.btn-cantidad {
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid #2196f3;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
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
  width: 2.2rem;
  height: 1.6rem;
  text-align: center;
  border: 2px solid #2196f3;
  border-radius: 0.3rem;
  font-size: 0.75rem;
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
    padding: 0.7rem;
    min-height: 440px;
    max-height: 480px;
  }
}

@media (min-width: 1200px) {
  .servicio-card {
    min-height: 460px;
    max-height: 500px;
  }
  
  .cantidades-container {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 320px) {
  .servicio-card {
    padding: 0.5rem;
    min-height: 380px;
  }
  
  .precios-servicio {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .precio-item {
    min-width: auto;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.3rem 0.5rem;
  }
  
  .cantidades-container {
    flex-direction: column;
    gap: 0.4rem;
  }
}

/* Responsive específico para 3 precios */
@media (min-width: 321px) and (max-width: 480px) {
  .precios-servicio {
    gap: 0.15rem;
  }
  
  .precio-item {
    min-width: 60px;
    padding: 0.25rem 0.05rem;
  }
  
  .precio-label {
    font-size: 0.55rem;
  }
  
  .precio-valor {
    font-size: 0.65rem;
  }
}

/* Para pantallas medianas ajustar el tamaño de los precios */
@media (min-width: 768px) and (max-width: 1199px) {
  .precio-item {
    min-width: 70px;
    padding: 0.35rem 0.15rem;
  }
  
  .precio-label {
    font-size: 0.65rem;
  }
  
  .precio-valor {
    font-size: 0.75rem;
  }
}
</style>