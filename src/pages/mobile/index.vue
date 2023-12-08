<script setup lang="ts">

import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {$computed, $ref} from "vue/macros";
import {Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {syncMyDictList} from "@/hooks/dict.ts";
import {onMounted, onUnmounted} from "vue";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let wordData = $ref({
  words: [],
  index: -1,
  wrongWords: [],
})

const word: Word = $computed(() => {
  return wordData.words[wordData.index] ?? {
    trans: [],
    name: '',
    usphone: '',
    ukphone: '',
  }
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
})

onUnmounted(() => {
})

</script>

<template>
  <div id="mobile">
    <div class="content">
      <div class="translate">
        <div class="translate-item" v-for="(v,i) in word.trans">
          <span>{{ v }}</span>
        </div>
      </div>
      <div class="word">
        {{ word.name }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#mobile {
  position: relative;
  z-index: 1;
  font-size: 14rem;
  color: black;

}
</style>