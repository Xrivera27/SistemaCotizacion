<template>
  <div v-if="mostrarResultados" class="resultados-container" id="cotizacion-pdf">
    <div class="resultados-header">
      <h2>
        <i class="fas fa-file-invoice"></i>
        Cotización de Servicios Cloud
      </h2>
      <p class="fecha">Fecha: {{ fechaActual }}</p>
      <div class="contrato-global">
        <span class="contrato-duracion">
          <i class="fas fa-calendar-alt"></i>
          Duración del contrato: {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <div class="servicios-seleccionados">
      <h3>Servicios Seleccionados:</h3>
      <div v-for="item in serviciosSeleccionados" :key="item.servicio.id" class="servicio-seleccionado">
        <div class="servicio-info">
          <span class="servicio-icon">{{ item.servicio.icon }}</span>
          <div class="servicio-detalles">
            <strong>{{ item.servicio.nombre }}</strong>
            <p>{{ item.servicio.descripcion }}</p>
            <div class="equipos-info">
              <strong>Equipos:</strong> {{ item.servicio.equipos }}
            </div>
            <div class="cantidades-info">
              <!-- Mostrar información diferente para servicios de backup -->
              <template v-if="esServicioBackup(item.servicio)">
                <div class="cantidad-item gb-item">
                  <span class="cantidad-label">
                    <i class="fas fa-hdd"></i>
                    Almacenamiento:
                  </span>
                  <span class="cantidad-valor gb-valor">{{ item.cantidadServidores }} GB</span>
                </div>
              </template>
              <template v-else>
                <div class="cantidad-item">
                  <span class="cantidad-label">
                    <i class="fas fa-server"></i>
                    Servidores:
                  </span>
                  <span class="cantidad-valor">{{ item.cantidadServidores }}</span>
                </div>
                <div class="cantidad-item">
                  <span class="cantidad-label">
                    <i class="fas fa-cogs"></i>
                    Equipos:
                  </span>
                  <span class="cantidad-valor">{{ item.cantidadEquipos }}</span>
                </div>
              </template>
            </div>
            <div class="precios-detalle">
              <span class="precio-minimo">Mín: ${{ item.servicio.precioMinimo }}/año</span>
              <span class="precio-venta-usado">Venta: ${{ item.precioVentaFinal }}/año</span>
            </div>
            <div class="calculo-detalle">
              <!-- Mostrar cálculo diferente para servicios de backup -->
              <small v-if="esServicioBackup(item.servicio)">
                {{ item.cantidadServidores }} GB × ${{ item.precioVentaFinal }}/año × {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
              </small>
              <small v-else>
                {{ totalUnidades(item) }} unidad(es) × ${{ item.precioVentaFinal }}/año × {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}
              </small>
            </div>
          </div>
        </div>
        <div class="servicio-subtotal">
          <div class="subtotal-anual">${{ calcularSubtotalAnual(item) }}/año</div>
          <div class="subtotal-total">${{ calcularSubtotalTotal(item).toLocaleString() }} total</div>
        </div>
      </div>
    </div>

    <div class="opciones-precio">
      <div class="precio-option minimo">
        <h4>
          <i class="fas fa-circle text-danger"></i>
          Precio Mínimo
        </h4>
        <div class="precio-valor">${{ precioMinimoAnual }}/año</div>
        <div class="precio-total-contrato">${{ precioMinimoTotal.toLocaleString() }} total</div>
        <p>Precio mínimo para {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</p>
      </div>

      <div class="precio-option venta">
        <h4>
          <i class="fas fa-circle text-success"></i>
          Precio de Venta
        </h4>
        <div class="precio-valor">${{ precioVentaAnual }}/año</div>
        <div class="precio-total-contrato">${{ precioVentaTotal.toLocaleString() }} total</div>
        <p>Precio final para {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</p>
        <small>Ganancia: ${{ gananciaPotencial.toLocaleString() }} total</small>
      </div>
    </div>

    <div class="resumen-financiero">
      <h3>
        <i class="fas fa-chart-bar"></i>
        Resumen Financiero ({{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }})
      </h3>
      <div class="metricas">
        <div class="metrica" v-if="totalServidores > 0">
          <span class="metrica-label">Total de Servidores:</span>
          <span class="metrica-valor">{{ totalServidores }} unidades</span>
        </div>
        <div class="metrica" v-if="totalEquipos > 0">
          <span class="metrica-label">Total de Equipos:</span>
          <span class="metrica-valor">{{ totalEquipos }} unidades</span>
        </div>
        <div class="metrica" v-if="totalGB > 0">
          <span class="metrica-label">Total de Almacenamiento:</span>
          <span class="metrica-valor">{{ totalGB }} GB</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Margen vs Mínimo:</span>
          <span class="metrica-valor ganancia">+${{ (precioVentaTotal - precioMinimoTotal).toLocaleString() }} ({{ porcentajeMargenMinimo }}%)</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Ingreso anual:</span>
          <span class="metrica-valor destacado">${{ precioVentaAnual }}/año</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Valor total del contrato:</span>
          <span class="metrica-valor destacado-total">${{ precioVentaTotal.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div class="selector-precio-pdf">
      <h3>
         
        Precio para la cotización del cliente
      </h3>
      <div class="opciones-precio-pdf">
        <label class="precio-radio-option">
          <input 
            type="radio" 
            v-model="precioSeleccionadoPDF" 
            value="minimo"
            name="precio-pdf"
          >
          <span class="radio-custom"></span>
          <div class="precio-info">
            <strong>Precio Mínimo</strong>
            <span class="precio-cantidad">${{ precioMinimoTotal.toLocaleString() }} total</span>
            <small>Precio competitivo especial</small>
          </div>
        </label>

        <label class="precio-radio-option">
          <input 
            type="radio" 
            v-model="precioSeleccionadoPDF" 
            value="venta"
            name="precio-pdf"
          >
          <span class="radio-custom"></span>
          <div class="precio-info">
            <strong>Precio de Venta</strong>
            <span class="precio-cantidad">${{ precioVentaTotal.toLocaleString() }} total</span>
            <small>Precio estándar recomendado</small>
          </div>
        </label>
      </div>
    </div>

    <div class="acciones">
     <button @click="exportarPDF" class="btn-exportar" :disabled="!precioSeleccionadoPDF">
       <i class="fas fa-file-pdf"></i>
       Generar PDF para Cliente
     </button>
     <button @click="reiniciar" class="btn-reiniciar">
       <i class="fas fa-redo-alt"></i>
       Nueva Cotización
     </button>
   </div>

   <!-- Modal de Confirmación PDF -->
   <ConfirmacionPDFModal
     :mostrar="mostrarModalConfirmacion"
     :servicios-seleccionados="serviciosSeleccionados"
     :años-contrato="añosContrato"
     :precio-total="precioSeleccionadoPDF === 'minimo' ? precioMinimoTotal : precioVentaTotal"
     :tipo-precio="precioSeleccionadoPDF"
     @cerrar="mostrarModalConfirmacion = false"
     @generar-pdf="onGenerarPDF"
     @guardar-cotizacion="onGuardarCotizacion"
     @limpiar-formulario="onLimpiarFormulario"
   />
 </div>
</template>

<script>
import { generarPDFConCliente } from '@/utils/pdfGenerator.js';
import ConfirmacionPDFModal from './ConfirmacionPDFModal.vue';

export default {
 name: 'ResultadoCotizacion',
 components: {
   ConfirmacionPDFModal
 },
 props: {
   serviciosSeleccionados: {
     type: Array,
     required: true
   },
   añosContrato: {
     type: Number,
     default: 1
   }
 },
 data() {
   return {
     precioSeleccionadoPDF: 'venta', // Por defecto precio de venta
     mostrarModalConfirmacion: false,
     cotizacionesGuardadas: [] // Para almacenar cotizaciones pendientes
   };
 },
 emits: ['reiniciar', 'limpiar-formulario'],
 computed: {
   mostrarResultados() {
     return this.serviciosSeleccionados.length > 0;
   },
   fechaActual() {
     return new Date().toLocaleDateString('es-ES');
   },
   totalServidores() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       // Solo contar servidores para servicios que NO son de backup
       if (!this.esServicioBackup(item.servicio)) {
         return total + (item.cantidadServidores || 0);
       }
       return total;
     }, 0);
   },
   totalEquipos() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       return total + (item.cantidadEquipos || 0);
     }, 0);
   },
   totalGB() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       // Solo contar GB para servicios de backup
       if (this.esServicioBackup(item.servicio)) {
         return total + (item.cantidadServidores || 0);
       }
       return total;
     }, 0);
   },
   precioMinimoAnual() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       const totalUnidades = this.esServicioBackup(item.servicio) 
         ? (item.cantidadServidores || 0)  // Para backup, usar solo cantidadServidores (que representa GB)
         : (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
       return total + (totalUnidades * item.servicio.precioMinimo);
     }, 0);
   },
   precioMinimoTotal() {
     return this.precioMinimoAnual * this.añosContrato;
   },
   precioVentaAnual() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       return total + this.calcularSubtotalAnual(item);
     }, 0);
   },
   precioVentaTotal() {
     return this.precioVentaAnual * this.añosContrato;
   },
   gananciaPotencial() {
     return Math.max(0, this.precioVentaTotal - this.precioMinimoTotal);
   },
   porcentajeMargenMinimo() {
     if (this.precioMinimoTotal === 0) return 0;
     return Math.round(((this.precioVentaTotal - this.precioMinimoTotal) / this.precioMinimoTotal) * 100);
   },
   hayPreciosPorDebajoMinimo() {
     return this.serviciosSeleccionados.some(item => {
       const totalUnidades = this.esServicioBackup(item.servicio) 
         ? (item.cantidadServidores || 0)  // Para backup, usar solo cantidadServidores (que representa GB)
         : (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
       return totalUnidades > 0 && item.precioVentaFinal < item.servicio.precioMinimo;
     });
   }
 },
 methods: {
   esServicioBackup(servicio) {
     return servicio.categoria === 'backup' || servicio.categoria === 'respaldo';
   },
   totalUnidades(item) {
     if (this.esServicioBackup(item.servicio)) {
       return item.cantidadServidores || 0; // Para backup, solo cantidadServidores (que representa GB)
     }
     return (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
   },
   calcularSubtotalAnual(item) {
     const totalUnidades = this.totalUnidades(item);
     return totalUnidades * item.precioVentaFinal;
   },
   calcularSubtotalTotal(item) {
     return this.calcularSubtotalAnual(item) * this.añosContrato;
   },
   
   reiniciar() {
     this.$emit('reiniciar');
   },

   onLimpiarFormulario() {
     // Emitir evento hacia el componente padre (CotizacionForm)
     this.$emit('limpiar-formulario');
   },

   guardarCotizacion() {
     const datosCotizacion = {
       servicios: this.serviciosSeleccionados,
       añosContrato: this.añosContrato,
       precioTotal: this.precioSeleccionadoPDF === 'minimo' ? this.precioMinimoTotal : this.precioVentaTotal,
       tipoPrecio: this.precioSeleccionadoPDF,
       estado: this.hayPreciosPorDebajoMinimo ? 'pendiente_aprobacion' : 'borrador',
       fecha: new Date().toISOString(),
       vendedor: 'vendor1', // En backend esto vendrá de la sesión
       id: Date.now()
     };

     this.cotizacionesGuardadas.push(datosCotizacion);
     
     if (this.hayPreciosPorDebajoMinimo) {
       alert('Cotización guardada como "Pendiente de Aprobación" debido a precios por debajo del mínimo.');
     } else {
       alert('Cotización guardada exitosamente como borrador.');
     }
     
     console.log('Cotización guardada:', datosCotizacion);

     // Limpiar formulario después de guardar
     setTimeout(() => {
       this.onLimpiarFormulario();
     }, 1000);
   },

   exportarPDF() {
     if (!this.precioSeleccionadoPDF) {
       alert('Por favor selecciona un tipo de precio para la cotización');
       return;
     }
     this.mostrarModalConfirmacion = true;
   },

   onGenerarPDF(datosParaPDF) {
     this.generarPDFConDatos(datosParaPDF);
   },

   onGuardarCotizacion(datosCotizacion) {
     // Simular guardado en array local
     const cotizacion = {
       ...datosCotizacion,
       id: Date.now(),
       vendedor: 'vendor1' // En backend esto vendrá de la sesión
     };
     
     this.cotizacionesGuardadas.push(cotizacion);
     console.log('Cotización guardada para aprobación:', cotizacion);
   },

   async generarPDFConDatos(datosParaPDF) {
     try {
       // Datos de la empresa
       const datosEmpresa = {
         nombre: 'CloudTech Solutions',
         direccion: 'Av. Tecnología 123, Ciudad Tech',
         telefono: '+1 (555) 123-4567',
         email: 'ventas@cloudtech.com',
         website: 'www.cloudtech.com'
       };

       // Preparar datos del cliente para el PDF
       const clienteParaPDF = {
         ...datosParaPDF.cliente,
         informacionIncluir: datosParaPDF.informacionIncluir
       };

       const pdf = await generarPDFConCliente(
         datosEmpresa,
         clienteParaPDF,
         datosParaPDF.servicios,
         datosParaPDF.añosContrato,
         datosParaPDF.precioTotal,
         datosParaPDF.tipoPrecio
       );

       const nombreEmpresaLimpio = datosParaPDF.cliente.nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_');
       const nombreArchivo = `Cotizacion_${nombreEmpresaLimpio}_${datosParaPDF.tipoPrecio}_${new Date().getTime()}.pdf`;
       pdf.save(nombreArchivo);

       console.log('PDF generado exitosamente para:', datosParaPDF.cliente.nombreEmpresa);
       alert(`PDF generado exitosamente para ${datosParaPDF.cliente.nombreEmpresa}`);

       // Opcional: Guardar registro de PDF generado
       const registroPDF = {
         cliente: datosParaPDF.cliente,
         archivo: nombreArchivo,
         fecha: new Date().toISOString(),
         tipoPrecio: datosParaPDF.tipoPrecio,
         monto: datosParaPDF.precioTotal,
         vendedor: 'vendor1'
       };
       
       console.log('Registro de PDF generado:', registroPDF);

     } catch (error) {
       console.error('Error detallado al generar PDF:', error);
       alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
     }
   }
 }
}
</script>

