// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar plugin de loading
import LoadingPlugin from './plugins/loading-plugin'

const app = createApp(App)

app.use(router)
app.use(LoadingPlugin) // Registrar plugin de loading

app.mount('#app')