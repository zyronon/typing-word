<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue";
import {useBaseStore} from "@/stores/base.ts";
import Ring from "@/components/Ring.vue";
import Tooltip from "@/components/Tooltip.vue";
import Fireworks from "@/components/Fireworks.vue";
import BaseButton from "@/components/BaseButton.vue";
import {DefaultStatistics, Statistics} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted, reactive} from "vue";
import {cloneDeep} from "lodash-es";
import {Icon} from '@iconify/vue';

const store = useBaseStore()
let statModalIsOpen = $ref(false)
let currentStat = reactive<Statistics>(cloneDeep(DefaultStatistics))

onMounted(() => {
  emitter.on(EventKey.openStatModal, () => {
    statModalIsOpen = true
    currentStat = store.saveStatistics()
  })
})

function write() {
  store.setting.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  console.log(store.chapter)
  store.setCurrentWord(store.chapter, true)
  statModalIsOpen = false
  emitter.emit(EventKey.resetWord)
}

//TODO 能否下一章
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
            <Icon class="hvr-grow pointer" icon="flat-color-icons:like" width="20" color="#929596"/>
            表现不错，全对了！
          </div>
        </div>
        <div class="shares">
          <Tooltip title="分享给朋友">
            <Icon class="hvr-grow pointer" icon="ph:share-light" width="20" color="#929596"/>
          </Tooltip>
          <Tooltip title="请我喝杯咖啡">
            <Icon class="hvr-grow pointer"  icon="twemoji:teacup-without-handle" width="20" color="#929596"/>
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
@import "@/assets/css/style.scss";

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
      height: 320rem;
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