<script setup lang="ts">

import TypingWord from "@/pages/practice/practice-word/TypingWord.vue";
import {$ref} from "vue/macros";
import {chunk, cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, onUnmounted, watch} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {Word} from "@/types.ts";
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

watch([
  () => store.currentDict.words,
], n => {
  getCurrentPractice()
})

function getCurrentPractice() {
  if (store.chapter.length) {
    wordData.words = store.chapter
    wordData.index = 0

    store.chapter.map((w: Word) => {
      if (!w.trans.length) {
        let res = runtimeStore.translateWordList.find(a => a.name === w.name)
        if (res) w = Object.assign(w, res)
      }
    })
  }
}

function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = wordData.words = list
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

onMounted(getCurrentPractice)

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
}
</style>