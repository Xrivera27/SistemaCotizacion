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
          <select v-model="filtros.periodo" class="filter-select">
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div v-if="filtros.periodo === 'custom'" class="fechas-custom">
          <div class="filtro-grupo">
            <label>Desde:</label>
            <input v-model="filtros.fechaInicio" type="date" class="form-input">
          </div>
          <div class="filtro-grupo">
            <label>Hasta:</label>
            <input v-model="filtros.fechaFin" type="date" class="form-input">
          </div>
        </div>

        <!-- Filtros específicos por tipo -->
        <div v-if="tipoSeleccionado === 'vendedores'" class="filtro-grupo">
          <label>Vendedor:</label>
          <select v-model="filtros.vendedor" class="filter-select">
            <option value="">Todos los vendedores</option>
            <option v-for="vendedor in vendedoresDisponibles" :key="vendedor" :value="vendedor">
              {{ vendedor }}
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'servicios'" class="filtro-grupo">
          <label>Servicio:</label>
          <select v-model="filtros.servicio" class="filter-select">
            <option value="">Todos los servicios</option>
            <option v-for="servicio in serviciosDisponibles" :key="servicio" :value="servicio">
              {{ servicio }}
            </option>
          </select>
        </div>

        <div v-if="tipoSeleccionado === 'clientes'" class="filtro-grupo">
          <label>Cliente:</label>
          <select v-model="filtros.cliente" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientesDisponibles" :key="cliente" :value="cliente">
              {{ cliente }}
            </option>
          </select>
        </div>

        <div class="filtro-acciones">
          <button class="btn btn-primary" @click="generarReporte">
            <i class="fas fa-chart-bar"></i>
            Generar Reporte
          </button>
          <button v-if="reporteGenerado" class="btn btn-success" @click="exportarPDF">
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
              <span class="resumen-valor">{{ datosReporte.totalCotizaciones }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Efectivas:</span>
              <span class="resumen-valor efectivas">{{ datosReporte.cotizacionesEfectivas }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Pendientes:</span>
              <span class="resumen-valor pendientes">{{ datosReporte.cotizacionesPendientes }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Cotizaciones Canceladas:</span>
              <span class="resumen-valor canceladas">{{ datosReporte.cotizacionesCanceladas }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Ingresos Totales:</span>
              <span class="resumen-valor ingresos">{{ formatearMoneda(datosReporte.ingresosTotales) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Tasa de Conversión:</span>
              <span class="resumen-valor">{{ datosReporte.tasaConversion }}%</span>
            </div>
          </div>
        </div>

        <div class="tabla-reporte">
          <h4>Detalle de Cotizaciones</h4>
          <table class="reporte-tabla">
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
          <table class="reporte-tabla">
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
            <tfoot>
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

      <!-- Reporte de Servicios -->
      <div v-if="tipoSeleccionado === 'servicios'" class="reporte-servicios">
        <div class="tabla-reporte">
          <h4>Rendimiento por Servicio</h4>
          <table class="reporte-tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cotizaciones</th>
                <th>Efectivas</th>
                <th>Conversión</th>
                <th>Ingresos</th>
                <th>Precio Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="servicio in datosReporte.rendimientoServicios" :key="servicio.nombre">
                <td>{{ servicio.nombre }}</td>
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
          <table class="reporte-tabla">
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
              <span class="resumen-valor ingresos">{{ formatearMoneda(datosReporte.financiero.ingresosBrutos) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Promedio Mensual:</span>
              <span class="resumen-valor">{{ formatearMoneda(datosReporte.financiero.promedioMensual) }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Mejor Mes:</span>
              <span class="resumen-valor">{{ datosReporte.financiero.mejorMes }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Crecimiento:</span>
              <span class="resumen-valor" :class="datosReporte.financiero.crecimiento > 0 ? 'positivo' : 'negativo'">
                {{ datosReporte.financiero.crecimiento > 0 ? '+' : '' }}{{ datosReporte.financiero.crecimiento }}%
              </span>
            </div>
          </div>
        </div>

        <div class="tabla-reporte">
          <h4>Ingresos por Mes</h4>
          <table class="reporte-tabla">
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
  </div>
</template>

<script>
export default {
  name: 'AdminReportes',
  data() {
    return {
      tipoSeleccionado: null,
      reporteGenerado: false,

      filtros: {
        periodo: '30',
        fechaInicio: '',
        fechaFin: '',
        vendedor: '',
        servicio: '',
        cliente: ''
      },

      tiposReporte: [
        {
          id: 'cotizaciones',
          nombre: 'Reporte de Cotizaciones',
          descripcion: 'Estado y resumen de todas las cotizaciones',
          icono: 'fas fa-file-alt'
        },
        {
          id: 'vendedores',
          nombre: 'Reporte de Vendedores',
          descripcion: 'Rendimiento y métricas por vendedor',
          icono: 'fas fa-users'
        },
        {
          id: 'servicios',
          nombre: 'Reporte de Servicios',
          descripcion: 'Análisis de servicios más solicitados',
          icono: 'fas fa-cogs'
        },
        {
          id: 'clientes',
          nombre: 'Reporte de Clientes',
          descripcion: 'Actividad y facturación por cliente',
          icono: 'fas fa-building'
        },
        {
          id: 'financiero',
          nombre: 'Reporte Financiero',
          descripcion: 'Ingresos, tendencias y análisis financiero',
          icono: 'fas fa-chart-line'
        }
      ],

      vendedoresDisponibles: ['Carlos Mendoza', 'Ana García', 'Luis Rodríguez', 'María López', 'Pedro Sánchez'],
      serviciosDisponibles: ['Desarrollo Web', 'Marketing Digital', 'Consultoría TI', 'Diseño Gráfico', 'E-commerce'],
      clientesDisponibles: ['Constructora ABC', 'Comercial XYZ', 'Tecnología DEF', 'Servicios GHI'],

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
        return `${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`;
      }
      return `Últimos ${this.filtros.periodo} días`;
    }
  },

  methods: {
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
        cliente: ''
      };
    },

    generarReporte() {
      // Simular generación de datos según el tipo
      switch (this.tipoSeleccionado) {
        case 'cotizaciones':
          this.generarReporteCotizaciones();
          break;
        case 'vendedores':
          this.generarReporteVendedores();
          break;
        case 'servicios':
          this.generarReporteServicios();
          break;
        case 'clientes':
          this.generarReporteClientes();
          break;
        case 'financiero':
          this.generarReporteFinanciero();
          break;
      }
      this.reporteGenerado = true;
    },

    generarReporteCotizaciones() {
      this.datosReporte = {
        totalCotizaciones: 47,
        cotizacionesEfectivas: 32,
        cotizacionesPendientes: 8,
        cotizacionesCanceladas: 7,
        ingresosTotales: 285750.00,
        tasaConversion: 68.1,
        detalleCotizaciones: [
          { id: 1, cliente: 'Constructora ABC', vendedor: 'Carlos Mendoza', fecha: '2024-06-01', total: 25000, estado: 'efectiva' },
          { id: 2, cliente: 'Comercial XYZ', vendedor: 'Ana García', fecha: '2024-06-02', total: 18500, estado: 'pendiente' },
          { id: 3, cliente: 'Tecnología DEF', vendedor: 'Luis Rodríguez', fecha: '2024-06-03', total: 32000, estado: 'efectiva' },
          { id: 4, cliente: 'Servicios GHI', vendedor: 'María López', fecha: '2024-06-04', total: 15000, estado: 'cancelada' },
          { id: 5, cliente: 'Industrias JKL', vendedor: 'Pedro Sánchez', fecha: '2024-06-05', total: 45000, estado: 'efectiva' }
        ]
      };
    },

    generarReporteVendedores() {
      this.datosReporte = {
        rendimientoVendedores: [
          { nombre: 'Carlos Mendoza', rol: 'Vendedor Senior', cotizaciones: 15, efectivas: 12, conversion: 80, ingresos: 125000, ticketPromedio: 25000 },
          { nombre: 'Ana García', rol: 'Vendedor', cotizaciones: 12, efectivas: 8, conversion: 67, ingresos: 98000, ticketPromedio: 22000 },
          { nombre: 'Luis Rodríguez', rol: 'Vendedor', cotizaciones: 10, efectivas: 6, conversion: 60, ingresos: 75000, ticketPromedio: 18500 },
          { nombre: 'María López', rol: 'Vendedor Senior', cotizaciones: 8, efectivas: 5, conversion: 63, ingresos: 65000, ticketPromedio: 20000 },
          { nombre: 'Pedro Sánchez', rol: 'Vendedor', cotizaciones: 6, efectivas: 3, conversion: 50, ingresos: 35000, ticketPromedio: 15000 }
        ],
        totales: {
          cotizaciones: 51,
          efectivas: 34,
          conversionPromedio: 64,
          ingresos: 398000,
          ticketPromedio: 20100
        }
      };
    },

    generarReporteServicios() {
      this.datosReporte = {
        rendimientoServicios: [
          { nombre: 'Desarrollo Web', cotizaciones: 18, efectivas: 13, conversion: 72, ingresos: 125000, precioPromedio: 22500 },
          { nombre: 'Marketing Digital', cotizaciones: 12, efectivas: 8, conversion: 67, ingresos: 85000, precioPromedio: 18750 },
          { nombre: 'Consultoría TI', cotizaciones: 8, efectivas: 6, conversion: 75, ingresos: 45000, precioPromedio: 15000 },
          { nombre: 'Diseño Gráfico', cotizaciones: 6, efectivas: 4, conversion: 67, ingresos: 25000, precioPromedio: 8500 },
          { nombre: 'E-commerce', cotizaciones: 4, efectivas: 3, conversion: 75, ingresos: 95000, precioPromedio: 32500 }
        ]
      };
    },

    generarReporteClientes() {
      this.datosReporte = {
        actividadClientes: [
          { id: 1, nombreEncargado: 'Juan Pérez', empresa: 'Constructora ABC', vendedorAsignado: 'Carlos Mendoza', totalCotizaciones: 5, ultimaCotizacion: '2024-06-10', totalFacturado: 125000 },
          { id: 2, nombreEncargado: 'María López', empresa: 'Comercial XYZ', vendedorAsignado: 'Ana García', totalCotizaciones: 3, ultimaCotizacion: '2024-06-08', totalFacturado: 85000 },
          { id: 3, nombreEncargado: 'Roberto Martínez', empresa: 'Tecnología DEF', vendedorAsignado: 'Luis Rodríguez', totalCotizaciones: 2, ultimaCotizacion: '2024-06-05', totalFacturado: 65000 },
          { id: 4, nombreEncargado: 'Ana Rodríguez', empresa: 'Servicios GHI', vendedorAsignado: 'María López', totalCotizaciones: 4, ultimaCotizacion: '2024-06-12', totalFacturado: 95000 }
        ]
      };
    },

    generarReporteFinanciero() {
      this.datosReporte = {
        financiero: {
          ingresosBrutos: 285750.00,
          promedioMensual: 95250.00,
          mejorMes: 'Marzo 2024',
          crecimiento: 12.5,
          detallesMensuales: [
            { mes: 'Enero 2024', cotizaciones: 15, efectivas: 10, ingresos: 85000, crecimiento: 5.2 },
            { mes: 'Febrero 2024', cotizaciones: 18, efectivas: 12, ingresos: 95000, crecimiento: 11.8 },
            { mes: 'Marzo 2024', cotizaciones: 22, efectivas: 16, ingresos: 125000, crecimiento: 31.6 },
            { mes: 'Abril 2024', cotizaciones: 20, efectivas: 14, ingresos: 110000, crecimiento: -12.0 },
            { mes: 'Mayo 2024', cotizaciones: 19, efectivas: 13, ingresos: 105000, crecimiento: -4.5 }
          ]
        }
      };
    },

    async exportarPDF() {
      try {
        // Importar jsPDF dinámicamente
        const { jsPDF } = await import('jspdf');
        await import('jspdf-autotable');

        const pdf = new jsPDF();

        // Configuración del PDF
        pdf.setFontSize(16);
        pdf.text('Sistema de Cotizaciones', 20, 20);
        
        pdf.setFontSize(12);
        pdf.text(`Reporte de ${this.tiposReporte.find(t => t.id === this.tipoSeleccionado)?.nombre}`, 20, 30);
        pdf.text(`Fecha: ${this.fechaActual}`, 20, 40);
        pdf.text(`Período: ${this.textoPeríodo}`, 20, 50);

        // Generar contenido específico según el tipo
        this.generarContenidoPDF(pdf);

        // Descargar el PDF
        const nombreArchivo = `reporte-${this.tipoSeleccionado}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(nombreArchivo);

        alert('PDF generado exitosamente');
      } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      }
    },

    generarContenidoPDF(pdf) {
      let yPos = 70;

      switch (this.tipoSeleccionado) {
        case 'cotizaciones':
          this.generarPDFCotizaciones(pdf, yPos);
          break;
        case 'vendedores':
          this.generarPDFVendedores(pdf, yPos);
          break;
        case 'servicios':
          this.generarPDFServicios(pdf, yPos);
          break;
        case 'clientes':
          this.generarPDFClientes(pdf, yPos);
          break;
        case 'financiero':
          this.generarPDFFinanciero(pdf, yPos);
          break;
      }
    },

    generarPDFCotizaciones(pdf, yPos) {
      // Resumen
      pdf.setFontSize(14);
      pdf.text('Resumen de Cotizaciones', 20, yPos);
      yPos += 15;

      pdf.setFontSize(10);
      pdf.text(`Total de Cotizaciones: ${this.datosReporte.totalCotizaciones}`, 20, yPos);
      pdf.text(`Efectivas: ${this.datosReporte.cotizacionesEfectivas}`, 20, yPos + 10);
      pdf.text(`Pendientes: ${this.datosReporte.cotizacionesPendientes}`, 20, yPos + 20);
      pdf.text(`Canceladas: ${this.datosReporte.cotizacionesCanceladas}`, 20, yPos + 30);
      pdf.text(`Ingresos Totales: ${this.formatearMoneda(this.datosReporte.ingresosTotales)}`, 20, yPos + 40);

      // Tabla de detalles
      const columnas = ['CT#', 'Cliente', 'Vendedor', 'Fecha', 'Total', 'Estado'];
      const filas = this.datosReporte.detalleCotizaciones.map(c => [
        `CT${String(c.id).padStart(6, '0')}`,
        c.cliente,
        c.vendedor,
        this.formatearFecha(c.fecha),
        this.formatearMoneda(c.total),
        this.getEstadoTexto(c.estado)
      ]);

      pdf.autoTable({
        head: [columnas],
        body: filas,
        startY: yPos + 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 152, 219] }
      });
    },

    generarPDFVendedores(pdf, yPos) {
      const columnas = ['Vendedor', 'Cotizaciones', 'Efectivas', 'Conversión', 'Ingresos', 'Ticket Promedio'];
      const filas = this.datosReporte.rendimientoVendedores.map(v => [
        v.nombre,
        v.cotizaciones.toString(),
        v.efectivas.toString(),
        `${v.conversion}%`,
        this.formatearMoneda(v.ingresos),
        this.formatearMoneda(v.ticketPromedio)
      ]);

      pdf.autoTable({
        head: [columnas],
        body: filas,
        startY: yPos,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] }
      });
    },

    generarPDFServicios(pdf, yPos) {
      const columnas = ['Servicio', 'Cotizaciones', 'Efectivas', 'Conversión', 'Ingresos', 'Precio Promedio'];
      const filas = this.datosReporte.rendimientoServicios.map(s => [
        s.nombre,
        s.cotizaciones.toString(),
        s.efectivas.toString(),
        `${s.conversion}%`,
        this.formatearMoneda(s.ingresos),
        this.formatearMoneda(s.precioPromedio)
      ]);

      pdf.autoTable({
        head: [columnas],
        body: filas,
       startY: yPos,
       styles: { fontSize: 9 },
       headStyles: { fillColor: [52, 152, 219] }
     });
   },

   generarPDFClientes(pdf, yPos) {
     const columnas = ['Cliente', 'Empresa', 'Vendedor', 'Cotizaciones', 'Última Cotización', 'Total Facturado'];
     const filas = this.datosReporte.actividadClientes.map(c => [
       c.nombreEncargado,
       c.empresa,
       c.vendedorAsignado,
       c.totalCotizaciones.toString(),
       this.formatearFecha(c.ultimaCotizacion),
       this.formatearMoneda(c.totalFacturado)
     ]);

     pdf.autoTable({
       head: [columnas],
       body: filas,
       startY: yPos,
       styles: { fontSize: 8 },
       headStyles: { fillColor: [52, 152, 219] }
     });
   },

   generarPDFFinanciero(pdf, yPos) {
     // Resumen financiero
     pdf.setFontSize(14);
     pdf.text('Resumen Financiero', 20, yPos);
     yPos += 15;

     pdf.setFontSize(10);
     pdf.text(`Ingresos Brutos: ${this.formatearMoneda(this.datosReporte.financiero.ingresosBrutos)}`, 20, yPos);
     pdf.text(`Promedio Mensual: ${this.formatearMoneda(this.datosReporte.financiero.promedioMensual)}`, 20, yPos + 10);
     pdf.text(`Mejor Mes: ${this.datosReporte.financiero.mejorMes}`, 20, yPos + 20);
     pdf.text(`Crecimiento: ${this.datosReporte.financiero.crecimiento}%`, 20, yPos + 30);

     // Tabla de detalles mensuales
     const columnas = ['Mes', 'Cotizaciones', 'Efectivas', 'Ingresos', 'Crecimiento'];
     const filas = this.datosReporte.financiero.detallesMensuales.map(m => [
       m.mes,
       m.cotizaciones.toString(),
       m.efectivas.toString(),
       this.formatearMoneda(m.ingresos),
       `${m.crecimiento}%`
     ]);

     pdf.autoTable({
       head: [columnas],
       body: filas,
       startY: yPos + 50,
       styles: { fontSize: 9 },
       headStyles: { fillColor: [52, 152, 219] }
     });
   },

   formatearMoneda(valor) {
     if (!valor && valor !== 0) return 'L. 0.00';
     return new Intl.NumberFormat('es-HN', {
       style: 'currency',
       currency: 'HNL',
       minimumFractionDigits: 2
     }).format(valor);
   },

   formatearFecha(fecha) {
     if (!fecha) return '';
     return new Date(fecha).toLocaleDateString('es-HN', {
       year: 'numeric',
       month: '2-digit',
       day: '2-digit'
     });
   },

   getEstadoTexto(estado) {
     const estados = {
       'efectiva': 'Efectiva',
       'pendiente': 'Pendiente',
       'cancelada': 'Cancelada',
       'rechazada': 'Rechazada'
     };
     return estados[estado] || estado;
   }
 }
}
</script>

<style scoped>
.admin-reportes-container {
 padding: 20px;
 background: #f8f9fa;
 min-height: 100vh;
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

.btn-primary {
 background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
 color: white;
}

.btn-primary:hover {
 transform: translateY(-2px);
 box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-success {
 background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
 color: white;
}

.btn-success:hover {
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

.estado-badge.cancelada {
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

.positivo {
 color: #27ae60;
 font-weight: 600;
}

.negativo {
 color: #e74c3c;
 font-weight: 600;
}

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
}
</style>