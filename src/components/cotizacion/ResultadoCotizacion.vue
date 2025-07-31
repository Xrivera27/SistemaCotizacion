<template>
  <div v-if="mostrarResultados" class="resultados-container" id="cotizacion-pdf">
    <!-- Loading overlay - SIN CAMBIOS -->
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
          Duración del contrato: {{ mesesContrato }} mes{{ mesesContrato > 1 ? 'es' : '' }}
        </span>
      </div>
    </div>

    <!-- Servicios seleccionados - SIN CAMBIOS en estructura -->
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
            
            <!-- Mostrar todas las unidades de medida únicas - SIN CAMBIOS -->
            <div v-if="obtenerUnidadesUnicasDelServicio(item).length > 0" class="unidades-badges">
              <div v-for="unidad in obtenerUnidadesUnicasDelServicio(item)" :key="unidad.id" class="unidad-badge" :class="`tipo-${unidad.tipo}`">
                <i :class="obtenerIconoTipo(unidad.tipo)"></i>
                {{ unidad.nombre }}
              </div>
            </div>

            <div class="equipos-info">
              <strong>Categoría:</strong> {{ item.servicio.categoria || 'General' }}
            </div>
            
            <!-- Mostrar TODAS las cantidades por categoría - SIN CAMBIOS -->
            <div v-if="obtenerCantidadesPorCategoria(item).length > 0" class="cantidades-detalladas">
              <div class="cantidades-header">
                <i class="fas fa-list-ul"></i>
                <strong>Cantidades seleccionadas:</strong>
              </div>
              <div class="cantidades-lista">
                <div v-for="categoria in obtenerCantidadesPorCategoria(item)" :key="categoria.id" class="cantidad-categoria" :class="`tipo-${categoria.tipo}`">
                  <span class="categoria-label">
                    <i :class="obtenerIconoTipo(categoria.tipo)"></i>
                    {{ categoria.nombre }}:
                  </span>
                  <span class="categoria-valor">{{ formatearCantidadCategoria(categoria) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Fallback: Si no hay cantidades por categoría, mostrar el método tradicional - SIN CAMBIOS -->
            <div v-else class="cantidades-info-tradicional" :class="`tipo-${obtenerTipoUnidadTradicional(item)}`">
              <div class="cantidad-item principal-item">
                <span class="cantidad-label">
                  <i :class="obtenerIconoUnidadTradicional(item)"></i>
                  {{ obtenerEtiquetaPrincipalTradicional(item) }}:
                </span>
                <span class="cantidad-valor principal-valor">{{ formatearCantidadPrincipalTradicional(item) }}</span>
              </div>
              
              <div v-if="item.cantidadEquipos > 0 && obtenerTipoUnidadTradicional(item) === 'cantidad'" class="cantidad-item equipos-item">
                <span class="cantidad-label">
                  <i class="fas fa-cogs"></i>
                  Equipos Adicionales:
                </span>
                <span class="cantidad-valor equipos-valor">{{ item.cantidadEquipos }}</span>
              </div>
            </div>
            
            <!-- Precios con /mes - SIN CAMBIOS -->
            <div class="precios-detalle">
              <span class="precio-minimo">Mín: {{ formatCurrency(item.servicio.precioMinimo) }}/mes</span>
              <span class="precio-venta-usado">Venta: {{ formatCurrency(item.precioVentaFinal) }}/mes</span>
           </div>
           
           <!-- CAMBIO: Cálculo detallado solo mensual -->
           <div class="calculo-detalle">
             <div class="calculo-mensual">
               <small>
                 <strong>Mensual:</strong> {{ formatearCalculoMensual(item) }}
               </small>
             </div>
             <div class="calculo-total">
               <small>
                 <strong>Total contrato:</strong> {{ formatearCalculoTotal(item) }}
               </small>
             </div>
           </div>
         </div>
       </div>
       <div class="servicio-subtotal">
         <div class="subtotal-mensual">{{ formatCurrency(calcularSubtotalMensual(item)) }}/mes</div>
         <div class="subtotal-total">{{ formatCurrency(calcularSubtotalTotal(item)) }} total</div>
       </div>
     </div>
   </div>

   <!-- CAMBIO: Opciones de precio solo mensual -->
   <div class="opciones-precio">
     <div class="precio-option minimo">
       <h4>
         <i class="fas fa-circle text-danger"></i>
         Precio Mínimo
       </h4>
       <div class="precio-mensual">{{ formatCurrency(precioMinimoMensual) }}/mes</div>
       <div class="precio-total-contrato">{{ formatCurrency(precioMinimoTotal) }} total</div>
       <p>Precio mínimo para {{ mesesContrato }} mes{{ mesesContrato > 1 ? 'es' : '' }}</p>
     </div>

     <div class="precio-option venta">
       <h4>
         <i class="fas fa-circle text-success"></i>
         Precio de Venta
       </h4>
       <div class="precio-mensual">{{ formatCurrency(precioVentaMensual) }}/mes</div>
       <div class="precio-total-contrato">{{ formatCurrency(precioVentaTotal) }} total</div>
       <p>Precio final para {{ mesesContrato }} mes{{ mesesContrato > 1 ? 'es' : '' }}</p>
       <small>Ganancia: {{ formatCurrency(gananciaPotencial) }} total</small>
     </div>
   </div>

   <!-- CAMBIO: Resumen financiero solo mensual -->
   <div class="resumen-financiero">
     <h3>
       <i class="fas fa-chart-bar"></i>
       Resumen Financiero ({{ mesesContrato }} mes{{ mesesContrato > 1 ? 'es' : '' }})
     </h3>
     <div class="metricas">
       <!-- Métricas dinámicas por tipo de unidad - SIN CAMBIOS -->
       <div v-for="metrica in metricasUnidades" :key="metrica.tipo" class="metrica">
         <span class="metrica-label">{{ metrica.label }}:</span>
         <span class="metrica-valor">{{ metrica.valor }} {{ metrica.unidad }}</span>
       </div>
       
       <div class="metrica">
         <span class="metrica-label">Costo mensual total:</span>
         <span class="metrica-valor destacado">{{ formatCurrency(precioVentaMensual) }}/mes</span>
       </div>
       
       <div class="metrica">
         <span class="metrica-label">Margen vs Mínimo:</span>
         <span class="metrica-valor ganancia">+{{ formatCurrency(precioVentaTotal - precioMinimoTotal) }} ({{ porcentajeMargenMinimo }}%)</span>
       </div>
       
       <div class="metrica">
         <span class="metrica-label">Valor total del contrato:</span>
         <span class="metrica-valor destacado-total">{{ formatCurrency(precioVentaTotal) }}</span>
       </div>
     </div>
   </div>

   <!-- Resto del template SIN CAMBIOS hasta el final -->
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
     
     <!-- Advertencia si hay precios por debajo del mínimo - SIN CAMBIOS -->
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

   <!-- Modal de Confirmación PDF - SIN CAMBIOS -->
   <ConfirmacionPDFModal
     :mostrar="mostrarModalConfirmacion"
     :servicios-seleccionados="serviciosSeleccionados"
     :meses-contrato="mesesContrato"
     :precio-total="precioSeleccionadoPDF === 'minimo' ? precioMinimoTotal : precioVentaTotal"
     :tipo-precio="precioSeleccionadoPDF"
     @cerrar="cerrarModalConfirmacion"
     @generar-pdf="onGenerarPDF"
     @guardar-cotizacion="onGuardarCotizacion"
     @limpiar-formulario="onLimpiarFormulario"
   />

   <!-- TOAST DE NOTIFICACIONES - SIN CAMBIOS -->
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
   mesesContrato: { // CAMBIO: de añosContrato a mesesContrato
     type: Number,
     default: 1
   }
 },
 emits: ['reiniciar', 'limpiar-formulario'],
 setup(props, { emit }) {
   // Estados reactivos - SIN CAMBIOS
   const precioSeleccionadoPDF = ref('venta')
   const mostrarModalConfirmacion = ref(false)
   const loading = ref(false)
   const loadingMessage = ref('')
   
   // TOAST SYSTEM - Estados - SIN CAMBIOs
   const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('success') // success, error, warning, info

  // MÉTODOS HELPER PARA MOSTRAR CATEGORÍAS CORRECTAMENTE - SIN CAMBIOS
  const obtenerUnidadesUnicasDelServicio = (item) => {
    if (!item.categoriasDetalle) return []
    
    const unidadesVistas = new Set()
    const unidades = []
    
    item.categoriasDetalle.forEach(categoria => {
      if (!unidadesVistas.has(categoria.unidad_nombre)) {
        unidades.push({
          id: categoria.id,
          nombre: categoria.unidad_nombre,
          tipo: categoria.unidad_tipo
        })
        unidadesVistas.add(categoria.unidad_nombre)
      }
    })
    
    return unidades
  }

  const obtenerCantidadesPorCategoria = (item) => {
    if (item.categoriasDetalle && item.categoriasDetalle.length > 0) {
      return item.categoriasDetalle
        .filter(cat => cat.cantidad > 0)
        .map(cat => ({
          id: cat.id,
          nombre: cat.unidad_nombre,
          abreviacion: cat.unidad_abreviacion,
          tipo: cat.unidad_tipo,
          cantidad: cat.cantidad
        }))
    }
    
    return []
  }

  const formatearCantidadCategoria = (categoria) => {
    switch (categoria.tipo) {
      case 'capacidad': {
        return `${categoria.cantidad} ${categoria.abreviacion || 'GB'}`
      }
      case 'usuarios': {
        return `${categoria.cantidad} usuarios`
      }
      case 'sesiones': {
        return `${categoria.cantidad} sesiones`
      }
      case 'tiempo': {
        return `${categoria.cantidad} ${categoria.abreviacion || 'h'}`
      }
      case 'cantidad':
      default: {
        return `${categoria.cantidad}`
      }
    }
  }

  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case 'capacidad':
        return 'fas fa-hdd'
      case 'usuarios':
        return 'fas fa-users'
      case 'sesiones':
        return 'fas fa-link'
      case 'tiempo':
        return 'fas fa-clock'
      case 'cantidad':
      default:
        return 'fas fa-boxes'
    }
  }

  // CAMBIO: Métodos de formateo de cálculos solo mensual
  const formatearCalculoMensual = (item) => {
    const categorias = obtenerCantidadesPorCategoria(item)
    const precio = item.precioVentaFinal || 0
    
    if (categorias.length > 0) {
      const descripcionCategorias = categorias.map(cat => {
        return formatearCantidadCategoria(cat)
      }).join(' + ')
      
      const totalUnidades = categorias.reduce((sum, cat) => sum + cat.cantidad, 0)
      
      return `${descripcionCategorias} × ${formatCurrency(precio)}/mes = ${formatCurrency(totalUnidades * precio)}/mes`
    }
    
    return formatearCalculoMensualTradicional(item)
  }

  const formatearCalculoTotal = (item) => {
    const costoMensual = calcularSubtotalMensual(item)
    const meses = props.mesesContrato // CAMBIO: usar meses
    
    if (meses > 1) {
      return `${formatCurrency(costoMensual)}/mes × ${meses} meses = ${formatCurrency(costoMensual * meses)}`
    } else {
      return `${formatCurrency(costoMensual)}/mes`
    }
  }

  // MÉTODOS TRADICIONALES COMO FALLBACK - SIN CAMBIOS
  const obtenerTipoUnidadTradicional = (item) => {
    return item.servicio.unidad_medida?.tipo || item.tipoUnidad || 'cantidad'
  }

  const obtenerIconoUnidadTradicional = (item) => {
    const tipo = obtenerTipoUnidadTradicional(item)
    return obtenerIconoTipo(tipo)
  }

  const obtenerEtiquetaPrincipalTradicional = (item) => {
    const tipo = obtenerTipoUnidadTradicional(item)
    const unidad = item.servicio.unidad_medida
    
    switch (tipo) {
      case 'capacidad': {
        return `Almacenamiento (${unidad?.abreviacion || 'GB'})`
      }
      case 'usuarios': {
        return 'Usuarios'
      }
      case 'sesiones': {
        return 'Sesiones Simultáneas'
      }
      case 'tiempo': {
        return `Tiempo (${unidad?.abreviacion || 'h'})`
      }
      case 'cantidad':
      default: {
        return 'Servidores'
      }
    }
  }

  const formatearCantidadPrincipalTradicional = (item) => {
    const tipo = obtenerTipoUnidadTradicional(item)
    const unidad = item.servicio.unidad_medida
    
    switch (tipo) {
      case 'capacidad': {
        const cantidadGB = item.cantidadGB || item.cantidadServidores || 0
        return `${cantidadGB} ${unidad?.abreviacion || 'GB'}`
      }
      case 'usuarios': {
        const cantidadUsuarios = item.cantidadUsuarios || item.cantidadServidores || 0
        return `${cantidadUsuarios} usuarios`
      }
      case 'sesiones': {
        const cantidadSesiones = item.cantidadSesiones || item.cantidadServidores || 0
        return `${cantidadSesiones} sesiones`
      }
      case 'tiempo': {
        const cantidadTiempo = item.cantidadTiempo || item.cantidadServidores || 0
        return `${cantidadTiempo} ${unidad?.abreviacion || 'h'}`
      }
      case 'cantidad':
      default: {
        return `${item.cantidadServidores || 0} servidores`
      }
    }
  }

  const formatearCalculoMensualTradicional = (item) => {
    const totalUnidadesItem = calcularTotalUnidades(item)
    const precio = item.precioVentaFinal || 0
    
    return `${totalUnidadesItem} unidad(es) × ${formatCurrency(precio)}/mes = ${formatCurrency(totalUnidadesItem * precio)}/mes`
  }

  const calcularTotalUnidades = (item) => {
    if (item.totalUnidadesParaPrecio) {
      return item.totalUnidadesParaPrecio
    }
    
    const categorias = obtenerCantidadesPorCategoria(item)
    if (categorias.length > 0) {
      return categorias.reduce((sum, cat) => sum + cat.cantidad, 0)
    }
    
    return (item.cantidadServidores || 0) + (item.cantidadEquipos || 0)
  }

  // CAMBIO: Métodos de cálculo solo mensual
  const calcularSubtotalMensual = (item) => {
    const totalUnidadesItem = calcularTotalUnidades(item)
    return totalUnidadesItem * (item.precioVentaFinal || 0) // Precio mensual
  }

  const calcularSubtotalTotal = (item) => {
    return calcularSubtotalMensual(item) * props.mesesContrato // × meses
  }

  const formatCurrency = (amount) => {
    const valor = amount || 0
    return `$${valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // COMPUTED PARA TOAST - SIN CAMBIOS
  const toastIcon = computed(() => {
    const iconos = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return iconos[toastType.value] || 'fas fa-info-circle';
  })

  // MÉTODOS DE TOAST - SIN CAMBIOS
  const mostrarToast = (mensaje, tipo = 'info') => {
    toastMessage.value = mensaje
    toastType.value = tipo
    showToast.value = true
    
    setTimeout(() => {
      hideToast()
    }, 5000)
  }

  const hideToast = () => {
    showToast.value = false
  }

  // COMPUTED PROPERTIES CORREGIDOS - SIN CAMBIOS HASTA LOS PRECIOS
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

  // Métricas dinámicas por tipo de unidad usando categorías - SIN CAMBIOS
  const metricasUnidades = computed(() => {
    const metricas = new Map()
    
    props.serviciosSeleccionados.forEach(item => {
      const categorias = obtenerCantidadesPorCategoria(item)
      
      if (categorias.length > 0) {
        categorias.forEach(categoria => {
          const tipoKey = categoria.tipo
          const actual = metricas.get(tipoKey) || { total: 0, unidad: categoria.abreviacion || 'unidades' }
          
          metricas.set(tipoKey, {
            tipo: tipoKey,
            label: `Total de ${categoria.nombre}`,
            valor: actual.total + categoria.cantidad,
            unidad: categoria.abreviacion || (categoria.tipo === 'usuarios' ? 'usuarios' : 'unidades')
          })
        })
      } else {
        // Fallback al método tradicional
        const tipo = obtenerTipoUnidadTradicional(item)
        const unidad = item.servicio.unidad_medida
        
        switch (tipo) {
          case 'capacidad': {
            const totalGB = (item.cantidadGB || item.cantidadServidores || 0)
            if (totalGB > 0) {
              const actual = metricas.get('capacidad') || { total: 0, unidad: 'GB' }
              metricas.set('capacidad', {
                tipo: 'capacidad',
                label: 'Total de Almacenamiento',
                valor: actual.total + totalGB,
                unidad: unidad?.abreviacion || 'GB'
              })
            }
            break
          }
          case 'usuarios': {
            const totalUsuarios = (item.cantidadUsuarios || item.cantidadServidores || 0)
            if (totalUsuarios > 0) {
              const actual = metricas.get('usuarios') || { total: 0, unidad: 'usuarios' }
              metricas.set('usuarios', {
                tipo: 'usuarios',
                label: 'Total de Usuarios',
                valor: actual.total + totalUsuarios,
                unidad: 'usuarios'
              })
            }
            break
          }
          case 'sesiones': {
            const totalSesiones = (item.cantidadSesiones || item.cantidadServidores || 0)
            if (totalSesiones > 0) {
              const actual = metricas.get('sesiones') || { total: 0, unidad: 'sesiones' }
              metricas.set('sesiones', {
                tipo: 'sesiones',
                label: 'Total de Sesiones',
                valor: actual.total + totalSesiones,
                unidad: 'sesiones'
              })
            }
            break
          }
          case 'tiempo': {
            const totalTiempo = (item.cantidadTiempo || item.cantidadServidores || 0)
            if (totalTiempo > 0) {
              const actual = metricas.get('tiempo') || { total: 0, unidad: 'h' }
              metricas.set('tiempo', {
                tipo: 'tiempo',
                label: 'Total de Tiempo',
                valor: actual.total + totalTiempo,
                unidad: unidad?.abreviacion || 'h'
              })
            }
            break
          }
          case 'cantidad':
          default: {
            const servidores = item.cantidadServidores || 0
            const equipos = item.cantidadEquipos || 0
            
            if (servidores > 0) {
              const actualServidores = metricas.get('servidores') || { total: 0, unidad: 'unidades' }
              metricas.set('servidores', {
                tipo: 'servidores',
                label: 'Total de Servidores',
                valor: actualServidores.total + servidores,
                unidad: 'unidades'
              })
            }
            
            if (equipos > 0) {
              const actualEquipos = metricas.get('equipos') || { total: 0, unidad: 'unidades' }
              metricas.set('equipos', {
                tipo: 'equipos',
                label: 'Total de Equipos',
                valor: actualEquipos.total + equipos,
                unidad: 'unidades'
              })
            }
            break
          }
        }
      }
    })
    
    return Array.from(metricas.values())
  })

  // CAMBIO: Computed para precios solo mensual
  const precioMinimoMensual = computed(() => {
    return props.serviciosSeleccionados.reduce((total, item) => {
      const totalUnidadesItem = calcularTotalUnidades(item)
      return total + (totalUnidadesItem * (item.servicio.precioMinimo || item.servicio.precio_minimo || 0))
    }, 0)
  })

  const precioVentaMensual = computed(() => {
    return props.serviciosSeleccionados.reduce((total, item) => {
      return total + calcularSubtotalMensual(item)
    }, 0)
  })

  // CAMBIO: Computed para totales del contrato (mensual × meses)
  const precioMinimoTotal = computed(() => {
    return precioMinimoMensual.value * props.mesesContrato
  })

  const precioVentaTotal = computed(() => {
    return precioVentaMensual.value * props.mesesContrato
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
      const totalUnidadesItem = calcularTotalUnidades(item)
      const precioMinimo = item.servicio.precioMinimo || item.servicio.precio_minimo || 0
      return totalUnidadesItem > 0 && item.precioVentaFinal < precioMinimo
    })
  })

  // Resto de métodos SIN CAMBIOS
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

  // CAMBIO: Métodos de generación usando meses
  const onGenerarPDF = async (datosParaPDF) => {
    try {
      loading.value = true
      loadingMessage.value = 'Generando PDF...'
      
      mostrarToast('Iniciando generación de PDF...', 'info')

      const cotizacionData = crearcotizacionService.formatCotizacionParaFormulario(
        props.serviciosSeleccionados,
        datosParaPDF.cliente,
        props.mesesContrato, // CAMBIO: usar meses
        datosParaPDF.tipoPrecio,
        datosParaPDF.configuracionPDF,
        datosParaPDF.comentario || ''
      )

      const resultado = await crearcotizacionService.createCotizacion(cotizacionData)

      if (!resultado.success) {
        throw new Error(resultado.message || 'Error al crear la cotización')
      }

      const cotizacionCreada = resultado.cotizacion

      mostrarToast('Cotización creada, generando PDF...', 'info')
      
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
        props.serviciosSeleccionados,
        datosCotizacion.cliente,
        props.mesesContrato, // CAMBIO: usar meses
        datosCotizacion.tipoPrecio,
        datosCotizacion.configuracionPDF,
        datosCotizacion.comentario || ''
      )

      const resultado = await crearcotizacionService.createCotizacion(cotizacionData)

      if (!resultado.success) {
        throw new Error(resultado.message || 'Error al guardar la cotización')
      }

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
    
    // TOAST STATES
    showToast,
    toastMessage,
    toastType,
    
    // Computed
    mostrarResultados,
    fechaActual,
    metricasUnidades,
    
    // CAMBIO: Computed mensuales
    precioMinimoMensual,
    precioVentaMensual,
    
    // CAMBIO: Computed totales
    precioMinimoTotal,
    precioVentaTotal,
    gananciaPotencial,
    porcentajeMargenMinimo,
    hayPreciosPorDebajoMinimo,
    toastIcon,
    
    // MÉTODOS HELPER PARA CATEGORÍAS
    obtenerUnidadesUnicasDelServicio,
    obtenerCantidadesPorCategoria,
    formatearCantidadCategoria,
    obtenerIconoTipo,
    
    // CAMBIO: Métodos de formateo de cálculos
    formatearCalculoMensual,
    formatearCalculoTotal,
    
    // MÉTODOS TRADICIONALES COMO FALLBACK
    obtenerTipoUnidadTradicional,
    obtenerIconoUnidadTradicional,
    obtenerEtiquetaPrincipalTradicional,
    formatearCantidadPrincipalTradicional,
    formatearCalculoMensualTradicional,
    calcularTotalUnidades,
    
    // CAMBIO: Métodos de cálculo corregidos
    calcularSubtotalMensual,
    calcularSubtotalTotal,
    
    // Métodos existentes
    formatCurrency,
    reiniciar,
    onLimpiarFormulario,
    cerrarModalConfirmacion,
    exportarPDF,
    onGenerarPDF,
    onGuardarCotizacion,
    
    // TOAST METHODS
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

/* ✅ NUEVO: Estilos para mostrar múltiples unidades */
.unidades-badges {
margin-bottom: 0.75rem;
display: flex;
flex-wrap: wrap;
gap: 0.25rem;
}

.unidad-badge {
display: inline-flex;
align-items: center;
gap: 0.25rem;
padding: 0.2rem 0.4rem;
border-radius: 10px;
font-size: 0.65rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.3px;
}

.unidad-badge.tipo-capacidad {
background: linear-gradient(135deg, #e3f2fd, #bbdefb);
color: #1565c0;
border: 1px solid #90caf9;
}

.unidad-badge.tipo-usuarios {
background: linear-gradient(135deg, #f3e5f5, #e1bee7);
color: #7b1fa2;
border: 1px solid #ce93d8;
}

.unidad-badge.tipo-sesiones {
background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
color: #2e7d32;
border: 1px solid #a5d6a7;
}

.unidad-badge.tipo-tiempo {
background: linear-gradient(135deg, #fff3e0, #ffe0b2);
color: #ef6c00;
border: 1px solid #ffcc02;
}

.unidad-badge.tipo-cantidad {
background: linear-gradient(135deg, #f8f9fa, #e9ecef);
color: #495057;
border: 1px solid #ced4da;
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

/* ✅ NUEVO: Estilos para cantidades detalladas por categoría */
.cantidades-detalladas {
background: linear-gradient(135deg, #f0f8f0, #e8f5e8);
padding: 0.75rem;
border-radius: 8px;
margin-bottom: 0.75rem;
border-left: 3px solid #28a745;
border: 1px solid #c3e6cb;
}

.cantidades-header {
display: flex;
align-items: center;
gap: 0.5rem;
margin-bottom: 0.75rem;
font-size: clamp(0.8rem, 2vw, 0.9rem);
color: #155724;
font-weight: 600;
}

.cantidades-header i {
color: #28a745;
font-size: 0.9em;
}

.cantidades-lista {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 0.5rem;
}

.cantidad-categoria {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.5rem 0.75rem;
background: white;
border-radius: 6px;
border: 1px solid #c3e6cb;
transition: all 0.2s ease;
}

.cantidad-categoria:hover {
box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
border-color: #28a745;
}

/* ✅ NUEVO: Estilos específicos por tipo para categorías */
.cantidad-categoria.tipo-capacidad {
border-color: #90caf9;
background: linear-gradient(135deg, #ffffff, #f8fdff);
}

.cantidad-categoria.tipo-capacidad:hover {
border-color: #1565c0;
}

.cantidad-categoria.tipo-usuarios {
border-color: #ce93d8;
background: linear-gradient(135deg, #ffffff, #fdf8ff);
}

.cantidad-categoria.tipo-usuarios:hover {
border-color: #7b1fa2;
}

.cantidad-categoria.tipo-sesiones {
border-color: #a5d6a7;
background: linear-gradient(135deg, #ffffff, #f9fff9);
}

.cantidad-categoria.tipo-sesiones:hover {
border-color: #2e7d32;
}

.cantidad-categoria.tipo-tiempo {
border-color: #ffcc02;
background: linear-gradient(135deg, #ffffff, #fffef8);
}

.cantidad-categoria.tipo-tiempo:hover {
border-color: #ef6c00;
}

.categoria-label {
font-size: clamp(0.75rem, 2vw, 0.85rem);
font-weight: 600;
color: #495057;
display: flex;
align-items: center;
gap: 0.35rem;
}

.cantidad-categoria.tipo-capacidad .categoria-label {
color: #1565c0;
}

.cantidad-categoria.tipo-usuarios .categoria-label {
color: #7b1fa2;
}

.cantidad-categoria.tipo-sesiones .categoria-label {
color: #2e7d32;
}

.cantidad-categoria.tipo-tiempo .categoria-label {
color: #ef6c00;
}

.categoria-valor {
font-size: clamp(0.8rem, 2vw, 0.9rem);
font-weight: 700;
color: #495057;
background: rgba(255, 255, 255, 0.8);
padding: 0.25rem 0.5rem;
border-radius: 4px;
border: 1px solid #dee2e6;
}

/* ✅ ESTILOS TRADICIONALES COMO FALLBACK */
.cantidades-info-tradicional {
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

.cantidades-info-tradicional.tipo-capacidad {
background: linear-gradient(135deg, #e3f2fd, #f0f4ff);
border-left-color: #1565c0;
border-color: #bbdefb;
}

.cantidades-info-tradicional.tipo-usuarios {
background: linear-gradient(135deg, #f3e5f5, #fce4ec);
border-left-color: #7b1fa2;
border-color: #e1bee7;
}

.cantidades-info-tradicional.tipo-sesiones {
background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
border-left-color: #2e7d32;
border-color: #c8e6c9;
}

.cantidades-info-tradicional.tipo-tiempo {
background: linear-gradient(135deg, #fff3e0, #fdf2e5);
border-left-color: #ef6c00;
border-color: #ffe0b2;
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

.cantidades-info-tradicional.tipo-capacidad .cantidad-label {
color: #1565c0;
}

.cantidades-info-tradicional.tipo-usuarios .cantidad-label {
color: #7b1fa2;
}

.cantidades-info-tradicional.tipo-sesiones .cantidad-label {
color: #2e7d32;
}

.cantidades-info-tradicional.tipo-tiempo .cantidad-label {
color: #ef6c00;
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

.principal-item .principal-valor {
font-size: clamp(0.9rem, 2.2vw, 1rem);
font-weight: 800;
padding: 0.35rem 0.75rem;
}

.cantidades-info-tradicional.tipo-capacidad .principal-valor {
border-color: #1565c0;
color: #1565c0;
}

.cantidades-info-tradicional.tipo-usuarios .principal-valor {
border-color: #7b1fa2;
color: #7b1fa2;
}

.cantidades-info-tradicional.tipo-sesiones .principal-valor {
border-color: #2e7d32;
color: #2e7d32;
}

.cantidades-info-tradicional.tipo-tiempo .principal-valor {
border-color: #ef6c00;
color: #ef6c00;
}

.equipos-valor {
border-color: #6c757d;
color: #495057;
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
@media (max-width: 768px) {
.cantidades-lista {
 grid-template-columns: 1fr;
}

.cantidad-categoria {
 padding: 0.4rem 0.6rem;
}

.categoria-label {
 font-size: 0.7rem;
}

.categoria-valor {
 font-size: 0.75rem;
 padding: 0.2rem 0.4rem;
}

.unidades-badges {
 justify-content: center;
}

.cantidades-detalladas {
 padding: 0.5rem;
}

.cantidades-header {
 flex-direction: column;
 align-items: flex-start;
 gap: 0.25rem;
 margin-bottom: 0.5rem;
}
}

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

.cantidades-lista {
 gap: 0.75rem;
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

.cantidades-lista {
 grid-template-columns: repeat(2, 1fr);
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

.cantidades-lista {
 grid-template-columns: repeat(3, 1fr);
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

.cantidades-lista {
 grid-template-columns: 1fr;
 gap: 0.4rem;
}

.unidad-badge {
 font-size: 0.55rem;
 padding: 0.15rem 0.3rem;
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