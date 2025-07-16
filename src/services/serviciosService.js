import api from './api';

class ServiciosService {
  
  // ==================== MÉTODOS PRINCIPALES ====================
  
  // Obtener todos los servicios con paginación y filtros
  async getServicios(params = {}) {
    try {
      console.log('📋 Obteniendo servicios con parámetros:', params);
      
      const response = await api.get('/servicios', { params });
      
      if (response.data.success) {
        console.log('✅ Servicios obtenidos:', response.data.data);
        return {
          success: true,
          servicios: response.data.data.servicios,
          pagination: response.data.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo servicios'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener servicio por ID (con categorías expandidas)
  async getServicioById(id) {
    try {
      console.log('🛠️ Obteniendo servicio ID:', id);
      
      const response = await api.get(`/servicios/${id}`);
      
      if (response.data.success) {
        console.log('✅ Servicio obtenido:', response.data.data.servicio);
        return {
          success: true,
          servicio: response.data.data.servicio
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Servicio no encontrado'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // 🆕 NUEVO: Obtener todas las categorías de un servicio
  async getCategoriesForServicio(servicioId) {
    try {
      console.log('🏷️ Obteniendo categorías para servicio ID:', servicioId);
      
      const response = await api.get(`/servicios/${servicioId}/categories`);
      
      if (response.data.success) {
        console.log('✅ Categorías obtenidas:', response.data.data.categorias);
        return {
          success: true,
          categorias: response.data.data.categorias
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo categorías del servicio'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo categorías del servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // 🆕 NUEVO: Obtener servicios relacionados
  async getRelatedServicios(servicioId, limit = 5) {
    try {
      console.log('🔗 Obteniendo servicios relacionados para ID:', servicioId);
      
      const response = await api.get(`/servicios/${servicioId}/related`, {
        params: { limit }
      });
      
      if (response.data.success) {
        console.log('✅ Servicios relacionados obtenidos:', response.data.data.servicios);
        return {
          success: true,
          servicios: response.data.data.servicios
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo servicios relacionados'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicios relacionados:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // 🆕 NUEVO: Obtener servicios con categorías expandidas
  async getServiciosWithExpandedCategories(params = {}) {
    try {
      console.log('📋🏷️ Obteniendo servicios con categorías expandidas:', params);
      
      const response = await api.get('/servicios/expanded', { params });
      
      if (response.data.success) {
        console.log('✅ Servicios con categorías expandidas obtenidos:', response.data.data);
        return {
          success: true,
          servicios: response.data.data.servicios,
          pagination: response.data.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo servicios expandidos'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicios expandidos:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // 🔧 ACTUALIZADO: Crear nuevo servicio (con soporte para múltiples categorías)
  async createServicio(servicioData) {
    try {
      console.log('➕ Creando servicio:', servicioData);
      
      // 🆕 NUEVO: Preparar datos para múltiples categorías
      const dataToSend = this.prepareServicioDataForAPI(servicioData);
      
      const response = await api.post('/servicios', dataToSend);
      
      if (response.data.success) {
        console.log('✅ Servicio creado exitosamente:', response.data.data.servicio);
        return {
          success: true,
          servicio: response.data.data.servicio,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error creando servicio'
      };
      
    } catch (error) {
      console.error('❌ Error creando servicio:', error);
      
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
  
  // 🔧 ACTUALIZADO: Actualizar servicio (con soporte para múltiples categorías)
  async updateServicio(id, servicioData) {
    try {
      console.log('✏️ Actualizando servicio ID:', id, 'con datos:', servicioData);
      
      // 🆕 NUEVO: Preparar datos para múltiples categorías
      const dataToSend = this.prepareServicioDataForAPI(servicioData);
      
      const response = await api.put(`/servicios/${id}`, dataToSend);
      
      if (response.data.success) {
        console.log('✅ Servicio actualizado exitosamente:', response.data.data.servicio);
        return {
          success: true,
          servicio: response.data.data.servicio,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error actualizando servicio'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando servicio:', error);
      
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

  // 🆕 NUEVO: Asignar múltiples categorías a un servicio existente
  async assignCategoriesToServicio(servicioId, categorias, categoriaPrincipal) {
    try {
      console.log('🏷️ Asignando categorías al servicio ID:', servicioId, 'categorías:', categorias);
      
      const response = await api.post(`/servicios/${servicioId}/assign-categories`, {
        categorias,
        categoria_principal: categoriaPrincipal,
        replace_existing: true
      });
      
      if (response.data.success) {
        console.log('✅ Categorías asignadas exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error asignando categorías'
      };
      
    } catch (error) {
      console.error('❌ Error asignando categorías:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // 🆕 NUEVO: Verificar conflictos de nombres en múltiples categorías
  async checkNameConflicts(nombre, categorias, excludeId = null) {
    try {
      console.log('🔍 Verificando conflictos de nombre:', nombre, 'en categorías:', categorias);
      
      const response = await api.post('/servicios/check-conflicts', {
        nombre,
        categorias,
        excludeId
      });
      
      if (response.data.success) {
        console.log('✅ Verificación de conflictos completada:', response.data.data);
        return {
          success: true,
          hasConflicts: response.data.data.hasConflicts,
          conflicts: response.data.data.conflicts || []
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error verificando conflictos'
      };
      
    } catch (error) {
      console.error('❌ Error verificando conflictos:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Eliminar servicio (soft delete)
  async deleteServicio(id) {
    try {
      console.log('🗑️ Eliminando servicio ID:', id);
      
      const response = await api.delete(`/servicios/${id}`);
      
      if (response.data.success) {
        console.log('✅ Servicio eliminado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error eliminando servicio'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Restaurar servicio
  async restoreServicio(id) {
    try {
      console.log('🔄 Restaurando servicio ID:', id);
      
      const response = await api.patch(`/servicios/${id}/restore`);
      
      if (response.data.success) {
        console.log('✅ Servicio restaurado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error restaurando servicio'
      };
      
    } catch (error) {
      console.error('❌ Error restaurando servicio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener estadísticas de servicios
  async getEstadisticas() {
    try {
      console.log('📊 Obteniendo estadísticas de servicios...');
      
      const response = await api.get('/servicios/admin/estadisticas');
      
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

  // 🆕 NUEVO: Obtener estadísticas avanzadas por categoría
  async getAdvancedCategoryStats() {
    try {
      console.log('📊 Obteniendo estadísticas avanzadas por categoría...');
      
      const response = await api.get('/servicios/admin/stats/categories');
      
      if (response.data.success) {
        console.log('✅ Estadísticas avanzadas obtenidas:', response.data.data.estadisticas);
        return {
          success: true,
          estadisticas: response.data.data.estadisticas
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo estadísticas avanzadas'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas avanzadas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // 🆕 NUEVO: Migrar servicios a múltiples categorías
  async migrateToMultipleCategories() {
    try {
      console.log('🔄 Iniciando migración a múltiples categorías...');
      
      const response = await api.post('/servicios/admin/migrate');
      
      if (response.data.success) {
        console.log('✅ Migración completada:', response.data.message);
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en la migración'
      };
      
    } catch (error) {
      console.error('❌ Error en migración:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // 🆕 NUEVO: Validar integridad de datos
  async validateDataIntegrity() {
    try {
      console.log('🔍 Validando integridad de datos...');
      
      const response = await api.get('/servicios/admin/validate');
      
      if (response.data.success) {
        console.log('✅ Validación completada:', response.data);
        return {
          success: true,
          issues: response.data.issues || [],
          summary: response.data.summary || {}
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error validando integridad'
      };
      
    } catch (error) {
      console.error('❌ Error validando integridad:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Buscar servicios (método helper para autocompletado)
  async searchServicios(searchTerm, limit = 10) {
    try {
      console.log('🔍 Buscando servicios:', searchTerm);
      
      const response = await api.get('/servicios/search', {
        params: {
          q: searchTerm,
          limit
        }
      });
      
      if (response.data.success) {
        console.log('✅ Servicios encontrados:', response.data.data.servicios);
        return {
          success: true,
          servicios: response.data.data.servicios
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en la búsqueda'
      };
      
    } catch (error) {
      console.error('❌ Error buscando servicios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener servicios activos (para selects/dropdowns)
  async getServiciosActivos() {
    try {
      console.log('📝 Obteniendo servicios activos para select...');
      
      const response = await api.get('/servicios/activos');
      
      if (response.data.success) {
        console.log('✅ Servicios activos obtenidos:', response.data.data.servicios);
        return {
          success: true,
          servicios: response.data.data.servicios
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo servicios activos'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicios activos:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // 🔧 ACTUALIZADO: Obtener servicios por categoría (ahora considera múltiples categorías)
  async getServiciosPorCategoria(categoriaId) {
    try {
      console.log('🏷️ Obteniendo servicios por categoría ID:', categoriaId);
      
      const response = await api.get(`/servicios/categoria/${categoriaId}`);
      
      if (response.data.success) {
        console.log('✅ Servicios por categoría obtenidos:', response.data.data.servicios);
        return {
          success: true,
          servicios: response.data.data.servicios
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo servicios por categoría'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo servicios por categoría:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // ==================== MÉTODOS HELPER ACTUALIZADOS ====================

  // 🆕 NUEVO: Preparar datos de servicio para el API (maneja múltiples categorías)
  prepareServicioDataForAPI(servicioData) {
    const data = { ...servicioData };
    
    // Si tenemos un array de categorías seleccionadas
    if (data.categoriasSeleccionadas && Array.isArray(data.categoriasSeleccionadas)) {
      data.categorias = data.categoriasSeleccionadas;
      
      // Si hay una categoría principal específica, usarla, sino usar la primera
      if (data.categoriaPrincipal) {
        data.categoria_principal = data.categoriaPrincipal;
        data.categorias_id = data.categoriaPrincipal; // Para compatibilidad
      } else if (data.categoriasSeleccionadas.length > 0) {
        data.categoria_principal = data.categoriasSeleccionadas[0];
        data.categorias_id = data.categoriasSeleccionadas[0]; // Para compatibilidad
      }
      
      // Limpiar campos del frontend
      delete data.categoriasSeleccionadas;
      delete data.categoriaPrincipal;
    }
    
    // Si solo hay categorias_id (modo de compatibilidad)
    if (data.categorias_id && !data.categorias) {
      data.categorias = [data.categorias_id];
      data.categoria_principal = data.categorias_id;
    }
    
    return data;
  }

  // 🔧 ACTUALIZADO: Validar disponibilidad de nombre (ahora considera múltiples categorías)
  async checkNombreDisponible(nombre, categorias, excludeId = null) {
    try {
      console.log('🔍 Verificando disponibilidad de nombre:', nombre, 'en categorías:', categorias);
      
      // Si es un solo ID, convertir a array
      const categoriasArray = Array.isArray(categorias) ? categorias : [categorias];
      
      const result = await this.checkNameConflicts(nombre, categoriasArray, excludeId);
      
      if (result.success) {
        console.log(`Nombre "${nombre}" ${result.hasConflicts ? 'tiene conflictos' : 'está disponible'}`);
        
        return {
          success: true,
          available: !result.hasConflicts,
          conflicts: result.conflicts || []
        };
      }
      
      return {
        success: false,
        message: result.message || 'Error verificando disponibilidad'
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
  
 // 🔧 CORREGIDO: Método formatServicioDisplay

formatServicioDisplay(servicio) {
  if (!servicio) return null;
  
  // 🆕 PARSEAR múltiples categorías del JSON
  let categoriasArray = [];
  try {
    if (servicio.categorias_ids && servicio.categorias_ids !== 'null') {
      console.log('📋 Parseando categorias_ids:', servicio.categorias_ids);
      categoriasArray = JSON.parse(servicio.categorias_ids);
      
      // Asegurar que es un array de números
      if (Array.isArray(categoriasArray)) {
        categoriasArray = categoriasArray.map(id => parseInt(id)).filter(id => !isNaN(id));
      } else {
        categoriasArray = [];
      }
    } else if (servicio.categorias_id) {
      // Fallback a categoría única
      categoriasArray = [parseInt(servicio.categorias_id)];
    }
  } catch (error) {
    console.error('❌ Error parseando categorias_ids:', error, 'Valor:', servicio.categorias_ids);
    if (servicio.categorias_id) {
      categoriasArray = [parseInt(servicio.categorias_id)];
    }
  }
  
  console.log('📋 Categorías parseadas para servicio', servicio.servicios_id, ':', categoriasArray);
  
  // Obtener información de la categoría principal (para compatibilidad)
  const categoriaPrincipal = servicio.categoria ? {
    categorias_id: servicio.categoria.categorias_id,
    nombre: servicio.categoria.nombre,
    descripcion: servicio.categoria.descripcion,
    unidad_medida: servicio.categoria.unidad_medida ? {
      id: servicio.categoria.unidad_medida.unidades_medida_id,
      nombre: servicio.categoria.unidad_medida.nombre,
      abreviacion: servicio.categoria.unidad_medida.abreviacion,
      tipo: servicio.categoria.unidad_medida.tipo,
      descripcion: servicio.categoria.unidad_medida.descripcion
    } : null
  } : null;
  
  return {
    servicios_id: servicio.servicios_id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precio_minimo: parseFloat(servicio.precio_minimo) || 0,
    precio_recomendado: parseFloat(servicio.precio_recomendado) || 0,
    categorias_id: servicio.categorias_id, // 🔧 Mantener compatibilidad
    categorias_ids: categoriasArray, // 🆕 Array de IDs de categorías
    categoria: categoriaPrincipal, // 🔧 Categoría principal para compatibilidad
    estado: servicio.estado,
    created_at: servicio.created_at,
    updated_at: servicio.updated_at
  };
}

// Agregar este método al servicio:
async getServiciosParaCotizacion(params = {}) {
  try {
    console.log('📋 Obteniendo servicios para cotización con categorías expandidas:', params);
    
    // Usar endpoint expandido
    const response = await api.get('/servicios/expanded', { params });
    
    if (response.data.success) {
      console.log('✅ Servicios expandidos obtenidos:', response.data.data);
      
      // Formatear cada servicio con sus categorías completas
      const serviciosFormateados = response.data.data.servicios.map(servicio => {
        return this.formatServicioParaCotizacion(servicio);
      });
      
      return {
        success: true,
        servicios: serviciosFormateados,
        pagination: response.data.data.pagination
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error obteniendo servicios expandidos'
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo servicios para cotización:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión'
    };
  }
}

// Agregar este método de formateo específico:
formatServicioParaCotizacion(servicio) {
  const servicioBase = this.formatServicioDisplay(servicio);
  
  // ✅ PROCESAR categorias_ids del backend
  let categoriasCompletas = [];
  
  if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
    categoriasCompletas = servicio.categorias_completas;
  } else if (servicio.categoria) {
    categoriasCompletas = [servicio.categoria];
  }
  
  return {
    ...servicioBase,
    categorias_completas: categoriasCompletas
  };
}

  // 🆕 NUEVO: Helper para formatear múltiples categorías como texto
  formatMultipleCategories(categorias, maxVisible = 2) {
    if (!categorias || categorias.length === 0) return 'Sin categorías';
    
    if (categorias.length === 1) {
      return categorias[0].nombre || categorias[0];
    }
    
    const visible = categorias.slice(0, maxVisible);
    const remaining = categorias.length - maxVisible;
    
    let result = visible.map(cat => cat.nombre || cat).join(', ');
    
    if (remaining > 0) {
      result += ` +${remaining} más`;
    }
    
    return result;
  }

  // 🆕 NUEVO: Helper para validar categorías múltiples
  validateMultipleCategories(categorias) {
    if (!categorias || !Array.isArray(categorias)) {
      return { valid: false, message: 'Debe seleccionar al menos una categoría' };
    }
    
    if (categorias.length === 0) {
      return { valid: false, message: 'Debe seleccionar al menos una categoría' };
    }
    
    if (categorias.length > 10) {
      return { valid: false, message: 'No puede seleccionar más de 10 categorías' };
    }
    
    // Verificar duplicados
    const unique = [...new Set(categorias)];
    if (unique.length !== categorias.length) {
      return { valid: false, message: 'No puede repetir categorías' };
    }
    
    return { valid: true, message: '' };
  }

  // 🆕 NUEVO: Helper para obtener la categoría principal de un servicio
  getPrimaryCategory(servicio) {
    if (servicio.categoria) {
      return servicio.categoria;
    }
    
    if (servicio.categorias_completas && servicio.categorias_completas.length > 0) {
      // Buscar la que coincide con categorias_id
      const principal = servicio.categorias_completas.find(
        cat => cat.categorias_id === servicio.categorias_id
      );
      return principal || servicio.categorias_completas[0];
    }
    
    return { nombre: 'Sin categoría', categorias_id: null };
  }

  // 🆕 NUEVO: Helper para verificar si un servicio pertenece a una categoría
  belongsToCategory(servicio, categoriaId) {
    // Verificar categoría principal
    if (servicio.categorias_id === categoriaId) return true;
    
    // Verificar en array de IDs
    if (servicio.categorias_ids && Array.isArray(servicio.categorias_ids)) {
      return servicio.categorias_ids.includes(categoriaId);
    }
    
    // Verificar en categorías completas
    if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
      return servicio.categorias_completas.some(cat => cat.categorias_id === categoriaId);
    }
    
    return false;
  }
  
  // Helper para generar iniciales del servicio
  generateInitials(nombre) {
    if (!nombre) return 'S';
    
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
      return date.toLocaleDateString('en-US', {
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
  
  // Helper para formatear precios
  formatPrice(price) {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
  
  // Helper para obtener rango de precio
  getPriceRange(price) {
    if (!price) return 'unknown';
    
    if (price < 500) return 'bajo';
    if (price <= 2000) return 'medio';
    return 'alto';
  }
  
  // Helper para validar nombre de servicio
  validateNombre(nombre) {
    if (!nombre || nombre.trim().length === 0) {
      return { valid: false, message: 'El nombre es requerido' };
    }
    
    if (nombre.trim().length < 2) {
      return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (nombre.trim().length > 255) {
      return { valid: false, message: 'El nombre no puede exceder 255 caracteres' };
    }
    
    return { valid: true, message: '' };
  }
  
  // Helper para validar descripción
  validateDescripcion(descripcion) {
    if (!descripcion) {
      return { valid: true, message: '' }; // Descripción es opcional
    }
    
    if (descripcion.trim().length > 1000) {
      return { valid: false, message: 'La descripción no puede exceder 1000 caracteres' };
    }
    
    return { valid: true, message: '' };
  }
  
  // Helper para validar precios
  validatePrecios(precioMinimo, precioRecomendado) {
    const errors = [];
    
    if (!precioMinimo || precioMinimo <= 0) {
      errors.push({ field: 'precio_minimo', message: 'El precio mínimo es requerido y debe ser mayor a 0' });
    }
    
    if (!precioRecomendado || precioRecomendado <= 0) {
      errors.push({ field: 'precio_recomendado', message: 'El precio recomendado es requerido y debe ser mayor a 0' });
    }
    
    if (precioMinimo && precioRecomendado && parseFloat(precioRecomendado) < parseFloat(precioMinimo)) {
      errors.push({ field: 'precio_recomendado', message: 'El precio recomendado no puede ser menor al precio mínimo' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  // 🔧 ACTUALIZADO: Helper para obtener servicios formateados para selects (con info de múltiples categorías)
 formatServiciosForSelect(servicios) {
   return servicios.map(servicio => {
     const categorias_info = this.formatMultipleCategories(
       servicio.categorias_completas || [servicio.categoria], 
       2
     );
     
     return {
       value: servicio.servicios_id,
       label: servicio.nombre,
       description: servicio.descripcion,
       categoria: servicio.categoria?.nombre || 'Sin categoría',
       categorias_info: categorias_info,
       categorias_count: servicio.categorias_completas?.length || 1,
       precio_minimo: servicio.precio_minimo,
       precio_recomendado: servicio.precio_recomendado,
       precio_formatted: this.formatPrice(servicio.precio_recomendado),
       unidad_medida: servicio.categoria?.unidad_medida
     };
   });
 }
 
 // 🔧 ACTUALIZADO: Helper para filtrar servicios por texto (incluye múltiples categorías)
 filterServiciosByText(servicios, searchText) {
   if (!searchText || searchText.trim().length === 0) {
     return servicios;
   }
   
   const search = searchText.toLowerCase().trim();
   
   return servicios.filter(servicio => {
     // Buscar en nombre
     if (servicio.nombre.toLowerCase().includes(search)) return true;
     
     // Buscar en descripción
     if (servicio.descripcion && servicio.descripcion.toLowerCase().includes(search)) return true;
     
     // Buscar en categoría principal
     if (servicio.categoria && servicio.categoria.nombre.toLowerCase().includes(search)) return true;
     
     // 🆕 NUEVO: Buscar en todas las categorías
     if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
       return servicio.categorias_completas.some(cat => 
         cat.nombre.toLowerCase().includes(search)
       );
     }
     
     return false;
   });
 }

 // 🔧 ACTUALIZADO: Helper para filtrar servicios por categorías múltiples
 filterServiciosByCategories(servicios, categoriaIds) {
   if (!categoriaIds || categoriaIds.length === 0) {
     return servicios;
   }
   
   const categoriasArray = Array.isArray(categoriaIds) ? categoriaIds : [categoriaIds];
   
   return servicios.filter(servicio => {
     return categoriasArray.some(categoriaId => 
       this.belongsToCategory(servicio, parseInt(categoriaId))
     );
   });
 }

 // 🆕 NUEVO: Helper para agrupar servicios por categoría
 groupServiciosByCategory(servicios) {
   const grupos = {};
   
   servicios.forEach(servicio => {
     // Obtener todas las categorías del servicio
     let categorias = [];
     
     if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
       categorias = servicio.categorias_completas;
     } else if (servicio.categoria) {
       categorias = [servicio.categoria];
     }
     
     // Agregar el servicio a cada grupo de categoría
     categorias.forEach(categoria => {
       const key = categoria.categorias_id || 'sin_categoria';
       const nombre = categoria.nombre || 'Sin Categoría';
       
       if (!grupos[key]) {
         grupos[key] = {
           categoria_id: categoria.categorias_id,
           categoria_nombre: nombre,
           servicios: []
         };
       }
       
       grupos[key].servicios.push(servicio);
     });
   });
   
   return Object.values(grupos);
 }
 
 // Helper para ordenar servicios
 sortServicios(servicios, sortBy = 'nombre', sortOrder = 'asc') {
   return [...servicios].sort((a, b) => {
     let aValue = a[sortBy];
     let bValue = b[sortBy];
     
     // Manejar casos especiales
     if (sortBy === 'categoria') {
       aValue = a.categoria?.nombre || '';
       bValue = b.categoria?.nombre || '';
     }
     
     if (sortBy === 'created_at' || sortBy === 'updated_at') {
       aValue = new Date(aValue);
       bValue = new Date(bValue);
     }
     
     if (sortBy === 'precio_minimo' || sortBy === 'precio_recomendado') {
       aValue = parseFloat(aValue) || 0;
       bValue = parseFloat(bValue) || 0;
     }
     
     // 🆕 NUEVO: Ordenamiento por número de categorías
     if (sortBy === 'categorias_count') {
       aValue = a.categorias_completas?.length || (a.categoria ? 1 : 0);
       bValue = b.categorias_completas?.length || (b.categoria ? 1 : 0);
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
 
 // 🔧 ACTUALIZADO: Helper para obtener estadísticas básicas (considera múltiples categorías)
 getStatsFromList(servicios) {
   const total = servicios.length;
   const activos = servicios.filter(s => s.estado === 'activo').length;
   const inactivos = total - activos;
   
   let sumaPrecios = 0;
   let precioMin = Infinity;
   let precioMax = 0;
   
   // 🆕 NUEVO: Estadísticas de categorías
   const categoriasSet = new Set();
   let serviciosConMultiplesCategorias = 0;
   
   servicios.forEach(servicio => {
     if (servicio.estado === 'activo' && servicio.precio_recomendado) {
       const precio = parseFloat(servicio.precio_recomendado);
       sumaPrecios += precio;
       precioMin = Math.min(precioMin, precio);
       precioMax = Math.max(precioMax, precio);
     }
     
     // Contar categorías únicas
     if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
       servicio.categorias_completas.forEach(cat => categoriasSet.add(cat.categorias_id));
       if (servicio.categorias_completas.length > 1) {
         serviciosConMultiplesCategorias++;
       }
     } else if (servicio.categoria) {
       categoriasSet.add(servicio.categoria.categorias_id);
     }
   });
   
   const precioPromedio = activos > 0 ? sumaPrecios / activos : 0;
   
   return {
     total,
     activos,
     inactivos,
     precio_promedio: precioPromedio.toFixed(2),
     precio_minimo: precioMin === Infinity ? 0 : precioMin.toFixed(2),
     precio_maximo: precioMax.toFixed(2),
     porcentaje_activos: total > 0 ? Math.round((activos / total) * 100) : 0,
     // 🆕 NUEVAS estadísticas
     categorias_unicas: categoriasSet.size,
     servicios_con_multiples_categorias: serviciosConMultiplesCategorias,
     porcentaje_multiples_categorias: total > 0 ? Math.round((serviciosConMultiplesCategorias / total) * 100) : 0
   };
 }

 // ==================== MÉTODOS HELPER ADICIONALES ====================

 // 🆕 NUEVO: Helper para preparar datos del formulario
 prepareFormData(formData) {
   const data = { ...formData };
   
   // Convertir precios a números
   if (data.precio_minimo) {
     data.precio_minimo = parseFloat(data.precio_minimo);
   }
   if (data.precio_recomendado) {
     data.precio_recomendado = parseFloat(data.precio_recomendado);
   }
   
   // Limpiar descripción
   if (data.descripcion) {
     data.descripcion = data.descripcion.trim();
   }
   
   // Limpiar nombre
   if (data.nombre) {
     data.nombre = data.nombre.trim();
   }
   
   return data;
 }

 // 🆕 NUEVO: Helper para validar formulario completo
 validateFormData(formData) {
   const errors = [];
   
   // Validar nombre
   const nombreValidation = this.validateNombre(formData.nombre);
   if (!nombreValidation.valid) {
     errors.push({ field: 'nombre', message: nombreValidation.message });
   }
   
   // Validar descripción
   const descripcionValidation = this.validateDescripcion(formData.descripcion);
   if (!descripcionValidation.valid) {
     errors.push({ field: 'descripcion', message: descripcionValidation.message });
   }
   
   // Validar precios
   const preciosValidation = this.validatePrecios(formData.precio_minimo, formData.precio_recomendado);
   if (!preciosValidation.valid) {
     errors.push(...preciosValidation.errors);
   }
   
   // Validar categorías (si están presentes)
   if (formData.categoriasSeleccionadas) {
     const categoriasValidation = this.validateMultipleCategories(formData.categoriasSeleccionadas);
     if (!categoriasValidation.valid) {
       errors.push({ field: 'categorias', message: categoriasValidation.message });
     }
   } else if (!formData.categorias_id) {
     errors.push({ field: 'categorias', message: 'Debe seleccionar al menos una categoría' });
   }
   
   return {
     valid: errors.length === 0,
     errors
   };
 }

 // 🆕 NUEVO: Helper para crear estructura de datos vacía
 createEmptyServicio() {
   return {
     nombre: '',
     descripcion: '',
     categorias_id: null,
     categoriasSeleccionadas: [],
     categoriaPrincipal: null,
     precio_minimo: '',
     precio_recomendado: '',
     estado: 'activo'
   };
 }

 // 🆕 NUEVO: Helper para clonar servicio (para edición)
 cloneServicioForEdit(servicio) {
   const cloned = {
     nombre: servicio.nombre || '',
     descripcion: servicio.descripcion || '',
     categorias_id: servicio.categorias_id,
     precio_minimo: servicio.precio_minimo || '',
     precio_recomendado: servicio.precio_recomendado || '',
     estado: servicio.estado || 'activo'
   };
   
   // 🆕 NUEVO: Preparar categorías múltiples para edición
   if (servicio.categorias_completas && Array.isArray(servicio.categorias_completas)) {
     cloned.categoriasSeleccionadas = servicio.categorias_completas.map(cat => cat.categorias_id);
     cloned.categoriaPrincipal = servicio.categorias_id;
   } else if (servicio.categorias_ids && Array.isArray(servicio.categorias_ids)) {
     cloned.categoriasSeleccionadas = [...servicio.categorias_ids];
     cloned.categoriaPrincipal = servicio.categorias_id;
   } else if (servicio.categorias_id) {
     cloned.categoriasSeleccionadas = [servicio.categorias_id];
     cloned.categoriaPrincipal = servicio.categorias_id;
   }
   
   return cloned;
 }

 // 🆕 NUEVO: Helper para generar reporte de servicios
 generateServicesReport(servicios) {
   const stats = this.getStatsFromList(servicios);
   const grupos = this.groupServiciosByCategory(servicios);
   
   return {
     estadisticas_generales: stats,
     por_categoria: grupos,
     servicios_destacados: {
       mas_caro: servicios.reduce((max, s) => 
         (s.precio_recomendado > (max?.precio_recomendado || 0)) ? s : max, null),
       mas_barato: servicios.reduce((min, s) => 
         (s.precio_recomendado < (min?.precio_recomendado || Infinity)) ? s : min, null),
       mas_categorias: servicios.reduce((max, s) => 
         ((s.categorias_completas?.length || 0) > (max?.categorias_completas?.length || 0)) ? s : max, null)
     },
     fecha_generacion: new Date().toISOString(),
     total_servicios: servicios.length
   };
 }

 // 🆕 NUEVO: Helper para exportar servicios a CSV
 exportToCSV(servicios, includeCategories = true) {
   const headers = [
     'ID',
     'Nombre',
     'Descripción',
     'Categoría Principal',
     ...(includeCategories ? ['Todas las Categorías', 'Número de Categorías'] : []),
     'Precio Mínimo',
     'Precio Recomendado',
     'Estado',
     'Fecha Creación'
   ];
   
   const rows = servicios.map(servicio => {
     const row = [
       servicio.servicios_id,
       `"${servicio.nombre}"`,
       `"${servicio.descripcion || ''}"`,
       `"${servicio.categoria?.nombre || 'Sin categoría'}"`,
       ...(includeCategories ? [
         `"${this.formatMultipleCategories(servicio.categorias_completas || [servicio.categoria], 10)}"`,
         servicio.categorias_completas?.length || 1
       ] : []),
       servicio.precio_minimo,
       servicio.precio_recomendado,
       servicio.estado,
       this.formatDate(servicio.created_at)
     ];
     
     return row.join(',');
   });
   
   return [headers.join(','), ...rows].join('\n');
 }

 // 🆕 NUEVO: Helper para generar URL de filtros
 generateFilterURL(filtros) {
   const params = new URLSearchParams();
   
   Object.entries(filtros).forEach(([key, value]) => {
     if (value !== null && value !== undefined && value !== '') {
       if (Array.isArray(value)) {
         params.set(key, value.join(','));
       } else {
         params.set(key, value.toString());
       }
     }
   });
   
   return params.toString();
 }

 // 🆕 NUEVO: Helper para parsear URL de filtros
 parseFilterURL(urlParams) {
   const filtros = {};
   
   for (const [key, value] of urlParams.entries()) {
     if (key.includes('categoria') && value.includes(',')) {
       filtros[key] = value.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
     } else {
       filtros[key] = value;
     }
   }
   
   return filtros;
 }

 // 🆕 NUEVO: Helper para debounce de búsquedas
 debounce(func, wait) {
   let timeout;
   return function executedFunction(...args) {
     const later = () => {
       clearTimeout(timeout);
       func(...args);
     };
     clearTimeout(timeout);
     timeout = setTimeout(later, wait);
   };
 }

 // 🆕 NUEVO: Helper para cache simple
 createCache(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
   const cache = new Map();
   
   return {
     get: (key) => {
       const item = cache.get(key);
       if (!item) return null;
       
       if (Date.now() > item.expiry) {
         cache.delete(key);
         return null;
       }
       
       return item.data;
     },
     
     set: (key, data) => {
       cache.set(key, {
         data,
         expiry: Date.now() + ttl
       });
     },
     
     clear: () => cache.clear(),
     
     delete: (key) => cache.delete(key)
   };
 }
}

// Exportar instancia única
export default new ServiciosService();