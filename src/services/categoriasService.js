import api from './api';

class CategoriasService {
 
 // Obtener todas las categorías con paginación y filtros
 async getCategorias(params = {}) {
   try {
     console.log('📋 Obteniendo categorías con parámetros:', params);
     
     const response = await api.get('/categorias', { params });
     
     if (response.data.success) {
       console.log('✅ Categorías obtenidas:', response.data.data);
       return {
         success: true,
         categorias: response.data.data.categorias,
         pagination: response.data.data.pagination
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo categorías'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo categorías:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener categoría por ID
 async getCategoriaById(id) {
   try {
     console.log('🏷️ Obteniendo categoría ID:', id);
     
     const response = await api.get(`/categorias/${id}`);
     
     if (response.data.success) {
       console.log('✅ Categoría obtenida:', response.data.data.categoria);
       return {
         success: true,
         categoria: response.data.data.categoria
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Categoría no encontrada'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo categoría:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Crear nueva categoría
 async createCategoria(categoriaData) {
   try {
     console.log('➕ Creando categoría:', categoriaData);
     
     const response = await api.post('/categorias', categoriaData);
     
     if (response.data.success) {
       console.log('✅ Categoría creada exitosamente:', response.data.data.categoria);
       return {
         success: true,
         categoria: response.data.data.categoria,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error creando categoría'
     };
     
   } catch (error) {
     console.error('❌ Error creando categoría:', error);
     
     if (error.response?.data?.errores) {
       return {
         success: false,
         message: error.response.data.message,
         errors: error.response.data.errores
       };
     }
     
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Actualizar categoría
 async updateCategoria(id, categoriaData) {
   try {
     console.log('✏️ Actualizando categoría ID:', id, 'con datos:', categoriaData);
     
     const response = await api.put(`/categorias/${id}`, categoriaData);
     
     if (response.data.success) {
       console.log('✅ Categoría actualizada exitosamente:', response.data.data.categoria);
       return {
         success: true,
         categoria: response.data.data.categoria,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error actualizando categoría'
     };
     
   } catch (error) {
     console.error('❌ Error actualizando categoría:', error);
     
     if (error.response?.data?.errores) {
       return {
         success: false,
         message: error.response.data.message,
         errors: error.response.data.errores
       };
     }
     
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Eliminar categoría (soft delete)
 async deleteCategoria(id) {
   try {
     console.log('🗑️ Eliminando categoría ID:', id);
     
     const response = await api.delete(`/categorias/${id}`);
     
     if (response.data.success) {
       console.log('✅ Categoría eliminada exitosamente');
       return {
         success: true,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error eliminando categoría'
     };
     
   } catch (error) {
     console.error('❌ Error eliminando categoría:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Restaurar categoría
 async restoreCategoria(id) {
   try {
     console.log('🔄 Restaurando categoría ID:', id);
     
     const response = await api.patch(`/categorias/${id}/restore`);
     
     if (response.data.success) {
       console.log('✅ Categoría restaurada exitosamente');
       return {
         success: true,
         message: response.data.message
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error restaurando categoría'
     };
     
   } catch (error) {
     console.error('❌ Error restaurando categoría:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener estadísticas de categorías
 async getEstadisticas() {
   try {
     console.log('📊 Obteniendo estadísticas de categorías...');
     
     const response = await api.get('/categorias/admin/estadisticas');
     
     if (response.data.success) {
       console.log('✅ Estadísticas obtenidas:', response.data.data.estadisticas);
       return {
         success: true,
         estadisticas: response.data.data.estadisticas
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
 
 // Buscar categorías (método helper para autocompletado)
 async searchCategorias(searchTerm, limit = 10) {
   try {
     console.log('🔍 Buscando categorías:', searchTerm);
     
     const response = await api.get('/categorias/search', {
       params: {
         q: searchTerm,
         limit
       }
     });
     
     if (response.data.success) {
       console.log('✅ Categorías encontradas:', response.data.data.categorias);
       return {
         success: true,
         categorias: response.data.data.categorias
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error en la búsqueda'
     };
     
   } catch (error) {
     console.error('❌ Error buscando categorías:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Obtener categorías activas (para selects/dropdowns)
 async getCategoriasActivas() {
   try {
     console.log('📝 Obteniendo categorías activas para select...');
     
     const response = await api.get('/categorias/activas');
     
     if (response.data.success) {
       console.log('✅ Categorías activas obtenidas:', response.data.data.categorias);
       return {
         success: true,
         categorias: response.data.data.categorias
       };
     }
     
     return {
       success: false,
       message: response.data.message || 'Error obteniendo categorías activas'
     };
     
   } catch (error) {
     console.error('❌ Error obteniendo categorías activas:', error);
     return {
       success: false,
       message: error.response?.data?.message || 'Error de conexión'
     };
   }
 }
 
 // Validar disponibilidad de nombre de categoría
 async checkNombreDisponible(nombre, excludeId = null) {
   try {
     console.log('🔍 Verificando disponibilidad de nombre:', nombre);
     
     const params = {
       search: nombre,
       estado: 'activo',
       limit: 1
     };
     
     const result = await this.getCategorias(params);
     
     if (result.success) {
       let isAvailable = true;
       
       if (result.categorias.length > 0) {
         // Si hay un ID a excluir (para edición), verificar que no sea el mismo
         if (excludeId) {
           isAvailable = result.categorias[0].categorias_id === parseInt(excludeId);
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
 
 // Obtener estados disponibles
 getEstados() {
   return [
     { value: 'activo', label: 'Activo', color: 'success' },
     { value: 'inactivo', label: 'Inactivo', color: 'danger' }
   ];
 }
 
 // Helper para formatear datos de categoría para mostrar
 formatCategoriaDisplay(categoria) {
   if (!categoria) return null;
   
   const estados = this.getEstados();
   const estado = estados.find(e => e.value === categoria.estado);
   
   return {
     ...categoria,
     estado_label: estado?.label || categoria.estado,
     estado_color: estado?.color || 'secondary',
     iniciales: this.generateInitials(categoria.nombre),
     fecha_creacion: this.formatDate(categoria.created_at),
     fecha_actualizacion: this.formatDate(categoria.updated_at),
     servicios_count: categoria.servicios?.length || 0,
     servicios_activos_count: categoria.servicios?.filter(s => s.estado === 'activo').length || 0,
     descripcion_corta: this.truncateText(categoria.descripcion, 100)
   };
 }
 
 // Helper para generar iniciales de la categoría
 generateInitials(nombre) {
   if (!nombre) return 'C';
   
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
 
 // Helper para validar nombre de categoría
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
 
 // Helper para validar descripción
 validateDescripcion(descripcion) {
   if (!descripcion) {
     return { valid: true, message: '' }; // Descripción es opcional
   }
   
   if (descripcion.trim().length > 500) {
     return { valid: false, message: 'La descripción no puede exceder 500 caracteres' };
   }
   
   return { valid: true, message: '' };
 }
 
 // Helper para obtener categorías formateadas para selects
 formatCategoriasForSelect(categorias) {
   return categorias.map(categoria => ({
     value: categoria.categorias_id,
     label: categoria.nombre,
     description: categoria.descripcion,
     servicios_count: categoria.servicios?.length || 0
   }));
 }
 
 // Helper para filtrar categorías por texto
 filterCategoriasByText(categorias, searchText) {
   if (!searchText || searchText.trim().length === 0) {
     return categorias;
   }
   
   const search = searchText.toLowerCase().trim();
   
   return categorias.filter(categoria => 
     categoria.nombre.toLowerCase().includes(search) ||
     (categoria.descripcion && categoria.descripcion.toLowerCase().includes(search))
   );
 }
 
 // Helper para ordenar categorías
 sortCategorias(categorias, sortBy = 'nombre', sortOrder = 'asc') {
   return [...categorias].sort((a, b) => {
     let aValue = a[sortBy];
     let bValue = b[sortBy];
     
     // Manejar casos especiales
     if (sortBy === 'servicios_count') {
       aValue = a.servicios?.length || 0;
       bValue = b.servicios?.length || 0;
     }
     
     if (sortBy === 'created_at' || sortBy === 'updated_at') {
       aValue = new Date(aValue);
       bValue = new Date(bValue);
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
 
 // Helper para obtener estadísticas básicas de una lista de categorías
 getStatsFromList(categorias) {
   const total = categorias.length;
   const activas = categorias.filter(c => c.estado === 'activo').length;
   const inactivas = total - activas;
   const conServicios = categorias.filter(c => c.servicios && c.servicios.length > 0).length;
   
   return {
     total,
     activas,
     inactivas,
     con_servicios: conServicios,
     sin_servicios: total - conServicios,
     porcentaje_activas: total > 0 ? Math.round((activas / total) * 100) : 0,
     porcentaje_con_servicios: total > 0 ? Math.round((conServicios / total) * 100) : 0
   };
 }
}

// Exportar instancia única
export default new CategoriasService();