<script setup lang="ts">
interface IProps {
  modelValue?: boolean,
  width?: string
}

withDefaults(defineProps<IProps>(), {
  modelValue: true,
  width: '180rem'
})

</script>

<template>
  <Transition name="fade">
    <div v-if="modelValue" class="mini-modal" :style="{width}">
      <slot></slot>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "@/assets/css/style";

.mini-row-title {
  min-height: 35rem;
  text-align: center;
  font-size: 16rem;
  font-weight: bold;
  color: var(--color-font-1);
}

.mini-row {
  min-height: 35rem;
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
  width: 180rem;
  background: var(--color-second-bg);
  border-radius: 8rem;
  box-shadow: 0 0 8px 2px var(--color-item-border);
  padding: 10rem var(--space);
  top: 40rem;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  //margin-top: 10rem;
}
</style>