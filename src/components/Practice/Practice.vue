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
import {Article, DefaultArticle, TranslateType} from "@/types.ts";
import AddArticle from "@/components/Practice/AddArticle.vue";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {updateLocalSentenceTranslate, updateSections} from "@/hooks/translate.ts";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let showEditArticle = $ref(false)
let editArticle = $ref<Article>(cloneDeep(DefaultArticle))

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
    return
    let tempArticle = {...DefaultArticle, ...store.currentDict.articles[store.currentDict.chapterIndex]}
    console.log('article', tempArticle)
    if (tempArticle.sections.length) {
      articleData.article = tempArticle
    } else {
      if (tempArticle.useTranslateType === TranslateType.none) {
        updateSections(tempArticle)
        articleData.article = tempArticle
      } else {
        if (tempArticle.useTranslateType === TranslateType.custom) {
          if (tempArticle.textCustomTranslate.trim()) {
            if (tempArticle.textCustomTranslateIsFormat) {
              updateSections(tempArticle)
              updateLocalSentenceTranslate(tempArticle, tempArticle.textCustomTranslate)
              articleData.article = tempArticle
            } else {
              //说明有本地翻译，但是没格式化成一行一行的
              ElMessageBox.confirm('', '检测到存在本地翻译，但未格式化，是否进行编辑?', {
                confirmButtonText: '去编辑',
                cancelButtonText: '不需要翻译',
                type: 'warning',
              }).then(() => {
                editArticle = tempArticle
                showEditArticle = true
              }).catch(() => {
                updateSections(tempArticle)
                tempArticle.useTranslateType = TranslateType.none
                articleData.article = tempArticle
              })
            }
          } else {
            //没有本地翻译
            ElMessageBox.confirm('', '没有本地翻译，是否进行编辑?', {
              confirmButtonText: '去编辑',
              cancelButtonText: '不需要翻译',
              type: 'warning',
            }).then(() => {
              editArticle = tempArticle
              showEditArticle = true
            }).catch(() => {
              updateSections(tempArticle)
              tempArticle.useTranslateType = TranslateType.none
              articleData.article = tempArticle
            })
          }
        }

        if (tempArticle.useTranslateType === TranslateType.network) {
          updateSections(tempArticle)
          updateLocalSentenceTranslate(tempArticle, tempArticle.textNetworkTranslate)
          articleData.article = tempArticle
        }
      }
    }
  } else {
    wordData.words = cloneDeep(store.chapter)
    wordData.index = 0
  }
}

onMounted(() => {

})


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

function saveArticle(article: Article) {
  console.log('a', article)
  showEditArticle = false
  articleData.article = article
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