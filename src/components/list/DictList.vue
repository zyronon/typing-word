<script setup lang="ts">
import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";
import DictItem from "@/components/list/DictItem.vue";

const props = defineProps<{
  list?: Dict[],
  selectDictName?: string
}>()

const emit = defineEmits<{
  selectDict: [val: { dict: Dict, index: number }]
  detail: [],
  add: []
}>()

</script>

<template>
  <div class="dict-list">
    <DictItem v-for="(dict,index) in list"
              @click="emit('selectDict',{dict,index})"
              @add="emit('add')"
              :dict="dict"/>
  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15rem;
}

</style>