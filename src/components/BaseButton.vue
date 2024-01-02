<script setup lang="ts">
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {Icon} from "@iconify/vue";

interface IProps {
  keyboard?: string,
  active?: boolean
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'normal' | 'large',
  type?: 'primary' | 'link'
}

withDefaults(defineProps<IProps>(), {
  type: 'primary',
  size: 'normal',
})

defineEmits(['click'])

</script>

<template>
  <Tooltip :disabled="!keyboard" :title="`快捷键: ${keyboard}`">
    <div class="base-button"
         v-bind="$attrs"
         @click="e => (!disabled && !loading) && $emit('click',e)"
         :class="[
             active && 'active',
             size,
             type,
             (disabled||loading) && 'disabled',
             !disabled && 'hvr-grow'
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
@import "@/assets/css/style";

.base-button {
  cursor: pointer;
  border-radius: 6rem;
  padding: 0 15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .3s;
  //background: #999;
  //background: rgb(60, 63, 65);
  //background: var(--color-second-bg);
  height: 36rem;
  line-height: 1;
  position: relative;

  .loading {
    position: absolute;
  }

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

  &.large {
    height: 50rem;
    font-size: 18rem;
    padding: 0 22rem;
    & > span {
      font-size: 18rem;
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


  &.primary {
    background: rgb(75, 85, 99);
  }

  &.link {
    border-radius: 0;
    border-bottom: 2px solid transparent;

    &:hover {
      border-bottom: 2px solid var(--color-font-1);
    }
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