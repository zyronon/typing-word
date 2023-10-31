<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import VolumeIcon from "@/components/VolumeIcon.vue";

defineProps<{
  showVolume?: boolean,
  active?: boolean
}>()

defineEmits<{
  toggleDel: [val: any],
  toggleCollect: [val: any],
  play: [],
}>()
</script>

<template>
  <div class="list-item"
       :class="{active}"
  >
    <div class="left">
      <slot></slot>
    </div>
    <div class="right">
      <BaseIcon
          @click="$emit('toggleDel')"
          title="收藏" icon="ph:star"/>
      <BaseIcon
          @click="$emit('toggleCollect')"
          title="删除" icon="fluent:delete-24-regular"/>

    </div>
  </div>
</template>

<style scoped lang="scss">
.list-item {
  width: 100%;
  box-sizing: border-box;
  background: white;
  color: black;
  font-size: 18rem;
  border-radius: 8rem;
  display: flex;
  justify-content: space-between;
  transition: all .3s;
  padding: 10rem;
  gap: 20rem;

  .left {
    display: flex;
    gap: 10rem;
    flex-direction: column;
    word-break: break-word;
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: 5rem;
    transition: all .3s;
    opacity: 0;
  }

  &:hover {
    background: rgb(226, 226, 226);

    .right {
      opacity: 1;
    }
  }

  &.active {
    background: var(--color-item-active);
    color: white !important;
  }
}
</style>