<template>
 <div class="admin-categorias-container">
   <!-- Header de la página -->
   <div class="page-header">
     <div class="header-content">
       <h1 class="page-title">Gestión de Categorías</h1>
       <p class="page-subtitle">Administración y control de todas las categorías del sistema</p>
     </div>
     <div class="header-actions">
       <button class="btn btn-primary" @click="nuevaCategoria">
         <i class="fas fa-plus btn-icon"></i>
         Nueva Categoría
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
         />
       </div>
       
       <div class="filtros-grid">
         <select v-model="filtros.estado" class="filter-select">
           <option value="">Todos los estados</option>
           <option value="activa">Activas</option>
           <option value="inactiva">Inactivas</option>
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
         <div class="stat-label">Total Categorías</div>
       </div>
     </div>
     
     <div class="stat-card activos">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.activas }}</div>
         <div class="stat-label">Categorías Activas</div>
       </div>
     </div>

     <div class="stat-card inactivos">
       <div class="stat-content">
         <div class="stat-number">{{ estadisticas.inactivas }}</div>
         <div class="stat-label">Categorías Inactivas</div>
       </div>
     </div>
   </div>

   <!-- Categorías section -->
   <div class="categorias-section">
     <div class="section-header">
       <h2 class="section-title">
         {{ categoriasFiltradas.length }} Categorías encontradas
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
         Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ categoriasFiltradas.length }} categorías
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
         <table class="categorias-tabla">
           <thead>
             <tr>
               <th @click="ordenarPor('id')" class="sortable">
                 ID
                 <span class="sort-icon">{{ getSortIcon('id') }}</span>
               </th>
               <th @click="ordenarPor('nombre')" class="sortable">
                 Nombre
                 <span class="sort-icon">{{ getSortIcon('nombre') }}</span>
               </th>
               <th>Descripción</th>
               <th @click="ordenarPor('fechaCreacion')" class="sortable">
                 Fecha Creación
                 <span class="sort-icon">{{ getSortIcon('fechaCreacion') }}</span>
               </th>
               <th>Estado</th>
               <th>Acciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="categoria in categoriasPaginadas" :key="categoria.id">
               <td>
                 <span class="categoria-id">#{{ String(categoria.id).padStart(4, '0') }}</span>
               </td>
               <td>
                 <div class="categoria-info">
                   <span class="categoria-nombre">{{ categoria.nombre }}</span>
                 </div>
               </td>
               <td>
                 <div class="descripcion-info">
                   <span class="descripcion-texto">{{ truncarTexto(categoria.descripcion, 80) }}</span>
                 </div>
               </td>
               <td>
                 <span class="fecha">{{ formatearFecha(categoria.fechaCreacion) }}</span>
               </td>
               <td>
                 <span class="estado-badge" :class="categoria.estado">
                   {{ getEstadoTexto(categoria.estado) }}
                 </span>
               </td>
               <td>
                 <div class="acciones">
                   <button 
                     class="btn-accion ver"
                     @click="verCategoria(categoria)"
                     title="Ver detalles"
                   >
                     <i class="fas fa-eye"></i>
                   </button>
                   <button 
                     class="btn-accion editar"
                     @click="editarCategoria(categoria)"
                     title="Editar categoría"
                   >
                     <i class="fas fa-edit"></i>
                   </button>
                   <button 
                     class="btn-accion" 
                     :class="categoria.estado === 'activa' ? 'deshabilitar' : 'habilitar'"
                     @click="mostrarModalCambiarEstado(categoria)"
                     :title="categoria.estado === 'activa' ? 'Desactivar categoría' : 'Activar categoría'"
                   >
                     <i :class="categoria.estado === 'activa' ? 'fas fa-ban' : 'fas fa-check'"></i>
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
           v-for="categoria in categoriasPaginadas" 
           :key="categoria.id"
           class="categoria-card"
         >
           <div class="card-header">
             <div class="card-numero">#{{ String(categoria.id).padStart(4, '0') }}</div>
             <span class="estado-badge" :class="categoria.estado">
               {{ getEstadoTexto(categoria.estado) }}
             </span>
           </div>
           
           <div class="card-content">
             <h3 class="categoria-nombre-card">
               <i class="fas fa-tags"></i>
               {{ categoria.nombre }}
             </h3>
             
             <div class="descripcion-card">
               <p>{{ categoria.descripcion }}</p>
             </div>
             
             <div class="info-card">
               <div class="info-item">
                 <span class="info-label">
                   <i class="fas fa-calendar-alt"></i>
                   Fecha Creación:
                 </span>
                 <span class="info-valor">{{ formatearFecha(categoria.fechaCreacion) }}</span>
               </div>
             </div>
           </div>
           
           <div class="card-actions">
             <button class="btn btn-sm btn-outline" @click="verCategoria(categoria)">
               <i class="fas fa-eye"></i>
               Ver Detalles
             </button>
             <button class="btn btn-sm btn-primary" @click="editarCategoria(categoria)">
               <i class="fas fa-edit"></i> Editar
             </button>
             <button 
               class="btn btn-sm"
               :class="categoria.estado === 'activa' ? 'btn-danger' : 'btn-success'"
               @click="mostrarModalCambiarEstado(categoria)"
             >
               <i :class="categoria.estado === 'activa' ? 'fas fa-ban' : 'fas fa-check'"></i>
               {{ categoria.estado === 'activa' ? 'Desactivar' : 'Activar' }}
             </button>
           </div>
         </div>
       </div>
     </div>

     <!-- Mensaje cuando no hay categorías -->
     <div v-if="categoriasFiltradas.length === 0" class="empty-state">
       <div class="empty-icon"><i class="fas fa-tags"></i></div>
       <h3 class="empty-title">No hay categorías</h3>
       <p class="empty-description">
         {{ filtros.busqueda || filtros.estado 
           ? 'No se encontraron categorías con los filtros aplicados.' 
           : 'Aún no se han registrado categorías en el sistema.' }}
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
   <div v-if="modalCategoria" class="modal-overlay" @click="cerrarModal">
     <div class="modal-content" @click.stop>
       <div class="modal-header">
         <h3>Categoría #{{ String(modalCategoria.id).padStart(4, '0') }} - {{ modalCategoria.nombre }}</h3>
         <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <div class="categoria-detalle">
           <div class="detalle-grid">
             <div class="detalle-item">
               <strong><i class="fas fa-tags"></i> Nombre:</strong> {{ modalCategoria.nombre }}
             </div>
             <div class="detalle-item descripcion-completa">
               <strong><i class="fas fa-align-left"></i> Descripción:</strong> 
               <span class="descripcion-texto">{{ modalCategoria.descripcion }}</span>
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-calendar-alt"></i> Fecha de Creación:</strong> {{ formatearFecha(modalCategoria.fechaCreacion) }}
             </div>
             <div class="detalle-item">
               <strong><i class="fas fa-info-circle"></i> Estado:</strong> 
               <span class="estado-badge" :class="modalCategoria.estado">
                 {{ getEstadoTexto(modalCategoria.estado) }}
               </span>
             </div>
           </div>
         </div>
       </div>
       <div class="modal-footer">
         <button class="btn btn-outline" @click="cerrarModal">Cerrar</button>
         <button class="btn btn-primary" @click="editarCategoria(modalCategoria)">
           <i class="fas fa-edit"></i> Editar Categoría
         </button>
       </div>
     </div>
   </div>

   <!-- Modal de formulario -->
   <div v-if="modalFormulario" class="modal-overlay" @click="cerrarModalFormulario">
     <div class="modal-content modal-formulario" @click.stop>
       <div class="modal-header">
         <h3>{{ categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
         <button class="btn-close" @click="cerrarModalFormulario"><i class="fas fa-times"></i></button>
       </div>
       <div class="modal-body">
         <form @submit.prevent="guardarCategoria" class="formulario-categoria">
           <div class="form-grid">
             <div class="form-group">
               <label for="nombre">Nombre de la Categoría *</label>
               <input 
                 id="nombre"
                 v-model="formulario.nombre" 
                 type="text" 
                 required 
                 class="form-input"
                 placeholder="Desarrollo, Consultoría, Marketing, etc."
               >
             </div>
             
             <div class="form-group full-width">
               <label for="descripcion">Descripción *</label>
               <textarea 
                 id="descripcion"
                 v-model="formulario.descripcion" 
                 required 
                 class="form-textarea"
                 placeholder="Describe detalladamente el tipo de servicios que incluye esta categoría..."
                 rows="4"
               ></textarea>
             </div>
             
             <div class="form-group" v-if="categoriaEditando">
               <label for="estado">Estado</label>
               <select id="estado" v-model="formulario.estado" class="form-select">
                 <option value="activa">Activa</option>
                 <option value="inactiva">Inactiva</option>
               </select>
             </div>
           </div>
         </form>
       </div>
       <div class="modal-footer">
         <button type="button" class="btn btn-outline" @click="cerrarModalFormulario">Cancelar</button>
         <button type="button" class="btn btn-primary" @click="guardarCategoria" :disabled="!formularioValido">
           <i class="fas fa-save"></i> {{ categoriaEditando ? 'Actualizar' : 'Crear' }} Categoría
         </button>
       </div>
     </div>
   </div>

   <!-- Modal de confirmación para cambiar estado -->
   <div v-if="modalCambiarEstado" class="modal-overlay" @click="cerrarModalCambiarEstado">
     <div class="modal-content modal-confirmacion" @click.stop>
       <div class="modal-header">
         <h3>
           <i :class="categoriaParaCambiarEstado.estado === 'activa' ? 'fas fa-ban text-danger' : 'fas fa-check text-success'"></i>
           {{ categoriaParaCambiarEstado.estado === 'activa' ? 'Desactivar Categoría' : 'Activar Categoría' }}
         </h3>
         <button class="btn-close" @click="cerrarModalCambiarEstado">
           <i class="fas fa-times"></i>
         </button>
       </div>
       
       <div class="modal-body">
         <div class="confirmacion-content">
           <div class="categoria-info-resumen">
             <div class="categoria-avatar">
               <i class="fas fa-tags"></i>
             </div>
             <div class="categoria-datos">
               <h4>{{ categoriaParaCambiarEstado.nombre }}</h4>
               <p class="categoria-descripcion">{{ truncarTexto(categoriaParaCambiarEstado.descripcion, 100) }}</p>
               <div class="categoria-badges">
                 <span class="categoria-id">#{{ String(categoriaParaCambiarEstado.id).padStart(4, '0') }}</span>
               </div>
             </div>
           </div>
           
           <div class="mensaje-confirmacion">
             <div class="icono-estado" :class="categoriaParaCambiarEstado.estado === 'activa' ? 'desactivar' : 'activar'">
               <i :class="categoriaParaCambiarEstado.estado === 'activa' ? 'fas fa-ban' : 'fas fa-check'"></i>
             </div>
             
             <div class="texto-confirmacion">
               <p class="pregunta-principal">
                 ¿Está seguro que desea 
                 <strong :class="categoriaParaCambiarEstado.estado === 'activa' ? 'text-danger' : 'text-success'">
                   {{ categoriaParaCambiarEstado.estado === 'activa' ? 'desactivar' : 'activar' }}
                 </strong> 
                 esta categoría?
               </p>
               
               <div class="advertencia-estado" v-if="categoriaParaCambiarEstado.estado === 'activa'">
                 <i class="fas fa-exclamation-triangle"></i>
                 <span>Al desactivar esta categoría, no estará disponible para ser asignada a nuevos servicios hasta que sea activada nuevamente.</span>
               </div>
               
               <div class="info-estado" v-else>
                 <i class="fas fa-info-circle"></i>
                 <span>Al activar esta categoría, estará disponible para ser asignada a servicios.</span>
               </div>
             </div>
           </div>
           
           <div class="cambio-estado-visual">
             <div class="estado-actual">
               <span class="label">Estado actual:</span>
               <span class="estado-badge" :class="categoriaParaCambiarEstado.estado">
                 {{ getEstadoTexto(categoriaParaCambiarEstado.estado) }}
               </span>
             </div>
             
             <div class="flecha-cambio">
               <i class="fas fa-arrow-right"></i>
             </div>
             
             <div class="estado-nuevo">
               <span class="label">Nuevo estado:</span>
               <span class="estado-badge" :class="categoriaParaCambiarEstado.estado === 'activa' ? 'inactiva' : 'activa'">
                 {{ categoriaParaCambiarEstado.estado === 'activa' ? 'Inactiva' : 'Activa' }}
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
           :class="categoriaParaCambiarEstado.estado === 'activa' ? 'btn-danger' : 'btn-success'"
           @click="confirmarCambiarEstado"
         >
           <i :class="categoriaParaCambiarEstado.estado === 'activa' ? 'fas fa-ban' : 'fas fa-check'"></i>
           {{ categoriaParaCambiarEstado.estado === 'activa' ? 'Desactivar' : 'Activar' }} Categoría
         </button>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
export default {
 name: 'AdminCategorias',
 data() {
   return {
     vistaActual: 'tabla',
     modalCategoria: null,
     modalFormulario: false,
     modalCambiarEstado: false,
     categoriaEditando: null,
     categoriaParaCambiarEstado: null,
     paginaActual: 1,
     itemsPorPagina: 25,
     paginaSalto: 1,
     ordenActual: { campo: 'id', direccion: 'desc' },
     
     filtros: {
       busqueda: '',
       estado: ''
     },
     
     formulario: {
       nombre: '',
       descripcion: '',
       estado: 'activa'
     },
     
     categorias: [
       {
         id: 1,
         nombre: 'Desarrollo Web',
         descripcion: 'Categoría que incluye todos los servicios relacionados con el desarrollo de sitios web, aplicaciones web, e-commerce y plataformas digitales.',
         estado: 'activa',
         fechaCreacion: '2024-01-15'
       },
       {
         id: 2,
         nombre: 'Consultoría Tecnológica',
         descripcion: 'Servicios de asesoría y consultoría en tecnologías de la información, transformación digital y optimización de procesos.',
         estado: 'activa',
         fechaCreacion: '2024-01-20'
       },
       {
         id: 3,
         nombre: 'Marketing Digital',
         descripcion: 'Estrategias y servicios de marketing en línea, incluyendo SEO, SEM, redes sociales, email marketing y análisis de datos.',
         estado: 'activa',
         fechaCreacion: '2024-01-25'
       },
       {
         id: 4,
         nombre: 'Diseño y Creatividad',
         descripcion: 'Servicios de diseño gráfico, diseño web, branding, identidad corporativa y material publicitario.',
         estado: 'activa',
         fechaCreacion: '2024-02-01'
       },
       {
         id: 5,
         nombre: 'Aplicaciones Móviles',
         descripcion: 'Desarrollo de aplicaciones nativas y multiplataforma para dispositivos móviles iOS y Android.',
         estado: 'inactiva',
         fechaCreacion: '2024-02-05'
       },
       {
         id: 6,
         nombre: 'Seguridad Informática',
         descripcion: 'Servicios de auditoría, consultoría en seguridad, implementación de medidas de protección y análisis de vulnerabilidades.',
         estado: 'activa',
         fechaCreacion: '2024-02-10'
       },
       {
         id: 7,
         nombre: 'Capacitación y Formación',
         descripcion: 'Programas de entrenamiento, cursos especializados y capacitación empresarial en tecnologías y herramientas digitales.',
         estado: 'activa',
         fechaCreacion: '2024-02-15'
       }
     ]
   }
 },
 
 computed: {
   categoriasFiltradas() {
     let resultado = [...this.categorias];
     
     if (this.filtros.busqueda) {
       const busqueda = this.filtros.busqueda.toLowerCase();
       resultado = resultado.filter(categoria => 
         categoria.nombre.toLowerCase().includes(busqueda) ||
         categoria.descripcion.toLowerCase().includes(busqueda)
       );
     }

     if (this.filtros.estado) {
       resultado = resultado.filter(categoria => 
         categoria.estado === this.filtros.estado
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
   
   categoriasPaginadas() {
     const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
     const fin = inicio + this.itemsPorPagina;
     return this.categoriasFiltradas.slice(inicio, fin);
   },
   
   totalPaginas() {
     return Math.ceil(this.categoriasFiltradas.length / this.itemsPorPagina);
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
     return Math.min(this.paginaActual * this.itemsPorPagina, this.categoriasFiltradas.length);
   },
   
   estadisticas() {
     return {
       total: this.categorias.length,
       activas: this.categorias.filter(c => c.estado === 'activa').length,
       inactivas: this.categorias.filter(c => c.estado === 'inactiva').length
     };
   },
   
   formularioValido() {
     return this.formulario.nombre.trim() && this.formulario.descripcion.trim();
   }
 },
 
 watch: {
   'filtros.busqueda'() {
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
   nuevaCategoria() {
     this.categoriaEditando = null;
     this.limpiarFormulario();
     this.modalFormulario = true;
   },
   
   verCategoria(categoria) {
     this.modalCategoria = categoria;
   },

   editarCategoria(categoria) {
     this.categoriaEditando = categoria;
     this.llenarFormulario(categoria);
     this.modalFormulario = true;
     this.modalCategoria = null;
   },

   mostrarModalCambiarEstado(categoria) {
     this.categoriaParaCambiarEstado = categoria;
     this.modalCambiarEstado = true;
   },

   confirmarCambiarEstado() {
     if (this.categoriaParaCambiarEstado) {
       const estadoAnterior = this.categoriaParaCambiarEstado.estado;
       const nuevoEstado = estadoAnterior === 'activa' ? 'inactiva' : 'activa';
       
       this.categoriaParaCambiarEstado.estado = nuevoEstado;
       
       const accion = nuevoEstado === 'activa' ? 'activada' : 'desactivada';
       alert(`Categoría ${accion} exitosamente`);
       
       this.cerrarModalCambiarEstado();
     }
   },

   cerrarModalCambiarEstado() {
     this.modalCambiarEstado = false;
     this.categoriaParaCambiarEstado = null;
   },

  guardarCategoria() {
     if (!this.formularioValido) {
       alert('Por favor complete todos los campos correctamente');
       return;
     }
     
     const nombreExiste = this.categorias.some(c => 
       c.nombre.toLowerCase() === this.formulario.nombre.toLowerCase() && 
       (!this.categoriaEditando || c.id !== this.categoriaEditando.id)
     );
     
     if (nombreExiste) {
       alert('Ya existe una categoría con ese nombre');
       return;
     }
     
     if (this.categoriaEditando) {
       Object.assign(this.categoriaEditando, {
         nombre: this.formulario.nombre,
         descripcion: this.formulario.descripcion,
         estado: this.formulario.estado
       });
       alert('Categoría actualizada exitosamente');
     } else {
       const nuevaCategoria = {
         id: Math.max(...this.categorias.map(c => c.id)) + 1,
         nombre: this.formulario.nombre,
         descripcion: this.formulario.descripcion,
         estado: 'activa',
         fechaCreacion: new Date().toISOString().split('T')[0]
       };
       this.categorias.push(nuevaCategoria);
       alert('Categoría creada exitosamente');
     }
     
     this.cerrarModalFormulario();
   },

   llenarFormulario(categoria) {
     this.formulario = {
       nombre: categoria.nombre,
       descripcion: categoria.descripcion,
       estado: categoria.estado
     };
   },

   limpiarFormulario() {
     this.formulario = {
       nombre: '',
       descripcion: '',
       estado: 'activa'
     };
   },

   truncarTexto(texto, limite) {
     if (texto.length <= limite) return texto;
     return texto.substring(0, limite) + '...';
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
       estado: ''
     };
     this.paginaActual = 1;
     this.paginaSalto = 1;
   },

   cerrarModal() {
     this.modalCategoria = null;
   },

   cerrarModalFormulario() {
     this.modalFormulario = false;
     this.categoriaEditando = null;
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
       activa: 'Activa',
       inactiva: 'Inactiva'
     };
     return estados[estado] || estado;
   }
 }
}
</script>

<style scoped>
.admin-categorias-container {
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

.categorias-section {
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

.categorias-tabla {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 1rem;
}

.categorias-tabla th {
 background: #f8f9fa;
 padding: 1rem;
 text-align: left;
 font-weight: 600;
 color: #2c3e50;
 border-bottom: 2px solid #e9ecef;
 white-space: nowrap;
}

.categorias-tabla th.sortable {
 cursor: pointer;
 user-select: none;
}

.categorias-tabla th.sortable:hover {
 background: #e9ecef;
}

.sort-icon {
 margin-left: 0.5rem;
 opacity: 0.5;
}

.categorias-tabla td {
 padding: 1rem;
 border-bottom: 1px solid #e9ecef;
 vertical-align: middle;
}

.categoria-id {
 font-weight: 600;
 color: #3498db;
 font-family: monospace;
 font-size: 1rem;
}

.categoria-info {
 display: flex;
 flex-direction: column;
 gap: 0.25rem;
}

.categoria-nombre {
 font-weight: 500;
 color: #2c3e50;
 font-size: 1rem;
}

.descripcion-info {
 max-width: 300px;
}

.descripcion-texto {
 color: #7f8c8d;
 font-size: 0.9rem;
 line-height: 1.4;
}

.fecha {
 font-weight: 500;
 color: #6c757d;
 font-size: 0.9rem;
}

.tarjetas-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
 gap: 1.5rem;
}

.categoria-card {
 border: 1px solid #e9ecef;
 border-radius: 12px;
 padding: 1.5rem;
 transition: all 0.3s ease;
 background: white;
}

.categoria-card:hover {
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

.categoria-nombre-card {
 color: #2c3e50;
 margin-bottom: 1rem;
 font-size: 1.3rem;
 font-weight: 600;
 display: flex;
 align-items: center;
 gap: 0.5rem;
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

.info-card {
 display: grid;
 gap: 0.75rem;
 margin-bottom: 1.5rem;
}

.info-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 0.5rem;
 background: #f8f9fa;
 border-radius: 6px;
}

.info-label {
 color: #7f8c8d;
 font-size: 0.85rem;
 font-weight: 500;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.info-valor {
 font-weight: 600;
 color: #2c3e50;
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

.estado-badge.activa {
 background: #d4edda;
 color: #155724;
 border: 1px solid #c3e6cb;
}

.estado-badge.inactiva {
 background: #f8d7da;
 color: #721c24;
 border: 1px solid #f5c6cb;
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
 max-width: 700px;
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

.categoria-detalle {
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

.detalle-item.descripcion-completa {
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

.formulario-categoria {
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

/* Estilos específicos para el modal de confirmación */
.confirmacion-content {
 display: flex;
 flex-direction: column;
 gap: 2rem;
}

.categoria-info-resumen {
 display: flex;
 align-items: center;
 gap: 1rem;
 padding: 1rem;
 background: #f8f9fa;
 border-radius: 8px;
 border-left: 4px solid #3498db;
}

.categoria-avatar {
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

.categoria-datos h4 {
 margin: 0 0 0.25rem 0;
 color: #2c3e50;
 font-size: 1.2rem;
}

.categoria-descripcion {
 margin: 0 0 0.25rem 0;
 color: #7f8c8d;
 font-size: 0.9rem;
 line-height: 1.4;
}

.categoria-badges {
 display: flex;
 gap: 0.5rem;
 align-items: center;
}

.categoria-id {
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
 .admin-categorias-container {
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

 .categorias-tabla {
   min-width: 800px;
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

 .modal-footer {
   flex-direction: column;
 }
 
 .modal-confirmacion {
   max-width: 95%;
   margin: 1rem;
 }
 
 .categoria-info-resumen {
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
 .categorias-section {
   padding: 1rem;
 }

 .stat-card {
   padding: 1rem;
 }

 .categoria-card {
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
 
 .categoria-avatar {
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