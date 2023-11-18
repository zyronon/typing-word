<script setup lang="ts">
import Dialog from "@/components/dialog/Dialog.vue";
import {useBaseStore} from "@/stores/base.ts";
import Ring from "@/components/Ring.vue";
import Tooltip from "@/components/Tooltip.vue";
import Fireworks from "@/components/Fireworks.vue";
import BaseButton from "@/components/BaseButton.vue";
import {DefaultDisplayStatistics, DisplayStatistics, ShortcutKey} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted, reactive} from "vue";
import {cloneDeep} from "lodash-es";
import {Icon} from '@iconify/vue';
import {$computed, $ref} from "vue/macros";
import BaseIcon from "@/components/BaseIcon.vue";
import {useSettingStore} from "@/stores/setting.ts";

const store = useBaseStore()
const settingStore = useSettingStore()
let statModalIsOpen = $ref(false)
let currentStat = reactive<DisplayStatistics>(cloneDeep(DefaultDisplayStatistics))

onMounted(() => {
  emitter.on(EventKey.openStatModal, (stat: DisplayStatistics) => {
    if (stat) {
      currentStat = {...DefaultDisplayStatistics, ...stat}
      store.saveStatistics(stat)
      console.log('stat', stat)
    }
    statModalIsOpen = true
  })

  const close = () => {
    statModalIsOpen = false
  }

  emitter.on(ShortcutKey.NextChapter, close)
  emitter.on(ShortcutKey.RepeatChapter, close)
  emitter.on(ShortcutKey.DictationChapter, close)
})


function options(emitType: 'write' | 'repeat' | 'next') {
  statModalIsOpen = false
  emitter.emit(EventKey[emitType])
}

const isEnd = $computed(() => {
  return store.isArticle ?
      store.currentDict.chapterIndex === store.currentDict.articles.length - 1 :
      store.currentDict.chapterIndex === store.currentDict.chapterWords.length - 1
})

</script>

<template>
  <Dialog
      :header="false"
      v-model="statModalIsOpen">
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
              :value="currentStat.inputWordNumber"
              desc="输入数"
              :percentage="0"
          />
          <Ring
              :value="currentStat.total"
              desc="单词总数"
              :percentage="0"
              style="margin-bottom: 0;"/>
        </div>
        <div class="result">
          <div class="wrong-words-wrapper">
            <div class="wrong-words">
              <div class="word" v-for="i in currentStat.wrongWords">{{ i.name }}</div>
              <!--                          <div class="word" v-for="i in 100">{{ i }}</div>-->
            </div>
          </div>
          <div class="notice" v-if="!currentStat.wrongWords.length">
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
            <Icon class="hvr-grow pointer" icon="twemoji:teacup-without-handle" width="20" color="#929596"/>
          </Tooltip>
        </div>
      </div>
      <div class="footer">
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.DictationChapter]"
            @click="options('write')">
          默写本章
        </BaseButton>
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.RepeatChapter]"
            @click="options('repeat')">
          重复本章
        </BaseButton>
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.NextChapter]"
            @click="options('next')">
          {{ isEnd ? '重新练习' : '下一章' }}
        </BaseButton>
      </div>
    </div>
  </Dialog>
  <Fireworks v-if="statModalIsOpen"/>
</template>
<style scoped lang="scss">
@import "@/assets/css/style.scss";

.statistics {
  width: 800rem;
  padding: var(--space);
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
    gap: var(--space);
    margin-bottom: 15rem;

    .result {
      box-sizing: border-box;
      overflow: hidden;
      height: 340rem;
      display: flex;
      flex-direction: column;
      border-radius: $card-radius;
      background: $item-hover;
      flex: 1;

      .wrong-words-wrapper {
        flex: 1;
        overflow: auto;
        padding: var(--space);
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
        padding-left: var(--space);
      }
    }

    .shares {
      display: flex;
      flex-direction: column;
      gap: var(--space);
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