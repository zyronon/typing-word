<script setup lang="ts">
import Tooltip from "@/components/Tooltip.vue";
import {Icon} from "@iconify/vue";

defineProps<{
  keyboard?: string,
  active?: boolean
  disabled?: boolean
  size?: string
}>()

defineEmits(['click'])

function click() {

}
</script>

<template>
  <Tooltip :disabled="!keyboard" :title="`快捷键: ${keyboard}`">
    <div class="my-button"
         @click="!disabled && $emit('click')"
         :class="[
             active && 'active',
             size,
             disabled && 'disabled',
             !disabled && 'hvr-grow'
         ]">
      <span><slot></slot></span>
      <div class="key-notice" v-if="keyboard">
        <Icon icon="bi:keyboard" width="14" color="#ffffff"/>
        <span class="key">{{ keyboard }}</span>
      </div>
    </div>
  </Tooltip>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.my-button {
  cursor: pointer;
  border-radius: 6rem;
  padding: 0 15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .3s;
  background: rgb(75, 85, 99);
  //background: #999;
  //background: rgb(60, 63, 65);
  //background: var(--color-second-bg);
  height: 36rem;
  line-height: 1;

  &.disabled {
    opacity: .6;
    cursor: not-allowed;
    user-select: none;
  }

  &.small {
    height: 30rem;

    & > span {
      font-size: 13rem;
    }
  }

  & > span {
    font-size: 16rem;
    color: white;

    :deep(a) {
      color: white;
    }
  }

  &:hover {
    opacity: .7;
  }

  &.large {
    height: 50rem;
    font-size: 18rem;
    padding: 0 18rem;
  }

  &.primary {
    background: $main;
  }

  &.active {
    opacity: .4;
  }
}

.key-notice {
  margin-left: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12rem;
  color: white;
  //gap: 2rem;

  .key {
    transform: scale(0.8);
  }
}
</style>