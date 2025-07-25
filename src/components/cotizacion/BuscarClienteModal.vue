<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="cerrar">
    <div class="modal-container">
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>

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
            @click="cambiarTab('buscar')" 
            :class="['tab-btn', { active: tabActiva === 'buscar' }]"
            v-if="!modoEdicion"
            :disabled="loading"
          >
            <i class="fas fa-search"></i>
            Buscar Cliente
          </button>
          <button 
            @click="cambiarTab('agregar')" 
            :class="['tab-btn', { active: tabActiva === 'agregar' }]"
            :disabled="loading"
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
                @input="buscarClientes"
                :disabled="loading"
              >
              <button 
                v-if="terminoBusqueda" 
                @click="limpiarBusqueda" 
                class="btn-limpiar-busqueda"
                title="Limpiar búsqueda"
                :disabled="loading"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Estadísticas de búsqueda -->
            <div v-if="terminoBusqueda && !loadingBusqueda" class="busqueda-stats">
              <small>{{ clientesFiltrados.length }} cliente{{ clientesFiltrados.length !== 1 ? 's' : '' }} encontrado{{ clientesFiltrados.length !== 1 ? 's' : '' }}</small>
            </div>
            
            <!-- ✅ NUEVO: Mostrar mensaje de clientes recientes cuando no hay búsqueda -->
            <div v-if="!terminoBusqueda && !loadingBusqueda && clientesFiltrados.length > 0" class="busqueda-stats">
              <small>Tus clientes recientes:</small>
            </div>
          </div>

          <!-- Loading de búsqueda -->
          <div v-if="loadingBusqueda" class="loading-busqueda">
            <i class="fas fa-spinner fa-spin"></i>
            <span>{{ terminoBusqueda ? 'Buscando clientes...' : 'Cargando tus clientes...' }}</span>
          </div>

          <div class="clientes-lista" v-else>
            <div 
              v-for="cliente in clientesFiltrados" 
              :key="cliente.clientes_id || cliente.id"
              class="cliente-item"
              @click="seleccionarCliente(cliente)"
            >
              <div class="cliente-info">
                <strong>
                  <i class="fas fa-user"></i>
                  {{ cliente.nombre_encargado || cliente.nombreEncargado }}
                </strong>
                <p>
                  <i class="fas fa-building"></i>
                  {{ cliente.nombre_empresa || cliente.nombreEmpresa }}
                </p>
                <small>
                  <i class="fas fa-id-card"></i>
                  RTN: {{ formatRTN(cliente.documento_fiscal || cliente.documentofiscal) }}
                </small>
              </div>
              <div class="cliente-contacto">
                <small v-if="cliente.correo_empresa || cliente.correoEmpresa">
                  <i class="fas fa-envelope"></i>
                  {{ cliente.correo_empresa || cliente.correoEmpresa }}
                </small>
                <small v-if="cliente.telefono_empresa || cliente.telefonoEmpresa">
                  <i class="fas fa-phone"></i>
                  {{ formatTelefono(cliente.telefono_empresa || cliente.telefonoEmpresa) }}
                </small>
              </div>
            </div>
            
            <!-- ✅ NUEVO: Mensaje mejorado cuando no hay clientes -->
            <div v-if="clientesFiltrados.length === 0 && !terminoBusqueda && !loadingBusqueda" class="no-clientes">
              <i class="fas fa-users"></i>
              <p>No tienes clientes registrados aún</p>
              <button @click="cambiarTab('agregar')" class="btn-crear-nuevo">
                <i class="fas fa-user-plus"></i>
                Crear tu primer cliente
              </button>
            </div>
            
            <div v-if="clientesFiltrados.length === 0 && terminoBusqueda && !loadingBusqueda" class="no-clientes">
              <i class="fas fa-users-slash"></i>
              <p>No se encontraron clientes con ese criterio</p>
              <button @click="cambiarTab('agregar')" class="btn-crear-nuevo">
                <i class="fas fa-user-plus"></i>
                Crear nuevo cliente
              </button>
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
                v-model="clienteForm.nombre_encargado" 
                type="text" 
                required
                class="form-input"
                :class="{ 'error': validationErrors.nombre_encargado }"
                :disabled="loading"
                maxlength="100"
              >
              <small v-if="validationErrors.nombre_encargado" class="error-text">
                {{ validationErrors.nombre_encargado }}
              </small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <i class="fas fa-mobile-alt"></i>
                  Teléfono Personal
                </label>
                <input 
                  v-model="clienteForm.telefono_personal" 
                  type="tel" 
                  class="form-input"
                  :class="{ 'error': validationErrors.telefono_personal }"
                  placeholder="+504 0000-0000"
                  :disabled="loading"
                  @blur="formatearTelefono('telefono_personal')"
                >
                <small v-if="validationErrors.telefono_personal" class="error-text">
                  {{ validationErrors.telefono_personal }}
                </small>
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-phone"></i>
                  Teléfono Empresa
                </label>
                <input 
                  v-model="clienteForm.telefono_empresa" 
                  type="tel" 
                  class="form-input"
                  :class="{ 'error': validationErrors.telefono_empresa }"
                  placeholder="+504 0000-0000"
                  :disabled="loading"
                  @blur="formatearTelefono('telefono_empresa')"
                >
                <small v-if="validationErrors.telefono_empresa" class="error-text">
                  {{ validationErrors.telefono_empresa }}
                </small>
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-building"></i>
                Nombre de la Empresa *
              </label>
              <input 
                v-model="clienteForm.nombre_empresa" 
                type="text" 
                required
                class="form-input"
                :class="{ 'error': validationErrors.nombre_empresa }"
                :disabled="loading"
                maxlength="150"
              >
              <small v-if="validationErrors.nombre_empresa" class="error-text">
                {{ validationErrors.nombre_empresa }}
              </small>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-id-card"></i>
                Documento Fiscal 
              </label>
             <input 
  v-model="clienteForm.documento_fiscal" 
  type="text" 
  required
  class="form-input"
  :class="{ 'error': validationErrors.documento_fiscal }"
  placeholder="Documento fiscal del país" 
  :disabled="loading"
  maxlength="20"   
  @blur="formatearRTN"
  @input="validarRTN"
