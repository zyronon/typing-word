<script setup lang="ts">

import BackIcon from "@/components/icon/BackIcon.vue";
import {useRouter} from "vue-router";

const router = useRouter()
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="nav-bar">
    <BackIcon @click="router.back()"/>
    <div class="title" v-if="title">{{ title }}</div>
  </div>
</template>

<style scoped lang="scss">
.nav-bar {
  box-sizing: border-box;
  width: 100%;
  height: 50rem;
  padding: 0 var(--space);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 20rem;

  :deep(.back-icon) {
    left: var(--space);
    position: absolute;
  }
}
</style>