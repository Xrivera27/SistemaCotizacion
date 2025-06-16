<template>
  <div class="dashboard-vendedor">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
          Bienvenido, {{ nombreVendedor }}
        </h1>
      </div>
      <div class="header-date">
        <i class="fas fa-calendar-day"></i>
        {{ fechaActual }}
      </div>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <div class="stat-card pendiente">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.pendientes }}</h3>
          <p>Cotizaciones Pendientes</p>
          <small>En proceso de revisión</small>
        </div>
      </div>

      <div class="stat-card esperando">
        <div class="stat-icon">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.esperandoAprobacion }}</h3>
          <p>Esperando Aprobación</p>
          <small>Requieren supervisión</small>
        </div>
      </div>

      <div class="stat-card efectiva">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.efectivas }}</h3>
          <p>Cotizaciones Efectivas</p>
          <small>Aceptadas por clientes</small>
        </div>
      </div>

      <div class="stat-card cancelada">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.canceladas }}</h3>
          <p>Cotizaciones Canceladas</p>
          <small>Rechazadas por clientes</small>
        </div>
      </div>
    </div>

    <!-- Gráficos y métricas -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>
            Ventas Efectivas vs Rechazadas (Últimos 7 días)
          </h3>
          <button @click="actualizarGraficoVentas" class="refresh-btn">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="chart-wrapper">
          <canvas ref="ventasChart"></canvas>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>
            Distribución de Estados
          </h3>
          <button @click="actualizarGraficoEstados" class="refresh-btn">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="chart-wrapper">
          <canvas ref="estadosChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Resumen de Ventas -->
    <div class="sales-summary">
      <div class="summary-header">
        <h3>
          Resumen de Ventas Aprobadas
        </h3>
        <div class="period-selector">
          <select v-model="periodoVentas" @change="actualizarResumenVentas" class="period-select">
            <option value="semana">Esta Semana</option>
            <option value="quincena">Esta Quincena</option>
            <option value="mes">Este Mes</option>
          </select>
        </div>
      </div>
      
      <div class="summary-cards">
        <div class="summary-card total-sales">
          <div class="summary-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="summary-info">
            <h4>Total de Ventas</h4>
            <div class="summary-amount">${{ formatearMoneda(resumenVentas.totalVentas) }}</div>
            <small>{{ getDescripcionPeriodo() }}</small>
          </div>
        </div>

        <div class="summary-card total-quotes">
          <div class="summary-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="summary-info">
            <h4>Cotizaciones Aprobadas</h4>
            <div class="summary-amount">{{ resumenVentas.cotizacionesAprobadas }}</div>
            <small>{{ getDescripcionPeriodo() }}</small>
          </div>
        </div>
      </div>
    </div>

   
    <!-- Últimas cotizaciones creadas -->
    <div class="recent-quotes">
      <div class="quotes-header">
        <h3>
          <i class="fas fa-file-invoice-dollar"></i>
          Últimas Cotizaciones Creadas
        </h3>
        <button @click="actualizarCotizaciones" class="refresh-btn">
          <i class="fas fa-sync-alt"></i>
          Actualizar
        </button>
      </div>
      <div class="quotes-list">
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
            <small class="quote-date">Creada {{ formatearTiempo(cotizacion.fechaCreacion) }}</small>
          </div>
          <div class="quote-status" :class="cotizacion.estado">
            {{ getEstadoTexto(cotizacion.estado) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Modal -->
    <LoadingModal 
      :is-loading="isLoading" 
      :message="loadingMessage"
      :cancellable="false"
    />
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
  DoughnutController
} from 'chart.js'

import { useLoading } from '@/utils/useLoading'

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
  DoughnutController
)

