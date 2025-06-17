// utils/pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Función original para generar PDF desde elemento HTML
export const generarPDFDesdeElemento = async (elementoId, nombreArchivo = 'cotizacion.pdf') => {
  const elemento = document.getElementById(elementoId);
  if (!elemento) {
    console.error('Elemento no encontrado');
    return;
  }

  try {
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(nombreArchivo);
    return pdf;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF');
    throw error;
  }
};

// Función para generar PDF personalizado básico (sin cliente)
export const generarPDF = async (datosEmpresa, serviciosSeleccionados, añosContrato, precioFinal, tipoPrecio) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    let yPosition = margin;

    // Configurar fuente
    pdf.setFont('helvetica');

    // HEADER - Datos de la empresa
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80);
    pdf.text(datosEmpresa.nombre, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    pdf.text(datosEmpresa.direccion, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tel: ${datosEmpresa.telefono} | Email: ${datosEmpresa.email}`, margin, yPosition);
    yPosition += 5;
    pdf.text(datosEmpresa.website, margin, yPosition);
    yPosition += 15;

    // Línea separadora
    pdf.setDrawColor(236, 240, 241);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // TÍTULO
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.text('COTIZACIÓN DE SERVICIOS CLOUD', margin, yPosition);
    yPosition += 10;

    // Fecha y duración
    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    const fechaActual = new Date().toLocaleDateString('es-ES');
    pdf.text(`Fecha: ${fechaActual}`, margin, yPosition);
    pdf.text(`Duración del contrato: ${añosContrato} año${añosContrato > 1 ? 's' : ''}`, pageWidth - 80, yPosition);
    yPosition += 15;

    // SERVICIOS SELECCIONADOS
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text('SERVICIOS INCLUIDOS:', margin, yPosition);
    yPosition += 10;

    // Tabla de servicios
    serviciosSeleccionados.forEach((item, index) => {
      const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
      const subtotalAnual = totalUnidades * item.precioVentaFinal;
      const subtotalTotal = subtotalAnual * añosContrato;

      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      // Nombre del servicio
      pdf.setFontSize(11);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`${index + 1}. ${item.servicio.nombre}`, margin, yPosition);
      yPosition += 6;

      // Descripción
      pdf.setFontSize(9);
      pdf.setTextColor(127, 140, 141);
      pdf.text(item.servicio.descripcion, margin + 5, yPosition);
      yPosition += 5;

      // Equipos
      pdf.text(`Equipos: ${item.servicio.equipos}`, margin + 5, yPosition);
      yPosition += 5;

      // Cantidades y precio
      pdf.setFontSize(10);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`Servidores: ${item.cantidadServidores} | Equipos: ${item.cantidadEquipos}`, margin + 5, yPosition);
      pdf.text(`$${subtotalTotal.toLocaleString()}`, pageWidth - 50, yPosition);
      yPosition += 8;

      // Línea separadora
      pdf.setDrawColor(236, 240, 241);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    });

    // RESUMEN FINANCIERO
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text('RESUMEN FINANCIERO:', margin, yPosition);
    yPosition += 10;

    // Calcular totales
    const totalServidores = serviciosSeleccionados.reduce((total, item) => total + (item.cantidadServidores || 0), 0);
    const totalEquipos = serviciosSeleccionados.reduce((total, item) => total + (item.cantidadEquipos || 0), 0);
    const precioAnual = precioFinal / añosContrato;

    pdf.setFontSize(10);
    pdf.text(`Total de Servidores: ${totalServidores} unidades`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Total de Equipos: ${totalEquipos} unidades`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Precio anual: $${precioAnual.toLocaleString()}/año`, margin, yPosition);
    yPosition += 10;

    // PRECIO FINAL
    pdf.setFontSize(14);
    pdf.setTextColor(231, 76, 60);
    const tipoPrecioTexto = tipoPrecio === 'minimo' ? 'PRECIO ESPECIAL' : 'PRECIO FINAL';
    pdf.text(`${tipoPrecioTexto}: $${precioFinal.toLocaleString()}`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    pdf.text(`(Contrato por ${añosContrato} año${añosContrato > 1 ? 's' : ''})`, margin, yPosition);

    // FOOTER
    yPosition = pageHeight - 30;
    pdf.setFontSize(8);
    pdf.setTextColor(127, 140, 141);
    pdf.text('Esta cotización es válida por 30 días. Precios incluyen soporte técnico 24/7.', margin, yPosition);
    yPosition += 4;
    pdf.text('Para aceptar esta propuesta, favor confirmar por email o teléfono.', margin, yPosition);

    return pdf;

  } catch (error) {
    console.error('Error al generar PDF personalizado:', error);
    throw error;
  }
};

// Nueva función para generar PDF con información del cliente
export const generarPDFConCliente = async (datosEmpresa, cliente, serviciosSeleccionados, añosContrato, precioFinal, tipoPrecio) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    let yPosition = margin;

    // Configurar fuente
    pdf.setFont('helvetica');

    // HEADER - Datos de la empresa
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80);
    pdf.text(datosEmpresa.nombre, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    pdf.text(datosEmpresa.direccion, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tel: ${datosEmpresa.telefono} | Email: ${datosEmpresa.email}`, margin, yPosition);
    yPosition += 5;
    pdf.text(datosEmpresa.website, margin, yPosition);
    yPosition += 15;

    // Línea separadora
    pdf.setDrawColor(236, 240, 241);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // TÍTULO
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.text('COTIZACIÓN DE SERVICIOS CLOUD', margin, yPosition);
    yPosition += 15;

    // INFORMACIÓN DEL CLIENTE
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text('DATOS DEL CLIENTE:', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);

    if (cliente.informacionIncluir?.nombreEncargado && cliente.nombreEncargado) {
      pdf.text(`Encargado: ${cliente.nombreEncargado}`, margin, yPosition);
      yPosition += 5;
    }

    if (cliente.informacionIncluir?.nombreEmpresa && cliente.nombreEmpresa) {
      pdf.text(`Empresa: ${cliente.nombreEmpresa}`, margin, yPosition);
      yPosition += 5;
    }

    if (cliente.informacionIncluir?.documentofiscal && cliente.documentofiscal) {
      pdf.text(`Documento Fiscal: ${cliente.documentofiscal}`, margin, yPosition);
      yPosition += 5;
    }

    if (cliente.informacionIncluir?.telefonoEmpresa && cliente.telefonoEmpresa) {
      pdf.text(`Teléfono: ${cliente.telefonoEmpresa}`, margin, yPosition);
      yPosition += 5;
    }

    if (cliente.informacionIncluir?.correoEmpresa && cliente.correoEmpresa) {
      pdf.text(`Email: ${cliente.correoEmpresa}`, margin, yPosition);
      yPosition += 5;
    }

    yPosition += 5;

    // Fecha y duración
    const fechaActual = new Date().toLocaleDateString('es-ES');
    pdf.text(`Fecha: ${fechaActual}`, margin, yPosition);
    pdf.text(`Duración del contrato: ${añosContrato} año${añosContrato > 1 ? 's' : ''}`, pageWidth - 80, yPosition);
    yPosition += 15;

    // Línea separadora
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // SERVICIOS SELECCIONADOS
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text('SERVICIOS INCLUIDOS:', margin, yPosition);
    yPosition += 10;

    // Tabla de servicios
    serviciosSeleccionados.forEach((item, index) => {
      const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
      const subtotalAnual = totalUnidades * item.precioVentaFinal;
      const subtotalTotal = subtotalAnual * añosContrato;

      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Nombre del servicio
      pdf.setFontSize(11);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`${index + 1}. ${item.servicio.nombre}`, margin, yPosition);
      yPosition += 6;

      // Descripción
      pdf.setFontSize(9);
      pdf.setTextColor(127, 140, 141);
      
      // Dividir texto largo si es necesario
      const descripcion = item.servicio.descripcion;
      const maxWidth = pageWidth - margin * 2 - 10;
      const lines = pdf.splitTextToSize(descripcion, maxWidth);
      
      lines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      yPosition += 1;

      // Equipos
      const equipos = `Equipos: ${item.servicio.equipos}`;
      const equiposLines = pdf.splitTextToSize(equipos, maxWidth);
      equiposLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      yPosition += 1;

      // Cantidades y precio
      pdf.setFontSize(10);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`Servidores: ${item.cantidadServidores} | Equipos: ${item.cantidadEquipos}`, margin + 5, yPosition);
      pdf.text(`$${subtotalTotal.toLocaleString()}`, pageWidth - 50, yPosition);
      yPosition += 8;

      // Línea separadora
      pdf.setDrawColor(236, 240, 241);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    });

    // Verificar espacio para resumen
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // RESUMEN FINANCIERO
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text('RESUMEN FINANCIERO:', margin, yPosition);
    yPosition += 10;

    // Calcular totales
    const totalServidores = serviciosSeleccionados.reduce((total, item) => total + (item.cantidadServidores || 0), 0);
    const totalEquipos = serviciosSeleccionados.reduce((total, item) => total + (item.cantidadEquipos || 0), 0);
    const precioAnual = precioFinal / añosContrato;

    pdf.setFontSize(10);
    pdf.text(`Total de Servidores: ${totalServidores} unidades`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Total de Equipos: ${totalEquipos} unidades`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Precio anual: $${precioAnual.toLocaleString()}/año`, margin, yPosition);
    yPosition += 10;

    // PRECIO FINAL - Destacado
    pdf.setFontSize(14);
    pdf.setTextColor(231, 76, 60);
    const tipoPrecioTexto = tipoPrecio === 'minimo' ? 'PRECIO ESPECIAL' : 'PRECIO FINAL';
    
    // Crear rectángulo de fondo para el precio
    pdf.setFillColor(255, 248, 248);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - margin * 2 + 10, 15, 'F');
    
    pdf.text(`${tipoPrecioTexto}: $${precioFinal.toLocaleString()}`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(127, 140, 141);
    pdf.text(`(Contrato por ${añosContrato} año${añosContrato > 1 ? 's' : ''})`, margin, yPosition);
    yPosition += 15;

    // CONDICIONES
    pdf.setFontSize(10);
    pdf.setTextColor(44, 62, 80);
    pdf.text('CONDICIONES:', margin, yPosition);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setTextColor(127, 140, 141);
    pdf.text('• Esta cotización es válida por 30 días a partir de la fecha de emisión', margin, yPosition);
    yPosition += 4;
    pdf.text('• Precios incluyen soporte técnico 24/7 durante toda la duración del contrato', margin, yPosition);
    yPosition += 4;
    pdf.text('• Los servicios se activarán dentro de 48 horas después de la confirmación', margin, yPosition);
  

    // FOOTER
    yPosition = pageHeight - 25;
    pdf.setFontSize(8);
    pdf.setTextColor(127, 140, 141);
    pdf.text('Para aceptar esta propuesta o solicitar modificaciones, favor confirmar por email o teléfono.', margin, yPosition);
    yPosition += 4;
    pdf.text('¡Gracias por considerar nuestros servicios!', margin, yPosition);

    // Número de página
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(127, 140, 141);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }

    return pdf;

  } catch (error) {
    console.error('Error al generar PDF con cliente:', error);
    throw error;
  }
};

// Función utilitaria para formatear números
export const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

// Función para validar datos antes de generar PDF
export const validarDatosParaPDF = (serviciosSeleccionados, cliente = null) => {
  const errores = [];

  if (!serviciosSeleccionados || serviciosSeleccionados.length === 0) {
    errores.push('Debe seleccionar al menos un servicio');
  }

  serviciosSeleccionados.forEach((item) => { // Eliminé 'index' ya que no se usa
    const totalUnidades = (item.cantidadServidores || 0) + (item.cantidadEquipos || 0);
    if (totalUnidades === 0) {
      errores.push(`El servicio ${item.servicio.nombre} no tiene cantidades definidas`);
    }
    if (!item.precioVentaFinal || item.precioVentaFinal <= 0) {
      errores.push(`El servicio ${item.servicio.nombre} no tiene precio de venta válido`);
    }
  });

  if (cliente) {
    if (!cliente.nombreEmpresa && !cliente.nombreEncargado) {
      errores.push('El cliente debe tener al menos nombre de empresa o encargado');
    }
  }

  return {
    esValido: errores.length === 0,
    errores: errores
  };
};