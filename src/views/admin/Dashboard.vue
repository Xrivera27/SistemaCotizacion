<template>
  <div class="dashboard-admin">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
          Bienvenido
        </h1>
      </div>
      <div class="header-date">
        <i class="fas fa-calendar-day"></i>
        {{ fechaActual }}
      </div>
    </div>

    <!-- Tarjetas de estadísticas generales -->
    <div class="stats-grid">
      <div class="stat-card pendiente">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.pendientes }}</h3>
          <p>Cotizaciones Pendientes</p>
          <small>Todas las cotizaciones en proceso</small>
        </div>
      </div>

      <div class="stat-card esperando">
        <div class="stat-icon">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.esperandoAprobacion }}</h3>
          <p>Esperando Aprobación</p>
          <small>Requieren revisión de supervisor</small>
        </div>
      </div>

      <div class="stat-card efectiva">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.efectivas }}</h3>
          <p>Cotizaciones Efectivas</p>
          <small>Cerradas exitosamente</small>
        </div>
      </div>

      <div class="stat-card cancelada">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.canceladas }}</h3>
          <p>Cotizaciones Canceladas</p>
          <small>No prosperaron</small>
        </div>
      </div>

      <div class="stat-card colaboradores">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.colaboradoresActivos }}</h3>
          <p>Colaboradores Activos</p>
          <small>Colaboradores trabajando este momento</small>
        </div>
      </div>
    </div>

    <!-- Gráficos principales -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>
            Cotizaciones Efectivas por Colaborador
          </h3>
        </div>
        <div class="chart-wrapper">
          <canvas ref="colaboradoresChart"></canvas>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>
            Servicios Más Cotizados
          </h3>
        </div>
        <div class="chart-wrapper">
          <canvas ref="serviciosChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Resumen mensual de ventas -->
    <div class="sales-summary">
      <div class="summary-header">
        <h3>
          Resumen Mensual de Ventas
        </h3>
        <div class="month-selector">
          <select v-model="mesSeleccionado" @change="actualizarResumenMensual" class="month-select" :disabled="isLoading">
            <option value="actual">Mes Actual</option>
            <option value="anterior">Mes Anterior</option>
            <option value="hace2">Hace 2 Meses</option>
          </select>
        </div>
      </div>
      
      <div class="summary-cards">
        <div class="summary-card total-ventas">
          <div class="summary-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="summary-info">
            <h4>Ventas Totales</h4>
            <div class="summary-amount">${{ formatearMoneda(resumenMensual.ventasTotales) }}</div>
            <small>{{ getDescripcionMes() }}</small>
          </div>
        </div>

        <div class="summary-card mejor-vendedor">
          <div class="summary-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="summary-info">
            <h4>Mejor Vendedor</h4>
            <div class="summary-amount">{{ resumenMensual.mejorVendedor.nombre }}</div>
            <small>${{ formatearMoneda(resumenMensual.mejorVendedor.ventas) }} en ventas</small>
          </div>
          <div class="best-seller-badge">
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimas cotizaciones creadas -->
    <div class="recent-quotes">
      <div class="quotes-header">
        <h3>
          <i class="fas fa-file-invoice-dollar"></i>
          Últimas Cotizaciones Creadas (Todos los usuarios)
        </h3>
      </div>
      <div class="quotes-list" v-if="ultimasCotizaciones.length > 0">
        <div v-for="cotizacion in ultimasCotizaciones" :key="cotizacion.id" class="quote-item">
          <div class="quote-icon" :class="cotizacion.estado">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="quote-content">
            <div class="quote-header">
              <h4 class="quote-code">{{ cotizacion.codigo }}</h4>
              <span class="quote-amount">${{ formatearMoneda(cotizacion.monto) }}</span>
            </div>
            <p class="quote-client">{{ cotizacion.cliente }}</p>
            <div class="quote-details">
              <small class="quote-vendor">Vendedor: {{ cotizacion.vendedor }}</small>
              <small class="quote-date">{{ formatearTiempo(cotizacion.fechaCreacion) }}</small>
            </div>
          </div>
          <div class="quote-status" :class="cotizacion.estado">
            {{ getEstadoTexto(cotizacion.estado) }}
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>No hay cotizaciones disponibles</p>
      </div>
    </div>

    <!-- Loading Modal -->
    <LoadingModal 
      :is-loading="isLoading" 
      :message="loadingMessage"
      :cancellable="false"
    />

    <!-- Error Toast -->
    <div v-if="showError" class="error-toast">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
      <button @click="showError = false" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  DoughnutController,
  BarController
} from 'chart.js'

