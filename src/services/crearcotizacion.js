// services/crearcotizacion.js
import api from './api';

class CrearCotizacionService {
  
  // Crear nueva cotización
  async createCotizacion(cotizacionData) {
    try {
      console.log('💰 Creando cotización:', cotizacionData);
      
      const response = await api.post('/cotizaciones-vendedor', cotizacionData);
      
      if (response.data.success) {
        console.log('✅ Cotización creada exitosamente:', response.data.data);
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
  
  // Obtener mis cotizaciones con paginación y filtros
  async getCotizaciones(params = {}) {
    try {
      console.log('📋 Obteniendo cotizaciones con parámetros:', params);
      
      const response = await api.get('/cotizaciones-vendedor', { params });
      
      if (response.data.success) {
        console.log('✅ Cotizaciones obtenidas:', response.data.data);
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
  
  // Obtener cotización por ID
  async getCotizacionById(id) {
    try {
      console.log('💰 Obteniendo cotización ID:', id);
      
      const response = await api.get(`/cotizaciones-vendedor/${id}`);
      
      if (response.data.success) {
        console.log('✅ Cotización obtenida:', response.data.data.cotizacion);
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
  
  // Obtener estadísticas de mis cotizaciones
  async getEstadisticas() {
    try {
      console.log('📊 Obteniendo estadísticas de cotizaciones...');
      
      const response = await api.get('/cotizaciones-vendedor/estadisticas');
      
      if (response.data.success) {
        console.log('✅ Estadísticas obtenidas:', response.data.data.estadisticas);
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
  
  // Marcar PDF como generado
  async marcarPDFGenerado(cotizacionId) {
    try {
      console.log('📄 Marcando PDF como generado para cotización:', cotizacionId);
      
      const response = await api.put(`/cotizaciones-vendedor/${cotizacionId}/pdf`);
      
      if (response.data.success) {
        console.log('✅ PDF marcado como generado');
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
  
  // Duplicar cotización
  async duplicarCotizacion(cotizacionId) {
    try {
      console.log('📋 Duplicando cotización:', cotizacionId);
      
      const response = await api.post(`/cotizaciones-vendedor/${cotizacionId}/duplicar`);
      
      if (response.data.success) {
        console.log('✅ Cotización duplicada exitosamente:', response.data.data.cotizacion);
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
  
  // Generar PDF de cotización (descarga)
  async generarPDF(cotizacionId) {
    try {
      console.log('📄 Generando PDF para cotización:', cotizacionId);
      
      const response = await api.get(`/pdf/cotizacion/${cotizacionId}`, {
        responseType: 'blob' // Importante para archivos
      });
      
      // Crear URL para descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cotizacion_${cotizacionId}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF generado y descargado exitosamente');
      
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
  
  // Vista previa del PDF (abrir en nueva ventana)
  async previewPDF(cotizacionId) {
    try {
      console.log('👁️ Generando preview de PDF para cotización:', cotizacionId);
      
      const response = await api.get(`/pdf/cotizacion/${cotizacionId}/preview`, {
        responseType: 'blob'
      });
      
      // Crear URL para mostrar el PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva ventana
      window.open(url, '_blank');
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
      
      console.log('✅ Preview de PDF abierto exitosamente');
      
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
  
  // Helper para formatear datos de cotización para el formulario
  formatCotizacionParaFormulario(serviciosSeleccionados, cliente, añosContrato, tipoPrecio, configuracionPDF, comentario) {
    console.log('📝 Formateando datos para envío:', {
      serviciosSeleccionados,
      cliente,
      añosContrato,
      tipoPrecio
    });
    
    // Calcular precio total
    const precioTotal = serviciosSeleccionados.reduce((total, item) => {
      const cantidadTotal = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
      return total + (item.precioVentaFinal * cantidadTotal * añosContrato);
    }, 0);
    
    // Formatear servicios para el backend
    const serviciosFormateados = serviciosSeleccionados.map(item => ({
      servicio: {
        servicios_id: item.servicio.servicios_id || item.servicio.id,
        nombre: item.servicio.nombre,
        categoria: item.servicio.categoria,
        precioMinimo: item.servicio.precioMinimo || item.servicio.precio_minimo
      },
      cantidadServidores: item.cantidadServidores || 0,
      cantidadEquipos: item.cantidadEquipos || 0,
      precioVentaFinal: item.precioVentaFinal
    }));
    
    const cotizacionData = {
      cliente,
      servicios: serviciosFormateados,
      añosContrato,
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
    
    console.log('✅ Datos formateados:', cotizacionData);
    return cotizacionData;
  }
  
  // Helper para obtener estados de cotización
  getEstados() {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'warning', icon: 'clock' },
      { value: 'pendiente_aprobacion', label: 'Pendiente Aprobación', color: 'info', icon: 'hourglass-half' },
      { value: 'efectiva', label: 'Aprobada', color: 'success', icon: 'check-circle' },
      { value: 'rechazada', label: 'Rechazada', color: 'danger', icon: 'times-circle' }
    ];
  }
  
  // Helper para formatear cotización para mostrar
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
  
  // Helper para formatear fechas
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
  
  // Helper para formatear moneda
  formatCurrency(amount) {
    if (typeof amount !== 'number') return '$0.00';
    
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(amount);
  }
  
  // Helper para validar datos antes de enviar
  validateCotizacionData(data) {
    const errors = [];
    
    // Validar cliente
    if (!data.cliente) {
      errors.push('Cliente es requerido');
    } else {
      if (!data.cliente.nombreEncargado) errors.push('Nombre del encargado es requerido');
      if (!data.cliente.nombreEmpresa) errors.push('Nombre de la empresa es requerido');
      if (!data.cliente.documentofiscal) errors.push('Documento fiscal es requerido');
    }
    
    // Validar servicios
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
      });
    }
    
    // Validar años de contrato
    if (!data.añosContrato || data.añosContrato < 1 || data.añosContrato > 10) {
      errors.push('Años de contrato debe estar entre 1 y 10');
    }
    
    // Validar precio total
    if (!data.precioTotal || data.precioTotal <= 0) {
      errors.push('Precio total debe ser mayor a 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exportar instancia única
export default new CrearCotizacionService();