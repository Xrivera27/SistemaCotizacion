<template>
  <div class="admin-reportes-container">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Reportes</h1>
        <p class="page-subtitle">Genera y exporta reportes específicos del sistema</p>
      </div>
    </div>

    <!-- Selector de tipo de reporte -->
    <div class="filtros-section">
      <div class="tipo-reporte-selector">
        <h3>Selecciona el tipo de reporte:</h3>
        <div class="tipos-grid">
          <div 
            v-for="tipo in tiposReporte" 
            :key="tipo.id"
            class="tipo-card"
            :class="{ active: tipoSeleccionado === tipo.id }"
            @click="seleccionarTipo(tipo.id)"
          >
            <div class="tipo-icon">
              <i :class="tipo.icono"></i>
            </div>
            <div class="tipo-info">
              <h4>{{ tipo.nombre }}</h4>
              <p>{{ tipo.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros comunes -->
      <div v-if="tipoSeleccionado" class="filtros-comunes">
        <div class="filtro-grupo">
          <label>Período:</label>
          <select v-model="filtros.periodo" class="filter-select" :disabled="isLoading">
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div v-if="filtros.periodo === 'custom'" class="fechas-custom">
          <div class="filtro-grupo">
            <label>Desde:</label>
            <input v-model="filtros.fechaInicio" type="date" class="form-input" :disabled="isLoading">
          </div>
          <div class="filtro-grupo">
            <label>Hasta:</label>
            <input v-model="filtros.fechaFin" type="date" class="form-input" :disabled="isLoading">
          </div>
        </div>

        <!-- Filtros específicos por tipo -->
        <div v-if="['vendedores', 'clientes'].includes(tipoSeleccionado)" class="filtro-grupo">
          <label>Vendedor:</label>
          <select v-model="filtros.vendedor" class="filter-select" :disabled="isLoading">
            <option value="">Todos los vendedores</option>
            <option v-for="vendedor in vendedoresDisponibles" :key="vendedor.id" :value="vendedor.id">
              {{ vendedor.nombre }} ({{ vendedor.tipo }})
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'servicios'" class="filtro-grupo">
          <label>Servicio:</label>
          <select v-model="filtros.servicio" class="filter-select" :disabled="isLoading">
            <option value="">Todos los servicios</option>
            <option v-for="servicio in serviciosDisponibles" :key="servicio.id" :value="servicio.id">
              {{ servicio.nombre }} - {{ servicio.categoria }}
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'servicios'" class="filtro-grupo">
          <label>Categoría:</label>
          <select v-model="filtros.categoria" class="filter-select" :disabled="isLoading">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categoriasDisponibles" :key="categoria.id" :value="categoria.id">
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'clientes'" class="filtro-grupo">
          <label>Cliente:</label>
          <select v-model="filtros.cliente" class="filter-select" :disabled="isLoading">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientesDisponibles" :key="cliente.id" :value="cliente.id">
              {{ cliente.empresa }} ({{ cliente.encargado }})
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'cotizaciones'" class="filtro-grupo">
          <label>Estado:</label>
          <select v-model="filtros.estado" class="filter-select" :disabled="isLoading">
            <option value="">Todos los estados</option>
            <option value="efectiva">Efectiva</option>
            <option value="pendiente">Pendiente</option>
            <option value="pendiente_aprobacion">Esperando Aprobación</option>
            <option value="rechazada">Cancelada</option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'financiero'" class="filtro-grupo">
          <label>Agrupación:</label>
          <select v-model="filtros.agrupacion" class="filter-select" :disabled="isLoading">
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
            <option value="diario">Diario</option>
          </select>
        </div>

        <div class="filtro-acciones">
          <button class="btn btn-primary" @click="generarReporte" :disabled="isLoading">
            <i class="fas fa-chart-bar" :class="{ 'fa-spin': isLoading }"></i>
            {{ isLoading ? 'Generando...' : 'Generar Reporte' }}
          </button>
          <button v-if="reporteGenerado" class="btn btn-success" @click="exportarPDF" :disabled="isLoading">
            <i class="fas fa-file-pdf"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido del reporte -->
    <div v-if="reporteGenerado" class="reporte-contenido" ref="reporteContenido">
      <!-- Header del reporte para PDF -->
      <div class="reporte-header">
        <div class="empresa-info">
          <h2>Sistema de Cotizaciones</h2>
          <p>Reporte de {{ tiposReporte.find(t => t.id === tipoSeleccionado)?.nombre }}</p>
        </div>
        <div class="fecha-generacion">
          <p>Fecha de generación: {{ fechaActual }}</p>
          <p>Período: {{ textoPeríodo }}</p>
        </div>
      </div>

      <!-- Reporte de Cotizaciones -->
      <div v-if="tipoSeleccionado === 'cotizaciones'" class="reporte-cotizaciones">
        <div class="resumen-cotizaciones">
          <div class="resumen-grid">
            <div class="resumen-item">
              <span class="resumen-label">Total Cotizaciones:</span>
              <span class="resumen-valor">{{ datosReporte.totalCotizaciones || 0 }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Efectivas:</span>
              <span class="resumen-valor efectivas">{{ datosReporte.cotizacionesEfectivas || 0 }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Pendientes:</span>
              <span class="resumen-valor pendientes">{{ datosReporte.cotizacionesPendientes || 0 }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Canceladas:</span>
              <span class="resumen-valor canceladas">{{ datosReporte.cotizacionesCanceladas || 0 }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Ingresos Totales:</span>
              <span class="resumen-valor ingresos">{{ formatearMoneda(datosReporte.ingresosTotales) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Tasa de Conversión:</span>
              <span class="resumen-valor">{{ datosReporte.tasaConversion || 0 }}%</span>
            </div>
          </div>
        </div>

        <div class="tabla-reporte">
          <h4>Detalle de Cotizaciones</h4>
          <div v-if="!datosReporte.detalleCotizaciones || datosReporte.detalleCotizaciones.length === 0" class="no-data">
            <p>No hay cotizaciones para mostrar con los filtros seleccionados</p>
          </div>
          <table v-else class="reporte-tabla">
            <thead>
              <tr>
                <th>CT#</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cotizacion in datosReporte.detalleCotizaciones" :key="cotizacion.id">
                <td>CT{{ String(cotizacion.id).padStart(6, '0') }}</td>
                <td>{{ cotizacion.cliente }}</td>
                <td>{{ cotizacion.vendedor }}</td>
                <td>{{ formatearFecha(cotizacion.fecha) }}</td>
                <td>{{ formatearMoneda(cotizacion.total) }}</td>
                <td>
                  <span class="estado-badge" :class="cotizacion.estado">
                    {{ getEstadoTexto(cotizacion.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte de Vendedores -->
      <div v-if="tipoSeleccionado === 'vendedores'" class="reporte-vendedores">
        <div class="tabla-reporte">
          <h4>Rendimiento por Vendedor</h4>
          <div v-if="!datosReporte.rendimientoVendedores || datosReporte.rendimientoVendedores.length === 0" class="no-data">
            <p>No hay datos de vendedores para mostrar</p>
          </div>
          <table v-else class="reporte-tabla">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Cotizaciones</th>
                <th>Efectivas</th>
                <th>Conversión</th>
                <th>Ingresos</th>
                <th>Ticket Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vendedor in datosReporte.rendimientoVendedores" :key="vendedor.nombre">
                <td>
                  <div class="vendedor-info">
                    <span class="vendedor-nombre">{{ vendedor.nombre }}</span>
                    <span class="vendedor-rol">{{ vendedor.rol }}</span>
                  </div>
                </td>
                <td>{{ vendedor.cotizaciones }}</td>
                <td>{{ vendedor.efectivas }}</td>
                <td>{{ vendedor.conversion }}%</td>
                <td>{{ formatearMoneda(vendedor.ingresos) }}</td>
                <td>{{ formatearMoneda(vendedor.ticketPromedio) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="datosReporte.totales">
              <tr class="total-row">
                <td><strong>TOTALES</strong></td>
                <td><strong>{{ datosReporte.totales.cotizaciones }}</strong></td>
                <td><strong>{{ datosReporte.totales.efectivas }}</strong></td>
                <td><strong>{{ datosReporte.totales.conversionPromedio }}%</strong></td>
                <td><strong>{{ formatearMoneda(datosReporte.totales.ingresos) }}</strong></td>
                <td><strong>{{ formatearMoneda(datosReporte.totales.ticketPromedio) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Reporte de Servicios ACTUALIZADO -->
      <div v-if="tipoSeleccionado === 'servicios'" class="reporte-servicios">
        <div class="tabla-reporte">
          <h4>Rendimiento por Servicio (Agrupado)</h4>
          <div v-if="!datosReporte.rendimientoServicios || datosReporte.rendimientoServicios.length === 0" class="no-data">
            <p>No hay datos de servicios para mostrar</p>
          </div>
          <table v-else class="reporte-tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Categoría</th>
                <th>Variantes</th>
                <th>Cotizaciones</th>
                <th>Efectivas</th>
                <th>Conversión</th>
                <th>Ingresos</th>
                <th>Precio Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="servicio in datosReporte.rendimientoServicios" :key="servicio.nombre">
                <td>
                  <div class="servicio-info">
                    <span class="servicio-nombre">{{ servicio.nombre }}</span>
                    <small class="servicio-detalle" v-if="servicio.cantidadVariantes > 1">
                      {{ servicio.cantidadVariantes }} variantes incluidas
                    </small>
                  </div>
                </td>
                <td>{{ servicio.categoria || 'Sin categoría' }}</td>
                <td>{{ servicio.cantidadVariantes }}</td>
                <td>{{ servicio.cotizaciones }}</td>
                <td>{{ servicio.efectivas }}</td>
                <td>{{ servicio.conversion }}%</td>
                <td>{{ formatearMoneda(servicio.ingresos) }}</td>
                <td>{{ formatearMoneda(servicio.precioPromedio) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte de Clientes -->
      <div v-if="tipoSeleccionado === 'clientes'" class="reporte-clientes">
        <div class="tabla-reporte">
          <h4>Actividad por Cliente</h4>
          <div v-if="!datosReporte.actividadClientes || datosReporte.actividadClientes.length === 0" class="no-data">
            <p>No hay datos de clientes para mostrar</p>
          </div>
          <table v-else class="reporte-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Vendedor Asignado</th>
                <th>Cotizaciones</th>
                <th>Última Cotización</th>
                <th>Total Facturado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in datosReporte.actividadClientes" :key="cliente.id">
                <td>{{ cliente.nombreEncargado }}</td>
                <td>{{ cliente.empresa }}</td>
                <td>{{ cliente.vendedorAsignado }}</td>
                <td>{{ cliente.totalCotizaciones }}</td>
                <td>{{ formatearFecha(cliente.ultimaCotizacion) }}</td>
                <td>{{ formatearMoneda(cliente.totalFacturado) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte Financiero -->
      <div v-if="tipoSeleccionado === 'financiero'" class="reporte-financiero">
        <div class="resumen-financiero">
          <div class="resumen-grid">
            <div class="resumen-item">
              <span class="resumen-label">Ingresos Brutos:</span>
              <span class="resumen-valor ingresos">{{ formatearMoneda(datosReporte.financiero?.ingresosBrutos) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Promedio Mensual:</span>
              <span class="resumen-valor">{{ formatearMoneda(datosReporte.financiero?.promedioMensual) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Mejor Mes:</span>
              <span class="resumen-valor">{{ datosReporte.financiero?.mejorMes || 'Sin datos' }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Crecimiento:</span>
              <span class="resumen-valor" :class="(datosReporte.financiero?.crecimiento || 0) > 0 ? 'positivo' : 'negativo'">
                {{ (datosReporte.financiero?.crecimiento || 0) > 0 ? '+' : '' }}{{ datosReporte.financiero?.crecimiento || 0 }}%
              </span>
            </div>
          </div>
        </div>

        <div class="tabla-reporte">
          <h4>Ingresos por Mes</h4>
          <div v-if="!datosReporte.financiero?.detallesMensuales || datosReporte.financiero.detallesMensuales.length === 0" class="no-data">
            <p>No hay datos financieros para mostrar</p>
          </div>
          <table v-else class="reporte-tabla">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Cotizaciones</th>
                <th>Efectivas</th>
                <th>Ingresos</th>
                <th>Crecimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mes in datosReporte.financiero.detallesMensuales" :key="mes.mes">
                <td>{{ mes.mes }}</td>
                <td>{{ mes.cotizaciones }}</td>
                <td>{{ mes.efectivas }}</td>
                <td>{{ formatearMoneda(mes.ingresos) }}</td>
                <td>
                  <span :class="mes.crecimiento > 0 ? 'positivo' : 'negativo'">
                    {{ mes.crecimiento > 0 ? '+' : '' }}{{ mes.crecimiento }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="showError" class="error-toast">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
      <button @click="showError = false" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import ReportesService from '@/services/reportes';

export default {
  name: 'AdminReportes',
  data() {
    return {
      tipoSeleccionado: null,
      reporteGenerado: false,
      isLoading: false,
      loadingMessage: '',
      showError: false,
      errorMessage: '',

      filtros: {
        periodo: '30',
        fechaInicio: '',
        fechaFin: '',
        vendedor: '',
        servicio: '',
        cliente: '',
        categoria: '',
        estado: '',
        agrupacion: 'mensual'
      },

      tiposReporte: [],
      vendedoresDisponibles: [],
      serviciosDisponibles: [],
      clientesDisponibles: [],
      categoriasDisponibles: [],

      datosReporte: {}
    }
  },

  computed: {
    fechaActual() {
      return new Date().toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    textoPeríodo() {
      if (this.filtros.periodo === 'custom') {
        const inicio = this.formatearFecha(this.filtros.fechaInicio);
        const fin = this.formatearFecha(this.filtros.fechaFin);
        return `${inicio} al ${fin}`;
      }
      return `Últimos ${this.filtros.periodo} días`;
    }
  },

  async created() {
    await this.cargarDatosIniciales();
  },

  methods: {
    // ===== CARGA DE DATOS INICIALES =====
    
    async cargarDatosIniciales() {
      this.isLoading = true;
      this.loadingMessage = 'Cargando configuración de reportes...';
      
      try {
        const [tiposResult, opcionesResult] = await Promise.all([
          ReportesService.getTiposReporte(),
          ReportesService.getOpcionesReporte()
        ]);

        if (tiposResult.success) {
          this.tiposReporte = tiposResult.tipos;
        } else {
          this.mostrarError(tiposResult.message || 'Error cargando tipos de reporte');
        }

        if (opcionesResult.success) {
          const opciones = opcionesResult.opciones;
          this.vendedoresDisponibles = opciones.vendedores || [];
          this.serviciosDisponibles = opciones.servicios || [];
          this.clientesDisponibles = opciones.clientes || [];
          this.categoriasDisponibles = opciones.categorias || [];
        } else {
          this.mostrarError(opcionesResult.message || 'Error cargando opciones de reporte');
        }


      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        this.mostrarError('Error de conexión al cargar configuración');
      } finally {
        this.isLoading = false;
      }
    },

    // ===== MÉTODOS DE REPORTES =====

    seleccionarTipo(tipo) {
      this.tipoSeleccionado = tipo;
      this.reporteGenerado = false;
      this.limpiarFiltros();
    },

    limpiarFiltros() {
      this.filtros = {
        periodo: '30',
        fechaInicio: '',
        fechaFin: '',
        vendedor: '',
        servicio: '',
        cliente: '',
        categoria: '',
        estado: '',
        agrupacion: 'mensual'
      };
    },

    async generarReporte() {
      if (!this.tipoSeleccionado) {
        this.mostrarError('Selecciona un tipo de reporte');
        return;
      }

      // Validar filtros
      try {
        ReportesService.validarFiltros(this.filtros);
      } catch (error) {
        this.mostrarError(error.message);
        return;
      }

      this.isLoading = true;
      this.loadingMessage = `Generando reporte de ${this.tiposReporte.find(t => t.id === this.tipoSeleccionado)?.nombre}...`;

      try {
        let resultado;

        // Llamar al método específico según el tipo
        switch (this.tipoSeleccionado) {
          case 'cotizaciones':
            resultado = await ReportesService.getReporteCotizaciones(this.filtros);
            break;
          case 'vendedores':
            resultado = await ReportesService.getReporteVendedores(this.filtros);
            break;
          case 'servicios':
            resultado = await ReportesService.getReporteServicios(this.filtros);
            break;
          case 'clientes':
            resultado = await ReportesService.getReporteClientes(this.filtros);
            break;
          case 'financiero':
            resultado = await ReportesService.getReporteFinanciero(this.filtros);
            break;
          default:
            throw new Error('Tipo de reporte no válido');
        }

        if (resultado.success) {
          this.datosReporte = resultado.reporte;
          this.reporteGenerado = true;
          
          // Verificar si hay datos
          if (!ReportesService.tienedatos(this.datosReporte)) {
            this.mostrarError('No se encontraron datos para los filtros seleccionados');
          }
        } else {
          this.mostrarError(resultado.message || 'Error generando reporte');
        }

      } catch (error) {
        console.error('❌ Error generando reporte:', error);
        this.mostrarError('Error de conexión al generar reporte');
      } finally {
        this.isLoading = false;
      }
    },

    async exportarPDF() {
      try {
        this.isLoading = true;
        this.loadingMessage = 'Generando PDF...';

        const resultado = await ReportesService.generarPDF(this.tipoSeleccionado, this.filtros);
        
        if (resultado.success) {
          console.log('✅ PDF generado exitosamente');
        } else {
          this.mostrarError(resultado.message || 'Error generando PDF');
        }

      } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        this.mostrarError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      } finally {
        this.isLoading = false;
      }
    },

    // ===== MÉTODOS AUXILIARES =====

    formatearMoneda(valor) {
      if (!valor && valor !== 0) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(valor);
    },

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
    },

    getEstadoTexto(estado) {
      const estados = {
        'efectiva': 'Efectiva',
        'pendiente': 'Pendiente',
        'pendiente_aprobacion': 'Esperando Aprobación',
        'rechazada': 'Cancelada'
      };
      return estados[estado] || estado;
    },

    mostrarError(mensaje) {
      this.errorMessage = mensaje;
      this.showError = true;
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        this.showError = false;
      }, 5000);
    }
  }
}
</script>

<style scoped>
.admin-reportes-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
  position: relative;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.filtros-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.tipo-reporte-selector h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.tipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.tipo-card {
  display: flex;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.tipo-card:hover {
  border-color: #3498db;
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.1);
}

.tipo-card.active {
  border-color: #3498db;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.tipo-icon {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.tipo-icon i {
  font-size: 2rem;
  color: #3498db;
}

.tipo-card.active .tipo-icon i {
  color: white;
}

.tipo-info h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.tipo-info p {
 margin: 0;
 font-size: 0.9rem;
 opacity: 0.8;
}

.filtros-comunes {
 border-top: 1px solid #e9ecef;
 padding-top: 25px;
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 20px;
 align-items: end;
}

.fechas-custom {
 grid-column: 1 / -1;
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 20px;
}

.filtro-grupo {
 display: flex;
 flex-direction: column;
}

.filtro-grupo label {
 font-weight: 600;
 color: #2c3e50;
 margin-bottom: 8px;
 font-size: 0.95rem;
}

.filter-select,
.form-input {
 padding: 10px 12px;
 border: 2px solid #e9ecef;
 border-radius: 6px;
 font-size: 0.95rem;
 transition: border-color 0.3s ease;
}

.filter-select:focus,
.form-input:focus {
 outline: none;
 border-color: #3498db;
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.filter-select:disabled,
.form-input:disabled {
 background: #f5f5f5;
 cursor: not-allowed;
}

.filtro-acciones {
 display: flex;
 gap: 10px;
 align-items: end;
}

.btn {
 padding: 12px 20px;
 border: none;
 border-radius: 6px;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 0.95rem;
}

.btn:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 transform: none !important;
}

.btn-primary {
 background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
 color: white;
}

.btn-primary:hover:not(:disabled) {
 transform: translateY(-2px);
 box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-success {
 background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
 color: white;
}

.btn-success:hover:not(:disabled) {
 transform: translateY(-2px);
 box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.reporte-contenido {
 background: white;
 padding: 30px;
 border-radius: 12px;
 box-shadow: 0 2px 10px rgba(0,0,0,0.08);
 margin-top: 30px;
}

.reporte-header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 padding-bottom: 25px;
 border-bottom: 2px solid #e9ecef;
 margin-bottom: 30px;
}

.empresa-info h2 {
 color: #2c3e50;
 margin: 0 0 8px 0;
 font-size: 1.8rem;
}

.empresa-info p {
 color: #7f8c8d;
 margin: 0;
 font-size: 1.1rem;
}

.fecha-generacion {
 text-align: right;
 color: #7f8c8d;
}

.fecha-generacion p {
 margin: 0 0 5px 0;
 font-size: 0.95rem;
}

.resumen-cotizaciones,
.resumen-financiero {
 margin-bottom: 30px;
}

.resumen-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 20px;
 margin-bottom: 30px;
}

.resumen-item {
 background: #f8f9fa;
 padding: 20px;
 border-radius: 8px;
 border-left: 4px solid #3498db;
 display: flex;
 flex-direction: column;
 gap: 8px;
}

.resumen-label {
 font-weight: 600;
 color: #2c3e50;
 font-size: 0.9rem;
}

.resumen-valor {
 font-size: 1.5rem;
 font-weight: 700;
 color: #2c3e50;
}

.resumen-valor.efectivas {
 color: #27ae60;
}

.resumen-valor.pendientes {
 color: #f39c12;
}

.resumen-valor.canceladas {
 color: #e74c3c;
}

.resumen-valor.ingresos {
 color: #8e44ad;
}

.resumen-valor.positivo {
 color: #27ae60;
}

.resumen-valor.negativo {
 color: #e74c3c;
}

.tabla-reporte {
 margin-top: 30px;
}

.tabla-reporte h4 {
 color: #2c3e50;
 margin-bottom: 20px;
 font-size: 1.3rem;
}

.reporte-tabla {
 width: 100%;
 border-collapse: collapse;
 background: white;
 border-radius: 8px;
 overflow: hidden;
 box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.reporte-tabla th {
 background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
 color: white;
 padding: 15px 12px;
 text-align: left;
 font-weight: 600;
 font-size: 0.95rem;
}

.reporte-tabla td {
 padding: 12px;
 border-bottom: 1px solid #e9ecef;
 font-size: 0.9rem;
}

.reporte-tabla tbody tr:hover {
 background: #f8f9fa;
}

.reporte-tabla tfoot td {
 background: #f8f9fa;
 border-top: 2px solid #3498db;
 font-weight: 600;
}

.estado-badge {
 padding: 4px 12px;
 border-radius: 20px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: uppercase;
}

.estado-badge.efectiva {
 background: #d4edda;
 color: #155724;
}

.estado-badge.pendiente {
 background: #fff3cd;
 color: #856404;
}

.estado-badge.pendiente_aprobacion {
 background: #d1ecf1;
 color: #0c5460;
}

.estado-badge.cancelada,
.estado-badge.rechazada {
 background: #f8d7da;
 color: #721c24;
}

.vendedor-info {
 display: flex;
 flex-direction: column;
 gap: 4px;
}

.vendedor-nombre {
 font-weight: 600;
 color: #2c3e50;
}

.vendedor-rol {
 font-size: 0.8rem;
 color: #7f8c8d;
}

/* Estilos para servicios agrupados */
.servicio-info {
 display: flex;
 flex-direction: column;
 gap: 2px;
}

.servicio-nombre {
 font-weight: 600;
 color: #2c3e50;
}

.servicio-detalle {
 font-size: 0.75rem;
 color: #7f8c8d;
 font-style: italic;
}

.positivo {
 color: #27ae60;
 font-weight: 600;
}

.negativo {
 color: #e74c3c;
 font-weight: 600;
}

.no-data {
 text-align: center;
 padding: 3rem;
 color: #7f8c8d;
 background: #f8f9fa;
 border-radius: 8px;
 border: 1px solid #e9ecef;
}

.no-data p {
 margin: 0;
 font-size: 1.1rem;
}

/* Loading Overlay */
.loading-overlay {
 position: fixed;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(0, 0, 0, 0.5);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 9999;
}

.loading-content {
 background: white;
 padding: 2rem;
 border-radius: 8px;
 text-align: center;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loading-content i {
 font-size: 2rem;
 color: #3498db;
 margin-bottom: 1rem;
}

.loading-content p {
 margin: 0;
 color: #2c3e50;
 font-weight: 600;
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

/* Responsive */
@media (max-width: 768px) {
 .admin-reportes-container {
   padding: 15px;
 }
 
 .page-title {
   font-size: 2rem;
 }
 
 .tipos-grid {
   grid-template-columns: 1fr;
 }
 
 .filtros-comunes {
   grid-template-columns: 1fr;
 }
 
 .filtro-acciones {
   flex-direction: column;
 }
 
 .reporte-header {
   flex-direction: column;
   gap: 15px;
 }
 
 .fecha-generacion {
   text-align: left;
 }
 
 .resumen-grid {
   grid-template-columns: 1fr;
 }
 
 .reporte-tabla {
   font-size: 0.8rem;
 }
 
 .reporte-tabla th,
 .reporte-tabla td {
   padding: 8px 6px;
 }

 .error-toast {
   top: 1rem;
   right: 1rem;
   left: 1rem;
   max-width: none;
 }
}

@media print {
 .filtros-section {
   display: none;
 }
 
 .admin-reportes-container {
   background: white;
   padding: 0;
 }
 
 .reporte-contenido {
   box-shadow: none;
   padding: 20px;
 }

 .loading-overlay,
 .error-toast {
   display: none;
 }
}
</style>