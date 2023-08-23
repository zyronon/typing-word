<script setup lang="ts">
import {KeyboardOne} from "@icon-park/vue-next";
import Tooltip from "@/components/Tooltip.vue";

const props = defineProps<{
  keyboard?: string,
  active?: boolean
}>()

</script>

<template>
  <Tooltip :disabled="!keyboard" :title="`快捷键: ${keyboard}`">
    <div class="my-button" :class="active && 'active'">
      <span><slot></slot></span>
      <div class="key-notice" v-if="keyboard">
        <keyboard-one theme="outline" size="14" fill="#ffffff" :strokeWidth="2"/>
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
  height: 40rem;
  line-height: 1;

  & > span {
    font-size: 16rem;
    color: white;

    ::v-deep a {
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