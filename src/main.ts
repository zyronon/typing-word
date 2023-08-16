import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
// import Mobile from './Mobile.vue'
import {createPinia} from "pinia"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const pinia = createPinia()
// const app = createApp(Mobile)
const app = createApp(App)

app.use(ElementPlus)
app.use(pinia)
app.mount('#app')