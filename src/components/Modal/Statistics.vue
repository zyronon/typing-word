<script setup>
import Modal from "@/components/Modal/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";
import {KeyboardOne, Like, ShareThree, Tea} from '@icon-park/vue-next'
import Ring from "@/components/Ring.vue";
import Tooltip from "@/components/Tooltip.vue";
import Fireworks from "@/components/Fireworks.vue";
import BaseButton from "@/components/BaseButton.vue";

const store = useBaseStore()

function write() {
  store.isDictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  store.currentDict.wordIndex = 0
  store.currentWrongDict.wordList = []
  store.statModalIsOpen = false
}

function next() {
  store.currentDict.chapterIndex++
  repeat()
}
</script>

<template>
  <Modal v-model="store.statModalIsOpen" @close="next">
    <div class="statistics">
      <header>
        <div class="title">新概念英语-2 第3章</div>
      </header>
      <div class="content">
        <div class="rings">
          <Ring
              :value="store.lastStatistics.correctRate + '%'"
              desc="正确率"
              :percentage="store.lastStatistics.correctRate"/>
          <Ring
              :value="store.lastStatistics.correctNumber"
              desc="正确数"
              :percentage="0"
          />
          <Ring
              :value="store.currentDict.wordIndex"
              desc="输入数"
              :percentage="0"
              style="margin-bottom: 0;"/>
        </div>
        <div class="result">
          <div class="wrong-words-wrapper">
            <div class="wrong-words">
              <div class="word" v-for="i in store.currentWrongDict.wordList">{{ i.name }}</div>
            </div>
          </div>

          <div class="notice">
            <like theme="filled" size="20" fill="#ffffff" :strokeWidth="2"/>
            表现不错，全对了！
          </div>
        </div>
        <div class="shares">
          <Tooltip title="分享给朋友">
            <share-three theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
          <Tooltip title="分享给朋友">
            <tea theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
          <Tooltip title="分享给朋友">
            <share-three theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </Tooltip>
        </div>
      </div>
      <div class="footer">
        <BaseButton keyboard="Ctrl + Enter" @click="write">
          默写本章节
        </BaseButton>
        <BaseButton keyboard="Enter" @click="repeat">
          重复本章节
        </BaseButton>
        <BaseButton keyboard="Tab" @click="next">
          下一章节
        </BaseButton>
      </div>
    </div>
  </Modal>
  <Fireworks v-if="store.statModalIsOpen"/>
</template>
<style scoped lang="scss">
@import "@/assets/css/style";

.statistics {
  width: 50vw;
  padding: $space;
  background: $dark-second-bg;
  border-radius: $card-radius;

  $header-height: 40rem;
  $footer-height: 60rem;

  header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: $header-height;
    font-size: 24rem;
    margin-bottom: 15rem;
  }

  .content {
    display: flex;
    gap: $space;
    margin-bottom: 15rem;

    .result {
      flex: 1;
      box-sizing: border-box;
      overflow: hidden;

      .wrong-words-wrapper {
        border-radius: $card-radius $card-radius 0 0;
        background: $item-hover;
        padding-top: $space;

      }

      .wrong-words {
        padding: $space;
        padding-top: 0;
        height: 30vh;
        box-sizing: border-box;
        overflow: auto;
        display: flex;
        margin-right: 5rem;
        flex-wrap: wrap;
        gap: 10rem;
        align-items: flex-start;

        .word {
          display: inline-block;
          border-radius: 6rem;
          padding: 5rem 15rem;
          background: $dark-second-bg;
        }
      }

      .notice {
        border-radius: 0 0 $card-radius $card-radius;
        background: $main;
        height: 40rem;
        display: flex;
        gap: 10rem;
        align-items: center;
        padding-left: $space;
      }
    }

    .shares {
      display: flex;
      flex-direction: column;
      gap: $space;
    }
  }

  .footer {
    height: $footer-height;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20rem;
  }
}

</style>