// src/services/cotizacionVendedor.js
import api from './api';

class CotizacionVendedorService {
  
  // Obtener mis cotizaciones con filtros y paginación
  async getMisCotizaciones(filtros = {}) {
    try {
      
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      
      const response = await api.get(`/cotizacion-vendedor?${params.toString()}`);
      
      if (response.data.success) {
        return {
          success: true,
          cotizaciones: response.data.cotizaciones,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo cotizaciones'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo mis cotizaciones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Obtener mis estadísticas
  async getMisEstadisticas() {
    try {
      
      const response = await api.get('/cotizacion-vendedor/estadisticas');
      
      if (response.data.success) {
        return {
          success: true,
          estadisticas: response.data.estadisticas
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo estadísticas'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo mis estadísticas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Obtener una cotización específica mía
  async getMiCotizacion(id) {
    try {
      
      const response = await api.get(`/cotizacion-vendedor/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          cotizacion: response.data.cotizacion
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo cotización'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo mi cotización:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // Generar PDF de mi cotización
  async generarMiPDF(id, tipo = 'copia') {
    try {
      
      const response = await api.get(`/cotizacion-vendedor/${id}/pdf?tipo=${tipo}`, {
        responseType: 'blob'
      });
      
      // Crear nombre del archivo
      const numeroDocumento = `COT-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
      const tipoTexto = tipo === 'copia' ? 'Copia' : 'Original';
      const nombreArchivo = `${numeroDocumento}_${tipoTexto}.pdf`;
      
      // Crear URL del blob para descarga
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `PDF ${tipoTexto} generado exitosamente`
      };
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error generando PDF'
      };
    }
  }

  // Vista previa de PDF en modal (sin descargar)
  async vistaPreviaPDF(id, tipo = 'copia') {
    try {
      
      const response = await api.get(`/cotizacion-vendedor/${id}/pdf?tipo=${tipo}`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob para vista previa
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      return {
        success: true,
        pdfUrl: url
      };
      
    } catch (error) {
      console.error('❌ Error en vista previa PDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error generando vista previa'
      };
    }
  }

// Actualizar el método duplicarCotizacion en el service
async duplicarCotizacion(id) {
  try {
    
    const response = await api.post(`/cotizacion-vendedor/${id}/duplicar`);
    
    if (response.data.success) {
      return {
        success: true,
        datos: response.data.datos,
        accion: response.data.accion,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error obteniendo datos para duplicar'
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo datos para duplicar:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión'
    };
  }
}

  // ===== MÉTODOS HELPER =====

  // Formatear estado para mostrar en español
  formatearEstado(estado) {
    const estados = {
      'pendiente': 'Pendiente',
      'pendiente_aprobacion': 'Esperando Aprobación',
      'efectiva': 'Efectiva',
      'rechazada': 'Rechazada'
    };
    return estados[estado] || estado;
  }

  // Obtener clase CSS para el estado
  getEstadoClass(estado) {
    const clases = {
      'pendiente': 'pendiente',
      'pendiente_aprobacion': 'esperando',
      'efectiva': 'efectiva',
      'rechazada': 'cancelada'
    };
    return clases[estado] || 'secondary';
  }

  // Formatear moneda en Lempiras
  formatearMoneda(cantidad) {
    if (!cantidad && cantidad !== 0) return 'L 0.00';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  }

  // Formatear fecha en formato hondureño
  formatearFecha(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Formatear fecha completa
  formatearFechaCompleta(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-HN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Formatear tiempo relativo (hace X tiempo)
  formatearTiempoRelativo(fecha) {
    if (!fecha) return '';
    
    const ahora = new Date();
    const fechaObj = new Date(fecha);
    const diferencia = ahora - fechaObj;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    
    if (horas < 1) {
      return 'hace menos de una hora';
    } else if (horas === 1) {
      return 'hace 1 hora';
    } else if (horas < 24) {
      return `hace ${horas} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      if (dias === 1) {
        return 'hace 1 día';
      } else if (dias < 30) {
        return `hace ${dias} días`;
      } else {
        const meses = Math.floor(dias / 30);
        if (meses === 1) {
          return 'hace 1 mes';
        } else if (meses < 12) {
          return `hace ${meses} meses`;
        } else {
          const años = Math.floor(meses / 12);
          return años === 1 ? 'hace 1 año' : `hace ${años} años`;
        }
      }
    }
  }

  // Validar si una cotización puede generar PDF
  puedeGenerarPDF(estado) { // 🔧 CORREGIDO: Solo necesita el estado
    // No se puede generar PDF si está esperando aprobación
    if (estado === 'pendiente_aprobacion') {
      return {
        puede: false,
        motivo: 'La cotización está esperando aprobación y no se puede generar PDF'
      };
    }
    
    return {
      puede: true,
      motivo: null
    };
  }

  // Validar si una cotización se puede duplicar
  puedeDuplicar() { // 🔧 CORREGIDO: Se puede duplicar siempre
    // Se puede duplicar en cualquier estado
    return {
      puede: true,
      motivo: null
    };
  }

  // Obtener icono para el estado
  getEstadoIcono(estado) {
    const iconos = {
      'pendiente': 'fas fa-clock',
      'pendiente_aprobacion': 'fas fa-hourglass-half',
      'efectiva': 'fas fa-check-circle',
      'rechazada': 'fas fa-times-circle'
    };
    return iconos[estado] || 'fas fa-question-circle';
  }

  // Obtener descripción del estado
  getEstadoDescripcion(estado) {
    const descripciones = {
      'pendiente': 'La cotización está pendiente de respuesta del cliente',
      'pendiente_aprobacion': 'La cotización requiere aprobación por estar bajo el precio mínimo',
      'efectiva': 'La cotización fue aceptada por el cliente',
      'rechazada': 'La cotización fue rechazada'
    };
    return descripciones[estado] || 'Estado desconocido';
  }

  // Validar datos antes de operaciones
  validarCotizacionId(id) {
    if (!id || isNaN(parseInt(id))) {
      return {
        valido: false,
        error: 'ID de cotización inválido'
      };
    }
    return {
      valido: true,
      error: null
    };
  }

  // Limpiar datos de búsqueda
  limpiarFiltros() {
    return {
      search: '',
      estado: '',
      periodo: '',
      page: 1,
      limit: 10
    };
  }

  // Obtener opciones para filtros
  getOpcionesFiltros() {
    return {
      estados: [
        { value: '', label: 'Todos los estados' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'pendiente_aprobacion', label: 'Esperando Aprobación' },
        { value: 'efectiva', label: 'Efectiva' },
        { value: 'rechazada', label: 'Rechazada' }
      ],
      periodos: [
        { value: '', label: 'Todo el tiempo' },
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Esta semana' },
        { value: 'mes', label: 'Este mes' },
        { value: 'trimestre', label: 'Este trimestre' }
      ],
      itemsPorPagina: [
        { value: 5, label: '5 por página' },
        { value: 10, label: '10 por página' },
        { value: 25, label: '25 por página' },
        { value: 50, label: '50 por página' },
        { value: 100, label: '100 por página' }
      ]
    };
  }
}

// Exportar instancia única
export default new CotizacionVendedorService();