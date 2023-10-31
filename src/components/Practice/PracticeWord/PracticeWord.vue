<script setup lang="ts">

import TypingWord from "@/components/Practice/PracticeWord/TypingWord.vue";
import {$ref} from "vue/macros";
import {chunk, cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, watch} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {Word} from "@/types.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()

let wordData = $ref({
  words: [],
  index: -1
})

watch([
  () => store.load,
  () => store.current.index,
  () => store.current.dictType,
  () => store.currentDict.chapterIndex,
  () => store.currentDict.chapterWordNumber,
], n => {
  getCurrentPractice()
})

function getCurrentPractice() {
  // console.log('store.currentDict',store.currentDict)
  if (store.currentDict.translateLanguage === 'common') {
    store.chapter.map((w: Word) => {
      let res = runtimeStore.translateWordList.find(a => a.name === w.name)
      if (res) w = Object.assign(w, res)
    })
  }
  wordData.words = cloneDeep(store.chapter)
  wordData.index = 0
  console.log('wordData', wordData)
}

onMounted(() => {
  getCurrentPractice()
})
</script>

<template>
  <div class="practice">
    <TypingWord :words="wordData.words" :index="wordData.index"/>
  </div>
</template>

<style scoped lang="scss">
.practice {
  //height: 100%;
  flex: 1;
}
</style>