import {createApp} from 'vue'
import './assets/css/style.scss'
import App from './App.vue'
// import Mobile from './Mobile.vue'
import {createPinia} from "pinia"
// import ElementPlus from 'element-plus'
import VirtualList from 'vue-virtual-list-v3';
import ZH from "@/locales/zh-CN.ts";
import {createI18n} from 'vue-i18n'
import router from "@/router.ts";

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

// app.use(ElementPlus)
app.use(pinia)
app.use(VirtualList);
app.use(i18n)
app.use(router)

app.mount('#app')