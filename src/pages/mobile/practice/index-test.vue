<script setup lang="ts">

import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {$computed, $ref} from "vue/macros";
import {DefaultDisplayStatistics, DictType, ShortcutKey, Sort, Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {syncMyDictList, useWordOptions} from "@/hooks/dict.ts";
import {nextTick, onMounted, onUnmounted, watch} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import Options from "@/pages/pc/practice/Options.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import MobilePanel from "@/pages/mobile/components/MobilePanel.vue";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import WordList from "@/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";
import {Icon} from "@iconify/vue";
import router from "@/router.ts";
import Typing from "@/pages/pc/practice/practice-word/Typing.vue";
import {usePracticeStore} from "@/stores/practice.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let data = $ref({
  words: [],
  index: -1,
  wrongWords: [],
})

const word: Word = $computed(() => {
  return data.words[data.index] ?? {
    trans: [],
    word: '',
    phonetic0: '',
    phonetic1: '',
  }
})

function getCurrentPractice() {
  if (store.chapter.length) {
    data.words = store.chapter
    data.index = 0

    data.words = cloneDeep(store.chapter)
    emitter.emit(EventKey.resetWord)
  }
}

function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = data.words = list
  data.index = 0
  syncMyDictList(store.currentDict)
}

function nextChapter() {
  if (store.currentDict.chapterIndex >= store.currentDict.chapterWords.length - 1) {
    store.currentDict.chapterIndex = 0
  } else store.currentDict.chapterIndex++

  getCurrentPractice()
}

let stat = cloneDeep(DefaultDisplayStatistics)
const practiceStore = usePracticeStore()

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {

    //复制当前错词，因为第一遍错词是最多的，后续的练习都是从错词中练习
    if (stat.total === -1) {
      let now = Date.now()
      stat = {
        startDate: practiceStore.startDate,
        endDate: now,
        spend: now - practiceStore.startDate,
        total: props.words.length,
        correctRate: -1,
        inputWordNumber: practiceStore.inputWordNumber,
        wrongWordNumber: data.wrongWords.length,
        wrongWords: data.wrongWords,
      }
      stat.correctRate = 100 - Math.trunc(((stat.wrongWordNumber) / (stat.total)) * 100)
    }

    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)

      practiceStore.total = data.words.length
      practiceStore.index = data.index = 0
      practiceStore.inputWordNumber = 0
      practiceStore.wrongWordNumber = 0
      practiceStore.repeatNumber++
      data.wrongWords = []
    } else {
      console.log('这章节完了')
      isTyping && practiceStore.inputWordNumber++

      let now = Date.now()
      stat.endDate = now
      stat.spend = now - stat.startDate

      emitter.emit(EventKey.openStatModal, stat)
    }
  } else {
    data.index++
    isTyping && practiceStore.inputWordNumber++
    console.log('这个词完了')
    if ([DictType.word].includes(store.currentDict.type)
        && store.skipWordNames.includes(word.word.toLowerCase())) {
      next()
    }
  }
}



watch(() => store.load, n => {
  getCurrentPractice()
})

let bodyHeight = $ref('100vh')
onMounted(() => {
  bodyHeight = document.body.clientHeight + 'px'
  getCurrentPractice()
})

onUnmounted(() => {
})
const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple,
} = useWordOptions()

let showSortOption = $ref(false)
let showTranslate = $ref(false)

let keyboardKeys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

let inputVal = $ref('')
let inputRef = $ref<HTMLInputElement>()


function change(e) {
  console.log('e', e)
  e.key = e.data
  emitter.emit(EventKey.onTyping, e)
  inputRef.value = ''
}

function know() {
  settingStore.translate = false
  setTimeout(() => {
    data.index++
  }, 300)
}

function unknow() {
  settingStore.translate = true
  inputRef.focus()
}
</script>

