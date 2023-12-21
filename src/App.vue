<script setup lang="ts">

import {onMounted, watch} from "vue";
import {BaseState, useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import Backgorund from "@/components/Backgorund.vue";
import useTheme from "@/hooks/theme.ts";
import * as localforage from "localforage";
import SettingDialog from "@/components/dialog/SettingDialog.vue";
import ArticleContentDialog from "@/components/dialog/ArticleContentDialog.vue";
import CollectNotice from "@/components/CollectNotice.vue";
import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {isMobile, shakeCommonDict} from "@/utils";
import {routes} from "@/router.ts";
import {$ref} from "vue/macros";
import {useRoute} from "vue-router";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const {setTheme} = useTheme()

watch(store.$state, (n: BaseState) => {
  localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: shakeCommonDict(n), version: SAVE_DICT_KEY.version}))
})

watch(settingStore.$state, (n) => {
  localStorage.setItem(SAVE_SETTING_KEY.key, JSON.stringify({val: n, version: SAVE_SETTING_KEY.version}))
})

//检测几个特定词典
watch(store.collect.originWords, (n) => {
  if (n.length === 0) {
    store.collect.words = []
    store.collect.chapterWords = []
  } else {
    store.collect.words = cloneDeep(n)
    store.collect.chapterWords = [store.collect.words]
  }
})
watch(store.simple.originWords, (n) => {
  if (n.length === 0) {
    store.simple.words = []
    store.simple.chapterWords = []
  } else {
    store.simple.words = cloneDeep(n)
    store.simple.chapterWords = [store.simple.words]
  }
})
watch(store.wrong.originWords, (n) => {
  if (n.length === 0) {
    store.wrong.words = []
    store.wrong.chapterWords = []
  } else {
    store.wrong.words = cloneDeep(n)
    store.wrong.chapterWords = [store.wrong.words]
  }
})

async function init() {
  // console.time()
  store.init().then(() => {
    store.load = true
    // console.timeEnd()
  })
  await settingStore.init()
  setTheme(settingStore.theme)
}

onMounted(() => {
  init()

  if (isMobile()) {
    // 当前设备是移动设备
    console.log('当前设备是移动设备')
    // router.replace('/mobile')
  }
})
let transitionName = $ref('go')
const route = useRoute()
watch(() => route.path, (to, from) => {
  // console.log('watch', to, from)
  // //footer下面的5个按钮，对跳不要用动画
  let noAnimation = [
    '/pc/practice',
    '/pc/dict',
    '/mobile',
    '/'
  ]
  if (noAnimation.indexOf(from) !== -1 && noAnimation.indexOf(to) !== -1) {
    return transitionName = ''
  }

  const toDepth = routes.findIndex(v => v.path === to)
  const fromDepth = routes.findIndex(v => v.path === from)
  transitionName = toDepth > fromDepth ? 'go' : 'back'
  // console.log('transitionName', transitionName, toDepth, fromDepth)
})
</script>

<template>
  <Backgorund/>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName">
      <keep-alive :exclude="runtimeStore.excludeRoutes">
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
  <CollectNotice/>
  <ArticleContentDialog/>
  <SettingDialog/>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.main-page {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14rem;
  display: flex;
  justify-content: center;
}
</style>
