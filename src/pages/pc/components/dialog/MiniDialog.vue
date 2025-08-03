<script setup lang="ts">
import {nextTick, onMounted, watch} from "vue";

interface IProps {
  modelValue?: boolean,
  width?: string
}

let props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
  width: '180rem'
})
let modalRef = $ref(null)
let style = $ref({top: '2.4rem', bottom: 'unset'})

watch(() => props.modelValue, (n) => {
  if (n)
    nextTick(() => {
      if (modalRef) {
        const modal = modalRef as HTMLElement
        if (modal.getBoundingClientRect().bottom > window.innerHeight) {
          style = {top: 'unset', 'bottom': '2.5rem'}
        }
      }
    })
})
</script>

<template>
  <Transition name="fade">
    <div v-if="modelValue" ref="modalRef" class="mini-modal" :style="{width, ...style}">
      <slot></slot>
    </div>
  </Transition>
</template>

<style lang="scss">


.mini-row-title {
  min-height: 2rem;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-font-1);
}

.mini-row {
  min-height: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space);
  color: var(--color-font-1);
  word-break: keep-all;
}

.mini-modal {
  position: absolute;
  z-index: 9;
  width: 12rem;
  background: var(--color-second);
  border-radius: .5rem;
  box-shadow: 0 0 8px 2px var(--color-item-border);
  padding: .6rem var(--space);
  //top: 2.4rem;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  //margin-top: 10rem;
}
</style>
