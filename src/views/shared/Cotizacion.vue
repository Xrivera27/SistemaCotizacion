<template>
  <div class="cotizacion-page">
    <div class="page-header">
      <h1>Crear Nueva Cotización</h1>
    </div>
    <CotizacionForm />
  </div>
</template>

<script>
import CotizacionForm from '@/components/cotizacion/CotizacionForm.vue';

export default {
  name: 'CotizacionPage',
  components: {
    CotizacionForm
  }
}
</script>

<style scoped>
.cotizacion-page {
  padding: 2rem;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-header h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #6c757d;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .cotizacion-page {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .cotizacion-page {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1rem;
  }
}
</style>