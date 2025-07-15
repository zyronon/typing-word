<script setup lang="ts">
import {watch} from "vue";
import {DictResource} from "@/types.ts";
import DictList from "@/pages/pc/components/list/DictList.vue";

const props = defineProps<{
  category: string,
  groupByTag: any,
  selectId: string
}>()
const emit = defineEmits<{
  selectDict: [val: { dict: DictResource, index: number }]
  detail: [],
}>()
const tagList = $computed(() => Object.keys(props.groupByTag))
let currentTag = $ref(tagList[0])
let list = $computed(() => {
  return props.groupByTag[currentTag]
})

watch(() => props.groupByTag, () => {
  currentTag = tagList[0]
})

</script>

<template>
  <div >
    <div class="flex items-center">
      <div class="category">{{ category }}：</div>
      <div class="tags">
        <div class="tag" :class="i === currentTag &&'active'"
             @click="currentTag = i"
             v-for="i in Object.keys(groupByTag)">{{ i }}
        </div>
      </div>
    </div>

    <DictList
        @selectDict="e => emit('selectDict',e)"
        :list="list"
        :select-id="selectId"/>
  </div>
</template>

<style scoped lang="scss">

.tags {
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0;

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
