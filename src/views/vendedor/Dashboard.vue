<template>
  <div class="dashboard-vendedor">
    <h1>Dashboard del Vendedor</h1>
    <p>Bienvenido al sistema de cotización</p>

  </div>
</template>

<script>
export default {
  name: 'VendedorDashboard'
}
</script>

<style scoped>
.dashboard-vendedor {
  padding: 2rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
}
</style>