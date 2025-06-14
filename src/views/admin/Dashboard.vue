<template>
  <div class="dashboard-admin">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
          Bienvenido, {{ nombreAdmin }}
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
          <small>Vendedores trabajando este momento</small>
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
          <select v-model="mesSeleccionado" @change="actualizarResumenMensual" class="month-select">
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

    <!-- Actividad reciente del sistema -->
    <div class="system-activity">
      <h3>
        Actividad Reciente del Sistema
      </h3>
      <div class="activity-list">
        <div v-for="actividad in actividadSistema" :key="actividad.id" class="activity-item">
          <div class="activity-icon" :class="actividad.tipo">
            <i class="fas" :class="getActivityIcon(actividad.tipo)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-description">{{ actividad.descripcion }}</p>
            <small class="activity-time">{{ formatearTiempo(actividad.fecha) }}</small>
          </div>
          <div class="activity-status" :class="actividad.prioridad">
            {{ actividad.prioridad }}
          </div>
        </div>
      </div>
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
  data() {
    return {
      nombreAdmin: 'Juan Pérez',
      colaboradoresChart: null,
      serviciosChart: null,
      mesSeleccionado: 'actual',
      estadisticas: {
        pendientes: 24,
        esperandoAprobacion: 8,
        efectivas: 45,
        canceladas: 12,
        colaboradoresActivos: 8,
        tasaConversion: 72
      },
      resumenMensual: {
        ventasTotales: 3750000,
        metaMensual: 4000000,
        porcentajeMeta: 94,
        promedioColaborador: 468750,
        cambioVentas: 18.5,
        cambioPromedio: 12.3,
        mejorVendedor: {
          nombre: 'Carlos Mendoza',
          ventas: 850000
        }
      },
      datosMensuales: {
        actual: {
          ventasTotales: 3750000,
          metaMensual: 4000000,
          porcentajeMeta: 94,
          promedioColaborador: 468750,
          cambioVentas: 18.5,
          cambioPromedio: 12.3,
          mejorVendedor: {
            nombre: 'Carlos Mendoza',
            ventas: 850000
          }
        },
        anterior: {
          ventasTotales: 3200000,
          metaMensual: 3500000,
          porcentajeMeta: 91,
          promedioColaborador: 400000,
          cambioVentas: 8.2,
          cambioPromedio: 5.7,
          mejorVendedor: {
            nombre: 'Ana García',
            ventas: 720000
          }
        },
        hace2: {
          ventasTotales: 2950000,
          metaMensual: 3500000,
          porcentajeMeta: 84,
          promedioColaborador: 368750,
          cambioVentas: -2.1,
          cambioPromedio: -1.8,
          mejorVendedor: {
            nombre: 'Luis Rodríguez',
            ventas: 680000
          }
        }
      },
      actividadSistema: [
        {
          id: 1,
          tipo: 'aprobacion',
          descripcion: 'Cotización COT-2025-024 requiere aprobación - Monto: $180,000',
          fecha: new Date(Date.now() - 30 * 60 * 1000),
          prioridad: 'alta'
        },
        {
          id: 2,
          tipo: 'venta',
          descripcion: 'Nueva venta confirmada por María López - $95,000',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          prioridad: 'normal'
        },
        {
          id: 3,
          tipo: 'meta',
          descripcion: 'El equipo alcanzó el 94% de la meta mensual',
          fecha: new Date(Date.now() - 4 * 60 * 60 * 1000),
          prioridad: 'baja'
        },
        {
          id: 4,
          tipo: 'sistema',
          descripcion: 'Backup automático del sistema completado exitosamente',
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          prioridad: 'baja'
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
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  beforeUnmount() {
    if (this.colaboradoresChart) {
      this.colaboradoresChart.destroy();
    }
    if (this.serviciosChart) {
      this.serviciosChart.destroy();
    }
  },
  methods: {
    initCharts() {
      try {
        this.createColaboradoresChart();
        this.createServiciosChart();
      } catch (error) {
        console.error('Error al inicializar gráficos:', error);
      }
    },
    
    createColaboradoresChart() {
      const ctx = this.$refs.colaboradoresChart?.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }
      
      const colaboradores = ['Carlos M.', 'Ana G.', 'Luis R.', 'María L.', 'Pedro S.', 'Laura T.', 'José F.', 'Carmen D.'];
      const cotizacionesEfectivas = [25, 22, 19, 18, 16, 15, 12, 8];
      
      this.colaboradoresChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: colaboradores,
          datasets: [{
            label: 'Cotizaciones Efectivas',
            data: cotizacionesEfectivas,
            backgroundColor: [
              '#27ae60',
              '#2ecc71',
              '#3498db',
              '#9b59b6',
              '#f39c12',
              '#e67e22',
              '#e74c3c',
              '#95a5a6'
            ],
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
                display: false
              }
            }
          }
        }
      });
    },
    
    createServiciosChart() {
      const ctx = this.$refs.serviciosChart?.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }
      
      this.serviciosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Desarrollo Web', 'Marketing Digital', 'Consultoría', 'Diseño Gráfico', 'E-commerce', 'Otros'],
          datasets: [{
            data: [35, 25, 18, 12, 8, 2],
            backgroundColor: [
              '#3498db',
              '#27ae60',
              '#f39c12',
              '#9b59b6',
              '#e74c3c',
              '#95a5a6'
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
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    },
    
    actualizarResumenMensual() {
      this.resumenMensual = { ...this.datosMensuales[this.mesSeleccionado] };
    },
    
    getDescripcionMes() {
      const descripciones = {
        actual: 'este mes',
        anterior: 'mes anterior', 
        hace2: 'hace 2 meses'
      };
      return descripciones[this.mesSeleccionado];
    },
    
    formatearMoneda(cantidad) {
      return cantidad.toLocaleString('es-ES');
    },
    
    formatearTiempo(fecha) {
      const ahora = new Date();
      const diferencia = ahora - fecha;
      const minutos = Math.floor(diferencia / (1000 * 60));
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      
      if (minutos < 60) {
        return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
      } else if (horas < 24) {
        return `hace ${horas} hora${horas !== 1 ? 's' : ''}`;
      } else {
        const dias = Math.floor(horas / 24);
        return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
      }
    },
    
    getActivityIcon(tipo) {
      const iconos = {
        aprobacion: 'fa-exclamation-triangle',
        venta: 'fa-handshake',
        meta: 'fa-target',
        sistema: 'fa-server'
      };
      return iconos[tipo] || 'fa-info-circle';
    }
  }
}
</script>

