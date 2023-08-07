<script setup lang="ts">
import {Word} from "../types";
import {usePlayWordAudio} from "../hooks/usePlayWordAudio";
import {inject, nextTick, watch} from "vue"

const sideIsOpen = inject('sideIsOpen')
const props = defineProps<{wordList: Word[], index: number}>()
const [playAudio] = usePlayWordAudio()
const listRef: HTMLElement = $ref(null)
watch(() => props.index, (n: number) => {
  if (sideIsOpen.value) {
    nextTick(() => {
      listRef.querySelector('.active').scrollIntoView({block: 'center', behavior: 'smooth'})
    })
  }
})
</script>

<template>
  <div class="words">
    <div class="list" ref="listRef">
      <template v-for="(item,i) in wordList">
        <div class="item" :class="index === i && 'active'">
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
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

.words {

  .list {
    display: flex;
    flex-direction: column;
    gap: 15rem;

    .item {
      border-radius: 10rem;
      padding: 10rem;
      border: 1px solid gray;
      display: flex;
      justify-content: space-between;

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

      &.active {
        background: $dark-bg;
      }
    }
  }
}
</style>
