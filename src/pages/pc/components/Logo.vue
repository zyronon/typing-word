<script setup lang="ts">
import {useSettingStore} from "@/stores/setting.ts";
import router from "@/router.ts";

const settingStore = useSettingStore()
function goHome(){
  router.push('/')
}
</script>

<template>
  <div class="logo" @click="goHome">
    <img v-show="settingStore.theme === 'dark'" src="/logo-text-white.png" alt="">
    <img v-show="settingStore.theme !== 'dark'" src="/logo-text-black.png" alt="">
  </div>
</template>

<style scoped lang="scss">
.logo {
  position: fixed;
  left: var(--space);
  top: var(--space);
  z-index: 1;

  img {
    cursor: pointer;
    height: 35rem;
  }
}
</style>