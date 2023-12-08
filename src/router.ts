import * as VueRouter from 'vue-router'
import Practice from "@/pages/practice/index.vue";
import Dict from '@/pages/dict/index.vue'
import Mobile from '@/pages/mobile/index.vue'
import Test from "@/pages/test.vue";

const routes: any[] = [
  {path: '/practice', component: Practice},
  {path: '/dict', name: 'dict', component: Dict},
  {path: '/mobile', name: 'dict', component: Mobile},
  {path: '/test', name: 'test', component: Test},
  {path: '/', redirect: '/practice'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

export default router