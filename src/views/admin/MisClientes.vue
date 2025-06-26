<template>
<div class="admin-clientes-container">
  <!-- Loading overlay -->
  <div v-if="loading" class="loading-overlay">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <span>{{ loadingMessage }}</span>
    </div>
  </div>

  <!-- Header de la página -->
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">Gestión de Clientes</h1>
      <p class="page-subtitle">Administración y control de todos los clientes del sistema</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" @click="nuevoCliente">
        <i class="fas fa-plus btn-icon"></i>
        Nuevo Cliente
      </button>
      <button class="btn btn-secondary" @click="cargarClientes">
        <i class="fas fa-sync-alt btn-icon"></i>
        Actualizar
      </button>
    </div>
  </div>

  <!-- Filtros y búsqueda -->
  <div class="filtros-section">
    <div class="filtros-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="filtros.busqueda"
          type="text"
          placeholder="Buscar por empresa, encargado, RTN, teléfono..."
          class="search-input"
          @input="buscarClientes"
        />
      </div>
      
      <div class="filtros-grid">
        <select v-model="filtros.estado" class="filter-select" @change="aplicarFiltros">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        
        <select v-model="itemsPorPagina" class="filter-select" @change="cambiarItemsPorPagina">
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
        
        <button class="btn btn-secondary" @click="limpiarFiltros">
          Limpiar Filtros
        </button>
      </div>
    </div>
  </div>

  <!-- Estadísticas rápidas -->
  <div class="estadisticas-grid">
    <div class="stat-card total">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.total }}</div>
        <div class="stat-label">Total Clientes</div>
      </div>
    </div>
    
    <div class="stat-card activos">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.activos }}</div>
        <div class="stat-label">Clientes Activos</div>
      </div>
    </div>
    
    <div class="stat-card inactivos">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.inactivos }}</div>
        <div class="stat-label">Clientes Inactivos</div>
      </div>
    </div>
  </div>

  <!-- Clientes section -->
  <div class="clientes-section">
    <div class="section-header">
      <h2 class="section-title">
        {{ pagination ? pagination.totalItems : clientes.length }} Clientes encontrados
      </h2>
      <div class="view-controls">
        <button 
          class="view-btn"
          :class="{ active: vistaActual === 'tabla' }"
          @click="vistaActual = 'tabla'"
        >
          <i class="fas fa-table"></i> Tabla
        </button>
        <button 
          class="view-btn"
          :class="{ active: vistaActual === 'tarjetas' }"
          @click="vistaActual = 'tarjetas'"
        >
          <i class="fas fa-th-large"></i> Tarjetas
        </button>
      </div>
    </div>

    <!-- Información de paginación superior -->
    <div v-if="pagination" class="paginacion-info">
      <span class="items-info">
        Mostrando {{ pagination.totalItems > 0 ? ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) : 0 }} - 
        {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} 
        de {{ pagination.totalItems }} clientes
      </span>
      <div class="pagination-jump" v-if="pagination.totalPages > 1">
        <label for="jump-page">Ir a página:</label>
        <input 
          id="jump-page"
          type="number" 
          v-model.number="paginaSalto" 
          @keyup.enter="irAPagina"
          :min="1" 
          :max="pagination.totalPages"
          class="page-input"
        >
        <button class="btn btn-sm btn-outline" @click="irAPagina">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Vista de tabla -->
    <div v-if="vistaActual === 'tabla'" class="tabla-container">
      <div class="tabla-wrapper">
        <table class="clientes-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Encargado</th>
              <th>RTN</th>
              <th>Teléfonos</th>
              <th>Manager</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.clientes_id">
              <td>
                <span class="cliente-id">#{{ String(cliente.clientes_id).padStart(4, '0') }}</span>
              </td>
              <td>
                <div class="empresa-info">
                  <span class="empresa-nombre">{{ cliente.nombre_empresa }}</span>
                  <span class="empresa-correo" v-if="cliente.correo_empresa">{{ cliente.correo_empresa }}</span>
                </div>
              </td>
              <td>
                <div class="encargado-info">
                  <span class="encargado-nombre">{{ cliente.nombre_encargado }}</span>
                  <span class="encargado-correo">{{ cliente.correo_personal }}</span>
                </div>
              </td>
              <td>
                <span class="rtn">{{ cliente.documento_fiscal }}</span>
              </td>
              <td>
                <div class="telefonos-info">
                  <div class="telefono-item" v-if="cliente.telefono_personal">
                    <i class="fas fa-mobile-alt"></i>
                    <span>{{ cliente.telefono_personal }}</span>
                  </div>
                  <div class="telefono-item" v-if="cliente.telefono_empresa">
                    <i class="fas fa-phone"></i>
                    <span>{{ cliente.telefono_empresa }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="vendedor-asignado">{{ cliente.manager?.nombre_completo || 'Sin asignar' }}</span>
              </td>
              <td>
                <span class="estado-badge" :class="cliente.estado">
                  {{ getEstadoTexto(cliente.estado) }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button 
                    class="btn-accion ver"
                    @click="verCliente(cliente)"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-accion editar"
                    @click="editarCliente(cliente)"
                    title="Editar cliente"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-accion" 
                    :class="cliente.estado === 'activo' ? 'deshabilitar' : 'habilitar'"
                    @click="mostrarModalCambiarEstado(cliente)"
                    :title="cliente.estado === 'activo' ? 'Desactivar cliente' : 'Activar cliente'"
                  >
                    <i :class="cliente.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista de tarjetas -->
    <div v-if="vistaActual === 'tarjetas'" class="tarjetas-container">
      <div class="tarjetas-grid">
        <div 
          v-for="cliente in clientes" 
          :key="cliente.clientes_id"
          class="cliente-card"
        >
          <div class="card-header">
            <div class="card-numero">#{{ String(cliente.clientes_id).padStart(4, '0') }}</div>
            <span class="estado-badge" :class="cliente.estado">
              {{ getEstadoTexto(cliente.estado) }}
            </span>
          </div>
          
          <div class="card-content">
            <h3 class="empresa-nombre-card">
              <i class="fas fa-building"></i>
              {{ cliente.nombre_empresa }}
            </h3>
            <p class="encargado-nombre-card">
              <i class="fas fa-user"></i>
              {{ cliente.nombre_encargado }}
            </p>
            
            <div class="cliente-details">
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-id-card"></i>
                  RTN:
                </span>
                <span class="detail-value rtn-card">{{ cliente.documento_fiscal }}</span>
              </div>
              
              <div class="detail" v-if="cliente.telefono_personal">
                <span class="detail-label">
                  <i class="fas fa-mobile-alt"></i>
                  Tel. Personal:
                </span>
                <span class="detail-value">{{ cliente.telefono_personal }}</span>
              </div>
              
              <div class="detail" v-if="cliente.telefono_empresa">
                <span class="detail-label">
                  <i class="fas fa-phone"></i>
                  Tel. Empresa:
                </span>
                <span class="detail-value">{{ cliente.telefono_empresa }}</span>
              </div>
              
              <div class="detail" v-if="cliente.correo_personal">
                <span class="detail-label">
                  <i class="fas fa-envelope"></i>
                  Email Personal:
                </span>
                <span class="detail-value email-card">{{ cliente.correo_personal }}</span>
              </div>
              
              <div class="detail" v-if="cliente.correo_empresa">
                <span class="detail-label">
                  <i class="fas fa-briefcase"></i>
                  Email Empresa:
                </span>
                <span class="detail-value email-card">{{ cliente.correo_empresa }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-user-tie"></i>
                  Manager:
                </span>
                <span class="detail-value vendedor-card">{{ cliente.manager?.nombre_completo || 'Sin asignar' }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-calendar-alt"></i>
                  Registro:
                </span>
                <span class="detail-value">{{ formatearFecha(cliente.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-actions">
            <button class="btn btn-sm btn-outline" @click="verCliente(cliente)">
              <i class="fas fa-eye"></i>
              Ver Detalles
            </button>
            <button class="btn btn-sm btn-primary" @click="editarCliente(cliente)">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button 
              class="btn btn-sm"
              :class="cliente.estado === 'activo' ? 'btn-danger' : 'btn-success'"
              @click="mostrarModalCambiarEstado(cliente)"
            >
              <i :class="cliente.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
              {{ cliente.estado === 'activo' ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay clientes -->
    <div v-if="clientes.length === 0 && !loading" class="empty-state">
      <div class="empty-icon"><i class="fas fa-building"></i></div>
      <h3 class="empty-title">No hay clientes</h3>
      <p class="empty-description">
        {{ filtros.busqueda || filtros.estado 
          ? 'No se encontraron clientes con los filtros aplicados.' 
          : 'Aún no se han registrado clientes en el sistema.' }}
      </p>
      <button class="btn btn-primary" @click="nuevoCliente">
        <i class="fas fa-plus"></i>
        Crear Primer Cliente
      </button>
    </div>

    <!-- Paginación -->
    <div v-if="pagination && pagination.totalPages > 1" class="paginacion-completa">
      <div class="paginacion">
        <button 
          class="btn-pag"
          @click="irAPrimera"
          :disabled="pagination.currentPage === 1"
          title="Primera página"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>

        <button 
          class="btn-pag"
          @click="paginaAnterior"
          :disabled="!pagination.hasPrevPage"
          title="Página anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="paginas">
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            class="btn-pag"
            :class="{ active: pagina === pagination.currentPage }"
            @click="irAPagina(pagina)"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          class="btn-pag"
          @click="paginaSiguiente"
          :disabled="!pagination.hasNextPage"
          title="Página siguiente"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <button 
          class="btn-pag"
          @click="irAUltima"
          :disabled="pagination.currentPage === pagination.totalPages"
          title="Última página"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <div class="paginacion-info-bottom">
        <span class="pagina-actual">
          Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
        </span>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa -->
  <div v-if="modalCliente" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Cliente #{{ String(modalCliente.clientes_id).padStart(4, '0') }} - {{ modalCliente.nombre_empresa }}</h3>
        <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="cliente-detalle">
          <div class="detalle-grid">
            <div class="detalle-item">
              <strong><i class="fas fa-building"></i> Empresa:</strong> {{ modalCliente.nombre_empresa }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-id-card"></i> RTN:</strong> {{ modalCliente.documento_fiscal }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-user"></i> Encargado:</strong> {{ modalCliente.nombre_encargado }}
            </div>
            <div class="detalle-item" v-if="modalCliente.telefono_personal">
              <strong><i class="fas fa-mobile-alt"></i> Teléfono Personal:</strong> {{ modalCliente.telefono_personal }}
            </div>
            <div class="detalle-item" v-if="modalCliente.telefono_empresa">
              <strong><i class="fas fa-phone"></i> Teléfono Empresa:</strong> {{ modalCliente.telefono_empresa }}
            </div>
            <div class="detalle-item" v-if="modalCliente.correo_personal">
              <strong><i class="fas fa-envelope"></i> Correo Personal:</strong> {{ modalCliente.correo_personal }}
            </div>
            <div class="detalle-item" v-if="modalCliente.correo_empresa">
              <strong><i class="fas fa-briefcase"></i> Correo Empresa:</strong> {{ modalCliente.correo_empresa }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-user-tie"></i> Manager:</strong> {{ modalCliente.manager?.nombre_completo || 'Sin asignar' }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-calendar-alt"></i> Fecha de Registro:</strong> {{ formatearFecha(modalCliente.created_at) }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
              <span class="estado-badge" :class="modalCliente.estado">
                {{ getEstadoTexto(modalCliente.estado) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
        <button class="btn btn-primary" @click="editarCliente(modalCliente)">
           Editar Cliente
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de formulario -->
  <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
    <div class="modal-content modal-formulario" @click.stop>
      <div class="modal-header">
        <h3>{{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
        <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="guardarCliente" class="formulario-cliente">
          <div class="form-sections">
            <!-- Información de la Empresa -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-building"></i>
                Información de la Empresa
              </h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="nombre_empresa">Nombre de la Empresa *</label>
                  <input 
                    id="nombre_empresa"
                    v-model="formulario.nombre_empresa" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Empresa S.A. de C.V."
                  >
                </div>
                
                <div class="form-group">
                  <label for="documento_fiscal">RTN *</label>
                  <input 
                    id="documento_fiscal"
                    v-model="formulario.documento_fiscal" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="08011989123456"
                    maxlength="14"
                  >
                </div>
                
                <div class="form-group">
                  <label for="telefono_empresa">Teléfono Empresa</label>
                  <input 
                    id="telefono_empresa"
                    v-model="formulario.telefono_empresa" 
                    type="tel" 
                    class="form-input"
                    placeholder="+504 0000-0000"
                  >
                </div>
                
                <div class="form-group">
                  <label for="correo_empresa">Correo Empresa</label>
                  <input 
                    id="correo_empresa"
                    v-model="formulario.correo_empresa" 
                    type="email" 
                    class="form-input"
                    placeholder="info@empresa.com"
                  >
                </div>
              </div>
            </div>

            <!-- Información del Encargado -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-user"></i>
                Información del Encargado
              </h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="nombre_encargado">Nombre del Encargado *</label>
                  <input 
                    id="nombre_encargado"
                    v-model="formulario.nombre_encargado" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Juan Carlos Pérez"
                  >
                </div>
                
                <div class="form-group">
                  <label for="telefono_personal">Teléfono Personal *</label>
                  <input 
                    id="telefono_personal"
                    v-model="formulario.telefono_personal" 
                    type="tel" 
                    required 
                    class="form-input"
                    placeholder="+504 0000-0000"
                  >
                </div>
                
                <div class="form-group">
                  <label for="correo_personal">Correo Personal</label>
                  <input 
                    id="correo_personal"
                    v-model="formulario.correo_personal" 
                    type="email" 
                    class="form-input"
                    placeholder="juan.perez@email.com"
                  >
                </div>
              </div>
            </div>

            <!-- Estado (solo al editar) -->
            <div class="form-section" v-if="clienteEditando">
              <h4 class="section-title">
                <i class="fas fa-cogs"></i>
                Configuración
              </h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="estado">Estado</label>
                  <select id="estado" v-model="formulario.estado" class="form-select">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Errores de validación -->
          <div v-if="erroresFormulario.length > 0" class="form-errors">
            <div class="error-item" v-for="error in erroresFormulario" :key="error.field">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error.message }}</span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" @click="cerrarModalFormulario">Cancelar</button>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="guardarCliente"
          :disabled="guardandoCliente"
        >
          
          {{ guardandoCliente ? 'Guardando...' : (clienteEditando ? 'Actualizar' : 'Crear') }} Cliente
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para cambiar estado -->
  <div v-if="modalCambiarEstado" class="modal-overlay" @click="cerrarModalCambiarEstado">
    <div class="modal-content modal-confirmacion" @click.stop>
      <div class="modal-header">
        <h3>
          <i :class="clienteParaCambiarEstado.estado === 'activo' ? 'fas fa-ban text-danger' : 'fas fa-check text-success'"></i>
          {{ clienteParaCambiarEstado.estado === 'activo' ? 'Desactivar Cliente' : 'Activar Cliente' }}
        </h3>
        <button class="btn-close" @click="cerrarModalCambiarEstado">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="confirmacion-content">
          <div class="cliente-info-resumen">
            <div class="cliente-avatar">
              <i class="fas fa-building"></i>
            </div>
            <div class="cliente-datos">
              <h4>{{ clienteParaCambiarEstado.nombre_empresa }}</h4>
              <p class="cliente-encargado">{{ clienteParaCambiarEstado.nombre_encargado }}</p>
              <span class="cliente-id">#{{ String(clienteParaCambiarEstado.clientes_id).padStart(4, '0') }}</span>
            </div>
          </div>
          
          <div class="mensaje-confirmacion">
            <div class="icono-estado" :class="clienteParaCambiarEstado.estado === 'activo' ? 'desactivar' : 'activar'">
              <i :class="clienteParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
            </div>
            
            <div class="texto-confirmacion">
              <p class="pregunta-principal">
                ¿Está seguro que desea 
                <strong :class="clienteParaCambiarEstado.estado === 'activo' ? 'text-danger' : 'text-success'">
                  {{ clienteParaCambiarEstado.estado === 'activo' ? 'desactivar' : 'activar' }}
                </strong> 
                este cliente?
              </p>
              
              <div class="advertencia-estado" v-if="clienteParaCambiarEstado.estado === 'activo'">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Al desactivar este cliente, no podrá realizar nuevas operaciones hasta que sea activado nuevamente.</span>
              </div>
              
              <div class="info-estado" v-else>
                <i class="fas fa-info-circle"></i>
                <span>Al activar este cliente, podrá realizar operaciones normalmente en el sistema.</span>
              </div>
            </div>
          </div>
          
          <div class="cambio-estado-visual">
            <div class="estado-actual">
              <span class="label">Estado actual:</span>
              <span class="estado-badge" :class="clienteParaCambiarEstado.estado">
                {{ getEstadoTexto(clienteParaCambiarEstado.estado) }}
              </span>
            </div>
            
            <div class="flecha-cambio">
              <i class="fas fa-arrow-right"></i>
            </div>
            
            <div class="estado-nuevo">
              <span class="label">Nuevo estado:</span>
              <span class="estado-badge" :class="clienteParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo'">
                {{ clienteParaCambiarEstado.estado === 'activo' ? 'Inactivo' : 'Activo' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline" @click="cerrarModalCambiarEstado">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button 
          class="btn"
          :class="clienteParaCambiarEstado.estado === 'activo' ? 'btn-danger' : 'btn-success'"
          @click="confirmarCambiarEstado"
          :disabled="cambiandoEstado"
        >
          <i :class="cambiandoEstado ? 'fas fa-spinner fa-spin' : (clienteParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check')"></i>
          {{ cambiandoEstado ? 'Procesando...' : (clienteParaCambiarEstado.estado === 'activo' ? 'Desactivar' : 'Activar') }} Cliente
        </button>
      </div>
    </div>
  </div>

  <!-- Toast de notificaciones -->
  <div v-if="notification.show" :class="['notification', `notification-${notification.type}`]">
    <i class="fas" :class="notification.icon"></i>
    <span>{{ notification.message }}</span>
    <button class="notification-close" @click="closeNotification">
      <i class="fas fa-times"></i>
    </button>
  </div>
</div>
</template>

<script>
import clientesService from '@/services/clientes';

export default {
  name: 'AdminClientes',
  data() {
    return {
      loading: false,
      loadingMessage: 'Cargando clientes...',
      vistaActual: 'tabla',
      modalCliente: null,
      modalFormulario: false,
      modalCambiarEstado: false,
clienteEditando: null,
clienteParaCambiarEstado: null,
guardandoCliente: false,
cambiandoEstado: false,
paginaSalto: 1,
itemsPorPagina: 25,

// Datos reales del backend
clientes: [],
pagination: null,
estadisticas: {
 total: 0,
 activos: 0,
 inactivos: 0
},

filtros: {
 busqueda: '',
 estado: ''
},

formulario: {
 nombre_empresa: '',
 documento_fiscal: '',
 telefono_empresa: '',
 correo_empresa: '',
 nombre_encargado: '',
 telefono_personal: '',
 correo_personal: '',
 estado: 'activo'
},

erroresFormulario: [],
busquedaTimeout: null,

// Sistema de notificaciones
notification: {
 show: false,
 type: 'success',
 message: '',
 icon: 'fa-check'
}
}
},

computed: {
paginasVisibles() {
 if (!this.pagination) return [];
 
 const total = this.pagination.totalPages;
 const actual = this.pagination.currentPage;
 const rango = 2;
 
 let inicio = Math.max(1, actual - rango);
 let fin = Math.min(total, actual + rango);
 
 if (fin - inicio < 4) {
   if (inicio === 1) {
     fin = Math.min(total, inicio + 4);
   } else if (fin === total) {
     inicio = Math.max(1, fin - 4);
   }
 }
 
 const paginas = [];
 for (let i = inicio; i <= fin; i++) {
   paginas.push(i);
 }
 return paginas;
}
},

watch: {
// Actualizar paginaSalto cuando cambie la página actual
'pagination.currentPage'(newVal) {
 if (newVal) {
   this.paginaSalto = newVal;
 }
}
},

async mounted() {
console.log('🚀 Componente AdminClientes montado');

await this.cargarDatosIniciales();
},

methods: {
// ==================== CARGA DE DATOS ====================
async cargarDatosIniciales() {
 this.loading = true;
 this.loadingMessage = 'Cargando clientes...';
 
 try {
   await Promise.all([
     this.cargarClientes(),
     this.cargarEstadisticas()
   ]);
 } catch (error) {
   console.error('❌ Error cargando datos iniciales:', error);
   this.showNotification('Error cargando datos del sistema', 'error');
 } finally {
   this.loading = false;
 }
},

async cargarClientes() {
 try {
   console.log('📋 Cargando clientes con filtros:', this.filtros);
   
   const params = {
     page: this.pagination?.currentPage || 1,
     limit: this.itemsPorPagina,
     search: this.filtros.busqueda || undefined,
     estado: this.filtros.estado || undefined
   };
   
   const result = await clientesService.getClientes(params);
   
   if (result.success) {
     this.clientes = result.clientes;
     this.pagination = result.pagination;
     console.log('✅ Clientes cargados:', this.clientes.length);
   } else {
     this.showNotification(result.message || 'Error cargando clientes', 'error');
   }
   
 } catch (error) {
   console.error('❌ Error cargando clientes:', error);
   this.showNotification('Error de conexión al cargar clientes', 'error');
 }
},

async cargarEstadisticas() {
 try {
   console.log('📊 Cargando estadísticas...');
   
   const result = await clientesService.getEstadisticas();
   
   if (result.success) {
     this.estadisticas = result.estadisticas;
     console.log('✅ Estadísticas cargadas:', this.estadisticas);
   } else {
     console.error('❌ Error cargando estadísticas:', result.message);
   }
   
 } catch (error) {
   console.error('❌ Error cargando estadísticas:', error);
 }
},

// ==================== BÚSQUEDA Y FILTROS ====================
buscarClientes() {
 // Debounce para evitar muchas llamadas
 clearTimeout(this.busquedaTimeout);
 this.busquedaTimeout = setTimeout(() => {
   this.aplicarFiltros();
 }, 500);
},

async aplicarFiltros() {
 console.log('🔍 Aplicando filtros:', this.filtros);
 
 // Resetear a la primera página
 if (this.pagination) {
   this.pagination.currentPage = 1;
 }
 
 await this.cargarClientes();
},

limpiarFiltros() {
 this.filtros = {
   busqueda: '',
   estado: ''
 };
 
 this.aplicarFiltros();
},

// ==================== PAGINACIÓN ====================
async cambiarItemsPorPagina() {
 if (this.pagination) {
   this.pagination.currentPage = 1;
 }
 this.paginaSalto = 1;
 await this.cargarClientes();
},

async irAPrimera() {
 if (this.pagination && this.pagination.currentPage !== 1) {
   this.pagination.currentPage = 1;
   await this.cargarClientes();
 }
},

async irAUltima() {
 if (this.pagination && this.pagination.currentPage !== this.pagination.totalPages) {
   this.pagination.currentPage = this.pagination.totalPages;
   await this.cargarClientes();
 }
},

async paginaAnterior() {
 if (this.pagination && this.pagination.hasPrevPage) {
   this.pagination.currentPage--;
   await this.cargarClientes();
 }
},

async paginaSiguiente() {
 if (this.pagination && this.pagination.hasNextPage) {
   this.pagination.currentPage++;
   await this.cargarClientes();
 }
},

async irAPagina(pagina = null) {
 const targetPage = pagina || this.paginaSalto;
 
 if (this.pagination && targetPage >= 1 && targetPage <= this.pagination.totalPages) {
   this.pagination.currentPage = targetPage;
   await this.cargarClientes();
 } else {
   this.showNotification(`Por favor ingresa un número entre 1 y ${this.pagination?.totalPages || 1}`, 'warning');
   this.paginaSalto = this.pagination?.currentPage || 1;
 }
},

// ==================== GESTIÓN DE CLIENTES ====================
nuevoCliente() {
 this.clienteEditando = null;
 this.limpiarFormulario();
 this.modalFormulario = true;
},

verCliente(cliente) {
 this.modalCliente = cliente;
},

editarCliente(cliente) {
 this.clienteEditando = cliente;
 this.llenarFormulario(cliente);
 this.modalFormulario = true;
 this.modalCliente = null;
},

async guardarCliente() {
 if (this.guardandoCliente) return;
 
 this.erroresFormulario = [];
 
 // Validaciones básicas
 if (!this.validarFormulario()) {
   return;
 }
 
 this.guardandoCliente = true;
 this.loadingMessage = this.clienteEditando ? 'Actualizando cliente...' : 'Creando cliente...';
 
 try {
   let result;
   
   if (this.clienteEditando) {
     // Actualizar cliente existente
     result = await clientesService.updateCliente(this.clienteEditando.clientes_id, this.formulario);
   } else {
     // Crear nuevo cliente
     result = await clientesService.createCliente(this.formulario);
   }
   
   if (result.success) {
     this.showNotification(
       result.message || (this.clienteEditando ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente'), 
       'success'
     );
     
     this.cerrarModalFormulario();
     
     // Recargar datos
     await Promise.all([
       this.cargarClientes(),
       this.cargarEstadisticas()
     ]);
     
   } else {
     // Manejar errores de validación
     if (result.errors) {
       this.erroresFormulario = result.errors;
     } else {
       this.showNotification(result.message || 'Error al guardar cliente', 'error');
     }
   }
   
 } catch (error) {
   console.error('❌ Error guardando cliente:', error);
   this.showNotification('Error de conexión al guardar cliente', 'error');
 } finally {
   this.guardandoCliente = false;
 }
},

validarFormulario() {
 const errores = [];
 
 if (!this.formulario.nombre_empresa?.trim()) {
   errores.push({ field: 'nombre_empresa', message: 'El nombre de la empresa es requerido' });
 }
 
 if (!this.formulario.documento_fiscal?.trim()) {
   errores.push({ field: 'documento_fiscal', message: 'El RTN es requerido' });
 }
 
 if (!this.formulario.nombre_encargado?.trim()) {
   errores.push({ field: 'nombre_encargado', message: 'El nombre del encargado es requerido' });
 }
 
 if (!this.formulario.telefono_personal?.trim()) {
   errores.push({ field: 'telefono_personal', message: 'El teléfono personal es requerido' });
 }
 
 if (this.formulario.correo_personal && !this.isValidEmail(this.formulario.correo_personal)) {
   errores.push({ field: 'correo_personal', message: 'Ingrese un correo personal válido' });
 }
 
 if (this.formulario.correo_empresa && !this.isValidEmail(this.formulario.correo_empresa)) {
   errores.push({ field: 'correo_empresa', message: 'Ingrese un correo de empresa válido' });
 }
 
 this.erroresFormulario = errores;
 
 if (errores.length > 0) {
   this.showNotification('Por favor corrige los errores en el formulario', 'warning');
   return false;
 }
 
 return true;
},

isValidEmail(email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
},

llenarFormulario(cliente) {
 this.formulario = {
   nombre_empresa: cliente.nombre_empresa,
   documento_fiscal: cliente.documento_fiscal,
   telefono_empresa: cliente.telefono_empresa || '',
   correo_empresa: cliente.correo_empresa || '',
   nombre_encargado: cliente.nombre_encargado,
   telefono_personal: cliente.telefono_personal || '',
   correo_personal: cliente.correo_personal || '',
   estado: cliente.estado
 };
},

limpiarFormulario() {
 this.formulario = {
   nombre_empresa: '',
   documento_fiscal: '',
   telefono_empresa: '',
   correo_empresa: '',
   nombre_encargado: '',
   telefono_personal: '',
   correo_personal: '',
   estado: 'activo'
 };
 this.erroresFormulario = [];
},

// ==================== CAMBIO DE ESTADO ====================
mostrarModalCambiarEstado(cliente) {
 this.clienteParaCambiarEstado = cliente;
 this.modalCambiarEstado = true;
},

async confirmarCambiarEstado() {
 if (this.cambiandoEstado || !this.clienteParaCambiarEstado) return;
 
 this.cambiandoEstado = true;
 
 try {
   const nuevoEstado = this.clienteParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo';
   
   let result;
   if (nuevoEstado === 'activo') {
     result = await clientesService.restoreCliente(this.clienteParaCambiarEstado.clientes_id);
   } else {
     result = await clientesService.deleteCliente(this.clienteParaCambiarEstado.clientes_id);
   }
   
   if (result.success) {
     const accion = nuevoEstado === 'activo' ? 'activado' : 'desactivado';
     this.showNotification(`Cliente ${accion} exitosamente`, 'success');
     
     // Actualizar el estado local
     this.clienteParaCambiarEstado.estado = nuevoEstado;
     
     // Recargar datos
     await Promise.all([
       this.cargarClientes(),
       this.cargarEstadisticas()
     ]);
     
   } else {
     this.showNotification(result.message || 'Error al cambiar estado del cliente', 'error');
   }
   
 } catch (error) {
   console.error('❌ Error cambiando estado:', error);
   this.showNotification('Error de conexión al cambiar estado', 'error');
 } finally {
   this.cambiandoEstado = false;
   this.cerrarModalCambiarEstado();
 }
},

cerrarModalCambiarEstado() {
 this.modalCambiarEstado = false;
 this.clienteParaCambiarEstado = null;
},

// ==================== MODALES ====================
cerrarModal() {
 this.modalCliente = null;
},

cerrarModalFormulario() {
 this.modalFormulario = false;
 this.clienteEditando = null;
 this.limpiarFormulario();
},

// ==================== HELPERS ====================
formatearFecha(fecha) {
 if (!fecha) return 'No disponible';
 
 try {
   return new Date(fecha).toLocaleDateString('es-HN', {
     year: 'numeric',
     month: 'short',
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   });
 } catch (error) {
   return fecha;
 }
},

getEstadoTexto(estado) {
 const estados = {
   activo: 'Activo',
   inactivo: 'Inactivo'
 };
 return estados[estado] || estado;
},

// ==================== NOTIFICACIONES ====================
showNotification(message, type = 'success') {
 const icons = {
   success: 'fa-check-circle',
   error: 'fa-exclamation-circle',
   warning: 'fa-exclamation-triangle',
   info: 'fa-info-circle'
 };
 
 this.notification = {
   show: true,
   type,
   message,
   icon: icons[type] || icons.info
 };
 
 // Auto-close después de 5 segundos
 setTimeout(() => {
   this.closeNotification();
 }, 5000);
},

closeNotification() {
 this.notification.show = false;
}
},

// Limpiar timeouts al destruir el componente
beforeUnmount() {
if (this.busquedaTimeout) {
 clearTimeout(this.busquedaTimeout);
}
}
}
</script>

<style scoped>
/* Estilos base */
.admin-clientes-container {
 padding: 2rem;
 max-width: 1400px;
 margin: 0 auto;
}

/* Loading overlay */
.loading-overlay {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(0, 0, 0, 0.7);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 2000;
 backdrop-filter: blur(4px);
}

.loading-spinner {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 1rem;
 color: white;
 font-size: 1.1rem;
}

.loading-spinner i {
 font-size: 3rem;
 color: #3498db;
}

/* Header */
.page-header {
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
 margin-bottom: 2rem;
 gap: 2rem;
}

.header-content h1 {
 font-size: 2.5rem;
 font-weight: 700;
 color: #2c3e50;
 margin-bottom: 0.5rem;
}

.page-subtitle {
 color: #7f8c8d;
 font-size: 1.1rem;
 margin: 0;
}

.header-actions {
 flex-shrink: 0;
 display: flex;
 gap: 1rem;
}

/* Botones */
.btn {
 padding: 0.875rem 1.5rem;
 border: none;
 border-radius: 8px;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 display: inline-flex;
 align-items: center;
 gap: 0.5rem;
 text-decoration: none;
 font-size: 0.9rem;
}

.btn:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 transform: none !important;
}

.btn-primary {
 background: linear-gradient(135deg, #3498db, #2980b9);
 color: white;
}

.btn-primary:hover:not(:disabled) {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
 background: #95a5a6;
 color: white;
}

.btn-secondary:hover:not(:disabled) {
 background: #7f8c8d;
}

.btn-outline {
 background: transparent;
 color: #3498db;
 border: 2px solid #3498db;
}

.btn-outline:hover:not(:disabled) {
 background: #3498db;
 color: white;
}

.btn-danger {
 background: #e74c3c;
 color: white;
}

.btn-danger:hover:not(:disabled) {
 background: #c0392b;
}

.btn-success {
 background: #27ae60;
 color: white;
}

.btn-success:hover:not(:disabled) {
 background: #219a52;
}

.btn-sm {
 padding: 0.5rem 1rem;
 font-size: 0.85rem;
}

/* Filtros */
.filtros-section {
 background: white;
 border-radius: 12px;
 padding: 1.5rem;
 margin-bottom: 2rem;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filtros-container {
 display: grid;
 gap: 1rem;
}

.search-box {
 position: relative;
 max-width: 400px;
}

.search-icon {
 position: absolute;
 left: 1rem;
 top: 50%;
 transform: translateY(-50%);
 font-size: 1.2rem;
 color: #7f8c8d;
}

.search-input {
 width: 100%;
 padding: 0.875rem 1rem 0.875rem 3rem;
 border: 2px solid #e1e8ed;
 border-radius: 8px;
 font-size: 1rem;
 transition: border-color 0.3s ease;
}

.search-input:focus {
 outline: none;
 border-color: #3498db;
}

.filtros-grid {
 display: flex;
 gap: 1rem;
 flex-wrap: wrap;
 align-items: center;
}

.filter-select {
 padding: 0.75rem 1rem;
 border: 2px solid #e1e8ed;
 border-radius: 8px;
 font-size: 0.9rem;
 min-width: 180px;
 cursor: pointer;
}

/* Estadísticas */
.estadisticas-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 1.5rem;
 margin-bottom: 2rem;
}

.stat-card {
 background: white;
 border-radius: 12px;
 padding: 1.5rem;
 display: flex;
 align-items: center;
 gap: 1rem;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
 transition: transform 0.3s ease;
}

.stat-card:hover {
 transform: translateY(-2px);
}

.stat-number {
 font-size: 2rem;
 font-weight: 700;
 color: #2c3e50;
 line-height: 1;
}

.stat-label {
 color: #7f8c8d;
 font-size: 0.9rem;
 margin-top: 0.25rem;
}

.stat-card.total { border-left: 4px solid #3498db; }
.stat-card.activos { border-left: 4px solid #27ae60; }
.stat-card.vendedores { border-left: 4px solid #f39c12; }
.stat-card.nuevos { border-left: 4px solid #9b59b6; }
.stat-card.inactivos { border-left: 4px solid #95a5a6; }

/* Sección de clientes */
.clientes-section {
 background: white;
 border-radius: 12px;
 padding: 1.5rem;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1.5rem;
 flex-wrap: wrap;
 gap: 1rem;
}

.section-title {
 font-size: 1.5rem;
 font-weight: 600;
 color: #2c3e50;
 margin: 0;
}

.view-controls {
 display: flex;
 gap: 0.5rem;
}

.view-btn {
 padding: 0.5rem 1rem;
 border: 2px solid #e1e8ed;
 background: white;
 border-radius: 6px;
 cursor: pointer;
 transition: all 0.3s ease;
 font-size: 0.85rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.view-btn.active {
 background: #3498db;
 color: white;
 border-color: #3498db;
}

/* Paginación info */
.paginacion-info {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1rem;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 8px;
 flex-wrap: wrap;
 gap: 1rem;
}

.items-info {
 color: #6c757d;
 font-size: 0.9rem;
 font-weight: 500;
}

.pagination-jump {
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.pagination-jump label {
 color: #6c757d;
 font-size: 0.85rem;
 font-weight: 500;
}

.page-input {
 width: 60px;
 padding: 0.375rem 0.5rem;
 border: 1px solid #ced4da;
 border-radius: 4px;
 text-align: center;
 font-size: 0.85rem;
}

.page-input:focus {
 outline: none;
 border-color: #3498db;
 box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Tabla */
.tabla-wrapper {
 overflow-x: auto;
}

.clientes-tabla {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 1rem;
}

.clientes-tabla th {
 background: #f8f9fa;
 padding: 1rem;
 text-align: left;
 font-weight: 600;
 color: #2c3e50;
 border-bottom: 2px solid #e9ecef;
 white-space: nowrap;
}

.clientes-tabla th.sortable {
 cursor: pointer;
 user-select: none;
}

.clientes-tabla th.sortable:hover {
 background: #e9ecef;
}

.sort-icon {
 margin-left: 0.5rem;
 opacity: 0.5;
}

.clientes-tabla td {
 padding: 1rem;
 border-bottom: 1px solid #e9ecef;
 vertical-align: middle;
}

.cliente-id {
 font-weight: 600;
 color: #3498db;
 font-family: monospace;
 font-size: 1rem;
}

.empresa-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.empresa-nombre {
 font-weight: 500;
 color: #2c3e50;
}

.empresa-correo {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.encargado-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.encargado-nombre {
 font-weight: 500;
 color: #2c3e50;
}

.encargado-correo {
 color: #7f8c8d;
 font-size: 0.85rem;
}

.rtn {
 font-family: monospace;
 background: #f8f9fa;
 padding: 0.25rem 0.5rem;
 border-radius: 4px;
 font-size: 0.85rem;
 color: #2c3e50;
}

.telefonos-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.telefono-item {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 font-family: monospace;
 font-size: 0.85rem;
 color: #2c3e50;
}

.telefono-item i {
 color: #7f8c8d;
 width: 14px;
}

.vendedor-asignado {
 font-weight: 500;
 color: #2c3e50;
 background: #e3f2fd;
 padding: 0.25rem 0.5rem;
 border-radius: 4px;
 font-size: 0.85rem;
}

/* Estados */
.estado-badge {
 padding: 0.375rem 0.75rem;
 border-radius: 20px;
 font-size: 0.8rem;
 font-weight: 600;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.estado-badge.activo {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.estado-badge.inactivo {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
}

/* Acciones - CORREGIDO PARA MOSTRAR HORIZONTALMENTE */
.acciones {
 display: flex;
 flex-direction: row;
 gap: 0.5rem;
 align-items: center;
 justify-content: flex-start;
 flex-wrap: nowrap;
 min-width: 120px;
}

.btn-accion {
 width: 32px;
 height: 32px;
 border: none;
 border-radius: 6px;
 cursor: pointer;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 0.9rem;
 transition: all 0.3s ease;
 flex-shrink: 0;
}

.btn-accion.ver {
 background: #e3f2fd;
 color: #1976d2;
}

.btn-accion.ver:hover {
 background: #bbdefb;
}

.btn-accion.editar {
 background: #fff3e0;
 color: #f57c00;
}

.btn-accion.editar:hover {
 background: #ffe0b2;
}

.btn-accion.deshabilitar {
 background: #ffebee;
 color: #d32f2f;
}

.btn-accion.deshabilitar:hover {
 background: #ffcdd2;
}

.btn-accion.habilitar {
 background: #e8f5e8;
 color: #388e3c;
}

.btn-accion.habilitar:hover {
 background: #c8e6c9;
}

/* Vista de tarjetas */
.tarjetas-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
 gap: 1.5rem;
}

.cliente-card {
 border: 1px solid #e9ecef;
 border-radius: 12px;
 padding: 1.5rem;
 transition: all 0.3s ease;
 background: white;
}

.cliente-card:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1rem;
}

.card-numero {
 font-weight: 600;
 color: #3498db;
 font-family: monospace;
 font-size: 1.1rem;
}

.empresa-nombre-card {
 color: #2c3e50;
 margin-bottom: 0.5rem;
 font-size: 1.3rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.encargado-nombre-card {
 color: #7f8c8d;
 font-size: 1rem;
 margin-bottom: 1rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.cliente-details {
 display: grid;
 gap: 0.75rem;
 margin-bottom: 1.5rem;
}

.detail {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.5rem;
 background: #f8f9fa;
 border-radius: 6px;
}

.detail-label {
 color: #7f8c8d;
 font-size: 0.85rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.detail-value {
 color: #2c3e50;
 font-weight: 500;
 font-size: 0.9rem;
}

.rtn-card {
 font-family: monospace;
 background: #e3f2fd;
 color: #1976d2;
 padding: 0.25rem 0.5rem;
 border-radius: 4px;
 font-size: 0.85rem;
}

.email-card {
 font-size: 0.8rem;
 word-break: break-all;
}

.vendedor-card {
 background: #fff3e0;
 color: #f57c00;
 padding: 0.25rem 0.5rem;
 border-radius: 4px;
 font-size: 0.85rem;
}

.card-actions {
 display: flex;
 gap: 0.75rem;
 flex-wrap: wrap;
}

.card-actions .btn {
 flex: 1;
 justify-content: center;
 min-width: auto;
}

/* Estado vacío */
.empty-state {
 text-align: center;
 padding: 4rem 2rem;
 color: #7f8c8d;
}

.empty-icon {
 font-size: 4rem;
 margin-bottom: 1rem;
 opacity: 0.5;
}

.empty-title {
 font-size: 1.5rem;
 color: #2c3e50;
 margin-bottom: 0.5rem;
}

.empty-description {
 margin-bottom: 2rem;
 font-size: 1rem;
 line-height: 1.5;
}

/* Paginación completa */
.paginacion-completa {
 margin-top: 2rem;
 padding-top: 1.5rem;
 border-top: 1px solid #e9ecef;
}

.paginacion {
 display: flex;
 justify-content: center;
 align-items: center;
 gap: 0.5rem;
 flex-wrap: wrap;
 margin-bottom: 1rem;
}

.btn-pag {
 padding: 0.5rem 0.75rem;
 border: 1px solid #dee2e6;
 background: white;
 border-radius: 6px;
 cursor: pointer;
 transition: all 0.3s ease;
 font-size: 0.9rem;
 min-width: 40px;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 0.25rem;
}

.btn-pag:hover:not(:disabled) {
 background: #e9ecef;
 transform: translateY(-1px);
}

.btn-pag:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.btn-pag.active {
 background: #3498db;
 color: white;
 border-color: #3498db;
 font-weight: 600;
}

.paginas {
 display: flex;
 gap: 0.25rem;
 align-items: center;
}

.pagina-separador {
 padding: 0.5rem 0.25rem;
 color: #6c757d;
 font-weight: bold;
}

.paginacion-info-bottom {
 text-align: center;
 margin-top: 1rem;
}

.pagina-actual {
 color: #6c757d;
 font-size: 0.9rem;
 font-weight: 500;
 background: #f8f9fa;
 padding: 0.5rem 1rem;
 border-radius: 20px;
}

/* Modales */
.modal-overlay {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(0, 0, 0, 0.5);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 1000;
 padding: 1rem;
 backdrop-filter: blur(4px);
}

.modal-content {
 background: white;
 border-radius: 12px;
 max-width: 800px;
 width: 100%;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
 animation: modalSlideIn 0.3s ease-out;
}

.modal-formulario {
 max-width: 900px;
}

.modal-confirmacion {
 max-width: 600px;
}

.modal-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 1.5rem;
 border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
 margin: 0;
 color: #2c3e50;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.btn-close {
 background: none;
 border: none;
 font-size: 1.5rem;
 cursor: pointer;
 color: #7f8c8d;
 padding: 0.5rem;
 border-radius: 50%;
 transition: all 0.3s ease;
}

.btn-close:hover {
 background: #f8f9fa;
 color: #e74c3c;
}

.modal-body {
 padding: 1.5rem;
}

.modal-footer {
 display: flex;
 justify-content: flex-end;
 gap: 1rem;
 padding: 1.5rem;
 border-top: 1px solid #e9ecef;
 background: #f8f9fa;
}

/* Detalle de cliente */
.cliente-detalle {
 padding: 1rem 0;
}

.detalle-grid {
 display: grid;
 gap: 1rem;
 margin-bottom: 1.5rem;
}

.detalle-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.75rem;
 background: #f8f9fa;
 border-radius: 6px;
}

.detalle-item strong {
 color: #2c3e50;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

/* Formulario */
.formulario-cliente {
 padding: 1rem 0;
}

.form-sections {
 display: flex;
 flex-direction: column;
 gap: 2rem;
}

.form-section {
 border: 1px solid #e9ecef;
 border-radius: 8px;
 padding: 1.5rem;
 background: #fafafa;
}

.section-title {
 color: #2c3e50;
 font-size: 1.1rem;
 font-weight: 600;
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 border-bottom: 1px solid #e9ecef;
 padding-bottom: 0.5rem;
}

.form-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
 gap: 1.5rem;
}

.form-group {
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
}

.form-group label {
 font-weight: 600;
 color: #2c3e50;
 font-size: 0.9rem;
}

.form-input,
.form-select {
 padding: 0.75rem 1rem;
 border: 2px solid #e1e8ed;
 border-radius: 8px;
 font-size: 1rem;
 transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
 outline: none;
 border-color: #3498db;
 box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Errores de formulario */
.form-errors {
 background: #fff5f5;
 border: 1px solid #fed7d7;
 border-radius: 8px;
 padding: 1rem;
 margin-top: 1rem;
}

.error-item {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 color: #e53e3e;
 font-size: 0.9rem;
 margin-bottom: 0.5rem;
}

.error-item:last-child {
 margin-bottom: 0;
}

.error-item i {
 color: #e53e3e;
}

/* Modal de confirmación */
.confirmacion-content {
 display: flex;
 flex-direction: column;
 gap: 2rem;
}

.cliente-info-resumen {
 display: flex;
 align-items: center;
 gap: 1rem;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 8px;
 border-left: 4px solid #3498db;
}

.cliente-avatar {
 width: 60px;
 height: 60px;
 background: linear-gradient(135deg, #3498db, #2980b9);
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 color: white;
 font-size: 1.5rem;
 flex-shrink: 0;
}

.cliente-datos h4 {
 margin: 0 0 0.25rem 0;
 color: #2c3e50;
 font-size: 1.2rem;
}

.cliente-encargado {
 margin: 0 0 0.25rem 0;
 color: #7f8c8d;
 font-size: 0.9rem;
}

.cliente-id {
 font-family: monospace;
 background: #e3f2fd;
 color: #1976d2;
 padding: 0.2rem 0.5rem;
 border-radius: 4px;
 font-size: 0.8rem;
 font-weight: 600;
}

.mensaje-confirmacion {
 text-align: center;
 padding: 1.5rem;
}

.icono-estado {
 width: 80px;
 height: 80px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 margin: 0 auto 1.5rem;
 font-size: 2rem;
 color: white;
}

.icono-estado.desactivar {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.icono-estado.activar {
 background: linear-gradient(135deg, #27ae60, #219a52);
}

.texto-confirmacion {
 max-width: 400px;
 margin: 0 auto;
}

.pregunta-principal {
 font-size: 1.1rem;
 color: #2c3e50;
 margin-bottom: 1rem;
 line-height: 1.5;
}

.text-danger {
 color: #e74c3c;
}

.text-success {
 color: #27ae60;
}

.advertencia-estado,
.info-estado {
 display: flex;
 align-items: flex-start;
 gap: 0.5rem;
 padding: 1rem;
 border-radius: 6px;
 font-size: 0.9rem;
 line-height: 1.4;
 text-align: left;
}

.advertencia-estado {
 background: #fff3cd;
 color: #856404;
 border: 1px solid #ffeaa7;
}

.advertencia-estado i {
 color: #f39c12;
 margin-top: 0.1rem;
}

.info-estado {
 background: #d1ecf1;
 color: #0c5460;
 border: 1px solid #bee5eb;
}

.info-estado i {
 color: #17a2b8;
 margin-top: 0.1rem;
}

.cambio-estado-visual {
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 1.5rem;
 padding: 1.5rem;
 background: #f8f9fa;
 border-radius: 8px;
 border: 1px solid #e9ecef;
}

.estado-actual,
.estado-nuevo {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 0.5rem;
}

.label {
 font-size: 0.8rem;
 color: #6c757d;
 font-weight: 500;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.flecha-cambio {
 color: #6c757d;
 font-size: 1.5rem;
}

/* Notificaciones */
.notification {
 position: fixed;
 top: 2rem;
 right: 2rem;
 padding: 1rem 1.5rem;
 border-radius: 8px;
 color: white;
 font-weight: 500;
 z-index: 3000;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 min-width: 300px;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
 animation: slideInRight 0.3s ease-out;
}

.notification-success {
 background: #27ae60;
}

.notification-error {
 background: #e74c3c;
}

.notification-warning {
 background: #f39c12;
}

.notification-info {
 background: #3498db;
}

.notification-close {
 background: none;
 border: none;
 color: white;
 cursor: pointer;
 padding: 0.25rem;
 border-radius: 50%;
 transition: all 0.3s ease;
 margin-left: auto;
}

.notification-close:hover {
 background: rgba(255, 255, 255, 0.2);
}

/* Animaciones */
@keyframes slideInRight {
from {
  opacity: 0;
  transform: translateX(100%);
}
to {
  opacity: 1;
  transform: translateX(0);
}
}

@keyframes slideOutRight {
from {
  opacity: 1;
  transform: translateX(0);
}
to {
  opacity: 0;
  transform: translateX(100%);
}
}

@keyframes fadeIn {
from {
  opacity: 0;
  transform: translateY(20px);
}
to {
  opacity: 1;
  transform: translateY(0);
}
}

@keyframes modalSlideIn {
from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
to {
  opacity: 1;
  transform: scale(1) translateY(0);
}
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.admin-clientes-container {
animation: fadeIn 0.5s ease-out;
}

.cliente-card,
.stat-card {
animation: fadeIn 0.3s ease-out;
}

/* Estados de hover mejorados */
.btn:hover:not(:disabled) {
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.clientes-tabla tbody tr:hover {
background-color: #f8f9fa;
transform: scale(1.01);
transition: all 0.2s ease;
}

.btn-accion:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mejoras de accesibilidad */
.btn:focus,
.form-input:focus,
.form-select:focus,
.btn-accion:focus,
.view-btn:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}

/* Estados de carga específicos */
.btn.loading {
pointer-events: none;
opacity: 0.7;
}

.btn.loading i {
animation: spin 1s linear infinite;
}

/* Transiciones suaves */
* {
transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Mejoras visuales para la paginación */
.btn-pag:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}

.page-input:invalid {
border-color: #e74c3c;
box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

/* Mejoras para el formulario */
.form-input:invalid,
.form-select:invalid {
border-color: #e74c3c;
}

.form-input:valid,
.form-select:valid {
border-color: #27ae60;
}

/* Mejoras para la búsqueda */
.search-input:focus + .search-icon {
color: #3498db;
}

/* Estados específicos para notificaciones */
.notification.hide {
animation: slideOutRight 0.3s ease-in forwards;
}

/* Sombras mejoradas */
.card,
.modal-content,
.clientes-section,
.filtros-section {
box-shadow: 
  0 1px 3px rgba(0, 0, 0, 0.12),
  0 1px 2px rgba(0, 0, 0, 0.24);
}

.card:hover,
.cliente-card:hover {
box-shadow: 
  0 14px 28px rgba(0, 0, 0, 0.25),
  0 10px 10px rgba(0, 0, 0, 0.22);
}

/* Scroll personalizado para la tabla */
.tabla-wrapper::-webkit-scrollbar {
height: 8px;
}

.tabla-wrapper::-webkit-scrollbar-track {
background: #f1f1f1;
border-radius: 4px;
}

.tabla-wrapper::-webkit-scrollbar-thumb {
background: #c1c1c1;
border-radius: 4px;
}

.tabla-wrapper::-webkit-scrollbar-thumb:hover {
background: #a8a8a8;
}

/* Estados de éxito y error para formularios */
.form-group.success .form-input,
.form-group.success .form-select {
border-color: #27ae60;
box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.form-group.error .form-input,
.form-group.error .form-select {
border-color: #e74c3c;
box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* Responsive Design */
@media (max-width: 1200px) {
.estadisticas-grid {
  grid-template-columns: repeat(3, 1fr);
}

.confirmacion-content {
  gap: 1.5rem;
}

.cambio-estado-visual {
  flex-direction: column;
  gap: 1rem;
}

.flecha-cambio {
  transform: rotate(90deg);
}
}

@media (max-width: 768px) {
.admin-clientes-container {
  padding: 1rem;
}

.page-header {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

.header-actions {
  flex-direction: column;
}

.header-content h1 {
  font-size: 2rem;
}

.estadisticas-grid {
  grid-template-columns: repeat(2, 1fr);
}

.filtros-grid {
  flex-direction: column;
  align-items: stretch;
}

.filter-select {
  min-width: auto;
}

.section-header {
  flex-direction: column;
  align-items: stretch;
}

.paginacion-info {
  flex-direction: column;
  align-items: stretch;
  text-align: center;
}

.tabla-wrapper {
  overflow-x: scroll;
}

.clientes-tabla {
  min-width: 900px;
}

.tarjetas-grid {
  grid-template-columns: 1fr;
}

.card-actions {
  justify-content: stretch;
}

.card-actions .btn {
  flex: 1;
  justify-content: center;
}

.detalle-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.form-grid {
  grid-template-columns: 1fr;
}

.modal-footer {
  flex-direction: column;
}

.modal-confirmacion {
  max-width: 95%;
  margin: 1rem;
}

.cliente-info-resumen {
  flex-direction: column;
  text-align: center;
  gap: 0.75rem;
}

.icono-estado {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.cambio-estado-visual {
  padding: 1rem;
}

.notification {
  right: 1rem;
  left: 1rem;
  min-width: auto;
}

/* Botones de acción en móvil - mantener horizontal */
.acciones {
  gap: 0.25rem;
}

.btn-accion {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}
}

@media (max-width: 480px) {
.estadisticas-grid {
  grid-template-columns: 1fr;
}

.filtros-section,
.clientes-section {
  padding: 1rem;
}

.stat-card {
  padding: 1rem;
}

.cliente-card {
  padding: 1rem;
}

.modal-content {
  margin: 0.5rem;
}

.btn-pag {
  min-width: 35px;
  padding: 0.375rem 0.5rem;
}

.card-actions {
  flex-direction: column;
}

.card-actions .btn {
  width: 100%;
}

.modal-confirmacion {
  max-width: 100%;
  margin: 0.5rem;
}

.cliente-avatar {
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
}

.pregunta-principal {
  font-size: 1rem;
}

.advertencia-estado,
.info-estado {
  padding: 0.75rem;
  font-size: 0.85rem;
}

.notification {
  top: 1rem;
  right: 0.5rem;
  left: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.loading-spinner {
  font-size: 1rem;
}

.loading-spinner i {
  font-size: 2rem;
}

/* Mantener botones horizontales incluso en pantallas muy pequeñas */
.acciones {
  min-width: 90px;
  overflow-x: auto;
}

.btn-accion {
  width: 26px;
  height: 26px;
  font-size: 0.75rem;
  flex-shrink: 0;
}
}

/* Mejoras para dispositivos táctiles */
@media (hover: none) and (pointer: coarse) {
.btn-accion {
  width: 40px;
  height: 40px;
}

.btn {
  padding: 1rem 1.5rem;
}

.clientes-tabla td {
  padding: 1.5rem 1rem;
}

/* Asegurar que los botones de acción permanezcan en fila */
.acciones {
  gap: 0.75rem;
}
}

/* Estados específicos de badges y indicadores */
.tipo-badge,
.estado-badge {
position: relative;
overflow: hidden;
}

.tipo-badge::before,
.estado-badge::before {
content: '';
position: absolute;
top: 0;
left: -100%;
width: 100%;
height: 100%;
background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
transition: left 0.5s;
}

.tipo-badge:hover::before,
.estado-badge:hover::before {
left: 100%;
}

/* Indicadores de loading específicos */
.btn[disabled] i.fa-spinner {
animation: spin 1s linear infinite;
}

/* Mejoras de contraste y legibilidad */
.stat-card:focus-within {
outline: 2px solid #3498db;
outline-offset: 2px;
}

.cliente-card:focus-within {
outline: 2px solid #3498db;
outline-offset: 2px;
}

/* Estados de error y éxito más visuales */
.form-input.error {
border-color: #e74c3c;
background-color: rgba(231, 76, 60, 0.05);
}

.form-input.success {
border-color: #27ae60;
background-color: rgba(39, 174, 96, 0.05);
}

/* Mejoras en la presentación de datos */
.stat-number {
background: linear-gradient(135deg, #2c3e50, #34495e);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
}

/* Efectos especiales para estados importantes */
.btn-danger:hover {
box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.btn-success:hover {
box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
}

/* Mejoras finales de UX */
.modal-overlay {
animation: fadeIn 0.3s ease-out;
}

.empty-state {
animation: fadeIn 0.5s ease-out;
}

.cliente-card {
transform-origin: center;
}

.stat-card {
transform-origin: center;
}

/* Personalización de scrollbars para todo el modal */
.modal-content::-webkit-scrollbar {
width: 6px;
}

.modal-content::-webkit-scrollbar-track {
background: #f1f1f1;
}

.modal-content::-webkit-scrollbar-thumb {
background: #c1c1c1;
border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
background: #a8a8a8;
}

/* CORRECCIÓN ESPECÍFICA PARA BOTONES DE ACCIONES */
/* Asegurar que los botones siempre estén en fila horizontal */
.acciones {
 display: flex !important;
 flex-direction: row !important;
 align-items: center !important;
 justify-content: flex-start !important;
 gap: 0.5rem !important;
 flex-wrap: nowrap !important;
 white-space: nowrap !important;
}

/* Prevenir que los botones se apilen verticalmente */
.btn-accion {
 flex: 0 0 auto !important;
 display: inline-flex !important;
 margin: 0 !important;
}

/* Ajustes específicos para la tabla */
.clientes-tabla .acciones {
 min-width: 120px;
 max-width: 150px;
}

/* Asegurar que la columna de acciones tenga suficiente espacio */
.clientes-tabla th:last-child,
.clientes-tabla td:last-child {
 width: 140px;
 min-width: 140px;
 text-align: center;
}
</style>