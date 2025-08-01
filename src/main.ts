import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
// import Mobile from './Mobile.vue'
import {createPinia} from "pinia"
import ZH from "@/locales/zh-CN.ts";
import {createI18n} from 'vue-i18n'
import router from "@/router.ts";
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'virtual:uno.css';
import './global.d.ts'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': ZH
  },
})

const pinia = createPinia()
// const app = createApp(Mobile)
const app = createApp(App)

app.use(VueVirtualScroller)
// app.use(ElementPlus)
app.use(pinia)
app.use(i18n)
app.use(router)

app.directive('opacity', (el, binding) => {
  el.style.opacity = binding.value ? 1 : 0
})

app.mount('#app')
