<script setup lang="ts">

import WordPanel from "@/components/Practice/PracticeWord/WordPanel.vue";
import TypingWord from "@/components/Practice/PracticeWord/TypingWord.vue";
import {$ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, watch} from "vue";

const store = useBaseStore()

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