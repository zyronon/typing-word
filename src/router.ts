import * as VueRouter from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import Practice from "@/pages/pc/practice/index.vue";
import Dict from '@/pages/pc/dict/index.vue'
import Mobile from '@/pages/mobile/index.vue'
import MobilePractice from '@/pages/mobile/practice/index.vue'
import Test from "@/pages/test/test.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import DictDetail from "@/pages/mobile/DictDetail.vue";
import SetDictPlan from "@/pages/mobile/SetDictPlan.vue";

export const routes: RouteRecordRaw[] = [
  {path: '/pc/practice', component: Practice},
  {path: '/pc/dict', component: Dict},

  {path: '/mobile', component: Mobile,},
  {path: '/mobile/practice', component: MobilePractice},
  {path: '/mobile/dict-detail', component: DictDetail},
  {
    path: '/mobile/set-dict-plan',
    name: 'set-dict-plan',
    component: SetDictPlan
  },
  {path: '/test', component: Test},
  {path: '/', redirect: '/pc/practice'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // console.log('savedPosition', savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return {top: 0}
    }
  },
})

router.beforeEach((to, from) => {
  // console.log('beforeEach-to',to.path)
  // console.log('beforeEach-from',from.path)
  const runtimeStore = useRuntimeStore()

  //footer下面的5个按钮，对跳不要用动画
  let noAnimation = [
    '/pc/practice',
    '/pc/dict',
    '/mobile',
    '/'
  ]
  if (noAnimation.indexOf(from.path) !== -1 && noAnimation.indexOf(to.path) !== -1) {
    return true
  }

  const toDepth = routes.findIndex(v => v.path === to.path)
  const fromDepth = routes.findIndex(v => v.path === from.path)
  // const fromDepth = routeDeep.indexOf(from.path)

  if (toDepth > fromDepth) {
    if (to.matched && to.matched.length) {
      let toComponentName = to.matched[0].components.default.name
      runtimeStore.updateExcludeRoutes({type: 'remove', value: toComponentName})
      // console.log('to', toComponentName)
      // console.log('前进')
      // console.log('删除', toComponentName)
    }

  } else {
    if (from.matched && from.matched.length) {
      let fromComponentName = from.matched[0].components.default.name
      runtimeStore.updateExcludeRoutes({type: 'add', value: fromComponentName})
      // console.log('后退')
      // console.log('添加', fromComponentName)
    }
  }
  // ...
  // 返回 false 以取消导航
  return true
})


export default router