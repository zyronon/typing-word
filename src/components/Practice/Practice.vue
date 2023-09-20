<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue"
import {onMounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import Footer from "@/components/Practice/Footer.vue";
import TypeWord from "@/components/Practice/TypeWord.vue";
import TypeArticle from "@/components/Practice/TypeArticle.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$ref} from "vue/macros";
import Statistics from "@/components/Practice/Statistics.vue";
import {emitter, EventKey} from "@/utils/eventBus";
import {useSettingStore} from "@/stores/setting";
import {cloneDeep} from "lodash-es";
import {Article, DefaultArticle} from "@/types.ts";
import AddArticle from "@/components/Practice/AddArticle.vue";
import {useEventListener, useStartKeyboardEventListener} from "@/hooks/event.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let showEditArticle = $ref(false)
let editArticle = $ref(cloneDeep(DefaultArticle))

watch(practiceStore, () => {
  if (practiceStore.inputNumber < 1) {
    return practiceStore.correctRate = -1
  }
  if (practiceStore.wrongNumber > practiceStore.inputNumber) {
    return practiceStore.correctRate = 0
  }
  practiceStore.correctRate = 100 - Math.trunc(((practiceStore.wrongNumber) / (practiceStore.inputNumber)) * 100)
})

let wordData = $ref({
  words: [],
  index: -1
})

let articleData = $ref({
  article: cloneDeep(DefaultArticle),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})

watch(() => store.load, n => {
  if (n) {
    getCurrentPractice()
  }
})

function getCurrentPractice() {
  if (store.isArticle) {
    let article: Article = cloneDeep(store.currentDict.articles[store.currentDict.chapterIndex])
    console.log('article', article)
    if (article?.translateSplit) {
      articleData.article = article
    } else {
      editArticle = {...DefaultArticle, ...article}
      showEditArticle = true
    }
  } else {
    wordData.words = cloneDeep(store.chapter)
    wordData.index = 0
  }
}

onMounted(() => {

})

useStartKeyboardEventListener()

function write() {
  console.log('write')
  settingStore.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  console.log('repeat')
  getCurrentPractice()
  emitter.emit(EventKey.resetWord)
}

//TODO 能否下一章
function next() {
  console.log('next')
  store.currentDict.chapterIndex++
  repeat()
}

function saveArticle(article) {
  console.log('a', article)
}

</script>

<template>
  <div class="practice">
    <Toolbar/>
    <TypeArticle
        v-if="store.isArticle"
        :article="articleData.article"
        :sectionIndex="articleData.sectionIndex"
        :sentenceIndex="articleData.sentenceIndex"
        :wordIndex="articleData.wordIndex"
        :stringIndex="articleData.stringIndex"
    />
    <TypeWord
        :words="wordData.words"
        :index="wordData.index"
        v-else/>
    <Footer/>
  </div>
  <Statistics
      @write="write"
      @repeat="repeat"
      @next="next"
  />
  <AddArticle v-if="showEditArticle"
              @close="showEditArticle = false"
              :article="editArticle"
              @save="saveArticle"
  />
</template>

<style scoped lang="scss">
.practice {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>