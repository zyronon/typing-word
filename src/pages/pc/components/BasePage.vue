<script setup lang="ts">

</script>

<template>
  <div class="flex justify-center">
    <div class="page w-[70vw] 2xl:w-[50vw]">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: calc(100vh - 1.2rem);
  margin-top: 1.2rem;
}
</style>