<style scoped>
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

.meta-mensual .summary-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.promedio-colaborador .summary-icon {
  background: linear-gradient(135deg, #f39c12, #e67e22);
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

.meta-progress {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 80px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.3s ease;
}

.best-seller-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #f39c12;
  font-size: 1.2rem;
}

/* Admin Actions */
.admin-actions {
  margin-bottom: 2rem;
}

.admin-actions h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-actions h3 i {
  color: #3498db;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  position: relative;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

.supervisar .action-icon {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.reportes .action-icon {
 background: linear-gradient(135deg, #27ae60, #229954);
}

.colaboradores-manage .action-icon {
 background: linear-gradient(135deg, #3498db, #2980b9);
}

.configuracion .action-icon {
 background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.action-content {
 flex: 1;
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

.action-badge {
 position: absolute;
 top: -5px;
 right: -5px;
 background: #e74c3c;
 color: white;
 border-radius: 50%;
 width: 25px;
 height: 25px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 0.8rem;
 font-weight: 600;
}

/* System Activity */
.system-activity h3 {
 color: #2c3e50;
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.system-activity h3 i {
 color: #3498db;
}

.activity-list {
 background: white;
 border-radius: 1rem;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
 border: 1px solid #e9ecef;
 overflow: hidden;
}

.activity-item {
 display: flex;
 align-items: center;
 padding: 1rem 1.5rem;
 border-bottom: 1px solid #f8f9fa;
 gap: 1rem;
 transition: background-color 0.3s ease;
}

.activity-item:hover {
 background-color: #f8f9fa;
}

.activity-item:last-child {
 border-bottom: none;
}

.activity-icon {
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

.activity-icon.aprobacion {
 background: #e74c3c;
}

.activity-icon.venta {
 background: #27ae60;
}

.activity-icon.meta {
 background: #3498db;
}

.activity-icon.sistema {
 background: #95a5a6;
}

.activity-content {
 flex: 1;
}

.activity-description {
 color: #2c3e50;
 margin: 0 0 0.25rem 0;
 font-weight: 500;
 font-size: 0.95rem;
}

.activity-time {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.activity-status {
 padding: 0.25rem 0.75rem;
 border-radius: 15px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: uppercase;
 white-space: nowrap;
}

.activity-status.alta {
 background: #f8d7da;
 color: #721c24;
}

.activity-status.normal {
 background: #fff3cd;
 color: #856404;
}

.activity-status.baja {
 background: #d4edda;
 color: #155724;
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

 .meta-progress {
   position: static;
   margin-top: 0.5rem;
   width: 100%;
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

 .activity-item {
   flex-direction: column;
   align-items: flex-start;
   gap: 0.75rem;
 }

 .activity-status {
   align-self: flex-end;
 }

 .chart-wrapper {
   height: 250px;
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