<style scoped>
.resultados-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e9ecef;
}

.resultados-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.resultados-header h2 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: clamp(1.4rem, 4vw, 2rem);
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 700;
}

.resultados-header h2 i {
  color: #6c757d;
  font-size: 1.1em;
}

.fecha {
  color: #6c757d;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  margin-bottom: 1rem;
  font-weight: 500;
}

.contrato-global {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.contrato-duracion {
  color: #495057;
  font-weight: 700;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contrato-duracion i {
  color: #007bff;
}

.servicios-seleccionados {
  margin-bottom: 2rem;
}

.servicios-seleccionados h3 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.servicio-seleccionado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #f8f9fa;
  gap: 1rem;
  transition: all 0.2s ease;
}

.servicio-seleccionado:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #ced4da;
}

.servicio-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.servicio-info .servicio-icon {
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  flex-shrink: 0;
  color: #6c757d;
}

.servicio-detalles {
  flex: 1;
  min-width: 0;
}

.servicio-detalles strong {
  color: #495057;
  display: block;
  margin-bottom: 0.5rem;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  line-height: 1.3;
  font-weight: 600;
}

.servicio-detalles p {
  color: #6c757d;
  margin: 0 0 0.75rem 0;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  line-height: 1.4;
}

.equipos-info {
  background: linear-gradient(135deg, #e3f2fd, #f0f4ff);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #007bff;
  border: 1px solid #bbdefb;
}

.equipos-info strong {
  color: #0056b3;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.cantidades-info {
  background: linear-gradient(135deg, #f0f8f0, #e8f5e8);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #28a745;
  border: 1px solid #c3e6cb;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cantidad-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cantidad-label {
  font-size: clamp(0.8rem, 2vw, 0.85rem);
  color: #155724;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.cantidad-label i {
  font-size: 0.9em;
}

.cantidad-valor {
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  color: #495057;
  font-weight: 700;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #28a745;
}

/* Estilos específicos para servicios de backup */
.gb-item {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #6f42c1;
  border: 1px solid #d1b3e0;
}

.gb-item .cantidad-label {
  color: #4a148c !important;
  font-weight: 700;
}

.gb-valor {
  background: white;
  color: #4a148c !important;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #6f42c1;
}

.precios-detalle {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.precio-minimo,
.precio-venta-usado {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  font-weight: 600;
  border: 1px solid;
}

.precio-minimo {
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  color: #c53030;
  border-color: #fc8181;
}

.precio-venta-usado {
  background: linear-gradient(135deg, #f0fff4, #c6f6d5);
  color: #2d5016;
  border-color: #68d391;
}

.calculo-detalle {
  background: linear-gradient(135deg, #fffbf0, #fef5e7);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #f6ad55;
  border: 1px solid #fbd38d;
}

.calculo-detalle small {
  color: #744210;
  font-size: clamp(0.75rem, 2vw, 0.8rem);
  font-weight: 500;
}

.servicio-subtotal {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.subtotal-anual {
  font-size: clamp(1rem, 2.8vw, 1.1rem);
  color: #28a745;
  font-weight: 700;
}

.subtotal-total {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: #dc3545;
  font-weight: 700;
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #fc8181;
}

.opciones-precio {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.precio-option {
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  border: 2px solid;
}

.precio-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.minimo {
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  border-color: #fc8181;
}

.venta {
  background: linear-gradient(135deg, #f0fff4, #c6f6d5);
  border-color: #68d391;
}

.precio-option h4 {
  margin-bottom: 1rem;
  font-size: clamp(1.1rem, 3vw, 1.2rem);
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.text-danger {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}

.precio-valor {
  font-size: clamp(1.3rem, 4vw, 1.6rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1;
  color: #495057;
}

.precio-total-contrato {
  font-size: clamp(1.4rem, 4.5vw, 1.8rem);
  font-weight: 700;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #495057;
}

.precio-option p {
  margin-bottom: 0.5rem;
  opacity: 0.8;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  line-height: 1.3;
  color: #6c757d;
  font-weight: 500;
}

.precio-option small {
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  opacity: 0.7;
  color: #6c757d;
  font-weight: 500;
}

.resumen-financiero {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.resumen-financiero h3 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
}

.resumen-financiero h3 i {
  color: #6c757d;
}

.metricas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metrica {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  flex-wrap: wrap;
  gap: 0.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.metrica:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metrica-label {
  font-weight: 600;
  color: #495057;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
}

.metrica-valor {
  font-weight: 700;
  color: #495057;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.metrica-valor.ganancia {
  color: #28a745;
}

.metrica-valor.destacado {
  color: #dc3545;
  font-size: clamp(1rem, 3vw, 1.2rem);
}

.metrica-valor.destacado-total {
  color: #6f42c1;
  font-size: clamp(1.1rem, 3.5vw, 1.4rem);
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1b3e0;
}

.selector-precio-pdf {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.selector-precio-pdf h3 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
}

.selector-precio-pdf h3 i {
  color: #007bff;
}

.opciones-precio-pdf {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.precio-radio-option {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 1rem;
}

.precio-radio-option:hover {
  border-color: #007bff;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.15);
}

.precio-radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.precio-radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #007bff;
  background: #007bff;
}

.precio-radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.precio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.precio-info strong {
  color: #495057;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.precio-cantidad {
  color: #007bff;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.precio-info small {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.acciones {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-exportar, .btn-reiniciar, .btn-guardar {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 180px;
  max-width: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.btn-guardar {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-guardar:hover {
  background: linear-gradient(135deg, #1e7e34, #17a2b8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
}

.btn-exportar {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-exportar:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.btn-exportar:disabled {
  background: linear-gradient(135deg, #6c757d, #adb5bd);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-exportar:disabled i {
  color: #e9ecef;
}

.btn-reiniciar {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.btn-reiniciar:hover {
  background: linear-gradient(135deg, #5a6268, #343a40);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
}

.btn-exportar i,
.btn-reiniciar i,
.btn-guardar i {
  font-size: 1.1em;
}

/* Responsive */
@media (min-width: 480px) {
  .resultados-container {
    padding: 2.5rem;
  }

  .opciones-precio {
    gap: 2rem;
  }

  .servicio-seleccionado {
    padding: 2rem;
  }

  .metricas {
    gap: 1.25rem;
  }

  .cantidades-info {
    gap: 2rem;
  }

  .opciones-precio-pdf {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 768px) {
  .resultados-container {
    padding: 3rem;
  }

  .opciones-precio {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .servicio-seleccionado {
    align-items: center;
  }

  .acciones {
    gap: 1.5rem;
  }

  .btn-exportar, .btn-reiniciar, .btn-guardar {
    flex: none;
    min-width: 200px;
  }

  .metricas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .metrica:last-child {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .opciones-precio {
    gap: 2.5rem;
  }

  .precio-option {
    padding: 2rem;
  }

  .resumen-financiero {
    padding: 2.5rem;
  }

  .metricas {
    grid-template-columns: repeat(3, 1fr);
  }

  .metrica:last-child {
    grid-column: 2 / 3;
  }
}

@media (max-width: 320px) {
  .resultados-container {
    padding: 1rem;
    margin-top: 1rem;
  }

  .servicio-seleccionado {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .servicio-subtotal {
    text-align: left;
    align-self: stretch;
  }

  .acciones {
    flex-direction: column;
  }

  .btn-exportar, .btn-reiniciar, .btn-guardar {
    width: 100%;
    max-width: none;
    min-width: auto;
  }

  .precios-detalle {
    flex-direction: column;
    gap: 0.5rem;
  }

  .metrica {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .cantidades-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .precio-radio-option {
    padding: 1rem;
  }

  .precio-info strong {
    font-size: 1rem;
  }

  .precio-cantidad {
    font-size: 1.1rem;
  }

  .resultados-header h2 {
    flex-direction: column;
    gap: 0.5rem;
  }

  .contrato-duracion {
    font-size: 0.9rem;
  }

  .resumen-financiero h3,
  .selector-precio-pdf h3 {
    flex-direction: column;
    gap: 0.5rem;
  }

  .resumen-financiero,
  .selector-precio-pdf {
    padding: 1.5rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .resultados-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .opciones-precio {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .precio-option {
    padding: 1rem;
  }

  .resumen-financiero {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style>