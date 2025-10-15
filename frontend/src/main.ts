// frontend/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate';
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Criar a instância da aplicação
const app = createApp(App)

// Criar e registrar Pinia
const pinia = createPinia()
pinia.use(piniaPersistedState);
app.use(pinia)

// Registrar o router
app.use(router)

// Montar a aplicação
app.mount('#app')
