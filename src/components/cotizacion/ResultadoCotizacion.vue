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
            </div>
            <div class="precios-detalle">
              <span class="precio-minimo">Mín: ${{ item.servicio.precioMinimo }}/año</span>
              <span class="precio-venta-usado">Venta: ${{ item.precioVentaFinal }}/año</span>
            </div>
            <div class="calculo-detalle">
              <small>{{ totalUnidades(item) }} unidad(es) × ${{ item.precioVentaFinal }}/año × {{ añosContrato }} año{{ añosContrato > 1 ? 's' : '' }}</small>
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
        <div class="metrica">
          <span class="metrica-label">Total de Servidores:</span>
          <span class="metrica-valor">{{ totalServidores }} unidades</span>
        </div>
        <div class="metrica">
          <span class="metrica-label">Total de Equipos:</span>
          <span class="metrica-valor">{{ totalEquipos }} unidades</span>
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
       return total + (item.cantidadServidores || 0);
     }, 0);
   },
   totalEquipos() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       return total + (item.cantidadEquipos || 0);
     }, 0);
   },
   precioMinimoAnual() {
     return this.serviciosSeleccionados.reduce((total, item) => {
       const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
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
       const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
       return totalUnidades > 0 && item.precioVentaFinal < item.servicio.precioMinimo;
     });
   }
 },
 methods: {
   totalUnidades(item) {
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
/* MISMO CSS DEL ANTERIOR - Con pequeños ajustes para iconos */
.resultados-container {
 background: white;
 border-radius: 0.75rem;
 padding: 1rem;
 box-shadow: 0 4px 20px rgba(0,0,0,0.1);
 margin-top: 2rem;
 width: 100%;
 box-sizing: border-box;
}

.resultados-header {
 text-align: center;
 margin-bottom: 2rem;
 padding-bottom: 1rem;
 border-bottom: 2px solid #ecf0f1;
}

.resultados-header h2 {
 color: #2c3e50;
 margin-bottom: 0.5rem;
 font-size: clamp(1.2rem, 4vw, 1.8rem);
 line-height: 1.2;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
}

.resultados-header h2 i {
 color: #3498db;
 font-size: 1.1em;
}

.fecha {
 color: #7f8c8d;
 font-size: clamp(0.8rem, 2.5vw, 0.9rem);
 margin-bottom: 0.75rem;
}

.contrato-global {
 background: linear-gradient(135deg, #fff3e0, #ffe0b2);
 padding: 0.75rem 1rem;
 border-radius: 0.5rem;
 border: 2px solid #ff9800;
 display: inline-block;
}

.contrato-duracion {
 color: #e65100;
 font-weight: bold;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.contrato-duracion i {
 color: #ff9800;
}

.servicios-seleccionados {
 margin-bottom: 2rem;
}

.servicios-seleccionados h3 {
 color: #34495e;
 margin-bottom: 1rem;
 font-size: clamp(1rem, 3vw, 1.3rem);
}

.servicio-seleccionado {
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
 padding: 1rem;
 border: 1px solid #ecf0f1;
 border-radius: 0.5rem;
 margin-bottom: 0.75rem;
 background: #f8f9fa;
 gap: 1rem;
}

.servicio-info {
 display: flex;
 align-items: flex-start;
 gap: 0.75rem;
 flex: 1;
 min-width: 0;
}

.servicio-info .servicio-icon {
 font-size: clamp(1rem, 4vw, 1.3rem);
 flex-shrink: 0;
}

.servicio-detalles {
 flex: 1;
 min-width: 0;
}

.servicio-detalles strong {
 color: #2c3e50;
 display: block;
 margin-bottom: 0.25rem;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
 line-height: 1.3;
}

.servicio-detalles p {
 color: #7f8c8d;
 margin: 0 0 0.5rem 0;
 font-size: clamp(0.8rem, 2vw, 0.9rem);
 line-height: 1.4;
}

.equipos-info {
 background: #e8f4fd;
 padding: 0.5rem;
 border-radius: 0.25rem;
 margin-bottom: 0.5rem;
 border-left: 3px solid #3498db;
}

.equipos-info strong {
 color: #3498db;
 font-size: clamp(0.8rem, 2vw, 0.85rem);
 margin-bottom: 0.25rem;
}

.cantidades-info {
 background: #f0f8e8;
 padding: 0.5rem;
 border-radius: 0.25rem;
 margin-bottom: 0.5rem;
 border-left: 3px solid #27ae60;
 display: flex;
 gap: 1rem;
 flex-wrap: wrap;
}

.cantidad-item {
 display: flex;
 align-items: center;
 gap: 0.25rem;
}

.cantidad-label {
 font-size: clamp(0.75rem, 2vw, 0.8rem);
 color: #27ae60;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.25rem;
}

.cantidad-label i {
 font-size: 0.9em;
}

.cantidad-valor {
 font-size: clamp(0.8rem, 2vw, 0.85rem);
 color: #2c3e50;
 font-weight: bold;
 background: white;
 padding: 0.125rem 0.375rem;
 border-radius: 0.25rem;
}

.precios-detalle {
 display: flex;
 gap: 0.5rem;
 flex-wrap: wrap;
 margin-bottom: 0.5rem;
}

.precio-minimo,
.precio-venta-usado {
 padding: 0.25rem 0.5rem;
 border-radius: 0.25rem;
 font-size: clamp(0.7rem, 2vw, 0.8rem);
 font-weight: 600;
}

.precio-minimo {
 background: #ffebee;
 color: #c62828;
}

.precio-venta-usado {
 background: #e8f5e8;
 color: #2e7d32;
}

.calculo-detalle {
 background: #fff3e0;
 padding: 0.25rem 0.5rem;
 border-radius: 0.25rem;
 border-left: 3px solid #ff9800;
}

.calculo-detalle small {
 color: #e65100;
 font-size: clamp(0.7rem, 2vw, 0.8rem);
 font-weight: 500;
}

.servicio-subtotal {
 text-align: right;
 flex-shrink: 0;
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.subtotal-anual {
 font-size: clamp(0.9rem, 2.8vw, 1rem);
 color: #27ae60;
 font-weight: bold;
}

.subtotal-total {
 font-size: clamp(1rem, 3vw, 1.1rem);
 color: #e74c3c;
 font-weight: bold;
 background: #fff5f5;
 padding: 0.25rem 0.5rem;
 border-radius: 0.25rem;
 border: 1px solid #ffcdd2;
}

.opciones-precio {
 display: grid;
 grid-template-columns: 1fr;
 gap: 1rem;
 margin-bottom: 2rem;
}

.precio-option {
 padding: 1rem;
 border-radius: 0.75rem;
 text-align: center;
 transition: transform 0.2s ease;
 box-sizing: border-box;
}

.precio-option:hover {
 transform: translateY(-2px);
}

.minimo {
 background: linear-gradient(135deg, #ffcdd2, #ef9a9a);
 border: 2px solid #e74c3c;
}

.venta {
 background: linear-gradient(135deg, #a8e6cf, #88d8a3);
 border: 2px solid #27ae60;
}

.precio-option h4 {
 margin-bottom: 0.75rem;
 font-size: clamp(1rem, 3vw, 1.1rem);
 line-height: 1.2;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
}

.text-danger {
 color: #e74c3c;
}

.text-success {
 color: #27ae60;
}

.precio-valor {
 font-size: clamp(1.2rem, 4vw, 1.5rem);
 font-weight: bold;
 margin-bottom: 0.25rem;
 line-height: 1;
}

.precio-total-contrato {
 font-size: clamp(1.3rem, 4.5vw, 1.6rem);
 font-weight: bold;
 margin-bottom: 0.5rem;
 padding: 0.25rem 0.5rem;
 background: rgba(255, 255, 255, 0.7);
 border-radius: 0.25rem;
}

.precio-option p {
 margin-bottom: 0.25rem;
 opacity: 0.9;
 font-size: clamp(0.8rem, 2.5vw, 0.9rem);
 line-height: 1.3;
}

.precio-option small {
 font-size: clamp(0.7rem, 2vw, 0.8rem);
 opacity: 0.8;
}

.resumen-financiero {
 background: #f8f9fa;
 padding: 1.5rem;
 border-radius: 0.75rem;
 margin-bottom: 2rem;
 border: 1px solid #e9ecef;
}

.resumen-financiero h3 {
 color: #2c3e50;
 margin-bottom: 1rem;
 font-size: clamp(1rem, 3vw, 1.2rem);
 text-align: center;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
}

.resumen-financiero h3 i {
 color: #3498db;
}

.metricas {
 display: flex;
 flex-direction: column;
 gap: 0.75rem;
}

.metrica {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.75rem;
 background: white;
 border-radius: 0.5rem;
 border-left: 4px solid #3498db;
 flex-wrap: wrap;
 gap: 0.5rem;
}

.metrica-label {
 font-weight: 500;
 color: #34495e;
 font-size: clamp(0.8rem, 2.5vw, 0.9rem);
}

.metrica-valor {
 font-weight: bold;
 color: #2c3e50;
 font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.metrica-valor.ganancia {
 color: #27ae60;
}

.metrica-valor.destacado {
 color: #e74c3c;
 font-size: clamp(1rem, 3vw, 1.1rem);
}

.metrica-valor.destacado-total {
 color: #8e24aa;
 font-size: clamp(1.1rem, 3.5vw, 1.3rem);
 background: #f3e5f5;
 padding: 0.25rem 0.5rem;
 border-radius: 0.25rem;
}

.selector-precio-pdf {
 background: linear-gradient(135deg, #f8f9fa, #e9ecef);
 padding: 1.5rem;
 border-radius: 0.75rem;
 margin-bottom: 2rem;
 border: 2px solid #dee2e6;
}

.selector-precio-pdf h3 {
 color: #495057;
 margin-bottom: 1rem;
 font-size: clamp(1rem, 3vw, 1.2rem);
 text-align: center;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
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
 padding: 1rem;
 background: white;
 border: 2px solid #dee2e6;
 border-radius: 0.5rem;
 cursor: pointer;
 transition: all 0.3s ease;
 gap: 1rem;
}

.precio-radio-option:hover {
 border-color: #007bff;
 box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.precio-radio-option input[type="radio"] {
 display: none;
}

.radio-custom {
 width: 20px;
 height: 20px;
 border: 2px solid #dee2e6;
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
font-size: 1rem;
margin-bottom: 0.25rem;
}

.precio-cantidad {
color: #007bff;
font-weight: bold;
font-size: 1.1rem;
margin-bottom: 0.25rem;
}

.precio-info small {
color: #6c757d;
font-size: 0.85rem;
}

.acciones {
display: flex;
gap: 1rem;
justify-content: center;
flex-wrap: wrap;
}

.btn-exportar, .btn-reiniciar, .btn-guardar {
padding: 0.75rem 1.5rem;
border: none;
border-radius: 0.5rem;
font-size: clamp(0.9rem, 2.5vw, 1rem);
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;
flex: 1;
min-width: 150px;
max-width: 200px;
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
}

.btn-guardar {
background: #28a745;
color: white;
}

.btn-guardar:hover {
background: #218838;
transform: translateY(-2px);
}

.btn-exportar {
background: #3498db;
color: white;
}

.btn-exportar:hover:not(:disabled) {
background: #2980b9;
transform: translateY(-2px);
}

.btn-exportar:disabled {
background: #6c757d;
cursor: not-allowed;
transform: none;
box-shadow: none;
}

.btn-exportar:disabled i {
color: #adb5bd;
}

.btn-reiniciar {
background: #95a5a6;
color: white;
}

.btn-reiniciar:hover {
background: #7f8c8d;
transform: translateY(-2px);
}

.btn-exportar i,
.btn-reiniciar i,
.btn-guardar i {
font-size: 1.1em;
}

/* Responsive */
@media (min-width: 480px) {
.resultados-container {
  padding: 1.5rem;
}

.opciones-precio {
  gap: 1.5rem;
}

.servicio-seleccionado {
  padding: 1.25rem;
}

.metricas {
  gap: 1rem;
}

.cantidades-info {
  gap: 1.5rem;
}

.opciones-precio-pdf {
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
}

@media (min-width: 768px) {
.resultados-container {
  padding: 2rem;
}

.opciones-precio {
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.servicio-seleccionado {
  align-items: center;
}

.acciones {
  gap: 1.5rem;
}

.btn-exportar, .btn-reiniciar, .btn-guardar {
  padding: 1rem 2rem;
  flex: none;
}

.metricas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metrica:last-child {
  grid-column: 1 / -1;
}
}

@media (min-width: 1024px) {
.opciones-precio {
  gap: 2rem;
}

.precio-option {
  padding: 1.5rem;
}

.resumen-financiero {
  padding: 2rem;
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
  padding: 0.75rem;
  margin-top: 1rem;
}

.servicio-seleccionado {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.servicio-subtotal {
  text-align: left;
  align-self: flex-end;
}

.acciones {
  flex-direction: column;
}

.btn-exportar, .btn-reiniciar, .btn-guardar {
  width: 100%;
  max-width: none;
}

.precios-detalle {
  flex-direction: column;
  gap: 0.25rem;
}

.metrica {
  flex-direction: column;
  text-align: center;
}

.cantidades-info {
  flex-direction: column;
  gap: 0.5rem;
}

.precio-radio-option {
  padding: 0.75rem;
}

.precio-info strong {
  font-size: 0.9rem;
}

.precio-cantidad {
  font-size: 1rem;
}

.resultados-header h2 {
  flex-direction: column;
  gap: 0.25rem;
}

.contrato-duracion {
  font-size: 0.85rem;
}

.resumen-financiero h3,
.selector-precio-pdf h3 {
  flex-direction: column;
  gap: 0.25rem;
}
}

@media (max-height: 500px) and (orientation: landscape) {
.resultados-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.opciones-precio {
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.precio-option {
  padding: 0.75rem;
}

.resumen-financiero {
  padding: 1rem;
  margin-bottom: 1rem;
}
}
</style>