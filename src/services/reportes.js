// services/reportes.js
import api from './api';

class ReportesService {
  
  // ===== CONFIGURACIÓN Y OPCIONES =====
  
  // Obtener tipos de reporte disponibles
  async getTiposReporte() {
    try {
      console.log('📋 Obteniendo tipos de reporte...');
      
      const response = await api.get('/reportes/tipos');
      
      if (response.data.success) {
        console.log('✅ Tipos de reporte obtenidos:', response.data.data);
        return {
          success: true,
          tipos: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo tipos de reporte'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo tipos de reporte:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Obtener opciones para filtros (vendedores, servicios, clientes)
  async getOpcionesReporte() {
    try {
      console.log('🔧 Obteniendo opciones de reporte...');
      
      const response = await api.get('/reportes/opciones');
      
      if (response.data.success) {
        console.log('✅ Opciones de reporte obtenidas:', response.data.data);
        return {
          success: true,
          opciones: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo opciones de reporte'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo opciones de reporte:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // ===== GENERACIÓN DE REPORTES =====

  // Generar reporte dinámico (POST)
  async generarReporte(tipo, filtros = {}) {
    try {
      console.log('📊 Generando reporte:', tipo, 'con filtros:', filtros);
      
      const response = await api.post('/reportes/generar', {
        tipo,
        filtros
      });
      
      if (response.data.success) {
        console.log('✅ Reporte generado exitosamente:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error generando reporte'
      };
      
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Exportar reporte
  async exportarReporte(tipo, formato = 'pdf', filtros = {}, datos = {}) {
    try {
      console.log('📤 Exportando reporte:', tipo, 'formato:', formato);
      
      const response = await api.post('/reportes/exportar', {
        tipo,
        formato,
        filtros,
        datos
      });
      
      if (response.data.success) {
        console.log('✅ Reporte exportado exitosamente:', response.data.data);
        return {
          success: true,
          archivo: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error exportando reporte'
      };
      
    } catch (error) {
      console.error('❌ Error exportando reporte:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // ===== REPORTES ESPECÍFICOS =====

  // Reporte de Cotizaciones
  async getReporteCotizaciones(filtros = {}) {
    try {
      console.log('📊 Obteniendo reporte de cotizaciones con filtros:', filtros);
      
      const params = this.construirParametros(filtros);
      const response = await api.get('/reportes/cotizaciones', { params });
      
      if (response.data.success) {
        console.log('✅ Reporte de cotizaciones obtenido:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo reporte de cotizaciones'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de cotizaciones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Reporte de Vendedores
  async getReporteVendedores(filtros = {}) {
    try {
      console.log('👥 Obteniendo reporte de vendedores con filtros:', filtros);
      
      const params = this.construirParametros(filtros);
      const response = await api.get('/reportes/vendedores', { params });
      
      if (response.data.success) {
        console.log('✅ Reporte de vendedores obtenido:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo reporte de vendedores'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de vendedores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Reporte de Servicios
  async getReporteServicios(filtros = {}) {
    try {
      console.log('🔧 Obteniendo reporte de servicios con filtros:', filtros);
      
      const params = this.construirParametros(filtros);
      const response = await api.get('/reportes/servicios', { params });
      
      if (response.data.success) {
        console.log('✅ Reporte de servicios obtenido:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo reporte de servicios'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de servicios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Reporte de Clientes
  async getReporteClientes(filtros = {}) {
    try {
      console.log('🏢 Obteniendo reporte de clientes con filtros:', filtros);
      
      const params = this.construirParametros(filtros);
      const response = await api.get('/reportes/clientes', { params });
      
      if (response.data.success) {
        console.log('✅ Reporte de clientes obtenido:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo reporte de clientes'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de clientes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Reporte Financiero
  async getReporteFinanciero(filtros = {}) {
    try {
      console.log('💰 Obteniendo reporte financiero con filtros:', filtros);
      
      const params = this.construirParametros(filtros);
      const response = await api.get('/reportes/financiero', { params });
      
      if (response.data.success) {
        console.log('✅ Reporte financiero obtenido:', response.data.data);
        return {
          success: true,
          reporte: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo reporte financiero'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte financiero:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  // Construir parámetros de query desde objeto filtros
 // En services/reportes.js - REEMPLAZAR el método construirParametros:

construirParametros(filtros) {
  const params = {};
  
  // Filtros comunes
  if (filtros.periodo) params.periodo = filtros.periodo;
  if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
  if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
  
  // ✅ CORRECCIÓN: Cambiar estas validaciones para ser más estrictas
  if (filtros.vendedor && filtros.vendedor !== '' && filtros.vendedor !== null && filtros.vendedor !== undefined) {
    params.vendedor = filtros.vendedor;
  }
  
  if (filtros.servicio && filtros.servicio !== '' && filtros.servicio !== null && filtros.servicio !== undefined) {
    params.servicio = filtros.servicio;
  }
  
  if (filtros.cliente && filtros.cliente !== '' && filtros.cliente !== null && filtros.cliente !== undefined) {
    params.cliente = filtros.cliente;
  }
  
  if (filtros.categoria && filtros.categoria !== '' && filtros.categoria !== null && filtros.categoria !== undefined) {
    params.categoria = filtros.categoria;
  }
  
  if (filtros.estado && filtros.estado !== '' && filtros.estado !== null && filtros.estado !== undefined) {
    params.estado = filtros.estado;
  }
  
  if (filtros.agrupacion) params.agrupacion = filtros.agrupacion;
  
  console.log('🔧 Parámetros construidos:', params);
  console.log('🔧 Filtros originales:', filtros);
  return params;
}

  // Validar filtros antes de enviar
  validarFiltros(filtros) {
    const errores = [];

    // Validar período personalizado
    if (filtros.periodo === 'custom') {
      if (!filtros.fechaInicio) {
        errores.push('Fecha de inicio es requerida para período personalizado');
      }
      if (!filtros.fechaFin) {
        errores.push('Fecha de fin es requerida para período personalizado');
      }
      if (filtros.fechaInicio && filtros.fechaFin) {
        const inicio = new Date(filtros.fechaInicio);
        const fin = new Date(filtros.fechaFin);
        if (inicio > fin) {
          errores.push('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        // Validar que no sea muy lejano (máximo 2 años)
        const diferenciaDias = (fin - inicio) / (1000 * 60 * 60 * 24);
        if (diferenciaDias > 730) {
          errores.push('El período no puede ser mayor a 2 años');
        }
      }
    }

    // Validar IDs numéricos
    if (filtros.vendedor && filtros.vendedor !== '' && isNaN(parseInt(filtros.vendedor))) {
      errores.push('ID de vendedor debe ser numérico');
    }
    if (filtros.servicio && filtros.servicio !== '' && isNaN(parseInt(filtros.servicio))) {
      errores.push('ID de servicio debe ser numérico');
    }
    if (filtros.cliente && filtros.cliente !== '' && isNaN(parseInt(filtros.cliente))) {
      errores.push('ID de cliente debe ser numérico');
    }

    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    return true;
  }

  // Formatear datos para el frontend
  formatearDatosReporte(tipo, datos) {
    if (!datos) return null;

    switch (tipo) {
      case 'cotizaciones':
        return this.formatearReporteCotizaciones(datos);
      case 'vendedores':
        return this.formatearReporteVendedores(datos);
      case 'servicios':
        return this.formatearReporteServicios(datos);
      case 'clientes':
        return this.formatearReporteClientes(datos);
      case 'financiero':
        return this.formatearReporteFinanciero(datos);
      default:
        return datos;
    }
  }

  formatearReporteCotizaciones(datos) {
    return {
      ...datos,
      detalleCotizaciones: datos.detalleCotizaciones?.map(item => ({
        ...item,
        fechaFormateada: this.formatearFecha(item.fecha),
        montoFormateado: this.formatearMoneda(item.total),
        estadoTexto: this.getEstadoTexto(item.estado),
        estadoClase: this.getEstadoClase(item.estado)
      })) || []
    };
  }

  formatearReporteVendedores(datos) {
    return {
      ...datos,
      rendimientoVendedores: datos.rendimientoVendedores?.map(item => ({
        ...item,
        ingresosFormateados: this.formatearMoneda(item.ingresos),
        ticketPromedioFormateado: this.formatearMoneda(item.ticketPromedio),
        conversionFormateada: `${item.conversion}%`
      })) || [],
      totales: datos.totales ? {
        ...datos.totales,
        ingresosFormateados: this.formatearMoneda(datos.totales.ingresos),
        ticketPromedioFormateado: this.formatearMoneda(datos.totales.ticketPromedio),
        conversionFormateada: `${datos.totales.conversionPromedio}%`
      } : {}
    };
  }

  formatearReporteServicios(datos) {
    return {
      ...datos,
      rendimientoServicios: datos.rendimientoServicios?.map(item => ({
        ...item,
        ingresosFormateados: this.formatearMoneda(item.ingresos),
        precioPromedioFormateado: this.formatearMoneda(item.precioPromedio),
        conversionFormateada: `${item.conversion}%`
      })) || []
    };
  }

  formatearReporteClientes(datos) {
    return {
      ...datos,
      actividadClientes: datos.actividadClientes?.map(item => ({
        ...item,
        ultimaCotizacionFormateada: this.formatearFecha(item.ultimaCotizacion),
        totalFacturadoFormateado: this.formatearMoneda(item.totalFacturado)
      })) || []
    };
  }

  formatearReporteFinanciero(datos) {
    return {
      ...datos,
      financiero: datos.financiero ? {
        ...datos.financiero,
        ingresosBrutosFormateados: this.formatearMoneda(datos.financiero.ingresosBrutos),
        promedioMensualFormateado: this.formatearMoneda(datos.financiero.promedioMensual),
        crecimientoFormateado: `${datos.financiero.crecimiento > 0 ? '+' : ''}${datos.financiero.crecimiento}%`,
        detallesMensuales: datos.financiero.detallesMensuales?.map(item => ({
          ...item,
          ingresosFormateados: this.formatearMoneda(item.ingresos),
          crecimientoFormateado: `${item.crecimiento > 0 ? '+' : ''}${item.crecimiento}%`
        })) || []
      } : {}
    };
  }

  // ===== UTILIDADES DE FORMATO =====

  // Formatear moneda
  formatearMoneda(cantidad) {
    if (!cantidad && cantidad !== 0) return 'L. 0.00';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(cantidad);
  }

  // Formatear fecha
  formatearFecha(fecha) {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  }

  // Formatear fecha para input
  formatearFechaInput(fecha) {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  // Obtener texto del estado
  getEstadoTexto(estado) {
    const estados = {
      'efectiva': 'Efectiva',
      'pendiente': 'Pendiente',
      'pendiente_aprobacion': 'Esperando Aprobación',
      'rechazada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  // Obtener clase CSS del estado
  getEstadoClase(estado) {
    const clases = {
      'efectiva': 'success',
      'pendiente': 'warning',
      'pendiente_aprobacion': 'info',
      'rechazada': 'danger'
    };
    return clases[estado] || 'secondary';
  }

  // Generar código de cotización
  generarCodigoCotizacion(id) {
    return `COT-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
  }

  // Calcular período en días
  calcularDiasPeriodo(filtros) {
    if (filtros.periodo === 'custom' && filtros.fechaInicio && filtros.fechaFin) {
      const inicio = new Date(filtros.fechaInicio);
      const fin = new Date(filtros.fechaFin);
      return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    }
    return parseInt(filtros.periodo) || 30;
  }

  // Obtener descripción del período
  getDescripcionPeriodo(filtros) {
    if (filtros.periodo === 'custom' && filtros.fechaInicio && filtros.fechaFin) {
      return `${this.formatearFecha(filtros.fechaInicio)} al ${this.formatearFecha(filtros.fechaFin)}`;
    }
    const dias = parseInt(filtros.periodo) || 30;
    return `Últimos ${dias} días`;
  }

  // Validar si hay datos en el reporte
  tienedatos(reporte) {
    if (!reporte) return false;
    
    // Verificar diferentes estructuras según el tipo
    if (reporte.detalleCotizaciones) return reporte.detalleCotizaciones.length > 0;
    if (reporte.rendimientoVendedores) return reporte.rendimientoVendedores.length > 0;
    if (reporte.rendimientoServicios) return reporte.rendimientoServicios.length > 0;
    if (reporte.actividadClientes) return reporte.actividadClientes.length > 0;
    if (reporte.financiero) return reporte.financiero.detallesMensuales?.length > 0;
    
    return true;
  }

  // Generar nombre de archivo para exportación
  generarNombreArchivo(tipo, formato = 'pdf') {
    const fecha = new Date().toISOString().split('T')[0];
    return `reporte-${tipo}-${fecha}.${formato}`;
  }

  // Agregar este método:

// Generar PDF desde backend
async generarPDF(tipo, filtros = {}) {
  try {
    console.log('📄 Solicitando PDF al backend:', tipo);
    
    const response = await api.post('/reportes/generar-pdf', {
      tipo,
      filtros
    }, {
      responseType: 'blob' // Importante para recibir el PDF
    });
    
    // Crear URL para descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    console.log('✅ PDF descargado exitosamente');
    
    return {
      success: true,
      message: 'PDF generado y descargado exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error generando PDF'
    };
  }
}


}

// Exportar instancia única
export default new ReportesService();