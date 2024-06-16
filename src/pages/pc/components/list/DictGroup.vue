<script setup lang="ts">
import {DictResource} from "@/types.ts";
import DictItem from "@/pages/pc/components/list/DictItem.vue";

const props = defineProps<{
  item: {
    list: any[],
    tags: string[],
    name: string,
  },
  selectId: string
}>()
const emit = defineEmits<{
  selectDict: [val: { dict: DictResource, index: number }]
  detail: [],
}>()
let currentTag = $ref(props.item.tags[0])
let localList = $computed(() => {
  return props.item.list.filter(v => v.tags.includes(currentTag))
})


</script>

<template>
  <div class="dict-group">
    <div class="flex items-start border py-4">
      <div class="text-xl break-keep mt-1">{{ item.name }}：</div>
      <div class="tags">
        <div class="tag" :class="i === currentTag &&'active'"
             @click="currentTag = i"
             v-for="i in item.tags">{{ i }}
        </div>
      </div>
    </div>

    <div class="dict-list1 grid grid-cols-4 gap-4">
      <DictItem v-for="(dict,index) in localList"
                :active="selectId === dict.id"
                @click="emit('selectDict',{dict,index})"
                :dict="dict"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dict-group {
  color: var(--color-font-1);
  margin-bottom: 1.5rem;

  .border {
    border-top: 1px dashed gray;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;

  .tag {
    color: var(--color-font-1);
    cursor: pointer;
    padding: 0.4rem 1rem;
    border-radius: 2rem;

    &.active {
      color: var(--color-font-active-1);
      background: gray;
    }
  }
}

</style>