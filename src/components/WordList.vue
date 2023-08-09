<script setup lang="ts">
import {Word} from "../types";
import {usePlayWordAudio} from "../hooks/usePlayWordAudio";
import {watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"

const store = useBaseStore()
const emit = defineEmits(['change'])
const props = defineProps<{
  list: Word[],
  activeIndex: number,
  isActive: boolean
}>()

const [playAudio] = usePlayWordAudio()
const listRef: HTMLElement = $ref(null as any)

function scrollViewToCenter(index: number) {
  if (index === -1) return
  listRef.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
}

watch(() => props.activeIndex, (n: any) => {
  if (store.sideIsOpen) {
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
    <template v-for="(item,i) in list">
      <div class="item" @click="$emit('change',i)" :class="activeIndex === i && 'active'">
        <div class="left">
          <div class="letter">{{ item.name }}</div>
          <div class="info">
            <div class="translate">{{ item.trans.join('；') }}</div>
            <div class="phonetic">{{ item.usphone }}</div>
          </div>
        </div>
        <div class="right">
          <div class="audio" @click="playAudio(item.name)">播放</div>
          <div class="audio" @click="playAudio(item.name)">删除</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

.list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  width: 100%;
  height: 100%;
  padding: 0 $space;
  overflow: auto;
  box-sizing: border-box;

  .item {
    background: $dark-main-bg;
    border-radius: 6rem;
    padding: 10rem;
    //border: 1px solid gray;
    display: flex;
    justify-content: space-between;
    transition: all .3s;

    &.active {
      background: $second;
    }

    &:hover {
      background: $item-hover;
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
