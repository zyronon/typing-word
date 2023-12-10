import * as VueRouter from 'vue-router'
import Practice from "@/pages/practice/index.vue";
import Dict from '@/pages/dict/index.vue'
import Mobile from '@/pages/mobile/index.vue'
import MobileHome from '@/pages/mobile/home.vue'
import MobilePractice from '@/pages/mobile/practice.vue'
import Test from "@/pages/test.vue";
import {RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
  {path: '/practice', component: Practice},
  {path: '/dict', component: Dict},
  {
    path: '/mobile', component: Mobile,
    redirect:'/mobile/home',
    children: [
      {
        path: 'home',
        component: MobileHome,
      },
    ]
  },
  {path: '/mobile-practice', component: MobilePractice,},
  {path: '/test', component: Test},
  {path: '/', redirect: '/practice'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

export default router