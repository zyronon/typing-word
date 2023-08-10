import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
import Mobile from './Mobile.vue'
import {createPinia} from "pinia"

const pinia = createPinia()
const app = createApp(Mobile)

app.use(pinia)
app.mount('#app')