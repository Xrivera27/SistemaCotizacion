<template>
  <div class="cotizacion-form-container">
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

    <div class="servicios-grid">
      <ServicioItem
        v-for="servicio in servicios"
        :key="servicio.id"
        :servicio="servicio"
        v-model="cantidades[servicio.id]"
        :cantidadEquipos="cantidadesEquipos[servicio.id]"
        :precioVenta="preciosVenta[servicio.id]"
        :añosContrato="añosContrato"
        @update:cantidadEquipos="actualizarCantidadEquipos(servicio.id, $event)"
        @update:precioVenta="actualizarPrecioVenta(servicio.id, $event)"
      />
    </div>

    <div class="form-actions">
      <button @click="calcularCotizacion" class="btn-calcular" :disabled="!hayServicios">
        <i class="fas fa-calculator"></i>
        Calcular Cotización
      </button>
      <button @click="limpiarFormulario" class="btn-limpiar">
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
import { reactive } from 'vue'
import ServicioItem from './ServicioItem.vue';
import ResultadoCotizacion from './ResultadoCotizacion.vue';
import { servicios } from '@/data/servicios.js';

export default {
  name: 'CotizacionForm',
  components: {
    ServicioItem,
    ResultadoCotizacion
  },
  setup() {
    const cantidades = reactive({});
    const cantidadesEquipos = reactive({});
    const preciosVenta = reactive({});
    
    const inicializarDatos = () => {
      servicios.forEach(servicio => {
        cantidades[servicio.id] = 0;
        cantidadesEquipos[servicio.id] = 0;
        preciosVenta[servicio.id] = servicio.precioVenta || 0;
      });
    };

    inicializarDatos();

    return {
      cantidades,
      cantidadesEquipos,
      preciosVenta,
      inicializarDatos
    };
  },
  data() {
    return {
      servicios,
      serviciosSeleccionados: [],
      añosContrato: 1
    };
  },
  computed: {
    hayServicios() {
      return Object.values(this.cantidades).some(cantidad => cantidad > 0) ||
             Object.values(this.cantidadesEquipos).some(cantidad => cantidad > 0);
    }
  },
  methods: {
    actualizarCantidadEquipos(servicioId, nuevaCantidad) {
      this.cantidadesEquipos[servicioId] = nuevaCantidad || 0;
    },
    actualizarPrecioVenta(servicioId, nuevoPrecio) {
      this.preciosVenta[servicioId] = nuevoPrecio || 0;
    },
    incrementarAños() {
      if (this.añosContrato < 10) {
        this.añosContrato++;
      }
    },
    decrementarAños() {
      if (this.añosContrato > 1) {
        this.añosContrato--;
      }
    },
    validarAños() {
      if (this.añosContrato < 1) {
        this.añosContrato = 1;
      } else if (this.añosContrato > 10) {
        this.añosContrato = 10;
      }
    },
    calcularCotizacion() {
      this.serviciosSeleccionados = this.servicios
        .filter(servicio => 
          this.cantidades[servicio.id] > 0 || 
          this.cantidadesEquipos[servicio.id] > 0
        )
        .map(servicio => {
          const precioVentaFinal = this.preciosVenta[servicio.id] || servicio.precioModerado;
          return {
            servicio,
            cantidadServidores: this.cantidades[servicio.id],
            cantidadEquipos: this.cantidadesEquipos[servicio.id],
            precioVentaFinal,
            añosContrato: this.añosContrato
          };
        });
    },
    limpiarFormulario() {
      this.servicios.forEach(servicio => {
        this.cantidades[servicio.id] = 0;
        this.cantidadesEquipos[servicio.id] = 0;
        this.preciosVenta[servicio.id] = servicio.precioVenta || 0;
      });
      this.serviciosSeleccionados = [];
      this.añosContrato = 1;
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

.años-selector {
  background: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(52, 152, 219, 0.2);
}

.años-container {
  text-align: center;
}

.años-container label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  margin-bottom: 1rem;
}

.años-container label i {
  color: #3498db;
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
  border: 2px solid #3498db;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-años:hover:not(:disabled) {
  background: rgba(52, 152, 219, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-años:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: #95a5a6;
}

.input-años {
  width: 4rem;
  height: 3rem;
  text-align: center;
  border: 2px solid #3498db;
  border-radius: 0.75rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: white;
  color: #2c3e50;
}

.input-años:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.años-info {
  color: #34495e;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.años-info i {
  color: #3498db;
  font-size: 0.9em;
}

.servicios-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  grid-template-columns: 1fr;
  width: 100%;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-calcular, .btn-limpiar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 150px;
  flex: 1;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-calcular {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
}

.btn-calcular:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.6);
}

.btn-calcular:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-calcular:disabled i {
  color: #7f8c8d;
}

.btn-limpiar {
  background: linear-gradient(135deg, #fc4a1a, #f7b733);
  color: white;
  box-shadow: 0 4px 15px rgba(252, 74, 26, 0.4);
}

.btn-limpiar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(252, 74, 26, 0.6);
}

.btn-calcular i,
.btn-limpiar i {
  font-size: 1.1em;
}

/* Responsive */
@media (min-width: 480px) {
  .cotizacion-form-container {
    padding: 0;
  }
  
  .servicios-grid {
    gap: 1.5rem;
  }
  
  .años-selector {
    padding: 2rem;
  }
}

@media (min-width: 768px) {
  .servicios-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .btn-calcular, .btn-limpiar {
    padding: 1rem 2rem;
    font-size: 1rem;
    flex: none;
    min-width: 180px;
  }
}

@media (min-width: 1024px) {
  .servicios-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1200px) {
  .servicios-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1600px) {
  .servicios-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 320px) {
  .servicios-grid {
    gap: 1rem;
  }
  
  .años-selector {
    padding: 1rem;
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
  }
  
  .btn-calcular i,
  .btn-limpiar i {
    font-size: 1em;
  }
}

.cotizacion-form-container * {
  box-sizing: border-box;
}
</style>