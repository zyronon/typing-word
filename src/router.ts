import * as VueRouter from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import Mobile from '@/pages/mobile/index.vue'
import MobilePractice from '@/pages/mobile/practice/index.vue'
import Test from "@/pages/test/test.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import DictDetail from "@/pages/mobile/DictDetail.vue";
import SetDictPlan from "@/pages/mobile/SetDictPlan.vue";
import Setting from "@/pages/mobile/my/setting/Setting.vue";
import DataManage from "@/pages/mobile/my/DataManage.vue";
import CollectPage from "@/pages/mobile/my/CollectPage.vue";
import WrongPage from "@/pages/mobile/my/WrongPage.vue";
import SimplePage from "@/pages/mobile/my/SimplePage.vue";
import About from "@/pages/mobile/my/About.vue";
import Feedback from "@/pages/mobile/my/Feedback.vue";
import MusicSetting from "@/pages/mobile/my/setting/MusicSetting.vue";
import OtherSetting from "@/pages/mobile/my/setting/OtherSetting.vue";
import WordHome from "@/pages/pc/word/WordHome.vue";
import PC from "@/pages/pc/index.vue";
import Dict2 from '@/pages/pc/dict2/index.vue'
import ArticleIndex from "@/pages/pc/article/ArticleIndex.vue";
import Article2Index from "@/pages/pc/article2/ArticleIndex.vue";
import HomeIndex from "@/pages/pc/home/HomeIndex.vue";
import LearnArticle from "@/pages/pc/article/LearnArticle.vue";
import EditWordDict from "@/pages/pc/word/EditWordDict.vue";
import StudyWord from "@/pages/pc/word/StudyWord.vue";
import EditArticlePage from "@/pages/pc/article/EditArticlePage.vue";
import BookDetail from "@/pages/pc/article/BookDetail.vue";
import BatchEditArticlePage from "@/pages/pc/article/BatchEditArticlePage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: '/', component: PC,
    redirect: '/home',
    children: [
      {path: 'home', component: HomeIndex},
      {path: 'word', component: WordHome},
      {path: 'study-word', component: StudyWord},
      {path: 'edit-word-dict', component: EditWordDict},
      {path: 'dict', component: Dict2},
      {path: 'article', component: ArticleIndex},
      {path: 'article2', component: Article2Index},
      {path: 'edit-article', component: EditArticlePage},
      {path: 'batch-edit-article', component: BatchEditArticlePage},
      {path: 'learn-article', component: LearnArticle},
      {path: 'book-detail', component: BookDetail},
    ]
  },

  // {path: '/mobile', component: Mobile,},
  // {path: '/mobile/practice', component: MobilePractice},
  // {path: '/mobile/dict-detail', component: DictDetail},
  // {path: '/mobile/set-dict-plan', name: 'set-dict-plan', component: SetDictPlan},
  // {path: '/mobile/setting', component: Setting},
  // {path: '/mobile/music-setting', component: MusicSetting},
  // {path: '/mobile/other-setting', component: OtherSetting},
  // {path: '/mobile/data-manage', component: DataManage},
  // {path: '/mobile/collect', component: CollectPage},
  // {path: '/mobile/wrong', component: WrongPage},
  // {path: '/mobile/simple', component: SimplePage},
  // {path: '/mobile/about', component: About},
  // {path: '/mobile/feedback', component: Feedback},
  {path: '/test', component: Test},
  // {path: '/', redirect: '/pc/practice'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
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

router.beforeEach((to: any, from: any) => {
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
      let def = to.matched[0].components.default
      let toComponentName = def.name ?? def.__name
      runtimeStore.updateExcludeRoutes({type: 'remove', value: toComponentName})
      // console.log('删除', toComponentName)
      // console.log('前进')
      // console.log('删除', toComponentName)
    }
  } else {
    if (from.matched && from.matched.length) {
      let def = from.matched[0].components.default
      let fromComponentName = def.name ?? def.__name
      runtimeStore.updateExcludeRoutes({type: 'add', value: fromComponentName})
      // console.log('添加', fromComponentName)
      // console.log('后退')
    }
  }
  // ...
  // 返回 false 以取消导航
  return true
})


export default router
