<script setup lang="ts">

import {Word} from "@/types.ts"
import {emitter, EventKey} from "@/utils/eventBus.ts";

defineProps<{
  list: Word[][],
  activeIndex?: number
}>()

const emit = defineEmits<{
  'update:activeIndex': [index: number]
  showWord: [list: any[]]
}>()

</script>

<template>
  <div class="list">
    <div class="item"
         :class="activeIndex === index && 'active'"
         v-for="(item,index) in list"
         @click="emit('update:activeIndex', index)">
      <input type="radio" :checked="activeIndex === index">
      <div class="title">
        <div>第{{ index + 1 }}章</div>
        <div class="count"
             @click.stop="emitter.emit(EventKey.openWordListModal,{title:`第${index + 1}章`,list:item})"
        >{{ item.length }}词
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.list {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
  gap: 10rem;
  //padding-right: 10rem;

  .item {
    padding: 15rem;
    background: var(--color-item-bg);
    color: var(--color-font-1);
    display: flex;
    gap: 10rem;
    border-radius: 8rem;
    border-bottom: 1px solid #e1e1e1;

    &.active {
      background: var(--color-item-active);
      color: var(--color-font-active-1);

      .count {
        border-bottom: 2px solid white !important;
      }
    }

    input {
      cursor: pointer;
    }

    .title {
      display: flex;
      gap: 10rem;

      .count {
        cursor: pointer;
        border-bottom: 2px solid var(--color-item-active);
      }
    }
  }
}
</style>