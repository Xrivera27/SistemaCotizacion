<!-- components/shared/LoadingModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="isLoading" class="loading-overlay" @click.self="handleOverlayClick">
        <div class="loading-modal">
          <div class="loading-content">
            <!-- Spinner animado -->
            <div class="spinner-container">
              <div class="spinner"></div>
            </div>
            
            <!-- Mensaje de carga -->
            <p class="loading-message">{{ message }}</p>
            
            <!-- Botón de cancelar (opcional) -->
            <button 
              v-if="cancellable" 
              @click="$emit('cancel')"
              class="cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'LoadingModal',
  emits: ['cancel'],
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Cargando...'
    },
    cancellable: {
      type: Boolean,
      default: false
    },
    preventClose: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleOverlayClick() {
      if (!this.preventClose) {
        this.$emit('cancel')
      }
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  width: 90%;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-container {
  position: relative;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin: 0;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background: #c0392b;
}

/* Transiciones */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .loading-modal {
    padding: 1.5rem;
    max-width: 280px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
}
</style>