import api from './api';

class ClientesService {
  
  // Obtener todos los clientes con paginación y filtros
  async getClientes(params = {}) {
    try {
      console.log('📋 Obteniendo clientes con parámetros:', params);
      
      const response = await api.get('/clientes', { params });
      
      if (response.data.success) {
        console.log('✅ Clientes obtenidos:', response.data.data);
        return {
          success: true,
          clientes: response.data.data.clientes,
          pagination: response.data.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo clientes'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener cliente por ID
  async getClienteById(id) {
    try {
      console.log('👤 Obteniendo cliente ID:', id);
      
      const response = await api.get(`/clientes/${id}`);
      
      if (response.data.success) {
        console.log('✅ Cliente obtenido:', response.data.data.cliente);
        return {
          success: true,
          cliente: response.data.data.cliente
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Cliente no encontrado'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo cliente:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Crear nuevo cliente
  async createCliente(clienteData) {
    try {
      console.log('➕ Creando cliente:', clienteData);
      
      const response = await api.post('/clientes', clienteData);
      
      if (response.data.success) {
        console.log('✅ Cliente creado exitosamente:', response.data.data.cliente);
        return {
          success: true,
          cliente: response.data.data.cliente,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error creando cliente'
      };
      
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      
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
  
  // Actualizar cliente
  async updateCliente(id, clienteData) {
    try {
      console.log('✏️ Actualizando cliente ID:', id, 'con datos:', clienteData);
      
      const response = await api.put(`/clientes/${id}`, clienteData);
      
      if (response.data.success) {
        console.log('✅ Cliente actualizado exitosamente:', response.data.data.cliente);
        return {
          success: true,
          cliente: response.data.data.cliente,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error actualizando cliente'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      
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
  
  // Eliminar cliente (soft delete)
  async deleteCliente(id) {
    try {
      console.log('🗑️ Eliminando cliente ID:', id);
      
      const response = await api.delete(`/clientes/${id}`);
      
      if (response.data.success) {
        console.log('✅ Cliente eliminado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error eliminando cliente'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Restaurar cliente
  async restoreCliente(id) {
    try {
      console.log('🔄 Restaurando cliente ID:', id);
      
      const response = await api.patch(`/clientes/${id}/restore`);
      
      if (response.data.success) {
        console.log('✅ Cliente restaurado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error restaurando cliente'
      };
      
    } catch (error) {
      console.error('❌ Error restaurando cliente:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener estadísticas de clientes
  async getEstadisticas() {
    try {
      console.log('📊 Obteniendo estadísticas de clientes...');
      
      const response = await api.get('/clientes/admin/estadisticas');
      
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
  
  // Buscar clientes (método helper para autocompletado)
  async searchClientes(searchTerm) {
    try {
      console.log('🔍 Buscando clientes:', searchTerm);
      
      const response = await api.get('/clientes/search', {
        params: {
          q: searchTerm,
          limit: 10
        }
      });
      
      if (response.data.success) {
        console.log('✅ Clientes encontrados:', response.data.data.clientes);
        return {
          success: true,
          clientes: response.data.data.clientes
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en la búsqueda'
      };
      
    } catch (error) {
      console.error('❌ Error buscando clientes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Validar disponibilidad de documento fiscal
  async checkDocumentoDisponible(documento_fiscal, excludeId = null) {
    try {
      console.log('🔍 Verificando disponibilidad de documento:', documento_fiscal);
      
      const params = {
        search: documento_fiscal,
        limit: 1
      };
      
      const result = await this.getClientes(params);
      
      if (result.success) {
        let isAvailable = true;
        
        if (result.clientes.length > 0) {
          // Si hay un ID a excluir (para edición), verificar que no sea el mismo
          if (excludeId) {
            isAvailable = result.clientes[0].clientes_id === parseInt(excludeId);
          } else {
            isAvailable = false;
          }
        }
        
        console.log(`Documento ${documento_fiscal} está ${isAvailable ? 'disponible' : 'ocupado'}`);
        
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
  
  // Helper para formatear datos de cliente para mostrar
  formatClienteDisplay(cliente) {
    if (!cliente) return null;
    
    const estados = this.getEstados();
    const estado = estados.find(e => e.value === cliente.estado);
    
    return {
      ...cliente,
      estado_label: estado?.label || cliente.estado,
      estado_color: estado?.color || 'secondary',
      iniciales_encargado: this.generateInitials(cliente.nombre_encargado),
      iniciales_empresa: this.generateInitialsEmpresa(cliente.nombre_empresa),
      fecha_creacion: this.formatDate(cliente.created_at),
      fecha_actualizacion: this.formatDate(cliente.updated_at),
      manager_nombre: cliente.manager?.nombre_completo || 'Sin asignar',
      telefono_principal: cliente.telefono_empresa || cliente.telefono_personal || 'No registrado',
      correo_principal: cliente.correo_empresa || cliente.correo_personal || 'No registrado'
    };
  }
  
  // Helper para generar iniciales del encargado
  generateInitials(nombreCompleto) {
    if (!nombreCompleto) return 'C';
    
    const nombres = nombreCompleto.trim().split(' ');
    
    if (nombres.length >= 2) {
      return (nombres[0][0] + nombres[1][0]).toUpperCase();
    } else {
      return nombres[0].substring(0, 2).toUpperCase();
    }
  }
  
  // Helper para generar iniciales de la empresa
  generateInitialsEmpresa(nombreEmpresa) {
    if (!nombreEmpresa) return 'E';
    
    const palabras = nombreEmpresa.trim().split(' ');
    
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
  
  // Helper para formatear teléfonos
  formatTelefono(telefono) {
    if (!telefono) return '';
    
    // Formato básico para Honduras: +504 0000-0000
    const cleaned = telefono.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('504')) {
      return `+504 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return telefono;
  }
  
  // Helper para validar documento fiscal (RTN Honduras)
  validateRTN(rtn) {
    if (!rtn) return false;
    
    // RTN de Honduras: 14 dígitos (DDMMAAAANNNNNC)
    const cleaned = rtn.replace(/\D/g, '');
    
    if (cleaned.length !== 14) {
      return false;
    }
    
    // Verificar que empiece con fecha válida
    const dia = parseInt(cleaned.slice(0, 2));
    const mes = parseInt(cleaned.slice(2, 4));
    const año = parseInt(cleaned.slice(4, 8));
    
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || año < 1900) {
      return false;
    }
    
    return true;
  }
  
  // Helper para formatear RTN
  formatRTN(rtn) {
    if (!rtn) return '';
    
    const cleaned = rtn.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    
    return rtn;
  }
}

// Exportar instancia única
export default new ClientesService();