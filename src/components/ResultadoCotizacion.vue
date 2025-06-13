<template>
  <div v-if="mostrarResultados" class="resultados-container" id="cotizacion-pdf">
    <div class="resultados-header">
      <h2>📋 Cotización de Servicios Cloud</h2>
      <p class="fecha">Fecha: {{ fechaActual }}</p>
    </div>

    <div class="servicios-seleccionados">
      <h3>Servicios Seleccionados:</h3>
      <div v-for="item in serviciosSeleccionados" :key="item.servicio.id" class="servicio-seleccionado">
        <div class="servicio-info">
          <span class="servicio-icon">{{ item.servicio.icon }}</span>
          <div>
            <strong>{{ item.servicio.nombre }}</strong>
            <p>{{ item.servicio.descripcion }}</p>
            <small>{{ item.cantidad }} servidor(es) × ${{ item.servicio.precioBase }}/mes</small>
          </div>
        </div>
        <div class="servicio-subtotal">
          ${{ calcularSubtotal(item) }}/mes
        </div>
      </div>
    </div>

    <div class="opciones-precio">
      <div class="precio-option basico">
        <h4>🟢 Precio Básico</h4>
        <div class="precio-valor">${{ precioBasico }}/mes</div>
        <p>Precio estándar sin descuentos</p>
      </div>

      <div class="precio-option moderado">
        <h4>🟡 Precio Moderado</h4>
        <div class="precio-valor">${{ precioModerado }}/mes</div>
        <p>Descuento del 15% aplicado</p>
        <small>Ahorro: ${{ ahorroModerado }}/mes</small>
      </div>

      <div class="precio-option premium">
        <h4>🔥 Precio Premium</h4>
        <div class="precio-valor">${{ precioPremium }}/mes</div>
        <p>Descuento del 25% + servicios adicionales</p>
        <small>Ahorro: ${{ ahorroPremium }}/mes</small>
      </div>
    </div>

    <div class="acciones">
      <button @click="exportarPDF" class="btn-exportar">
        📄 Exportar a PDF
      </button>
      <button @click="reiniciar" class="btn-reiniciar">
        🔄 Nueva Cotización
      </button>
    </div>
  </div>
</template>

<script>
import { generarPDF } from '../utils/pdfGenerator.js';

export default {
  name: 'ResultadoCotizacion',
  props: {
    serviciosSeleccionados: {
      type: Array,
      required: true
    }
  },
  emits: ['reiniciar'],
  computed: {
    mostrarResultados() {
      return this.serviciosSeleccionados.length > 0;
    },
    fechaActual() {
      return new Date().toLocaleDateString('es-ES');
    },
    precioBasico() {
      return this.serviciosSeleccionados.reduce((total, item) => {
        return total + this.calcularSubtotal(item);
      }, 0);
    },
    precioModerado() {
      return Math.round(this.precioBasico * 0.85);
    },
    precioPremium() {
      return Math.round(this.precioBasico * 0.75);
    },
    ahorroModerado() {
      return this.precioBasico - this.precioModerado;
    },
    ahorroPremium() {
      return this.precioBasico - this.precioPremium;
    }
  },
  methods: {
    calcularSubtotal(item) {
      return item.cantidad * item.servicio.precioBase;
    },
    async exportarPDF() {
      const nombreArchivo = `cotizacion_${new Date().getTime()}.pdf`;
      await generarPDF('cotizacion-pdf', nombreArchivo);
    },
    reiniciar() {
      this.$emit('reiniciar');
    }
  }
}
</script>

<style scoped>
.resultados-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-top: 30px;
}

.resultados-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
}

.resultados-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.fecha {
  color: #7f8c8d;
  font-size: 14px;
}

.servicios-seleccionados {
  margin-bottom: 30px;
}

.servicios-seleccionados h3 {
  color: #34495e;
  margin-bottom: 20px;
}

.servicio-seleccionado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #f8f9fa;
}

.servicio-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.servicio-info .servicio-icon {
  font-size: 20px;
}

.servicio-info strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 5px;
}

.servicio-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.servicio-info small {
  color: #95a5a6;
  font-size: 12px;
}

.servicio-subtotal {
  font-weight: bold;
  color: #27ae60;
  font-size: 16px;
}

.opciones-precio {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.precio-option {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  position: relative;
  transition: transform 0.2s ease;
}

.precio-option:hover {
  transform: translateY(-5px);
}

.basico {
  background: linear-gradient(135deg, #a8e6cf, #88d8a3);
  border: 2px solid #27ae60;
}

.moderado {
  background: linear-gradient(135deg, #ffd93d, #ffcd3c);
  border: 2px solid #f39c12;
}

.premium {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  border: 2px solid #e74c3c;
  color: white;
}

.precio-option h4 {
  margin-bottom: 15px;
  font-size: 18px;
}

.precio-valor {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.precio-option p {
  margin-bottom: 5px;
  opacity: 0.9;
}

.precio-option small {
  font-size: 12px;
  opacity: 0.8;
}

.acciones {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-exportar, .btn-reiniciar {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-exportar {
  background: #3498db;
  color: white;
}

.btn-exportar:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.btn-reiniciar {
  background: #95a5a6;
  color: white;
}

.btn-reiniciar:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .opciones-precio {
    grid-template-columns: 1fr;
  }
  
  .servicio-seleccionado {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>