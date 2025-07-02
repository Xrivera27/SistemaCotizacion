// services/usuarios.js
import api from './api';

class UsuariosService {
  
  // Obtener todos los usuarios con paginación y filtros
  async getUsuarios(params = {}) {
    try {
      console.log('📋 Obteniendo usuarios con parámetros:', params);
      
      const response = await api.get('/usuarios', { params });
      
      if (response.data.success) {
        console.log('✅ Usuarios obtenidos:', response.data.data);
        return {
          success: true,
          usuarios: response.data.data.usuarios,
          pagination: response.data.data.pagination
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo usuarios'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener usuario por ID
  async getUsuarioById(id) {
    try {
      console.log('👤 Obteniendo usuario ID:', id);
      
      const response = await api.get(`/usuarios/${id}`);
      
      if (response.data.success) {
        console.log('✅ Usuario obtenido:', response.data.data.usuario);
        return {
          success: true,
          usuario: response.data.data.usuario
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Usuario no encontrado'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Crear nuevo usuario
  async createUsuario(usuarioData) {
    try {
      console.log('➕ Creando usuario:', { ...usuarioData, password: '[OCULTO]' });
      
      const response = await api.post('/usuarios', usuarioData);
      
      if (response.data.success) {
        console.log('✅ Usuario creado exitosamente:', response.data.data.usuario);
        return {
          success: true,
          usuario: response.data.data.usuario,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error creando usuario'
      };
      
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      
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
  
  // Actualizar usuario
  async updateUsuario(id, usuarioData) {
    try {
      console.log('✏️ Actualizando usuario ID:', id, 'con datos:', { ...usuarioData, password: usuarioData.password ? '[OCULTO]' : undefined });
      
      const response = await api.put(`/usuarios/${id}`, usuarioData);
      
      if (response.data.success) {
        console.log('✅ Usuario actualizado exitosamente:', response.data.data.usuario);
        return {
          success: true,
          usuario: response.data.data.usuario,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error actualizando usuario'
      };
      
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      
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
  
  // Eliminar usuario (soft delete)
  async deleteUsuario(id) {
    try {
      console.log('🗑️ Eliminando usuario ID:', id);
      
      const response = await api.delete(`/usuarios/${id}`);
      
      if (response.data.success) {
        console.log('✅ Usuario eliminado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error eliminando usuario'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Restaurar usuario
  async restoreUsuario(id) {
    try {
      console.log('🔄 Restaurando usuario ID:', id);
      
      const response = await api.patch(`/usuarios/${id}/restore`);
      
      if (response.data.success) {
        console.log('✅ Usuario restaurado exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error restaurando usuario'
      };
      
    } catch (error) {
      console.error('❌ Error restaurando usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Cambiar contraseña
  async changePassword(id, passwordData) {
    try {
      console.log('🔐 Cambiando contraseña para usuario ID:', id);
      
      const response = await api.patch(`/usuarios/${id}/change-password`, passwordData);
      
      if (response.data.success) {
        console.log('✅ Contraseña cambiada exitosamente');
        return {
          success: true,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error cambiando contraseña'
      };
      
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }
  
  // Obtener estadísticas de usuarios
  async getEstadisticas() {
    try {
      console.log('📊 Obteniendo estadísticas de usuarios...');
      
      const response = await api.get('/usuarios/estadisticas');
      
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
  
  // Buscar usuarios (método helper para autocompletado)
  async searchUsuarios(searchTerm) {
    try {
      const params = {
        search: searchTerm,
        limit: 10,
        page: 1
      };
      
      const result = await this.getUsuarios(params);
      
      if (result.success) {
        return {
          success: true,
          usuarios: result.usuarios
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error buscando usuarios:', error);
      return {
        success: false,
        message: 'Error en la búsqueda'
      };
    }
  }
  
  // Validar disponibilidad de usuario/email
  async checkAvailability(field, value) {
    try {
      console.log(`🔍 Verificando disponibilidad de ${field}:`, value);
      
      const params = {};
      params[field] = value;
      params.limit = 1;
      
      const result = await this.getUsuarios(params);
      
      if (result.success) {
        const isAvailable = result.usuarios.length === 0;
        console.log(`${field} ${value} está ${isAvailable ? 'disponible' : 'ocupado'}`);
        
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
  
  // Obtener tipos de usuario disponibles
  getTiposUsuario() {
    return [
      { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
      { value: 'vendedor', label: 'Vendedor', description: 'Gestión de cotizaciones y clientes' },
      { value: 'super_usuario', label: 'SuperUsuario', description: 'Supervisión y reportes' }
    ];
  }
  
  // Obtener estados disponibles
  getEstados() {
    return [
      { value: 'activo', label: 'Activo', color: 'success' },
      { value: 'inactivo', label: 'Inactivo', color: 'danger' }
    ];
  }
  
  // Helper para formatear datos de usuario para mostrar
  formatUsuarioDisplay(usuario) {
    if (!usuario) return null;
    
    const tiposUsuario = this.getTiposUsuario();
    const estados = this.getEstados();
    
    const tipoUsuario = tiposUsuario.find(t => t.value === usuario.tipo_usuario);
    const estado = estados.find(e => e.value === usuario.estado);
    
    return {
      ...usuario,
      tipo_usuario_label: tipoUsuario?.label || usuario.tipo_usuario,
      tipo_usuario_description: tipoUsuario?.description || '',
      estado_label: estado?.label || usuario.estado,
      estado_color: estado?.color || 'secondary',
      iniciales: this.generateInitials(usuario.nombre_completo),
      fecha_creacion: this.formatDate(usuario.created_at),
      fecha_actualizacion: this.formatDate(usuario.updated_at)
    };
  }
  
  // Helper para generar iniciales
  generateInitials(nombreCompleto) {
    if (!nombreCompleto) return 'U';
    
    const nombres = nombreCompleto.trim().split(' ');
    
    if (nombres.length >= 2) {
      return (nombres[0][0] + nombres[1][0]).toUpperCase();
    } else {
      return nombres[0].substring(0, 2).toUpperCase();
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

  // Obtener usuarios disponibles para ser managers
async getUsuariosParaManager() {
  try {
    console.log('👥 Obteniendo usuarios disponibles para manager...');
    
    const response = await api.get('/usuarios/managers/disponibles');
    
    if (response.data.success) {
      console.log('✅ Usuarios para manager obtenidos:', response.data.data.usuarios);
      return {
        success: true,
        usuarios: response.data.data.usuarios
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error obteniendo usuarios'
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios para manager:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión'
    };
  }
}


}

// Exportar instancia única
export default new UsuariosService();