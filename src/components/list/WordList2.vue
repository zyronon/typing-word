<script setup lang="ts">
import {Word} from "../../types.ts";
import {useSettingStore} from "@/stores/setting.ts";
import WordItem from "@/components/list/WordItem.vue";

const props = withDefaults(defineProps<{
  list: Word[],
  activeIndex?: number,
  showDel?: boolean,
  isActive?: boolean
  showTranslate?: boolean
  showWord?: boolean
}>(), {
  activeIndex: -1,
  isActive: false,
  showDel: false,
  showTranslate: true,
  showWord: true
})

const emit = defineEmits<{
  del: [val: Word],
  change: [i: number]
}>()

const settingStore = useSettingStore()
//
// const listRef: HTMLElement = $ref(null as any)
//
// function scrollViewToCenter(index: number) {
//   if (index === -1) return
//   listRef.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
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
//
// watch(() => props.list, () => {
//   listRef.scrollTo(0, 0)
// })

</script>

<template>
  <virtual-list class="virtual-list"
                :keeps="20"
                data-key="name"
                :data-sources="list"
                :estimate-size="85"
                item-class="dict-virtual-item"
  >
    <template #={source}>
      <WordItem :word="source">
        <slot :word="source"></slot>
      </WordItem>
    </template>
  </virtual-list>
</template>

<style lang="scss">
@import "@/assets/css/variable";

.virtual-list {
  overflow: overlay;
  height: 100%;
  padding: 0 $space;
}

.dict-virtual-item {
  margin-bottom: 15rem;
}

</style>
