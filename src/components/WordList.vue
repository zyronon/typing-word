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
const props = defineProps<{
  list: Word[],
  activeIndex: number,
  isActive: boolean
}>()

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

  .item {
    background: var(--color-header-bg);
    border-radius: 6rem;
    padding: 12rem;
    display: flex;
    justify-content: space-between;
    transition: all .3s;
    color: var(--color-font-1);

    &.active {
      background: $second;
      color: white;
    }

    &:hover {
      //background: $dark-main-bg;
      //background: $item-hover;
      background: rgb(226, 226, 226);
    }

    .left {
      .letter {
        margin-bottom: 10rem;
        font-size: 24rem;
        line-height: 1;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
        display: flex;
      }

      .info {
        display: flex;
        gap: 20rem
      }
    }

    .right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>
