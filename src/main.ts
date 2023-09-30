import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
// import Mobile from './Mobile.vue'
import {createPinia} from "pinia"
// import ElementPlus from 'element-plus'
import VirtualList from 'vue-virtual-list-v3';

const pinia = createPinia()
// const app = createApp(Mobile)
const app = createApp(App)

// app.use(ElementPlus)
app.use(pinia)
app.use(VirtualList);

app.mount('#app')