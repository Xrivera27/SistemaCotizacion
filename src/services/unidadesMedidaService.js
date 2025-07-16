// src/services/unidadesMedidaService.js

import api from './api';

class UnidadesMedidaService {
 
 // Obtener todas las unidades de medida con paginación y filtros
 async getUnidades(params = {}) {
   try {
     console.log('📏 Obteniendo unidades de medida con parámetros:', params);
     
     const response = await api.get('/unidades-medida', { params });
     
     if (response.data.success) {
       console.log('✅ Unidades de medida obtenidas:', response.data.data);
       return {
         success: true,
         unidades: response.data.data.unidades,
         pagination: response.data.data.pagination
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo unidades de medida'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo unidades de medida:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener unidad de medida por ID
 async getUnidadById(id) {
   try {
     console.log('📏 Obteniendo unidad de medida ID:', id);
     
     const response = await api.get(`/unidades-medida/${id}`);
     
     if (response.data.success) {
       console.log('✅ Unidad de medida obtenida:', response.data.data);
       return {
         success: true,
         unidad: response.data.data
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Unidad de medida no encontrada'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo unidad de medida:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Crear nueva unidad de medida
 async createUnidad(unidadData) {
   try {
     console.log('➕ Creando unidad de medida:', unidadData);
     
     const response = await api.post('/unidades-medida', unidadData);
     
     if (response.data.success) {
       console.log('✅ Unidad de medida creada exitosamente:', response.data.data);
       return {
         success: true,
         unidad: response.data.data,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error creando unidad de medida'
     };
     
   } catch (error) {
     console.error('❌ Error creando unidad de medida:', error);
     
     if (error.response?.data?.errors) {
       return {
         success: false,
         message: error.response.data.message,
         errors: error.response.data.errors
       };
     }
     
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Actualizar unidad de medida
 async updateUnidad(id, unidadData) {
   try {
     console.log('✏️ Actualizando unidad de medida ID:', id, 'con datos:', unidadData);
     
     const response = await api.put(`/unidades-medida/${id}`, unidadData);
     
     if (response.data.success) {
       console.log('✅ Unidad de medida actualizada exitosamente:', response.data.data);
       return {
         success: true,
         unidad: response.data.data,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error actualizando unidad de medida'
     };
     
   } catch (error) {
     console.error('❌ Error actualizando unidad de medida:', error);
     
     if (error.response?.data?.errors) {
       return {
         success: false,
         message: error.response.data.message,
         errors: error.response.data.errors
       };
     }
     
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Eliminar unidad de medida (soft delete)
 async deleteUnidad(id) {
   try {
     console.log('🗑️ Eliminando unidad de medida ID:', id);
     
     const response = await api.delete(`/unidades-medida/${id}`);
     
     if (response.data.success) {
       console.log('✅ Unidad de medida eliminada exitosamente');
       return {
         success: true,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error eliminando unidad de medida'
     };
     
   } catch (error) {
     console.error('❌ Error eliminando unidad de medida:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Restaurar unidad de medida
 async restoreUnidad(id) {
   try {
     console.log('🔄 Restaurando unidad de medida ID:', id);
     
     const response = await api.post(`/unidades-medida/${id}/restore`);
     
     if (response.data.success) {
       console.log('✅ Unidad de medida restaurada exitosamente');
       return {
         success: true,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error restaurando unidad de medida'
     };
     
   } catch (error) {
     console.error('❌ Error restaurando unidad de medida:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener estadísticas de unidades de medida
 async getEstadisticas() {
   try {
     console.log('📊 Obteniendo estadísticas de unidades de medida...');
     
     const response = await api.get('/unidades-medida/estadisticas');
     
     if (response.data.success) {
       console.log('✅ Estadísticas obtenidas:', response.data.data);
       return {
         success: true,
         estadisticas: response.data.data
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
 
 // Buscar unidades de medida (método helper para autocompletado)
 async searchUnidades(searchTerm, limit = 10) {
   try {
     console.log('🔍 Buscando unidades de medida:', searchTerm);
     
     const response = await api.get('/unidades-medida/search', {
       params: {
         q: searchTerm,
         limit
       }
     });
     
     if (response.data.success) {
       console.log('✅ Unidades de medida encontradas:', response.data.data);
       return {
         success: true,
         unidades: response.data.data
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error en la búsqueda'
     };
     
   } catch (error) {
     console.error('❌ Error buscando unidades de medida:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener unidades de medida activas (para selects/dropdowns)
 async getUnidadesActivas() {
   try {
     console.log('📝 Obteniendo unidades de medida activas para select...');
     
     const response = await api.get('/unidades-medida/activas');
     
     if (response.data.success) {
       console.log('✅ Unidades de medida activas obtenidas:', response.data.data);
       return {
         success: true,
         unidades: response.data.data
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo unidades de medida activas'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo unidades de medida activas:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }

 // Validar disponibilidad de nombre de unidad de medida
 async checkNombreDisponible(nombre, excludeId = null) {
   try {
     console.log('🔍 Verificando disponibilidad de nombre:', nombre);
     
     const params = {
       search: nombre,
       activo: '1',
       limit: 1
     };
     
     const result = await this.getUnidades(params);
     
     if (result.success) {
       let isAvailable = true;
       
       if (result.unidades.length > 0) {
         // Si hay un ID a excluir (para edición), verificar que no sea el mismo
         if (excludeId) {
           isAvailable = result.unidades[0].unidades_medida_id === parseInt(excludeId);
         } else {
           isAvailable = false;
         }
       }
       
       console.log(`Nombre "${nombre}" está ${isAvailable ? 'disponible' : 'ocupado'}`);
       
       return {
         success: true,
         available: isAvailable
       };
     }
     
     return {
       success: false,
       message: 'Error verificando disponibilidad'
     };
     
   } catch (error) {
     console.error('❌ Error verificando disponibilidad:', error);
     return {
       success: false,
       message: 'Error de conexión'
     };
   }
 }

 // Validar disponibilidad de abreviación
 async checkAbreviacionDisponible(abreviacion, excludeId = null) {
   try {
     console.log('🔍 Verificando disponibilidad de abreviación:', abreviacion);
     
     const params = {
       search: abreviacion,
       activo: '1',
       limit: 1
     };
     
     const result = await this.getUnidades(params);
     
     if (result.success) {
       let isAvailable = true;
       
       if (result.unidades.length > 0) {
         const encontrada = result.unidades.find(u => 
           u.abreviacion.toLowerCase() === abreviacion.toLowerCase()
         );
         
         if (encontrada) {
           if (excludeId) {
             isAvailable = encontrada.unidades_medida_id === parseInt(excludeId);
           } else {
             isAvailable = false;
           }
         }
       }
       
       console.log(`Abreviación "${abreviacion}" está ${isAvailable ? 'disponible' : 'ocupada'}`);
       
       return {
         success: true,
         available: isAvailable
       };
     }
     
     return {
       success: false,
       message: 'Error verificando disponibilidad'
     };
     
   } catch (error) {
     console.error('❌ Error verificando disponibilidad:', error);
     return {
       success: false,
       message: 'Error de conexión'
     };
   }
 }
 
 // Obtener estados disponibles
 getEstados() {
   return [
     { value: true, label: 'Activa', color: 'success' },
     { value: false, label: 'Inactiva', color: 'danger' }
   ];
 }

 // Obtener tipos disponibles
 getTipos() {
   return [
     { value: 'cantidad', label: 'Cantidad', description: 'Para contar elementos físicos o lógicos', icon: 'fa-hashtag' },
     { value: 'capacidad', label: 'Capacidad', description: 'Para medir almacenamiento o espacio', icon: 'fa-database' },
     { value: 'tiempo', label: 'Tiempo', description: 'Para medir períodos temporales', icon: 'fa-clock' },
     { value: 'usuarios', label: 'Usuarios', description: 'Para contar cantidad de usuarios', icon: 'fa-users' },
     { value: 'sesiones', label: 'Sesiones', description: 'Para contar sesiones o conexiones', icon: 'fa-plug' }
   ];
 }
 
 // Helper para formatear datos de unidad de medida para mostrar
 formatUnidadDisplay(unidad) {
   if (!unidad) return null;
   
   const estados = this.getEstados();
   const tipos = this.getTipos();
   const estado = estados.find(e => e.value === unidad.activo);
   const tipo = tipos.find(t => t.value === unidad.tipo);
   
   return {
     ...unidad,
     estado_label: estado?.label || (unidad.activo ? 'Activa' : 'Inactiva'),
     estado_color: estado?.color || 'secondary',
     tipo_label: tipo?.label || unidad.tipo,
     tipo_description: tipo?.description || '',
     tipo_icon: tipo?.icon || 'fa-ruler',
     iniciales: this.generateInitials(unidad.nombre),
     fecha_creacion: this.formatDate(unidad.created_at),
     fecha_actualizacion: this.formatDate(unidad.updated_at),
     categorias_count: unidad.categorias?.length || 0,
     categorias_activas_count: unidad.categorias?.filter(c => c.estado === 'activo').length || 0,
     descripcion_corta: this.truncateText(unidad.descripcion, 100),
     abreviacion_upper: unidad.abreviacion?.toUpperCase()
   };
 }
 
 // Helper para generar iniciales de la unidad de medida
 generateInitials(nombre) {
   if (!nombre) return 'U';
   
   const palabras = nombre.trim().split(' ');
   
   if (palabras.length >= 2) {
     return (palabras[0][0] + palabras[1][0]).toUpperCase();
   } else {
     return palabras[0].substring(0, 2).toUpperCase();
   }
 }
 
 // Helper para formatear fechas
 formatDate(dateString) {
   if (!dateString) return '';
   
   try {
     const date = new Date(dateString);
     return date.toLocaleDateString('es-ES', {
       year: 'numeric',
       month: 'short',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     });
   } catch (error) {
     return dateString;
   }
 }
 
 // Helper para truncar texto
 truncateText(text, maxLength = 100) {
   if (!text) return '';
   
   if (text.length <= maxLength) {
     return text;
   }
   
   return text.substring(0, maxLength).trim() + '...';
 }
 
 // Helper para validar nombre de unidad de medida
 validateNombre(nombre) {
   if (!nombre || nombre.trim().length === 0) {
     return { valid: false, message: 'El nombre es requerido' };
   }
   
   if (nombre.trim().length < 2) {
     return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
   }
   
   if (nombre.trim().length > 100) {
     return { valid: false, message: 'El nombre no puede exceder 100 caracteres' };
   }
   
   // Verificar caracteres especiales no permitidos
   const invalidChars = /[<>"'&]/;
   if (invalidChars.test(nombre)) {
     return { valid: false, message: 'El nombre contiene caracteres no permitidos' };
   }
   
   return { valid: true, message: '' };
 }

 // Helper para validar abreviación
 validateAbreviacion(abreviacion) {
   if (!abreviacion || abreviacion.trim().length === 0) {
     return { valid: false, message: 'La abreviación es requerida' };
   }
   
   if (abreviacion.trim().length > 20) {
     return { valid: false, message: 'La abreviación no puede exceder 20 caracteres' };
   }
   
   // Verificar que no contenga espacios
   if (/\s/.test(abreviacion)) {
     return { valid: false, message: 'La abreviación no puede contener espacios' };
   }
   
   // Verificar caracteres especiales no permitidos
   const invalidChars = /[<>"'&]/;
   if (invalidChars.test(abreviacion)) {
     return { valid: false, message: 'La abreviación contiene caracteres no permitidos' };
   }
   
   return { valid: true, message: '' };
 }

 // Helper para validar tipo
 validateTipo(tipo) {
   const tiposValidos = this.getTipos().map(t => t.value);
   
   if (!tipo) {
     return { valid: false, message: 'El tipo es requerido' };
   }
   
   if (!tiposValidos.includes(tipo)) {
     return { valid: false, message: 'Debe seleccionar un tipo válido' };
   }
   
   return { valid: true, message: '' };
 }
 
 // Helper para validar descripción
 validateDescripcion(descripcion) {
   if (!descripcion || descripcion.trim().length === 0) {
     return { valid: false, message: 'La descripción es requerida' };
   }
   
   if (descripcion.trim().length > 500) {
     return { valid: false, message: 'La descripción no puede exceder 500 caracteres' };
   }
   
   return { valid: true, message: '' };
 }
 
 // Helper para obtener unidades de medida formateadas para selects
 formatUnidadesForSelect(unidades) {
   return unidades.map(unidad => ({
     value: unidad.unidades_medida_id,
     label: `${unidad.nombre} (${unidad.abreviacion})`,
     description: unidad.descripcion,
     tipo: unidad.tipo,
     tipo_label: this.getTipos().find(t => t.value === unidad.tipo)?.label || unidad.tipo
   }));
 }

 // Helper para agrupar unidades por tipo
 groupUnidadesByTipo(unidades) {
   const grupos = {};
   
   unidades.forEach(unidad => {
     if (!grupos[unidad.tipo]) {
       grupos[unidad.tipo] = [];
     }
     grupos[unidad.tipo].push(unidad);
   });
   
   return grupos;
 }
 
 // Helper para filtrar unidades por texto
 filterUnidadesByText(unidades, searchText) {
   if (!searchText || searchText.trim().length === 0) {
     return unidades;
   }
   
   const search = searchText.toLowerCase().trim();
   
   return unidades.filter(unidad => 
     unidad.nombre.toLowerCase().includes(search) ||
     unidad.abreviacion.toLowerCase().includes(search) ||
     (unidad.descripcion && unidad.descripcion.toLowerCase().includes(search)) ||
     unidad.tipo.toLowerCase().includes(search)
   );
 }
 
 // Helper para ordenar unidades de medida
 sortUnidades(unidades, sortBy = 'nombre', sortOrder = 'asc') {
   return [...unidades].sort((a, b) => {
     let aValue = a[sortBy];
     let bValue = b[sortBy];
     
     // Manejar casos especiales
     if (sortBy === 'categorias_count') {
       aValue = a.categorias?.length || 0;
       bValue = b.categorias?.length || 0;
     }
     
     if (sortBy === 'created_at' || sortBy === 'updated_at') {
       aValue = new Date(aValue);
       bValue = new Date(bValue);
     }
     
     if (sortBy === 'activo') {
       aValue = a.activo ? 1 : 0;
       bValue = b.activo ? 1 : 0;
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
 
 // Helper para obtener estadísticas básicas de una lista de unidades
 getStatsFromList(unidades) {
   const total = unidades.length;
   const activas = unidades.filter(u => u.activo === true || u.activo === 1).length;
   const inactivas = total - activas;
   const conCategorias = unidades.filter(u => u.categorias && u.categorias.length > 0).length;
   
   // Estadísticas por tipo
   const porTipo = {};
   unidades.forEach(unidad => {
     const tipo = unidad.tipo || 'sin_tipo';
     porTipo[tipo] = (porTipo[tipo] || 0) + 1;
   });
   
   return {
     total,
     activas,
     inactivas,
     con_categorias: conCategorias,
     sin_categorias: total - conCategorias,
     tipos_disponibles: Object.keys(porTipo).length,
     porcentaje_activas: total > 0 ? Math.round((activas / total) * 100) : 0,
     porcentaje_con_categorias: total > 0 ? Math.round((conCategorias / total) * 100) : 0,
     por_tipo: porTipo
   };
 }

 // Helper para validar formulario completo
 validateFormulario(datos) {
   const errores = [];
   
   // Validar nombre
   const nombreValidation = this.validateNombre(datos.nombre);
   if (!nombreValidation.valid) {
     errores.push({ field: 'nombre', message: nombreValidation.message });
   }
   
   // Validar abreviación
   const abreviacionValidation = this.validateAbreviacion(datos.abreviacion);
   if (!abreviacionValidation.valid) {
     errores.push({ field: 'abreviacion', message: abreviacionValidation.message });
   }
   
   // Validar tipo
   const tipoValidation = this.validateTipo(datos.tipo);
   if (!tipoValidation.valid) {
     errores.push({ field: 'tipo', message: tipoValidation.message });
   }
   
   // Validar descripción
   const descripcionValidation = this.validateDescripcion(datos.descripcion);
   if (!descripcionValidation.valid) {
     errores.push({ field: 'descripcion', message: descripcionValidation.message });
   }
   
   return {
     valid: errores.length === 0,
     errors: errores
   };
 }

 // Helper para formatear unidad para mostrar en texto
 formatUnidadText(unidad) {
   if (!unidad) return 'N/A';
   return `${unidad.nombre} (${unidad.abreviacion})`;
 }

 // Helper para obtener color del tipo
 getTipoColor(tipo) {
   const colores = {
     cantidad: '#3498db',     // Azul
     capacidad: '#9b59b6',    // Púrpura
     tiempo: '#f39c12',       // Naranja
     usuarios: '#27ae60',     // Verde
     sesiones: '#e74c3c'      // Rojo
   };
   
   return colores[tipo] || '#95a5a6'; // Gris por defecto
 }
}

// Exportar instancia única
export default new UnidadesMedidaService();