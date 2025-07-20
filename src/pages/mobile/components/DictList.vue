<script setup lang="ts">
import {Dict} from "@/types.ts";

defineProps<{
  list?: Dict[],
  selectId?: string
}>()

const emit = defineEmits<{
  selectDict: [val: { dict: any, index: number }]
  detail: [],
  add: []
}>()

</script>

<template>
  <div class="dict-list">

  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rem;
}

</style>
