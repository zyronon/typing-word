<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";
import {Like, ShareThree, Tea} from '@icon-park/vue-next'
import Ring from "@/components/Ring.vue";
import Tooltip from "@/components/Tooltip.vue";
import Fireworks from "@/components/Fireworks.vue";
import BaseButton from "@/components/BaseButton.vue";
import {DefaultStatistics, Statistics} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted, reactive} from "vue";
import {cloneDeep} from "lodash";

const store = useBaseStore()
let statModalIsOpen = $ref(false)
let currentStat = reactive<Statistics>(cloneDeep(DefaultStatistics))

onMounted(() => {
  emitter.on(EventKey.openStatModal, () => {
    statModalIsOpen = true
    currentStat = cloneDeep(store.current.statistics)
    currentStat.endDate = Date.now()
    currentStat.spend = Date.now() - currentStat.startDate
    currentStat.wrongWordNumber = store.current.originWrongWords.length
    currentStat.correctRate = 100 - Math.trunc((currentStat.wrongWordNumber / currentStat.wordNumber) * 100)
    console.log(cloneDeep(currentStat))
    store.currentDict.statistics.push(currentStat)
  })
})

function write() {
  store.isDictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  store.setCurrentWord(store.chapter, true)
  statModalIsOpen = false
  emitter.emit(EventKey.resetWord)
}

function next() {
  store.currentDict.chapterIndex++
  repeat()
}

</script>

<template>
  <Modal v-model="statModalIsOpen" @close="next">
    <div class="statistics">
      <header>
        <div class="title">{{ store.currentDict.name }}</div>
      </header>
      <div class="content">
        <div class="rings">
          <Ring
              :value="currentStat.correctRate + '%'"
              desc="正确率"
              :percentage="currentStat.correctRate"/>
          <Ring
              :value="currentStat.wrongWordNumber"
              desc="错误数"
              :percentage="0"
          />
          <Ring
              :value="currentStat.wordNumber"
              desc="单词总数"
              :percentage="0"
              style="margin-bottom: 0;"/>
        </div>
        <div class="result">
          <div class="wrong-words-wrapper">
            <div class="wrong-words">
              <div class="word" v-for="i in store.current.originWrongWords">{{ i.name }}</div>
              <!--                          <div class="word" v-for="i in 100">{{ i }}</div>-->
            </div>
          </div>
          <div class="notice" v-if="!store.current.originWrongWords.length">
            <!--          <div class="notice">-->
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
          默写本章
        </BaseButton>
        <BaseButton keyboard="Alt + Enter" @click="repeat">
          重复本章
        </BaseButton>
        <BaseButton keyboard="Tab" @click="next">
          下一章
        </BaseButton>
      </div>
    </div>
  </Modal>
  <Fireworks v-if="statModalIsOpen"/>
</template>
<style scoped lang="scss">
@import "@/assets/css/style";

.statistics {
  width: 800rem;
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
      box-sizing: border-box;
      overflow: hidden;
      height: 310rem;
      display: flex;
      flex-direction: column;
      border-radius: $card-radius;
      background: $item-hover;
      flex: 1;

      .wrong-words-wrapper {
        flex: 1;
        overflow: auto;
        padding: $space;
      }

      .wrong-words {
        box-sizing: border-box;
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