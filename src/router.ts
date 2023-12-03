import * as VueRouter from 'vue-router'
import Practice from "@/pages/practice/index.vue";
import Dict from '@/pages/dict'
import Test from "@/pages/test.vue";

const routes: any[] = [
  {path: '/practice', component: Practice},
  {path: '/dict', name: 'dict', component: Dict},
  {path: '/test', name: 'test', component: Test},
  {path: '/', redirect: '/test'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

export default router