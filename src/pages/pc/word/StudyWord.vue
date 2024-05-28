<script setup lang="ts">

import Toolbar from "@/pages/pc/components/toolbar/index.vue"
import {onMounted, onUnmounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import Footer from "@/pages/pc/practice/Footer.vue";
import {useBaseStore} from "@/stores/base.ts";

import Statistics from "@/pages/pc/practice/Statistics.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey, Word} from "@/types.ts";
import DictModal from "@/pages/pc/components/dialog/DictDiglog.vue";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";
import TypingWord from "@/pages/pc/practice/practice-word/TypingWord.vue";
import {syncMyDictList} from "@/hooks/dict.ts";
import {cloneDeep, shuffle} from "lodash-es";

const statisticsStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const {toggleTheme} = useTheme()

watch(statisticsStore, () => {
  if (statisticsStore.inputWordNumber < 1) {
    return statisticsStore.correctRate = -1
  }
  if (statisticsStore.wrongWordNumber > statisticsStore.inputWordNumber) {
    return statisticsStore.correctRate = 0
  }
  statisticsStore.correctRate = 100 - Math.trunc(((statisticsStore.wrongWordNumber) / (statisticsStore.inputWordNumber)) * 100)
})

function next() {
  store.currentStudy.word.lastLearnIndex = store.currentStudy.word.lastLearnIndex + store.currentStudy.word.perDayStudyNumber
  repeat()
}

function write() {
  // console.log('write')
  settingStore.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  // console.log('repeat')
  emitter.emit(EventKey.resetWord)
  getCurrentPractice()
}

function prev() {
  // console.log('next')
  if (store.currentDict.chapterIndex === 0) {
    ElMessage.warning('已经在第一章了~')
  } else {
    store.currentDict.chapterIndex--
    repeat()
  }
}

function toggleShowTranslate() {
  settingStore.translate = !settingStore.translate
}

function toggleDictation() {
  settingStore.dictation = !settingStore.dictation
}

function openSetting() {
  runtimeStore.showSettingModal = true
}

function openDictDetail() {
  emitter.emit(EventKey.openDictModal, 'detail')
}

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function togglePanel() {
  settingStore.showPanel = !settingStore.showPanel
}

function jumpSpecifiedChapter(val: number) {
  store.currentDict.chapterIndex = val
  repeat()
}

onMounted(() => {
  emitter.on(EventKey.write, write)
  emitter.on(EventKey.repeat, repeat)
  emitter.on(EventKey.next, next)
  emitter.on(EventKey.jumpSpecifiedChapter, jumpSpecifiedChapter)

  emitter.on(ShortcutKey.PreviousChapter, prev)
  emitter.on(ShortcutKey.RepeatChapter, repeat)
  emitter.on(ShortcutKey.DictationChapter, write)
  emitter.on(ShortcutKey.ToggleShowTranslate, toggleShowTranslate)
  emitter.on(ShortcutKey.ToggleDictation, toggleDictation)
  emitter.on(ShortcutKey.OpenSetting, openSetting)
  emitter.on(ShortcutKey.OpenDictDetail, openDictDetail)
  emitter.on(ShortcutKey.ToggleTheme, toggleTheme)
  emitter.on(ShortcutKey.ToggleConciseMode, toggleConciseMode)
  emitter.on(ShortcutKey.TogglePanel, togglePanel)
})

onUnmounted(() => {
  emitter.off(EventKey.write, write)
  emitter.off(EventKey.repeat, repeat)
  emitter.off(EventKey.next, next)
  emitter.off(EventKey.jumpSpecifiedChapter, jumpSpecifiedChapter)

  emitter.off(ShortcutKey.PreviousChapter, prev)
  emitter.off(ShortcutKey.RepeatChapter, repeat)
  emitter.off(ShortcutKey.DictationChapter, write)
  emitter.off(ShortcutKey.ToggleShowTranslate, toggleShowTranslate)
  emitter.off(ShortcutKey.ToggleDictation, toggleDictation)
  emitter.off(ShortcutKey.OpenSetting, openSetting)
  emitter.off(ShortcutKey.OpenDictDetail, openDictDetail)
  emitter.off(ShortcutKey.ToggleTheme, toggleTheme)
  emitter.off(ShortcutKey.ToggleConciseMode, toggleConciseMode)
  emitter.off(ShortcutKey.TogglePanel, togglePanel)
})

onMounted(() => {
  getCurrentPractice()
  emitter.on(EventKey.changeDict, getCurrentPractice)
})

onUnmounted(() => {
  emitter.off(EventKey.changeDict, getCurrentPractice)
})

let wordData = $ref({
  words: [],
  index: -1
})
let data = $ref({
  new: [],
  review: []
})

function getCurrentPractice() {
  let c = store.currentStudy.word
  let wordDict = store.currentStudyWordDict;
  if (wordDict.words?.length) {
    wordData.index = 0
    wordData.words = []
    statisticsStore.step = 0
    for (let i = c.lastLearnIndex; i < wordDict.words.length; i++) {
      if (data.new.length >= c.perDayStudyNumber) break
      let item = wordDict.words[i]
      if (!store.skipWordNames.includes(item.word.toLowerCase())) {
        data.new.push(item)
      }
    }

    emitter.emit(EventKey.resetWord)
  }
}

//TODO wait
function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = wordData.words = list
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

function complete() {

}

useStartKeyboardEventListener()

</script>
<template>
  <div class="practice-wrapper">
    <Toolbar/>
    <div class="flex flex-1">
      <TypingWord
          @sort="sort"
          @complete="complete"
          :data="data"/>
    </div>
    <Footer/>
  </div>
  <DictModal/>
  <Statistics/>
</template>

<style scoped lang="scss">
.practice-wrapper {
  font-size: 0.9rem;
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  //padding-right: var(--practice-wrapper-padding-right);
  //transform: translateX(var(--practice-wrapper-translateX));
}


</style>