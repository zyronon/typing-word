<script setup lang="ts">
import {Word} from "../types";
import {watch} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import WordItem from "@/components/WordItem.vue";

const settingStore = useSettingStore()
const emit = defineEmits<{
  del: [i: number],
  change: [i: number]
}>()
const props = withDefaults(defineProps<{
  list: Word[],
  activeIndex?: number,
  isActive?: boolean
}>(), {
  activeIndex: -1,
  isActive: false
})

const listRef: HTMLElement = $ref(null as any)

function scrollViewToCenter(index: number) {
  if (index === -1) return
  listRef.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
}

watch(() => props.activeIndex, (n: any) => {
  if (settingStore.showPanel) {
    scrollViewToCenter(n)
  }
})

watch(() => props.isActive, (n: boolean) => {
  setTimeout(() => {
    if (n) scrollViewToCenter(props.activeIndex)
  }, 300)
})

watch(() => props.list, () => {
  listRef.scrollTo(0, 0)
})

</script>

<template>
  <div class="list" ref="listRef">
    <TransitionGroup name="list">
      <template v-for="(item,i) in list" :key="i">
        <WordItem
            @click="emit('change',i)"
            @del="emit('del',i)"
            :active="activeIndex === i"
            :word="item"/>
      </template>
    </TransitionGroup>
  </div>
</template>


<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.list {
  display: flex;
  flex-direction: column;
  gap: 12rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 $space;
  overflow: auto;

}
</style>
