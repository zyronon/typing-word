<script setup lang="ts">

import {onMounted, watch} from "vue";
import {useBaseStore} from "@/stores/base.ts";
import {SaveKey} from "@/types.ts"
import Practice from "@/components/Practice/Practice.vue"
import AddArticle from "@/components/Practice/AddArticle.vue";
import {useEventListener, useStartKeyboardEventListener} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()

// 查询当前系统主题颜色
const match: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
// 监听系统主题变化
match.addEventListener('change', followSystem)

function followSystem() {
  const theme = match.matches ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
}

watch(store.$state, (n) => {
  // console.log('state', JSON.stringify(n.current, null, 2))
  localStorage.setItem(SaveKey, JSON.stringify(n))
})

useStartKeyboardEventListener()

onMounted(() => {
  store.init()
  if (store.theme !== 'auto') {
    document.documentElement.setAttribute('data-theme', store.theme)
  }
})

useEventListener('keyup', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    let lastItem = runtimeStore.modalList.pop()
    lastItem && lastItem.close()
  }
})
</script>

<template>
  <!--    <Backgorund/>-->
  <div class="main-page">
    <Practice/>
    <!--    <AddArticle/>-->
    <!--      <Side/>-->
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.main-page {
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14rem;
  display: flex;
  justify-content: center;
  background-color: var(--color-main-bg);
}
</style>