import { useLoading } from '@/utils/useLoading'
import DashboardService from '@/services/dashboard'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  DoughnutController,
  BarController
)

export default {
  name: 'AdminDashboard',
  setup() {
    const { 
      isLoading, 
      loadingMessage, 
      withLoading,
      withLoadingKey 
    } = useLoading()

    return {
      isLoading,
      loadingMessage,
      withLoading,
      withLoadingKey
    }
  },
  data() {
    return {
      nombreAdmin: 'Administrador', // Se actualizará con datos del usuario
      colaboradoresChart: null,
      serviciosChart: null,
      mesSeleccionado: 'actual',
      
      // Datos de la API
      estadisticas: {
        pendientes: 0,
        esperandoAprobacion: 0,
        efectivas: 0,
        canceladas: 0,
        colaboradoresActivos: 0
      },
      resumenMensual: {
        ventasTotales: 0,
        mejorVendedor: {
          nombre: 'Sin datos',
          ventas: 0
        }
      },
      ultimasCotizaciones: [],
      colaboradoresData: null,
      serviciosData: null,
      
      // Control de errores
      showError: false,
      errorMessage: ''
    }
  },
  computed: {
    fechaActual() {
      return new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  async mounted() {
    // Cargar todos los datos iniciales
    await this.withLoading(async () => {
      await this.cargarDatosIniciales()
      await this.$nextTick()
      this.initCharts()
    }, 'Cargando dashboard...')
  },
  beforeUnmount() {
    this.destroyCharts()
  },
  methods: {
    // ===== MÉTODOS DE CARGA DE DATOS =====
    
    async cargarDatosIniciales() {
      try {
        
        // Usar el endpoint optimizado que trae todos los datos de una vez
        const result = await DashboardService.getAllDashboardData(this.mesSeleccionado)
        
        if (result.success) {
          const { data } = result
          
          // Actualizar todas las secciones
          this.estadisticas = data.stats || this.estadisticas
          this.colaboradoresData = data.colaboradoresChart
          this.serviciosData = data.serviciosChart
          this.resumenMensual = data.resumenMensual || this.resumenMensual
          this.ultimasCotizaciones = data.cotizacionesRecientes || []

        } else {
          this.mostrarError(result.message || 'Error cargando datos del dashboard')
          // Cargar datos individuales como fallback
          await this.cargarDatosIndividuales()
        }
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error)
        this.mostrarError('Error de conexión al cargar dashboard')
        // Cargar datos individuales como fallback
        await this.cargarDatosIndividuales()
      }
    },
    
    async cargarDatosIndividuales() {
      try {
        
        // Cargar cada sección por separado
        const [statsResult, colaboradoresResult, serviciosResult, resumenResult, cotizacionesResult] = 
          await Promise.allSettled([
            DashboardService.getAdminStats(),
            DashboardService.getColaboradoresChart(),
            DashboardService.getServiciosChart(),
            DashboardService.getResumenMensual(this.mesSeleccionado),
            DashboardService.getCotizacionesRecientes(8)
          ])
        
        // Procesar resultados
        if (statsResult.status === 'fulfilled' && statsResult.value.success) {
          this.estadisticas = statsResult.value.stats
        }
        
        if (colaboradoresResult.status === 'fulfilled' && colaboradoresResult.value.success) {
          this.colaboradoresData = colaboradoresResult.value.chartData
        }
        
        if (serviciosResult.status === 'fulfilled' && serviciosResult.value.success) {
          this.serviciosData = serviciosResult.value.chartData
        }
        
        if (resumenResult.status === 'fulfilled' && resumenResult.value.success) {
          this.resumenMensual = resumenResult.value.resumen
        }
        
        if (cotizacionesResult.status === 'fulfilled' && cotizacionesResult.value.success) {
          this.ultimasCotizaciones = cotizacionesResult.value.cotizaciones
        }

      } catch (error) {
        console.error('❌ Error cargando datos individuales:', error)
        this.mostrarError('Error cargando algunos datos del dashboard')
      }
    },

    // ===== MÉTODOS DE GRÁFICOS =====
    
    initCharts() {
      try {
        this.destroyCharts() // Limpiar gráficos existentes
        this.createColaboradoresChart()
        this.createServiciosChart()
      } catch (error) {
        console.error('Error al inicializar gráficos:', error)
        this.mostrarError('Error inicializando gráficos')
      }
    },
    
    createColaboradoresChart() {
      const ctx = this.$refs.colaboradoresChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas de colaboradores')
        return
      }
      
      // Usar datos de la API o datos por defecto
      const chartData = this.colaboradoresData || {
        labels: ['Sin datos'],
        data: [0]
      }
      
      const colors = this.getChartColors(chartData.labels.length)
      
      this.colaboradoresChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Cotizaciones Efectivas',
            data: chartData.data,
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} cotizaciones efectivas`
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    },
    
    createServiciosChart() {
      const ctx = this.$refs.serviciosChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas de servicios')
        return
      }
      
      // Usar datos de la API o datos por defecto
      const chartData = this.serviciosData || {
        labels: ['Sin datos'],
        data: [1]
      }
      
      const colors = this.getChartColors(chartData.labels.length)
      
      this.serviciosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((context.parsed / total) * 100).toFixed(1)
                  return `${context.label}: ${context.parsed} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    },
    
    destroyCharts() {
      if (this.colaboradoresChart) {
        this.colaboradoresChart.destroy()
        this.colaboradoresChart = null
      }
      if (this.serviciosChart) {
        this.serviciosChart.destroy()
        this.serviciosChart = null
      }
    },

    // ===== MÉTODOS DE ACTUALIZACIÓN =====
    
    async actualizarDatosColaboradores() {
      await this.withLoadingKey('colaboradores', async () => {
        try {
          const result = await DashboardService.getColaboradoresChart()
          
          if (result.success) {
            this.colaboradoresData = result.chartData
            this.createColaboradoresChart()
          } else {
            this.mostrarError(result.message || 'Error actualizando datos de colaboradores')
          }
        } catch (error) {
          console.error('❌ Error actualizando colaboradores:', error)
          this.mostrarError('Error de conexión al actualizar colaboradores')
        }
      }, 'Actualizando datos de colaboradores...')
    },

    async actualizarDatosServicios() {
      await this.withLoadingKey('servicios', async () => {
        try {
          const result = await DashboardService.getServiciosChart()
          
          if (result.success) {
            this.serviciosData = result.chartData
            this.createServiciosChart()
          } else {
            this.mostrarError(result.message || 'Error actualizando datos de servicios')
          }
        } catch (error) {
          console.error('❌ Error actualizando servicios:', error)
          this.mostrarError('Error de conexión al actualizar servicios')
        }
      }, 'Actualizando datos de servicios...')
    },

    async actualizarCotizaciones() {
      await this.withLoadingKey('cotizaciones', async () => {
        try {
          const result = await DashboardService.getCotizacionesRecientes(8)
          
          if (result.success) {
            this.ultimasCotizaciones = result.cotizaciones
          } else {
            this.mostrarError(result.message || 'Error actualizando cotizaciones')
          }
        } catch (error) {
          console.error('❌ Error actualizando cotizaciones:', error)
          this.mostrarError('Error de conexión al actualizar cotizaciones')
        }
      }, 'Actualizando cotizaciones...')
    },
    
    async actualizarResumenMensual() {
      await this.withLoading(async () => {
        try {
          const result = await DashboardService.getResumenMensual(this.mesSeleccionado)
          
          if (result.success) {
            this.resumenMensual = result.resumen
          } else {
            this.mostrarError(result.message || 'Error actualizando resumen mensual')
          }
        } catch (error) {
          console.error('❌ Error actualizando resumen:', error)
          this.mostrarError('Error de conexión al actualizar resumen')
        }
      }, 'Cargando resumen mensual...')
    },

    // ===== MÉTODOS AUXILIARES =====
    
    getChartColors(count) {
      const baseColors = [
        '#27ae60', '#2ecc71', '#3498db', '#9b59b6', 
        '#f39c12', '#e67e22', '#e74c3c', '#95a5a6'
      ]
      
      const colors = []
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length])
      }
      
      return colors
    },
    
    getDescripcionMes() {
      const descripciones = {
        actual: 'este mes',
        anterior: 'mes anterior', 
        hace2: 'hace 2 meses'
      }
      return descripciones[this.mesSeleccionado]
    },
    
    formatearMoneda(cantidad) {
      if (!cantidad && cantidad !== 0) return '0'
      return cantidad.toLocaleString('es-ES')
    },
    
    formatearTiempo(fecha) {
      if (!fecha) return ''
      
      const ahora = new Date()
      const fechaObj = new Date(fecha)
      const diferencia = ahora - fechaObj
      const horas = Math.floor(diferencia / (1000 * 60 * 60))
      
      if (horas < 1) {
        return 'hace menos de una hora'
      } else if (horas === 1) {
        return 'hace 1 hora'
      } else if (horas < 24) {
        return `hace ${horas} horas`
      } else {
        const dias = Math.floor(horas / 24)
        return `hace ${dias} día${dias > 1 ? 's' : ''}`
      }
    },
    
    getEstadoTexto(estado) {
      const estados = {
        pendiente: 'Pendiente',
        esperando: 'Esperando Aprobación',
        efectiva: 'Efectiva',
        cancelada: 'Cancelada'
      }
      return estados[estado] || estado
    },
    
    mostrarError(mensaje) {
      this.errorMessage = mensaje
      this.showError = true
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        this.showError = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
/* Todos los estilos existentes se mantienen igual */
.dashboard-admin {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  color: #3498db;
}

.header-content p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
  font-weight: 500;
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.header-date i {
  color: #3498db;
}

/* Refresh Button Styles */
.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn i {
  font-size: 0.8rem;
}

.quotes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quotes-header h3 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quotes-header h3 i {
  color: #3498db;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-card.pendiente .stat-icon {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.stat-card.esperando .stat-icon {
  background: linear-gradient(135deg, #e67e22, #d35400);
}

.stat-card.efectiva .stat-icon {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.stat-card.cancelada .stat-icon {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.stat-card.colaboradores .stat-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.stat-card.conversion .stat-icon {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.stat-info p {
  font-weight: 600;
  color: #34495e;
  margin: 0 0 0.25rem 0;
}

.stat-info small {
  color: #7f8c8d;
  font-size: 0.85rem;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  height: fit-content;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-header h3 i {
  color: #3498db;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

/* Sales Summary */
.sales-summary {
  margin-bottom: 2rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.summary-header h3 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-header h3 i {
  color: #27ae60;
}

.month-selector .month-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: white;
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.month-selector .month-select:focus {
  outline: none;
  border-color: #3498db;
}

.month-selector .month-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.summary-card {
 background: white;
 padding: 1.5rem;
 border-radius: 1rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
 border: 1px solid #e9ecef;
 transition: transform 0.3s ease;
 display: flex;
 align-items: center;
 gap: 1rem;
 position: relative;
}

.summary-card:hover {
 transform: translateY(-2px);
}

.summary-icon {
 width: 60px;
 height: 60px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 1.5rem;
 color: white;
 flex-shrink: 0;
}

.total-ventas .summary-icon {
 background: linear-gradient(135deg, #27ae60, #229954);
}

.mejor-vendedor .summary-icon {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.summary-info {
 flex: 1;
}

.summary-info h4 {
 color: #2c3e50;
 margin: 0 0 0.5rem 0;
 font-size: 1rem;
 font-weight: 600;
}

.summary-amount {
 font-size: 1.8rem;
 font-weight: 700;
 color: #2c3e50;
 margin-bottom: 0.25rem;
}

.summary-info small {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.best-seller-badge {
 position: absolute;
 top: 1rem;
 right: 1rem;
 color: #f39c12;
 font-size: 1.2rem;
}

/* Recent Quotes */
.recent-quotes h3 {
 color: #2c3e50;
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.recent-quotes h3 i {
 color: #3498db;
}

.quotes-list {
 background: white;
 border-radius: 1rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
 border: 1px solid #e9ecef;
 overflow: hidden;
}

.quote-item {
 display: flex;
 align-items: center;
 padding: 1rem 1.5rem;
 border-bottom: 1px solid #f8f9fa;
 gap: 1rem;
 transition: background-color 0.3s ease;
}

.quote-item:hover {
 background-color: #f8f9fa;
}

.quote-item:last-child {
border-bottom: none;
}

.quote-icon {
width: 45px;
height: 45px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 1.2rem;
color: white;
flex-shrink: 0;
}

.quote-icon.pendiente {
background: #f39c12;
}

.quote-icon.esperando {
background: #e67e22;
}

.quote-icon.efectiva {
background: #27ae60;
}

.quote-icon.cancelada {
background: #e74c3c;
}

.quote-content {
flex: 1;
}

.quote-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 0.25rem;
}

.quote-code {
color: #2c3e50;
margin: 0;
font-size: 1rem;
font-weight: 600;
}

.quote-amount {
color: #27ae60;
font-weight: 700;
font-size: 1rem;
}

.quote-client {
color: #34495e;
margin: 0 0 0.25rem 0;
font-weight: 500;
font-size: 0.95rem;
}

.quote-details {
display: flex;
justify-content: space-between;
align-items: center;
gap: 1rem;
}

.quote-vendor {
color: #7f8c8d;
font-size: 0.85rem;
font-weight: 600;
}

.quote-date {
color: #7f8c8d;
font-size: 0.85rem;
}

.quote-status {
padding: 0.25rem 0.75rem;
border-radius: 15px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
white-space: nowrap;
}

.quote-status.pendiente {
background: #fff3cd;
color: #856404;
}

.quote-status.esperando {
background: #fdeaa7;
color: #8b5a00;
}

.quote-status.efectiva {
background: #d4edda;
color: #155724;
}

.quote-status.cancelada {
background: #f8d7da;
color: #721c24;
}

/* No Data State */
.no-data {
 background: white;
 border-radius: 1rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
 border: 1px solid #e9ecef;
 padding: 3rem;
 text-align: center;
}

.no-data p {
 color: #7f8c8d;
 font-size: 1.1rem;
 margin: 0;
}

/* Error Toast */
.error-toast {
 position: fixed;
 top: 2rem;
 right: 2rem;
 background: #e74c3c;
 color: white;
 padding: 1rem 1.5rem;
 border-radius: 0.5rem;
 box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
 display: flex;
 align-items: center;
 gap: 0.75rem;
 max-width: 400px;
 z-index: 1000;
 animation: slideInRight 0.3s ease;
}

.error-toast i {
 font-size: 1.2rem;
}

.close-btn {
 background: none;
 border: none;
 color: white;
 font-size: 1.5rem;
 cursor: pointer;
 padding: 0;
 margin-left: auto;
 opacity: 0.8;
 transition: opacity 0.3s ease;
}

.close-btn:hover {
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

/* Loading states */
.fa-spin {
 animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
 0% {
   transform: rotate(0deg);
 }
 100% {
   transform: rotate(360deg);
 }
}

/* Responsive */
@media (max-width: 1200px) {
.charts-section {
  grid-template-columns: 1fr;
}

.summary-cards {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
}

@media (max-width: 768px) {
.dashboard-admin {
  padding: 1rem;
}

.dashboard-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.header-content h1 {
  font-size: 2rem;
}

.stats-grid {
  grid-template-columns: 1fr;
}

.summary-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.summary-cards {
  grid-template-columns: 1fr;
}

.best-seller-badge {
  position: static;
  align-self: flex-end;
  margin-top: 0.5rem;
}

.summary-card {
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.quote-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.quote-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.quote-details {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.quote-status {
  align-self: flex-end;
}

.chart-wrapper {
  height: 250px;
}

.quotes-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.refresh-btn {
  align-self: stretch;
  justify-content: center;
}

.error-toast {
  top: 1rem;
  right: 1rem;
  left: 1rem;
  max-width: none;
}
}

@media (max-width: 480px) {
.stat-card {
  flex-direction: column;
  text-align: center;
}

.summary-card {
  text-align: center;
}

.chart-wrapper {
  height: 200px;
}

.quote-item {
  text-align: center;
}
}
</style>