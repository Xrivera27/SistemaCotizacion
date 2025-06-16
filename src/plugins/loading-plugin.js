// plugins/loading-plugin.js
import LoadingModal from '@/components/shared/LoadingModal.vue'
import { useGlobalLoading } from '@/utils/useLoading'

export default {
  install(app) {
    // Registrar componente globalmente
    app.component('LoadingModal', LoadingModal)
    
    // Proporcionar loading global
    const globalLoading = useGlobalLoading()
    app.provide('globalLoading', globalLoading)
    
    // Método global para usar en cualquier componente
    app.config.globalProperties.$loading = globalLoading
  }
}