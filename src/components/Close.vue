<script setup lang="ts">
import {Icon} from "@iconify/vue";

defineEmits(['click'])
</script>

<template>
  <div class="close"
       @click="$emit('click')"
  >
    <Icon icon="ic:round-close"
          width="20"
    />
  </div>
</template>

<style scoped lang="scss">
.close {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>