import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

const app = createApp(App)

// Pinia is registered once at app startup so grocery-list state can live outside individual components.
app.use(createPinia())
// Vue Router is registered once so both / and /list/:uuid can render the same grocery-list surface.
app.use(router)
// Vuetify is registered once so all MVP screens can use the same component library and icon set.
app.use(vuetify)

app.mount('#app')
