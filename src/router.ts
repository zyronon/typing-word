import * as VueRouter from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import Practice from "@/pages/pc/practice/index.vue";
import Dict from '@/pages/pc/dict/index.vue'
import Mobile from '@/pages/mobile/index.vue'
import MobilePractice from '@/pages/mobile/practice/index.vue'
import Test from "@/pages/test/test.vue";

const routes: RouteRecordRaw[] = [
  {path: '/pc/practice', component: Practice},
  {path: '/pc/dict', component: Dict},
  {
    path: '/mobile', component: Mobile,
    // redirect:'/mobile/home',
  },
  {path: '/mobile-practice', component: MobilePractice,},
  {path: '/test', component: Test},
  {path: '/', redirect: '/pc/practice'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

export default router