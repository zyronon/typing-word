<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue"
import {onMounted, watch} from "vue";
import {usePracticeStore} from "@/stores/practice.ts";
import Footer from "@/components/Practice/Footer.vue";
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
import EditSingleArticleModal from "@/components/Article/EditSingleArticleModal.vue";
import PracticeArticle from "@/components/Practice/PracticeArticle/PracticeArticle.vue";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()


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

watch([
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
  // repeat()
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
    <PracticeArticle v-if="store.isArticle"/>
    <Footer/>
  </div>
  <Statistics
      @write="write"
      @repeat="repeat"
      @next="next"
  />
</template>

<style scoped lang="scss">
.practice {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

</style>