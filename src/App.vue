<script setup lang="ts">

import Statistics from "@/components/Modal/Statistics.vue";
import {onMounted, watch} from "vue";
import {useBaseStore} from "@/stores/base.ts";
import {SaveKey} from "@/types.ts"
import Practice from "@/components/Practice.vue"

const store = useBaseStore()
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

onMounted(() => {
  store.init()
  if (store.theme !== 'auto') {
    document.documentElement.setAttribute('data-theme', store.theme)
  }
})
</script>

<template>
  <!--    <Backgorund/>-->
  <div class="main-page">
    <Practice/>
    <!--      <Side/>-->
    <Statistics></Statistics>
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
