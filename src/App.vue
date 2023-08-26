<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue";
import Type from "@/components/Type.vue";
import Side from "@/components/Side.vue";
import Statistics from "@/components/Modal/Statistics.vue";
import Backgorund from "@/components/Backgorund.vue";
import {onMounted} from "vue";
import {useBaseStore} from "@/stores/base.ts";

const store = useBaseStore()
// 查询当前系统主题颜色
const match: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
// 监听系统主题变化
match.addEventListener('change', followSystem)

function followSystem() {
  if (store.theme === 'auto') {
    const theme = match.matches ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    // document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('appearance', theme)
  }
}

onMounted(() => {
  store.init()
  followSystem()
})
</script>

<template>
  <Backgorund/>
  <div class="main-page">
    <div class="center">
      <Toolbar/>
      <div class="content">
        <Type/>
      </div>
      <Side/>
    </div>
    <Statistics></Statistics>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.main-page {
  position: absolute;
  z-index: 1;
  width: 100vw;
  height: 100%;
  overflow: hidden;
  font-size: 14rem;
  display: flex;
  justify-content: center;
  background-color: var(--color-main-bg);

  .center {
    width: 70vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    //border: 1px solid gray;
    position: relative;

    .content {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

    }
  }
}
</style>
