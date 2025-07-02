// clientes.js
import api from './api';
import categoriasService from './categoriasService';

class ClientesService {
  constructor() {
    // Cache para categorías
    this._categoriasCache = null;
    this._categoriasCacheTime = null;
    this._categoriasMap = new Map();
  }

  // ✅ NUEVA FUNCIÓN: Obtener y cachear categorías activas
  async getCategoriasActivas() {
    try {
      // Cache por 5 minutos
      const cacheExpiry = 5 * 60 * 1000;
      const now = Date.now();
      
      if (this._categoriasCache && this._categoriasCacheTime && 
          (now - this._categoriasCacheTime) < cacheExpiry) {
        console.log('✅ Usando categorías desde cache');
        return this._categoriasCache;
      }
      
      console.log('🔄 Obteniendo categorías desde API...');
      const result = await categoriasService.getCategoriasActivas();
      
      if (result.success) {
        this._categoriasCache = result.categorias;
        this._categoriasCacheTime = now;
        
        // Crear mapa para búsqueda rápida por nombre
        this._categoriasMap.clear();
        result.categorias.forEach(cat => {
          this._categoriasMap.set(cat.nombre.toLowerCase(), cat.categorias_id);
        });
        
        console.log('✅ Categorías cacheadas:', result.categorias.length);
        return result.categorias;
      }
      
      console.warn('⚠️ Error obteniendo categorías, usando fallback');
      return this._getFallbackCategorias();
      
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return this._getFallbackCategorias();
    }
  }

  // ✅ NUEVA FUNCIÓN: Categorías fallback si falla la API
  _getFallbackCategorias() {
    return [
      { categorias_id: 1, nombre: 'hosting' },
      { categorias_id: 2, nombre: 'backup' },
      { categorias_id: 3, nombre: 'security' },
      { categorias_id: 4, nombre: 'database' },
      { categorias_id: 5, nombre: 'cdn' }
    ];
  }

  // ✅ NUEVA FUNCIÓN: Mapear nombre de categoria a ID dinámicamente
  async getCategoriaIdByNombre(nombreCategoria) {
    try {
      // Asegurar que tenemos las categorías cargadas
      await this.getCategoriasActivas();
      
      const nombre = nombreCategoria.toLowerCase().trim();
      
      // Buscar en el mapa
      let categoriaId = this._categoriasMap.get(nombre);
      
      // Si no se encuentra exacta, buscar por coincidencia parcial
      if (!categoriaId) {
        for (const [catNombre, catId] of this._categoriasMap.entries()) {
          if (catNombre.includes(nombre) || nombre.includes(catNombre)) {
            categoriaId = catId;
            break;
          }
        }
      }
      
      // Fallback a primera categoría si no se encuentra
      if (!categoriaId && this._categoriasCache && this._categoriasCache.length > 0) {
        categoriaId = this._categoriasCache[0].categorias_id;
      }
      
      console.log(`🔧 Categoria mapeada: "${nombreCategoria}" → ID ${categoriaId}`);
      return categoriaId || 1;
      
    } catch (error) {
      console.error('❌ Error mapeando categoria:', error);
      return 1; // hosting por defecto
    }
  }

  // ✅ FUNCIÓN CORREGIDA: Formatear servicios para envío al backend
  async formatServiciosParaPDF(servicios) {
    console.log('🔧 INICIO formatServiciosParaPDF - Recibido:', servicios);
    
    // Convertir Proxy a array normal
    const serviciosArray = Array.from(servicios || []);
    
    if (serviciosArray.length === 0) {
      console.warn('⚠️ servicios está vacío');
      return [];
    }

    // Procesar servicios uno por uno (async)
    const serviciosFormateados = [];
    
    for (let i = 0; i < serviciosArray.length; i++) {
      const item = serviciosArray[i];
      console.log(`🔧 Formateando servicio ${i}:`, item);
      
      const servicio = item.servicio || item;
      let categoriaFormateada = null;
      
      // ✅ FORMATEAR CATEGORIA DINÁMICAMENTE
      if (servicio.categoria) {
        if (typeof servicio.categoria === 'object' && servicio.categoria !== null && servicio.categoria.categorias_id) {
          // Ya es objeto válido
          categoriaFormateada = {
            categorias_id: servicio.categoria.categorias_id,
            nombre: servicio.categoria.nombre
          };
          console.log(`✅ Categoria ya es objeto: ${categoriaFormateada.nombre}`);
        } else if (typeof servicio.categoria === 'string') {
          // Es string - mapear dinámicamente
          const categoriaId = await this.getCategoriaIdByNombre(servicio.categoria);
          categoriaFormateada = {
            categorias_id: categoriaId,
            nombre: servicio.categoria
          };
          console.log(`🔧 Categoria string convertida: "${servicio.categoria}" → ID ${categoriaId}`);
        }
      }
      
      // ✅ FALLBACK si no hay categoria válida
      if (!categoriaFormateada) {
        const categorias = await this.getCategoriasActivas();
        const primerCategoria = categorias[0] || { categorias_id: 1, nombre: 'hosting' };
        
        categoriaFormateada = {
          categorias_id: primerCategoria.categorias_id,
          nombre: primerCategoria.nombre
        };
        console.log(`⚠️ Usando categoria fallback: ${categoriaFormateada.nombre}`);
      }

      const servicioFormateado = {
        ...item,
        servicio: {
          servicios_id: servicio.servicios_id || servicio.id,
          nombre: servicio.nombre,
          precio_venta: servicio.precio_venta || servicio.precioVenta,
          precio_minimo: servicio.precio_minimo || servicio.precioMinimo,
          categoria: categoriaFormateada, // ✅ SIEMPRE objeto válido
          descripcion: servicio.descripcion,
          estado: servicio.estado || 'activo'
        },
        cantidadServidores: item.cantidadServidores || 0,
        cantidadEquipos: item.cantidadEquipos || 0,
        precioVentaFinal: item.precioVentaFinal || 0
      };

      console.log(`✅ Servicio ${i} categoria final:`, servicioFormateado.servicio.categoria);
      serviciosFormateados.push(servicioFormateado);
    }
    
    return serviciosFormateados;
  }

