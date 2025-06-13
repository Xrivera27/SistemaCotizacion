<template>
  <div class="servicio-card">
    <div class="servicio-header">
      <span class="servicio-icon">{{ servicio.icon }}</span>
      <h3>{{ servicio.nombre }}</h3>
    </div>
    <p class="servicio-descripcion">{{ servicio.descripcion }}</p>
    <div class="servicio-precio">
      ${{ servicio.precioBase }}/mes por servidor
    </div>
    <div class="servicio-controls">
      <label>Cantidad de servidores:</label>
      <div class="cantidad-controls">
        <button @click="decrementar" :disabled="cantidad <= 0" class="btn-cantidad">-</button>
        <input 
          v-model.number="cantidad" 
          type="number" 
          min="0" 
          class="input-cantidad"
          @input="actualizarCantidad"
        >
        <button @click="incrementar" class="btn-cantidad">+</button>
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
    }
  },
  emits: ['update:modelValue'],
  computed: {
    cantidad: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    incrementar() {
      this.cantidad++;
    },
    decrementar() {
      if (this.cantidad > 0) {
        this.cantidad--;
      }
    },
    actualizarCantidad() {
      if (this.cantidad < 0) {
        this.cantidad = 0;
      }
    }
  }
}
</script>

<style scoped>
.servicio-card {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.servicio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.servicio-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.servicio-icon {
  font-size: 24px;
  margin-right: 12px;
}

.servicio-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.servicio-descripcion {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 14px;
}

.servicio-precio {
  font-weight: bold;
  color: #27ae60;
  font-size: 16px;
  margin-bottom: 15px;
}

.servicio-controls label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cantidad {
  width: 35px;
  height: 35px;
  border: 1px solid #bdc3c7;
  background: #ecf0f1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-cantidad:hover:not(:disabled) {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-cantidad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-cantidad {
  width: 80px;
  height: 35px;
  text-align: center;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 16px;
}

.input-cantidad:focus {
  outline: none;
  border-color: #3498db;
}
</style>