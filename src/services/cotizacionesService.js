// services/cotizacionesService.js
import api from './api';

class CotizacionesService {
 
 // Obtener todas las cotizaciones con paginación y filtros
 async getCotizaciones(params = {}) {
   try {
     console.log('📋 Obteniendo cotizaciones con parámetros:', params);
     
     const response = await api.get('/cotizaciones', { params });
     
     if (response.data.success) {
       console.log('✅ Cotizaciones obtenidas:', response.data.cotizaciones);
       return {
         success: true,
         cotizaciones: response.data.cotizaciones,
         pagination: response.data.pagination
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo cotizaciones'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo cotizaciones:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }

 // NUEVO: Obtener cotizaciones pendientes de aprobación (SuperUsuario)
 async getCotizacionesPendientesAprobacion(params = {}) {
   try {
     console.log('⏳ Obteniendo cotizaciones pendientes de aprobación:', params);
     
     const response = await api.get('/cotizaciones/pendientes-aprobacion', { params });
     
     if (response.data.success) {
       console.log('✅ Cotizaciones pendientes obtenidas:', response.data.cotizaciones);
       return {
         success: true,
         cotizaciones: response.data.cotizaciones,
         pagination: response.data.pagination
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo cotizaciones pendientes'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo cotizaciones pendientes:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener cotización por ID
 async getCotizacionById(id) {
   try {
     console.log('📋 Obteniendo cotización ID:', id);
     
     const response = await api.get(`/cotizaciones/${id}`);
     
     if (response.data.success) {
       console.log('✅ Cotización obtenida:', response.data.cotizacion);
       return {
         success: true,
         cotizacion: response.data.cotizacion
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Cotización no encontrada'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo cotización:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener estadísticas de cotizaciones
 async getEstadisticas() {
   try {
     console.log('📊 Obteniendo estadísticas de cotizaciones...');
     
     const response = await api.get('/cotizaciones/estadisticas');
     
     if (response.data.success) {
       console.log('✅ Estadísticas obtenidas:', response.data.estadisticas);
       return {
         success: true,
         estadisticas: response.data.estadisticas
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo estadísticas'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo estadísticas:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }

 // NUEVO: Obtener estadísticas específicas para SuperUsuario
 async getEstadisticasSuper() {
   try {
     console.log('📊 Obteniendo estadísticas de SuperUsuario...');
     
     const response = await api.get('/cotizaciones/estadisticas/super');
     
     if (response.data.success) {
       console.log('✅ Estadísticas SuperUsuario obtenidas:', response.data.estadisticas);
       return {
         success: true,
         estadisticas: response.data.estadisticas,
         pendientesDetalle: response.data.pendientesDetalle || []
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo estadísticas'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo estadísticas SuperUsuario:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener vendedores únicos
 async getVendedores() {
   try {
     console.log('👥 Obteniendo vendedores únicos...');
     
     const response = await api.get('/cotizaciones/vendedores');
     
     if (response.data.success) {
       console.log('✅ Vendedores obtenidos:', response.data.vendedores);
       return {
         success: true,
         vendedores: response.data.vendedores
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo vendedores'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo vendedores:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Generar PDF de cotización (copia o original)
 async generarPDF(id, tipo = 'copia') {
   try {
     console.log('📄 Generando PDF tipo:', tipo, 'para cotización ID:', id);
     
     const response = await api.get(`/cotizaciones/${id}/pdf`, {
       params: { tipo },
       responseType: 'blob' // Importante para recibir el archivo
     });
     
     // Crear URL del blob para descarga
     const url = window.URL.createObjectURL(new Blob([response.data]));
     const link = document.createElement('a');
     link.href = url;
     
     // Generar nombre del archivo
     const numeroDocumento = `CT${String(id).padStart(6, '0')}`;
     const tipoTexto = tipo === 'copia' ? 'Copia' : 'Original';
     link.setAttribute('download', `${numeroDocumento}_${tipoTexto}.pdf`);
     
     // Disparar descarga
     document.body.appendChild(link);
     link.click();
     link.remove();
     window.URL.revokeObjectURL(url);
     
     console.log('✅ PDF descargado exitosamente');
     return {
       success: true,
       message: 'PDF descargado exitosamente'
     };
     
   } catch (error) {
     console.error('❌ Error generando PDF:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error generando PDF'
     };
   }
 }
 
 // Cambiar estado de cotización
 async cambiarEstado(id, estado, motivoRechazo = '') {
   try {
     console.log('🔄 Cambiando estado de cotización ID:', id, 'a:', estado);
     
     const data = { estado };
     if (estado === 'rechazado' && motivoRechazo) {
       data.motivo_rechazo = motivoRechazo;
     }
     
     const response = await api.patch(`/cotizaciones/${id}/estado`, data);
     
     if (response.data.success) {
       console.log('✅ Estado cambiado exitosamente');
       return {
         success: true,
         message: response.data.message,
         cotizacion: response.data.cotizacion
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error cambiando estado'
     };
     
   } catch (error) {
     console.error('❌ Error cambiando estado:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }

 // NUEVO: Aprobar cotización (SuperUsuario)
 async aprobarCotizacion(id, comentario = '') {
   try {
     console.log('✅ Aprobando cotización ID:', id);
     
     const data = {};
     if (comentario) {
       data.comentario = comentario;
     }
     
     const response = await api.patch(`/cotizaciones/${id}/aprobar`, data);
     
     if (response.data.success) {
       console.log('✅ Cotización aprobada exitosamente');
       return {
         success: true,
         message: response.data.message,
         cotizacion: response.data.cotizacion
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error aprobando cotización'
     };
     
   } catch (error) {
     console.error('❌ Error aprobando cotización:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }

 // NUEVO: Rechazar cotización (SuperUsuario)
 async rechazarCotizacion(id, motivoRechazo) {
   try {
     console.log('❌ Rechazando cotización ID:', id, 'Motivo:', motivoRechazo);
     
     if (!motivoRechazo || motivoRechazo.trim().length === 0) {
       return {
         success: false,
         message: 'El motivo de rechazo es obligatorio'
       };
     }
     
     const data = {
       motivo_rechazo: motivoRechazo.trim()
     };
     
     const response = await api.patch(`/cotizaciones/${id}/rechazar`, data);
     
     if (response.data.success) {
       console.log('✅ Cotización rechazada exitosamente');
       return {
         success: true,
         message: response.data.message,
         cotizacion: response.data.cotizacion
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error rechazando cotización'
     };
     
   } catch (error) {
     console.error('❌ Error rechazando cotización:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Helper para formatear datos de cotización para mostrar
 formatCotizacionDisplay(cotizacion) {
   if (!cotizacion) return null;
   
   const estados = this.getEstados();
   const estado = estados.find(e => e.value === cotizacion.estado);
   
   return {
     ...cotizacion,
     estado_label: estado?.label || cotizacion.estado,
     estado_color: estado?.color || 'secondary',
     numero_formateado: this.formatNumeroCotizacion(cotizacion.id),
     fecha_formateada: this.formatDate(cotizacion.fechaCreacion),
     total_formateado: this.formatPrice(cotizacion.total),
     servicios_texto: this.formatServiciosTexto(cotizacion.servicios),
     cliente_info: this.formatClienteInfo(cotizacion.cliente),
     vendedor_info: this.formatVendedorInfo(cotizacion.vendedor),
     // AGREGAR ACCESO A DETALLES COMPLETOS
     servicios_con_detalles: cotizacion.serviciosDetalles || [],
     // INFORMACIÓN DE URGENCIA PARA SUPERUSUARIO
     dias_espera: cotizacion.diasEspera || 0,
     es_urgente: (cotizacion.diasEspera || 0) > 3,
     clase_urgencia: this.getClaseUrgencia(cotizacion.diasEspera || 0)
   };
 }

 // NUEVO: Helper para determinar clase CSS según urgencia
 getClaseUrgencia(diasEspera) {
   if (diasEspera <= 1) return 'success'; // Verde - reciente
   if (diasEspera <= 3) return 'warning'; // Amarillo - moderado
   if (diasEspera <= 7) return 'danger';  // Rojo - urgente
   return 'dark'; // Negro - crítico
 }

 // NUEVO: Helper para formatear tiempo de espera
 formatTiempoEspera(diasEspera) {
   if (!diasEspera || diasEspera === 0) return 'Hoy';
   if (diasEspera === 1) return '1 día';
   if (diasEspera <= 7) return `${diasEspera} días`;
   if (diasEspera <= 30) {
     const semanas = Math.floor(diasEspera / 7);
     const diasRestantes = diasEspera % 7;
     if (diasRestantes === 0) {
       return semanas === 1 ? '1 semana' : `${semanas} semanas`;
     }
     return `${semanas}s ${diasRestantes}d`;
   }
   const meses = Math.floor(diasEspera / 30);
   return meses === 1 ? '1 mes' : `${meses} meses`;
 }

 // 🔧 CORREGIDO: Obtener estados disponibles
 getEstados() {
   return [
     { value: 'pendiente', label: 'Pendiente', color: 'warning' },
     { value: 'pendiente_aprobacion', label: 'Esperando Aprobación', color: 'info' },
     { value: 'efectiva', label: 'Efectiva', color: 'success' },
     { value: 'rechazada', label: 'Rechazada', color: 'danger' }
   ];
 }

 // 🔧 CORREGIDO: Obtener estados específicos para SuperUsuario
 getEstadosSuper() {
   return [
     { value: '', label: 'Todos los estados', color: 'secondary' },
     { value: 'pendiente_aprobacion', label: 'Esperando Aprobación', color: 'info' },
     { value: 'pendiente', label: 'Pendiente', color: 'warning' },
     { value: 'efectiva', label: 'Efectiva', color: 'success' },
     { value: 'rechazada', label: 'Rechazada', color: 'danger' }
   ];
 }

 // NUEVO: Validar si el usuario puede aprobar/rechazar
 puedeAprobarRechazar(cotizacion, userRole) {
   return (userRole === 'super_usuario' || userRole === 'admin') && 
          cotizacion.estado === 'pendiente_aprobacion';
 }

 // NUEVO: Obtener acciones disponibles según rol y estado
 getAccionesDisponibles(cotizacion, userRole) {
   const acciones = [];

   // Ver PDF siempre disponible
   acciones.push({
     tipo: 'pdf',
     label: 'Ver PDF',
     icon: 'file-pdf',
     color: 'primary'
   });

   // Acciones según estado y rol
   if (this.puedeAprobarRechazar(cotizacion, userRole)) {
     acciones.push({
       tipo: 'aprobar',
       label: 'Aprobar',
       icon: 'check',
       color: 'success'
     });
     
     acciones.push({
       tipo: 'rechazar',
       label: 'Rechazar',
       icon: 'times',
       color: 'danger'
     });
   }

   // Cambiar estado general para admin
   if (userRole === 'admin') {
     acciones.push({
       tipo: 'cambiar_estado',
       label: 'Cambiar Estado',
       icon: 'edit',
       color: 'warning'
     });
   }

   return acciones;
 }
 
 // Obtener períodos disponibles para filtros
 getPeriodos() {
   return [
     { value: '', label: 'Todo el tiempo' },
     { value: 'hoy', label: 'Hoy' },
     { value: 'semana', label: 'Esta semana' },
     { value: 'mes', label: 'Este mes' },
     { value: 'trimestre', label: 'Este trimestre' }
   ];
 }
 
 // Helper para formatear número de cotización
 formatNumeroCotizacion(id) {
   return `CT${String(id).padStart(6, '0')}`;
 }
 
 // Helper para formatear fechas
 formatDate(dateString) {
   if (!dateString) return '';
   
   try {
     const date = new Date(dateString);
     return date.toLocaleDateString('es-HN', {
       year: 'numeric',
       month: 'short',
       day: 'numeric'
     });
   } catch (error) {
     return dateString;
   }
 }
 
 // Helper para formatear precios
 formatPrice(amount) {
  if (!amount && amount !== 0) return '$ 0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
 
 // Helper para formatear servicios como texto
 formatServiciosTexto(servicios) {
   if (!servicios || servicios.length === 0) {
     return 'Sin servicios';
   }
   
   if (servicios.length === 1) {
     return servicios[0];
   }
   
   if (servicios.length <= 3) {
     return servicios.join(', ');
   }
   
   return `${servicios.slice(0, 2).join(', ')} y ${servicios.length - 2} más`;
 }
 
 // Helper para formatear información del cliente
 formatClienteInfo(cliente) {
   if (!cliente) return '';
   
   return {
     nombre_completo: cliente.nombre || 'Cliente sin nombre',
     email_principal: cliente.email || 'Sin email',
     iniciales: this.generateInitials(cliente.nombre || 'Cliente')
   };
 }
 
 // Helper para formatear información del vendedor
 formatVendedorInfo(vendedor) {
   if (!vendedor) return '';
   
   return {
     nombre_completo: vendedor.nombre || 'Vendedor sin nombre',
     rol_formateado: vendedor.rol || 'Sin rol',
     iniciales: this.generateInitials(vendedor.nombre || 'Vendedor')
   };
 }
 
 // Helper para generar iniciales
 generateInitials(nombre) {
   if (!nombre) return '??';
   
   const palabras = nombre.trim().split(' ');
   
   if (palabras.length >= 2) {
     return (palabras[0][0] + palabras[1][0]).toUpperCase();
   } else {
     return palabras[0].substring(0, 2).toUpperCase();
   }
 }
 
 // Helper para filtrar cotizaciones por texto
 filterCotizacionesByText(cotizaciones, searchText) {
   if (!searchText || searchText.trim().length === 0) {
     return cotizaciones;
   }
   
   const search = searchText.toLowerCase().trim();
   
   return cotizaciones.filter(cotizacion => 
     this.formatNumeroCotizacion(cotizacion.id).toLowerCase().includes(search) ||
     (cotizacion.cliente.nombre && cotizacion.cliente.nombre.toLowerCase().includes(search)) ||
     (cotizacion.cliente.email && cotizacion.cliente.email.toLowerCase().includes(search)) ||
     (cotizacion.vendedor.nombre && cotizacion.vendedor.nombre.toLowerCase().includes(search)) ||
     (cotizacion.servicios && cotizacion.servicios.some(s => s.toLowerCase().includes(search)))
   );
 }
 
 // Helper para ordenar cotizaciones
 sortCotizaciones(cotizaciones, sortBy = 'fechaCreacion', sortOrder = 'desc') {
   return [...cotizaciones].sort((a, b) => {
     let aValue = a[sortBy];
     let bValue = b[sortBy];
     
     // Manejar casos especiales
     if (sortBy === 'cliente') {
       aValue = a.cliente?.nombre || '';
       bValue = b.cliente?.nombre || '';
     }
     
     if (sortBy === 'vendedor') {
       aValue = a.vendedor?.nombre || '';
       bValue = b.vendedor?.nombre || '';
     }
     
     if (sortBy === 'fechaCreacion') {
       aValue = new Date(aValue);
       bValue = new Date(bValue);
     }
     
     if (sortBy === 'total') {
       aValue = parseFloat(aValue) || 0;
       bValue = parseFloat(bValue) || 0;
     }

     // NUEVO: Ordenar por urgencia
     if (sortBy === 'diasEspera') {
       aValue = parseInt(aValue) || 0;
       bValue = parseInt(bValue) || 0;
     }
     
     // Ordenamiento
     if (aValue < bValue) {
       return sortOrder === 'asc' ? -1 : 1;
     }
     if (aValue > bValue) {
       return sortOrder === 'asc' ? 1 : -1;
     }
     return 0;
   });
 }
 
 // 🔧 CORREGIDO: Helper para obtener estadísticas básicas
 getStatsFromList(cotizaciones) {
   const total = cotizaciones.length;
   const pendientes = cotizaciones.filter(c => c.estado === 'pendiente').length;
   const esperandoAprobacion = cotizaciones.filter(c => c.estado === 'pendiente_aprobacion').length;
   const efectivas = cotizaciones.filter(c => c.estado === 'efectiva').length;
   const rechazadas = cotizaciones.filter(c => c.estado === 'rechazada').length;
   
   // Calcular urgentes (más de 3 días esperando aprobación)
   const urgentes = cotizaciones.filter(c => 
     c.estado === 'pendiente_aprobacion' && (c.diasEspera || 0) > 3
   ).length;
   
   let totalIngresos = 0;
   let ingresoMin = Infinity;
   let ingresoMax = 0;
   
   cotizaciones.forEach(cotizacion => {
     if (cotizacion.estado === 'efectiva' && cotizacion.total) {
       const total = parseFloat(cotizacion.total);
       totalIngresos += total;
       ingresoMin = Math.min(ingresoMin, total);
       ingresoMax = Math.max(ingresoMax, total);
     }
   });
   
   const ingresoPromedio = efectivas > 0 ? totalIngresos / efectivas : 0;
   
   return {
     total,
     pendientes,
     esperando_aprobacion: esperandoAprobacion,
     efectivas,
     rechazadas,
     urgentes,
     total_ingresos: totalIngresos.toFixed(2),
     ingreso_promedio: ingresoPromedio.toFixed(2),
     ingreso_minimo: ingresoMin === Infinity ? 0 : ingresoMin.toFixed(2),
     ingreso_maximo: ingresoMax.toFixed(2),
     porcentaje_efectivas: total > 0 ? Math.round((efectivas / total) * 100) : 0,
     tasa_conversion: total > 0 ? Math.round((efectivas / total) * 100) : 0,
     // NUEVAS MÉTRICAS
     porcentaje_urgentes: esperandoAprobacion > 0 ? Math.round((urgentes / esperandoAprobacion) * 100) : 0,
     tiempo_promedio_aprobacion: this.calcularTiempoPromedioAprobacion(cotizaciones)
   };
 }

 // 🔧 CORREGIDO: Calcular tiempo promedio de aprobación
 calcularTiempoPromedioAprobacion(cotizaciones) {
   const efectivas = cotizaciones.filter(c => 
     c.estado === 'efectiva' && c.diasEspera !== undefined
   );
   
   if (efectivas.length === 0) return 0;
   
   const totalDias = efectivas.reduce((sum, c) => sum + (c.diasEspera || 0), 0);
   return Math.round(totalDias / efectivas.length);
 }
 
 // Helper para validar parámetros de filtro
 validateFilterParams(params) {
   const cleanParams = {};
   
   // Página
   if (params.page && !isNaN(params.page) && params.page > 0) {
     cleanParams.page = parseInt(params.page);
   }
   
   // Límite
   if (params.limit && !isNaN(params.limit) && params.limit > 0 && params.limit <= 100) {
     cleanParams.limit = parseInt(params.limit);
   }
   
   // Búsqueda
   if (params.search && typeof params.search === 'string' && params.search.trim().length > 0) {
     cleanParams.search = params.search.trim();
   }
   
   // Estado
   const estadosValidos = this.getEstados().map(e => e.value);
   if (params.estado && estadosValidos.includes(params.estado)) {
     cleanParams.estado = params.estado;
   }
   
   // Vendedor
   if (params.vendedor && typeof params.vendedor === 'string' && params.vendedor.trim().length > 0) {
     cleanParams.vendedor = params.vendedor.trim();
   }
   
   // Período
   const periodosValidos = this.getPeriodos().map(p => p.value).filter(p => p !== '');
   if (params.periodo && periodosValidos.includes(params.periodo)) {
     cleanParams.periodo = params.periodo;
   }
   
   return cleanParams;
 }
 
 // Helper para construir query string para URLs
 buildQueryString(params) {
   const validParams = this.validateFilterParams(params);
   const queryParams = new URLSearchParams();
   
   Object.keys(validParams).forEach(key => {
     if (validParams[key] !== null && validParams[key] !== undefined) {
       queryParams.append(key, validParams[key]);
     }
   });
   
   return queryParams.toString();
 }

async marcarComoEfectiva(cotizacion) {
  try {
    // Usar la ruta de cambio de estado general
    const response = await this.cotizacionService.cambiarEstado(cotizacion.id, 'efectiva');
    
    if (response.success) {
      this.mostrarMensaje('Cotización marcada como efectiva', 'success');
      await this.cargarDatos();
      if (this.modalCotizacion && this.modalCotizacion.id === cotizacion.id) {
        this.cerrarModal();
      }
    } else {
      this.mostrarMensaje(response.message, 'error');
    }
  } catch (error) {
    this.mostrarMensaje('Error cambiando estado', 'error');
    console.error('Error:', error);
  }
}
 

}

// Exportar instancia única
export default new CotizacionesService();