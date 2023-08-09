<script setup lang="ts">

import {Word} from "@/types.ts"

const props = defineProps<{
  list: Word[],
  activeIndex: number
}>()

const emit = defineEmits(['update:activeIndex'])

function next() {
}

</script>

<template>
  <div class="list">
    <div class="item" :class="activeIndex === index && 'active'"
         v-for="(item,index) in list" @click="$emit('update:activeIndex', index)">
      <div class="title">{{ index + 1 }}.</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

.list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  width: 100%;
  height: 100%;
  padding: 0 $space;
  overflow: auto;
  box-sizing: border-box;

  .item {
    cursor: pointer;
    margin-bottom: 10rem;
    padding: 10rem;
    border-radius: 10rem;
    border: 1px solid gray;

    &.active {
      background: $second;
      border: 1px solid $second;
    }
  }
}
</style>