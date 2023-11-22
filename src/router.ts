import * as VueRouter from 'vue-router'
import Practice from "@/pages/practice/index.vue";
import Dict from '@/pages/dict'

const routes = [
  {path: '/practice', component: Practice},
  {path: '/dict', component: Dict},
  {path: '/', redirect:'/dict'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

export default router