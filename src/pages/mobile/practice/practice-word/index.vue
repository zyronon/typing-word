<script setup lang="ts">

import TypingWord from "@/pages/mobile/practice/practice-word/TypingWord.vue";
import {$ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, onUnmounted} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey, Word} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {syncMyDictList} from "@/hooks/dict.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let wordData = $ref({
  words: [],
  index: -1
})

function getCurrentPractice() {
  if (store.chapter.length) {
    wordData.index = 0
    wordData.words = cloneDeep(store.chapter)
    emitter.emit(EventKey.resetWord)
  }
}

function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = wordData.words = list
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

function next() {
  if (store.currentDict.chapterIndex >= store.currentDict.chapterWords.length - 1) {
    store.currentDict.chapterIndex = 0
  } else store.currentDict.chapterIndex++

  getCurrentPractice()
}

onMounted(() => {
  getCurrentPractice()
  emitter.on(EventKey.changeDict, getCurrentPractice)
  emitter.on(EventKey.next, next)
  emitter.on(ShortcutKey.NextChapter, next)
})

onUnmounted(() => {
  emitter.off(EventKey.changeDict, getCurrentPractice)
  emitter.off(EventKey.next, next)
  emitter.off(ShortcutKey.NextChapter, next)
})

defineExpose({getCurrentPractice})

</script>

<template>
  <div class="practice">
    <TypingWord
        @sort="sort"
        v-model:words="wordData.words"
        :index="wordData.index"/>
  </div>
</template>

<style scoped lang="scss">
.practice {
  flex: 1;
  display: flex;
}
</style>