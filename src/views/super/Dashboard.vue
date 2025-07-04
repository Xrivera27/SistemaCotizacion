<template>
  <div class="dashboard-supervisor">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
         Bienvenido, {{ nombreSuper }}
        </h1>
      </div>
      <div class="header-date">
        <i class="fas fa-calendar-day"></i>
        {{ fechaActual }}
      </div>
    </div>

    <!-- Tarjetas de estadísticas con acciones pendientes -->
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

      <div class="stat-card esperando-approval">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.esperandoAprobacion }}</h3>
          <p>Requieren Aprobación</p>
          <small>Acción inmediata requerida</small>
        </div>
      </div>

      <div class="stat-card efectiva">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.efectivas }}</h3>
          <p>Cotizaciones Efectivas</p>
          <small>Aprobadas y cerradas</small>
        </div>
      </div>

      <div class="stat-card cancelada">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.canceladas }}</h3>
          <p>Cotizaciones Canceladas</p>
          <small>Rechazadas o no viables</small>
        </div>
      </div>

      <div class="stat-card equipo">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.equipoActivo }}</h3>
          <p>Equipo Activo</p>
          <small>Usuarios Activos</small>
        </div>
      </div>
    </div>

    <!-- Gráficos principales -->
    <div class="charts-section">
      <div class="chart-container large">
        <div class="chart-header">
          <h3>
            Cotizaciones Efectivas vs Canceladas (Últimos 30 días)
          </h3>
  
        </div>
        <div class="chart-wrapper">
          <canvas ref="efectivasVsCanceladasChart"></canvas>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>
            Efectivas por Colaborador
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

        <div class="summary-card aprobaciones">
          <div class="summary-icon">
            <i class="fas fa-stamp"></i>
          </div>
          <div class="summary-info">
            <h4>Aprobaciones Realizadas</h4>
            <div class="summary-amount">{{ resumenMensual.aprobacionesRealizadas }}</div>
            <small>{{ getDescripcionMes() }}</small>
          </div>
        </div>

        <div class="summary-card mejor-vendedor">
          <div class="summary-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="summary-info">
            <h4>Top Vendedor</h4>
            <div class="summary-amount">{{ resumenMensual.mejorVendedor.nombre }}</div>
            <small>${{ formatearMoneda(resumenMensual.mejorVendedor.ventas) }} en ventas</small>
          </div>
          <div class="best-seller-badge">
            <i class="fas fa-star"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Cotizaciones que requieren aprobación -->
    <div class="approval-quotes">
      <div class="approval-header">
        <h3>
          <i class="fas fa-clipboard-check"></i>
          Cotizaciones Pendientes de Aprobación
        </h3>
        <button @click="actualizarCotizacionesPendientes" class="refresh-btn" :disabled="isLoading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          Actualizar
        </button>
      </div>
      
      <div class="quotes-list" v-if="cotizacionesPendientesAprobacion.length > 0">
        <div v-for="cotizacion in cotizacionesPendientesAprobacion" :key="cotizacion.id" class="quote-item approval-item">
          <div class="quote-icon esperando">
            <i class="fas fa-exclamation-triangle"></i>
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
            <div class="quote-priority" v-if="cotizacion.prioridad">
              <span class="priority-badge" :class="cotizacion.prioridad">
                {{ getPrioridadTexto(cotizacion.prioridad) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h4>¡Excelente!</h4>
        <p>No hay cotizaciones pendientes de aprobación en este momento.</p>
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
import SuperDashboardService from '@/services/superDashboard'

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
  name: 'SupervisorDashboard',
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
      nombreSuper: 'Supervisor', // Se actualizará con datos del usuario
      efectivasVsCanceladasChart: null,
      colaboradoresChart: null,
      serviciosChart: null,
      mesSeleccionado: 'actual',
      
      // Datos de la API
      estadisticas: {
        pendientes: 0,
        esperandoAprobacion: 0,
        efectivas: 0,
        canceladas: 0,
        equipoActivo: 0
      },
      resumenMensual: {
        ventasTotales: 0,
        aprobacionesRealizadas: 0,
        mejorVendedor: {
          nombre: 'Sin datos',
          ventas: 0
        }
      },
      cotizacionesCompletas: [],
      efectivasVsCanceladasData: null,
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
    },
    cotizacionesPendientesAprobacion() {
      return this.cotizacionesCompletas.filter(cotizacion => cotizacion.estado === 'esperando');
    }
  },
  async mounted() {
    // Cargar datos iniciales con loading
    await this.withLoading(async () => {
      await this.cargarDatosIniciales()
      await this.$nextTick()
      this.initCharts()
    }, 'Cargando dashboard supervisor...')
  },
  beforeUnmount() {
    this.destroyCharts()
  },
  methods: {
    // ===== MÉTODOS DE CARGA DE DATOS =====
    
    async cargarDatosIniciales() {
      try {
        console.log('🚀 Cargando datos iniciales del dashboard supervisor...')
        
        // Usar el endpoint optimizado del supervisor
        const result = await SuperDashboardService.getAllDashboardData(this.mesSeleccionado, 30)
        
        if (result.success) {
          const { data } = result
          
          // Actualizar todas las secciones
          this.estadisticas = data.stats || this.estadisticas
          this.efectivasVsCanceladasData = data.efectivasVsCanceladas
          this.colaboradoresData = data.colaboradoresChart
          this.serviciosData = data.serviciosChart
          this.resumenMensual = data.resumenMensual || this.resumenMensual
          this.cotizacionesCompletas = data.cotizacionesPendientes || []
          
          console.log('✅ Todos los datos del supervisor cargados exitosamente')
        } else {
          this.mostrarError(result.message || 'Error cargando datos del dashboard')
          // Cargar datos individuales como fallback
          await this.cargarDatosIndividuales()
        }
      } catch (error) {
        console.error('❌ Error cargando datos iniciales supervisor:', error)
        this.mostrarError('Error de conexión al cargar dashboard')
        await this.cargarDatosIndividuales()
      }
    },
    
    async cargarDatosIndividuales() {
      try {
        console.log('🔄 Cargando datos individualmente...')
        
        // Cargar cada sección por separado
        const [statsResult, efectivasVsCanceladasResult, colaboradoresResult, serviciosResult, resumenResult, cotizacionesResult] = 
          await Promise.allSettled([
            SuperDashboardService.getSuperUsuarioStats(),
            SuperDashboardService.getEfectivasVsCanceladas(30),
            SuperDashboardService.getColaboradoresChart(),
            SuperDashboardService.getServiciosChart(),
            SuperDashboardService.getResumenMensual(this.mesSeleccionado),
            SuperDashboardService.getCotizacionesPendientesAprobacion()
          ])
        
        // Procesar resultados
        if (statsResult.status === 'fulfilled' && statsResult.value.success) {
          this.estadisticas = statsResult.value.stats
        }
        
        if (efectivasVsCanceladasResult.status === 'fulfilled' && efectivasVsCanceladasResult.value.success) {
          this.efectivasVsCanceladasData = efectivasVsCanceladasResult.value.chartData
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
          this.cotizacionesCompletas = cotizacionesResult.value.cotizaciones
        }
        
        console.log('✅ Datos individuales cargados')
      } catch (error) {
        console.error('❌ Error cargando datos individuales:', error)
        this.mostrarError('Error cargando algunos datos del dashboard')
      }
    },

    // ===== MÉTODOS DE GRÁFICOS =====
    
    initCharts() {
      try {
        this.destroyCharts() // Limpiar gráficos existentes
        this.createEfectivasVsCanceladasChart()
        this.createColaboradoresChart()
        this.createServiciosChart()
      } catch (error) {
        console.error('Error al inicializar gráficos:', error)
        this.mostrarError('Error inicializando gráficos')
      }
    },
    
    createEfectivasVsCanceladasChart() {
      const ctx = this.$refs.efectivasVsCanceladasChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas')
        return
      }
      
      // Usar datos reales de la API
      const chartData = this.efectivasVsCanceladasData || {
        labels: ['Sin datos'],
        efectivas: [0],
        canceladas: [0]
      }
      
      this.efectivasVsCanceladasChart = new Chart(ctx, {
        type: 'line',
        data: SuperDashboardService.formatComparativeChartData(chartData),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y}`
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
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
        }
      })
    },
    
    createColaboradoresChart() {
      const ctx = this.$refs.colaboradoresChart?.getContext('2d')
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas')
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
        console.error('No se pudo obtener el contexto del canvas')
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
                  size: 10
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
      if (this.efectivasVsCanceladasChart) {
        this.efectivasVsCanceladasChart.destroy()
        this.efectivasVsCanceladasChart = null
      }
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
    
    async actualizarGraficoComparativo() {
      await this.withLoadingKey('grafico-comparativo', async () => {
        try {
          const result = await SuperDashboardService.getEfectivasVsCanceladas(30)
          
          if (result.success) {
            this.efectivasVsCanceladasData = result.chartData
            this.createEfectivasVsCanceladasChart()
            console.log('✅ Gráfico comparativo actualizado')
          } else {
            this.mostrarError(result.message || 'Error actualizando gráfico comparativo')
          }
        } catch (error) {
          console.error('❌ Error actualizando gráfico comparativo:', error)
          this.mostrarError('Error de conexión al actualizar gráfico')
        }
      }, 'Actualizando gráfico comparativo...')
    },

    async actualizarDatosColaboradores() {
      await this.withLoadingKey('colaboradores', async () => {
        try {
          const result = await SuperDashboardService.getColaboradoresChart()
          
          if (result.success) {
            this.colaboradoresData = result.chartData
            this.createColaboradoresChart()
            console.log('✅ Datos de colaboradores actualizados')
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
          const result = await SuperDashboardService.getServiciosChart()
          
          if (result.success) {
            this.serviciosData = result.chartData
            this.createServiciosChart()
            console.log('✅ Datos de servicios actualizados')
          } else {
            this.mostrarError(result.message || 'Error actualizando datos de servicios')
          }
        } catch (error) {
          console.error('❌ Error actualizando servicios:', error)
          this.mostrarError('Error de conexión al actualizar servicios')
        }
      }, 'Actualizando datos de servicios...')
    },

    async actualizarCotizacionesPendientes() {
      await this.withLoadingKey('cotizaciones-pendientes', async () => {
        try {
          const result = await SuperDashboardService.getCotizacionesPendientesAprobacion()
          
          if (result.success) {
            this.cotizacionesCompletas = result.cotizaciones
            console.log('✅ Cotizaciones pendientes actualizadas')
          } else {
            this.mostrarError(result.message || 'Error actualizando cotizaciones pendientes')
          }
        } catch (error) {
          console.error('❌ Error actualizando cotizaciones pendientes:', error)
          this.mostrarError('Error de conexión al actualizar cotizaciones')
        }
      }, 'Actualizando cotizaciones pendientes...')
    },
    
    async actualizarResumenMensual() {
      await this.withLoading(async () => {
        try {
          const result = await SuperDashboardService.getResumenMensual(this.mesSeleccionado)
          
          if (result.success) {
            this.resumenMensual = result.resumen
            console.log('✅ Resumen mensual actualizado')
          } else {
            this.mostrarError(result.message || 'Error actualizando resumen mensual')
          }
        } catch (error) {
          console.error('❌ Error actualizando resumen:', error)
          this.mostrarError('Error de conexión al actualizar resumen')
        }
      }, 'Cargando resumen mensual...')
    },

    // ===== MÉTODOS DE APROBACIÓN/RECHAZO =====
    
    async verCotizacion(cotizacion) {
      await this.withLoading(async () => {
        // Simular carga de detalles (aquí puedes agregar navegación al detalle)
        await new Promise(resolve => setTimeout(resolve, 500))
        alert(`Viendo detalles de ${cotizacion.codigo}\n\nCliente: ${cotizacion.cliente}\nVendedor: ${cotizacion.vendedor}\nMonto: $${this.formatearMoneda(cotizacion.monto)}`)
      }, 'Cargando detalles...')
    },
    
    async aprobarCotizacion(id) {
      const index = this.cotizacionesCompletas.findIndex(c => c.id === id)
      if (index !== -1) {
        const cotizacion = this.cotizacionesCompletas[index]
        
        const confirmacion = SuperDashboardService.getConfirmacionAprobacion(cotizacion)
        if (confirm(confirmacion)) {
          await this.withLoading(async () => {
            const result = await SuperDashboardService.aprobarCotizacion(id)
            
            if (result.success) {
              // Remover de la lista de pendientes
              this.cotizacionesCompletas.splice(index, 1)
              
              // Actualizar estadísticas
              this.estadisticas.esperandoAprobacion--
              this.estadisticas.efectivas++
              
              alert(`✅ Cotización ${cotizacion.codigo} aprobada exitosamente`)
            } else {
              this.mostrarError(result.message || 'Error aprobando cotización')
            }
          }, 'Procesando aprobación...')
        }
      }
    },
    
    async rechazarCotizacion(id) {
      const index = this.cotizacionesCompletas.findIndex(c => c.id === id)
      if (index !== -1) {
        const cotizacion = this.cotizacionesCompletas[index]
        
        const motivo = prompt(`Ingrese el motivo del rechazo para ${cotizacion.codigo}:`)
        
        // Validar motivo
        const validacion = SuperDashboardService.validarMotivoRechazo(motivo)
        if (!validacion.valido) {
          alert(validacion.mensaje)
          return
        }
        
        await this.withLoading(async () => {
          const result = await SuperDashboardService.rechazarCotizacion(id, motivo)
          
          if (result.success) {
            // Remover de la lista de pendientes
            this.cotizacionesCompletas.splice(index, 1)
            
            // Actualizar estadísticas
            this.estadisticas.esperandoAprobacion--
            this.estadisticas.canceladas++
            
            alert(`❌ Cotización ${cotizacion.codigo} rechazada`)
          } else {
            this.mostrarError(result.message || 'Error rechazando cotización')
          }
        }, 'Procesando rechazo...')
      }
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
      return SuperDashboardService.formatTiempoEspera(fecha)
    },
    
    getPrioridadTexto(prioridad) {
     return SuperDashboardService.getPrioridadTexto(prioridad)
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
.dashboard-supervisor {
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
 color: #8e44ad;
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
 background: #8e44ad;
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
 background: #7d3f98;
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

.approval-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1rem;
}

.approval-header h3 {
 color: #2c3e50;
 margin: 0;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.approval-header h3 i {
 color: #e74c3c;
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
 position: relative;
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

.stat-card.esperando-approval .stat-icon {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.stat-card.efectiva .stat-icon {
 background: linear-gradient(135deg, #27ae60, #229954);
}

.stat-card.cancelada .stat-icon {
 background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.stat-card.equipo .stat-icon {
 background: linear-gradient(135deg, #3498db, #2980b9);
}

.stat-card.rendimiento .stat-icon {
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

.action-badge {
 position: absolute;
 top: 1rem;
 right: 1rem;
 background: #e74c3c;
 color: white;
 border-radius: 50%;
 width: 30px;
 height: 30px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 0.9rem;
 animation: pulse 2s infinite;
}

@keyframes pulse {
 0% { transform: scale(1); }
 50% { transform: scale(1.1); }
 100% { transform: scale(1); }
}

/* Charts Section */
.charts-section {
 display: grid;
 grid-template-columns: 2fr 1fr 1fr;
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

.chart-container.large {
 grid-row: span 2;
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
 font-size: 1rem;
}

.chart-header h3 i {
 color: #8e44ad;
}

.chart-wrapper {
 position: relative;
 height: 300px;
 width: 100%;
}

.large .chart-wrapper {
 height: 400px;
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
 border-color: #8e44ad;
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

.aprobaciones .summary-icon {
 background: linear-gradient(135deg, #8e44ad, #9b59b6);
}

.tiempo-respuesta .summary-icon {
 background: linear-gradient(135deg, #3498db, #2980b9);
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

.best-seller-badge {
 position: absolute;
 top: 1rem;
 right: 1rem;
 color: #f39c12;
 font-size: 1.2rem;
}

/* Approval Quotes Section */
.approval-quotes {
 margin-bottom: 2rem;
}

.approval-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1rem;
}

.approval-header h3 {
 color: #2c3e50;
 margin: 0;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.approval-header h3 i {
 color: #e74c3c;
}

.approval-count {
 display: flex;
 align-items: center;
}

.count-badge {
 background: #e74c3c;
 color: white;
 padding: 0.25rem 0.75rem;
 border-radius: 15px;
 font-size: 0.9rem;
 font-weight: 600;
 min-width: 25px;
 text-align: center;
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

.approval-item {
 border-left: 4px solid #e74c3c;
 background: #fefefe;
}

.approval-item:hover {
 background-color: #fff8f8;
 border-left-color: #c0392b;
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

.quote-icon.esperando {
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
 margin-bottom: 0.5rem;
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

.quote-priority {
 margin-top: 0.5rem;
}

.priority-badge {
 padding: 0.2rem 0.6rem;
 border-radius: 12px;
 font-size: 0.75rem;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.priority-badge.alta {
 background: #ffebee;
 color: #c62828;
 border: 1px solid #ef5350;
}

.priority-badge.media {
 background: #fff3e0;
 color: #ef6c00;
 border: 1px solid #ff9800;
}

.priority-badge.baja {
 background: #e8f5e8;
 color: #2e7d32;
 border: 1px solid #4caf50;
}

.quote-actions {
 display: flex;
 gap: 0.5rem;
 align-items: center;
 flex-shrink: 0;
}

.btn-action {
 width: 42px;
 height: 42px;
 border: none;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
 transition: all 0.3s ease;
 font-size: 1rem;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-action:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 transform: none !important;
}

.btn-view {
 background: #3498db;
 color: white;
}

.btn-view:hover:not(:disabled) {
 background: #2980b9;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-approve {
 background: #27ae60;
 color: white;
}

.btn-approve:hover:not(:disabled) {
 background: #229954;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-reject {
 background: #e74c3c;
 color: white;
}

.btn-reject:hover:not(:disabled) {
 background: #c0392b;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Empty State */
.empty-state {
 text-align: center;
 padding: 3rem 2rem;
 background: white;
 border-radius: 1rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
 border: 1px solid #e9ecef;
}

.empty-icon {
 width: 80px;
 height: 80px;
 border-radius: 50%;
 background: linear-gradient(135deg, #27ae60, #229954);
 color: white;
 display: flex;
 align-items: center;
 justify-content: center;
 margin: 0 auto 1rem;
 font-size: 2rem;
}

.empty-state h4 {
 color: #27ae60;
 margin: 0 0 0.5rem 0;
 font-size: 1.5rem;
}

.empty-state p {
 color: #7f8c8d;
 margin: 0;
 font-size: 1rem;
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
 .dashboard-supervisor {
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

 .approval-header {
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

 .quote-actions {
   flex-direction: column;
   gap: 0.3rem;
   align-self: flex-end;
 }

 .btn-action {
   width: 38px;
   height: 38px;
   font-size: 0.9rem;
 }

 .chart-wrapper {
   height: 250px;
 }

 .large .chart-wrapper {
   height: 300px;
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

 .quote-actions {
   flex-direction: row;
   justify-content: center;
   width: 100%;
 }

 .chart-wrapper {
   height: 200px;
 }

 .large .chart-wrapper {
   height: 250px;
 }
}
</style>