<script setup lang="ts">
import {Dict, DictResource} from "@/types.ts";
import {Icon} from "@iconify/vue";
import DictItem from "@/pages/pc/components/list/DictItem.vue";

defineProps<{
  list?: DictResource[],
  selectId?: string
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
    <DictItem v-for="(dict,index) in list"
              :active="selectId === dict.id"
              @click="emit('selectDict',{dict,index})"
              @add="emit('add')"
              @del="emit('del',{dict,index})"
              :dict="dict"/>
  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

</style>
