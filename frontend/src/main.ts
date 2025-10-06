// frontend/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'

// Criar a instância da aplicação
const app = createApp(App)

// Criar e registrar Pinia
const pinia = createPinia()
app.use(pinia)

// Registrar o router
app.use(router)

// Montar a aplicação
app.mount('#app')
