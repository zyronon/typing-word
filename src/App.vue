<script setup lang="ts">

import {onMounted, watch} from "vue";
import {useBaseStore} from "@/stores/base.ts";
import {SaveConfig, SaveDict} from "@/types.ts"
import Practice from "@/components/Practice/Practice.vue"
import {useEventListener, useStartKeyboardEventListener} from "@/hooks/event.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import Backgorund from "@/components/Backgorund.vue";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

// 查询当前系统主题颜色
const match: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
// 监听系统主题变化
match.addEventListener('change', followSystem)

function followSystem() {
  const theme = match.matches ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
}

watch(store.$state, (n) => {
  localStorage.setItem(SaveDict.key, JSON.stringify({val: n, version: SaveDict.version}))
})

watch(settingStore.$state, (n) => {
  localStorage.setItem(SaveConfig.key, JSON.stringify({val: n, version: SaveConfig.version}))
})

//检测几个特定词典
watch(store.collect.originWords, (n) => {
  store.collect.words = cloneDeep(n)
  store.collect.chapterWords = [store.collect.words]
})
watch(store.simple.originWords, (n) => {
  store.simple.words = cloneDeep(n)
  store.simple.chapterWords = [store.simple.words]
})
watch(store.wrong.originWords, (n) => {
  store.wrong.words = cloneDeep(n)
  store.wrong.chapterWords = [store.wrong.words]
})

useStartKeyboardEventListener()

onMounted(() => {
  store.init()
  settingStore.init()
  if (settingStore.theme !== 'auto') {
    document.documentElement.setAttribute('data-theme', settingStore.theme)
  }
})

useEventListener('keyup', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    let lastItem = runtimeStore.modalList.pop()
    lastItem && lastItem.close()
  }
})


onMounted(() => {
})
</script>

<template>
  <Transition name="fade">
    <Backgorund v-if="settingStore.theme === 'dark'"/>
  </Transition>
  <div class="main-page">
    <Practice/>
    <!--    <AddArticle/>-->
    <!--      <Side/>-->
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.main-page {
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14rem;
  display: flex;
  justify-content: center;
  background-color: var(--color-background);
}
</style>
