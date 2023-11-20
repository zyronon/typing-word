<script setup lang="ts">
import {$ref} from "vue/macros";
import {Icon} from "@iconify/vue";
import Close from "@/components/icon/Close.vue";
import {useWindowClick} from "@/hooks/event.ts";

defineProps<{
  modelValue: string
}>()

defineEmits(['update:modelValue'])
let focus = $ref(false)
let inputEl = $ref<HTMLDivElement>()

useWindowClick((e: PointerEvent) => {
  if (!e) return
  focus = inputEl.contains(e.target as any);
})

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
           @input="e=>$emit('update:modelValue',e.target.value)"
    >
    <Close @click="$emit('update:modelValue','')"/>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.base-input {
  border: 1px solid var(--color-second-bg);
  border-radius: 4rem;
  padding: 3rem 5rem;
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
    font-family: $font-family;
    font-size: 18rem;
    outline: none;
    min-height: 20rem;
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