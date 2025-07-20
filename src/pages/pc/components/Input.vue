<script setup lang="ts">

import {Icon} from "@iconify/vue";
import Close from "@/components/icon/Close.vue";
import {useDisableEventListener, useWindowClick} from "@/hooks/event.ts";

defineProps<{
  modelValue: string
  placeholder?: string
  autofocus?: boolean
}>()

defineEmits(['update:modelValue'])
let focus = $ref(false)
let inputEl = $ref<HTMLDivElement>()

useWindowClick((e: PointerEvent) => {
  if (!e) return
  focus = inputEl.contains(e.target as any);
})

useDisableEventListener(() => focus)

const vFocus = {
  mounted: (el, bind) => {
    if (bind.value) {
      el.focus()
      setTimeout(() => focus = true)
    }
  }
}
</script>

<template>
  <div class="base-input"
       :class="{focus}"
       ref="inputEl"
  >
    <Icon icon="fluent:search-24-regular"
          width="20"/>
    <input type="text"
           :value="modelValue"
           v-focus="autofocus"
           :placeholder="placeholder"
           @input="e=>$emit('update:modelValue',e.target.value)"
    >
    <transition name="fade">
      <Close v-if="modelValue" @click="$emit('update:modelValue','')"/>
    </transition>
  </div>
</template>

<style scoped lang="scss">


.base-input {
  border: 1px solid var(--color-input-border);
  border-radius: .4rem;
  overflow: hidden;
  padding: .2rem .3rem;
  transition: all .3s;
  display: flex;
  align-items: center;
  transition: all .3s;
  background: var(--color-input-bg);

  :deep(svg) {
    transition: all .3s;
    color: var(--color-input-icon);
  }

  &.focus {
    border: 1px solid var(--color-main-active);

    :deep(svg) {
      color: gray;
    }
  }

  input {
    font-family: var(--font-family);
    font-size: 1.1rem;
    outline: none;
    min-height: 1.2rem;
    flex: 1;
    box-sizing: border-box;
    outline: none;
    border: none;
    background: transparent;

    &[readonly] {
      cursor: not-allowed;
      opacity: .7;
    }
  }
}
</style>
