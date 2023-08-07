import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
import {createPinia} from "pinia"

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')