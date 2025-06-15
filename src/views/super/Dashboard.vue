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
          <small>Vendedores bajo supervisión</small>
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
          <div class="quote-actions">
            <button class="btn-action btn-view" @click="verCotizacion(cotizacion)" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-action btn-approve" @click="aprobarCotizacion(cotizacion.id)" title="Aprobar">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn-action btn-reject" @click="rechazarCotizacion(cotizacion.id)" title="Rechazar">
              <i class="fas fa-times"></i>
            </button>
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
  name: 'SupervisorDashboard',
  data() {
    return {
      nombreSuper: 'Roberto Fernández',
      efectivasVsCanceladasChart: null,
      colaboradoresChart: null,
      serviciosChart: null,
      mesSeleccionado: 'actual',
      estadisticas: {
        pendientes: 12,
        esperandoAprobacion: 5,
        efectivas: 28,
        canceladas: 8,
        equipoActivo: 6,
        tasaAprobacion: 85
      },
      resumenMensual: {
        ventasTotales: 2850000,
        aprobacionesRealizadas: 42,
        tiempoPromedioAprobacion: 2.5,
        cambioVentas: 15.3,
        cambioAprobaciones: 18.7,
        cambioTiempo: -12.5,
        mejorVendedor: {
          nombre: 'Carlos Mendoza',
          ventas: 680000
        }
      },
      datosMensuales: {
        actual: {
          ventasTotales: 2850000,
          aprobacionesRealizadas: 42,
          tiempoPromedioAprobacion: 2.5,
          cambioVentas: 15.3,
          cambioAprobaciones: 18.7,
          cambioTiempo: -12.5,
          mejorVendedor: {
            nombre: 'Carlos Mendoza',
            ventas: 680000
          }
        },
        anterior: {
          ventasTotales: 2470000,
          aprobacionesRealizadas: 35,
          tiempoPromedioAprobacion: 2.8,
          cambioVentas: 8.9,
          cambioAprobaciones: 12.3,
          cambioTiempo: -8.2,
          mejorVendedor: {
            nombre: 'Ana García',
            ventas: 590000
          }
        },
        hace2: {
          ventasTotales: 2260000,
          aprobacionesRealizadas: 31,
          tiempoPromedioAprobacion: 3.1,
          cambioVentas: -3.2,
          cambioAprobaciones: -5.1,
          cambioTiempo: 15.8,
          mejorVendedor: {
            nombre: 'Luis Rodríguez',
            ventas: 520000
          }
        }
      },
      cotizacionesCompletas: [
        {
          id: 1,
          codigo: 'COT-2025-032',
          cliente: 'TechCorp Internacional',
          vendedor: 'Carlos Mendoza',
          monto: 195000,
          fechaCreacion: new Date(Date.now() - 1 * 60 * 60 * 1000),
          estado: 'esperando',
          prioridad: 'alta'
        },
        {
          id: 2,
          codigo: 'COT-2025-031',
          cliente: 'Innovación Digital Plus',
          vendedor: 'Ana García',
          monto: 148000,
          fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estado: 'esperando',
          prioridad: 'media'
        },
        {
          id: 3,
          codigo: 'COT-2025-030',
          cliente: 'Desarrollo Web Avanzado',
          vendedor: 'Luis Rodríguez',
          monto: 89000,
          fechaCreacion: new Date(Date.now() - 3 * 60 * 60 * 1000),
          estado: 'esperando',
          prioridad: 'alta'
        },
        {
          id: 4,
          codigo: 'COT-2025-029',
          cliente: 'Marketing Solutions Pro',
          vendedor: 'María López',
          monto: 167000,
          fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
          estado: 'esperando',
          prioridad: 'baja'
        },
        {
          id: 5,
          codigo: 'COT-2025-028',
          cliente: 'E-commerce Global',
          vendedor: 'Pedro Sánchez',
          monto: 125000,
          fechaCreacion: new Date(Date.now() - 5 * 60 * 60 * 1000),
          estado: 'esperando',
          prioridad: 'media'
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
    },
    cotizacionesPendientesAprobacion() {
      return this.cotizacionesCompletas.filter(cotizacion => cotizacion.estado === 'esperando');
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  beforeUnmount() {
    if (this.efectivasVsCanceladasChart) {
      this.efectivasVsCanceladasChart.destroy();
    }
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
        this.createEfectivasVsCanceladasChart();
        this.createColaboradoresChart();
        this.createServiciosChart();
      } catch (error) {
        console.error('Error al inicializar gráficos:', error);
      }
    },
    
    createEfectivasVsCanceladasChart() {
      const ctx = this.$refs.efectivasVsCanceladasChart?.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }
      
      const labels = this.generate30DayLabels();
      const efectivas = [8, 12, 6, 15, 9, 18, 11, 14, 7, 16, 13, 10, 19, 8, 12, 15, 11, 17, 9, 13, 16, 8, 14, 12, 18, 10, 15, 11, 13, 16];
      const canceladas = [3, 5, 2, 4, 6, 3, 7, 2, 5, 4, 3, 6, 2, 5, 3, 4, 6, 2, 7, 3, 4, 5, 2, 6, 3, 4, 5, 3, 2, 4];
      
      this.efectivasVsCanceladasChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Cotizaciones Efectivas',
              data: efectivas,
              borderColor: '#27ae60',
              backgroundColor: 'rgba(39, 174, 96, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Cotizaciones Canceladas',
              data: canceladas,
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4,
              fill: true
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
      });
    },
    
    createColaboradoresChart() {
      const ctx = this.$refs.colaboradoresChart?.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }
      
      const colaboradores = ['Carlos M.', 'Ana G.', 'Luis R.', 'María L.', 'Pedro S.', 'Laura T.'];
      const cotizacionesEfectivas = [18, 15, 12, 14, 10, 8];
      
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
              '#e67e22'
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
            data: [32, 28, 18, 12, 8, 2],
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
                  size: 10
                }
              }
            }
          }
        }
      });
    },
    
    generate30DayLabels() {
      const labels = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
      }
      return labels;
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
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      
      if (horas < 1) {
        return 'hace menos de una hora';
      } else if (horas === 1) {
        return 'hace 1 hora';
      } else if (horas < 24) {
        return `hace ${horas} horas`;
      } else {
        const dias = Math.floor(horas / 24);
        return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
      }
    },
    
    getPrioridadTexto(prioridad) {
      const prioridades = {
        alta: 'ALTA',
        media: 'MEDIA',
        baja: 'BAJA'
      };
      return prioridades[prioridad] || prioridad.toUpperCase();
    },
    
    verCotizacion(cotizacion) {
      // Aquí se abriría un modal o se navegaría a la página de detalles
      alert(`Viendo detalles de ${cotizacion.codigo}\n\nCliente: ${cotizacion.cliente}\nVendedor: ${cotizacion.vendedor}\nMonto: $${this.formatearMoneda(cotizacion.monto)}`);
    },
    
    aprobarCotizacion(id) {
      const index = this.cotizacionesCompletas.findIndex(c => c.id === id);
      if (index !== -1) {
        const cotizacion = this.cotizacionesCompletas[index];
        
        // Confirmación antes de aprobar
        if (confirm(`¿Está seguro de aprobar la cotización ${cotizacion.codigo}?`)) {
          // Cambiar estado a efectiva
          cotizacion.estado = 'efectiva';
          
          // Actualizar estadísticas
          this.estadisticas.esperandoAprobacion--;
          this.estadisticas.efectivas++;
          
          // Mostrar mensaje de éxito
          this.$nextTick(() => {
            alert(`✅ Cotización ${cotizacion.codigo} aprobada exitosamente`);
          });
        }
      }
    },
    
    rechazarCotizacion(id) {
      const index = this.cotizacionesCompletas.findIndex(c => c.id === id);
      if (index !== -1) {
        const cotizacion = this.cotizacionesCompletas[index];
        
        // Solicitar motivo del rechazo
        const motivo = prompt(`Ingrese el motivo del rechazo para ${cotizacion.codigo}:`);
        if (motivo && motivo.trim() !== '') {
          // Cambiar estado a cancelada
          cotizacion.estado = 'cancelada';
          cotizacion.motivoRechazo = motivo;
          
          // Actualizar estadísticas
          this.estadisticas.esperandoAprobacion--;
          this.estadisticas.canceladas++;
          
          // Mostrar mensaje de confirmación
          this.$nextTick(() => {
            alert(`❌ Cotización ${cotizacion.codigo} rechazada`);
          });
        }
      }
    },
    
    mostrarAprobacionesPendientes() {
      alert('Redirigiendo a la página de aprobaciones pendientes...');
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

/* Supervisor Actions */
.supervisor-actions {
 margin-bottom: 2rem;
}

.supervisor-actions h3 {
 color: #2c3e50;
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.supervisor-actions h3 i {
 color: #8e44ad;
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

.aprobar-urgente .action-icon {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.revisar-equipo .action-icon {
 background: linear-gradient(135deg, #3498db, #2980b9);
}

.generar-reporte .action-icon {
 background: linear-gradient(135deg, #27ae60, #229954);
}

.configurar .action-icon {
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

.action-card .action-badge {
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

.btn-view {
 background: #3498db;
 color: white;
}

.btn-view:hover {
 background: #2980b9;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-approve {
 background: #27ae60;
 color: white;
}

.btn-approve:hover {
 background: #229954;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-reject {
 background: #e74c3c;
 color: white;
}

.btn-reject:hover {
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

 .actions-grid {
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