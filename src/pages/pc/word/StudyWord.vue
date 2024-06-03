<script setup lang="ts">

import Toolbar from "@/pages/pc/components/toolbar/index.vue"
import {onMounted, onUnmounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import Footer from "@/pages/pc/word/Footer.vue";
import {useBaseStore} from "@/stores/base.ts";

import Statistics from "@/pages/pc/word/Statistics.vue";
import {emitter, EventKey, useEvent} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey, Word} from "@/types.ts";
import DictModal from "@/pages/pc/components/dialog/DictDiglog.vue";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";
import TypingWord from "@/pages/pc/components/practice-word/TypingWord.vue";
import {getCurrentStudyWord, syncMyDictList} from "@/hooks/dict.ts";
import {cloneDeep, shuffle} from "lodash-es";

const statStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const {toggleTheme} = useTheme()

watch(statStore, () => {
  if (statStore.inputWordNumber < 1) {
    return statStore.correctRate = -1
  }
  if (statStore.wrongWordNumber > statStore.inputWordNumber) {
    return statStore.correctRate = 0
  }
  statStore.correctRate = 100 - Math.trunc(((statStore.wrongWordNumber) / (statStore.inputWordNumber)) * 100)
})

function next() {
  emitter.emit(EventKey.resetWord)
  getCurrentPractice()
}

//TODO 需要判断是否已忽略
function repeat() {
  // console.log('repeat')
  settingStore.dictation = false
  emitter.emit(EventKey.resetWord)
  data = cloneDeep(data)
}


function toggleTranslate() {
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

onMounted(() => {
  settingStore.dictation = false
  if (runtimeStore.routeData) {
    data = runtimeStore.routeData
  }
})

useEvent(EventKey.changeDict, getCurrentPractice)

useEvent(EventKey.repeat, repeat)
useEvent(EventKey.next, next)

useEvent(ShortcutKey.RepeatChapter, repeat)
useEvent(ShortcutKey.ToggleShowTranslate, toggleTranslate)
useEvent(ShortcutKey.ToggleDictation, toggleDictation)
useEvent(ShortcutKey.OpenSetting, openSetting)
useEvent(ShortcutKey.OpenDictDetail, openDictDetail)
useEvent(ShortcutKey.ToggleTheme, toggleTheme)
useEvent(ShortcutKey.ToggleConciseMode, toggleConciseMode)
useEvent(ShortcutKey.TogglePanel, togglePanel)

let data = $ref({
  new: [],
  review: []
})

function getCurrentPractice() {
  settingStore.dictation = false
  data = getCurrentStudyWord()
}

function complete() {
  // store.currentStudyWordDict.statistics.push()
}

useStartKeyboardEventListener()

</script>
<template>
  <div class="practice-wrapper">
    <Toolbar/>
    <div class="flex flex-1">
      <TypingWord
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