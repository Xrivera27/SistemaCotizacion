// utils/useLoading.js
import { ref, computed } from 'vue'

export function useLoading(initialMessage = 'Cargando...') {
  const isLoading = ref(false)
  const loadingMessage = ref(initialMessage)
  const loadingStack = ref([])

  // Métodos principales
  const startLoading = (message = initialMessage) => {
    loadingMessage.value = message
    isLoading.value = true
  }

  const stopLoading = () => {
    isLoading.value = false
  }

  // Métodos avanzados para múltiples operaciones
  const pushLoading = (key, message = initialMessage) => {
    if (!loadingStack.value.includes(key)) {
      loadingStack.value.push(key)
      loadingMessage.value = message
      isLoading.value = true
    }
  }

  const popLoading = (key) => {
    const index = loadingStack.value.indexOf(key)
    if (index > -1) {
      loadingStack.value.splice(index, 1)
      if (loadingStack.value.length === 0) {
        isLoading.value = false
      }
    }
  }

  // Wrapper para operaciones async
  const withLoading = async (operation, message) => {
    startLoading(message)
    try {
      const result = await operation()
      return result
    } finally {
      stopLoading()
    }
  }

  // Wrapper para múltiples operaciones
  const withLoadingKey = async (key, operation, message) => {
    pushLoading(key, message)
    try {
      const result = await operation()
      return result
    } finally {
      popLoading(key)
    }
  }

  // Estado computado
  const hasActiveLoading = computed(() => {
    return isLoading.value || loadingStack.value.length > 0
  })

  return {
    // Estado
    isLoading: hasActiveLoading,
    loadingMessage,
    
    // Métodos básicos
    startLoading,
    stopLoading,
    
    // Métodos avanzados
    pushLoading,
    popLoading,
    
    // Wrappers útiles
    withLoading,
    withLoadingKey,
    
    // Helpers
    clearAllLoading: () => {
      isLoading.value = false
      loadingStack.value = []
    }
  }
}

// Composable global para toda la app (opcional)
export function useGlobalLoading() {
  // Singleton pattern para loading global
  if (!window.__globalLoading) {
    window.__globalLoading = useLoading('Cargando...')
  }
  return window.__globalLoading
}