<template>
<div class="admin-clientes-container">
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
        />
      </div>
      
      <div class="filtros-grid">
        <select v-model="filtros.vendedorAsignado" class="filter-select">
          <option value="">Todos los vendedores</option>
          <option v-for="vendedor in vendedoresUnicos" :key="vendedor" :value="vendedor">
            {{ vendedor }}
          </option>
        </select>
        
        <select v-model="filtros.estado" class="filter-select">
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
        {{ clientesFiltrados.length }} Clientes encontrados
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
    <div class="paginacion-info">
      <span class="items-info">
        Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ clientesFiltrados.length }} clientes
      </span>
      <div class="pagination-jump">
        <label for="jump-page">Ir a página:</label>
        <input 
          id="jump-page"
          type="number" 
          v-model.number="paginaSalto" 
          @keyup.enter="irAPagina"
          :min="1" 
          :max="totalPaginas"
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
              <th @click="ordenarPor('id')" class="sortable">
                ID
                <span class="sort-icon">{{ getSortIcon('id') }}</span>
              </th>
              <th @click="ordenarPor('nombreEmpresa')" class="sortable">
                Empresa
                <span class="sort-icon">{{ getSortIcon('nombreEmpresa') }}</span>
              </th>
              <th @click="ordenarPor('nombreEncargado')" class="sortable">
                Encargado
                <span class="sort-icon">{{ getSortIcon('nombreEncargado') }}</span>
              </th>
              <th>RTN</th>
              <th>Teléfonos</th>
              <th @click="ordenarPor('vendedorAsignado')" class="sortable">
                Vendedor Asignado
                <span class="sort-icon">{{ getSortIcon('vendedorAsignado') }}</span>
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesPaginados" :key="cliente.id">
              <td>
                <span class="cliente-id">#{{ String(cliente.id).padStart(4, '0') }}</span>
              </td>
              <td>
                <div class="empresa-info">
                  <span class="empresa-nombre">{{ cliente.nombreEmpresa }}</span>
                  <span class="empresa-correo" v-if="cliente.correoEmpresa">{{ cliente.correoEmpresa }}</span>
                </div>
              </td>
              <td>
                <div class="encargado-info">
                  <span class="encargado-nombre">{{ cliente.nombreEncargado }}</span>
                  <span class="encargado-correo">{{ cliente.correoPersonal }}</span>
                </div>
              </td>
              <td>
                <span class="rtn">{{ cliente.rtn }}</span>
              </td>
              <td>
                <div class="telefonos-info">
                  <div class="telefono-item">
                    <i class="fas fa-mobile-alt"></i>
                    <span>{{ cliente.telefonoPersonal }}</span>
                  </div>
                  <div class="telefono-item" v-if="cliente.telefonoEmpresa">
                    <i class="fas fa-phone"></i>
                    <span>{{ cliente.telefonoEmpresa }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="vendedor-asignado">{{ cliente.vendedorAsignado }}</span>
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
          v-for="cliente in clientesPaginados" 
          :key="cliente.id"
          class="cliente-card"
        >
          <div class="card-header">
            <div class="card-numero">#{{ String(cliente.id).padStart(4, '0') }}</div>
            <span class="estado-badge" :class="cliente.estado">
              {{ getEstadoTexto(cliente.estado) }}
            </span>
          </div>
          
          <div class="card-content">
            <h3 class="empresa-nombre-card">
              <i class="fas fa-building"></i>
              {{ cliente.nombreEmpresa }}
            </h3>
            <p class="encargado-nombre-card">
              <i class="fas fa-user"></i>
              {{ cliente.nombreEncargado }}
            </p>
            
            <div class="cliente-details">
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-id-card"></i>
                  RTN:
                </span>
                <span class="detail-value rtn-card">{{ cliente.rtn }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-mobile-alt"></i>
                  Tel. Personal:
                </span>
                <span class="detail-value">{{ cliente.telefonoPersonal }}</span>
              </div>
              
              <div class="detail" v-if="cliente.telefonoEmpresa">
                <span class="detail-label">
                  <i class="fas fa-phone"></i>
                  Tel. Empresa:
                </span>
                <span class="detail-value">{{ cliente.telefonoEmpresa }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-envelope"></i>
                  Email Personal:
                </span>
                <span class="detail-value email-card">{{ cliente.correoPersonal }}</span>
              </div>
              
              <div class="detail" v-if="cliente.correoEmpresa">
                <span class="detail-label">
                  <i class="fas fa-briefcase"></i>
                  Email Empresa:
                </span>
                <span class="detail-value email-card">{{ cliente.correoEmpresa }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-user-tie"></i>
                  Vendedor:
                </span>
                <span class="detail-value vendedor-card">{{ cliente.vendedorAsignado }}</span>
              </div>
              
              <div class="detail">
                <span class="detail-label">
                  <i class="fas fa-calendar-alt"></i>
                  Registro:
                </span>
                <span class="detail-value">{{ formatearFecha(cliente.fechaCreacion) }}</span>
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
    <div v-if="clientesFiltrados.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-building"></i></div>
      <h3 class="empty-title">No hay clientes</h3>
      <p class="empty-description">
        {{ filtros.busqueda || filtros.vendedorAsignado || filtros.estado 
          ? 'No se encontraron clientes con los filtros aplicados.' 
          : 'Aún no se han registrado clientes en el sistema.' }}
      </p>
    </div>

    <!-- Paginación -->
    <div v-if="totalPaginas > 1" class="paginacion-completa">
      <div class="paginacion">
        <button 
          class="btn-pag"
          @click="irAPrimera"
          :disabled="paginaActual === 1"
          title="Primera página"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>

        <button 
          class="btn-pag"
          @click="paginaActual = paginaActual - 1"
          :disabled="paginaActual === 1"
          title="Página anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="paginas">
          <button
            v-if="paginasVisibles[0] > 1"
            class="btn-pag"
            @click="paginaActual = 1"
          >
            1
          </button>
          
          <span v-if="paginasVisibles[0] > 2" class="pagina-separador">...</span>
          
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            class="btn-pag"
            :class="{ active: pagina === paginaActual }"
            @click="paginaActual = pagina"
          >
            {{ pagina }}
          </button>
          
          <span v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1" class="pagina-separador">...</span>
          
          <button
            v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas"
            class="btn-pag"
            @click="paginaActual = totalPaginas"
          >
            {{ totalPaginas }}
          </button>
        </div>
        
        <button 
          class="btn-pag"
          @click="paginaActual = paginaActual + 1"
          :disabled="paginaActual === totalPaginas"
          title="Página siguiente"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <button 
          class="btn-pag"
          @click="irAUltima"
          :disabled="paginaActual === totalPaginas"
          title="Última página"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <div class="paginacion-info-bottom">
        <span class="pagina-actual">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa -->
  <div v-if="modalCliente" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Cliente #{{ String(modalCliente.id).padStart(4, '0') }} - {{ modalCliente.nombreEmpresa }}</h3>
        <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="cliente-detalle">
          <div class="detalle-grid">
            <div class="detalle-item">
              <strong><i class="fas fa-building"></i> Empresa:</strong> {{ modalCliente.nombreEmpresa }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-id-card"></i> RTN:</strong> {{ modalCliente.rtn }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-user"></i> Encargado:</strong> {{ modalCliente.nombreEncargado }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-mobile-alt"></i> Teléfono Personal:</strong> {{ modalCliente.telefonoPersonal }}
            </div>
            <div class="detalle-item" v-if="modalCliente.telefonoEmpresa">
              <strong><i class="fas fa-phone"></i> Teléfono Empresa:</strong> {{ modalCliente.telefonoEmpresa }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-envelope"></i> Correo Personal:</strong> {{ modalCliente.correoPersonal }}
            </div>
            <div class="detalle-item" v-if="modalCliente.correoEmpresa">
              <strong><i class="fas fa-briefcase"></i> Correo Empresa:</strong> {{ modalCliente.correoEmpresa }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-user-tie"></i> Vendedor Asignado:</strong> {{ modalCliente.vendedorAsignado }}
            </div>
            <div class="detalle-item">
              <strong><i class="fas fa-calendar-alt"></i> Fecha de Registro:</strong> {{ formatearFecha(modalCliente.fechaCreacion) }}
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
          <i class="fas fa-edit"></i> Editar Cliente
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
                  <label for="nombreEmpresa">Nombre de la Empresa *</label>
                  <input 
                    id="nombreEmpresa"
                    v-model="formulario.nombreEmpresa" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Empresa S.A. de C.V."
                  >
                </div>
                
                <div class="form-group">
                  <label for="rtn">RTN *</label>
                  <input 
                    id="rtn"
                    v-model="formulario.rtn" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="08011989123456"
                    maxlength="14"
                  >
                </div>
                
                <div class="form-group">
                  <label for="telefonoEmpresa">Teléfono Empresa</label>
                  <input 
                    id="telefonoEmpresa"
                    v-model="formulario.telefonoEmpresa" 
                    type="tel" 
                    class="form-input"
                    placeholder="+504 0000-0000"
                  >
                </div>
                
                <div class="form-group">
                  <label for="correoEmpresa">Correo Empresa</label>
                  <input 
                    id="correoEmpresa"
                    v-model="formulario.correoEmpresa" 
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
                  <label for="nombreEncargado">Nombre del Encargado *</label>
                  <input 
                    id="nombreEncargado"
                    v-model="formulario.nombreEncargado" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Juan Carlos Pérez"
                  >
                </div>
                
                <div class="form-group">
                  <label for="telefonoPersonal">Teléfono Personal *</label>
                  <input 
                    id="telefonoPersonal"
                    v-model="formulario.telefonoPersonal" 
                    type="tel" 
                    required 
                    class="form-input"
                    placeholder="+504 0000-0000"
                  >
                </div>
                
                <div class="form-group">
                  <label for="correoPersonal">Correo Personal *</label>
                  <input 
                    id="correoPersonal"
                    v-model="formulario.correoPersonal" 
                    type="email" 
                    required 
                    class="form-input"
                    placeholder="juan.perez@email.com"
                  >
                </div>
                
                <div class="form-group">
                  <label for="vendedorAsignado">Vendedor Asignado *</label>
                  <select id="vendedorAsignado" v-model="formulario.vendedorAsignado" required class="form-select">
                    <option value="">Seleccione un vendedor</option>
                    <option v-for="vendedor in vendedoresDisponibles" :key="vendedor.id" :value="vendedor.nombre">
                      {{ vendedor.nombre }}
                    </option>
                  </select>
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
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" @click="cerrarModalFormulario">Cancelar</button>
        <button type="button" class="btn btn-primary" @click="guardarCliente">
          <i class="fas fa-save"></i> {{ clienteEditando ? 'Actualizar' : 'Crear' }} Cliente
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
              <h4>{{ clienteParaCambiarEstado.nombreEmpresa }}</h4>
              <p class="cliente-encargado">{{ clienteParaCambiarEstado.nombreEncargado }}</p>
              <span class="cliente-id">#{{ String(clienteParaCambiarEstado.id).padStart(4, '0') }}</span>
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
        >
          <i :class="clienteParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
          {{ clienteParaCambiarEstado.estado === 'activo' ? 'Desactivar' : 'Activar' }} Cliente
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
name: 'AdminClientes',
data() {
  return {
    vistaActual: 'tabla',
    modalCliente: null,
    modalFormulario: false,
    modalCambiarEstado: false,
    clienteEditando: null,
    clienteParaCambiarEstado: null,
    paginaActual: 1,
    itemsPorPagina: 25,
    paginaSalto: 1,
    ordenActual: { campo: 'id', direccion: 'desc' },
    
    filtros: {
      busqueda: '',
      vendedorAsignado: '',
      estado: ''
    },
    
    formulario: {
      nombreEmpresa: '',
      rtn: '',
      telefonoEmpresa: '',
      correoEmpresa: '',
      nombreEncargado: '',
      telefonoPersonal: '',
      correoPersonal: '',
      vendedorAsignado: '',
      estado: 'activo'
    },

    vendedoresDisponibles: [
      { id: 1, nombre: 'Carlos Mendoza' },
      { id: 2, nombre: 'Ana García' },
      { id: 3, nombre: 'Luis Rodríguez' },
      { id: 4, nombre: 'María López' },
      { id: 5, nombre: 'Pedro Sánchez' }
    ],
    
    clientes: [
      {
        id: 1,
        nombreEmpresa: 'Constructora ABC S.A.',
        rtn: '08011989123456',
        telefonoEmpresa: '+504 2234-5678',
        correoEmpresa: 'info@constructoraabc.com',
        nombreEncargado: 'Juan Carlos Pérez',
        telefonoPersonal: '+504 9876-5432',
        correoPersonal: 'juan.perez@gmail.com',
        vendedorAsignado: 'Carlos Mendoza',
        estado: 'activo',
        fechaCreacion: '2024-01-15'
      },
      {
        id: 2,
        nombreEmpresa: 'Comercial XYZ Ltda.',
        rtn: '08011990654321',
        telefonoEmpresa: '+504 2345-6789',
        correoEmpresa: 'ventas@comercialxyz.com',
        nombreEncargado: 'María Fernanda López',
        telefonoPersonal: '+504 8765-4321',
        correoPersonal: 'maria.lopez@hotmail.com',
        vendedorAsignado: 'Ana García',
        estado: 'activo',
        fechaCreacion: '2024-01-20'
      },
      {
        id: 3,
        nombreEmpresa: 'Tecnología DEF',
        rtn: '08011991987654',
        telefonoEmpresa: '',
        correoEmpresa: '',
        nombreEncargado: 'Roberto Martínez',
        telefonoPersonal: '+504 7654-3210',
        correoPersonal: 'roberto.martinez@outlook.com',
        vendedorAsignado: 'Luis Rodríguez',
        estado: 'inactivo',
        fechaCreacion: '2024-02-01'
      },
      {
        id: 4,
        nombreEmpresa: 'Servicios GHI S.A.',
        rtn: '08011992147258',
        telefonoEmpresa: '+504 2456-7890',
        correoEmpresa: 'contacto@serviciosghi.com',
        nombreEncargado: 'Ana Sofía Rodríguez',
        telefonoPersonal: '+504 6543-2109',
        correoPersonal: 'ana.rodriguez@gmail.com',
        vendedorAsignado: 'María López',
        estado: 'activo',
        fechaCreacion: '2024-02-10'
      },
      {
        id: 5,
        nombreEmpresa: 'Industrias JKL',
        rtn: '08011993369852',
        telefonoEmpresa: '+504 2567-8901',
        correoEmpresa: 'gerencia@industriasjkl.com',
        nombreEncargado: 'Carlos Eduardo Sánchez',
        telefonoPersonal: '+504 5432-1098',
        correoPersonal: 'carlos.sanchez@yahoo.com',
        vendedorAsignado: 'Pedro Sánchez',
        estado: 'activo',
        fechaCreacion: '2024-06-01'
      }
    ]
  }
},
computed: {
  vendedoresUnicos() {
    const vendedores = [...new Set(this.clientes.map(c => c.vendedorAsignado))];
    return vendedores.sort();
  },

  clientesFiltrados() {
    let resultado = [...this.clientes];
    
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(cliente => 
        cliente.nombreEmpresa.toLowerCase().includes(busqueda) ||
        cliente.nombreEncargado.toLowerCase().includes(busqueda) ||
        cliente.rtn.toLowerCase().includes(busqueda) ||
        cliente.telefonoPersonal.toLowerCase().includes(busqueda) ||
        (cliente.telefonoEmpresa && cliente.telefonoEmpresa.toLowerCase().includes(busqueda)) ||
        cliente.correoPersonal.toLowerCase().includes(busqueda) ||
        (cliente.correoEmpresa && cliente.correoEmpresa.toLowerCase().includes(busqueda)) ||
        cliente.vendedorAsignado.toLowerCase().includes(busqueda)
      );
    }
    
    if (this.filtros.vendedorAsignado) {
      resultado = resultado.filter(cliente => 
        cliente.vendedorAsignado === this.filtros.vendedorAsignado
      );
    }

    if (this.filtros.estado) {
      resultado = resultado.filter(cliente => 
        cliente.estado === this.filtros.estado
      );
    }
    
    resultado.sort((a, b) => {
      let valorA = a[this.ordenActual.campo];
      let valorB = b[this.ordenActual.campo];
      
      if (this.ordenActual.campo === 'fechaCreacion') {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      }
      
      if (valorA < valorB) {
        return this.ordenActual.direccion === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.ordenActual.direccion === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return resultado;
  },

  clientesPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.clientesFiltrados.slice(inicio, fin);
  },

  totalPaginas() {
    return Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina);
  },

  paginasVisibles() {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
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
  },

  rangoInicio() {
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  },

  rangoFin() {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.clientesFiltrados.length);
  },

  estadisticas() {
    const fechaActual = new Date();
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    
    return {
      total: this.clientes.length,
      activos: this.clientes.filter(c => c.estado === 'activo').length,
      inactivos: this.clientes.filter(c => c.estado === 'inactivo').length,
      vendedoresConClientes: new Set(this.clientes.map(c => c.vendedorAsignado)).size,
      nuevosEsteMes: this.clientes.filter(c => new Date(c.fechaCreacion) >= inicioMes).length
    };
  }
},
watch: {
  'filtros.busqueda'() {
    this.paginaActual = 1;
  },
  'filtros.vendedorAsignado'() {
    this.paginaActual = 1;
  },
  'filtros.estado'() {
    this.paginaActual = 1;
  },
  paginaActual(newVal) {
    this.paginaSalto = newVal;
  }
},
methods: {
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

  // Nuevo método para mostrar el modal de confirmación
  mostrarModalCambiarEstado(cliente) {
    this.clienteParaCambiarEstado = cliente;
    this.modalCambiarEstado = true;
  },

  // Nuevo método para confirmar el cambio de estado
  confirmarCambiarEstado() {
    if (this.clienteParaCambiarEstado) {
      const estadoAnterior = this.clienteParaCambiarEstado.estado;
      const nuevoEstado = estadoAnterior === 'activo' ? 'inactivo' : 'activo';
      
      // Cambiar el estado
      this.clienteParaCambiarEstado.estado = nuevoEstado;
      
      // Mostrar mensaje de éxito
      const accion = nuevoEstado === 'activo' ? 'activado' : 'desactivado';
      alert(`Cliente ${accion} exitosamente`);
      
      // Cerrar modal
      this.cerrarModalCambiarEstado();
    }
  },

  // Nuevo método para cerrar el modal de confirmación
  cerrarModalCambiarEstado() {
    this.modalCambiarEstado = false;
    this.clienteParaCambiarEstado = null;
  },

  guardarCliente() {
    if (!this.formulario.nombreEmpresa || !this.formulario.rtn || !this.formulario.nombreEncargado || 
        !this.formulario.telefonoPersonal || !this.formulario.correoPersonal || !this.formulario.vendedorAsignado) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    const rtnExiste = this.clientes.some(c => 
      c.rtn === this.formulario.rtn && (!this.clienteEditando || c.id !== this.clienteEditando.id)
    );
    
    if (rtnExiste) {
      alert('Ya existe un cliente con ese RTN');
      return;
    }
    
    const correoExiste = this.clientes.some(c => 
      c.correoPersonal === this.formulario.correoPersonal && (!this.clienteEditando || c.id !== this.clienteEditando.id)
    );
    
    if (correoExiste) {
      alert('Ya existe un cliente con ese correo personal');
      return;
    }
    
    if (this.clienteEditando) {
      Object.assign(this.clienteEditando, {
        nombreEmpresa: this.formulario.nombreEmpresa,
        rtn: this.formulario.rtn,
        telefonoEmpresa: this.formulario.telefonoEmpresa,
        correoEmpresa: this.formulario.correoEmpresa,
        nombreEncargado: this.formulario.nombreEncargado,
        telefonoPersonal: this.formulario.telefonoPersonal,
        correoPersonal: this.formulario.correoPersonal,
        vendedorAsignado: this.formulario.vendedorAsignado,
        estado: this.formulario.estado
      });
      alert('Cliente actualizado exitosamente');
    } else {
      const nuevoCliente = {
        id: Math.max(...this.clientes.map(c => c.id)) + 1,
        nombreEmpresa: this.formulario.nombreEmpresa,
        rtn: this.formulario.rtn,
        telefonoEmpresa: this.formulario.telefonoEmpresa,
        correoEmpresa: this.formulario.correoEmpresa,
        nombreEncargado: this.formulario.nombreEncargado,
        telefonoPersonal: this.formulario.telefonoPersonal,
        correoPersonal: this.formulario.correoPersonal,
        vendedorAsignado: this.formulario.vendedorAsignado,
        estado: 'activo',
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      this.clientes.push(nuevoCliente);
      alert('Cliente creado exitosamente');
    }
    
    this.cerrarModalFormulario();
  },

  llenarFormulario(cliente) {
    this.formulario = {
      nombreEmpresa: cliente.nombreEmpresa,
      rtn: cliente.rtn,
      telefonoEmpresa: cliente.telefonoEmpresa,
      correoEmpresa: cliente.correoEmpresa,
      nombreEncargado: cliente.nombreEncargado,
      telefonoPersonal: cliente.telefonoPersonal,
      correoPersonal: cliente.correoPersonal,
      vendedorAsignado: cliente.vendedorAsignado,
      estado: cliente.estado
    };
  },

  limpiarFormulario() {
    this.formulario = {
      nombreEmpresa: '',
      rtn: '',
      telefonoEmpresa: '',
      correoEmpresa: '',
      nombreEncargado: '',
      telefonoPersonal: '',
      correoPersonal: '',
      vendedorAsignado: '',
      estado: 'activo'
    };
  },

  ordenarPor(campo) {
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual = { campo, direccion: 'asc' };
    }
  },

  getSortIcon(campo) {
    if (this.ordenActual.campo !== campo) return '↕';
    return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
  },

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      vendedorAsignado: '',
      estado: ''
    };
    this.paginaActual = 1;
    this.paginaSalto = 1;
  },

  cerrarModal() {
    this.modalCliente = null;
  },

  cerrarModalFormulario() {
    this.modalFormulario = false;
    this.clienteEditando = null;
    this.limpiarFormulario();
  },

  cambiarItemsPorPagina() {
    this.paginaActual = 1;
    this.paginaSalto = 1;
  },

  irAPrimera() {
    this.paginaActual = 1;
  },

  irAUltima() {
    this.paginaActual = this.totalPaginas;
  },

  irAPagina() {
    if (this.paginaSalto >= 1 && this.paginaSalto <= this.totalPaginas) {
      this.paginaActual = this.paginaSalto;
    } else {
      alert(`Por favor ingresa un número entre 1 y ${this.totalPaginas}`);
      this.paginaSalto = this.paginaActual;
    }
  },

  formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  getEstadoTexto(estado) {
    const estados = {
      activo: 'Activo',
      inactivo: 'Inactivo'
    };
    return estados[estado] || estado;
  }
}
}
</script>

<style scoped>
/* Estilos existentes... */
.admin-clientes-container {
 padding: 2rem;
 max-width: 1400px;
 margin: 0 auto;
}

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

.btn-primary {
 background: linear-gradient(135deg, #3498db, #2980b9);
 color: white;
}

.btn-primary:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
 background: #95a5a6;
 color: white;
}

.btn-secondary:hover {
 background: #7f8c8d;
}

.btn-outline {
 background: transparent;
 color: #3498db;
 border: 2px solid #3498db;
}

.btn-outline:hover {
 background: #3498db;
 color: white;
}

.btn-danger {
 background: #e74c3c;
 color: white;
}

.btn-danger:hover {
 background: #c0392b;
}

.btn-success {
 background: #27ae60;
 color: white;
}

.btn-success:hover {
 background: #219a52;
}

.btn-sm {
 padding: 0.5rem 1rem;
 font-size: 0.85rem;
}

/* Estilos específicos para el modal de confirmación */
.modal-confirmacion {
 max-width: 600px;
}

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

/* Resto de estilos existentes... */
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

.acciones {
 display: flex;
 gap: 0.5rem;
 flex-wrap: wrap;
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
}

.modal-content {
 background: white;
 border-radius: 12px;
 max-width: 800px;
 width: 100%;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-formulario {
 max-width: 900px;
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
}
</style>