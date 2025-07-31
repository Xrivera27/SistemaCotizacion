// services/crearcotizacion.js - ACTUALIZADO CON CÁLCULOS MENSUALES
import api from './api';

class CrearCotizacionService {
  
  // Crear nueva cotización - SIN CAMBIOS
  async createCotizacion(cotizacionData) {
    try {
      
      const response = await api.post('/cotizaciones-vendedor', cotizacionData);
      
      if (response.data.success) {
        return {
          success: true,
          cotizacion: response.data.data.cotizacion,
          requiere_aprobacion: response.data.data.requiere_aprobacion,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error creando cotización'
      };
      
    } catch (error) {
      console.error('❌ Error creando cotización:', error);
      
      if (error.response?.data?.errors) {
        return {
          success: false,
          message: error.response.data.message,
          errors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // RESTO DE MÉTODOS SIN CAMBIOS HASTA formatCotizacionParaFormulario...
  
  // Obtener mis cotizaciones con paginación y filtros - SIN CAMBIOS
  async getCotizaciones(params = {}) {
    try {
      
      const response = await api.get('/cotizaciones-vendedor', { params });
      
      if (response.data.success) {
        return {
          success: true,
          cotizaciones: response.data.data.cotizaciones,
          pagination: response.data.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo cotizaciones'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo cotizaciones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Resto de métodos sin cambios hasta formatCotizacionParaFormulario...
  
  // CAMBIO COMPLETO: Helper para formatear datos de cotización CON CÁLCULOS MENSUALES
  formatCotizacionParaFormulario(serviciosSeleccionados, cliente, mesesContrato, tipoPrecio, configuracionPDF, comentario) {

    
    // FORMATEAR SERVICIOS CON CATEGORÍAS DETALLADAS - SIN CAMBIOS
    const serviciosFormateados = serviciosSeleccionados.map(item => {
      
      if (item.categoriasDetalle && item.categoriasDetalle.length > 0) {
        
        return {
          servicio: {
            servicios_id: item.servicio.servicios_id || item.servicio.id,
            nombre: item.servicio.nombre,
            categoria: item.servicio.categoria,
            precioMinimo: item.servicio.precioMinimo || item.servicio.precio_minimo
          },
          precioVentaFinal: item.precioVentaFinal,
          categoriasDetalle: item.categoriasDetalle.map(cat => ({
            id: cat.id,
            nombre: cat.nombre,
            unidad_id: cat.unidad_id,
            unidad_nombre: cat.unidad_nombre,
            unidad_tipo: cat.unidad_tipo,
            unidad_abreviacion: cat.unidad_abreviacion,
            cantidad: cat.cantidad || 0
          }))
        };
      } else {
        
        return {
          servicio: {
            servicios_id: item.servicio.servicios_id || item.servicio.id,
            nombre: item.servicio.nombre,
            categoria: item.servicio.categoria,
            precioMinimo: item.servicio.precioMinimo || item.servicio.precio_minimo
          },
          precioVentaFinal: item.precioVentaFinal,
          cantidadServidores: item.cantidadServidores || 0,
          cantidadEquipos: item.cantidadEquipos || 0,
          cantidadGB: item.cantidadGB || 0,
          cantidadUsuarios: item.cantidadUsuarios || 0,
          cantidadSesiones: item.cantidadSesiones || 0,
          cantidadTiempo: item.cantidadTiempo || 0
        };
      }
    });
    
    
    // CAMBIO: CALCULAR PRECIO TOTAL CORREGIDO: MENSUAL × MESES
    const precioTotal = serviciosSeleccionados.reduce((total, item) => {
      if (item.categoriasDetalle && item.categoriasDetalle.length > 0) {
        // Usar categorías detalladas
        const totalCategorias = item.categoriasDetalle.reduce((subtotal, cat) => {
          // CAMBIO: precio mensual × cantidad × meses (no × 12)
          const costoMensual = cat.cantidad * item.precioVentaFinal;
          const costoTotal = costoMensual * mesesContrato;
          return subtotal + costoTotal;
        }, 0);
        return total + totalCategorias;
      } else {
        // Usar método tradicional
        const cantidadTotal = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0) + 
                             (item.cantidadGB || 0) + (item.cantidadUsuarios || 0) + 
                             (item.cantidadSesiones || 0) + (item.cantidadTiempo || 0);
        // CAMBIO: precio mensual × cantidad × meses (no × 12)                     
        const costoMensual = item.precioVentaFinal * cantidadTotal;
        const costoTotal = costoMensual * mesesContrato;
        return total + costoTotal;
      }
    }, 0);
    
    const cotizacionData = {
      cliente,
      servicios: serviciosFormateados,
      mesesContrato, // CAMBIO: usar meses en lugar de años
      precioTotal,
      tipoPrecio,
      configuracionPDF: configuracionPDF || {
        incluirNombreEncargado: true,
        incluirNombreEmpresa: true,
        incluirDocumentoFiscal: false,
        incluirTelefonoEmpresa: false,
        incluirCorreoEmpresa: true
      },
      comentario: comentario || ''
    };
    
    console.log('📦 DATOS FINALES PARA BACKEND:', cotizacionData);
    return cotizacionData;
  }
  
  // RESTO DE MÉTODOS SIN CAMBIOS...
  
  // Helper para validar datos antes de enviar
  validateCotizacionData(data) {
    const errors = [];
    
    // Validar cliente - SIN CAMBIOS
    if (!data.cliente) {
      errors.push('Cliente es requerido');
    } else {
      if (!data.cliente.nombreEncargado) errors.push('Nombre del encargado es requerido');
      if (!data.cliente.nombreEmpresa) errors.push('Nombre de la empresa es requerido');
      if (!data.cliente.documentofiscal) errors.push('Documento fiscal es requerido');
    }
    
    // Validar servicios - SIN CAMBIOS
    if (!data.servicios || data.servicios.length === 0) {
      errors.push('Debe incluir al menos un servicio');
    } else {
      data.servicios.forEach((servicio, index) => {
        if (!servicio.servicio?.servicios_id && !servicio.servicio?.id) {
          errors.push(`Servicio ${index + 1}: ID requerido`);
        }
        if (!servicio.precioVentaFinal || servicio.precioVentaFinal <= 0) {
         errors.push(`Servicio ${index + 1}: Precio de venta requerido`);
       }
       
       // NUEVA VALIDACIÓN: Verificar categorías o cantidades tradicionales
       if (servicio.categoriasDetalle && servicio.categoriasDetalle.length > 0) {
         const tieneCantidades = servicio.categoriasDetalle.some(cat => cat.cantidad > 0);
         if (!tieneCantidades) {
           errors.push(`Servicio ${index + 1}: Debe tener al menos una cantidad mayor a 0`);
         }
       } else {
         // Validar cantidades tradicionales
         const cantidadTotal = (servicio.cantidadServidores || 0) + (servicio.cantidadEquipos || 0) + 
                              (servicio.cantidadGB || 0) + (servicio.cantidadUsuarios || 0) + 
                              (servicio.cantidadSesiones || 0) + (servicio.cantidadTiempo || 0);
         if (cantidadTotal === 0) {
           errors.push(`Servicio ${index + 1}: Debe tener al menos una cantidad mayor a 0`);
         }
       }
     });
   }
   
   // CAMBIO: Validar meses de contrato
   if (!data.mesesContrato || data.mesesContrato < 1) {
     errors.push('Meses de contrato debe ser mayor a 0');
   }
   
   // Validar precio total - SIN CAMBIOS
   if (!data.precioTotal || data.precioTotal <= 0) {
     errors.push('Precio total debe ser mayor a 0');
   }
   
   return {
     isValid: errors.length === 0,
     errors
   };
 }
 
 // Helper para obtener estados de cotización - SIN CAMBIOS
 getEstados() {
   return [
     { value: 'pendiente', label: 'Pendiente', color: 'warning', icon: 'clock' },
     { value: 'pendiente_aprobacion', label: 'Pendiente Aprobación', color: 'info', icon: 'hourglass-half' },
     { value: 'efectiva', label: 'Aprobada', color: 'success', icon: 'check-circle' },
     { value: 'rechazada', label: 'Rechazada', color: 'danger', icon: 'times-circle' }
   ];
 }
 
 // Helper para formatear cotización para mostrar - SIN CAMBIOS
 formatCotizacionDisplay(cotizacion) {
   if (!cotizacion) return null;
   
   const estados = this.getEstados();
   const estado = estados.find(e => e.value === cotizacion.estado);
   
   return {
     ...cotizacion,
     estado_label: estado?.label || cotizacion.estado,
     estado_color: estado?.color || 'secondary',
     estado_icon: estado?.icon || 'file',
     fecha_creacion: this.formatDate(cotizacion.fecha_creacion),
     fecha_actualizacion: this.formatDate(cotizacion.updated_at),
     total_formateado: this.formatCurrency(cotizacion.total),
     vendedor_nombre: cotizacion.vendedor?.nombre_completo || 'Sin asignar',
     cliente_nombre: cotizacion.cliente?.nombre_empresa || 'Sin cliente'
   };
 }
 
 // Helper para formatear fechas - SIN CAMBIOS
 formatDate(dateString) {
   if (!dateString) return '';
   
   try {
     const date = new Date(dateString);
     return date.toLocaleDateString('es-ES', {
       year: 'numeric',
       month: 'short',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     });
   } catch (error) {
     return dateString;
   }
 }
 
 // Helper para formatear moneda - SIN CAMBIOS
 formatCurrency(amount) {
   if (typeof amount !== 'number') return '$0.00';
   
   return new Intl.NumberFormat('es-HN', {
     style: 'currency',
     currency: 'HNL',
     minimumFractionDigits: 2
   }).format(amount);
 }
 
 // RESTO DE MÉTODOS SIN CAMBIOS...
 async getCotizacionById(id) {
   try {
     
     const response = await api.get(`/cotizaciones-vendedor/${id}`);
     
     if (response.data.success) {
       return {
         success: true,
         cotizacion: response.data.data.cotizacion
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Cotización no encontrada'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo cotización:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 async getEstadisticas() {
   try {
     
     const response = await api.get('/cotizaciones-vendedor/estadisticas');
     
     if (response.data.success) {
       return {
         success: true,
         estadisticas: response.data.data.estadisticas
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo estadísticas'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo estadísticas:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 async marcarPDFGenerado(cotizacionId) {
   try {
     
     const response = await api.put(`/cotizaciones-vendedor/${cotizacionId}/pdf`);
     
     if (response.data.success) {
       return {
         success: true,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error marcando PDF'
     };
     
   } catch (error) {
     console.error('❌ Error marcando PDF:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 async duplicarCotizacion(cotizacionId) {
   try {
     
     const response = await api.post(`/cotizaciones-vendedor/${cotizacionId}/duplicar`);
     
     if (response.data.success) {
       return {
         success: true,
         cotizacion: response.data.data.cotizacion,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error duplicando cotización'
     };
     
   } catch (error) {
     console.error('❌ Error duplicando cotización:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 async generarPDF(cotizacionId) {
   try {
     
     const response = await api.get(`/pdf/cotizacion/${cotizacionId}`, {
       responseType: 'blob'
     });
     
     const blob = new Blob([response.data], { type: 'application/pdf' });
     const url = window.URL.createObjectURL(blob);
     
     const link = document.createElement('a');
     link.href = url;
     link.download = `Cotizacion_${cotizacionId}_${new Date().getTime()}.pdf`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     
     window.URL.revokeObjectURL(url);
     
     
     return {
       success: true,
       message: 'PDF generado exitosamente'
     };
     
   } catch (error) {
     console.error('❌ Error generando PDF:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error generando PDF'
     };
   }
 }
 
 async previewPDF(cotizacionId) {
   try {
     
     const response = await api.get(`/pdf/cotizacion/${cotizacionId}/preview`, {
       responseType: 'blob'
     });
     
     const blob = new Blob([response.data], { type: 'application/pdf' });
     const url = window.URL.createObjectURL(blob);
     
     window.open(url, '_blank');
     
     setTimeout(() => {
       window.URL.revokeObjectURL(url);
     }, 10000);
     
     
     return {
       success: true,
       message: 'Preview abierto exitosamente'
     };
     
   } catch (error) {
     console.error('❌ Error generando preview:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error generando preview'
     };
   }
 }
}

// Exportar instancia única
export default new CrearCotizacionService();