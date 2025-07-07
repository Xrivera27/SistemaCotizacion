<template>
  <div v-if="mostrarResultados" class="resultados-container" id="cotizacion-pdf">
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <div class="resultados-header">
      <h2>
        <i class="fas fa-file-invoice"></i>
        Cotización de Servicios Cloud
      </h2>
      <p class="fecha">Fecha: {{ fechaActual }}</p>
      <div class="contrato-global">
        <span class="contrato-duracion">
          <i class="fas fa-calendar-alt"></i>
          Duración del contrato: {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <div class="servicios-seleccionados">
      <h3>Servicios Seleccionados:</h3>
      <div v-for="item in serviciosSeleccionados" :key="item.servicio.servicios_id" class="servicio-seleccionado">
        <div class="servicio-info">
          <span class="servicio-icon">
            <i class="fas fa-cloud"></i>
          </span>
          <div class="servicio-detalles">
            <strong>{{ item.servicio.nombre }}</strong>
            <p>{{ item.servicio.descripcion || 'Servicio cloud empresarial' }}</p>
            <div class="equipos-info">
              <strong>Categoría:</strong> {{ item.servicio.categoria || 'General' }}
            </div>
            <div class="cantidades-info">
              <!-- Mostrar información diferente para servicios de backup -->
              <template v-if="esServicioBackup(item.servicio)">
                <div class="cantidad-item gb-item">
                  <span class="cantidad-label">
                    <i class="fas fa-hdd"></i>
                    Almacenamiento:
                  </span>
                  <span class="cantidad-valor gb-valor">{{ item.cantidadServidores }} GB</span>
                </div>
              </template>
              <template v-else>
                <div class="cantidad-item">
                  <span class="cantidad-label">
                    <i class="fas fa-server"></i>
                    Servidores:
                  </span>
                  <span class="cantidad-valor">{{ item.cantidadServidores }}</span>
                </div>
                <div class="cantidad-item">
                  <span class="cantidad-label">
                    <i class="fas fa-cogs"></i>
                    Equipos:
                  </span>
                  <span class="cantidad-valor">{{ item.cantidadEquipos }}</span>
                </div>
              </template>
            </div>
            <div class="precios-detalle">
              <span class="precio-minimo">Mín: {{ formatCurrency(item.servicio.precioMinimo) }}/año</span>
              <span class="precio-venta-usado">Venta: {{ formatCurrency(item.precioVentaFinal) }}/año</span>
            </div>
            <div class="calculo-detalle">
              <!-- Mostrar cálculo diferente para servicios de backup -->
              <small v-if="esServicioBackup(item.servicio)">
                {{ item.cantidadServidores }} GB × {{ formatCurrency(item.precioVentaFinal) }}/año × {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
              </small>
              <small v-else>
                {{ totalUnidades(item) }} unidad(es) × {{ formatCurrency(item.precioVentaFinal) }}/año × {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
              </small>
            </div>
          </div>
        </div>
        <div class="servicio-subtotal">
          <div class="subtotal-anual">{{ formatCurrency(calcularSubtotalAnual(item)) }}/año</div>
          <div class="subtotal-total">{{ formatCurrency(calcularSubtotalTotal(item)) }} total</div>
        </div>
      </div>
    </div>

    <div class="opciones-precio">
      <div class="precio-option minimo">
        <h4>
          <i class="fas fa-circle text-danger"></i>
          Precio Mínimo
        </h4>
        <div class="precio-valor">{{ formatCurrency(precioMinimoAnual) }}/año</div>
        <div class="precio-total-contrato">{{ formatCurrency(precioMinimoTotal) }} total</div>
        <p>Precio mínimo para {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</p>
      </div>

      <div class="precio-option venta">
        <h4>
          <i class="fas fa-circle text-success"></i>
          Precio de Venta
        </h4>
        <div class="precio-valor">{{ formatCurrency(precioVentaAnual) }}/año</div>
        <div class="precio-total-contrato">{{ formatCurrency(precioVentaTotal) }} total</div>
        <p>Precio final para {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</p>
        <small>Ganancia: {{ formatCurrency(gananciaPotencial) }} total</small>
      </div>
    </div>

    <div class="resumen-financiero">
      <h3>
        <i class="fas fa-chart-bar"></i>
        Resumen Financiero ({{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }})
      </h3>
      <div class="metricas">
        <div class="metrica" v-if="totalServidores > 0">
          <span class="metrica-label">Total de Servidores:</span>
          <span class="metrica-valor">{{ totalServidores }} unidades</span>
        </div>
        <div class="metrica" v-if="totalEquipos > 0">
          <span class="metrica-label">Total de Equipos:</span>
          <span class="metrica-valor">{{ totalEquipos }} unidades</span>
        </div>
        <div class="metrica" v-if="totalGB > 0">
          <span class="metrica-label">Total de Almacenamiento:</span>
          <span class="metrica-valor">{{ totalGB }} GB</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Margen vs Mínimo:</span>
          <span class="metrica-valor ganancia">+{{ formatCurrency(precioVentaTotal - precioMinimoTotal) }} ({{ porcentajeMargenMinimo }}%)</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Ingreso anual:</span>
          <span class="metrica-valor destacado">{{ formatCurrency(precioVentaAnual) }}/año</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Valor total del contrato:</span>
          <span class="metrica-valor destacado-total">{{ formatCurrency(precioVentaTotal) }}</span>
        </div>
      </div>
    </div>

    <div class="selector-precio-pdf">
      <h3>
        <i class="fas fa-file-pdf"></i>
        Precio para la cotización del cliente
      </h3>
      <div class="opciones-precio-pdf">
        <label class="precio-radio-option">
          <input 
            type="radio" 
            v-model="precioSeleccionadoPDF" 
            value="minimo"
            name="precio-pdf"
          >
          <span class="radio-custom"></span>
          <div class="precio-info">
            <strong>Precio Mínimo</strong>
            <span class="precio-cantidad">{{ formatCurrency(precioMinimoTotal) }} total</span>
            <small>Precio competitivo especial</small>
          </div>
        </label>

        <label class="precio-radio-option">
          <input 
            type="radio" 
            v-model="precioSeleccionadoPDF" 
            value="venta"
            name="precio-pdf"
          >
          <span class="radio-custom"></span>
          <div class="precio-info">
            <strong>Precio de Venta</strong>
            <span class="precio-cantidad">{{ formatCurrency(precioVentaTotal) }} total</span>
            <small>Precio estándar recomendado</small>
          </div>
        </label>
      </div>
      
      <!-- Advertencia si hay precios por debajo del mínimo -->
      <div v-if="hayPreciosPorDebajoMinimo" class="advertencia-precios">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Atención:</strong> Algunos servicios tienen precios por debajo del mínimo. 
        La cotización requerirá aprobación administrativa.
      </div>
    </div>

    <div class="acciones">
      <button 
        @click="exportarPDF" 
        class="btn-exportar" 
        :disabled="!precioSeleccionadoPDF || loading"
      >
        <i class="fas fa-file-pdf"></i>
        Generar PDF para Cliente
      </button>
      
      <button @click="reiniciar" class="btn-reiniciar" :disabled="loading">
        <i class="fas fa-redo-alt"></i>
        Nueva Cotización
      </button>
    </div>

    <!-- Modal de Confirmación PDF -->
    <ConfirmacionPDFModal
      :mostrar="mostrarModalConfirmacion"
      :servicios-seleccionados="serviciosSeleccionados"
      :años-contrato="añosContrato"
      :precio-total="precioSeleccionadoPDF === 'minimo' ? precioMinimoTotal : precioVentaTotal"
      :tipo-precio="precioSeleccionadoPDF"
      @cerrar="cerrarModalConfirmacion"
      @generar-pdf="onGenerarPDF"
      @guardar-cotizacion="onGuardarCotizacion"
      @limpiar-formulario="onLimpiarFormulario"
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
import { ref, computed, } from 'vue'
import ConfirmacionPDFModal from './ConfirmacionPDFModal.vue'
import crearcotizacionService from '@/services/crearcotizacion'

export default {
  name: 'ResultadoCotizacion',
  components: {
    ConfirmacionPDFModal
  },
  props: {
    serviciosSeleccionados: {
      type: Array,
      required: true
    },
    añosContrato: {
      type: Number,
      default: 1
    }
  },
  emits: ['reiniciar', 'limpiar-formulario'],
  setup(props, { emit }) {
    // Estados reactivos
    const precioSeleccionadoPDF = ref('venta')
    const mostrarModalConfirmacion = ref(false)
    const loading = ref(false)
    const loadingMessage = ref('')
    
    // ✅ TOAST SYSTEM - Estados
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success') // success, error, warning, info

    // ✅ MÉTODOS HELPER PRIMERO (antes de los computed)
    const esServicioBackup = (servicio) => {
      const categoria = servicio.categoria?.toLowerCase() || servicio.categoria?.toLowerCase() || ''
      return categoria.includes('backup') || categoria.includes('respaldo')
    }

    const totalUnidades = (item) => {
      if (esServicioBackup(item.servicio)) {
        return item.cantidadServidores || 0
      }
      return (item.cantidadServidores || 0) + (item.cantidadEquipos || 0)
    }

    const calcularSubtotalAnual = (item) => {
      const totalUnidadesItem = totalUnidades(item)
      return totalUnidadesItem * (item.precioVentaFinal || 0)
    }

    const calcularSubtotalTotal = (item) => {
      return calcularSubtotalAnual(item) * props.añosContrato
    }

    const formatCurrency = (amount) => {
      return crearcotizacionService.formatCurrency(amount || 0)
    }

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

    // ✅ COMPUTED PROPERTIES DESPUÉS DE LOS MÉTODOS
    const mostrarResultados = computed(() => {
      return props.serviciosSeleccionados.length > 0
    })

    const fechaActual = computed(() => {
      return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const totalServidores = computed(() => {
      return props.serviciosSeleccionados.reduce((total, item) => {
        if (!esServicioBackup(item.servicio)) {
          return total + (item.cantidadServidores || 0)
        }
        return total
      }, 0)
    })

    const totalEquipos = computed(() => {
      return props.serviciosSeleccionados.reduce((total, item) => {
        return total + (item.cantidadEquipos || 0)
      }, 0)
    })

    const totalGB = computed(() => {
      return props.serviciosSeleccionados.reduce((total, item) => {
        if (esServicioBackup(item.servicio)) {
          return total + (item.cantidadServidores || 0)
        }
        return total
      }, 0)
    })

    const precioMinimoAnual = computed(() => {
      return props.serviciosSeleccionados.reduce((total, item) => {
        const totalUnidadesItem = totalUnidades(item)
        return total + (totalUnidadesItem * (item.servicio.precioMinimo || item.servicio.precio_minimo || 0))
      }, 0)
    })

    const precioMinimoTotal = computed(() => {
      return precioMinimoAnual.value * props.añosContrato
    })

    const precioVentaAnual = computed(() => {
      return props.serviciosSeleccionados.reduce((total, item) => {
        return total + calcularSubtotalAnual(item)
      }, 0)
    })

    const precioVentaTotal = computed(() => {
      return precioVentaAnual.value * props.añosContrato
    })

    const gananciaPotencial = computed(() => {
      return Math.max(0, precioVentaTotal.value - precioMinimoTotal.value)
    })

    const porcentajeMargenMinimo = computed(() => {
      if (precioMinimoTotal.value === 0) return 0
      return Math.round(((precioVentaTotal.value - precioMinimoTotal.value) / precioMinimoTotal.value) * 100)
    })

    const hayPreciosPorDebajoMinimo = computed(() => {
      return props.serviciosSeleccionados.some(item => {
        const totalUnidadesItem = totalUnidades(item)
        const precioMinimo = item.servicio.precioMinimo || item.servicio.precio_minimo || 0
        return totalUnidadesItem > 0 && item.precioVentaFinal < precioMinimo
      })
    })

    // Resto de métodos
    const reiniciar = () => {
      mostrarToast('Iniciando nueva cotización', 'info')
      emit('reiniciar')
    }

    const onLimpiarFormulario = () => {
      mostrarToast('Formulario limpiado correctamente', 'success')
      emit('limpiar-formulario')
    }

    const cerrarModalConfirmacion = () => {
      mostrarModalConfirmacion.value = false
    }

    const exportarPDF = () => {
      if (!precioSeleccionadoPDF.value) {
        mostrarToast('Por favor selecciona un tipo de precio para la cotización', 'warning')
        return
      }
      mostrarToast('Abriendo configuración para generar PDF', 'info')
      mostrarModalConfirmacion.value = true
    }

    const onGenerarPDF = async (datosParaPDF) => {
      try {
        loading.value = true
        loadingMessage.value = 'Generando PDF...'
        
        mostrarToast('Iniciando generación de PDF...', 'info')

        const cotizacionData = crearcotizacionService.formatCotizacionParaFormulario(
          datosParaPDF.servicios,
          datosParaPDF.cliente,
          props.añosContrato,
          datosParaPDF.tipoPrecio,
          datosParaPDF.configuracionPDF,
          datosParaPDF.comentario || ''
        )

        console.log('💾 Creando cotización en backend:', cotizacionData)

        const resultado = await crearcotizacionService.createCotizacion(cotizacionData)

        if (!resultado.success) {
          throw new Error(resultado.message || 'Error al crear la cotización')
        }

        const cotizacionCreada = resultado.cotizacion
        console.log('✅ Cotización creada con ID:', cotizacionCreada.cotizaciones_id)

        mostrarToast('Cotización creada, generando PDF...', 'info')

        console.log('📄 Generando PDF para cotización:', cotizacionCreada.cotizaciones_id)
        
        const resultadoPDF = await crearcotizacionService.generarPDF(cotizacionCreada.cotizaciones_id)

        if (!resultadoPDF.success) {
          throw new Error(resultadoPDF.message || 'Error al generar el PDF')
        }

        await crearcotizacionService.marcarPDFGenerado(cotizacionCreada.cotizaciones_id)

        let mensajeExito = `PDF generado exitosamente para ${datosParaPDF.cliente.nombreEmpresa}`
        
        if (resultado.requiere_aprobacion) {
          mensajeExito += '. La cotización requiere aprobación administrativa debido a precios especiales.'
          mostrarToast(mensajeExito, 'warning')
        } else {
          mostrarToast(mensajeExito, 'success')
        }

        cerrarModalConfirmacion()
        console.log('✅ Proceso completado exitosamente')

        // Limpiar formulario después del éxito
        setTimeout(() => {
          onLimpiarFormulario()
        }, 2000)

      } catch (err) {
        console.error('❌ Error en proceso de PDF:', err)
        mostrarToast(err.message || 'Error al generar el PDF', 'error')
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    const onGuardarCotizacion = async (datosCotizacion) => {
      try {
        loading.value = true
        loadingMessage.value = 'Guardando cotización...'
        
        mostrarToast('Guardando cotización...', 'info')

        const cotizacionData = crearcotizacionService.formatCotizacionParaFormulario(
          datosCotizacion.servicios,
          datosCotizacion.cliente,
          props.añosContrato,
          datosCotizacion.tipoPrecio,
          datosCotizacion.configuracionPDF,
          datosCotizacion.comentario || ''
        )

        console.log('💾 Guardando cotización:', cotizacionData)

        const resultado = await crearcotizacionService.createCotizacion(cotizacionData)

        if (!resultado.success) {
          throw new Error(resultado.message || 'Error al guardar la cotización')
        }

        const cotizacionCreada = resultado.cotizacion
        console.log('✅ Cotización guardada con ID:', cotizacionCreada.cotizaciones_id)

        let mensajeExito = `Cotización guardada exitosamente para ${datosCotizacion.cliente.nombreEmpresa}`
        
        if (resultado.requiere_aprobacion) {
          mensajeExito += '. La cotización requiere aprobación administrativa debido a precios especiales.'
          mostrarToast(mensajeExito, 'warning')
        } else {
          mostrarToast(mensajeExito, 'success')
        }

        cerrarModalConfirmacion()

        setTimeout(() => {
          onLimpiarFormulario()
        }, 2000)

      } catch (err) {
        console.error('❌ Error guardando cotización:', err)
        mostrarToast(err.message || 'Error al guardar la cotización', 'error')
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    return {
      // Estados
      precioSeleccionadoPDF,
      mostrarModalConfirmacion,
      loading,
      loadingMessage,
      
      // ✅ TOAST STATES
      showToast,
      toastMessage,
      toastType,
      
      // Computed
      mostrarResultados,
      fechaActual,
      totalServidores,
      totalEquipos,
      totalGB,
      precioMinimoAnual,
      precioMinimoTotal,
      precioVentaAnual,
      precioVentaTotal,
      gananciaPotencial,
      porcentajeMargenMinimo,
      hayPreciosPorDebajoMinimo,
      toastIcon,
      
      // Métodos
      esServicioBackup,
      totalUnidades,
      calcularSubtotalAnual,
      calcularSubtotalTotal,
      formatCurrency,
      reiniciar,
      onLimpiarFormulario,
      cerrarModalConfirmacion,
      exportarPDF,
      onGenerarPDF,
      onGuardarCotizacion,
      
      // ✅ TOAST METHODS
      mostrarToast,
      hideToast
    }
  }
}
</script>

<style scoped>
.resultados-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e9ecef;
}

.resultados-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.resultados-header h2 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: clamp(1.4rem, 4vw, 2rem);
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 700;
}

.resultados-header h2 i {
  color: #6c757d;
  font-size: 1.1em;
}

.fecha {
  color: #6c757d;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  margin-bottom: 1rem;
  font-weight: 500;
}

.contrato-global {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.contrato-duracion {
  color: #495057;
  font-weight: 700;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contrato-duracion i {
  color: #007bff;
}

.servicios-seleccionados {
  margin-bottom: 2rem;
}

.servicios-seleccionados h3 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.servicio-seleccionado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #f8f9fa;
  gap: 1rem;
  transition: all 0.2s ease;
}

.servicio-seleccionado:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #ced4da;
}

.servicio-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.servicio-info .servicio-icon {
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  flex-shrink: 0;
  color: #6c757d;
}

.servicio-detalles {
  flex: 1;
  min-width: 0;
}

.servicio-detalles strong {
  color: #495057;
  display: block;
  margin-bottom: 0.5rem;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  line-height: 1.3;
  font-weight: 600;
}

.servicio-detalles p {
  color: #6c757d;
  margin: 0 0 0.75rem 0;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  line-height: 1.4;
}

.equipos-info {
  background: linear-gradient(135deg, #e3f2fd, #f0f4ff);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #007bff;
  border: 1px solid #bbdefb;
}

.equipos-info strong {
  color: #0056b3;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.cantidades-info {
  background: linear-gradient(135deg, #f0f8f0, #e8f5e8);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #28a745;
  border: 1px solid #c3e6cb;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cantidad-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cantidad-label {
  font-size: clamp(0.8rem, 2vw, 0.85rem);
  color: #155724;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.cantidad-label i {
  font-size: 0.9em;
}

.cantidad-valor {
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  color: #495057;
  font-weight: 700;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #28a745;
}

/* Estilos específicos para servicios de backup */
.gb-item {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #6f42c1;
  border: 1px solid #d1b3e0;
}

.gb-item .cantidad-label {
  color: #4a148c !important;
  font-weight: 700;
}

.gb-valor {
  background: white;
  color: #4a148c !important;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #6f42c1;
}

.precios-detalle {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.precio-minimo,
.precio-venta-usado {
 padding: 0.4rem 0.75rem;
 border-radius: 6px;
 font-size: clamp(0.75rem, 2vw, 0.85rem);
 font-weight: 600;
 border: 1px solid;
}

.precio-minimo {
 background: linear-gradient(135deg, #fff5f5, #fed7d7);
 color: #c53030;
 border-color: #fc8181;
}

.precio-venta-usado {
 background: linear-gradient(135deg, #f0fff4, #c6f6d5);
 color: #2d5016;
 border-color: #68d391;
}

.calculo-detalle {
 background: linear-gradient(135deg, #fffbf0, #fef5e7);
 padding: 0.5rem 0.75rem;
 border-radius: 6px;
 border-left: 3px solid #f6ad55;
 border: 1px solid #fbd38d;
}

.calculo-detalle small {
 color: #744210;
 font-size: clamp(0.75rem, 2vw, 0.8rem);
 font-weight: 500;
}

.servicio-subtotal {
 text-align: right;
 flex-shrink: 0;
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
 padding: 0.5rem;
 background: white;
 border-radius: 8px;
 border: 1px solid #e9ecef;
}

.subtotal-anual {
 font-size: clamp(1rem, 2.8vw, 1.1rem);
 color: #28a745;
 font-weight: 700;
}

.subtotal-total {
 font-size: clamp(1.1rem, 3vw, 1.3rem);
 color: #dc3545;
 font-weight: 700;
 background: linear-gradient(135deg, #fff5f5, #fed7d7);
 padding: 0.5rem 0.75rem;
 border-radius: 6px;
 border: 1px solid #fc8181;
}

.opciones-precio {
 display: grid;
 grid-template-columns: 1fr;
 gap: 1.5rem;
 margin-bottom: 2rem;
}

.precio-option {
 padding: 1.5rem;
 border-radius: 12px;
 text-align: center;
 transition: all 0.3s ease;
 box-sizing: border-box;
 border: 2px solid;
}

.precio-option:hover {
 transform: translateY(-3px);
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.minimo {
 background: linear-gradient(135deg, #fff5f5, #fed7d7);
 border-color: #fc8181;
}

.venta {
 background: linear-gradient(135deg, #f0fff4, #c6f6d5);
 border-color: #68d391;
}

.precio-option h4 {
 margin-bottom: 1rem;
 font-size: clamp(1.1rem, 3vw, 1.2rem);
 line-height: 1.2;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
 font-weight: 600;
 color: #495057;
}

.text-danger {
 color: #dc3545;
}

.text-success {
 color: #28a745;
}

.precio-valor {
 font-size: clamp(1.3rem, 4vw, 1.6rem);
 font-weight: 700;
 margin-bottom: 0.5rem;
 line-height: 1;
 color: #495057;
}

.precio-total-contrato {
 font-size: clamp(1.4rem, 4.5vw, 1.8rem);
 font-weight: 700;
 margin-bottom: 0.75rem;
 padding: 0.5rem 0.75rem;
 background: rgba(255, 255, 255, 0.8);
 border-radius: 6px;
 border: 1px solid rgba(0, 0, 0, 0.1);
 color: #495057;
}

.precio-option p {
 margin-bottom: 0.5rem;
 opacity: 0.8;
 font-size: clamp(0.85rem, 2.5vw, 0.95rem);
 line-height: 1.3;
 color: #6c757d;
 font-weight: 500;
}

.precio-option small {
 font-size: clamp(0.75rem, 2vw, 0.85rem);
 opacity: 0.7;
 color: #6c757d;
 font-weight: 500;
}

.resumen-financiero {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 padding: 2rem;
 border-radius: 12px;
 margin-bottom: 2rem;
 border: 1px solid #ced4da;
 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.resumen-financiero h3 {
 color: #495057;
 margin-bottom: 1.5rem;
 font-size: clamp(1.2rem, 3vw, 1.4rem);
 text-align: center;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.75rem;
 font-weight: 600;
}

.resumen-financiero h3 i {
 color: #6c757d;
}

.metricas {
 display: flex;
 flex-direction: column;
 gap: 1rem;
}

.metrica {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 1rem;
 background: white;
 border-radius: 8px;
 border-left: 4px solid #007bff;
 flex-wrap: wrap;
 gap: 0.5rem;
 border: 1px solid #e9ecef;
 transition: all 0.2s ease;
}

.metrica:hover {
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metrica-label {
 font-weight: 600;
 color: #495057;
 font-size: clamp(0.85rem, 2.5vw, 0.95rem);
}

.metrica-valor {
 font-weight: 700;
 color: #495057;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.metrica-valor.ganancia {
 color: #28a745;
}

.metrica-valor.destacado {
 color: #dc3545;
 font-size: clamp(1rem, 3vw, 1.2rem);
}

.metrica-valor.destacado-total {
 color: #6f42c1;
 font-size: clamp(1.1rem, 3.5vw, 1.4rem);
 background: linear-gradient(135deg, #f3e5f5, #e1bee7);
 padding: 0.5rem 0.75rem;
 border-radius: 6px;
 border: 1px solid #d1b3e0;
}

.selector-precio-pdf {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 padding: 2rem;
 border-radius: 12px;
 margin-bottom: 2rem;
 border: 1px solid #ced4da;
 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.selector-precio-pdf h3 {
 color: #495057;
 margin-bottom: 1.5rem;
 font-size: clamp(1.2rem, 3vw, 1.4rem);
 text-align: center;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.75rem;
 font-weight: 600;
}

.selector-precio-pdf h3 i {
 color: #007bff;
}

.opciones-precio-pdf {
 display: grid;
 grid-template-columns: 1fr;
 gap: 1rem;
}

.precio-radio-option {
 display: flex;
 align-items: center;
 padding: 1.5rem;
 background: white;
 border: 2px solid #e9ecef;
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.3s ease;
 gap: 1rem;
}

.precio-radio-option:hover {
 border-color: #007bff;
 box-shadow: 0 4px 16px rgba(0, 123, 255, 0.15);
}

.precio-radio-option input[type="radio"] {
 display: none;
}

.radio-custom {
 width: 20px;
 height: 20px;
 border: 2px solid #ced4da;
 border-radius: 50%;
 position: relative;
 flex-shrink: 0;
 transition: all 0.3s ease;
}

.precio-radio-option input[type="radio"]:checked + .radio-custom {
 border-color: #007bff;
 background: #007bff;
}

.precio-radio-option input[type="radio"]:checked + .radio-custom::after {
 content: '';
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 width: 8px;
 height: 8px;
 background: white;
 border-radius: 50%;
}

.precio-info {
 flex: 1;
 display: flex;
 flex-direction: column;
}

.precio-info strong {
 color: #495057;
 font-size: 1.1rem;
 margin-bottom: 0.5rem;
 font-weight: 600;
}

.precio-cantidad {
 color: #007bff;
 font-weight: 700;
 font-size: 1.2rem;
 margin-bottom: 0.5rem;
}

.precio-info small {
 color: #6c757d;
 font-size: 0.9rem;
 font-weight: 500;
}

.advertencia-precios {
 background: linear-gradient(135deg, #fff3cd, #ffeaa7);
 border: 1px solid #ffc107;
 border-left: 4px solid #ffc107;
 border-radius: 8px;
 padding: 1rem;
 margin-top: 1rem;
 color: #856404;
 display: flex;
 align-items: flex-start;
 gap: 0.75rem;
 font-size: 0.9rem;
 line-height: 1.4;
}

.advertencia-precios i {
 color: #ffc107;
 font-size: 1.2em;
 flex-shrink: 0;
 margin-top: 0.1rem;
}

.acciones {
 display: flex;
 gap: 1rem;
 justify-content: center;
 flex-wrap: wrap;
}

.btn-exportar, .btn-reiniciar, .btn-guardar {
 padding: 1rem 2rem;
 border: none;
 border-radius: 8px;
 font-size: 1rem;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 flex: 1;
 min-width: 180px;
 max-width: 220px;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.75rem;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.btn-guardar {
 background: linear-gradient(135deg, #28a745, #20c997);
 color: white;
}

.btn-guardar:hover {
 background: linear-gradient(135deg, #1e7e34, #17a2b8);
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
}

.btn-exportar {
 background: linear-gradient(135deg, #007bff, #0056b3);
 color: white;
}

.btn-exportar:hover:not(:disabled) {
 background: linear-gradient(135deg, #0056b3, #004085);
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.btn-exportar:disabled {
 background: linear-gradient(135deg, #6c757d, #adb5bd);
 cursor: not-allowed;
 transform: none;
 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-exportar:disabled i {
 color: #e9ecef;
}

.btn-reiniciar {
 background: linear-gradient(135deg, #6c757d, #495057);
 color: white;
}

.btn-reiniciar:hover {
 background: linear-gradient(135deg, #5a6268, #343a40);
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
}

.btn-exportar i,
.btn-reiniciar i,
.btn-guardar i {
 font-size: 1.1em;
}

/* Loading overlay */
.loading-overlay {
 position: fixed;
 top: 0;
 left: 0;
 width: 100vw;
 height: 100vh;
 background: rgba(0, 0, 0, 0.7);
 display: flex;
 justify-content: center;
 align-items: center;
 z-index: 9999;
 backdrop-filter: blur(3px);
}

.loading-spinner {
 text-align: center;
 color: white;
}

.loading-spinner i {
 font-size: 3rem;
 margin-bottom: 1rem;
 animation: spin 1s linear infinite;
}

.loading-spinner p {
 font-size: 1.1rem;
 margin: 0;
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

/* Responsive */
@media (min-width: 480px) {
 .resultados-container {
   padding: 2.5rem;
 }

 .opciones-precio {
   gap: 2rem;
 }

 .servicio-seleccionado {
   padding: 2rem;
 }

 .metricas {
   gap: 1.25rem;
 }

 .cantidades-info {
   gap: 2rem;
 }

 .opciones-precio-pdf {
   grid-template-columns: repeat(2, 1fr);
   gap: 1.5rem;
 }
}

@media (min-width: 768px) {
 .resultados-container {
   padding: 3rem;
 }

 .opciones-precio {
   grid-template-columns: repeat(2, 1fr);
   gap: 2rem;
 }

 .servicio-seleccionado {
   align-items: center;
 }

 .acciones {
   gap: 1.5rem;
 }

 .btn-exportar, .btn-reiniciar, .btn-guardar {
   flex: none;
   min-width: 200px;
 }

 .metricas {
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   gap: 1.25rem;
 }

 .metrica:last-child {
   grid-column: 1 / -1;
 }
}

@media (min-width: 1024px) {
 .opciones-precio {
   gap: 2.5rem;
 }

 .precio-option {
   padding: 2rem;
 }

 .resumen-financiero {
   padding: 2.5rem;
 }

 .metricas {
   grid-template-columns: repeat(3, 1fr);
 }

 .metrica:last-child {
   grid-column: 2 / 3;
 }
}

@media (max-width: 320px) {
 .resultados-container {
   padding: 1rem;
   margin-top: 1rem;
 }

 .servicio-seleccionado {
   flex-direction: column;
   align-items: flex-start;
   gap: 1rem;
   padding: 1rem;
 }

 .servicio-subtotal {
   text-align: left;
   align-self: stretch;
 }

 .acciones {
   flex-direction: column;
 }

 .btn-exportar, .btn-reiniciar, .btn-guardar {
   width: 100%;
   max-width: none;
   min-width: auto;
 }

 .precios-detalle {
   flex-direction: column;
   gap: 0.5rem;
 }

 .metrica {
   flex-direction: column;
   text-align: center;
   gap: 0.5rem;
 }

 .cantidades-info {
   flex-direction: column;
   gap: 0.75rem;
 }

 .precio-radio-option {
   padding: 1rem;
 }

 .precio-info strong {
   font-size: 1rem;
 }

 .precio-cantidad {
   font-size: 1.1rem;
 }

 .resultados-header h2 {
   flex-direction: column;
   gap: 0.5rem;
 }

 .contrato-duracion {
   font-size: 0.9rem;
 }

 .resumen-financiero h3,
 .selector-precio-pdf h3 {
   flex-direction: column;
   gap: 0.5rem;
 }

 .resumen-financiero,
 .selector-precio-pdf {
   padding: 1.5rem;
 }

 /* ✅ TOAST RESPONSIVE */
 .toast-notification {
   top: 1rem;
   right: 1rem;
   left: 1rem;
   max-width: none;
 }
}

@media (max-height: 500px) and (orientation: landscape) {
 .resultados-header {
   margin-bottom: 1rem;
   padding-bottom: 1rem;
 }

 .opciones-precio {
   grid-template-columns: repeat(2, 1fr);
   gap: 1rem;
 }

 .precio-option {
   padding: 1rem;
 }

 .resumen-financiero {
   padding: 1.5rem;
   margin-bottom: 1rem;
 }
}

/* Estilos para impresión */
@media print {
 .acciones,
 .toast-notification {
   display: none;
 }
 
 .resultados-container {
   box-shadow: none;
   border: 1px solid #ddd;
 }
}
</style>