  // ✅ FUNCIÓN PRINCIPAL: Formatear datos completos para PDF
  async formatDataParaPDF(datosOriginales) {
    console.log('🔧 Formateando datos para PDF:', datosOriginales);
    
    const datosFormateados = {
      ...datosOriginales,
      servicios: await this.formatServiciosParaPDF(datosOriginales.servicios || [])
    };

    console.log('✅ Datos formateados para PDF:', datosFormateados);
    console.log('✅ Ejemplo categoria formateada:', datosFormateados.servicios[0]?.servicio?.categoria);
    
    return datosFormateados;
  }
  
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
  
  // Buscar clientes (método helper para autocompletado ADMIN)
  async searchClientes(searchTerm) {
    try {
      console.log('🔍 Buscando clientes (admin):', searchTerm);
      
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

  // ✅ NUEVO: Buscar clientes para modales (CON filtros de usuario)
  async searchClientesModal(searchTerm) {
    try {
      console.log('🔍 Buscando clientes para modal:', searchTerm);
      
      const response = await api.get('/clientes/modal/search', {
        params: {
          q: searchTerm,
          limit: 10
        }
      });
      
      if (response.data.success) {
        console.log('✅ Clientes encontrados para modal:', response.data.data.clientes);
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
      console.error('❌ Error buscando clientes para modal:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  }

  // ✅ CORREGIDO: Obtener clientes recientes usando el endpoint correcto
  async getClientesRecientes(limit = 5) {
    try {
      console.log('📋 Obteniendo clientes recientes para modal...');
      
      // ✅ USAR EL ENDPOINT CORRECTO que aplica filtros de usuario
      const response = await api.get('/clientes/modal/search', {
        params: {
          q: '',  // Término vacío = obtener todos los del usuario actual
          limit: limit
        }
      });
      
      if (response.data.success) {
        console.log('✅ Clientes recientes obtenidos:', response.data.data.clientes);
        console.log('🔍 DEBUG - usuarios_id de cada cliente:', response.data.data.clientes.map(c => ({
          empresa: c.nombre_empresa,
          usuarios_id: c.usuarios_id
        })));
        return {
          success: true,
          clientes: response.data.data.clientes
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error obteniendo clientes'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo clientes recientes:', error);
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
  
  // ✅ CORREGIDO: Helper para formatear datos de cliente para mostrar
  formatClienteDisplay(cliente) {
    if (!cliente) return null;
    
    // ✅ CORREGIDO: Crear funciones locales en lugar de usar this
    const generateInitials = (nombreCompleto) => {
      if (!nombreCompleto) return 'C';
      const nombres = nombreCompleto.trim().split(' ');
      if (nombres.length >= 2) {
        return (nombres[0][0] + nombres[1][0]).toUpperCase();
      } else {
        return nombres[0].substring(0, 2).toUpperCase();
      }
    };
    
    const generateInitialsEmpresa = (nombreEmpresa) => {
      if (!nombreEmpresa) return 'E';
      const palabras = nombreEmpresa.trim().split(' ');
      if (palabras.length >= 2) {
        return (palabras[0][0] + palabras[1][0]).toUpperCase();
      } else {
        return palabras[0].substring(0, 2).toUpperCase();
      }
    };
    
    const formatDate = (dateString) => {
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
    };

    const estados = [
      { value: 'activo', label: 'Activo', color: 'success' },
      { value: 'inactivo', label: 'Inactivo', color: 'danger' }
    ];
    
    const estado = estados.find(e => e.value === cliente.estado);
    
    return {
      ...cliente,
      estado_label: estado?.label || cliente.estado,
      estado_color: estado?.color || 'secondary',
      iniciales_encargado: generateInitials(cliente.nombre_encargado),
      iniciales_empresa: generateInitialsEmpresa(cliente.nombre_empresa),
      fecha_creacion: formatDate(cliente.created_at),
      fecha_actualizacion: formatDate(cliente.updated_at),
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

  // ✅ NUEVO: Helper para formatear precios/moneda
  formatPrice(precio) {
    if (!precio && precio !== 0) return 'L. 0.00';
    
    // Convertir a número si es string
    const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
    
    if (isNaN(numero)) return 'L. 0.00';
    
    // Formatear con separadores de miles y 2 decimales
    return `L. ${numero.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // ✅ NUEVO: Alias para formatPrice
  formatCurrency(precio) {
    return this.formatPrice(precio);
  }


  // ✅ NUEVO: Obtener TODOS los clientes para administración
async getClientesAdmin(params = {}) {
  try {
    console.log('📋 Obteniendo TODOS los clientes (admin) con parámetros:', params);
    
    const response = await api.get('/clientes/admin/todos', { params });
    
    if (response.data.success) {
      console.log('✅ Clientes admin obtenidos:', response.data.data);
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
    console.error('❌ Error obteniendo clientes admin:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión'
    };
  }
}

// ✅ NUEVO: Crear cliente desde administración
async createClienteAdmin(clienteData) {
  try {
    console.log('➕ Creando cliente (admin):', clienteData);
    
    const response = await api.post('/clientes/admin/crear', clienteData);
    
    if (response.data.success) {
      console.log('✅ Cliente creado exitosamente (admin):', response.data.data.cliente);
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
    console.error('❌ Error creando cliente (admin):', error);
    
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


}

// Exportar instancia única
export default new ClientesService();