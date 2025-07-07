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
          <i class="fas fa-file-pdf"></i>
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
              <strong>{{ cliente.nombreEncargado || cliente.nombre_encargado }}</strong>
              <span>{{ cliente.nombreEmpresa || cliente.nombre_empresa }}</span>
              <small v-if="cliente.documentofiscal || cliente.documento_fiscal">
                RTN: {{ formatRTN(cliente.documentofiscal || cliente.documento_fiscal) }}
              </small>
            </div>
            <!-- Botones para gestionar cliente -->
            <div class="cliente-actions">
              <button @click="editarCliente" class="btn-editar" title="Editar cliente" :disabled="loading">
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button @click="cambiarCliente" class="btn-cambiar" title="Cambiar cliente" :disabled="loading">
                <i class="fas fa-exchange-alt"></i>
                Cambiar
              </button>
              <button @click="removerCliente" class="btn-remover" title="Quitar cliente" :disabled="loading">
                <i class="fas fa-times"></i>
                Quitar
              </button>
            </div>
          </div>
          <div v-else class="sin-cliente">
            <p>No hay cliente seleccionado</p>
            <button @click="buscarCliente" class="btn-buscar-cliente" :disabled="loading">
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
            <div v-for="item in preciosPorDebajoMinimo" :key="item.servicio.servicios_id" class="servicio-problema">
              <span class="servicio-nombre">{{ item.servicio.nombre }}</span>
              <span class="precio-actual">Actual: {{ formatCurrency(item.precioVentaFinal) }}</span>
              <span class="precio-minimo">Mínimo: {{ formatCurrency(item.servicio.precioMinimo || item.servicio.precio_minimo) }}</span>
            </div>
          </div>
          <div class="accion-requerida">
            <p><strong>Esta cotización requiere aprobación</strong></p>
            <p>Se guardará para revisión administrativa. No se puede generar PDF hasta que se apruebe.</p>
          </div>
        </div>

        <!-- Selección de información del cliente para PDF -->
        <div v-if="cliente && preciosPorDebajoMinimo.length === 0" class="informacion-pdf">
          <h4>Información a incluir en la cotización</h4>
          <div class="opciones-cliente">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="configuracionPDF.incluirNombreEncargado"
              >
              <span class="checkmark"></span>
              Nombre del Encargado: {{ cliente.nombreEncargado || cliente.nombre_encargado }}
            </label>

            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="configuracionPDF.incluirNombreEmpresa"
              >
              <span class="checkmark"></span>
              Nombre de la Empresa: {{ cliente.nombreEmpresa || cliente.nombre_empresa }}
            </label>

            <label class="checkbox-option" v-if="cliente.documentofiscal || cliente.documento_fiscal">
              <input 
                type="checkbox" 
                v-model="configuracionPDF.incluirDocumentoFiscal"
              >
              <span class="checkmark"></span>
              Documento Fiscal: {{ formatRTN(cliente.documentofiscal || cliente.documento_fiscal) }}
            </label>

            <label class="checkbox-option" v-if="cliente.telefonoEmpresa || cliente.telefono_empresa">
              <input 
                type="checkbox" 
                v-model="configuracionPDF.incluirTelefonoEmpresa"
              >
              <span class="checkmark"></span>
              Teléfono Empresa: {{ formatTelefono(cliente.telefonoEmpresa || cliente.telefono_empresa) }}
            </label>

            <label class="checkbox-option" v-if="cliente.correoEmpresa || cliente.correo_empresa">
              <input 
                type="checkbox" 
                v-model="configuracionPDF.incluirCorreoEmpresa"
              >
              <span class="checkmark"></span>
              Correo Empresa: {{ cliente.correoEmpresa || cliente.correo_empresa }}
            </label>
          </div>
        </div>

        <!-- Resumen de cotización -->
        <div v-if="cliente" class="resumen-cotizacion">
          <h4>Resumen de Cotización</h4>
          <div class="resumen-item">
            <span>Servicios:</span>
            <strong>{{ serviciosSeleccionados.length }} servicio{{ serviciosSeleccionados.length > 1 ? 's' : '' }}</strong>
          </div>
          <div class="resumen-item">
            <span>Precio Total:</span>
            <strong>{{ formatCurrency(precioTotal) }}</strong>
          </div>
          <div class="resumen-item">
            <span>Duración:</span>
            <strong>{{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</strong>
          </div>
          <div class="resumen-item">
            <span>Tipo de Precio:</span>
            <strong>{{ tipoPrecio === 'minimo' ? 'Precio Mínimo' : 'Precio de Venta' }}</strong>
          </div>
          <div class="resumen-item" v-if="comentario.trim()">
            <span>Comentarios:</span>
            <strong>{{ comentario.substring(0, 50) }}{{ comentario.length > 50 ? '...' : '' }}</strong>
          </div>
        </div>

        <!-- Acciones -->
        <div class="modal-actions">
          <button @click="cancelar" class="btn-cancelar" :disabled="loading">
            <i class="fas fa-times"></i>
            Cancelar
          </button>

          <button 
            v-if="preciosPorDebajoMinimo.length > 0 && cliente"
            @click="guardarCotizacion"
            class="btn-guardar"
            :disabled="loading"
          >
            <i class="fas fa-save"></i>
            Guardar para Aprobación
          </button>

          <button 
            v-if="cliente && preciosPorDebajoMinimo.length === 0"
            @click="confirmarPDF"
            class="btn-generar"
            :disabled="!hayInformacionSeleccionada || loading"
          >
            <i class="fas fa-file-pdf"></i>
            Generar PDF
          </button>

          <button 
            v-if="!cliente"
            @click="buscarCliente"
            class="btn-buscar"
            :disabled="loading"
          >
            <i class="fas fa-search"></i>
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
      @cliente-creado="onClienteCreado"
      @cliente-actualizado="onClienteActualizado"
    />

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
import BuscarClienteModal from './BuscarClienteModal.vue'
import clientesService from '@/services/clientes'

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
  setup(props, { emit }) {
    // Estados reactivos
    const cliente = ref(null)
    const mostrarModalCliente = ref(false)
    const clienteParaEditar = ref(null)
    const comentario = ref('')
    const loading = ref(false)
    const loadingMessage = ref('')
    
    // ✅ TOAST SYSTEM - Estados
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success') // success, error, warning, info

    // Configuración del PDF con valores por defecto
    const configuracionPDF = ref({
      incluirNombreEncargado: true,
      incluirNombreEmpresa: true,
      incluirDocumentoFiscal: false,
      incluirTelefonoEmpresa: false,
      incluirCorreoEmpresa: true
    })

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
    const preciosPorDebajoMinimo = computed(() => {
      return props.serviciosSeleccionados.filter(item => {
        const totalUnidades = esServicioBackup(item.servicio) 
          ? (item.cantidadServidores || 0)
          : (item.cantidadServidores || 0) + (item.cantidadEquipos || 0)
        const precioMinimo = item.servicio.precioMinimo || item.servicio.precio_minimo || 0
        return totalUnidades > 0 && item.precioVentaFinal < precioMinimo
      })
    })

    const hayInformacionSeleccionada = computed(() => {
      return Object.values(configuracionPDF.value).some(valor => valor)
    })

    // Métodos
    const esServicioBackup = (servicio) => {
      const categoria = servicio.categoria?.toLowerCase() || ''
      return categoria.includes('backup') || categoria.includes('respaldo')
    }

   const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

    const formatRTN = (rtn) => {
      return clientesService.formatRTN(rtn)
    }

    const formatTelefono = (telefono) => {
      return clientesService.formatTelefono(telefono)
    }

    const resetearEstados = () => {
      cliente.value = null
      clienteParaEditar.value = null
      comentario.value = ''
      showToast.value = false
      toastMessage.value = ''
      configuracionPDF.value = {
        incluirNombreEncargado: true,
        incluirNombreEmpresa: true,
        incluirDocumentoFiscal: false,
        incluirTelefonoEmpresa: false,
        incluirCorreoEmpresa: true
      }
    }

    const cerrar = () => {
      if (!loading.value) {
        resetearEstados()
        emit('cerrar')
      }
    }

    const cancelar = () => {
      if (!loading.value) {
        mostrarToast('Operación cancelada', 'info')
        resetearEstados()
        emit('cerrar')
      }
    }

    const buscarCliente = () => {
      clienteParaEditar.value = null // Modo agregar nuevo
      mostrarModalCliente.value = true
      mostrarToast('Abriendo búsqueda de clientes', 'info')
    }

    const editarCliente = () => {
      if (cliente.value) {
        clienteParaEditar.value = { ...cliente.value } // Copia para editar
        mostrarModalCliente.value = true
        mostrarToast('Abriendo editor de cliente', 'info')
      }
    }

    const cambiarCliente = () => {
      clienteParaEditar.value = null // Modo buscar/cambiar
      mostrarModalCliente.value = true
      mostrarToast('Buscando otro cliente', 'info')
    }

    const removerCliente = () => {
      if (confirm('¿Estás seguro de que deseas quitar el cliente seleccionado?')) {
        const nombreEmpresa = cliente.value?.nombreEmpresa || cliente.value?.nombre_empresa
        cliente.value = null
        clienteParaEditar.value = null
        // Resetear configuración PDF
        configuracionPDF.value = {
          incluirNombreEncargado: true,
          incluirNombreEmpresa: true,
          incluirDocumentoFiscal: false,
          incluirTelefonoEmpresa: false,
          incluirCorreoEmpresa: true
        }
        comentario.value = ''
        mostrarToast(`Cliente ${nombreEmpresa} removido`, 'info')
      }
    }

    const cerrarModalCliente = () => {
      mostrarModalCliente.value = false
      clienteParaEditar.value = null
    }

    const onClienteSeleccionado = (clienteSeleccionado) => {
      console.log('🏢 Cliente seleccionado:', clienteSeleccionado)
      cliente.value = clienteSeleccionado
      mostrarModalCliente.value = false
      clienteParaEditar.value = null
      
      // Resetear configuración PDF con valores por defecto
      configuracionPDF.value = {
        incluirNombreEncargado: true,
        incluirNombreEmpresa: true,
        incluirDocumentoFiscal: false,
        incluirTelefonoEmpresa: false,
        incluirCorreoEmpresa: true
      }
      
      mostrarToast(`Cliente ${clienteSeleccionado.nombreEmpresa || clienteSeleccionado.nombre_empresa} seleccionado correctamente`, 'success')
    }

    const onClienteCreado = (clienteCreado) => {
      console.log('🆕 Cliente creado:', clienteCreado)
      cliente.value = clienteCreado
      mostrarModalCliente.value = false
      clienteParaEditar.value = null
      
      configuracionPDF.value = {
        incluirNombreEncargado: true,
        incluirNombreEmpresa: true,
        incluirDocumentoFiscal: false,
        incluirTelefonoEmpresa: false,
        incluirCorreoEmpresa: true
      }
      
      mostrarToast(`Cliente ${clienteCreado.nombreEmpresa || clienteCreado.nombre_empresa} creado y seleccionado correctamente`, 'success')
    }

    const onClienteActualizado = (clienteActualizado) => {
      console.log('✏️ Cliente actualizado:', clienteActualizado)
      cliente.value = clienteActualizado
      mostrarModalCliente.value = false
      clienteParaEditar.value = null
      
      mostrarToast(`Cliente ${clienteActualizado.nombreEmpresa || clienteActualizado.nombre_empresa} actualizado correctamente`, 'success')
    }

    const validarDatos = () => {
      if (!cliente.value) {
        throw new Error('Debe seleccionar un cliente')
      }

      if (preciosPorDebajoMinimo.value.length === 0 && !hayInformacionSeleccionada.value) {
        throw new Error('Debe seleccionar al menos un campo de información del cliente')
      }

      // ✅ CORREGIDO: Solo incluir clientes_id si existe (cliente existente)
      const clienteValidado = {
        nombreEncargado: cliente.value.nombreEncargado || cliente.value.nombre_encargado,
        nombreEmpresa: cliente.value.nombreEmpresa || cliente.value.nombre_empresa,
        documentofiscal: cliente.value.documentofiscal || cliente.value.documento_fiscal,
        telefonoEmpresa: cliente.value.telefonoEmpresa || cliente.value.telefono_empresa,
        correoEmpresa: cliente.value.correoEmpresa || cliente.value.correo_empresa,
        telefonoPersonal: cliente.value.telefonoPersonal || cliente.value.telefono_personal,
        correoPersonal: cliente.value.correoPersonal || cliente.value.correo_personal
      }

      // ✅ SOLO agregar clientes_id si es un cliente existente
      if (cliente.value.clientes_id || cliente.value.id) {
        clienteValidado.clientes_id = cliente.value.clientes_id || cliente.value.id
      }
      // Si no tiene ID, es un cliente nuevo y el backend lo creará

      if (!clienteValidado.nombreEncargado || !clienteValidado.nombreEmpresa) {
        throw new Error('El cliente debe tener al menos nombre del encargado y nombre de empresa')
      }

      return clienteValidado
    }

    const confirmarPDF = async () => {
      try {
        loading.value = true
        loadingMessage.value = 'Preparando datos para PDF...'
        
        mostrarToast('Validando datos para generar PDF...', 'info')

        const clienteValidado = validarDatos()

        const datosParaPDF = {
          cliente: clienteValidado,
          configuracionPDF: { ...configuracionPDF.value },
          servicios: props.serviciosSeleccionados,
          añosContrato: props.añosContrato,
          precioTotal: props.precioTotal,
          tipoPrecio: props.tipoPrecio,
          comentario: comentario.value.trim()
        }

        console.log('📄 Datos antes de formatear:', datosParaPDF)

        const datosFormateados = await clientesService.formatDataParaPDF(datosParaPDF)

        console.log('📄 Enviando datos formateados para generar PDF:', datosFormateados)

        mostrarToast('Enviando datos para generar PDF...', 'info')
        emit('generar-pdf', datosFormateados)
        
        // ✅ NO cerrar aquí - esperar a que el componente padre confirme el éxito
        
      } catch (err) {
        console.error('❌ Error preparando PDF:', err)
        mostrarToast(err.message || 'Error al preparar los datos para el PDF', 'error')
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    const guardarCotizacion = async () => {
      try {
        loading.value = true
        loadingMessage.value = 'Preparando cotización para guardar...'
        
        mostrarToast('Validando datos para guardar cotización...', 'info')

        const clienteValidado = validarDatos()

        const datosCotizacion = {
          cliente: clienteValidado,
          configuracionPDF: { ...configuracionPDF.value },
          servicios: props.serviciosSeleccionados,
          añosContrato: props.añosContrato,
          precioTotal: props.precioTotal,
          tipoPrecio: props.tipoPrecio,
          comentario: comentario.value.trim(),
          estado: 'pendiente_aprobacion',
          fecha: new Date().toISOString(),
          preciosPorDebajoMinimo: preciosPorDebajoMinimo.value
        }

        console.log('💾 Datos antes de formatear:', datosCotizacion)

        // ✅ CORREGIDO: Usar await correctamente
        const datosFormateados = await clientesService.formatDataParaPDF(datosCotizacion)

        console.log('💾 Enviando datos formateados para guardar:', datosFormateados)

        mostrarToast('Enviando cotización para guardar...', 'info')
        emit('guardar-cotizacion', datosFormateados)
        
      } catch (err) {
        console.error('❌ Error preparando cotización:', err)
        mostrarToast(err.message || 'Error al preparar la cotización', 'error')
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    // Resetear estados cuando se cierra el modal
    watch(() => props.mostrar, (mostrarModal) => {
      if (!mostrarModal) {
        resetearEstados()
      } else {
        // Mostrar mensaje de bienvenida al abrir
        mostrarToast('Configurando datos para generar PDF', 'info')
      }
    })

    return {
      // Estados
      cliente,
      mostrarModalCliente,
      clienteParaEditar,
      comentario,
      loading,
      loadingMessage,
      configuracionPDF,
      
      // ✅ TOAST STATES
      showToast,
      toastMessage,
      toastType,
      
      // Computed
      preciosPorDebajoMinimo,
      hayInformacionSeleccionada,
      toastIcon,
      
      // Métodos
      formatCurrency,
      formatRTN,
      formatTelefono,
      cerrar,
      cancelar,
      buscarCliente,
      editarCliente,
      cambiarCliente,
      removerCliente,
      cerrarModalCliente,
      onClienteSeleccionado,
      onClienteCreado,
      onClienteActualizado,
      confirmarPDF,
      guardarCotizacion,
      
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
  max-width: 700px;
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

@keyframes spin {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
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

 .modal-content {
   padding: 1rem;
 }

 .btn-cancelar,
 .btn-guardar,
 .btn-generar,
 .btn-buscar {
   width: 100%;
   justify-content: center;
   margin-bottom: 0.5rem;
 }

 .cliente-actions {
   flex-direction: column;
   gap: 0.25rem;
 }

 .btn-editar,
 .btn-cambiar,
 .btn-remover {
   width: 100%;
   justify-content: center;
 }

 .resumen-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.25rem;
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