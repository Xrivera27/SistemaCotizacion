import api from './api';

class ServiciosService {
  
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
  
  // Obtener servicio por ID
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
  
  // Crear nuevo servicio
  async createServicio(servicioData) {
    try {
      console.log('➕ Creando servicio:', servicioData);
      
      const response = await api.post('/servicios', servicioData);
      
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
  
  // Actualizar servicio
  async updateServicio(id, servicioData) {
    try {
      console.log('✏️ Actualizando servicio ID:', id, 'con datos:', servicioData);
      
      const response = await api.put(`/servicios/${id}`, servicioData);
      
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
  
  // Obtener servicios por categoría
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
  
  // Validar disponibilidad de nombre de servicio en una categoría
  async checkNombreDisponible(nombre, categoriaId, excludeId = null) {
    try {
      console.log('🔍 Verificando disponibilidad de nombre:', nombre, 'en categoría:', categoriaId);
      
      const params = {
        search: nombre,
        categoria_id: categoriaId,
        estado: 'activo',
        limit: 1
      };
      
      const result = await this.getServicios(params);
      
      if (result.success) {
        let isAvailable = true;
        
        if (result.servicios.length > 0) {
          // Si hay un ID a excluir (para edición), verificar que no sea el mismo
          if (excludeId) {
            isAvailable = result.servicios[0].servicios_id === parseInt(excludeId);
          } else {
            isAvailable = false;
          }
        }
        
        console.log(`Nombre "${nombre}" está ${isAvailable ? 'disponible' : 'ocupado'} en la categoría`);
        
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
  
  // Helper para formatear datos de servicio para mostrar
  formatServicioDisplay(servicio) {
    if (!servicio) return null;
    
    const estados = this.getEstados();
    const estado = estados.find(e => e.value === servicio.estado);
    
    return {
      ...servicio,
      estado_label: estado?.label || servicio.estado,
      estado_color: estado?.color || 'secondary',
      iniciales: this.generateInitials(servicio.nombre),
      fecha_creacion: this.formatDate(servicio.created_at),
      fecha_actualizacion: this.formatDate(servicio.updated_at),
      categoria_nombre: servicio.categoria?.nombre || 'Sin categoría',
      precio_minimo_formatted: this.formatPrice(servicio.precio_minimo),
      precio_recomendado_formatted: this.formatPrice(servicio.precio_recomendado),
      descripcion_corta: this.truncateText(servicio.descripcion, 100),
      rango_precio: this.getPriceRange(servicio.precio_recomendado)
    };
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
  
  // Helper para formatear precios
  formatPrice(price) {
    if (!price) return 'L. 0.00';
    
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(price);
  }
  
  // Helper para obtener rango de precio
  getPriceRange(price) {
    if (!price) return 'unknown';
    
    if (price < 1000) return 'barato';
    if (price <= 5000) return 'medio';
    return 'caro';
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
  
  // Helper para obtener servicios formateados para selects
  formatServiciosForSelect(servicios) {
    return servicios.map(servicio => ({
      value: servicio.servicios_id,
      label: servicio.nombre,
      description: servicio.descripcion,
      categoria: servicio.categoria?.nombre,
      precio_minimo: servicio.precio_minimo,
      precio_recomendado: servicio.precio_recomendado,
      precio_formatted: this.formatPrice(servicio.precio_recomendado)
    }));
  }
  
  // Helper para filtrar servicios por texto
  filterServiciosByText(servicios, searchText) {
    if (!searchText || searchText.trim().length === 0) {
      return servicios;
    }
    
    const search = searchText.toLowerCase().trim();
    
    return servicios.filter(servicio => 
      servicio.nombre.toLowerCase().includes(search) ||
      (servicio.descripcion && servicio.descripcion.toLowerCase().includes(search)) ||
      (servicio.categoria && servicio.categoria.nombre.toLowerCase().includes(search))
    );
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
  
  // Helper para obtener estadísticas básicas de una lista de servicios
  getStatsFromList(servicios) {
    const total = servicios.length;
    const activos = servicios.filter(s => s.estado === 'activo').length;
    const inactivos = total - activos;
    
    let sumaPrecios = 0;
    let precioMin = Infinity;
    let precioMax = 0;
    
    servicios.forEach(servicio => {
      if (servicio.estado === 'activo' && servicio.precio_recomendado) {
        const precio = parseFloat(servicio.precio_recomendado);
        sumaPrecios += precio;
        precioMin = Math.min(precioMin, precio);
        precioMax = Math.max(precioMax, precio);
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
      porcentaje_activos: total > 0 ? Math.round((activos / total) * 100) : 0
    };
  }
}

// Exportar instancia única
export default new ServiciosService();