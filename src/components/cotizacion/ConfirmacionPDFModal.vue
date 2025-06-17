<!-- components/ConfirmacionPDFModal.vue -->
<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="cerrar">
    <div class="modal-container">
      <div class="modal-header">
        <h3>
          
          Confirmar Generación de PDF
        </h3>
        <button @click="cerrar" class="btn-cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-content">
        <!-- Información del cliente -->
        <div class="cliente-seleccionado">
          <h4>Cliente Seleccionado</h4>
          <div v-if="cliente" class="cliente-info">
            <div class="info-item">
              <strong>{{ cliente.nombreEncargado }}</strong>
              <span>{{ cliente.nombreEmpresa }}</span>
            </div>
            <!-- Botones para gestionar cliente -->
            <div class="cliente-actions">
              <button @click="editarCliente" class="btn-editar" title="Editar cliente">
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button @click="cambiarCliente" class="btn-cambiar" title="Cambiar cliente">
                <i class="fas fa-exchange-alt"></i>
                Cambiar
              </button>
              <button @click="removerCliente" class="btn-remover" title="Quitar cliente">
                <i class="fas fa-times"></i>
                Quitar
              </button>
            </div>
          </div>
          <div v-else class="sin-cliente">
            <p>No hay cliente seleccionado</p>
            <button @click="buscarCliente" class="btn-buscar-cliente">
              <i class="fas fa-search"></i>
              Buscar/Agregar Cliente
            </button>
          </div>
        </div>

        <!-- Validación de precios -->
        <div v-if="preciosPorDebajoMinimo.length > 0" class="alerta-precios">
          <div class="alerta-header">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Precios por debajo del mínimo detectados</strong>
          </div>
          <div class="servicios-problematicos">
            <div v-for="item in preciosPorDebajoMinimo" :key="item.servicio.id" class="servicio-problema">
              <span class="servicio-nombre">{{ item.servicio.nombre }}</span>
              <span class="precio-actual">Actual: ${{ item.precioVentaFinal }}</span>
              <span class="precio-minimo">Mínimo: ${{ item.servicio.precioMinimo }}</span>
            </div>
          </div>
          <div class="accion-requerida">
            <p><strong>Esta cotización requiere aprobación</strong></p>
            <p>No se puede generar PDF hasta que se apruebe o se ajusten los precios.</p>
          </div>
        </div>

        <!-- Selección de información del cliente para PDF -->
        <div v-if="cliente && preciosPorDebajoMinimo.length === 0" class="informacion-pdf">
          <h4>Información a incluir en la cotización</h4>
          <div class="opciones-cliente">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="incluirInfo.nombreEncargado"
              >
              <span class="checkmark"></span>
              Nombre del Encargado: {{ cliente.nombreEncargado }}
            </label>

            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="incluirInfo.nombreEmpresa"
              >
              <span class="checkmark"></span>
              Nombre de la Empresa: {{ cliente.nombreEmpresa }}
            </label>

            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="incluirInfo.documentofiscal"
              >
              <span class="checkmark"></span>
              Documento Fiscal: {{ cliente.documentofiscal }}
            </label>

            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="incluirInfo.telefonoEmpresa"
              >
              <span class="checkmark"></span>
              Teléfono Empresa: {{ cliente.telefonoEmpresa }}
            </label>

            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="incluirInfo.correoEmpresa"
              >
              <span class="checkmark"></span>
              Correo Empresa: {{ cliente.correoEmpresa }}
            </label>
          </div>
        </div>

        <!-- Resumen de cotización -->
        <div v-if="cliente" class="resumen-cotizacion">
          <h4>Resumen de Cotización</h4>
          <div class="resumen-item">
            <span>Precio Total:</span>
            <strong>${{ precioTotal.toLocaleString() }}</strong>
          </div>
          <div class="resumen-item">
            <span>Duración:</span>
            <strong>{{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</strong>
          </div>
          <div class="resumen-item">
            <span>Tipo de Precio:</span>
            <strong>{{ tipoPrecio === 'minimo' ? 'Precio Mínimo' : 'Precio de Venta' }}</strong>
          </div>
        </div>

        <!-- Acciones -->
        <div class="modal-actions">
          <button @click="cancelar" class="btn-cancelar">
            
            Cancelar
          </button>

          <button 
            v-if="preciosPorDebajoMinimo.length > 0"
            @click="guardarCotizacion"
            class="btn-guardar"
          >
           
            Guardar para Aprobación
          </button>

          <button 
            v-if="cliente && preciosPorDebajoMinimo.length === 0"
            @click="confirmarPDF"
            class="btn-generar"
            :disabled="!hayInformacionSeleccionada"
          >
            <i class="fas fa-file-pdf"></i>
            Generar PDF
          </button>

          <button 
            v-if="!cliente"
            @click="buscarCliente"
            class="btn-buscar"
          >
           
            Seleccionar Cliente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de buscar cliente -->
    <BuscarClienteModal
      :mostrar="mostrarModalCliente"
      :cliente-seleccionado="clienteParaEditar"
      @cerrar="cerrarModalCliente"
      @cliente-seleccionado="onClienteSeleccionado"
    />
  </div>
</template>

<script>
import BuscarClienteModal from './BuscarClienteModal.vue';

export default {
  name: 'ConfirmacionPDFModal',
  components: {
    BuscarClienteModal
  },
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    serviciosSeleccionados: {
      type: Array,
      default: () => []
    },
    añosContrato: {
      type: Number,
      default: 1
    },
    precioTotal: {
      type: Number,
      default: 0
    },
    tipoPrecio: {
      type: String,
      default: 'venta'
    }
  },
  emits: ['cerrar', 'generar-pdf', 'guardar-cotizacion', 'limpiar-formulario'],
  data() {
    return {
      cliente: null,
      mostrarModalCliente: false,
      clienteParaEditar: null, // Para pasar al modal cuando editamos
      incluirInfo: {
        nombreEncargado: true,
        nombreEmpresa: true,
        documentofiscal: false,
        telefonoEmpresa: false,
        correoEmpresa: true
      }
    };
  },
  computed: {
    preciosPorDebajoMinimo() {
      return this.serviciosSeleccionados.filter(item => {
        const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
        return totalUnidades > 0 && item.precioVentaFinal < item.servicio.precioMinimo;
      });
    },
    hayInformacionSeleccionada() {
      return Object.values(this.incluirInfo).some(valor => valor);
    }
  },
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    cancelar() {
      this.cliente = null;
      this.clienteParaEditar = null;
      this.cerrar();
    },
    buscarCliente() {
      this.clienteParaEditar = null; // Modo agregar nuevo
      this.mostrarModalCliente = true;
    },
    editarCliente() {
      if (this.cliente) {
        this.clienteParaEditar = { ...this.cliente }; // Copia para editar
        this.mostrarModalCliente = true;
      }
    },
    cambiarCliente() {
      this.clienteParaEditar = null; // Modo buscar/cambiar
      this.mostrarModalCliente = true;
    },
    removerCliente() {
      if (confirm('¿Estás seguro de que deseas quitar el cliente seleccionado?')) {
        this.cliente = null;
        this.clienteParaEditar = null;
        // Resetear selecciones de información
        this.incluirInfo = {
          nombreEncargado: true,
          nombreEmpresa: true,
          documentoFiscal: false,
          telefonoEmpresa: false,
          correoEmpresa: true
        };
      }
    },
    cerrarModalCliente() {
      this.mostrarModalCliente = false;
      this.clienteParaEditar = null;
    },
    onClienteSeleccionado(cliente) {
      this.cliente = cliente;
      this.mostrarModalCliente = false;
      this.clienteParaEditar = null;
      
      // Resetear las opciones de información cuando se selecciona un nuevo cliente
      this.incluirInfo = {
        nombreEncargado: true,
        nombreEmpresa: true,
        documentofiscal: false,
        telefonoEmpresa: false,
        correoEmpresa: true
      };
    },
    confirmarPDF() {
      if (!this.cliente) {
        alert('Debe seleccionar un cliente');
        return;
      }

      if (!this.hayInformacionSeleccionada) {
        alert('Debe seleccionar al menos un campo de información del cliente');
        return;
      }

      const datosParaPDF = {
        cliente: this.cliente,
        informacionIncluir: this.incluirInfo,
        servicios: this.serviciosSeleccionados,
        añosContrato: this.añosContrato,
        precioTotal: this.precioTotal,
        tipoPrecio: this.tipoPrecio
      };

      this.$emit('generar-pdf', datosParaPDF);
      this.cerrar();
      
      // NUEVO: Emitir evento para limpiar formulario
      this.$emit('limpiar-formulario');
    },
    guardarCotizacion() {
      const datosCotizacion = {
        cliente: this.cliente,
        servicios: this.serviciosSeleccionados,
        añosContrato: this.añosContrato,
        precioTotal: this.precioTotal,
        tipoPrecio: this.tipoPrecio,
        estado: 'pendiente_aprobacion',
        fecha: new Date().toISOString(),
        preciosPorDebajoMinimo: this.preciosPorDebajoMinimo
      };

      this.$emit('guardar-cotizacion', datosCotizacion);
      alert('Cotización guardada para aprobación');
      this.cerrar();
      
      // NUEVO: Emitir evento para limpiar formulario
      this.$emit('limpiar-formulario');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h3 i {
  font-size: 1.1em;
}

.btn-cerrar {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-cerrar:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-cerrar i {
  font-size: 1rem;
}

.modal-content {
  padding: 1.5rem;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.cliente-seleccionado {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e9ecef;
}

.cliente-seleccionado h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.cliente-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.info-item strong {
  color: #2c3e50;
  font-size: 1.1rem;
}

.info-item span {
  color: #667eea;
  font-weight: 500;
}

/* Botones de acciones del cliente */
.cliente-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-editar,
.btn-cambiar,
.btn-remover {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.btn-editar {
  background: #007bff;
  color: white;
}

.btn-editar:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-cambiar {
  background: #6f42c1;
  color: white;
}

.btn-cambiar:hover {
  background: #5a2d91;
  transform: translateY(-1px);
}

.btn-remover {
  background: #dc3545;
  color: white;
}

.btn-remover:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.sin-cliente {
  text-align: center;
  padding: 1rem;
}

.sin-cliente p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.btn-buscar-cliente {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.btn-buscar-cliente:hover {
  background: #138496;
  transform: translateY(-1px);
}

.alerta-precios {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 2px solid #ffc107;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.alerta-header {
  color: #856404;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerta-header i {
  font-size: 1.2em;
}

.servicios-problematicos {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.servicio-problema {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(133, 100, 4, 0.2);
  align-items: center;
}

.servicio-problema:last-child {
  border-bottom: none;
}

.servicio-nombre {
  font-weight: 600;
  color: #495057;
}

.precio-actual {
  color: #dc3545;
  font-weight: bold;
}

.precio-minimo {
  color: #28a745;
  font-weight: bold;
}

.accion-requerida {
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #dc3545;
}

.accion-requerida p {
  margin: 0.25rem 0;
  color: #721c24;
}

.informacion-pdf {
  background: #e8f5e8;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  border: 2px solid #28a745;
}

.informacion-pdf h4 {
  margin: 0 0 1rem 0;
  color: #155724;
}

.opciones-cliente {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
  position: relative;
  padding-left: 2rem;
}

.checkbox-option:hover {
  background: rgba(40, 167, 69, 0.1);
}

.checkbox-option input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1.2rem;
  width: 1.2rem;
  background-color: white;
  border: 2px solid #28a745;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.checkbox-option input:checked ~ .checkmark {
  background-color: #28a745;
}

.checkbox-option input:checked ~ .checkmark:after {
  content: '';
  position: absolute;
  left: 0.3rem;
  top: 0.1rem;
  width: 0.3rem;
  height: 0.6rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.resumen-cotizacion {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  border: 2px solid #6c757d;
}

.resumen-cotizacion h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-item span {
  color: #6c757d;
}

.resumen-item strong {
  color: #495057;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-cancelar,
.btn-guardar,
.btn-generar,
.btn-buscar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancelar {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-cancelar:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.btn-guardar {
  background: #ffc107;
  color: #212529;
}

.btn-guardar:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn-generar {
  background: #28a745;
  color: white;
}

.btn-generar:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-generar:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-generar:disabled i {
  color: #adb5bd;
}

.btn-buscar {
  background: #17a2b8;
  color: white;
}

.btn-buscar:hover {
  background: #138496;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .servicio-problema {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .checkbox-option {
    font-size: 0.9rem;
  }
  
  .cliente-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-item {
    min-width: auto;
    width: 100%;
  }
  
  .cliente-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .btn-editar,
  .btn-cambiar,
  .btn-remover {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }

  .modal-header h3 {
    font-size: 1rem;
  }

  .btn-buscar-cliente {
    font-size: 0.9rem;
  }
}
</style>