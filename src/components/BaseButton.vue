<script setup lang="ts">
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {Icon} from "@iconify/vue";

interface IProps {
  keyboard?: string,
  active?: boolean
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'normal' | 'large',
  type?: 'primary' | 'link' | 'info'
}

withDefaults(defineProps<IProps>(), {
  type: 'primary',
  size: 'normal',
})

defineEmits(['click'])

</script>

<template>
  <Tooltip :disabled="!keyboard" :title="`${keyboard}`">
    <div class="base-button"
         v-bind="$attrs"
         @click="e => (!disabled && !loading) && $emit('click',e)"
         :class="[
             active && 'active',
             size,
             type,
             (disabled||loading) && 'disabled',
         ]">
      <span :style="{opacity:loading?0:1}"><slot></slot></span>
      <Icon v-if="loading"
            class="loading"
            icon="eos-icons:loading"
            width="18"
            color="#ffffff"
      />
      <div class="key-notice" v-if="keyboard">
        <Icon icon="bi:keyboard" width="14" color="#ffffff"/>
        <span class="key">{{ keyboard }}</span>
      </div>
    </div>
  </Tooltip>
</template>

<style scoped lang="scss">

.base-button {
  cursor: pointer;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  text-align: center;
  transition: .1s;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  border-radius: .3rem;
  padding: 0 0.9rem;
  font-size: .9rem;
  height: 2rem;
  color: white;

  & + .base-button {
    margin-left: var(--space);
  }

  .loading {
    position: absolute;
  }

  &.disabled {
    opacity: .6;
    cursor: not-allowed;
    user-select: none;
  }

  &.small {
    border-radius: 0.2rem;
    padding: 0 0.8rem;
    height: 1.6rem;
    font-size: .8rem;
  }

  &.large {
    padding: 0 1.3rem;
    height: 2.4rem;
    font-size: 0.9rem;
  }

  & > span {
    line-height: 1;
    transform: translateY(-5%);

    :deep(a) {
      color: white;
    }
  }

  &:hover {
    opacity: .8;
  }

  &.primary {
    background: var(--btn-primary);
  }

  &.link {
    border-radius: 0;
    border-bottom: 2px solid transparent;

    &:hover {
      border-bottom: 2px solid var(--color-font-2);
    }
  }

  &.info {
    background: var(--btn-info);
    border: 1px solid  var(--color-main-text);
    color: var(--color-main-text);
  }

  &.active {
    opacity: .4;
  }
}

.key-notice {
  margin-left: .6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  color: white;
  //gap: 2rem;

  .key {
    transform: scale(0.8);
  }
}
</style>
