<template>
  <div id="app">
    <CotizacionForm />
  </div>
</template>

<script>
import CotizacionForm from './components/CotizacionForm.vue';

export default {
  name: 'App',
  components: {
    CotizacionForm
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>