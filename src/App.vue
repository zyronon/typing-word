<script setup lang="ts">
import {onMounted, watch} from "vue";
import {BaseState, useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import Backgorund from "@/pages/pc/components/Backgorund.vue";
import useTheme from "@/hooks/theme.ts";
import * as localforage from "localforage";
import SettingDialog from "@/pages/pc/components/dialog/SettingDialog.vue";
import CollectNotice from "@/pages/pc/components/CollectNotice.vue";
import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {isMobile, shakeCommonDict} from "@/utils";
import router, {routes} from "@/router.ts";

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
    router.replace('/mobile')
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
