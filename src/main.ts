import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
// import Mobile from './Mobile.vue'
import {createPinia} from "pinia"
// import ElementPlus from 'element-plus'
import ZH from "@/locales/zh-CN.ts";
import JA from "@/locales/ja.ts";
import {createI18n} from 'vue-i18n'
import router from "@/router.ts";
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const i18n = createI18n({
  locale: 'ja',
  fallbackLocale: 'ja',
  messages: {
    'zh-CN': ZH,
    'ja': JA
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

app.mount('#app')