>
              <small v-if="validationErrors.documento_fiscal" class="error-text">
                {{ validationErrors.documento_fiscal }}
              </small>
              <small v-else class="help-text">
  Documento fiscal (5-20 caracteres)  
</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <i class="fas fa-envelope"></i>
                  Correo Personal
                </label>
                <input 
                  v-model="clienteForm.correo_personal" 
                  type="email" 
                  class="form-input"
                  :class="{ 'error': validationErrors.correo_personal }"
                  :disabled="loading"
                  maxlength="100"
                >
                <small v-if="validationErrors.correo_personal" class="error-text">
                  {{ validationErrors.correo_personal }}
                </small>
              </div>
              <div class="form-group">
                <label>
                  <i class="fas fa-envelope-open"></i>
                  Correo Empresa
                </label>
                <input 
                  v-model="clienteForm.correo_empresa" 
                  type="email" 
                  class="form-input"
                  :class="{ 'error': validationErrors.correo_empresa }"
                  :disabled="loading"
                  maxlength="100"
                >
                <small v-if="validationErrors.correo_empresa" class="error-text">
                  {{ validationErrors.correo_empresa }}
                </small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancelar" :disabled="loading">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
              <button type="submit" class="btn-guardar" :disabled="loading || !formularioValido">
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : (modoEdicion ? 'fa-save' : 'fa-user-plus')"></i>
                {{ loading ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Agregar') }} Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ✅ TOAST DE NOTIFICACIONES -->
    <div v-if="showToast" class="toast-notification" :class="toastType">
      <i :class="toastIcon"></i>
      <span>{{ toastMessage }}</span>
      <button @click="hideToast" class="toast-close">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import clientesService from '@/services/clientes'

export default {
  name: 'BuscarClienteModal',
  components: {},
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
  emits: ['cerrar', 'cliente-seleccionado', 'cliente-creado', 'cliente-actualizado'],
  setup(props, { emit }) {
    // Estados reactivos
    const tabActiva = ref('buscar')
    const terminoBusqueda = ref('')
    const modoEdicion = ref(false)
    const loading = ref(false)
    const loadingBusqueda = ref(false)
    const loadingMessage = ref('')
    const clientesFiltrados = ref([])
    const timeoutBusqueda = ref(null)
    
    // ✅ TOAST SYSTEM - Estados
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success') // success, error, warning, info
    
    // Formulario de cliente
    const clienteForm = ref({
      nombre_encargado: '',
      telefono_personal: '',
      telefono_empresa: '',
      nombre_empresa: '',
      documento_fiscal: '',
      correo_personal: '',
      correo_empresa: ''
    })

    // Errores de validación
    const validationErrors = ref({})

    // ✅ COMPUTED PARA TOAST
    const toastIcon = computed(() => {
      const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return iconos[toastType.value] || 'fas fa-info-circle';
    })

    // ✅ MÉTODOS DE TOAST
    const mostrarToast = (mensaje, tipo = 'info') => {
      toastMessage.value = mensaje
      toastType.value = tipo
      showToast.value = true
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        hideToast()
      }, 5000)
    }

    const hideToast = () => {
      showToast.value = false
    }

    // Computed properties
    const formularioValido = computed(() => {
      return clienteForm.value.nombre_encargado.trim() &&
             clienteForm.value.nombre_empresa.trim() &&
             clienteForm.value.documento_fiscal.trim() &&
             Object.keys(validationErrors.value).length === 0
    })

    // Métodos de formateo
    const formatRTN = (rtn) => {
      return clientesService.formatRTN(rtn)
    }

    const formatTelefono = (telefono) => {
      return clientesService.formatTelefono(telefono)
    }

    // Métodos de validación
    const validarRTN = () => {
      const rtn = clienteForm.value.documento_fiscal
      if (rtn && !clientesService.validateRTN(rtn)) {
        validationErrors.value.documento_fiscal = 'RTN inválido. Debe tener 14 dígitos con formato válido'
      } else {
        delete validationErrors.value.documento_fiscal
      }
    }

    const validarEmail = (campo) => {
      const email = clienteForm.value[campo]
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.value[campo] = 'Formato de correo electrónico inválido'
      } else {
        delete validationErrors.value[campo]
      }
    }

    // Métodos de formateo automático
    const formatearRTN = () => {
      if (clienteForm.value.documento_fiscal) {
        clienteForm.value.documento_fiscal = clientesService.formatRTN(clienteForm.value.documento_fiscal)
        validarRTN()
      }
    }

    const formatearTelefono = (campo) => {
      if (clienteForm.value[campo]) {
        clienteForm.value[campo] = clientesService.formatTelefono(clienteForm.value[campo])
      }
    }

    // Métodos de gestión de estado
    const resetearModal = () => {
      tabActiva.value = modoEdicion.value ? 'agregar' : 'buscar'
      terminoBusqueda.value = ''
      clientesFiltrados.value = []
      showToast.value = false
      toastMessage.value = ''
      validationErrors.value = {}
      
      if (!modoEdicion.value) {
        limpiarFormulario()
      }
    }

    const limpiarFormulario = () => {
      clienteForm.value = {
        nombre_encargado: '',
        telefono_personal: '',
        telefono_empresa: '',
        nombre_empresa: '',
        documento_fiscal: '',
        correo_personal: '',
        correo_empresa: ''
      }
      validationErrors.value = {}
    }

    // ✅ NUEVO: Cargar clientes iniciales cuando se abre el modal
    const cargarClientesIniciales = async () => {
      try {
        loadingBusqueda.value = true
        
       
        
        const resultado = await clientesService.getClientesRecientes(8) // Cargar 8 clientes recientes
        
        if (resultado.success) {
          clientesFiltrados.value = resultado.clientes.map(clientesService.formatClienteDisplay)
          
          
          if (resultado.clientes.length > 0) {
            mostrarToast(`${resultado.clientes.length} clientes cargados`, 'info')
          }
        } else {
          
          mostrarToast('No hay clientes registrados aún', 'info')
        }
      } catch (err) {
        console.error('❌ Error cargando clientes iniciales:', err)
        mostrarToast('Error cargando clientes', 'error')
      } finally {
        loadingBusqueda.value = false
      }
    }

    // ✅ MÉTODO DE BÚSQUEDA CORREGIDO
    const buscarClientes = async () => {
      const termino = terminoBusqueda.value.trim()
      
      // Limpiar timeout anterior
      if (timeoutBusqueda.value) {
        clearTimeout(timeoutBusqueda.value)
      }

      // Si no hay término, cargar clientes iniciales
      if (!termino || termino.length < 2) {
        cargarClientesIniciales()
        return
      }

      // Debounce para evitar muchas llamadas
      timeoutBusqueda.value = setTimeout(async () => {
        try {
          loadingBusqueda.value = true
          
          
          
          // ✅ CORREGIDO: Usar searchClientesModal (nuevo endpoint con filtros)
          const resultado = await clientesService.searchClientesModal(termino)
          
          if (resultado.success) {
            clientesFiltrados.value = resultado.clientes.map(clientesService.formatClienteDisplay)
            
            
            if (resultado.clientes.length > 0) {
              mostrarToast(`${resultado.clientes.length} cliente${resultado.clientes.length > 1 ? 's' : ''} encontrado${resultado.clientes.length > 1 ? 's' : ''}`, 'info')
            } else {
              mostrarToast('No se encontraron clientes con ese criterio', 'warning')
            }
          } else {
            throw new Error(resultado.message)
          }
        } catch (err) {
          console.error('❌ Error en búsqueda de clientes:', err)
          mostrarToast('Error en la búsqueda de clientes', 'error')
          clientesFiltrados.value = []
        } finally {
          loadingBusqueda.value = false
        }
      }, 300)
    }

    const limpiarBusqueda = () => {
      terminoBusqueda.value = ''
      mostrarToast('Búsqueda limpiada', 'info')
      cargarClientesIniciales() // ✅ Cargar clientes iniciales al limpiar
    }

    // Métodos de navegación
    const cambiarTab = (tab) => {
      if (!loading.value) {
        tabActiva.value = tab
        if (tab === 'buscar') {
          limpiarFormulario()
          mostrarToast('Cambiando a búsqueda de clientes', 'info')
          cargarClientesIniciales() // ✅ Cargar clientes al cambiar a tab buscar
        } else {
          mostrarToast(modoEdicion.value ? 'Modo edición activado' : 'Creando nuevo cliente', 'info')
        }
      }
    }

    const cerrar = () => {
      if (!loading.value) {
        resetearModal()
        emit('cerrar')
      }
    }

    const cancelarFormulario = () => {
      if (modoEdicion.value) {
        mostrarToast('Edición cancelada', 'info')
        cerrar()
      } else {
        tabActiva.value = 'buscar'
        limpiarFormulario()
        mostrarToast('Formulario cancelado', 'info')
        cargarClientesIniciales() // ✅ Cargar clientes al cancelar formulario
      }
    }

    // Métodos de selección y edición
    const seleccionarCliente = (cliente) => {
      
      const nombreEmpresa = cliente.nombre_empresa || cliente.nombreEmpresa
      mostrarToast(`Cliente ${nombreEmpresa} seleccionado`, 'success')
      emit('cliente-seleccionado', cliente)
      cerrar()
    }

    const editarCliente = (cliente) => {
      modoEdicion.value = true
      tabActiva.value = 'agregar'
      
      // ✅ CORREGIDO: Mapear datos del cliente al formulario
      clienteForm.value = {
        clientes_id: cliente.clientes_id || cliente.id,
        nombre_encargado: cliente.nombre_encargado || '',
        telefono_personal: cliente.telefono_personal || '',
        telefono_empresa: cliente.telefono_empresa || '',
        nombre_empresa: cliente.nombre_empresa || '',
        documento_fiscal: cliente.documento_fiscal || '',
        correo_personal: cliente.correo_personal || '',
        correo_empresa: cliente.correo_empresa || ''
      }
      
      validationErrors.value = {}
      const nombreEmpresa = cliente.nombre_empresa || cliente.nombreEmpresa
      mostrarToast(`Editando cliente ${nombreEmpresa}`, 'info')
    }

    const guardarCliente = async () => {
      try {
        loading.value = true
        loadingMessage.value = modoEdicion.value ? 'Actualizando cliente...' : 'Creando cliente...'
        
        mostrarToast(`${modoEdicion.value ? 'Actualizando' : 'Creando'} cliente...`, 'info')

        // Validaciones finales
        if (!formularioValido.value) {
          throw new Error('Por favor completa todos los campos obligatorios correctamente')
        }

        // ✅ PREPARAR DATOS DEL CLIENTE CON ESTRUCTURA CORRECTA
        const datosCliente = {
          nombre_encargado: clienteForm.value.nombre_encargado.trim(),
          telefono_personal: clienteForm.value.telefono_personal?.trim() || null,
          telefono_empresa: clienteForm.value.telefono_empresa?.trim() || null,
          nombre_empresa: clienteForm.value.nombre_empresa.trim(),
          documento_fiscal: clienteForm.value.documento_fiscal.trim(),
          correo_personal: clienteForm.value.correo_personal?.trim() || null,
          correo_empresa: clienteForm.value.correo_empresa?.trim() || null,
          estado: 'activo'
        }

        let resultado
        if (modoEdicion.value) {
          resultado = await clientesService.updateCliente(clienteForm.value.clientes_id, datosCliente)
        } else {
          resultado = await clientesService.createCliente(datosCliente)
        }
        if (resultado.success) {
          const clienteCreado = clientesService.formatClienteDisplay(resultado.cliente)
          const nombreEmpresa = clienteCreado.nombre_empresa
          const accion = modoEdicion.value ? 'actualizado' : 'creado'
          
          mostrarToast(`Cliente ${nombreEmpresa} ${accion} correctamente`, 'success')
          
          emit(modoEdicion.value ? 'cliente-actualizado' : 'cliente-creado', clienteCreado)
          
          setTimeout(() => {
            cerrar()
          }, 2000)
        } else {
          throw new Error(resultado.message || 'Error al guardar el cliente')
        }

      } catch (err) {
        console.error('🐛 DEBUG - Error en guardarCliente:', err)
        console.error('🐛 DEBUG - Stack trace:', err.stack)
        
        // Manejar errores de validación del servidor
        if (err.response?.data?.errors) {
          const erroresServidor = err.response.data.errors
          Object.keys(erroresServidor).forEach(campo => {
            validationErrors.value[campo] = erroresServidor[campo][0]
          })
          mostrarToast('Por favor corrige los errores en el formulario', 'error')
        } else {
          mostrarToast(err.message || 'Error al guardar el cliente', 'error')
        }
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    // ✅ WATCHER CORREGIDO: Cargar clientes iniciales al abrir modal
    watch(() => props.mostrar, (mostrarModal) => {
      if (mostrarModal) {
        resetearModal()
        if (props.clienteSeleccionado) {
          editarCliente(props.clienteSeleccionado)
        } else {
          modoEdicion.value = false
          mostrarToast('Buscador de clientes abierto', 'info')
          // ✅ AGREGAR: Cargar clientes iniciales al abrir modal
          cargarClientesIniciales()
        }
      }
    })

    // Watchers para validación en tiempo real
    watch(() => clienteForm.value.correo_personal, () => {
      if (clienteForm.value.correo_personal) {
        validarEmail('correo_personal')
      } else {
        delete validationErrors.value.correo_personal
      }
    })

    watch(() => clienteForm.value.correo_empresa, () => {
      if (clienteForm.value.correo_empresa) {
        validarEmail('correo_empresa')
      } else {
        delete validationErrors.value.correo_empresa
      }
    })

    return {
      // Estados
      tabActiva,
      terminoBusqueda,
      modoEdicion,
      loading,
      loadingBusqueda,
      loadingMessage,
      clientesFiltrados,
      clienteForm,
      validationErrors,
      
      // ✅ TOAST STATES
      showToast,
      toastMessage,
      toastType,
      
      // Computed
      formularioValido,
      toastIcon,
      
      // Métodos
      formatRTN,
      formatTelefono,
      validarRTN,
      validarEmail,
      formatearRTN,
      formatearTelefono,
      cargarClientesIniciales, // ✅ Agregar al return
      buscarClientes,
      limpiarBusqueda,
      cambiarTab,
      cerrar,
      cancelarFormulario,
      seleccionarCliente,
      editarCliente,
      guardarCliente,
      
      // ✅ TOAST METHODS
      mostrarToast,
      hideToast
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
 position: relative;
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
 padding: 0.75rem 3rem 0.75rem 2.5rem;
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

.btn-limpiar-busqueda {
 position: absolute;
 right: 0.5rem;
 top: 50%;
 transform: translateY(-50%);
 background: none;
 border: none;
 color: #6c757d;
 cursor: pointer;
 padding: 0.25rem;
 border-radius: 4px;
 transition: all 0.2s;
}

.btn-limpiar-busqueda:hover {
 background: #f8f9fa;
 color: #dc3545;
}

.busqueda-stats {
 margin-top: 0.5rem;
 color: #6c757d;
 font-size: 0.9rem;
}

.loading-busqueda {
 text-align: center;
 padding: 2rem;
 color: #6c757d;
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 0.5rem;
}

.loading-busqueda i {
 font-size: 2rem;
 animation: spin 1s linear infinite;
}

@keyframes spin {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
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
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 1rem;
}

.no-clientes i {
 font-size: 3rem;
 opacity: 0.5;
 color: #adb5bd;
}

.no-clientes p {
 margin: 0;
 font-size: 1.1rem;
 color: #495057;
}

.btn-crear-nuevo {
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
}

.btn-crear-nuevo:hover {
 background: #138496;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
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
 transition: all 0.2s;
 box-sizing: border-box;
}

.form-input:focus {
 outline: none;
 border-color: #667eea;
 box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
 border-color: #dc3545;
 background: #fff5f5;
}

.error-text {
 color: #dc3545;
 font-size: 0.85rem;
 margin-top: 0.25rem;
 display: block;
}

.help-text {
 color: #6c757d;
 font-size: 0.85rem;
 margin-top: 0.25rem;
 display: block;
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

.btn-guardar:hover:not(:disabled) {
 background: #218838;
 transform: translateY(-1px);
 box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-guardar:disabled {
 background: #6c757d;
 cursor: not-allowed;
 transform: none;
 box-shadow: none;
}

/* Loading overlay */
.loading-overlay {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(255, 255, 255, 0.9);
 display: flex;
 justify-content: center;
 align-items: center;
 z-index: 9999;
 backdrop-filter: blur(3px);
 border-radius: 1rem;
}

.loading-spinner {
 text-align: center;
 color: #495057;
}

.loading-spinner i {
 font-size: 3rem;
 margin-bottom: 1rem;
 animation: spin 1s linear infinite;
 color: #667eea;
}

.loading-spinner p {
 font-size: 1.1rem;
 margin: 0;
 font-weight: 600;
}

/* ✅ TOAST NOTIFICATIONS */
.toast-notification {
 position: fixed;
 top: 2rem;
 right: 2rem;
 padding: 1rem 1.5rem;
 border-radius: 0.5rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
 display: flex;
 align-items: center;
 gap: 0.75rem;
 max-width: 400px;
 z-index: 1100;
 font-weight: 500;
 animation: slideInRight 0.3s ease;
}

.toast-notification.success {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.toast-notification.error {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
}

.toast-notification.warning {
 background: #fff3cd;
 color: #856404;
 border: 1px solid #ffeaa7;
}

.toast-notification.info {
 background: #d1ecf1;
 color: #0c5460;
 border: 1px solid #bee5eb;
}

.toast-close {
 background: none;
 border: none;
 font-size: 1.2rem;
 cursor: pointer;
 padding: 0;
 margin-left: auto;
 opacity: 0.7;
 transition: opacity 0.3s ease;
}

.toast-close:hover {
 opacity: 1;
}

@keyframes slideInRight {
 from {
   transform: translateX(100%);
   opacity: 0;
 }
 to {
   transform: translateX(0);
   opacity: 1;
 }
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

 /* ✅ TOAST RESPONSIVE */
 .toast-notification {
   top: 1rem;
   right: 1rem;
   left: 1rem;
   max-width: none;
 }
}

@media (max-width: 480px) {
 .modal-container {
   width: 98%;
   margin: 0.5rem;
   max-height: 95vh;
 }

 .tab-content {
   padding: 1rem;
 }

 .btn-cancelar,
 .btn-guardar {
   width: 100%;
   justify-content: center;
   margin-bottom: 0.5rem;
 }

 .no-clientes {
   padding: 1.5rem;
 }

 .no-clientes i {
   font-size: 2rem;
 }

 .loading-spinner i {
   font-size: 2rem;
 }

 .loading-spinner p {
   font-size: 1rem;
 }
}

/* Estilos para impresión */
@media print {
 .toast-notification {
   display: none;
 }
}
</style>