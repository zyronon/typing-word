<script setup lang="ts">
import {Word} from "../types";
import {usePlayWordAudio} from "../hooks/usePlayWordAudio";

const props = defineProps<{ wordList: Word[], index: number }>()
const [playAudio] = usePlayWordAudio()
</script>

<template>
  <div class="words">
    <div class="list">
      <div class="item" v-for="item in props.wordList">
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.words {
  height: 100%;
  overflow: auto;

  .list {
    display: flex;
    flex-direction: column;

    .item {
      margin: 10rem;
      border-radius: 10rem;
      padding: 10rem;
      border: 1px solid blue;
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
    }
  }
}
</style>
