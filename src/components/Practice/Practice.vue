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
import {useRuntimeStore} from "@/stores/runtime.ts";
import {renewSectionTexts, renewSectionTranslates} from "@/hooks/translate.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import EditArticleModal from "@/components/Article/EditSingleArticleModal.vue";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let showEditArticle = $ref(false)
let editArticle = $ref<Article>(cloneDeep(DefaultArticle))

watch(practiceStore, () => {
  if (practiceStore.inputWordNumber < 1) {
    return practiceStore.correctRate = -1
  }
  if (practiceStore.wrongWordNumber > practiceStore.inputWordNumber) {
    return practiceStore.correctRate = 0
  }
  practiceStore.correctRate = 100 - Math.trunc(((practiceStore.wrongWordNumber) / (practiceStore.inputWordNumber)) * 100)
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

watch([() => store.current.index, () => store.current.dictType], n => {
  getCurrentPractice()
})


function getCurrentPractice() {
  // console.log('store.currentDict',store.currentDict)
  if (store.isArticle) {
    // return
    let currentArticle = store.currentDict.articles[store.currentDict.chapterIndex]
    let tempArticle = {...DefaultArticle, ...currentArticle}
    console.log('article', tempArticle)
    if (tempArticle.sections.length) {
      articleData.article = tempArticle
    } else {
      if (tempArticle.useTranslateType === TranslateType.none) {
        renewSectionTexts(tempArticle)
        articleData.article = tempArticle
      } else {
        if (tempArticle.useTranslateType === TranslateType.custom) {
          if (tempArticle.textCustomTranslate.trim()) {
            if (tempArticle.textCustomTranslateIsFormat) {
              renewSectionTexts(tempArticle)
              renewSectionTranslates(tempArticle, tempArticle.textCustomTranslate)
              articleData.article = tempArticle
            } else {
              //说明有本地翻译，但是没格式化成一行一行的
              MessageBox.confirm('检测到存在本地翻译，但未格式化，是否进行编辑?',
                  '提示',
                  () => {
                    editArticle = tempArticle
                    showEditArticle = true
                  },
                  () => {
                    renewSectionTexts(tempArticle)
                    tempArticle.useTranslateType = TranslateType.none
                    store.currentDict.articles[store.currentDict.chapterIndex] = articleData.article = tempArticle
                  },
                  {
                    confirmButtonText: '去编辑',
                    cancelButtonText: '不需要翻译',
                  })
            }
          } else {
            //没有本地翻译
            MessageBox.confirm(
                '没有本地翻译，是否进行编辑?',
                '提示',
                () => {
                  editArticle = tempArticle
                  showEditArticle = true
                },
                () => {
                  renewSectionTexts(tempArticle)
                  tempArticle.useTranslateType = TranslateType.none
                  store.currentDict.articles[store.currentDict.chapterIndex] = articleData.article = tempArticle
                },
                {
                  confirmButtonText: '去编辑',
                  cancelButtonText: '不需要翻译',
                })
          }
        }

        if (tempArticle.useTranslateType === TranslateType.network) {
          renewSectionTexts(tempArticle)
          renewSectionTranslates(tempArticle, tempArticle.textNetworkTranslate)
          store.currentDict.articles[store.currentDict.chapterIndex] = articleData.article = tempArticle
        }
      }
    }
  } else {
    wordData.words = cloneDeep(store.chapter)
    wordData.index = store.currentDict.chapterWordIndex
    console.log('wordData', wordData)
  }
}

onMounted(() => {

})

function write() {
  // console.log('write')
  settingStore.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
function repeat() {
  // console.log('repeat')
  getCurrentPractice()
  emitter.emit(EventKey.resetWord)
}

//TODO 能否下一章
function next() {
  // console.log('next')
  store.currentDict.chapterIndex++
  repeat()
}

function saveArticle(article: Article) {
  console.log('saveArticle', article)
  showEditArticle = false
  store.currentDict.articles[store.currentDict.chapterIndex] = articleData.article = article
}

function test() {
  MessageBox.confirm(
      '2您选择了“本地翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?',
      '1提示',
      () => {
        console.log('ok')
      },
      () => {
        console.log('cencal')
      })
}
</script>
<template>
  <div class="practice">
    <Toolbar/>
    <!--    <BaseButton @click="test">test</BaseButton>-->

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
  <EditArticleModal v-model="showEditArticle"
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