<script setup lang="ts">

import Tooltip from "@/pages/pc/components/Tooltip.vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";

defineProps<{
  title?: string,
  icon: string,
  disabled?: boolean,
}>()

const emit = defineEmits(['click'])

</script>

<template>
  <Tooltip :title="title">
    <div
        v-bind="$attrs"
        @click="e => (!disabled) && emit('click',e)"
        class="icon-wrapper"
        :class="{disabled}"
    >
      <Icon :icon="icon"/>
    </div>
  </Tooltip>
</template>

<style scoped lang="scss">

$w: 1.4rem;
.icon-wrapper {
  cursor: pointer;
  //padding: 2rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: .3rem;
  background: transparent;
  transition: all .3s;
  //color: var(--color-main-active);

  &:hover:not(.disabled) {
    background: var(--color-primary);
    color: white;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: .3;
  }

  :deep(svg) {
    width: $w;
    height: $w;
  }
}
</style>