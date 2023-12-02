<script setup lang="ts">
import {$computed, $ref} from "vue/macros";
import {watch} from "vue";
import {DictResource} from "@/types.ts";
import DictItem from "@/components/list/DictItem.vue";
import DictList from "@/components/list/DictList.vue";

const props = defineProps<{
  category: string,
  groupByTag: any,
  selectDictName: string
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
  <div class="dict-group">
    <div class="category">{{ category }}</div>
    <div class="tags">
      <div class="tag" :class="i === currentTag &&'active'"
           @click="currentTag = i"
           v-for="i in Object.keys(groupByTag)">{{ i }}
      </div>
    </div>
    <DictList
        @selectDict="e => emit('selectDict',e)"
        :list="list" :select-dict-name="selectDictName"/>
  </div>
</template>

<style scoped lang="scss">
.dict-group {
  color: var(--color-font-1);
  margin-bottom: 40rem;
  //border-bottom: 1px dashed gray;

  .category {
    font-size: 24rem;
    padding-bottom: 10rem;
    border-bottom: 1px dashed gray;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin: 10rem 0;

  .tag {
    color: var(--color-font-1);
    cursor: pointer;
    padding: 5rem 10rem;
    border-radius: 20rem;

    &.active {
      color: var(--color-font-active-1);
      background: gray;
    }
  }
}

</style>