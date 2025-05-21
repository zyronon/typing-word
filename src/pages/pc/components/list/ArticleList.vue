<script setup lang="ts">

import Input from "@/pages/pc/components/Input.vue";
import {Article} from "@/types.ts";
import BaseList from "@/pages/pc/components/list/BaseList.vue";

const props = withDefaults(defineProps<{
  list: Article[],
  showTranslate?: boolean
}>(), {
  list: [],
  showTranslate: true,
})

const emit = defineEmits<{
  click: [val: { item: Article, index: number }],
  title: [val: { item: Article, index: number }],
}>()

let searchKey = $ref('')
let localList = $computed(() => {
  if (searchKey) {
    return props.list.filter((item: Article) => {
      //把搜索内容，分词之后，判断是否有这个词，比单纯遍历包含体验更好
      return searchKey.toLowerCase().split(' ').filter(v => v).some(value => {
        return item.title.toLowerCase().includes(value) || item.titleTranslate.toLowerCase().includes(value)
      })
    })
  } else {
    return props.list
  }
})

const listRef: any = $ref(null as any)

function scrollToBottom() {
  listRef?.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef?.scrollToItem(index)
}

defineExpose({scrollToBottom, scrollToItem})

</script>

<template>
  <div class="list">
    <div class="search">
      <Input v-model="searchKey"/>
    </div>
    <BaseList
        ref="listRef"
        @click="(e:any) => emit('click',e)"
        :list="localList"
        v-bind="$attrs">
      <template v-slot:prefix="{ item, index }">
        <slot name="prefix" :item="item" :index="index"></slot>
      </template>
      <template v-slot="{ item, index }">
        <div class="item-title"  >
          <div class="name"> {{ `${searchKey ? '' : (index + 1) + '. '}${item.title}` }}</div>
        </div>
        <div class="item-sub-title" v-if="item.titleTranslate && showTranslate">
          <div class="item-translate"> {{ `   ${item.titleTranslate}` }}</div>
        </div>
      </template>
      <template v-slot:suffix="{ item, index }">
        <slot name="suffix" :item="item" :index="index"></slot>
      </template>
    </BaseList>
  </div>
</template>

<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow: hidden;

  .search {
    box-sizing: border-box;
    width: 100%;
    padding: 0 var(--space);
  }

  .translate {
    font-size: 1rem;
  }
}
</style>