import {createApp} from 'vue'
import './assets/css/style.scss'
import 'virtual:uno.css';
import App from './App.vue'
import {createPinia} from "pinia"
import router from "@/router.ts";
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './global.d.ts'

const pinia = createPinia()
const app = createApp(App)

app.use(VueVirtualScroller)
// app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.directive('opacity', (el, binding) => {
  el.style.opacity = binding.value ? 1 : 0
})

app.mount('#app')
