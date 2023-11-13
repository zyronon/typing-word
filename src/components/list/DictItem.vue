<script setup lang="ts">

import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";

defineProps<{
  dict?: Dict,
  active?: boolean
}>()

const emit = defineEmits<{
  selectDict: [val: { dict: Dict, index: number }]
  add: []
}>()

</script>

<template>
  <div
      class="dict-item anim"
      :class="active && 'active'"
  >
    <template v-if="dict.name">
      <div class="name">{{ dict.name }}</div>
      <div class="desc">{{ dict.description }}</div>
      <div class="num">{{ dict.length }}词</div>
    </template>
    <div v-else class="add" @click.stop="emit('add')">
      <Icon icon="fluent:add-20-filled" width="38" color="#929596"/>
    </div>
  </div>

</template>

<style scoped lang="scss">
.dict-item {
  cursor: pointer;
  padding: 10rem;
  min-height: 100rem;
  border-radius: 10rem;
  position: relative;
  background: var(--color-item-bg);
  color: var(--color-font-1);
  font-size: 14rem;

  .name {
    font-size: 18rem;
  }

  .desc {
    color: var(--color-font-2);
  }

  .num {
    font-weight: bold;
  }

  .go {
    position: absolute;
    right: 10rem;
    bottom: 15rem;
  }

  &.active {
    background: var(--color-item-active);
    color: var(--color-font-active-1);

    .desc {
      color: var(--color-font-active-2);
    }
  }

  &:hover {
    background: var(--color-item-active);
  }

  .add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}

</style>