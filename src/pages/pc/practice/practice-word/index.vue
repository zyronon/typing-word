<script setup lang="ts">

import TypingWord from "@/pages/pc/practice/practice-word/TypingWord.vue";

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
  if (store.currentWordDict.words?.length) {
    wordData.index = 0
    wordData.words = cloneDeep(store.currentWordDict.words.slice(store.currentStudy.word.lastWordIndex, store.currentStudy.word.lastWordIndex + store.currentStudy.word.perDayStudyNumber))
    emitter.emit(EventKey.resetWord)
  }
}

//TODO wait
function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = wordData.words = list
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

onMounted(() => {
  getCurrentPractice()
  emitter.on(EventKey.changeDict, getCurrentPractice)
})

onUnmounted(() => {
  emitter.off(EventKey.changeDict, getCurrentPractice)
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
  //height: 100%;
  flex: 1;
  display: flex;
}
</style>