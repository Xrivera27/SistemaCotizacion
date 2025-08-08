<template>
<div class="admin-servicios-container">
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
     <h1 class="page-title">Gestión de Servicios</h1>
     <p class="page-subtitle">Administración y control de todos los servicios del sistema</p>
   </div>
   <div class="header-actions">
     <button class="btn btn-primary" @click="nuevoServicio">
       <i class="fas fa-plus btn-icon"></i>
       Nuevo Servicio
     </button>
     <button class="btn btn-secondary" @click="cargarServicios">
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
         placeholder="Buscar por nombre o descripción..."
         class="search-input"
         @input="buscarServicios"
       />
     </div>
     
     <div class="filtros-grid">
       <!-- Selector múltiple de categorías -->
       <div class="filtro-categorias">
         <label>Filtrar por categorías:</label>
         <div class="categorias-multi-select">
           <div class="selected-categories" @click="toggleCategoriasDropdown">
             <span v-if="filtros.categoriasSeleccionadas.length === 0" class="placeholder">
               Todas las categorías
             </span>
             <span v-else class="categories-text">
               {{ formatCategoriasSeleccionadas() }}
             </span>
             <i class="fas fa-chevron-down"></i>
           </div>
           
           <div v-if="showCategoriasDropdown" class="categorias-dropdown">
             <div class="categoria-option" @click="limpiarFiltroCategoria">
               <input type="checkbox" :checked="filtros.categoriasSeleccionadas.length === 0">
               <span>Todas las categorías</span>
             </div>
             <div 
               v-for="categoria in categoriasActivas" 
               :key="categoria.categorias_id"
               class="categoria-option"
               @click="toggleCategoriaFiltro(categoria.categorias_id)"
             >
               <input 
                 type="checkbox" 
                 :checked="filtros.categoriasSeleccionadas.includes(categoria.categorias_id)"
               >
               <span>{{ categoria.nombre }}</span>
             </div>
           </div>
         </div>
       </div>

       <select v-model="filtros.rangoPrecio" class="filter-select" @change="aplicarFiltros">
         <option value="">Todos los rangos</option>
         <option value="bajo">Bajo (menos de $500)</option>
         <option value="medio">Medio ($500 - $2,000)</option>
         <option value="alto">Alto (más de $2,000)</option>
       </select>
       
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
       <div class="stat-label">Total Servicios</div>
     </div>
   </div>
   
   <div class="stat-card activos">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.activos }}</div>
       <div class="stat-label">Servicios Activos</div>
     </div>
   </div>

   <div class="stat-card inactivos">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.inactivos }}</div>
       <div class="stat-label">Servicios Inactivos</div>
     </div>
   </div>

   <!-- Estadística de múltiples categorías -->
   <div class="stat-card multiples">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.servicios_con_multiples_categorias || 0 }}</div>
       <div class="stat-label">Con Múltiples Categorías</div>
     </div>
   </div>

   <!-- Estadística de límites -->
   <div class="stat-card limites">
     <div class="stat-content">
       <div class="stat-number">{{ estadisticas.limites?.con_limites || 0 }}</div>
       <div class="stat-label">Con Límites Definidos</div>
     </div>
   </div>
 </div>

 <!-- Servicios section -->
 <div class="servicios-section">
   <div class="section-header">
     <h2 class="section-title">
       {{ pagination ? pagination.totalItems : servicios.length }} Servicios encontrados
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
       de {{ pagination.totalItems }} servicios
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
       <table class="servicios-tabla">
         <thead>
           <tr>
             <th>ID</th>
             <th>Nombre</th>
             <th>Categorías</th>
             <th>Descripción</th>
             <th>Precio Mínimo</th>
             <th>Precio Recomendado</th>
             <th>Límites</th>
             <th>Estado</th>
             <th>Acciones</th>
           </tr>
         </thead>
         <tbody>
           <tr v-for="servicio in servicios" :key="servicio.servicios_id">
             <td>
               <span class="servicio-id">#{{ String(servicio.servicios_id).padStart(4, '0') }}</span>
             </td>
             <td>
               <div class="servicio-info">
                 <span class="servicio-nombre">{{ servicio.nombre }}</span>
               </div>
             </td>
             <td>
               <!-- Mostrar múltiples categorías -->
               <div class="categorias-container">
                 <div class="categoria-principal">
                   <span class="categoria-badge principal">
                     <i class="fas fa-star"></i>
                     {{ obtenerNombreCategoria(servicio.categorias_id) }}
                   </span>
                 </div>
                 
                 <!-- Mostrar categorías adicionales si las hay -->
                 <div v-if="servicio.categorias_completas && servicio.categorias_completas.length > 1" 
                      class="categorias-adicionales">
                   <span 
                     v-for="categoria in servicio.categorias_completas.slice(0, 2)" 
                     :key="categoria.categorias_id"
                     class="categoria-badge adicional"
                     v-show="categoria.categorias_id !== servicio.categorias_id"
                   >
                     {{ categoria.nombre }}
                   </span>
                   
                   <!-- Indicador de más categorías -->
                   <span 
                     v-if="servicio.categorias_completas.length > 3"
                     class="categoria-badge more"
                     :title="`+${servicio.categorias_completas.length - 3} categorías más`"
                   >
                     +{{ servicio.categorias_completas.length - 3 }}
                   </span>
                 </div>
               </div>
             </td>
             <td>
               <div class="descripcion-info">
                 <span class="descripcion-texto">{{ truncarTexto(servicio.descripcion, 80) }}</span>
               </div>
             </td>
             <td>
               <span class="precio minimo">{{ formatearMoneda(servicio.precio_minimo) }}</span>
             </td>
             <td>
               <span class="precio recomendado">{{ formatearMoneda(servicio.precio_recomendado) }}</span>
             </td>
             <!-- Columna de Límites -->
             <td>
               <div class="limites-info">
                 <div v-if="servicio.limite_minimo || servicio.limite_maximo" class="limites-container">
                   <span v-if="servicio.limite_minimo" class="limite-badge minimo">
                     Min: {{ servicio.limite_minimo }}
                   </span>
                   <span v-if="servicio.limite_maximo" class="limite-badge maximo">
                     Max: {{ servicio.limite_maximo }}
                   </span>
                 </div>
                 <span v-else class="sin-limites">Sin límites</span>
               </div>
             </td>
             <td>
               <span class="estado-badge" :class="servicio.estado">
                 {{ getEstadoTexto(servicio.estado) }}
               </span>
             </td>
             <td>
               <div class="acciones">
                 <button 
                   class="btn-accion ver"
                   @click="verServicio(servicio)"
                   title="Ver detalles"
                 >
                   <i class="fas fa-eye"></i>
                 </button>
                 <button 
                   class="btn-accion editar"
                   @click="editarServicio(servicio)"
                   title="Editar servicio"
                 >
                   <i class="fas fa-edit"></i>
                 </button>
                 <button 
                   class="btn-accion" 
                   :class="servicio.estado === 'activo' ? 'deshabilitar' : 'habilitar'"
                   @click="mostrarModalCambiarEstado(servicio)"
                   :title="servicio.estado === 'activo' ? 'Desactivar servicio' : 'Activar servicio'"
                 >
                   <i :class="servicio.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
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
         v-for="servicio in servicios" 
         :key="servicio.servicios_id"
         class="servicio-card"
       >
         <div class="card-header">
           <div class="card-numero">#{{ String(servicio.servicios_id).padStart(4, '0') }}</div>
           <span class="estado-badge" :class="servicio.estado">
             {{ getEstadoTexto(servicio.estado) }}
           </span>
         </div>
         
         <div class="card-content">
           <h3 class="servicio-nombre-card">
             <i class="fas fa-cogs"></i>
             {{ servicio.nombre }}
           </h3>

           <!-- Mostrar múltiples categorías en tarjetas -->
           <div class="categorias-info-card">
             <div class="categoria-principal-card">
               <span class="categoria-badge principal">
                 <i class="fas fa-star"></i>
                 {{ obtenerNombreCategoria(servicio.categorias_id) }}
               </span>
             </div>
             
             <!-- Categorías adicionales -->
             <div v-if="servicio.categorias_completas && servicio.categorias_completas.length > 1" 
                  class="categorias-adicionales-card">
               <div class="categorias-extra">
                 <span 
                   v-for="categoria in getCategoriasAdicionales(servicio)" 
                   :key="categoria.categorias_id"
                   class="categoria-badge adicional"
                 >
                   {{ categoria.nombre }}
                 </span>
               </div>
               <div class="total-categorias">
                 <i class="fas fa-tags"></i>
                 {{ servicio.categorias_completas.length }} categoría{{ servicio.categorias_completas.length > 1 ? 's' : '' }}
               </div>
             </div>
           </div>
           
           <div class="descripcion-card">
             <p>{{ servicio.descripcion }}</p>
           </div>
           
           <div class="precios-card">
             <div class="precio-item">
               <span class="precio-label">
                 <i class="fas fa-tag"></i>
                 Precio Mínimo:
               </span>
               <span class="precio-valor minimo">{{ formatearMoneda(servicio.precio_minimo) }}</span>
             </div>
             
             <div class="precio-item">
               <span class="precio-label">
                 <i class="fas fa-star"></i>
                 Precio Recomendado:
               </span>
               <span class="precio-valor recomendado">{{ formatearMoneda(servicio.precio_recomendado) }}</span>
             </div>

             <!-- Mostrar límites en tarjetas -->
             <div class="precio-item" v-if="servicio.limite_minimo || servicio.limite_maximo">
               <span class="precio-label">
                 <i class="fas fa-ruler"></i>
                 Límites:
               </span>
               <span class="precio-valor limites">{{ formatearLimites(servicio) }}</span>
             </div>
             
             <div class="precio-item">
               <span class="precio-label">
                 <i class="fas fa-calendar-alt"></i>
                 Fecha Creación:
               </span>
               <span class="precio-valor">{{ formatearFecha(servicio.created_at) }}</span>
             </div>
           </div>
         </div>
         
         <div class="card-actions">
           <button class="btn btn-sm btn-outline" @click="verServicio(servicio)">
             <i class="fas fa-eye"></i>
             Ver Detalles
           </button>
           <button class="btn btn-sm btn-primary" @click="editarServicio(servicio)">
             <i class="fas fa-edit"></i> Editar
           </button>
           <button 
             class="btn btn-sm"
             :class="servicio.estado === 'activo' ? 'btn-danger' : 'btn-success'"
             @click="mostrarModalCambiarEstado(servicio)"
           >
             <i :class="servicio.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
             {{ servicio.estado === 'activo' ? 'Desactivar' : 'Activar' }}
           </button>
         </div>
       </div>
     </div>
   </div>

   <!-- Mensaje cuando no hay servicios -->
   <div v-if="servicios.length === 0 && !loading" class="empty-state">
     <div class="empty-icon"><i class="fas fa-cogs"></i></div>
     <h3 class="empty-title">No hay servicios</h3>
     <p class="empty-description">
       {{ filtros.busqueda || filtros.rangoPrecio || filtros.estado || filtros.categoriasSeleccionadas.length > 0
         ? 'No se encontraron servicios con los filtros aplicados.' 
         : 'Aún no se han registrado servicios en el sistema.' }}
     </p>
     <button class="btn btn-primary" @click="nuevoServicio">
       <i class="fas fa-plus"></i>
       Crear Primer Servicio
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
 <div v-if="modalServicio" class="modal-overlay" @click="cerrarModal">
   <div class="modal-content" @click.stop>
     <div class="modal-header">
       <h3>Servicio #{{ String(modalServicio.servicios_id).padStart(4, '0') }} - {{ modalServicio.nombre }}</h3>
       <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
     </div>
     <div class="modal-body">
       <div class="servicio-detalle">
         <div class="detalle-grid">
           <div class="detalle-item">
             <strong><i class="fas fa-cogs"></i> Nombre:</strong> {{ modalServicio.nombre }}
           </div>
           
           <!-- Mostrar todas las categorías -->
           <div class="detalle-item categorias-completas">
             <strong><i class="fas fa-tags"></i> Categorías:</strong> 
             <div class="categorias-detalle">
               <div class="categoria-principal-detalle">
                 <span class="categoria-badge principal">
                   <i class="fas fa-star"></i>
                   {{ obtenerNombreCategoria(modalServicio.categorias_id) }}
                   <small>(Principal)</small>
                 </span>
               </div>
               
               <!-- Mostrar todas las categorías si hay más de una -->
               <div v-if="modalServicio.categorias_completas && modalServicio.categorias_completas.length > 1" 
                    class="categorias-secundarias">
                 <span 
                   v-for="categoria in getCategoriasAdicionales(modalServicio)" 
                   :key="categoria.categorias_id"
                   class="categoria-badge adicional"
                 >
                   {{ categoria.nombre }}
                   <small v-if="categoria.unidad_medida">({{ categoria.unidad_medida.abreviacion }})</small>
                 </span>
               </div>
             </div>
           </div>
           
           <div class="detalle-item descripcion-completa">
             <strong><i class="fas fa-align-left"></i> Descripción:</strong> 
             <span class="descripcion-texto">{{ modalServicio.descripcion }}</span>
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-tag"></i> Precio Mínimo:</strong> {{ formatearMoneda(modalServicio.precio_minimo) }}
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-star"></i> Precio Recomendado:</strong> {{ formatearMoneda(modalServicio.precio_recomendado) }}
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-calculator"></i> Diferencia:</strong> {{ formatearMoneda(modalServicio.precio_recomendado - modalServicio.precio_minimo) }}
           </div>
           
           <!-- Mostrar límites en modal -->
           <div class="detalle-item" v-if="modalServicio.limite_minimo || modalServicio.limite_maximo">
             <strong><i class="fas fa-ruler"></i> Límites de cantidad:</strong> 
             <div class="limites-detalle">
               <span v-if="modalServicio.limite_minimo" class="limite-badge minimo">
                 Mínimo: {{ modalServicio.limite_minimo }}
               </span>
               <span v-if="modalServicio.limite_maximo" class="limite-badge maximo">
                 Máximo: {{ modalServicio.limite_maximo }}
               </span>
             </div>
           </div>
           
           <div class="detalle-item">
             <strong><i class="fas fa-calendar-alt"></i> Fecha de Creación:</strong> {{ formatearFecha(modalServicio.created_at) }}
           </div>
           <div class="detalle-item">
             <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
             <span class="estado-badge" :class="modalServicio.estado">
               {{ getEstadoTexto(modalServicio.estado) }}
             </span>
           </div>
         </div>
       </div>
     </div>
     <div class="modal-footer">
       <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
       <button class="btn btn-primary" @click="editarServicio(modalServicio)">
         Editar Servicio
       </button>
     </div>
   </div>
 </div>

 <!-- Modal de formulario -->
 <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
   <div class="modal-content modal-formulario" @click.stop>
     <div class="modal-header">
       <h3>{{ servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
       <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
     </div>
     <div class="modal-body">
       <form @submit.prevent="guardarServicio" class="formulario-servicio">
         <div class="form-sections">
           <!-- Información Principal -->
           <div class="form-section">
             <h4 class="section-title">
               <i class="fas fa-cogs"></i>
               Información del Servicio
             </h4>
             <div class="form-grid">
               <div class="form-group">
                 <label for="nombre">Nombre del Servicio *</label>
                 <input 
                   id="nombre"
                   v-model="formulario.nombre" 
                   type="text" 
                   required 
                   class="form-input"
                   placeholder="Desarrollo Web, Consultoría, etc."
                 >
               </div>

               <!-- Selector múltiple de categorías -->
               <div class="form-group full-width">
                 <label>Categorías del Servicio *</label>
                 
                 <!-- Categoría Principal -->
                 <div class="categoria-principal-selector">
                   <label for="categoria_principal">Categoría Principal *</label>
                   <select 
                     id="categoria_principal"
                     v-model="formulario.categoriaPrincipal" 
                     required 
                     class="form-select"
                   >
                     <option value="">Selecciona la categoría principal</option>
                     <option 
                       v-for="categoria in categoriasActivas" 
                       :key="categoria.categorias_id" 
                       :value="categoria.categorias_id"
                       :disabled="!formulario.categoriasSeleccionadas.includes(categoria.categorias_id)"
                     >
                       {{ categoria.nombre }}
                     </option>
                   </select>
                 </div>

                 <!-- Selector múltiple de categorías -->
                 <div class="categorias-multi-selector">
                   <label>Todas las Categorías *</label>
                   <div class="categorias-checkboxes">
                     <div 
                       v-for="categoria in categoriasActivas" 
                       :key="categoria.categorias_id"
                       class="categoria-checkbox"
                     >
                       <input 
                         type="checkbox"
                         :id="`cat_${categoria.categorias_id}`"
                         :value="categoria.categorias_id"
                         v-model="formulario.categoriasSeleccionadas"
                         @change="onCategoriaChange"
                       >
                       <label :for="`cat_${categoria.categorias_id}`">
                         {{ categoria.nombre }}
                         <small v-if="categoria.unidad_medida">({{ categoria.unidad_medida.abreviacion }})</small>
                       </label>
                     </div>
                   </div>
                 </div>

                 <!-- Vista previa de categorías seleccionadas -->
                 <div v-if="formulario.categoriasSeleccionadas.length > 0" class="categorias-preview">
                   <label>Categorías Seleccionadas:</label>
                   <div class="categorias-selected">
                     <span 
                       v-for="categoriaId in formulario.categoriasSeleccionadas" 
                       :key="categoriaId"
                       class="categoria-badge"
                       :class="{ principal: categoriaId === formulario.categoriaPrincipal }"
                     >
                       <i v-if="categoriaId === formulario.categoriaPrincipal" class="fas fa-star"></i>
                       {{ obtenerNombreCategoria(categoriaId) }}
                       <button 
                         type="button" 
                         @click="removerCategoria(categoriaId)"
                         class="remove-categoria"
                       >
                         <i class="fas fa-times"></i>
                       </button>
                     </span>
                   </div>
                 </div>
               </div>
               
               <div class="form-group full-width">
                 <label for="descripcion">Descripción *</label>
                 <textarea 
                   id="descripcion"
                   v-model="formulario.descripcion" 
                   required 
                   class="form-textarea"
                   placeholder="Describe detalladamente el servicio que se ofrece..."
                   rows="4"
                 ></textarea>
               </div>
               
               <div class="form-group">
                 <label for="precio_minimo">Precio Mínimo (USD) *</label>
                 <input 
  id="precio_minimo"
  v-model.number="formulario.precio_minimo" 
  type="number" 
  required 
  min="0.0001"
  step="0.0001"
  class="form-input"
  placeholder="0.0000"
>
               </div>
               
               <div class="form-group">
                 <label for="precio_recomendado">Precio Recomendado (USD) *</label>
                 <input 
  id="precio_recomendado"
  v-model.number="formulario.precio_recomendado" 
  type="number" 
  required 
  min="0.0001"
  step="0.0001"
  class="form-input"
  placeholder="0.0000"
>
              </div>

              <!-- Campos de límites -->
              <div class="form-group">
                <label for="limite_minimo">Límite Mínimo</label>
                <input 
  id="limite_minimo"
  v-model.number="formulario.limite_minimo" 
  type="number" 
  min="0.0001"
  step="0.0001"
  class="form-input"
  placeholder="1.0000"
>

                <small class="form-help">Cantidad mínima permitida para este servicio</small>
              </div>
              
              <div class="form-group">
                <label for="limite_maximo">Límite Máximo</label>
                <input 
  id="limite_maximo"
  v-model.number="formulario.limite_maximo" 
  type="number" 
  min="0.0001"
  step="0.0001"
  class="form-input"
  placeholder="Dejar vacío para sin límite"
>
                <small class="form-help">Cantidad máxima permitida (vacío = sin límite)</small>
              </div>
              
              <div class="form-group" v-if="servicioEditando">
                <label for="estado">Estado</label>
                <select id="estado" v-model="formulario.estado" class="form-select">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Validación visual de precios -->
        <div v-if="formulario.precio_minimo && formulario.precio_recomendado" class="precio-validacion">
          <div v-if="formulario.precio_recomendado < formulario.precio_minimo" class="validacion-error">
            <i class="fas fa-exclamation-triangle"></i>
            El precio recomendado debe ser mayor o igual al precio mínimo
          </div>
          <div v-else class="validacion-exito">
            <i class="fas fa-check-circle"></i>
            Diferencia: {{ formatearMoneda(formulario.precio_recomendado - formulario.precio_minimo) }}
          </div>
        </div>

        <!-- Validación visual de límites -->
        <div v-if="formulario.limite_minimo || formulario.limite_maximo" class="limites-validacion">
          <div v-if="formulario.limite_maximo && formulario.limite_minimo && formulario.limite_maximo < formulario.limite_minimo" class="validacion-error">
            <i class="fas fa-exclamation-triangle"></i>
            El límite máximo debe ser mayor o igual al límite mínimo
          </div>
          <div v-else-if="formulario.limite_minimo || formulario.limite_maximo" class="validacion-exito">
            <i class="fas fa-check-circle"></i>
            Límites: {{ formatearLimitesFormulario() }}
          </div>
        </div>

        <!-- Validación de categorías -->
        <div v-if="formulario.categoriasSeleccionadas.length === 0" class="categorias-validacion">
          <div class="validacion-error">
            <i class="fas fa-exclamation-triangle"></i>
            Debe seleccionar al menos una categoría
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
       @click="guardarServicio"
       :disabled="guardandoServicio || formulario.categoriasSeleccionadas.length === 0 || (formulario.limite_maximo && formulario.limite_minimo && formulario.limite_maximo < formulario.limite_minimo)"
     >
       {{ guardandoServicio ? 'Guardando...' : (servicioEditando ? 'Actualizar' : 'Crear') }} Servicio
     </button>
   </div>
 </div>
</div>

<!-- Modal de confirmación para cambiar estado -->
<div v-if="modalCambiarEstado" class="modal-overlay" @click="cerrarModalCambiarEstado">
 <div class="modal-content modal-confirmacion" @click.stop>
   <div class="modal-header">
     <h3>
       <i :class="servicioParaCambiarEstado.estado === 'activo' ? 'fas fa-ban text-danger' : 'fas fa-check text-success'"></i>
       {{ servicioParaCambiarEstado.estado === 'activo' ? 'Desactivar Servicio' : 'Activar Servicio' }}
     </h3>
     <button class="btn-close" @click="cerrarModalCambiarEstado">
       <i class="fas fa-times"></i>
     </button>
   </div>
   
   <div class="modal-body">
     <div class="confirmacion-content">
       <div class="servicio-info-resumen">
         <div class="servicio-avatar">
           <i class="fas fa-cogs"></i>
         </div>
         <div class="servicio-datos">
           <h4>{{ servicioParaCambiarEstado.nombre }}</h4>
           <div class="categoria-info-modal">
             <span class="categoria-badge">
               <i class="fas fa-tag"></i>
               {{ obtenerNombreCategoria(servicioParaCambiarEstado.categorias_id) }}
             </span>
             <!-- Mostrar total de categorías -->
             <span v-if="servicioParaCambiarEstado.categorias_completas && servicioParaCambiarEstado.categorias_completas.length > 1" 
                   class="total-categorias-badge">
               +{{ servicioParaCambiarEstado.categorias_completas.length - 1 }} más
             </span>
             <!-- Mostrar límites si existen -->
             <span v-if="servicioParaCambiarEstado.limite_minimo || servicioParaCambiarEstado.limite_maximo" 
                   class="limites-badge">
               <i class="fas fa-ruler"></i>
               {{ formatearLimites(servicioParaCambiarEstado) }}
             </span>
           </div>
           <p class="servicio-descripcion">{{ truncarTexto(servicioParaCambiarEstado.descripcion, 100) }}</p>
           <div class="servicio-badges">
             <span class="servicio-id">#{{ String(servicioParaCambiarEstado.servicios_id).padStart(4, '0') }}</span>
             <span class="precio-badge">{{ formatearMoneda(servicioParaCambiarEstado.precio_recomendado) }}</span>
           </div>
         </div>
       </div>
       
       <div class="mensaje-confirmacion">
         <div class="icono-estado" :class="servicioParaCambiarEstado.estado === 'activo' ? 'desactivar' : 'activar'">
           <i :class="servicioParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check'"></i>
         </div>
         
         <div class="texto-confirmacion">
           <p class="pregunta-principal">
             ¿Está seguro que desea 
             <strong :class="servicioParaCambiarEstado.estado === 'activo' ? 'text-danger' : 'text-success'">
               {{ servicioParaCambiarEstado.estado === 'activo' ? 'desactivar' : 'activar' }}
             </strong> 
             este servicio?
           </p>
           
           <div class="advertencia-estado" v-if="servicioParaCambiarEstado.estado === 'activo'">
             <i class="fas fa-exclamation-triangle"></i>
             <span>Al desactivar este servicio, no estará disponible para nuevas cotizaciones hasta que sea activado nuevamente.</span>
           </div>
           
           <div class="info-estado" v-else>
             <i class="fas fa-info-circle"></i>
             <span>Al activar este servicio, estará disponible para ser incluido en cotizaciones.</span>
           </div>
         </div>
       </div>
       
       <div class="cambio-estado-visual">
         <div class="estado-actual">
           <span class="label">Estado actual:</span>
           <span class="estado-badge" :class="servicioParaCambiarEstado.estado">
             {{ getEstadoTexto(servicioParaCambiarEstado.estado) }}
           </span>
         </div>
         
         <div class="flecha-cambio">
           <i class="fas fa-arrow-right"></i>
         </div>
         
          <div class="estado-nuevo">
        <span class="label">Nuevo estado:</span>
        <span class="estado-badge" :class="servicioParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo'">
          {{ servicioParaCambiarEstado.estado === 'activo' ? 'Inactivo' : 'Activo' }}
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
      :class="servicioParaCambiarEstado.estado === 'activo' ? 'btn-danger' : 'btn-success'"
      @click="confirmarCambiarEstado"
      :disabled="cambiandoEstado"
    >
      <i :class="cambiandoEstado ? 'fas fa-spinner fa-spin' : (servicioParaCambiarEstado.estado === 'activo' ? 'fas fa-ban' : 'fas fa-check')"></i>
      {{ cambiandoEstado ? 'Procesando...' : (servicioParaCambiarEstado.estado === 'activo' ? 'Desactivar' : 'Activar') }} Servicio
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
import serviciosService from '@/services/serviciosService';
import categoriasService from '@/services/categoriasService';

export default {
name: 'AdminServicios',
data() {
return {
 loading: false,
 loadingMessage: 'Cargando servicios...',
 vistaActual: 'tabla',
 modalServicio: null,
 modalFormulario: false,
 modalCambiarEstado: false,
 servicioEditando: null,
 servicioParaCambiarEstado: null,
 guardandoServicio: false,
 cambiandoEstado: false,
 paginaSalto: 1,
 itemsPorPagina: 25,

 // Estados para múltiples categorías
 showCategoriasDropdown: false,

 // Datos reales del backend
 servicios: [],
 categorias: [],
 pagination: null,
 estadisticas: {
   total: 0,
   activos: 0,
   inactivos: 0,
   precio_promedio: 0,
   servicios_con_multiples_categorias: 0,
   limites: {
     con_limites: 0,
     sin_limites: 0
   }
 },

 // Filtros con múltiples categorías
 filtros: {
   busqueda: '',
   categoriasSeleccionadas: [],
   rangoPrecio: '',
   estado: ''
 },

 // Formulario con múltiples categorías y límites
 formulario: {
   nombre: '',
   categoriasSeleccionadas: [],
   categoriaPrincipal: null,
   descripcion: '',
   precio_minimo: '',
   precio_recomendado: '',
   limite_minimo: '',
   limite_maximo: '',
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
categoriasActivas() {
 return this.categorias.filter(categoria => categoria.estado === 'activo');
},

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

// Cerrar dropdown al hacer clic fuera
mounted() {
document.addEventListener('click', this.handleClickOutside);
this.cargarDatosIniciales();
},

beforeUnmount() {
document.removeEventListener('click', this.handleClickOutside);
if (this.busquedaTimeout) {
 clearTimeout(this.busquedaTimeout);
}
},

methods: {
// ==================== CARGA DE DATOS ====================
async cargarDatosIniciales() {
 this.loading = true;
 this.loadingMessage = 'Cargando datos del sistema...';
 
 try {
   // 1. Cargar categorías PRIMERO
   this.loadingMessage = 'Cargando categorías...';
   await this.cargarCategorias();
   
   // 2. Luego cargar servicios y estadísticas
   this.loadingMessage = 'Cargando servicios...';
   await this.cargarServicios();
   
   this.loadingMessage = 'Cargando estadísticas...';
   await this.cargarEstadisticas();
   
 } catch (error) {
   this.showNotification('Error cargando datos del sistema', 'error');
 } finally {
   this.loading = false;
 }
},

// Cargar servicios con categorías expandidas
async cargarServicios() {
 try {
   const params = {
     page: this.pagination?.currentPage || 1,
     limit: this.itemsPorPagina,
     search: this.filtros.busqueda || undefined,
     categorias_ids: this.filtros.categoriasSeleccionadas.length > 0 ? this.filtros.categoriasSeleccionadas.join(',') : undefined,
     estado: this.filtros.estado || undefined,
     rango_precio: this.filtros.rangoPrecio || undefined
   };
   
   // Usar endpoint con categorías expandidas
   const result = await serviciosService.getServiciosWithExpandedCategories(params);
   
   if (result.success) {
     this.servicios = result.servicios;
     this.pagination = result.pagination;
   } else {
     this.showNotification(result.message || 'Error cargando servicios', 'error');
   }
   
 } catch (error) {
   this.showNotification('Error de conexión al cargar servicios', 'error');
 }
},

async cargarCategorias() {
 try {
   // Intentar el endpoint general primero
   let result = await categoriasService.getCategorias();
   
   // Si no tiene categorías, probar con límite alto
   if (!result.success || !result.categorias || result.categorias.length === 0) {
     result = await categoriasService.getCategorias({ 
       limit: 100,
       page: 1
     });
   }
   
   // Si aún falla, probar getCategoriasActivas
   if (!result.success || !result.categorias || result.categorias.length === 0) {
     result = await categoriasService.getCategoriasActivas();
   }
   
   if (result.success && result.categorias && result.categorias.length > 0) {
     this.categorias = result.categorias;
   } else {
     this.categorias = [];
     this.showNotification('Error cargando categorías', 'error');
   }
   
 } catch (error) {
   this.categorias = [];
   this.showNotification('Error de conexión al cargar categorías', 'error');
 }
},

async cargarEstadisticas() {
 try {
   const result = await serviciosService.getEstadisticas();
   
   if (result.success) {
     this.estadisticas = result.estadisticas;
   }
   
 } catch (error) {
   // Error silencioso para estadísticas
 }
},

// ==================== BÚSQUEDA Y FILTROS ====================
buscarServicios() {
 // Debounce para evitar muchas llamadas
 clearTimeout(this.busquedaTimeout);
 this.busquedaTimeout = setTimeout(() => {
   this.aplicarFiltros();
 }, 500);
},

async aplicarFiltros() {
 // Resetear a la primera página
 if (this.pagination) {
   this.pagination.currentPage = 1;
 }
 
 await this.cargarServicios();
},

limpiarFiltros() {
 this.filtros = {
   busqueda: '',
   categoriasSeleccionadas: [],
   rangoPrecio: '',
   estado: ''
 };
 
 this.aplicarFiltros();
},

// Métodos para filtro de múltiples categorías
toggleCategoriasDropdown() {
 this.showCategoriasDropdown = !this.showCategoriasDropdown;
},

toggleCategoriaFiltro(categoriaId) {
 const index = this.filtros.categoriasSeleccionadas.indexOf(categoriaId);
 if (index > -1) {
   this.filtros.categoriasSeleccionadas.splice(index, 1);
 } else {
   this.filtros.categoriasSeleccionadas.push(categoriaId);
 }
 this.aplicarFiltros();
},

limpiarFiltroCategoria() {
 this.filtros.categoriasSeleccionadas = [];
 this.aplicarFiltros();
},

formatCategoriasSeleccionadas() {
 if (this.filtros.categoriasSeleccionadas.length === 0) {
   return 'Todas las categorías';
 }
 
 if (this.filtros.categoriasSeleccionadas.length === 1) {
   return this.obtenerNombreCategoria(this.filtros.categoriasSeleccionadas[0]);
 }
 
 if (this.filtros.categoriasSeleccionadas.length <= 2) {
   return this.filtros.categoriasSeleccionadas
     .map(id => this.obtenerNombreCategoria(id))
     .join(', ');
 }
 
 return `${this.filtros.categoriasSeleccionadas.length} categorías seleccionadas`;
},

handleClickOutside(event) {
 if (!event.target.closest('.categorias-multi-select')) {
   this.showCategoriasDropdown = false;
 }
},

// ==================== PAGINACIÓN ====================
async cambiarItemsPorPagina() {
 if (this.pagination) {
   this.pagination.currentPage = 1;
 }
 this.paginaSalto = 1;
 await this.cargarServicios();
},

async irAPrimera() {
 if (this.pagination && this.pagination.currentPage !== 1) {
   this.pagination.currentPage = 1;
   await this.cargarServicios();
 }
},

async irAUltima() {
 if (this.pagination && this.pagination.currentPage !== this.pagination.totalPages) {
   this.pagination.currentPage = this.pagination.totalPages;
   await this.cargarServicios();
 }
},

async paginaAnterior() {
 if (this.pagination && this.pagination.hasPrevPage) {
   this.pagination.currentPage--;
   await this.cargarServicios();
 }
},

async paginaSiguiente() {
 if (this.pagination && this.pagination.hasNextPage) {
   this.pagination.currentPage++;
   await this.cargarServicios();
 }
},

async irAPagina(pagina = null) {
 const targetPage = pagina || this.paginaSalto;
 
 if (this.pagination && targetPage >= 1 && targetPage <= this.pagination.totalPages) {
   this.pagination.currentPage = targetPage;
   await this.cargarServicios();
 } else {
   this.showNotification(`Por favor ingresa un número entre 1 y ${this.pagination?.totalPages || 1}`, 'warning');
   this.paginaSalto = this.pagination?.currentPage || 1;
 }
},

// ==================== GESTIÓN DE SERVICIOS ====================
nuevoServicio() {
 this.servicioEditando = null;
 this.limpiarFormulario();
 this.modalFormulario = true;
},

verServicio(servicio) {
 this.modalServicio = servicio;
},

editarServicio(servicio) {
 this.servicioEditando = servicio;
 this.llenarFormulario(servicio);
 this.modalFormulario = true;
 this.modalServicio = null;
},

// Guardar servicio con múltiples categorías y límites
async guardarServicio() {
  if (this.guardandoServicio) return;
  
  this.erroresFormulario = [];
  
  // Validaciones básicas
  if (!this.validarFormulario()) {
    return;
  }
  
  this.guardandoServicio = true;
 this.loadingMessage = this.servicioEditando ? 'Actualizando servicio...' : 'Creando servicio...';
 
 try {
   let result;
   
   if (this.servicioEditando) {
     // Actualizar servicio existente
     result = await serviciosService.updateServicio(this.servicioEditando.servicios_id, this.formulario);
   } else {
     // Crear nuevo servicio
     result = await serviciosService.createServicio(this.formulario);
   }
   
   if (result.success) {
     this.showNotification(
       result.message || (this.servicioEditando ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente'), 
       'success'
     );
     
     this.cerrarModalFormulario();
     
     // Recargar datos
     await Promise.all([
       this.cargarServicios(),
       this.cargarEstadisticas()
     ]);
     
   } else {
     // Manejar errores de validación
     if (result.errors) {
       this.erroresFormulario = result.errors;
     } else {
       this.showNotification(result.message || 'Error al guardar servicio', 'error');
     }
   }
   
 } catch (error) {
   this.showNotification('Error de conexión al guardar servicio', 'error');
 } finally {
   this.guardandoServicio = false;
 }
},

// 🔧 ACTUALIZADO: Validación de formulario - 4 decimales
validarFormulario() {
 const errores = [];
 
 if (!this.formulario.nombre?.trim()) {
   errores.push({ field: 'nombre', message: 'El nombre del servicio es requerido' });
 }
 
 if (this.formulario.nombre && this.formulario.nombre.trim().length < 2) {
   errores.push({ field: 'nombre', message: 'El nombre debe tener al menos 2 caracteres' });
 }
 
 if (this.formulario.nombre && this.formulario.nombre.trim().length > 255) {
   errores.push({ field: 'nombre', message: 'El nombre no puede exceder 255 caracteres' });
 }
 
 // Validar categorías múltiples
 if (!this.formulario.categoriasSeleccionadas || this.formulario.categoriasSeleccionadas.length === 0) {
   errores.push({ field: 'categorias', message: 'Debe seleccionar al menos una categoría' });
 }
 
 if (this.formulario.categoriasSeleccionadas.length > 0 && !this.formulario.categoriaPrincipal) {
   errores.push({ field: 'categoria_principal', message: 'Debe seleccionar una categoría principal' });
 }
 
 if (this.formulario.categoriaPrincipal && !this.formulario.categoriasSeleccionadas.includes(this.formulario.categoriaPrincipal)) {
   errores.push({ field: 'categoria_principal', message: 'La categoría principal debe estar entre las categorías seleccionadas' });
 }
 
 if (!this.formulario.descripcion?.trim()) {
   errores.push({ field: 'descripcion', message: 'La descripción es requerida' });
 }
 
 if (this.formulario.descripcion && this.formulario.descripcion.trim().length > 1000) {
   errores.push({ field: 'descripcion', message: 'La descripción no puede exceder 1000 caracteres' });
 }
 
 // 🔧 ACTUALIZADO: Validación para 4 decimales
 if (!this.formulario.precio_minimo || this.formulario.precio_minimo < 0.0001) {
   errores.push({ field: 'precio_minimo', message: 'El precio mínimo es requerido y debe ser mayor a 0.0001' });
 }
 
 if (!this.formulario.precio_recomendado || this.formulario.precio_recomendado < 0.0001) {
   errores.push({ field: 'precio_recomendado', message: 'El precio recomendado es requerido y debe ser mayor a 0.0001' });
 }
 
 if (this.formulario.precio_recomendado && this.formulario.precio_minimo && 
     this.formulario.precio_recomendado < this.formulario.precio_minimo) {
   errores.push({ field: 'precio_recomendado', message: 'El precio recomendado debe ser mayor o igual al precio mínimo' });
 }

 // Validar límites
 if (this.formulario.limite_minimo && this.formulario.limite_minimo <= 0) {
   errores.push({ field: 'limite_minimo', message: 'El límite mínimo debe ser mayor a 0' });
 }
 
 if (this.formulario.limite_maximo && this.formulario.limite_maximo <= 0) {
   errores.push({ field: 'limite_maximo', message: 'El límite máximo debe ser mayor a 0' });
 }
 
 if (this.formulario.limite_minimo && this.formulario.limite_maximo && 
     this.formulario.limite_maximo < this.formulario.limite_minimo) {
   errores.push({ field: 'limite_maximo', message: 'El límite máximo debe ser mayor o igual al límite mínimo' });
 }
 
 this.erroresFormulario = errores;
 
 if (errores.length > 0) {
   this.showNotification('Por favor corrige los errores en el formulario', 'warning');
   return false;
 }
 
 return true;
},

// Llenar formulario con múltiples categorías y límites
llenarFormulario(servicio) {
 // Obtener categorías del servicio
 let categoriasSeleccionadas = [];
 
 if (servicio.categorias_completas && servicio.categorias_completas.length > 0) {
   categoriasSeleccionadas = servicio.categorias_completas.map(cat => cat.categorias_id);
 } else if (servicio.categorias_ids && Array.isArray(servicio.categorias_ids)) {
   categoriasSeleccionadas = [...servicio.categorias_ids];
 } else if (servicio.categorias_id) {
   categoriasSeleccionadas = [servicio.categorias_id];
 }
 
 this.formulario = {
   nombre: servicio.nombre,
   categoriasSeleccionadas: categoriasSeleccionadas,
   categoriaPrincipal: servicio.categorias_id,
   descripcion: servicio.descripcion || '',
   precio_minimo: servicio.precio_minimo,
   precio_recomendado: servicio.precio_recomendado,
   limite_minimo: servicio.limite_minimo || '',
   limite_maximo: servicio.limite_maximo || '',
   estado: servicio.estado
 };
},

limpiarFormulario() {
 this.formulario = {
   nombre: '',
   categoriasSeleccionadas: [],
   categoriaPrincipal: null,
   descripcion: '',
   precio_minimo: '',
   precio_recomendado: '',
   limite_minimo: '',
   limite_maximo: '',
   estado: 'activo'
 };
 this.erroresFormulario = [];
},

// Métodos para manejar categorías en el formulario
onCategoriaChange() {
 // Si se desmarca la categoría principal, seleccionar otra
 if (this.formulario.categoriaPrincipal && 
     !this.formulario.categoriasSeleccionadas.includes(this.formulario.categoriaPrincipal)) {
   this.formulario.categoriaPrincipal = this.formulario.categoriasSeleccionadas[0] || null;
 }
 
 // Si no hay categoría principal y hay categorías seleccionadas, seleccionar la primera
 if (!this.formulario.categoriaPrincipal && this.formulario.categoriasSeleccionadas.length > 0) {
   this.formulario.categoriaPrincipal = this.formulario.categoriasSeleccionadas[0];
 }
},

removerCategoria(categoriaId) {
 const index = this.formulario.categoriasSeleccionadas.indexOf(categoriaId);
 if (index > -1) {
   this.formulario.categoriasSeleccionadas.splice(index, 1);
   
   // Si se removió la categoría principal, seleccionar otra
   if (this.formulario.categoriaPrincipal === categoriaId) {
     this.formulario.categoriaPrincipal = this.formulario.categoriasSeleccionadas[0] || null;
   }
 }
},

// ==================== CAMBIO DE ESTADO ====================
mostrarModalCambiarEstado(servicio) {
 this.servicioParaCambiarEstado = servicio;
 this.modalCambiarEstado = true;
},

async confirmarCambiarEstado() {
 if (this.cambiandoEstado || !this.servicioParaCambiarEstado) return;
 
 this.cambiandoEstado = true;
 
 try {
   const nuevoEstado = this.servicioParaCambiarEstado.estado === 'activo' ? 'inactivo' : 'activo';
   
   let result;
   if (nuevoEstado === 'activo') {
     result = await serviciosService.restoreServicio(this.servicioParaCambiarEstado.servicios_id);
   } else {
     result = await serviciosService.deleteServicio(this.servicioParaCambiarEstado.servicios_id);
   }
   
   if (result.success) {
     const accion = nuevoEstado === 'activo' ? 'activado' : 'desactivado';
     this.showNotification(`Servicio ${accion} exitosamente`, 'success');
     
     // Actualizar el estado local
     this.servicioParaCambiarEstado.estado = nuevoEstado;
     
     // Recargar datos
     await Promise.all([
       this.cargarServicios(),
       this.cargarEstadisticas()
     ]);
     
   } else {
     this.showNotification(result.message || 'Error al cambiar estado del servicio', 'error');
   }
   
 } catch (error) {
   this.showNotification('Error de conexión al cambiar estado', 'error');
 } finally {
   this.cambiandoEstado = false;
   this.cerrarModalCambiarEstado();
 }
},

cerrarModalCambiarEstado() {
 this.modalCambiarEstado = false;
 this.servicioParaCambiarEstado = null;
},

// ==================== MODALES ====================
cerrarModal() {
 this.modalServicio = null;
},

cerrarModalFormulario() {
 this.modalFormulario = false;
 this.servicioEditando = null;
 this.limpiarFormulario();
},

// ==================== HELPERS ====================
obtenerNombreCategoria(categoriaId) {
 // Convertir a número para asegurar comparación correcta
 const id = parseInt(categoriaId);
 
 const categoria = this.categorias.find(c => parseInt(c.categorias_id) === id);
 
 if (!categoria) {
   return 'Sin categoría';
 }
 
 return categoria.nombre;
},

// Obtener categorías adicionales (excluyendo la principal)
getCategoriasAdicionales(servicio) {
 if (!servicio.categorias_completas || servicio.categorias_completas.length <= 1) {
   return [];
 }
 
 return servicio.categorias_completas.filter(cat => 
   cat.categorias_id !== servicio.categorias_id
 );
},

// Formatear límites para mostrar
formatearLimites(servicio) {
 if (!servicio) return 'Sin límites';
 
 const min = servicio.limite_minimo;
 const max = servicio.limite_maximo;
 
 if (!min && !max) return 'Sin límites';
 
 if (min && max) return `${min} - ${max}`;
 
 if (min) return `Min: ${min}`;
 
 if (max) return `Max: ${max}`;
 
 return 'Sin límites';
},

// Formatear límites del formulario
formatearLimitesFormulario() {
 const min = this.formulario.limite_minimo;
 const max = this.formulario.limite_maximo;
 
 if (!min && !max) return 'Sin límites definidos';
 
 if (min && max) return `${min} - ${max}`;
 
 if (min) return `Mínimo: ${min}`;
 
 if (max) return `Máximo: ${max}`;
 
 return 'Sin límites definidos';
},

formatearFecha(fecha) {
 if (!fecha) return 'No disponible';
 
 try {
   return new Date(fecha).toLocaleDateString('en-US', {
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

// 🔧 ACTUALIZADO: Formatear moneda con soporte para 4 decimales
formatearMoneda(monto) {
  if (monto === null || monto === undefined) return '$0.00';
  
  // Convertir a número para hacer las verificaciones
  const numero = parseFloat(monto);
  
  // Verificar si tiene más de 2 decimales significativos
  const tieneDecimalesExtras = (numero * 10000) % 100 !== 0;
  
  // Si tiene decimales extras (más de 2), mostrar 4 decimales, sino mostrar 2
  const decimales = tieneDecimalesExtras ? 4 : 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: decimales
  }).format(numero);
},

getEstadoTexto(estado) {
 const estados = {
   activo: 'Activo',
   inactivo: 'Inactivo'
 };
 return estados[estado] || estado;
},

truncarTexto(texto, limite = 80) {
 if (!texto) return '';
 if (texto.length <= limite) return texto;
 return texto.substring(0, limite) + '...';
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
}
}
</script>

<style scoped>
.admin-servicios-container {
padding: 2rem;
max-width: 1400px;
margin: 0 auto;
}

.loading-overlay {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(255, 255, 255, 0.9);
display: flex;
align-items: center;
justify-content: center;
z-index: 9999;
}

.loading-spinner {
display: flex;
flex-direction: column;
align-items: center;
gap: 1rem;
padding: 2rem;
background: white;
border-radius: 12px;
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner i {
font-size: 2rem;
color: #3498db;
}

.loading-spinner span {
color: #2c3e50;
font-weight: 500;
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

.btn-primary:disabled {
background: #bdc3c7;
cursor: not-allowed;
transform: none;
box-shadow: none;
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

/* ESTILOS PARA FILTRO DE MÚLTIPLES CATEGORÍAS */
.filtro-categorias {
display: flex;
flex-direction: column;
gap: 0.5rem;
min-width: 250px;
}

.filtro-categorias label {
font-weight: 600;
color: #2c3e50;
font-size: 0.9rem;
}

.categorias-multi-select {
position: relative;
}

.selected-categories {
padding: 0.75rem 1rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
background: white;
cursor: pointer;
display: flex;
justify-content: space-between;
align-items: center;
min-height: 44px;
transition: border-color 0.3s ease;
}

.selected-categories:hover {
border-color: #3498db;
}

.selected-categories .placeholder {
color: #7f8c8d;
}

.categories-text {
flex: 1;
color: #2c3e50;
font-weight: 500;
}

.categorias-dropdown {
position: absolute;
top: 100%;
left: 0;
right: 0;
background: white;
border: 2px solid #e1e8ed;
border-top: none;
border-radius: 0 0 8px 8px;
max-height: 200px;
overflow-y: auto;
z-index: 1000;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.categoria-option {
padding: 0.75rem 1rem;
display: flex;
align-items: center;
gap: 0.5rem;
cursor: pointer;
transition: background-color 0.2s ease;
}

.categoria-option:hover {
background: #f8f9fa;
}

.categoria-option input[type="checkbox"] {
margin: 0;
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
.stat-card.inactivos { border-left: 4px solid #95a5a6; }
.stat-card.multiples { border-left: 4px solid #9b59b6; }
.stat-card.limites { border-left: 4px solid #f39c12; } /* 🆕 NUEVO */

.servicios-section {
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

.servicios-tabla {
width: 100%;
border-collapse: collapse;
margin-bottom: 1rem;
min-width: 1200px; /* 🔧 ACTUALIZADO: Más ancho para límites */
}

.servicios-tabla th {
background: #f8f9fa;
padding: 1rem;
text-align: left;
font-weight: 600;
color: #2c3e50;
border-bottom: 2px solid #e9ecef;
white-space: nowrap;
}

.servicios-tabla td {
padding: 1rem;
border-bottom: 1px solid #e9ecef;
vertical-align: middle;
}

.servicio-id {
font-weight: 600;
color: #3498db;
font-family: monospace;
font-size: 1rem;
}

.servicio-info {
display: flex;
flex-direction: column;
gap: 0.25rem;
}

.servicio-nombre {
font-weight: 500;
color: #2c3e50;
font-size: 1rem;
}

/* ESTILOS PARA MÚLTIPLES CATEGORÍAS EN TABLA */
.categorias-container {
display: flex;
flex-direction: column;
gap: 0.5rem;
max-width: 250px;
}

.categoria-principal {
margin-bottom: 0.25rem;
}

.categorias-adicionales {
display: flex;
flex-wrap: wrap;
gap: 0.25rem;
}

.categoria-badge {
display: inline-flex;
align-items: center;
gap: 0.25rem;
padding: 0.25rem 0.5rem;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 500;
border: 1px solid transparent;
}

.categoria-badge.principal {
background: #e3f2fd;
color: #1976d2;
border-color: #bbdefb;
}

.categoria-badge.adicional {
background: #f3e5f5;
color: #7b1fa2;
border-color: #e1bee7;
}

.categoria-badge.more {
background: #fff3e0;
color: #f57c00;
border-color: #ffcc02;
cursor: help;
}

.categoria-badge i {
font-size: 0.7rem;
}

.descripcion-info {
max-width: 300px;
}

.descripcion-texto {
color: #7f8c8d;
font-size: 0.9rem;
line-height: 1.4;
}

.precio {
font-weight: 600;
font-family: monospace;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.9rem;
}

.precio.minimo {
background: #fff3cd;
color: #856404;
}

.precio.recomendado {
background: #d4edda;
color: #155724;
}

/* 🆕 NUEVOS ESTILOS: Límites en tabla */
.limites-info {
min-width: 120px;
}

.limites-container {
display: flex;
flex-direction: column;
gap: 0.25rem;
}

.limite-badge {
padding: 0.2rem 0.4rem;
border-radius: 8px;
font-size: 0.75rem;
font-weight: 500;
font-family: monospace;
}

.limite-badge.minimo {
background: #e8f5e9;
color: #2e7d32;
border: 1px solid #c8e6c9;
}

.limite-badge.maximo {
background: #fff3e0;
color: #f57c00;
border: 1px solid #ffcc02;
}

.sin-limites {
color: #9e9e9e;
font-style: italic;
font-size: 0.8rem;
}

.tarjetas-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
gap: 1.5rem;
}

.servicio-card {
border: 1px solid #e9ecef;
border-radius: 12px;
padding: 1.5rem;
transition: all 0.3s ease;
background: white;
}

.servicio-card:hover {
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

.servicio-nombre-card {
color: #2c3e50;
margin-bottom: 1rem;
font-size: 1.3rem;
font-weight: 600;
display: flex;
align-items: center;
gap: 0.5rem;
}

/* ESTILOS PARA CATEGORÍAS EN TARJETAS */
.categorias-info-card {
margin-bottom: 1rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border-left: 4px solid #3498db;
}

.categoria-principal-card {
margin-bottom: 0.75rem;
text-align: center;
}

.categorias-adicionales-card {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.categorias-extra {
display: flex;
flex-wrap: wrap;
gap: 0.25rem;
justify-content: center;
}

.total-categorias {
text-align: center;
font-size: 0.8rem;
color: #7f8c8d;
font-weight: 500;
display: flex;
align-items: center;
justify-content: center;
gap: 0.25rem;
}

.descripcion-card {
margin-bottom: 1.5rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border-left: 4px solid #3498db;
}

.descripcion-card p {
margin: 0;
color: #2c3e50;
line-height: 1.5;
}

.precios-card {
display: grid;
gap: 0.75rem;
margin-bottom: 1.5rem;
}

.precio-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.5rem;
background: #f8f9fa;
border-radius: 6px;
}

.precio-label {
color: #7f8c8d;
font-size: 0.85rem;
font-weight: 500;
display: flex;
align-items: center;
gap: 0.5rem;
}

.precio-valor {
font-weight: 600;
font-family: monospace;
}

.precio-valor.minimo {
color: #856404;
}

.precio-valor.recomendado {
color: #155724;
}

/* 🆕 NUEVO: Valor de límites en tarjetas */
.precio-valor.limites {
color: #f57c00;
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
min-width: 80px;
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

/* BOTONES DE ACCIÓN */
.acciones {
display: flex;
gap: 0.5rem;
align-items: center;
justify-content: flex-start;
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
position: relative;
overflow: hidden;
}

.btn-accion:hover {
transform: translateY(-1px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-accion:active {
transform: translateY(0);
}

/* Botón Ver - Azul */
.btn-accion.ver {
background: #e3f2fd;
color: #1976d2;
border: 1px solid #bbdefb;
}

.btn-accion.ver:hover {
background: #bbdefb;
color: #0d47a1;
border-color: #90caf9;
}

/* Botón Editar - Naranja */
.btn-accion.editar {
background: #fff3e0;
color: #f57c00;
border: 1px solid #ffcc02;
}

.btn-accion.editar:hover {
background: #ffe0b2;
color: #e65100;
border-color: #ffb74d;
}

/* Botón Deshabilitar - Rojo */
.btn-accion.deshabilitar {
background: #ffebee;
color: #d32f2f;
border: 1px solid #ffcdd2;
}

.btn-accion.deshabilitar:hover {
background: #ffcdd2;
color: #b71c1c;
border-color: #ef9a9a;
}

/* Botón Habilitar - Verde */
.btn-accion.habilitar {
background: #e8f5e8;
color: #388e3c;
border: 1px solid #c8e6c9;
}

.btn-accion.habilitar:hover {
background: #c8e6c9;
color: #1b5e20;
border-color: #a5d6a7;
}

.btn-accion i {
font-size: 0.9rem;
line-height: 1;
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
max-width: 900px;
width: 100%;
max-height: 90vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-formulario {
max-width: 800px;
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

.servicio-detalle {
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
align-items: flex-start;
padding: 0.75rem;
background: #f8f9fa;
border-radius: 6px;
}

.detalle-item.descripcion-completa,
.detalle-item.categorias-completas {
flex-direction: column;
align-items: flex-start;
gap: 0.5rem;
}

.detalle-item strong {
color: #2c3e50;
font-weight: 600;
display: flex;
align-items: center;
gap: 0.5rem;
}

/* ESTILOS PARA CATEGORÍAS EN MODAL DETALLE */
.categorias-detalle {
display: flex;
flex-direction: column;
gap: 0.75rem;
width: 100%;
}

.categoria-principal-detalle {
display: flex;
justify-content: center;
}

.categoria-principal-detalle .categoria-badge {
font-size: 0.9rem;
padding: 0.5rem 1rem;
}

.categorias-secundarias {
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
justify-content: center;
}

.categorias-secundarias .categoria-badge {
font-size: 0.8rem;
padding: 0.4rem 0.8rem;
}

.categoria-badge small {
margin-left: 0.25rem;
font-size: 0.7em;
opacity: 0.8;
}

/* 🆕 NUEVOS ESTILOS: Límites en modal detalle */
.limites-detalle {
display: flex;
gap: 0.5rem;
flex-wrap: wrap;
}

.limites-detalle .limite-badge {
font-size: 0.8rem;
padding: 0.4rem 0.8rem;
}

.formulario-servicio {
padding: 1rem 0;
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

.form-group.full-width {
grid-column: 1 / -1;
}

.form-group label {
font-weight: 600;
color: #2c3e50;
font-size: 0.9rem;
}

/* 🆕 NUEVO: Estilos para texto de ayuda */
.form-help {
color: #6c757d;
font-size: 0.75rem;
font-style: italic;
margin-top: 0.25rem;
}

.form-input,
.form-select,
.form-textarea {
padding: 0.75rem 1rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 1rem;
transition: border-color 0.3s ease;
font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
outline: none;
border-color: #3498db;
box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-textarea {
resize: vertical;
min-height: 100px;
}

/* ESTILOS PARA FORMULARIO DE MÚLTIPLES CATEGORÍAS */
.categoria-principal-selector {
margin-bottom: 1rem;
}

.categorias-multi-selector {
margin-bottom: 1rem;
}

.categorias-checkboxes {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 0.5rem;
max-height: 200px;
overflow-y: auto;
padding: 1rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
background: #f8f9fa;
}

.categoria-checkbox {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.5rem;
border-radius: 6px;
transition: background-color 0.2s ease;
}

.categoria-checkbox:hover {
background: white;
}

.categoria-checkbox input[type="checkbox"] {
margin: 0;
transform: scale(1.1);
}

.categoria-checkbox label {
margin: 0;
cursor: pointer;
font-size: 0.9rem;
font-weight: 500;
}

.categoria-checkbox label small {
color: #7f8c8d;
font-size: 0.8em;
}

.categorias-preview {
margin-top: 1rem;
}

.categorias-preview label {
display: block;
margin-bottom: 0.5rem;
font-weight: 600;
color: #2c3e50;
}

.categorias-selected {
display: flex;
flex-wrap: wrap;
gap: 0.5rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border: 2px solid #e1e8ed;
}

.categorias-selected .categoria-badge {
position: relative;
padding-right: 2rem;
cursor: default;
}

.categorias-selected .categoria-badge.principal {
background: #e8f5e9;
color: #2e7d32;
border-color: #c8e6c9;
font-weight: 600;
}

.remove-categoria {
position: absolute;
right: 0.25rem;
top: 50%;
transform: translateY(-50%);
background: none;
border: none;
color: inherit;
cursor: pointer;
padding: 0.1rem;
border-radius: 50%;
width: 16px;
height: 16px;
display: flex;
align-items: center;
justify-content: center;
opacity: 0.7;
transition: opacity 0.2s ease;
}

.remove-categoria:hover {
opacity: 1;
background: rgba(0, 0, 0, 0.1);
}

.remove-categoria i {
font-size: 0.6rem;
}

.form-errors {
margin-top: 1rem;
padding: 1rem;
background: #f8d7da;
border: 1px solid #f5c6cb;
border-radius: 8px;
}

.error-item {
display: flex;
align-items: center;
gap: 0.5rem;
color: #721c24;
margin-bottom: 0.5rem;
}

.error-item:last-child {
margin-bottom: 0;
}

.precio-validacion,
.limites-validacion, /* 🆕 NUEVO */
.categorias-validacion {
margin-top: 1rem;
padding: 1rem;
border-radius: 8px;
}

.validacion-error {
background: #f8d7da;
color: #721c24;
border: 1px solid #f5c6cb;
padding: 0.75rem;
border-radius: 6px;
display: flex;
align-items: center;
gap: 0.5rem;
}

.validacion-exito {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
padding: 0.75rem;
border-radius: 6px;
display: flex;
align-items: center;
gap: 0.5rem;
}

/* Estilos específicos para el modal de confirmación de servicios */
.modal-confirmacion {
max-width: 600px;
}

.confirmacion-content {
display: flex;
flex-direction: column;
gap: 2rem;
}

.servicio-info-resumen {
display: flex;
align-items: center;
gap: 1rem;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border-left: 4px solid #3498db;
}

.servicio-avatar {
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

.servicio-datos h4 {
margin: 0 0 0.25rem 0;
color: #2c3e50;
font-size: 1.2rem;
}

.categoria-info-modal {
margin-bottom: 0.5rem;
display: flex;
align-items: center;
gap: 0.5rem;
flex-wrap: wrap;
}

.categoria-info-modal .categoria-badge {
font-size: 0.85rem;
padding: 0.3rem 0.6rem;
}

/* Badge para total de categorías */
.total-categorias-badge {
background: #fff3e0;
color: #f57c00;
border: 1px solid #ffcc02;
padding: 0.2rem 0.5rem;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 500;
}

/* 🆕 NUEVO: Badge para límites */
.limites-badge {
background: #f3e5f5;
color: #7b1fa2;
border: 1px solid #e1bee7;
padding: 0.2rem 0.5rem;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 500;
display: flex;
align-items: center;
gap: 0.25rem;
}

.servicio-descripcion {
margin: 0 0 0.25rem 0;
color: #7f8c8d;
font-size: 0.9rem;
line-height: 1.4;
}

.servicio-badges {
display: flex;
gap: 0.5rem;
align-items: center;
}

.servicio-id {
font-family: monospace;
background: #e3f2fd;
color: #1976d2;
padding: 0.2rem 0.5rem;
border-radius: 4px;
font-size: 0.8rem;
font-weight: 600;
}

.precio-badge {
font-family: monospace;
background: #d4edda;
color: #155724;
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

/* ESTILOS PARA TOAST DE NOTIFICACIONES */
.notification {
position: fixed;
top: 20px;
right: 20px;
min-width: 320px;
max-width: 500px;
padding: 1rem 1.25rem;
border-radius: 12px;
color: white;
font-weight: 500;
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
display: flex;
align-items: center;
gap: 0.75rem;
z-index: 10000;
animation: slideInRight 0.3s ease-out;
transform: translateX(0);
transition: all 0.3s ease;
}

.notification.notification-success {
background: linear-gradient(135deg, #27ae60, #2ecc71);
border-left: 4px solid #1e8449;
}

.notification.notification-error {
background: linear-gradient(135deg, #e74c3c, #c0392b);
border-left: 4px solid #a93226;
}

.notification.notification-warning {
background: linear-gradient(135deg, #f39c12, #e67e22);
border-left: 4px solid #d68910;
}

.notification.notification-info {
background: linear-gradient(135deg, #3498db, #2980b9);
border-left: 4px solid #2471a3;
}

.notification i {
font-size: 1.25rem;
flex-shrink: 0;
}

.notification span {
flex: 1;
line-height: 1.4;
}

.notification-close {
background: none;
border: none;
color: white;
font-size: 1.1rem;
cursor: pointer;
padding: 0.25rem;
border-radius: 50%;
transition: background 0.2s ease;
flex-shrink: 0;
opacity: 0.8;
}

.notification-close:hover {
background: rgba(255, 255, 255, 0.2);
opacity: 1;
}

@keyframes slideInRight {
from {
 transform: translateX(100%);
 opacity: 0;
}
to {
 transform: translateX(0);
 opacity: 1;
}
}

/* Responsive Design */
@media (max-width: 1200px) {
.estadisticas-grid {
 grid-template-columns: repeat(2, 1fr);
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
.admin-servicios-container {
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
 grid-template-columns: 1fr;
}

.filtros-grid {
 flex-direction: column;
 align-items: stretch;
}

.filtro-categorias {
 min-width: auto;
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

.servicios-tabla {
min-width: 1300px; /* 🔧 ACTUALIZADO para incluir límites */
}

.tarjetas-grid {
grid-template-columns: 1fr;
}

.card-actions {
display: flex;
flex-direction: row;
gap: 0.5rem;
flex-wrap: wrap;
}

.card-actions .btn {
flex: 1;
justify-content: center;
min-width: 80px;
}

.detalle-item {
flex-direction: column;
align-items: flex-start;
gap: 0.5rem;
}

.form-grid {
grid-template-columns: 1fr;
}

.categorias-checkboxes {
grid-template-columns: 1fr;
max-height: 150px;
}

.modal-footer {
flex-direction: column;
}

.modal-confirmacion {
max-width: 95%;
margin: 1rem;
}

.servicio-info-resumen {
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

.acciones {
flex-wrap: wrap;
justify-content: center;
}

.btn-accion {
width: 36px;
height: 36px;
margin: 2px;
}

.notification {
left: 10px;
right: 10px;
min-width: auto;
max-width: none;
}

/* Responsive para categorías y límites */
.categorias-container {
max-width: 200px;
}

.categorias-adicionales {
flex-direction: column;
gap: 0.125rem;
}

.categorias-selected {
flex-direction: column;
gap: 0.25rem;
}

.categorias-dropdown {
max-height: 150px;
}

.limites-container {
gap: 0.125rem;
}
}

@media (max-width: 480px) {
.estadisticas-grid {
grid-template-columns: 1fr;
}

.filtros-section,
.servicios-section {
padding: 1rem;
}

.stat-card {
padding: 1rem;
}

.servicio-card {
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
display: flex;
flex-direction: row;
gap: 0.5rem;
flex-wrap: wrap;
}

.card-actions .btn {
flex: 1;
min-width: 70px;
font-size: 0.8rem;
padding: 0.4rem 0.8rem;
}

.modal-confirmacion {
max-width: 100%;
margin: 0.5rem;
}

.servicio-avatar {
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

.btn-accion {
width: 30px;
height: 30px;
font-size: 0.8rem;
}

.acciones {
gap: 0.25rem;
}

.notification {
top: 10px;
left: 10px;
right: 10px;
padding: 0.875rem 1rem;
}

/* Responsive extremo para categorías y límites */
.categorias-container {
max-width: 150px;
}

.categoria-badge {
font-size: 0.65rem;
padding: 0.2rem 0.4rem;
}

.limite-badge {
font-size: 0.65rem;
padding: 0.15rem 0.3rem;
}

.categorias-checkboxes {
max-height: 120px;
}

.categorias-selected {
padding: 0.5rem;
}

.limites-container {
flex-direction: column;
gap: 0.1rem;
}
}
</style>