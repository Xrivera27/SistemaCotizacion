// services/superDashboard.js
import api from './api';

class SuperDashboardService {
  
  // ===== DASHBOARD SUPER USUARIO =====
  
  // Obtener estadísticas del supervisor
  async getSuperUsuarioStats() {
    try {
      console.log('📊 Obteniendo estadísticas del supervisor...');
      
      const response = await api.get('/dashboard/super-usuario/stats');
      
      if (response.data.success) {
        console.log('✅ Estadísticas supervisor obtenidas:', response.data.data);
        return {
          success: true,
          stats: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo estadísticas'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas supervisor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener datos para gráfico efectivas vs canceladas
  async getEfectivasVsCanceladas(dias = 30) {
    try {
      console.log('📈 Obteniendo datos del gráfico comparativo...');
      
      const response = await api.get('/dashboard/super-usuario/efectivas-vs-canceladas', {
        params: { dias }
      });
      
      if (response.data.success) {
        console.log('✅ Datos comparativos obtenidos:', response.data.data);
        return {
          success: true,
          chartData: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo datos del gráfico'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo gráfico comparativo:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener datos para gráfico de colaboradores
  async getColaboradoresChart() {
    try {
      console.log('📊 Obteniendo datos del gráfico de colaboradores...');
      
      const response = await api.get('/dashboard/super-usuario/colaboradores-chart');
      
      if (response.data.success) {
        console.log('✅ Datos de colaboradores obtenidos:', response.data.data);
        return {
          success: true,
          chartData: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo datos del gráfico'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo gráfico de colaboradores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener datos para gráfico de servicios
  async getServiciosChart() {
    try {
      console.log('📊 Obteniendo datos del gráfico de servicios...');
      
      const response = await api.get('/dashboard/super-usuario/servicios-chart');
      
      if (response.data.success) {
        console.log('✅ Datos de servicios obtenidos:', response.data.data);
        return {
          success: true,
          chartData: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo datos del gráfico'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo gráfico de servicios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener resumen mensual
  async getResumenMensual(mes = 'actual') {
    try {
      console.log('📅 Obteniendo resumen mensual supervisor:', mes);
      
      const response = await api.get('/dashboard/super-usuario/resumen-mensual', {
        params: { mes }
      });
      
      if (response.data.success) {
        console.log('✅ Resumen mensual supervisor obtenido:', response.data.data);
        return {
          success: true,
          resumen: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo resumen mensual'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo resumen mensual supervisor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener cotizaciones pendientes de aprobación
  async getCotizacionesPendientesAprobacion() {
    try {
      console.log('📋 Obteniendo cotizaciones pendientes de aprobación...');
      
      const response = await api.get('/dashboard/super-usuario/cotizaciones-pendientes-aprobacion');
      
      if (response.data.success) {
        console.log('✅ Cotizaciones pendientes obtenidas:', response.data.data);
        return {
          success: true,
          cotizaciones: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo cotizaciones pendientes'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo cotizaciones pendientes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Aprobar cotización
  async aprobarCotizacion(cotizacionId) {
    try {
      console.log('✅ Aprobando cotización:', cotizacionId);
      
      const response = await api.post('/dashboard/super-usuario/aprobar-cotizacion', {
        cotizacionId
      });
      
      if (response.data.success) {
        console.log('✅ Cotización aprobada exitosamente:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error aprobando cotización'
      };
      
    } catch (error) {
      console.error('❌ Error aprobando cotización:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Rechazar cotización
  async rechazarCotizacion(cotizacionId, motivo) {
    try {
      console.log('❌ Rechazando cotización:', cotizacionId, 'Motivo:', motivo);
      
      if (!motivo || motivo.trim() === '') {
        return {
          success: false,
          message: 'El motivo de rechazo es requerido'
        };
      }
      
      const response = await api.post('/dashboard/super-usuario/rechazar-cotizacion', {
        cotizacionId,
        motivo: motivo.trim()
      });
      
      if (response.data.success) {
        console.log('✅ Cotización rechazada exitosamente:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error rechazando cotización'
      };
      
    } catch (error) {
      console.error('❌ Error rechazando cotización:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener todos los datos del dashboard de una vez (optimizado)
  async getAllDashboardData(mes = 'actual', dias = 30) {
    try {
      console.log('🚀 Obteniendo todos los datos del dashboard supervisor...');
      
      const response = await api.get('/dashboard/super-usuario/all-data', {
        params: { mes, dias }
      });
      
      if (response.data.success) {
        console.log('✅ Todos los datos del dashboard supervisor obtenidos:', response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo datos del dashboard'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo datos del dashboard supervisor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // ===== HELPERS Y UTILIDADES =====
  
  // Formatear datos para el gráfico de líneas comparativo
  formatComparativeChartData(data) {
    if (!data || !data.labels || !data.efectivas || !data.canceladas) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Cotizaciones Efectivas',
          data: data.efectivas,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Cotizaciones Canceladas',
          data: data.canceladas,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }
  
  // Determinar prioridad visual
  getPrioridadClass(prioridad) {
    const clases = {
      'alta': 'priority-high',
      'media': 'priority-medium',
      'baja': 'priority-low'
    };
    return clases[prioridad] || 'priority-low';
  }
  
  // Obtener texto de prioridad
  getPrioridadTexto(prioridad) {
    const textos = {
      'alta': 'ALTA',
      'media': 'MEDIA',
      'baja': 'BAJA'
    };
    return textos[prioridad] || 'BAJA';
  }
  
  // Formatear tiempo de espera
  formatTiempoEspera(fechaCreacion) {
    if (!fechaCreacion) return '';
    
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diferencia = ahora - fecha;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    
    if (horas < 1) {
      return 'hace menos de una hora';
    } else if (horas === 1) {
      return 'hace 1 hora';
    } else if (horas < 24) {
      return `hace ${horas} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    }
  }
  
  // Validar si una cotización necesita atención urgente
  esUrgente(cotizacion) {
    if (!cotizacion) return false;
    
    const horasEspera = this.getHorasEspera(cotizacion.fechaCreacion);
    return cotizacion.prioridad === 'alta' || horasEspera > 24;
  }
  
  // Calcular horas de espera
  getHorasEspera(fechaCreacion) {
    if (!fechaCreacion) return 0;
    
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    return Math.floor((ahora - fecha) / (1000 * 60 * 60));
  }
  
  // Formatear moneda
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('es-ES').format(amount);
  }
  
  // Generar mensaje de confirmación para aprobación
  getConfirmacionAprobacion(cotizacion) {
    return `¿Está seguro de aprobar la cotización ${cotizacion.codigo}?\n\nCliente: ${cotizacion.cliente}\nMonto: $${this.formatCurrency(cotizacion.monto)}`;
  }
  
  // Validar motivo de rechazo
  validarMotivoRechazo(motivo) {
    if (!motivo || motivo.trim() === '') {
      return {
        valido: false,
        mensaje: 'El motivo de rechazo es requerido'
      };
    }
    
    if (motivo.trim().length < 10) {
      return {
        valido: false,
        mensaje: 'El motivo debe tener al menos 10 caracteres'
      };
    }
    
    if (motivo.trim().length > 500) {
      return {
        valido: false,
        mensaje: 'El motivo no puede exceder 500 caracteres'
      };
    }
    
    return {
      valido: true,
      mensaje: 'Motivo válido'
    };
  }
}

// Exportar instancia única
export default new SuperDashboardService();