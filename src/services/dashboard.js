// services/dashboard.js
import api from './api';

class DashboardService {
  
  // ===== DASHBOARD ADMINISTRADOR =====
  
  // Obtener estadísticas generales (cards superiores)
  async getAdminStats() {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard admin...');
      
      const response = await api.get('/dashboard/admin/stats');
      
      if (response.data.success) {
        console.log('✅ Estadísticas admin obtenidas:', response.data.data);
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
      console.error('❌ Error obteniendo estadísticas admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener datos para gráfico de colaboradores
  async getColaboradoresChart() {
    try {
      console.log('📈 Obteniendo datos del gráfico de colaboradores...');
      
      const response = await api.get('/dashboard/admin/colaboradores-chart');
      
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
      
      const response = await api.get('/dashboard/admin/servicios-chart');
      
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
      console.log('📅 Obteniendo resumen mensual:', mes);
      
      const response = await api.get('/dashboard/admin/resumen-mensual', {
        params: { mes }
      });
      
      if (response.data.success) {
        console.log('✅ Resumen mensual obtenido:', response.data.data);
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
      console.error('❌ Error obteniendo resumen mensual:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener cotizaciones recientes
  async getCotizacionesRecientes(limit = 8) {
    try {
      console.log('📋 Obteniendo cotizaciones recientes, limit:', limit);
      
      const response = await api.get('/dashboard/admin/cotizaciones-recientes', {
        params: { limit }
      });
      
      if (response.data.success) {
        console.log('✅ Cotizaciones recientes obtenidas:', response.data.data);
        return {
          success: true,
          cotizaciones: response.data.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo cotizaciones'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo cotizaciones recientes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener todos los datos del dashboard de una vez (optimizado)
  async getAllDashboardData(mes = 'actual') {
    try {
      console.log('🚀 Obteniendo todos los datos del dashboard...');
      
      const response = await api.get('/dashboard/admin/all-data', {
        params: { mes }
      });
      
      if (response.data.success) {
        console.log('✅ Todos los datos del dashboard obtenidos:', response.data.data);
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
      console.error('❌ Error obteniendo datos del dashboard:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // ===== DASHBOARD VENDEDOR (Para futuro) =====
  
  async getVendedorStats() {
    try {
      console.log('📊 Obteniendo estadísticas del vendedor...');
      
      const response = await api.get('/dashboard/vendedor/stats');
      
      if (response.data.success) {
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
      console.error('❌ Error obteniendo estadísticas vendedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // ===== DASHBOARD SUPER USUARIO (Para futuro) =====
  
  async getSuperUsuarioStats() {
    try {
      console.log('📊 Obteniendo estadísticas del super usuario...');
      
      const response = await api.get('/dashboard/super-usuario/stats');
      
      if (response.data.success) {
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
      console.error('❌ Error obteniendo estadísticas super usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // ===== HELPERS Y UTILIDADES =====
  
  // Formatear datos para los gráficos de Chart.js
  formatChartData(data, type = 'bar') {
    if (!data || !data.labels || !data.data) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const colors = this.getChartColors(data.labels.length);
    
    if (type === 'doughnut') {
      return {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: colors.backgrounds,
          borderColor: colors.borders,
          borderWidth: 2
        }]
      };
    }
    
    // Para gráfico de barras
    return {
      labels: data.labels,
      datasets: [{
        label: 'Cotizaciones Efectivas',
        data: data.data,
        backgroundColor: colors.backgrounds,
        borderColor: colors.borders,
        borderWidth: 2
      }]
    };
  }
  
  // Generar colores para gráficos
  getChartColors(count) {
    const baseColors = [
      '#27ae60', '#2ecc71', '#3498db', '#9b59b6', 
      '#f39c12', '#e67e22', '#e74c3c', '#95a5a6'
    ];
    
    const backgrounds = [];
    const borders = [];
    
    for (let i = 0; i < count; i++) {
      const color = baseColors[i % baseColors.length];
      backgrounds.push(color);
      borders.push('#fff');
    }
    
    return { backgrounds, borders };
  }
  
  // Formatear moneda
  formatCurrency(amount) {
    if (!amount) return '0';
    return new Intl.NumberFormat('es-ES').format(amount);
  }
  
  // Formatear fechas relativas
  formatRelativeTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now - targetDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'hace menos de una hora';
    } else if (diffHours === 1) {
      return 'hace 1 hora';
    } else if (diffHours < 24) {
      return `hace ${diffHours} horas`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  }
  
  // Mapear estados para clases CSS
  getEstadoClass(estado) {
    const clases = {
      'pendiente': 'warning',
      'esperando': 'info',
      'efectiva': 'success',
      'cancelada': 'danger'
    };
    return clases[estado] || 'secondary';
  }
  
  // Obtener texto legible del estado
  getEstadoTexto(estado) {
    const textos = {
      'pendiente': 'Pendiente',
      'esperando': 'Esperando Aprobación',
      'efectiva': 'Efectiva',
      'cancelada': 'Cancelada'
    };
    return textos[estado] || estado;
  }
  
  // Validar si hay datos para mostrar
  hasData(data) {
    return data && data.length > 0;
  }
  
  // Obtener descripción del mes
  getDescripcionMes(mes) {
    const descripciones = {
      'actual': 'este mes',
      'anterior': 'mes anterior',
      'hace2': 'hace 2 meses'
    };
    return descripciones[mes] || mes;
  }
}

// Exportar instancia única
export default new DashboardService();