export default {
  name: 'VendedorDashboard',
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
      nombreVendedor: 'Carlos Mendoza',
      ventasChart: null,
      estadosChart: null,
      periodoVentas: 'mes',
      estadisticas: {
        pendientes: 8,
        esperandoAprobacion: 3,
        efectivas: 15,
        canceladas: 5
      },
      metricas: {
        ingresosMes: 125000,
        cambioMes: 12.5,
        tasaConversion: 65,
        tiempoRespuesta: 2.3
      },
      resumenVentas: {
        totalVentas: 1250000,
        cotizacionesAprobadas: 15,
        promedioVenta: 83333,
        tasaConversion: 68,
        cambioVentas: 12.5,
        cambioCotizaciones: 8.3,
        cambioPromedio: 15.2,
        cambioConversion: 5.1
      },
      datosVentasPorPeriodo: {
        semana: {
          totalVentas: 285000,
          cotizacionesAprobadas: 4,
          promedioVenta: 71250,
          tasaConversion: 72,
          cambioVentas: 18.2,
          cambioCotizaciones: 12.5,
          cambioPromedio: 22.3,
          cambioConversion: 8.7
        },
        quincena: {
          totalVentas: 620000,
          cotizacionesAprobadas: 8,
          promedioVenta: 77500,
          tasaConversion: 70,
          cambioVentas: 15.8,
          cambioCotizaciones: 10.2,
          cambioPromedio: 18.5,
          cambioConversion: 6.9
        },
        mes: {
          totalVentas: 1250000,
          cotizacionesAprobadas: 15,
          promedioVenta: 83333,
          tasaConversion: 68,
          cambioVentas: 12.5,
          cambioCotizaciones: 8.3,
          cambioPromedio: 15.2,
          cambioConversion: 5.1
        }
      },
      ultimasCotizaciones: [
        {
          id: 1,
          codigo: 'COT-2025-018',
          cliente: 'Empresa ABC S.A.',
          monto: 125000,
          fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estado: 'pendiente'
        },
        {
          id: 2,
          codigo: 'COT-2025-017',
          cliente: 'TechCorp Solutions',
          monto: 45000,
          fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
          estado: 'esperando'
        },
        {
          id: 3,
          codigo: 'COT-2025-016',
          cliente: 'Innovaciones del Norte',
          monto: 78500,
          fechaCreacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
          estado: 'efectiva'
        },
        {
          id: 4,
          codigo: 'COT-2025-015',
          cliente: 'Comercial Sur Ltda.',
          monto: 32000,
          fechaCreacion: new Date(Date.now() - 8 * 60 * 60 * 1000),
          estado: 'cancelada'
        },
        {
          id: 5,
          codigo: 'COT-2025-014',
          cliente: 'Grupo Empresarial XYZ',
          monto: 156000,
          fechaCreacion: new Date(Date.now() - 12 * 60 * 60 * 1000),
          estado: 'efectiva'
        }
      ]
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
    // Cargar datos iniciales con loading
    await this.withLoading(async () => {
      await this.cargarDatosIniciales()
      await this.$nextTick()
      this.initCharts()
    }, 'Cargando dashboard vendedor...')
  },
  beforeUnmount() {
    if (this.ventasChart) {
      this.ventasChart.destroy()
    }
    if (this.estadosChart) {
      this.estadosChart.destroy()
    }
  },
  methods: {
    // Simular carga de datos iniciales
    async cargarDatosIniciales() {
      await new Promise(resolve => setTimeout(resolve, 1300))
      console.log('Datos iniciales del vendedor cargados')
    },

    initCharts() {
      try {
        this.createVentasChart()
        this.createEstadosChart()
      } catch (error) {
        console.error('Error al inicializar gráficos:', error)
      }
    },
    
    createVentasChart() {
      const ctx = this.$refs.ventasChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas')
        return
      }
      
      const labels = this.generateDateLabels()
      const ventasEfectivas = [12, 8, 15, 10, 18, 14, 20]
      const ventasNegativas = [3, 5, 2, 7, 4, 6, 3]
      
      this.ventasChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ventas Efectivas',
              data: ventasEfectivas,
              borderColor: '#27ae60',
              backgroundColor: 'rgba(39, 174, 96, 0.1)',
              tension: 0.4
            },
            {
              label: 'Ventas Rechazadas',
              data: ventasNegativas,
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
        }
      })
    },
    
    createEstadosChart() {
      const ctx = this.$refs.estadosChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas')
        return
      }
      
      this.estadosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pendientes', 'Esperando Aprobación', 'Efectivas', 'Canceladas'],
          datasets: [{
            data: [
              this.estadisticas.pendientes,
              this.estadisticas.esperandoAprobacion,
              this.estadisticas.efectivas,
              this.estadisticas.canceladas
            ],
            backgroundColor: [
              '#f39c12',
              '#e67e22',
              '#27ae60',
              '#e74c3c'
            ],
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
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      })
    },

    // Métodos con loading para actualizar datos
    async actualizarGraficoVentas() {
      await this.withLoadingKey('grafico-ventas', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Gráfico de ventas actualizado')
      }, 'Actualizando gráfico de ventas...')
    },

    async actualizarGraficoEstados() {
      await this.withLoadingKey('grafico-estados', async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('Gráfico de estados actualizado')
      }, 'Actualizando distribución de estados...')
    },

    async actualizarCotizaciones() {
      await this.withLoadingKey('cotizaciones', async () => {
        await new Promise(resolve => setTimeout(resolve, 1200))
        console.log('Lista de cotizaciones actualizada')
      }, 'Actualizando cotizaciones...')
    },

    // Acciones rápidas con loading
    async nuevaCotizacion() {
      await this.withLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        alert('Redirigiendo a crear nueva cotización...')
      }, 'Preparando formulario...')
    },

    async verCotizaciones() {
      await this.withLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 600))
        alert('Cargando lista de cotizaciones...')
      }, 'Cargando cotizaciones...')
    },

    async generarReporte() {
      await this.withLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('Reporte generado exitosamente')
      }, 'Generando reporte de ventas...')
    },
    
    generateDateLabels() {
      const labels = []
      
      // Fijo en 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }))
      }
      
      return labels
    },
    
    async actualizarResumenVentas() {
      await this.withLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 700))
        this.resumenVentas = { ...this.datosVentasPorPeriodo[this.periodoVentas] }
      }, 'Actualizando resumen de ventas...')
    },
    
    getDescripcionPeriodo() {
      const descripciones = {
        semana: 'en esta semana',
        quincena: 'en esta quincena',
        mes: 'en este mes'
      }
      return descripciones[this.periodoVentas]
    },
    
    formatearMoneda(cantidad) {
      return cantidad.toLocaleString('es-ES')
    },
    
    formatearTiempo(fecha) {
      const ahora = new Date()
      const diferencia = ahora - fecha
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
    }
  }
}
</script>