<template>
  <div class="practice-center" :style="{height:bodyHeight}">
    <div class="slide">
      <div class="slide-list" :class="{showPanel:settingStore.showPanel}">
        <div class="practice" @click.stop="settingStore.showPanel = false">
          <div class="tool-bar">
            <div class="left">
              <Icon icon="octicon:arrow-left-24" width="22"
                    @click="router.back()"
              />
            </div>
            <div class="right">
              <BaseIcon
                  v-if="!isWordCollect(word)"
                  class="collect"
                  @click="toggleWordCollect(word)"
                  icon="ph:star"/>
              <BaseIcon
                  v-else
                  class="fill"
                  @click="toggleWordCollect(word)"
                  icon="ph:star-fill"/>
              <BaseIcon
                  @click="settingStore.showPanel = !settingStore.showPanel"
                  icon="tdesign:menu-unfold"/>
            </div>
          </div>
          <input ref="inputRef"
                 style="position:fixed;top:200vh;"
                 @input="change"
                 type="text">
          <Typing
              style="width: 90%;"
              v-loading="!store.load"
              ref="typingRef"
              :word="word"
              @next="next"
          />
          <div class="options">
            <div class="wrapper">
              <BaseButton @click="unknow">不认识</BaseButton>
              <BaseButton @click="know">认识</BaseButton>
            </div>
          </div>
        </div>
        <div class="list">
          <MobilePanel>
            <template v-slot="{active}">
              <div class="panel-page-item"
                   v-loading="!store.load"
              >
                <div class="list-header">
                  <div class="left">
                    <div class="title">
                      {{ store.chapterName }}
                    </div>
                    <BaseIcon title="切换词典"
                              @click="emitter.emit(EventKey.openDictModal,'list')"
                              icon="carbon:change-catalog"/>
                    <div style="position:relative;"
                         @click.stop="null">
                      <BaseIcon
                          title="改变顺序"
                          icon="icon-park-outline:sort-two"
                          @click="showSortOption = !showSortOption"
                      />
                      <MiniDialog
                          v-model="showSortOption"
                          style="width: 130rem;"
                      >
                        <div class="mini-row-title">
                          列表循环设置
                        </div>
                        <div class="mini-row">
                          <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                          <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
                        </div>
                      </MiniDialog>
                    </div>
                    <BaseIcon icon="bi:arrow-right"
                              @click="next"
                              v-if="store.currentDict.chapterIndex < store.currentDict.chapterWords.length - 1"/>
                  </div>
                  <div class="right">
                    {{ data.words.length }}个单词
                  </div>
                </div>
                <WordList
                    v-if="data.words.length"
                    :is-active="active"
                    :static="false"
                    :show-word="!settingStore.dictation"
                    :show-translate="settingStore.translate"
                    :list="data.words"
                    :activeIndex="data.index"
                    @click="(val:any) => data.index = val.index"
                >
                  <template v-slot:suffix="{item,index}">
                    <BaseIcon
                        v-if="!isWordCollect(item)"
                        class="collect"
                        @click="toggleWordCollect(item)"
                        title="收藏" icon="ph:star"/>
                    <BaseIcon
                        v-else
                        class="fill"
                        @click="toggleWordCollect(item)"
                        title="取消收藏" icon="ph:star-fill"/>
                    <BaseIcon
                        v-if="!isWordSimple(item)"
                        class="easy"
                        @click="toggleWordSimple(item)"
                        title="标记为简单词"
                        icon="material-symbols:check-circle-outline-rounded"/>
                    <BaseIcon
                        v-else
                        class="fill"
                        @click="toggleWordSimple(item)"
                        title="取消标记简单词"
                        icon="material-symbols:check-circle-rounded"/>
                  </template>
                </WordList>
                <Empty v-else/>
              </div>
            </template>
          </MobilePanel>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.practice-center {
  position: fixed;
  z-index: 1;
  font-size: 14rem;
  color: black;
  width: 100%;
  left: 0;
  top: 0;
  height: 100vh;

  $list-width: 75vw;

  .slide {
    width: 100%;
    height: 100%;

    .slide-list {
      width: calc(100vw + $list-width);
      height: 100%;
      display: flex;
      transition: all .5s;
    }

    .showPanel {
      transform: translateX(-$list-width);
    }
  }

  .practice {
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10rem;

    .tool-bar {
      width: 100%;
      height: 50rem;
      display: flex;
      padding: 0 10rem;
      align-items: center;
      justify-content: space-between;
      gap: 10rem;
    }

    :deep(.word){
      letter-spacing: 0;
      font-size: 40rem!important;
    }

    .options {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 20rem;

      .wrapper {
        width: 80%;
        display: flex;
        flex-direction: column;
        gap: 10rem;
      }

      .base-button {
        width: 100%;
      }
    }
  }

  .list {
    width: $list-width;
  }
}
</style>