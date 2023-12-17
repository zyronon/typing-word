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
  height: 60rem;
  padding: 0 var(--space);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  :deep(.back-icon) {
    left: var(--space);
    position: absolute;
  }
}
</style>