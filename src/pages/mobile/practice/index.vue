<script setup lang="ts">

import {onDeactivated, onMounted, onUnmounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {useBaseStore} from "@/stores/base.ts";

import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import PracticeWord from "@/pages/mobile/practice/practice-word/index.vue";
import {ShortcutKey} from "@/types.ts";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";


defineOptions({
  name: 'PracticeWord'
})

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const {toggleTheme} = useTheme()
const practiceRef: any = $ref()

function write() {
  // console.log('write')
  settingStore.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  // console.log('repeat')
  emitter.emit(EventKey.resetWord)
  practiceRef.getCurrentPractice()
}

function prev() {
  // console.log('next')
  if (store.sdict.chapterIndex === 0) {
    ElMessage.warning('已经在第一章了~')
  } else {
    store.sdict.chapterIndex--
    repeat()
  }
}

function toggleShowTranslate() {
  settingStore.translate = !settingStore.translate
}

function toggleDictation() {
  settingStore.dictation = !settingStore.dictation
}

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function togglePanel() {
  settingStore.showPanel = !settingStore.showPanel
}

function jumpSpecifiedChapter(val: number) {
  store.sdict.chapterIndex = val
  repeat()
}

onMounted(() => {
  emitter.on(EventKey.write, write)
  emitter.on(EventKey.repeatStudy, repeat)
  emitter.on(EventKey.jumpSpecifiedChapter, jumpSpecifiedChapter)

  emitter.on(ShortcutKey.PreviousChapter, prev)
  emitter.on(ShortcutKey.RepeatChapter, repeat)
  emitter.on(ShortcutKey.DictationChapter, write)
  emitter.on(ShortcutKey.ToggleShowTranslate, toggleShowTranslate)
  emitter.on(ShortcutKey.ToggleDictation, toggleDictation)
  emitter.on(ShortcutKey.ToggleTheme, toggleTheme)
  emitter.on(ShortcutKey.ToggleConciseMode, toggleConciseMode)
  emitter.on(ShortcutKey.TogglePanel, togglePanel)
})

onUnmounted(() => {
  emitter.off(EventKey.write, write)
  emitter.off(EventKey.repeatStudy, repeat)
  emitter.off(EventKey.jumpSpecifiedChapter, jumpSpecifiedChapter)

  emitter.off(ShortcutKey.PreviousChapter, prev)
  emitter.off(ShortcutKey.RepeatChapter, repeat)
  emitter.off(ShortcutKey.DictationChapter, write)
  emitter.off(ShortcutKey.ToggleShowTranslate, toggleShowTranslate)
  emitter.off(ShortcutKey.ToggleDictation, toggleDictation)
  emitter.off(ShortcutKey.ToggleTheme, toggleTheme)
  emitter.off(ShortcutKey.ToggleConciseMode, toggleConciseMode)
  emitter.off(ShortcutKey.TogglePanel, togglePanel)
})

useStartKeyboardEventListener()

</script>
<template>
  <div class="mobile-page">
    <PracticeWord ref="practiceRef"/>
  </div>
</template>

<style scoped lang="scss">

</style>
