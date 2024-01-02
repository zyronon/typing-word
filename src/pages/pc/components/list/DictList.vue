<script setup lang="ts">
import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";
import DictItem from "@/pages/pc/components/list/DictItem.vue";

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
    <DictItem v-for="(dict,index) in list"
              :active="selectId === dict.id"
              @click="emit('selectDict',{dict,index})"
              @add="emit('add')"
              :dict="dict"/>
  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rem;
}

</style>