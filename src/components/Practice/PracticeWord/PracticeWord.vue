<script setup lang="ts">

import TypingWord from "@/components/Practice/PracticeWord/TypingWord.vue";
import {$ref} from "vue/macros";
import {chunk, cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, onUnmounted, watch} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {Word} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let wordData = $ref({
  words: [],
  index: -1
})

watch([
  () => store.load,
  () => store.currentDict.words,
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
  // console.log('wordData', wordData)
}

defineExpose({getCurrentPractice})

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