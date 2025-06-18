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
            v-model.number="cantidadGB" 
            type="number" 
            min="0" 
            step="1"
            class="input-cantidad gb-input"
            @input="actualizarCantidadGB"
            placeholder="GB"
          >
          <button @click="incrementarGB" class="btn-cantidad">+</button>
        </div>
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
      cantidadGB: 0
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
    // Escuchar cambios en modelValue para resetear GB
    modelValue(newVal) {
      if (this.esServicioBackup && newVal === 0) {
        // Si es un servicio de backup y el valor se resetea a 0, limpiar GB
        this.cantidadGB = 0;
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

    // Métodos para servicios de backup (GB) - MODIFICADO
    incrementarGB() {
      this.cantidadGB = Math.floor(this.cantidadGB) + 1; // Asegurar número entero
      this.actualizarCantidadGB();
    },
    decrementarGB() {
      if (this.cantidadGB >= 1) {
        this.cantidadGB = Math.floor(this.cantidadGB) - 1; // Asegurar número entero
        this.actualizarCantidadGB();
      }
    },
    actualizarCantidadGB() {
      // Asegurar que sea un número entero positivo
      if (this.cantidadGB < 0) {
        this.cantidadGB = 0;
      } else {
        // Convertir a entero si no lo es
        this.cantidadGB = Math.floor(this.cantidadGB) || 0;
      }
      
      // Para servicios de backup, emitimos como cantidad de servidores
      // y ponemos equipos en 0
      this.$emit('update:modelValue', this.cantidadGB);
      this.$emit('update:cantidadEquipos', 0);
    },
    actualizarPrecioVenta() {
      this.$emit('update:precioVenta', this.precioVentaLocal || 0);
    },
    // Método para limpiar datos internos
    limpiarDatosInternos() {
      this.cantidadGB = 0;
      this.precioVentaLocal = this.servicio.precioVenta || 0;
      this.cantidadEquiposLocal = 0;
    }
  }
}
</script>

<style scoped>
.servicio-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 560px;
  max-height: 620px;
}

.servicio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #007bff;
}

.servicio-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.servicio-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: #495057;
}

.servicio-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.2rem;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  font-weight: 600;
}

.servicio-descripcion {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.servicio-equipos {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid #6c757d;
  border: 1px solid #ced4da;
}

.servicio-equipos strong {
  color: #495057;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.servicio-equipos p {
  color: #6c757d;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Precios más formales */
.precios-servicio {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.precio-item {
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.25rem;
  border-radius: 6px;
  border: 1px solid;
  background: white;
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
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.precio-valor {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.1;
  text-align: center;
}

.precio-valor.minimo {
  color: #dc3545;
}

.precio-valor.recomendado {
  color: #ffc107;
}

.precio-valor.venta {
  color: #28a745;
}

.contrato-info {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #ced4da;
  border-left: 3px solid #007bff;
}

.contrato-años {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.contrato-años i {
  color: #007bff;
  margin-right: 0.5rem;
}

.años-valor {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.precio-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
}

.total-valor {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 700;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
}

.precio-venta-container {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
}

.precio-venta-container label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
}

.input-precio-venta {
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;
  background: white;
  transition: all 0.2s ease;
  color: #495057;
}

.input-precio-venta:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.precio-defecto {
  display: block;
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(0, 123, 255, 0.1);
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  border: 1px solid rgba(0, 123, 255, 0.2);
}

/* Contenedor de cantidades más formal */
.cantidades-container {
  margin-top: auto;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
}

/* Controles horizontales para servicios normales */
.cantidades-container:not(.gb-controls) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Estilos específicos para servicios de backup - COMPLETAMENTE CENTRADO */
.gb-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 2rem;
}

.gb-controls label {
  color: #6f42c1 !important;
  font-size: 0.9rem !important;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: block;
  text-align: center;
}

.gb-controls .cantidad-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.gb-input {
  width: 4rem !important;
  background: white !important;
  border-color: #6f42c1 !important;
  color: #495057 !important;
  font-weight: 600;
  text-align: center;
}

.gb-redondeo {
  display: block;
  margin-top: 0.5rem;
  color: #6f42c1;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(111, 66, 193, 0.1);
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  border: 1px solid rgba(111, 66, 193, 0.2);
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

.servicio-controls {
  display: flex;
  flex-direction: column;
}

.servicio-controls label {
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-cantidad {
  width: 2rem;
  height: 2rem;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
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
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-cantidad:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: #6c757d;
  border-color: #ced4da;
}

.input-cantidad {
  width: 3rem;
  height: 2rem;
  text-align: center;
  border: 2px solid #007bff;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
  background: white;
  color: #495057;
}

.input-cantidad:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

/* Responsive */
@media (min-width: 768px) {
  .servicio-card {
    padding: 1.75rem;
    min-height: 600px;
    max-height: 660px;
  }
  
  .servicio-header h3 {
    font-size: 1.3rem;
  }
  
  .servicio-descripcion {
    font-size: 0.95rem;
  }
  
  .precio-label {
    font-size: 0.75rem;
  }
  
  .precio-valor {
    font-size: 0.9rem;
  }
}

@media (min-width: 1200px) {
  .servicio-card {
    min-height: 620px;
    max-height: 680px;
  }
  
  .servicio-header h3 {
    font-size: 1.35rem;
  }
  
  .servicio-descripcion {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .cantidades-container:not(.gb-controls) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .servicio-card {
    padding: 1.25rem;
    min-height: 520px;
  }
  
  .gb-controls {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .servicio-card {
    padding: 1rem;
    min-height: 480px;
  }
  
  .precios-servicio {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .precio-item {
    min-width: auto;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
  }
  
  .servicio-header h3 {
    font-size: 1.1rem;
  }
  
  .servicio-descripcion {
    font-size: 0.85rem;
  }
  
  .gb-controls {
    padding: 0 0.5rem;
  }
}

/* Responsive específico para 3 precios */
@media (min-width: 481px) and (max-width: 768px) {
  .precios-servicio {
    gap: 0.4rem;
  }
  
  .precio-item {
    min-width: 75px;
    padding: 0.4rem 0.2rem;
  }
  
  .precio-label {
    font-size: 0.65rem;
  }
  
  .precio-valor {
    font-size: 0.8rem;
  }
}

/* Para pantallas grandes */
@media (min-width: 1600px) {
  .servicio-card {
    min-height: 640px;
    max-height: 720px;
    padding: 2rem;
  }
  
  .servicio-header h3 {
    font-size: 1.4rem;
  }
  
  .servicio-descripcion {
    font-size: 1.05rem;
  }
  
  .servicio-equipos strong {
    font-size: 0.9rem;
  }
  
  .servicio-equipos p {
    font-size: 0.85rem;
  }
}

/* Estados de accesibilidad */
.btn-cantidad:focus,
.input-cantidad:focus,
.input-precio-venta:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Animaciones suaves */
.servicio-card,
.btn-cantidad,
.precio-item {
  transition: all 0.2s ease;
}
</style>