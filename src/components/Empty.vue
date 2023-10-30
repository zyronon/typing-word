<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="empty">
    <img src="@/assets/img/缺省页_空白页-通用.svg" alt="">
    <span>{{ text ?? '空荡荡的~'}}</span>
  </div>
</template>

<style scoped lang="scss">
.empty {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 12rem;
  gap: 20rem;

  img {
    width: 120rem;
  }
}
</style>