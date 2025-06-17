<template>
<div class="mis-cotizaciones-container">
  <!-- Header de la página -->
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">Mis Cotizaciones</h1>
      <p class="page-subtitle">Gestiona y da seguimiento a todas tus cotizaciones</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" @click="nuevaCotizacion">
        <i class="fas fa-plus btn-icon"></i>
        Nueva Cotización
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
          placeholder="Buscar por cliente, número de cotización..."
          class="search-input"
        />
      </div>
      
      <div class="filtros-grid">
        <select v-model="filtros.estado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="esperando">Esperando Aprobación</option>
          <option value="pendiente">Pendiente</option>
          <option value="efectivo">Efectivo</option>
          <option value="rechazado">Rechazado</option>
        </select>
        
        <select v-model="filtros.periodo" class="filter-select">
          <option value="">Todo el tiempo</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="trimestre">Este trimestre</option>
        </select>

        <select v-model="itemsPorPagina" class="filter-select" @change="cambiarItemsPorPagina">
          <option value="5">5 por página</option>
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
        <div class="stat-label">Total Cotizaciones</div>
      </div>
    </div>
    
    <div class="stat-card esperando">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.esperandoAprobacion }}</div>
        <div class="stat-label">Esperando Aprobación</div>
      </div>
    </div>
    
    <div class="stat-card pendientes">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.pendientes }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>
    
    <div class="stat-card efectivos">
      <div class="stat-content">
        <div class="stat-number">{{ estadisticas.efectivos }}</div>
        <div class="stat-label">Efectivos</div>
      </div>
    </div>
  </div>

  <!-- Tabla de cotizaciones -->
  <div class="cotizaciones-section">
    <div class="section-header">
      <h2 class="section-title">
        {{ cotizacionesFiltradas.length }} Cotizaciones encontradas
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
        Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ cotizacionesFiltradas.length }} cotizaciones
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
        <table class="cotizaciones-tabla">
          <thead>
            <tr>
              <th @click="ordenarPor('numero')" class="sortable">
                # Cotización
                <span class="sort-icon">{{ getSortIcon('numero') }}</span>
              </th>
              <th @click="ordenarPor('cliente')" class="sortable">
                Cliente
                <span class="sort-icon">{{ getSortIcon('cliente') }}</span>
              </th>
              <th @click="ordenarPor('fecha')" class="sortable">
                Fecha
                <span class="sort-icon">{{ getSortIcon('fecha') }}</span>
              </th>
              <th>Estado</th>
              <th @click="ordenarPor('total')" class="sortable">
                Total
                <span class="sort-icon">{{ getSortIcon('total') }}</span>
              </th>
              <th>PDF</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cotizacion in cotizacionesPaginadas" :key="cotizacion.id">
              <td>
                <span class="numero-cotizacion">{{ cotizacion.numero }}</span>
              </td>
              <td>
                <div class="cliente-info">
                  <span class="cliente-nombre">{{ cotizacion.cliente.nombre }}</span>
                  <span class="cliente-email">{{ cotizacion.cliente.email }}</span>
                </div>
              </td>
              <td>
                <span class="fecha">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
              </td>
              <td>
                <span class="estado-badge" :class="cotizacion.estado">
                  {{ getEstadoTexto(cotizacion.estado) }}
                </span>
              </td>
              <td>
                <span class="monto">{{ formatearMoneda(cotizacion.total) }}</span>
                <div v-if="cotizacion.estado === 'esperando'" class="monto-warning">
                  <small><i class="fas fa-exclamation-triangle"></i> Monto bajo mínimo</small>
                </div>
              </td>
              <td>
                <div class="pdf-status">
                  <span v-if="cotizacion.pdfGenerado" class="pdf-disponible">
                    <i class="fas fa-check-circle"></i> Disponible
                  </span>
                  <span v-else class="pdf-no-disponible">
                    <i class="fas fa-times-circle"></i> No generado
                  </span>
                </div>
              </td>
              <td>
                <div class="acciones">
                  <button 
                    class="btn-accion ver"
                    @click="verCotizacion(cotizacion)"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-accion editar"
                    @click="editarCotizacion(cotizacion)"
                    title="Editar"
                    :disabled="!puedeEditar(cotizacion)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="cotizacion.pdfGenerado"
                    class="btn-accion imprimir"
                    @click="abrirVistaPreviaPDF(cotizacion)"
                    title="Vista previa PDF"
                  >
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button 
                    class="btn-accion duplicar"
                    @click="duplicarCotizacion(cotizacion)"
                    title="Duplicar"
                  >
                    <i class="fas fa-copy"></i>
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
          v-for="cotizacion in cotizacionesPaginadas" 
          :key="cotizacion.id"
          class="cotizacion-card"
        >
          <div class="card-header">
            <div class="card-numero">{{ cotizacion.numero }}</div>
            <span class="estado-badge" :class="cotizacion.estado">
              {{ getEstadoTexto(cotizacion.estado) }}
            </span>
          </div>
          
          <div class="card-content">
            <h3 class="cliente-nombre">{{ cotizacion.cliente.nombre }}</h3>
            <p class="cliente-email">{{ cotizacion.cliente.email }}</p>
            
            <div class="card-details">
              <div class="detail">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">{{ formatearFecha(cotizacion.fechaCreacion) }}</span>
              </div>
              <div class="detail">
                <span class="detail-label">Total:</span>
                <span class="detail-value monto">{{ formatearMoneda(cotizacion.total) }}</span>
              </div>
              <div class="detail">
                <span class="detail-label">PDF:</span>
                <span class="detail-value" :class="cotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                  <i :class="cotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ cotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
                </span>
              </div>
            </div>
            
            <div v-if="cotizacion.estado === 'esperando'" class="card-warning">
              <i class="fas fa-exclamation-triangle"></i> Esta cotización requiere aprobación manual por estar bajo el monto mínimo
            </div>
          </div>
          
          <div class="card-actions">
            <button class="btn btn-sm btn-outline" @click="verCotizacion(cotizacion)">
              Ver
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="editarCotizacion(cotizacion)"
              :disabled="!puedeEditar(cotizacion)"
            >
              Editar
            </button>
            <button 
              v-if="cotizacion.pdfGenerado"
              class="btn btn-sm btn-secondary" 
              @click="abrirVistaPreviaPDF(cotizacion)"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay cotizaciones -->
    <div v-if="cotizacionesFiltradas.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-file-alt"></i></div>
      <h3 class="empty-title">No hay cotizaciones</h3>
      <p class="empty-description">
        {{ filtros.busqueda || filtros.estado || filtros.periodo 
          ? 'No se encontraron cotizaciones con los filtros aplicados.' 
          : 'Aún no has creado ninguna cotización.' }}
      </p>
      <button class="btn btn-primary" @click="nuevaCotizacion">
        Crear Primera Cotización
      </button>
    </div>

    <!-- Paginación mejorada -->
    <div v-if="totalPaginas > 1" class="paginacion-completa">
      <div class="paginacion">
        <!-- Botón Primera página -->
        <button 
          class="btn-pag"
          @click="irAPrimera"
          :disabled="paginaActual === 1"
          title="Primera página"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>

        <!-- Botón Anterior -->
        <button 
          class="btn-pag"
          @click="paginaActual = paginaActual - 1"
          :disabled="paginaActual === 1"
          title="Página anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <!-- Páginas visibles -->
        <div class="paginas">
          <!-- Página 1 si no está en el rango visible -->
          <button
            v-if="paginasVisibles[0] > 1"
            class="btn-pag"
            @click="paginaActual = 1"
          >
            1
          </button>
          
          <!-- Separador si hay salto -->
          <span v-if="paginasVisibles[0] > 2" class="pagina-separador">...</span>
          
          <!-- Páginas del rango visible -->
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            class="btn-pag"
            :class="{ active: pagina === paginaActual }"
            @click="paginaActual = pagina"
          >
            {{ pagina }}
          </button>
          
          <!-- Separador si hay salto al final -->
          <span v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1" class="pagina-separador">...</span>
          
          <!-- Última página si no está en el rango visible -->
          <button
            v-if="paginasVisibles[paginasVisibles.length - 1] < totalPaginas"
            class="btn-pag"
            @click="paginaActual = totalPaginas"
          >
            {{ totalPaginas }}
          </button>
        </div>
        
        <!-- Botón Siguiente -->
        <button 
          class="btn-pag"
          @click="paginaActual = paginaActual + 1"
          :disabled="paginaActual === totalPaginas"
          title="Página siguiente"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Botón Última página -->
        <button 
          class="btn-pag"
          @click="irAUltima"
          :disabled="paginaActual === totalPaginas"
          title="Última página"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Información adicional de paginación -->
      <div class="paginacion-info-bottom">
        <span class="pagina-actual">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa -->
  <div v-if="modalCotizacion" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Cotización {{ modalCotizacion.numero }}</h3>
        <button class="btn-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="cotizacion-detalle">
          <div class="detalle-grid">
            <div class="detalle-item">
              <strong>Cliente:</strong> {{ modalCotizacion.cliente.nombre }}
            </div>
            <div class="detalle-item">
              <strong>Email:</strong> {{ modalCotizacion.cliente.email }}
            </div>
            <div class="detalle-item">
              <strong>Total:</strong> {{ formatearMoneda(modalCotizacion.total) }}
            </div>
            <div class="detalle-item">
              <strong>Estado:</strong> 
              <span class="estado-badge" :class="modalCotizacion.estado">
                {{ getEstadoTexto(modalCotizacion.estado) }}
              </span>
            </div>
            <div class="detalle-item">
              <strong>PDF:</strong> 
              <span :class="modalCotizacion.pdfGenerado ? 'pdf-ok' : 'pdf-no'">
                <i :class="modalCotizacion.pdfGenerado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ modalCotizacion.pdfGenerado ? ' Disponible' : ' No generado' }}
              </span>
            </div>
          </div>
          
          <div v-if="modalCotizacion.estado === 'esperando'" class="modal-warning">
            <h4><i class="fas fa-exclamation-triangle"></i> Requiere Aprobación</h4>
            <p>Esta cotización está bajo el monto mínimo y requiere aprobación manual del supervisor.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de vista previa PDF -->
  <div v-if="modalPDF" class="modal-overlay" @click="cerrarModalPDF">
    <div class="modal-pdf-content" @click.stop>
      <div class="modal-pdf-header">
        <h3>Vista Previa - Cotización {{ pdfCotizacion.numero }}</h3>
        <button class="btn-close" @click="cerrarModalPDF"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-pdf-body">
        <!-- Simulación de vista previa del PDF -->
        <div class="pdf-preview">
          <div class="pdf-header">
            <div class="company-info">
              <h2>Mi Empresa S.A.</h2>
              <p>Dirección de la empresa<br>
              Teléfono: +504 0000-0000<br>
              Email: info@miempresa.com</p>
            </div>
            <div class="cotizacion-info">
              <h3>COTIZACIÓN</h3>
              <p><strong>No:</strong> {{ pdfCotizacion.numero }}</p>
              <p><strong>Fecha:</strong> {{ formatearFecha(pdfCotizacion.fechaCreacion) }}</p>
            </div>
          </div>
          
          <div class="pdf-watermark" v-if="esCopia">
            <span class="watermark-text">COPIA</span>
          </div>
          
          <div class="cliente-section">
            <h4>Cliente:</h4>
            <p><strong>{{ pdfCotizacion.cliente.nombre }}</strong><br>
            {{ pdfCotizacion.cliente.email }}<br>
            {{ pdfCotizacion.cliente.telefono }}</p>
          </div>
          
          <div class="items-section">
            <table class="pdf-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pdfCotizacion.items" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.descripcion }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>{{ formatearMoneda(item.precioUnitario) }}</td>
                  <td>{{ formatearMoneda(item.cantidad * item.precioUnitario) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="total-section">
            <p><strong>Total: {{ formatearMoneda(pdfCotizacion.total) }}</strong></p>
          </div>
        </div>
      </div>
      <div class="modal-pdf-footer">
        <div class="pdf-controls">
          <button 
            class="btn btn-toggle"
            :class="{ 'btn-warning': esCopia, 'btn-success': !esCopia }"
            @click="alternarTipoPDF"
          >
            <i class="fas fa-exchange-alt"></i>
            {{ esCopia ? 'Cambiar a ORIGINAL' : 'Cambiar a COPIA' }}
          </button>
        </div>
        <div class="pdf-actions">
          <button class="btn btn-secondary" @click="cerrarModalPDF">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button class="btn btn-primary" @click="descargarPDF">
            <i class="fas fa-download"></i>
            Descargar {{ esCopia ? 'COPIA' : 'ORIGINAL' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de edición -->
  <div v-if="modalEdicion" class="modal-overlay" @click="cerrarModalEdicion">
    <div class="modal-edicion-content" @click.stop>
      <div class="modal-edicion-header">
        <h3>
          <i class="fas fa-edit"></i>
          Editar Cotización {{ cotizacionEditando.numero }}
        </h3>
        <button class="btn-close" @click="cerrarModalEdicion"><i class="fas fa-times"></i></button>
      </div>
      
      <div class="modal-edicion-body">
        <!-- Información del estado actual -->
        <div class="estado-actual-card" v-if="cotizacionEditando.estado === 'esperando'">
          <div class="warning-content">
            <i class="fas fa-exclamation-triangle warning-icon"></i>
            <div class="warning-text">
              <h4>Cotización bajo mínimo</h4>
              <p>Esta cotización está bajo el precio mínimo y requiere aprobación.</p>
            </div>
          </div>
        </div>

        <!-- Formulario de edición -->
        <div class="formulario-edicion">
          <!-- Información del cliente -->
          <div class="seccion-card">
            <h4 class="seccion-titulo">
              <i class="fas fa-user"></i>
              Información del Cliente
            </h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="cliente-nombre">Nombre del Cliente *</label>
                <input
                  id="cliente-nombre"
                  v-model="formEdicion.cliente.nombre"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="cliente-email">Email *</label>
                <input
                  id="cliente-email"
                  v-model="formEdicion.cliente.email"
                  type="email"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="cliente-telefono">Teléfono</label>
                <input
                  id="cliente-telefono"
                  v-model="formEdicion.cliente.telefono"
                  type="tel"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Items de la cotización -->
          <div class="seccion-card">
            <div class="seccion-header">
              <h4 class="seccion-titulo">
                <i class="fas fa-list"></i>
                Items de la Cotización
              </h4>
              <button class="btn btn-outline btn-sm" @click="agregarItem">
                <i class="fas fa-plus"></i>
                Agregar Item
              </button>
            </div>

            <div class="items-container">
              <div 
                v-for="(item, index) in formEdicion.items" 
                :key="index"
                class="item-card"
              >
                <div class="item-header">
                  <span class="item-numero">Item {{ index + 1 }}</span>
                  <button 
                    class="btn-remove"
                    @click="eliminarItem(index)"
                    :disabled="formEdicion.items.length <= 1"
                    title="Eliminar item"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <div class="item-form">
                  <div class="form-group">
                    <label>Descripción *</label>
                    <input
                      v-model="item.descripcion"
                      type="text"
                      class="form-input"
                      placeholder="Descripción del producto/servicio"
                      required
                    />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>Cantidad *</label>
                      <input
                        v-model.number="item.cantidad"
                        type="number"
                        class="form-input"
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>Precio Unitario *</label>
                      <input
                        v-model.number="item.precioUnitario"
                        type="number"
                        class="form-input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>Subtotal</label>
                      <input
                        :value="formatearMoneda(item.cantidad * item.precioUnitario)"
                        type="text"
                        class="form-input"
                        readonly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales y precios -->
          <div class="seccion-card">
            <h4 class="seccion-titulo">
              <i class="fas fa-calculator"></i>
              Resumen de Precios
            </h4>
            
            <div class="precios-container">
              <div class="precios-grid">
                <!-- Subtotal -->
                <div class="precio-item">
                  <span class="precio-label">Subtotal:</span>
                  <span class="precio-valor">{{ formatearMoneda(subtotalEdicion) }}</span>
                </div>
                
                <!-- Descuento -->
                <div class="precio-item">
                  <span class="precio-label">Descuento (%):</span>
                  <div class="descuento-input">
                    <input
                      v-model.number="formEdicion.descuentoPorcentaje"
                      type="number"
                      class="form-input descuento-field"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span class="descuento-monto">
                      - {{ formatearMoneda(montoDescuentoEdicion) }}
                    </span>
                  </div>
                </div>
                
                <!-- Total -->
                <div class="precio-item total-item">
                  <span class="precio-label">Total:</span>
                  <span class="precio-valor precio-total">{{ formatearMoneda(totalFinalEdicion) }}</span>
                </div>
              </div>

              <!-- Validación de precios -->
              <div class="validacion-precios">
                <div class="precio-minimo-info">
                  <div class="precio-referencia">
                    <span class="label">Precio Mínimo:</span>
                    <span class="valor">{{ formatearMoneda(precioMinimo) }}</span>
                  </div>
                  <div class="precio-referencia">
                    <span class="label">Precio Recomendado:</span>
                    <span class="valor">{{ formatearMoneda(precioRecomendado) }}</span>
                  </div>
                </div>

                <div class="estado-precio" :class="estadoPrecioEdicion.clase">
                  <i :class="estadoPrecioEdicion.icono"></i>
                  <div class="estado-content">
                    <strong>{{ estadoPrecioEdicion.titulo }}</strong>
                    <p>{{ estadoPrecioEdicion.mensaje }}</p>
                    <div v-if="estadoPrecioEdicion.diferencia" class="diferencia-info">
                      <span class="diferencia-label">{{ estadoPrecioEdicion.diferencia.label }}:</span>
                      <span class="diferencia-valor">{{ estadoPrecioEdicion.diferencia.valor }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notas adicionales -->
          <div class="seccion-card">
            <h4 class="seccion-titulo">
              <i class="fas fa-sticky-note"></i>
              Notas Adicionales
            </h4>
            <div class="form-group">
              <label for="notas">Observaciones o comentarios</label>
              <textarea
                id="notas"
                v-model="formEdicion.notas"
                class="form-textarea"
                rows="4"
                placeholder="Agregar notas o comentarios sobre la cotización..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-edicion-footer">
        <button class="btn btn-secondary" @click="cerrarModalEdicion">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button class="btn btn-primary" @click="guardarCambios" :disabled="!formularioValido">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click="cerrarModalConfirmacion">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-exclamation-triangle text-warning"></i>
          Confirmar Cambios
        </h3>
      </div>
      <div class="modal-body">
        <p><strong>¿Estás seguro de que deseas guardar estos cambios?</strong></p>
        
        <div class="cambios-resumen">
          <h4>Resumen de cambios:</h4>
          <ul class="cambios-lista">
            <li v-if="cambiosDetectados.total">
              Total: {{ formatearMoneda(cotizacionEditando.total) }} → {{ formatearMoneda(totalFinalEdicion) }}
              <span :class="diferenciaTotalClase">
                ({{ diferenciaTotalTexto }})
              </span>
            </li>
            <li v-if="cambiosDetectados.cliente">
              Información del cliente modificada
            </li>
            <li v-if="cambiosDetectados.items">
              Items de la cotización modificados
            </li>
            <li v-if="cambiosDetectados.descuento">
              Descuento: {{ cotizacionEditando.descuentoPorcentaje || 0 }}% → {{ formEdicion.descuentoPorcentaje }}%
            </li>
          </ul>
        </div>

        <div v-if="estadoPrecioEdicion.clase === 'bajo-minimo'" class="advertencia-precio">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Advertencia:</strong> El precio final está bajo el mínimo permitido y requerirá aprobación.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cerrarModalConfirmacion">
          Cancelar
        </button>
        <button class="btn btn-primary" @click="confirmarGuardar">
          Confirmar y Guardar
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
name: 'MisCotizaciones',
data() {
  return {
    vistaActual: 'tabla',
    modalCotizacion: null,
    modalPDF: false,
    pdfCotizacion: null,
    esCopia: true,
    modalEdicion: false,
    cotizacionEditando: null,
    mostrarModalConfirmacion: false,
    precioMinimo: 5000, // Configuración del sistema
    precioRecomendado: 15000, // Configuración del sistema
    paginaActual: 1,
    itemsPorPagina: 10,
    paginaSalto: 1,
    ordenActual: { campo: 'fecha', direccion: 'desc' },
    
    filtros: {
      busqueda: '',
      estado: '',
      periodo: ''
    },
    
    // Formulario de edición
    formEdicion: {
      cliente: {
        nombre: '',
        email: '',
        telefono: ''
      },
      items: [],
      descuentoPorcentaje: 0,
      notas: ''
    },
    
    // Datos simulados con más cotizaciones para probar la paginación
    cotizaciones: [
      {
        id: 1,
        numero: 'COT-2024-001',
        cliente: {
          nombre: 'Empresa ABC S.A.',
          email: 'contacto@empresaabc.com',
          telefono: '+504 2234-5678'
        },
        items: [
          {
            id: 1,
            descripcion: 'Producto A',
            cantidad: 2,
            precioUnitario: 1500
          },
          {
            id: 2,
            descripcion: 'Servicio B',
            cantidad: 1,
            precioUnitario: 3000
          }
        ],
        descuentoPorcentaje: 10,
        fechaCreacion: '2024-01-15',
        estado: 'efectivo',
        total: 5400,
        notas: 'Cotización inicial',
        diferenciaPrecioMinimo: 400,
        diferenciaPrecioRecomendado: 9600,
        pdfGenerado: true
      },
      {
        id: 2,
        numero: 'COT-2024-002',
        cliente: {
          nombre: 'Constructora XYZ',
          email: 'info@xyz.com',
          telefono: '+504 2345-6789'
        },
        items: [
          {
            id: 1,
            descripcion: 'Material de construcción',
            cantidad: 10,
            precioUnitario: 3500
          }
        ],
        descuentoPorcentaje: 0,
        fechaCreacion: '2024-01-20',
        estado: 'pendiente',
        total: 35000.00,
        notas: '',
        diferenciaPrecioMinimo: -30000,
        diferenciaPrecioRecomendado: -20000,
        pdfGenerado: true
      },
      {
        id: 3,
        numero: 'COT-2024-003',
        cliente: {
          nombre: 'Comercial DEF',
          email: 'ventas@def.com',
          telefono: '+504 2456-7890'
        },
        items: [
          {
            id: 1,
            descripcion: 'Producto pequeño',
            cantidad: 1,
            precioUnitario: 1500
          }
        ],
        descuentoPorcentaje: 0,
        fechaCreacion: '2024-01-25',
        estado: 'esperando',
        total: 1500.00,
        notas: 'Requiere aprobación por monto bajo',
        diferenciaPrecioMinimo: 3500,
        diferenciaPrecioRecomendado: 13500,
        pdfGenerado: false
      },
      {
        id: 4,
        numero: 'COT-2024-004',
        cliente: {
          nombre: 'Industrias GHI',
          email: 'compras@ghi.com',
          telefono: '+504 2567-8901'
        },
        items: [
          {
            id: 1,
            descripcion: 'Maquinaria industrial',
            cantidad: 1,
            precioUnitario: 45000
          }
        ],
        descuentoPorcentaje: 0,
        fechaCreacion: '2024-02-01',
        estado: 'rechazado',
        total: 45000.00,
        notas: 'Cliente rechazó propuesta',
        diferenciaPrecioMinimo: -40000,
        diferenciaPrecioRecomendado: -30000,
        pdfGenerado: true
      },
      {
        id: 5,
        numero: 'COT-2024-005',
        cliente: {
          nombre: 'Servicios JKL',
          email: 'info@jkl.com',
          telefono: '+504 2678-9012'
        },
        items: [
          {
            id: 1,
            descripcion: 'Servicio básico',
            cantidad: 1,
            precioUnitario: 800
          }
        ],
        descuentoPorcentaje: 0,
        fechaCreacion: '2024-02-05',
        estado: 'esperando',
        total: 800.00,
        notas: 'Monto muy bajo, requiere aprobación',
        diferenciaPrecioMinimo: 4200,
        diferenciaPrecioRecomendado: 14200,
        pdfGenerado: false
      },
      {
        id: 6,
        numero: 'COT-2024-006',
        cliente: {
          nombre: 'Tech Solutions',
          email: 'contacto@techsol.com',
          telefono: '+504 2789-0123'
        },
        items: [
          {
            id: 1,
            descripcion: 'Software personalizado',
            cantidad: 1,
            precioUnitario: 18000
          }
        ],
        descuentoPorcentaje: 0,
        fechaCreacion: '2024-02-10',
        estado: 'pendiente',
        total: 18000.00,
        notas: 'Desarrollo de software a medida',
        diferenciaPrecioMinimo: -13000,
        diferenciaPrecioRecomendado: -3000,
        pdfGenerado: true
      },
      // Agregamos más datos para probar la paginación
      ...Array.from({ length: 50 }, (_, i) => ({
        id: i + 7,
        numero: `COT-2024-${String(i + 7).padStart(3, '0')}`,
        cliente: {
          nombre: `Cliente ${i + 7}`,
          email: `cliente${i + 7}@email.com`,
          telefono: '+504 2000-0000'
        },
        items: [
          {
            id: 1,
            descripcion: `Producto/Servicio ${i + 7}`,
            cantidad: Math.floor(Math.random() * 5) + 1,
            precioUnitario: Math.floor(Math.random() * 10000) + 1000
          }
        ],
        descuentoPorcentaje: Math.floor(Math.random() * 20),
        fechaCreacion: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        estado: ['esperando', 'pendiente', 'efectivo', 'rechazado'][Math.floor(Math.random() * 4)],
        total: Math.floor(Math.random() * 50000) + 1000,
        notas: '',
        diferenciaPrecioMinimo: Math.floor(Math.random() * 20000) - 10000,
        diferenciaPrecioRecomendado: Math.floor(Math.random() * 30000) - 15000,
        pdfGenerado: Math.random() > 0.3
      }))
    ]
  }
},

computed: {
  cotizacionesFiltradas() {
    let resultado = [...this.cotizaciones];
    
    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(cotizacion => 
        cotizacion.numero.toLowerCase().includes(busqueda) ||
        cotizacion.cliente.nombre.toLowerCase().includes(busqueda) ||
        cotizacion.cliente.email.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por estado
    if (this.filtros.estado) {
      resultado = resultado.filter(cotizacion => 
        cotizacion.estado === this.filtros.estado
      );
    }
    
    // Filtro por período
    if (this.filtros.periodo) {
      const hoy = new Date();
      resultado = resultado.filter(cotizacion => {
        const fecha = new Date(cotizacion.fechaCreacion);
        
        if (this.filtros.periodo === 'hoy') {
          return fecha.toDateString() === hoy.toDateString();
        }
        
        if (this.filtros.periodo === 'semana') {
          const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fecha >= semanaAtras;
        }
        
        if (this.filtros.periodo === 'mes') {
          return fecha.getMonth() === hoy.getMonth() && 
                 fecha.getFullYear() === hoy.getFullYear();
        }
        
        if (this.filtros.periodo === 'trimestre') {
          const trimestre = Math.floor(hoy.getMonth() / 3);
          const fechaTrimestre = Math.floor(fecha.getMonth() / 3);
          return fechaTrimestre === trimestre && 
                 fecha.getFullYear() === hoy.getFullYear();
        }
        
        return true;
      });
    }
    
    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA = a[this.ordenActual.campo];
      let valorB = b[this.ordenActual.campo];
      
      if (this.ordenActual.campo === 'cliente') {
        valorA = a.cliente.nombre;
        valorB = b.cliente.nombre;
      }
      
      if (this.ordenActual.campo === 'fecha') {
        valorA = new Date(a.fechaCreacion);
        valorB = new Date(b.fechaCreacion);
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
  
  cotizacionesPaginadas() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.cotizacionesFiltradas.slice(inicio, fin);
  },
  
  totalPaginas() {
    return Math.ceil(this.cotizacionesFiltradas.length / this.itemsPorPagina);
  },
  
  paginasVisibles() {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const rango = 2;
    
    let inicio = Math.max(1, actual - rango);
    let fin = Math.min(total, actual + rango);
    
    // Ajustar para mostrar siempre 5 páginas cuando sea posible
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
    return Math.min(this.paginaActual * this.itemsPorPagina, this.cotizacionesFiltradas.length);
  },
  
  estadisticas() {
    return {
      total: this.cotizaciones.length,
      esperandoAprobacion: this.cotizaciones.filter(c => c.estado === 'esperando').length,
      pendientes: this.cotizaciones.filter(c => c.estado === 'pendiente').length,
      efectivos: this.cotizaciones.filter(c => c.estado === 'efectivo').length,
      rechazados: this.cotizaciones.filter(c => c.estado === 'rechazado').length,
      montoTotal: this.cotizaciones
        .filter(c => c.estado === 'efectivo')
        .reduce((total, c) => total + c.total, 0)
    };
  },

  // Computeds para edición
  subtotalEdicion() {
    return this.formEdicion.items.reduce((total, item) => {
      return total + (item.cantidad * item.precioUnitario);
    }, 0);
  },
  
  montoDescuentoEdicion() {
    return this.subtotalEdicion * (this.formEdicion.descuentoPorcentaje / 100);
  },
  
  totalFinalEdicion() {
    return this.subtotalEdicion - this.montoDescuentoEdicion;
  },
  
  estadoPrecioEdicion() {
    if (this.totalFinalEdicion < this.precioMinimo) {
      const diferencia = this.precioMinimo - this.totalFinalEdicion;
      return {
        clase: 'bajo-minimo',
        icono: 'fas fa-exclamation-triangle',
        titulo: 'Precio bajo mínimo',
        mensaje: 'El precio está por debajo del mínimo permitido. Requerirá aprobación.',
        diferencia: {
          label: 'Diferencia con mínimo',
          valor: `- ${this.formatearMoneda(diferencia)}`
        }
      };
    } else if (this.totalFinalEdicion < this.precioRecomendado) {
      const diferencia = this.precioRecomendado - this.totalFinalEdicion;
      return {
        clase: 'bajo-recomendado',
        icono: 'fas fa-info-circle',
        titulo: 'Precio bajo recomendado',
        mensaje: 'El precio está por debajo del recomendado pero dentro del rango permitido.',
        diferencia: {
          label: 'Diferencia con recomendado',
          valor: `- ${this.formatearMoneda(diferencia)}`
        }
      };
    } else {
      const diferencia = this.totalFinalEdicion - this.precioRecomendado;
      return {
        clase: 'precio-optimo',
        icono: 'fas fa-check-circle',
        titulo: 'Precio óptimo',
        mensaje: 'El precio está en el rango recomendado.',
        diferencia: {
          label: 'Excedente sobre recomendado',
          valor: `+ ${this.formatearMoneda(diferencia)}`
        }
      };
    }
  },
  
  formularioValido() {
    const clienteValido = this.formEdicion.cliente.nombre && this.formEdicion.cliente.email;
    const itemsValidos = this.formEdicion.items.every(item => 
      item.descripcion && item.cantidad > 0 && item.precioUnitario >= 0
    );
    const tieneItems = this.formEdicion.items.length > 0;
    
    return clienteValido && itemsValidos && tieneItems;
  },
  
  cambiosDetectados() {
    if (!this.cotizacionEditando) return {};
    
    const cambios = {
      total: Math.abs(this.totalFinalEdicion - this.cotizacionEditando.total) > 0.01,
      cliente: JSON.stringify(this.formEdicion.cliente) !== JSON.stringify(this.cotizacionEditando.cliente),
      items: JSON.stringify(this.formEdicion.items) !== JSON.stringify(this.cotizacionEditando.items),
      descuento: this.formEdicion.descuentoPorcentaje !== (this.cotizacionEditando.descuentoPorcentaje || 0),
      notas: this.formEdicion.notas !== (this.cotizacionEditando.notas || '')
    };
    
    return cambios;
  },
  
  diferenciaTotalTexto() {
    if (!this.cotizacionEditando) return '';
    const diferencia = this.totalFinalEdicion - this.cotizacionEditando.total;
    if (diferencia > 0) {
      return `+${this.formatearMoneda(diferencia)}`;
    } else {
      return this.formatearMoneda(diferencia);
    }
  },
  
  diferenciaTotalClase() {
    if (!this.cotizacionEditando) return '';
    const diferencia = this.totalFinalEdicion - this.cotizacionEditando.total;
    return diferencia > 0 ? 'text-success' : 'text-danger';
  }
},

watch: {
  // Resetear a la primera página cuando cambien los filtros
  'filtros.busqueda'() {
    this.paginaActual = 1;
  },
  'filtros.estado'() {
    this.paginaActual = 1;
  },
  'filtros.periodo'() {
    this.paginaActual = 1;
  },
  
  // Actualizar paginaSalto cuando cambie la página actual
  paginaActual(newVal) {
    this.paginaSalto = newVal;
  }
},

methods: {
  nuevaCotizacion() {
    // Simular navegación a nueva cotización
    alert('Navegando a nueva cotización...');
  },
  
  verCotizacion(cotizacion) {
    this.modalCotizacion = cotizacion;
  },
  
  editarCotizacion(cotizacion) {
    this.cotizacionEditando = { ...cotizacion };
    this.inicializarFormularioEdicion();
    this.modalEdicion = true;
  },
  
  inicializarFormularioEdicion() {
    // Clonar datos originales al formulario
    this.formEdicion.cliente = { ...this.cotizacionEditando.cliente };
    this.formEdicion.items = this.cotizacionEditando.items.map(item => ({ ...item }));
    this.formEdicion.descuentoPorcentaje = this.cotizacionEditando.descuentoPorcentaje || 0;
    this.formEdicion.notas = this.cotizacionEditando.notas || '';
  },
  
  agregarItem() {
    const nuevoId = Math.max(...this.formEdicion.items.map(i => i.id || 0)) + 1;
    this.formEdicion.items.push({
      id: nuevoId,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0
    });
  },
  
  eliminarItem(index) {
    if (this.formEdicion.items.length > 1) {
      this.formEdicion.items.splice(index, 1);
    }
  },
  
  guardarCambios() {
    if (!this.formularioValido) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Verificar si hay cambios
    const hayCambios = Object.values(this.cambiosDetectados).some(cambio => cambio);
    if (!hayCambios) {
      alert('No se detectaron cambios para guardar');
      return;
    }
    
    this.mostrarModalConfirmacion = true;
  },
  
  confirmarGuardar() {
    // Calcular las diferencias para guardar en BD
    const diferenciaPrecioMinimo = this.precioMinimo - this.totalFinalEdicion;
    const diferenciaPrecioRecomendado = this.precioRecomendado - this.totalFinalEdicion;
    
    // Actualizar la cotización en el array
    const index = this.cotizaciones.findIndex(c => c.id === this.cotizacionEditando.id);
    if (index !== -1) {
      this.cotizaciones[index] = {
        ...this.cotizaciones[index],
        cliente: { ...this.formEdicion.cliente },
        items: [...this.formEdicion.items],
        descuentoPorcentaje: this.formEdicion.descuentoPorcentaje,
        total: this.totalFinalEdicion,
        notas: this.formEdicion.notas,
        diferenciaPrecioMinimo: diferenciaPrecioMinimo,
        diferenciaPrecioRecomendado: diferenciaPrecioRecomendado,
        estado: this.totalFinalEdicion < this.precioMinimo ? 'esperando' : 'pendiente',
        fechaModificacion: new Date().toISOString()
      };
    }
    
    console.log('Cotización actualizada:', this.cotizaciones[index]);
    
    alert('Cotización actualizada exitosamente');
    this.cerrarModalConfirmacion();
    this.cerrarModalEdicion();
  },
  
  cerrarModalEdicion() {
    this.modalEdicion = false;
    this.cotizacionEditando = null;
    this.formEdicion = {
      cliente: { nombre: '', email: '', telefono: '' },
      items: [],
      descuentoPorcentaje: 0,
      notas: ''
    };
  },
  
  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion = false;
  },
  
  // Nueva función para abrir vista previa del PDF
  abrirVistaPreviaPDF(cotizacion) {
    if (!cotizacion.pdfGenerado) {
      alert('Esta cotización no tiene PDF generado');
      return;
    }
    this.pdfCotizacion = cotizacion;
    this.esCopia = true; // Siempre inicia como copia
    this.modalPDF = true;
  },
  
  // Nueva función para alternar entre copia y original
  alternarTipoPDF() {
    this.esCopia = !this.esCopia;
  },
  
  // Nueva función para descargar PDF
  descargarPDF() {
    const tipo = this.esCopia ? 'COPIA' : 'ORIGINAL';
    console.log(`Descargando PDF ${tipo} de:`, this.pdfCotizacion.numero);
    alert(`Descargando PDF ${tipo} de ${this.pdfCotizacion.numero}`);
    this.cerrarModalPDF();
  },
  
  // Nueva función para cerrar modal PDF
  cerrarModalPDF() {
    this.modalPDF = false;
    this.pdfCotizacion = null;
    this.esCopia = true;
  },
  
  duplicarCotizacion(cotizacion) {
    if (confirm(`¿Deseas crear una nueva cotización basada en ${cotizacion.numero}?`)) {
      // Simular duplicación
      alert(`Creando nueva cotización basada en ${cotizacion.numero}`);
    }
  },
  
  puedeEditar(cotizacion) {
    return ['esperando', 'pendiente'].includes(cotizacion.estado);
  },
  
  ordenarPor(campo) {
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual = { campo, direccion: 'asc' };
    }
  },
  
  getSortIcon(campo) {
    if (this.ordenActual.campo !== campo) return '↕️';
    return this.ordenActual.direccion === 'asc' ? '↑' : '↓';
  },
  
  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      estado: '',
      periodo: ''
    };
    this.paginaActual = 1;
    this.paginaSalto = 1;
  },
  
  cerrarModal() {
    this.modalCotizacion = null;
  },
  
  // Métodos de paginación
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
  
  formatearMoneda(monto) {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(monto);
  },
  
  getEstadoTexto(estado) {
    const estados = {
      esperando: 'Esperando Aprobación',
      pendiente: 'Pendiente',
      efectivo: 'Efectivo',
      rechazado: 'Rechazado'
    };
    return estados[estado] || estado;
  }
}
}
</script>


<style scoped>
.mis-cotizaciones-container {
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

.btn:disabled {
opacity: 0.6;
cursor: not-allowed;
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

.btn-sm {
padding: 0.5rem 1rem;
font-size: 0.85rem;
}

.btn-toggle {
padding: 0.75rem 1.5rem;
font-weight: 600;
border-radius: 8px;
}

.btn-warning {
background: #f39c12;
color: white;
}

.btn-warning:hover {
background: #e67e22;
}

.btn-success {
background: #27ae60;
color: white;
}

.btn-success:hover {
background: #229954;
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
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.stat-icon {
font-size: 2.5rem;
opacity: 0.8;
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

.stat-card.total .stat-icon { color: #3498db; }
.stat-card.esperando .stat-icon { color: #f39c12; }
.stat-card.pendientes .stat-icon { color: #17a2b8; }
.stat-card.efectivos .stat-icon { color: #27ae60; }

.cotizaciones-section {
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

/* Estilos de paginación mejorados */
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

.tabla-wrapper {
overflow-x: auto;
}

.cotizaciones-tabla {
width: 100%;
border-collapse: collapse;
margin-bottom: 1rem;
}

.cotizaciones-tabla th {
background: #f8f9fa;
padding: 1rem;
text-align: left;
font-weight: 600;
color: #2c3e50;
border-bottom: 2px solid #e9ecef;
white-space: nowrap;
}

.cotizaciones-tabla th.sortable {
cursor: pointer;
user-select: none;
}

.cotizaciones-tabla th.sortable:hover {
background: #e9ecef;
}

.sort-icon {
margin-left: 0.5rem;
opacity: 0.5;
}

.cotizaciones-tabla td {
padding: 1rem;
border-bottom: 1px solid #e9ecef;
vertical-align: middle;
}

.numero-cotizacion {
font-weight: 600;
color: #3498db;
font-family: monospace;
}

.cliente-info {
display: flex;
flex-direction: column;
gap: 0.25rem;
}

.cliente-nombre {
font-weight: 500;
color: #2c3e50;
}

.cliente-email {
color: #7f8c8d;
font-size: 0.85rem;
}

.fecha {
color: #2c3e50;
white-space: nowrap;
}

.estado-badge {
padding: 0.375rem 0.75rem;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
}

.estado-badge.esperando {
background: #fff3cd;
color: #856404;
border: 1px solid #ffeaa7;
}

.estado-badge.pendiente {
background: #d1ecf1;
color: #0c5460;
border: 1px solid #bee5eb;
}

.estado-badge.efectivo {
background: #d4edda;
color: #155724;
border: 1px solid #c3e6cb;
}

.estado-badge.rechazado {
background: #f8d7da;
color: #721c24;
border: 1px solid #f5c6cb;
}

.monto {
font-weight: 600;
color: #27ae60;
font-family: monospace;
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

.btn-accion:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.btn-accion.ver {
background: #e3f2fd;
color: #1976d2;
}

.btn-accion.ver:hover:not(:disabled) {
background: #bbdefb;
}

.btn-accion.editar {
background: #f3e5f5;
color: #7b1fa2;
}

.btn-accion.editar:hover:not(:disabled) {
background: #e1bee7;
}

.btn-accion.imprimir {
background: #e8f5e8;
color: #388e3c;
}

.btn-accion.imprimir:hover {
background: #c8e6c9;
}

.btn-accion.duplicar {
background: #fff3e0;
color: #f57c00;
}

.btn-accion.duplicar:hover {
background: #ffe0b2;
}

/* Vista de tarjetas */
.tarjetas-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
gap: 1.5rem;
}

.cotizacion-card {
border: 1px solid #e9ecef;
border-radius: 12px;
padding: 1.5rem;
transition: all 0.3s ease;
background: white;
}

.cotizacion-card:hover {
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

.card-content h3 {
color: #2c3e50;
margin-bottom: 0.5rem;
font-size: 1.2rem;
}

.card-content p {
color: #7f8c8d;
font-size: 0.9rem;
margin-bottom: 1rem;
}

.card-details {
display: grid;
gap: 0.5rem;
margin-bottom: 1.5rem;
}

.detail {
display: flex;
justify-content: space-between;
align-items: center;
}

.detail-label {
color: #7f8c8d;
font-size: 0.85rem;
}

.detail-value {
color: #2c3e50;
font-weight: 500;
font-size: 0.9rem;
}

.detail-value.monto {
color: #27ae60;
font-family: monospace;
}

.card-actions {
display: flex;
gap: 0.75rem;
flex-wrap: wrap;
}

.card-warning {
background: #fff3cd;
color: #856404;
padding: 0.75rem;
border-radius: 6px;
margin: 1rem 0;
font-size: 0.85rem;
text-align: center;
border: 1px solid #ffeaa7;
}

/* PDF status */
.pdf-status {
text-align: center;
}

.pdf-disponible {
color: #27ae60;
font-weight: 600;
font-size: 0.85rem;
}

.pdf-no-disponible {
color: #e74c3c;
font-weight: 600;
font-size: 0.85rem;
}

.pdf-ok {
color: #27ae60;
font-weight: 600;
}

.pdf-no {
color: #e74c3c;
font-weight: 600;
}

.monto-warning {
margin-top: 0.25rem;
}

.monto-warning small {
color: #f39c12;
font-weight: 600;
font-size: 0.75rem;
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

/* Modal base */
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

/* Modal PDF específico */
.modal-pdf-content {
background: white;
border-radius: 12px;
max-width: 900px;
width: 100%;
max-height: 95vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
display: flex;
flex-direction: column;
}

/* Modal de edición específico */
.modal-edicion-content {
background: white;
border-radius: 12px;
max-width: 1000px;
width: 100%;
max-height: 95vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
display: flex;
flex-direction: column;
}

.modal-header,
.modal-pdf-header,
.modal-edicion-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1.5rem;
border-bottom: 1px solid #e9ecef;
flex-shrink: 0;
}

.modal-header h3,
.modal-pdf-header h3,
.modal-edicion-header h3 {
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

.modal-body,
.modal-edicion-body {
padding: 1.5rem;
flex: 1;
}

.modal-pdf-body {
padding: 1.5rem;
flex: 1;
overflow-y: auto;
}

.modal-footer,
.modal-edicion-footer {
padding: 1.5rem;
border-top: 1px solid #e9ecef;
display: flex;
justify-content: flex-end;
gap: 1rem;
flex-shrink: 0;
}

.modal-pdf-footer {
padding: 1.5rem;
border-top: 1px solid #e9ecef;
background: #f8f9fa;
display: flex;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
gap: 1rem;
flex-shrink: 0;
}

.pdf-controls {
display: flex;
align-items: center;
}

.pdf-actions {
display: flex;
gap: 1rem;
}

/* Vista previa del PDF */
.pdf-preview {
background: white;
border: 1px solid #ddd;
border-radius: 8px;
padding: 2rem;
position: relative;
min-height: 600px;
font-family: Arial, sans-serif;
}

.pdf-watermark {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%) rotate(-45deg);
z-index: 1;
pointer-events: none;
}

.watermark-text {
font-size: 4rem;
font-weight: bold;
color: rgba(231, 76, 60, 0.1);
text-transform: uppercase;
letter-spacing: 2rem;
}

.pdf-header {
display: flex;
justify-content: space-between;
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.company-info h2 {
color: #2c3e50;
margin-bottom: 0.5rem;
}

.company-info p {
color: #7f8c8d;
line-height: 1.4;
}

.cotizacion-info {
text-align: right;
}

.cotizacion-info h3 {
color: #3498db;
margin-bottom: 0.5rem;
}

.cliente-section {
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.cliente-section h4 {
color: #2c3e50;
margin-bottom: 0.5rem;
}

.items-section {
margin-bottom: 2rem;
position: relative;
z-index: 2;
}

.pdf-table {
width: 100%;
border-collapse: collapse;
margin-bottom: 1rem;
}

.pdf-table th,
.pdf-table td {
border: 1px solid #ddd;
padding: 0.75rem;
text-align: left;
}

.pdf-table th {
background: #f8f9fa;
font-weight: 600;
color: #2c3e50;
}

.pdf-table td:nth-child(3),
.pdf-table td:nth-child(4),
.pdf-table td:nth-child(5) {
text-align: right;
}

.total-section {
text-align: right;
position: relative;
z-index: 2;
border-top: 2px solid #3498db;
padding-top: 1rem;
}

.total-section p {
font-size: 1.2rem;
color: #2c3e50;
}

.cotizacion-detalle {
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
}

.modal-warning {
background: #fff3cd;
color: #856404;
padding: 1rem;
border-radius: 8px;
margin-top: 1rem;
border: 1px solid #ffeaa7;
}

.modal-warning h4 {
margin: 0 0 0.5rem 0;
color: #856404;
}

.modal-warning p {
margin: 0;
}

/* Estilos específicos del formulario de edición */
.estado-actual-card {
background: #fff3cd;
border: 1px solid #ffeaa7;
border-radius: 12px;
padding: 1.5rem;
margin-bottom: 2rem;
}

.warning-content {
display: flex;
align-items: center;
gap: 1rem;
}

.warning-icon {
font-size: 2rem;
color: #856404;
}

.warning-text h4 {
color: #856404;
margin: 0 0 0.5rem 0;
font-size: 1.2rem;
}

.warning-text p {
color: #856404;
margin: 0;
}

.formulario-edicion {
display: grid;
gap: 2rem;
}

.seccion-card {
background: #f8f9fa;
border-radius: 12px;
padding: 2rem;
border: 1px solid #e9ecef;
}

.seccion-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1.5rem;
}

.seccion-titulo {
font-size: 1.2rem;
font-weight: 600;
color: #2c3e50;
margin: 0 0 1.5rem 0;
display: flex;
align-items: center;
gap: 0.5rem;
}

.form-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.form-input {
padding: 0.875rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 1rem;
transition: border-color 0.3s ease;
background: white;
}

.form-input:focus {
outline: none;
border-color: #3498db;
}

.form-input:disabled {
background: #f8f9fa;
color: #6c757d;
}

.form-textarea {
padding: 0.875rem;
border: 2px solid #e1e8ed;
border-radius: 8px;
font-size: 1rem;
resize: vertical;
font-family: inherit;
transition: border-color 0.3s ease;
background: white;
}

.form-textarea:focus {
outline: none;
border-color: #3498db;
}

.items-container {
display: grid;
gap: 1.5rem;
}

.item-card {
border: 2px solid #dee2e6;
border-radius: 10px;
padding: 1.5rem;
background: white;
}

.item-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.item-numero {
font-weight: 600;
color: #3498db;
font-size: 1.1rem;
}

.btn-remove {
background: #e74c3c;
color: white;
border: none;
border-radius: 6px;
padding: 0.5rem;
cursor: pointer;
transition: all 0.3s ease;
width: 32px;
height: 32px;
display: flex;
align-items: center;
justify-content: center;
}

.btn-remove:hover:not(:disabled) {
background: #c0392b;
transform: translateY(-1px);
}

.btn-remove:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.item-form {
display: grid;
gap: 1rem;
}

.form-row {
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 1rem;
}

.precios-container {
display: grid;
gap: 2rem;
}

.precios-grid {
display: grid;
gap: 1rem;
padding: 1.5rem;
background: white;
border-radius: 10px;
border: 1px solid #dee2e6;
}

.precio-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.75rem 0;
}

.precio-item.total-item {
border-top: 2px solid #3498db;
padding-top: 1rem;
margin-top: 0.5rem;
}

.precio-label {
font-weight: 600;
color: #2c3e50;
}

.precio-valor {
font-weight: 600;
color: #27ae60;
font-family: monospace;
}

.precio-total {
font-size: 1.2rem;
color: #2c3e50;
}

.descuento-input {
display: flex;
align-items: center;
gap: 1rem;
}

.descuento-field {
width: 100px;
}

.descuento-monto {
color: #e74c3c;
font-weight: 600;
font-family: monospace;
}

.validacion-precios {
display: grid;
gap: 1.5rem;
}

.precio-minimo-info {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 1rem;
padding: 1rem;
background: white;
border-radius: 8px;
border: 1px solid #dee2e6;
}

.precio-referencia {
display: flex;
justify-content: space-between;
align-items: center;
}

.precio-referencia .label {
font-weight: 600;
color: #495057;
}

.precio-referencia .valor {
font-weight: 600;
font-family: monospace;
color: #2c3e50;
}

.estado-precio {
padding: 1.5rem;
border-radius: 10px;
display: flex;
align-items: flex-start;
gap: 1rem;
}

.estado-precio.bajo-minimo {
background: #f8d7da;
border: 1px solid #f5c6cb;
color: #721c24;
}

.estado-precio.bajo-recomendado {
background: #d1ecf1;
border: 1px solid #bee5eb;
color: #0c5460;
}

.estado-precio.precio-optimo {
background: #d4edda;
border: 1px solid #c3e6cb;
color: #155724;
}

.estado-precio i {
font-size: 1.5rem;
margin-top: 0.25rem;
}

.estado-content {
flex: 1;
}

.estado-content strong {
display: block;
margin-bottom: 0.5rem;
font-size: 1.1rem;
}

.estado-content p {
margin: 0 0 0.75rem 0;
line-height: 1.4;
}

.diferencia-info {
display: flex;
gap: 0.5rem;
font-weight: 600;
}

.diferencia-label {
color: inherit;
}

.diferencia-valor {
font-family: monospace;
}

/* Modal de confirmación */
.cambios-resumen {
margin: 1.5rem 0;
padding: 1rem;
background: #f8f9fa;
border-radius: 8px;
border: 1px solid #dee2e6;
}

.cambios-resumen h4 {
margin: 0 0 1rem 0;
color: #2c3e50;
font-size: 1.1rem;
}

.cambios-lista {
margin: 0;
padding-left: 1.5rem;
color: #495057;
}

.cambios-lista li {
margin-bottom: 0.5rem;
line-height: 1.4;
}

.text-success {
color: #27ae60 !important;
font-weight: 600;
}

.text-danger {
color: #e74c3c !important;
font-weight: 600;
}

.text-warning {
color: #f39c12 !important;
}

.advertencia-precio {
background: #fff3cd;
color: #856404;
padding: 1rem;
border-radius: 8px;
margin-top: 1rem;
border: 1px solid #ffeaa7;
display: flex;
align-items: flex-start;
gap: 0.5rem;
}

.advertencia-precio i {
margin-top: 0.25rem;
flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1200px) {
.estadisticas-grid {
  grid-template-columns: repeat(2, 1fr);
}

.modal-edicion-content {
  max-width: 95%;
}

.precio-minimo-info {
  grid-template-columns: 1fr;
}
}

@media (max-width: 768px) {
.mis-cotizaciones-container {
  padding: 1rem;
}

.page-header {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
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

.cotizaciones-tabla {
  min-width: 800px;
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

.paginacion {
  gap: 0.25rem;
}

.detalle-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.modal-pdf-footer {
  flex-direction: column;
  align-items: stretch;
}

.pdf-actions {
  justify-content: stretch;
}

.pdf-actions .btn {
  flex: 1;
}

.watermark-text {
  font-size: 2.5rem;
  letter-spacing: 1rem;
}

.modal-edicion-content {
  margin: 0.5rem;
  max-height: 98vh;
}

.modal-edicion-footer {
  flex-direction: column;
}

.modal-edicion-footer .btn {
  width: 100%;
  justify-content: center;
}

.form-grid {
  grid-template-columns: 1fr;
}

.form-row {
  grid-template-columns: 1fr;
}

.seccion-header {
  flex-direction: column;
  align-items: stretch;
}

.seccion-header .btn {
  width: 100%;
  justify-content: center;
}
}

@media (max-width: 480px) {
.filtros-section,
.cotizaciones-section {
  padding: 1rem;
}

.stat-card {
  padding: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 1.5rem;
}

.cotizacion-card {
  padding: 1rem;
}

.modal-content,
.modal-pdf-content,
.modal-edicion-content {
  margin: 0.25rem;
  max-height: 99vh;
}

.btn-pag {
  min-width: 35px;
  padding: 0.375rem 0.5rem;
}

.estadisticas-grid {
  grid-template-columns: 1fr;
}

.pdf-preview {
  padding: 1rem;
}

.pdf-header {
  flex-direction: column;
  gap: 1rem;
}

.cotizacion-info {
  text-align: left;
}

.watermark-text {
  font-size: 2rem;
  letter-spacing: 0.5rem;
}

.seccion-card {
  padding: 1rem;
}

.item-card {
  padding: 1rem;
}

.modal-edicion-header h3 {
  font-size: 1.1rem;
}

.descuento-input {
  flex-direction: column;
  align-items: stretch;
}

.descuento-field {
  width: 100%;
}
}
</style>