<template>
  <div class="cotizacion-form">
    <div class="form-header">
      <h1>💼 Sistema de Cotización Cloud</h1>
      <p>Selecciona los servicios y configura la cantidad de servidores necesarios</p>
    </div>

    <div class="servicios-grid">
      <ServicioItem
        v-for="servicio in servicios"
        :key="servicio.id"
        :servicio="servicio"
        v-model="cantidades[servicio.id]"
      />
    </div>

    <div class="form-actions">
      <button @click="calcularCotizacion" class="btn-calcular" :disabled="!hayServicios">
        🧮 Calcular Cotización
      </button>
      <button @click="limpiarFormulario" class="btn-limpiar">
        🗑️ Limpiar Todo
      </button>
    </div>

    <ResultadoCotizacion
      :servicios-seleccionados="serviciosSeleccionados"
      @reiniciar="limpiarFormulario"
    />
  </div>
</template>

<script>
import { reactive } from 'vue'
import ServicioItem from './ServicioItem.vue';
import ResultadoCotizacion from './ResultadoCotizacion.vue';
import { servicios } from '../data/servicios.js';

export default {
  name: 'CotizacionForm',
  components: {
    ServicioItem,
    ResultadoCotizacion
  },
  setup() {
    // Crear cantidades reactivas
    const cantidades = reactive({});
    
    // Inicializar cantidades
    const inicializarCantidades = () => {
      servicios.forEach(servicio => {
        cantidades[servicio.id] = 0;
      });
    };

    // Inicializar al cargar
    inicializarCantidades();

    return {
      cantidades,
      inicializarCantidades
    };
  },
  data() {
    return {
      servicios,
      serviciosSeleccionados: []
    };
  },
  computed: {
    hayServicios() {
      return Object.values(this.cantidades).some(cantidad => cantidad > 0);
    }
  },
  methods: {
    calcularCotizacion() {
      this.serviciosSeleccionados = this.servicios
        .filter(servicio => this.cantidades[servicio.id] > 0)
        .map(servicio => ({
          servicio,
          cantidad: this.cantidades[servicio.id]
        }));
    },
    limpiarFormulario() {
      // Resetear todas las cantidades a 0
      this.servicios.forEach(servicio => {
        this.cantidades[servicio.id] = 0;
      });
      this.serviciosSeleccionados = [];
    }
  }
}
</script>

<style scoped>
.cotizacion-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.form-header h1 {
  font-size: 36px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.form-header p {
  font-size: 18px;
  opacity: 0.9;
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn-calcular, .btn-limpiar {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-calcular {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
}

.btn-calcular:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.6);
}

.btn-calcular:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-limpiar {
  background: linear-gradient(135deg, #fc4a1a, #f7b733);
  color: white;
  box-shadow: 0 4px 15px rgba(252, 74, 26, 0.4);
}

.btn-limpiar:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(252, 74, 26, 0.6);
}

@media (max-width: 768px) {
  .cotizacion-form {
    padding: 15px;
  }
  
  .form-header h1 {
    font-size: 28px;
  }
  
  .servicios-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-calcular, .btn-limpiar {
    width: 100%;
    max-width: 300px;
  }
}
</style>