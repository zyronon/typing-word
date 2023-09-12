<script setup lang="ts">
import {Word} from "../types";
import {usePlayWordAudio} from "../hooks/usePlayWordAudio";
import {watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {Icon} from '@iconify/vue';

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
    <TransitionGroup name="list">
      <template v-for="(item,i) in list" :key="i">
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
            <Icon icon="fluent:delete-28-regular" width="20" color="#929596"/>
          </div>
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>


<style scoped lang="scss">
@import "@/assets/css/colors";

.list {
  display: flex;
  flex-direction: column;
  gap: 12rem;
  width: 100%;
  height: 100%;
  padding: 0 $space;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

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
      background: rgb(226,226,226);
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