<style scoped>
.dashboard-vendedor {
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

.refresh-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
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

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-actions h3 i {
  color: #3498db;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
  flex-shrink: 0;
}

.nueva-cotizacion .action-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.ver-cotizaciones .action-icon {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.generar-reporte .action-icon {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.configuracion .action-icon {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.action-content h4 {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.action-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
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

.period-selector .period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: white;
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.period-selector .period-select:focus {
  outline: none;
  border-color: #3498db;
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

.total-sales .summary-icon {
 background: linear-gradient(135deg, #27ae60, #229954);
}

.total-quotes .summary-icon {
 background: linear-gradient(135deg, #3498db, #2980b9);
}

.average-sale .summary-icon {
 background: linear-gradient(135deg, #f39c12, #e67e22);
}

.conversion-rate .summary-icon {
 background: linear-gradient(135deg, #9b59b6, #8e44ad);
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

.summary-change {
position: absolute;
top: 1rem;
right: 1rem;
padding: 0.25rem 0.5rem;
border-radius: 0.5rem;
font-size: 0.8rem;
font-weight: 600;
display: flex;
align-items: center;
gap: 0.25rem;
}

.summary-change.positive {
background: #d4edda;
color: #155724;
}

.summary-change.negative {
background: #f8d7da;
color: #721c24;
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
.dashboard-vendedor {
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

.actions-grid {
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

.summary-change {
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
}

@media (max-width: 480px) {
.stat-card {
  flex-direction: column;
  text-align: center;
}

.action-card {
  flex-direction: column;
  text-align: center;
}

.summary-card {
  text-align: center;
}

.chart-wrapper {
  height: 200px;
}
}
</style>