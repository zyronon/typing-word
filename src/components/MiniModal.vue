<script setup lang="ts">
interface IProps {
  modelValue?: boolean,
}

withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

</script>

<template>
  <Transition name="fade">
    <div v-if="modelValue" class="mini-modal">
      <slot></slot>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "@/assets/css/style.scss";

.mini-row {
  min-height: 35rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space;
  color: black;
  word-break: keep-all;
}

.mini-modal {
  position: absolute;
  z-index: 9;
  width: 180rem;
  background: white;
  border-radius: 8rem;
  box-shadow: 1px 1px 6px #bbbbbb;
  padding: 10rem $space;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10rem;
}
</style>