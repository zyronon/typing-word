<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";

defineProps<{
  text?: string
  showAdd?: boolean
}>()

defineEmits<{
  add: []
}>()
</script>

<template>
  <div class="empty">
    <img src="@/assets/img/缺省页_空白页-通用.svg" alt="">
    <span>{{ text ?? '空荡荡的~' }}</span>
    <BaseButton v-if="showAdd" @click="$emit('add')">添加</BaseButton>
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

  span {
    font-family: var(--font-family);
  }

  img {
    margin-top: -50rem;
    width: 120rem;
  }
}
</style>