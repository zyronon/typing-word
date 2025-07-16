<script setup lang="ts">

import {onMounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {useBaseStore} from "@/stores/base.ts";

import Statistics from "@/pages/pc/word/Statistics.vue";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey} from "@/types.ts";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";
import TypingWord from "@/pages/pc/word/components/TypingWord.vue";
import {getCurrentStudyWord} from "@/hooks/dict.ts";
import {cloneDeep} from "lodash-es";

const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const {toggleTheme} = useTheme()


function next() {
  emitter.emit(EventKey.resetWord)
  getCurrentPractice()
}

//TODO 需要判断是否已忽略
function repeat() {
  // console.log('repeat')
  settingStore.dictation = false
  emitter.emit(EventKey.resetWord)
  studyData = cloneDeep(studyData)
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
    studyData = runtimeStore.routeData
  }
})

useEvents([
  [EventKey.changeDict, getCurrentPractice],
  [EventKey.repeat, repeat],
  [EventKey.next, next],

  [ShortcutKey.RepeatChapter, repeat],
  [ShortcutKey.ToggleShowTranslate, toggleTranslate],
  [ShortcutKey.ToggleDictation, toggleDictation],
  [ShortcutKey.OpenSetting, openSetting],
  [ShortcutKey.ToggleTheme, toggleTheme],
  [ShortcutKey.ToggleConciseMode, toggleConciseMode],
  [ShortcutKey.TogglePanel, togglePanel],
])


let studyData = $ref({
  new: [],
  review: [],
  write: []
})

function getCurrentPractice() {
  settingStore.dictation = false
  studyData = getCurrentStudyWord()
}

function complete() {
  // store.currentStudyWordDict.statistics.push()
}

useStartKeyboardEventListener()

</script>
<template>
  <TypingWord
      @complete="complete"
      :data="studyData"/>
  <Statistics/>
</template>

<style scoped lang="scss">

</style>
