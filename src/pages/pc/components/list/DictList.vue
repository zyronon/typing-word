<script setup lang="ts">
import {Dict} from "@/types/types.ts";
import Book from "@/pages/pc/components/Book.vue";

defineProps<{
  list?: Partial<Dict>[],
  selectId?: string
  quantifier?: string
}>()

const emit = defineEmits<{
  selectDict: [val: { dict: any, index: number }]
  del: [val: { dict: any, index: number }]
  detail: [],
  add: []
}>()

</script>

<template>
  <div class="grid grid-cols-6 gap-4 ">
    <Book v-for="(dict,index) in list"
          :is-add="false"
          @click="emit('selectDict',{dict,index})"
          :quantifier="quantifier"
          :item="dict"/>
  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

</style>
