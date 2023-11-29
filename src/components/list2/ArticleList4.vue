<script setup lang="ts">

import Input from "@/components/Input.vue";
import {$computed, $ref} from "vue/macros";
import {Article, Word} from "@/types.ts";
import ListItem from "@/components/list/ListItem.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {onMounted, useAttrs, watch} from "vue";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import BaseList from "@/components/list2/BaseList.vue";

const props = withDefaults(defineProps<{
  list: Article[],
  isActive?: boolean
  showTranslate?: boolean
}>(), {
  list: [],
  activeIndex: -1,
  isActive: false,
  showTranslate: true
})

const emit = defineEmits<{
  click: [val: { data: Article, index: number }],
  delSelectItem: [],
  'update:searchKey': [val: string],
  'update:list': [list: Article[]],
}>()

let searchKey = $ref('')
let localList = $computed({
  get() {
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
  },
  set(newValue) {
    emit('update:list', newValue)
  }
})

const settingStore = useSettingStore()

const listRef: HTMLElement = $ref(null as any)

// function scrollViewToCenter(index: number) {
//   if (index === -1) return
//   listRef.children[index + 1]?.scrollIntoView({block: 'center', behavior: 'smooth'})
// }
//
// watch(() => props.activeIndex, (n: any) => {
//   if (settingStore.showPanel) {
//     scrollViewToCenter(n)
//   }
// })
//
// watch(() => props.isActive, (n: boolean) => {
//   setTimeout(() => {
//     if (n) scrollViewToCenter(props.activeIndex)
//   }, 300)
// })

// watch(() => props.list, () => {
//   // listRef.scrollTo(0, 0)
// })

function scrollToBottom() {
  listRef?.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef?.scrollToItem(index)
}

let attr = useAttrs()
onMounted(() => {
  console.log('atr', attr)
})
defineExpose({scrollToBottom, scrollToItem})

</script>

<template>
  <div class="list">
    <div class="search">
      <Input v-model="searchKey"/>
    </div>
    <BaseList :list="localList"
              v-bind="$attrs">
      <template v-slot:prefix="{ item, index, active }">
        <slot name="prefix" :item="item" :index="index"></slot>
      </template>
      <template v-slot="{ item, index, active }">
        <div class="item-title">
          <div class="name"> {{ `${index + 1}. ${item.title}` }}</div>
        </div>
        <div class="item-sub-title" v-if="item.titleTranslate && showTranslate">
          <div class="item-translate"> {{ `   ${item.titleTranslate}` }}</div>
        </div>
      </template>
      <template v-slot:suffix="{ item, index, active }">
        <slot name="suffix" :item="item" :index="index"></slot>
      </template>
    </BaseList>
  </div>
</template>

<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  flex: 1;
  overflow: hidden;

  .search {
    box-sizing: border-box;
    width: 100%;
    padding: 0 var(--space);
  }

  .translate {
    font-size: 16rem;
  }
}
</style>