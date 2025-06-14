<!-- components/BuscarClienteModal.vue -->
<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="cerrar">
    <div class="modal-container">
      <div class="modal-header">
        <h3>
          <i class="fas" :class="modoEdicion ? 'fa-user-edit' : 'fa-users'"></i>
          {{ modoEdicion ? 'Editar Cliente' : 'Buscar/Agregar Cliente' }}
        </h3>
        <button @click="cerrar" class="btn-cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-content">
        <!-- Pestañas -->
        <div class="tabs">
          <button 
            @click="tabActiva = 'buscar'" 
            :class="['tab-btn', { active: tabActiva === 'buscar' }]"
            v-if="!modoEdicion"
          >
            <i class="fas fa-search"></i>
            Buscar Cliente
          </button>
          <button 
            @click="tabActiva = 'agregar'" 
            :class="['tab-btn', { active: tabActiva === 'agregar' }]"
          >
            <i class="fas" :class="modoEdicion ? 'fa-user-edit' : 'fa-user-plus'"></i>
            {{ modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </button>
        </div>

        <!-- Tab de Buscar -->
        <div v-if="tabActiva === 'buscar' && !modoEdicion" class="tab-content">
          <div class="buscar-section">
            <div class="search-container">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="terminoBusqueda" 
                type="text" 
                placeholder="Buscar por nombre, empresa o RTN..."
                class="input-buscar"
              >
            </div>
          </div>

          <div class="clientes-lista">
            <div 
              v-for="cliente in clientesFiltrados" 
              :key="cliente.id"
              class="cliente-item"
              @click="seleccionarCliente(cliente)"
            >
              <div class="cliente-info">
                <strong>
                  <i class="fas fa-user"></i>
                  {{ cliente.nombreEncargado }}
                </strong>
                <p>
                  <i class="fas fa-building"></i>
                  {{ cliente.nombreEmpresa }}
                </p>
                <small>
                  <i class="fas fa-id-card"></i>
                  RTN: {{ cliente.rtn }}
                </small>
              </div>
              <div class="cliente-contacto">
                <small>
                  <i class="fas fa-envelope"></i>
                  {{ cliente.correoEmpresa }}
                </small>
                <small>
                  <i class="fas fa-phone"></i>
                  {{ cliente.telefonoEmpresa }}
                </small>
              </div>
            </div>
            
            <div v-if="clientesFiltrados.length === 0" class="no-clientes">
              <i class="fas fa-users-slash"></i>
              <p>No se encontraron clientes</p>
            </div>
          </div>
        </div>

        <!-- Tab de Agregar/Editar -->
        <div v-if="tabActiva === 'agregar'" class="tab-content">
          <form @submit.prevent="guardarCliente" class="form-cliente">
            <div class="form-group">
              <label>
                <i class="fas fa-user"></i>
                Nombre del Encargado *
              </label>
              <input 
                v-model="clienteForm.nombreEncargado" 
                type="text" 
                required
                class="form-input"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <i class="fas fa-mobile-alt"></i>
                  Teléfono Personal
                </label>
                <input 
                  v-model="clienteForm.telefonoPersonal" 
                  type="tel" 
                  class="form-input"
                  placeholder="+504 0000-0000"
                >
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-phone"></i>
                  Teléfono Empresa
                </label>
                <input 
                  v-model="clienteForm.telefonoEmpresa" 
                  type="tel" 
                  class="form-input"
                  placeholder="+504 0000-0000"
                >
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-building"></i>
                Nombre de la Empresa *
              </label>
              <input 
                v-model="clienteForm.nombreEmpresa" 
                type="text" 
                required
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-id-card"></i>
                RTN *
              </label>
              <input 
                v-model="clienteForm.rtn" 
                type="text" 
                required
                class="form-input"
                placeholder="08011234567890"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <i class="fas fa-envelope"></i>
                  Correo Personal
                </label>
                <input 
                  v-model="clienteForm.correoPersonal" 
                  type="email" 
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-envelope-open"></i>
                  Correo Empresa
                </label>
                <input 
                  v-model="clienteForm.correoEmpresa" 
                  type="email" 
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancelar">
                
                Cancelar
              </button>
              <button type="submit" class="btn-guardar">
               
                {{ modoEdicion ? 'Actualizar' : 'Agregar' }} Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { clientes, vendedorActual } from '@/data/clientes.js';

export default {
  name: 'BuscarClienteModal',
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    clienteSeleccionado: {
      type: Object,
      default: null
    }
  },
  emits: ['cerrar', 'cliente-seleccionado'],
  data() {
    return {
      tabActiva: 'buscar',
      terminoBusqueda: '',
      modoEdicion: false,
      clienteForm: {
        nombreEncargado: '',
        telefonoPersonal: '',
        telefonoEmpresa: '',
        nombreEmpresa: '',
        rtn: '',
        correoPersonal: '',
        correoEmpresa: ''
      }
    };
  },
  computed: {
    clientesDelVendedor() {
      return clientes.filter(cliente => cliente.managerCuenta === vendedorActual);
    },
    clientesFiltrados() {
      if (!this.terminoBusqueda) {
        return this.clientesDelVendedor;
      }
      
      const termino = this.terminoBusqueda.toLowerCase();
      return this.clientesDelVendedor.filter(cliente => 
        cliente.nombreEncargado.toLowerCase().includes(termino) ||
        cliente.nombreEmpresa.toLowerCase().includes(termino) ||
        cliente.rtn.includes(termino)
      );
    }
  },
  watch: {
    mostrar(nuevo) {
      if (nuevo) {
        this.resetearModal();
        if (this.clienteSeleccionado) {
          this.editarCliente(this.clienteSeleccionado);
        }
      }
    }
  },
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    resetearModal() {
      this.tabActiva = 'buscar';
      this.terminoBusqueda = '';
      this.modoEdicion = false;
      this.limpiarFormulario();
    },
    limpiarFormulario() {
      this.clienteForm = {
        nombreEncargado: '',
        telefonoPersonal: '',
        telefonoEmpresa: '',
        nombreEmpresa: '',
        rtn: '',
        correoPersonal: '',
        correoEmpresa: ''
      };
    },
    seleccionarCliente(cliente) {
      this.$emit('cliente-seleccionado', cliente);
      this.cerrar();
    },
    editarCliente(cliente) {
      this.modoEdicion = true;
      this.tabActiva = 'agregar';
      this.clienteForm = { ...cliente };
    },
    cancelarFormulario() {
      if (this.modoEdicion) {
        this.cerrar();
      } else {
        this.tabActiva = 'buscar';
        this.limpiarFormulario();
      }
    },
    guardarCliente() {
      // Validaciones básicas
      if (!this.clienteForm.nombreEncargado || !this.clienteForm.nombreEmpresa || !this.clienteForm.rtn) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      // Simular guardado
      if (this.modoEdicion) {
        // Actualizar cliente existente
        const index = clientes.findIndex(c => c.id === this.clienteForm.id);
        if (index !== -1) {
          clientes[index] = { ...this.clienteForm };
        }
        alert('Cliente actualizado correctamente');
      } else {
        // Agregar nuevo cliente
        const nuevoCliente = {
          ...this.clienteForm,
          id: Date.now(),
          managerCuenta: vendedorActual,
          fechaCreacion: new Date().toISOString().split('T')[0]
        };
        clientes.push(nuevoCliente);
        alert('Cliente agregado correctamente');
      }

      this.$emit('cliente-seleccionado', this.clienteForm);
      this.cerrar();
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
  max-width: 800px;
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
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active {
  background: white;
  border-bottom-color: #667eea;
  color: #667eea;
}

.tab-btn i {
  font-size: 1em;
}

.tab-content {
  padding: 1.5rem;
}

.buscar-section {
  margin-bottom: 1rem;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
  z-index: 1;
}

.input-buscar {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-buscar:focus {
  outline: none;
  border-color: #667eea;
}

.input-buscar:focus + .search-icon {
  color: #667eea;
}

.clientes-lista {
  max-height: 400px;
  overflow-y: auto;
}

.cliente-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cliente-item:hover {
  border-color: #667eea;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.cliente-info strong {
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.cliente-info p {
  color: #667eea;
  margin: 0.25rem 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cliente-info small,
.cliente-contacto small {
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin: 0.1rem 0;
}

.cliente-contacto {
  text-align: right;
}

.no-clientes {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.no-clientes i {
  font-size: 2rem;
  opacity: 0.5;
}

.no-clientes p {
  margin: 0;
}

.form-cliente {
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group label i {
  color: #667eea;
  font-size: 0.9em;
  width: 16px;
  text-align: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancelar,
.btn-guardar {
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
  background: #28a745;
  color: white;
}

.btn-guardar:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .cliente-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .cliente-contacto {
    text-align: left;
    width: 100%;
  }

  .tab-btn {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .modal-header h3 {
    font-size: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cliente-info strong,
  .cliente-info p,
  .cliente-info small,
  .cliente-contacto small {
    font-size: 0.9rem;
  }
}
</style>