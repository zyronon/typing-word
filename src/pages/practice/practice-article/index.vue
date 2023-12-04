<script setup lang="ts">
import {$computed, $ref} from "vue/macros";
import TypingArticle from "./TypingArticle.vue";
import {
  Article,
  ArticleItem,
  ArticleWord,
  DefaultArticle,
  DisplayStatistics,
  ShortcutKey,
  TranslateType,
  Word
} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import TypingWord from "@/pages/practice/practice-word/TypingWord.vue";
import Panel from "../Panel.vue";
import {onMounted, onUnmounted, watch} from "vue";
import {renewSectionTexts, renewSectionTranslates} from "@/hooks/translate.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {useBaseStore} from "@/stores/base.ts";
import EditSingleArticleModal from "@/components/article/EditSingleArticleModal.vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import {syncMyDictList, useArticleOptions} from "@/hooks/dict.ts";
import ArticleList from "@/components/list/ArticleList.vue";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";

const store = useBaseStore()
const practiceStore = usePracticeStore()
const runtimeStore = useRuntimeStore()

let tabIndex = $ref(0)
let wordData = $ref({
  words: [],
  index: -1
})
let articleData = $ref({
  articles: [],
  article: cloneDeep(DefaultArticle),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})
let showEditArticle = $ref(false)
let typingArticleRef = $ref<any>()
let editArticle = $ref<Article>(cloneDeep(DefaultArticle))
let articleIsActive = $computed(() => tabIndex === 0)

function next() {
  if (!articleIsActive) return
  if (store.currentDict.chapterIndex >= articleData.articles.length - 1) {
    store.currentDict.chapterIndex = 0
  } else store.currentDict.chapterIndex++

  emitter.emit(EventKey.resetWord)
  getCurrentPractice()
}

function init() {
  if (!store.currentDict.articles.length) return
  articleData.articles = cloneDeep(store.currentDict.articles)
  getCurrentPractice()
}

function setArticle(val: Article) {
  let tempVal = cloneDeep(val)
  articleData.articles[store.currentDict.chapterIndex] = tempVal
  articleData.article = tempVal
  practiceStore.inputWordNumber = 0
  practiceStore.wrongWordNumber = 0
  practiceStore.repeatNumber = 0
  practiceStore.total = 0
  practiceStore.wrongWords = []
  practiceStore.startDate = Date.now()
  articleData.article.sections.map((v, i) => {
    v.map((w, j) => {
      w.words.map(s => {
        if (!store.skipWordNamesWithSimpleWords.includes(s.name.toLowerCase()) && !s.isSymbol) {
          practiceStore.total++
        }
      })
    })
  })
}

function getCurrentPractice() {
  // console.log('store.currentDict',store.currentDict)
  // return
  tabIndex = 0
  articleData.article = cloneDeep(DefaultArticle)

  let currentArticle = articleData.articles [store.currentDict.chapterIndex]
  let tempArticle = {...DefaultArticle, ...currentArticle}
  // console.log('article', tempArticle)
  if (tempArticle.sections.length) {
    setArticle(tempArticle)
  } else {
    if (tempArticle.useTranslateType === TranslateType.none) {
      renewSectionTexts(tempArticle)
      setArticle(tempArticle)
    } else {
      if (tempArticle.useTranslateType === TranslateType.custom) {
        if (tempArticle.textCustomTranslate.trim()) {
          if (tempArticle.textCustomTranslateIsFormat) {
            renewSectionTexts(tempArticle)
            renewSectionTranslates(tempArticle, tempArticle.textCustomTranslate)
            setArticle(tempArticle)
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
                  setArticle(tempArticle)
                }, null,
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
                setArticle(tempArticle)
              }, null,
              {
                confirmButtonText: '去编辑',
                cancelButtonText: '不需要翻译',
              })
        }
      }

      if (tempArticle.useTranslateType === TranslateType.network) {
        renewSectionTexts(tempArticle)
        renewSectionTranslates(tempArticle, tempArticle.textNetworkTranslate)
        setArticle(tempArticle)
      }
    }
  }
}

function saveArticle(val: Article) {
  console.log('saveArticle', val)
  showEditArticle = false
  let rIndex = store.currentDict.articles.findIndex(v => v.id === val.id)
  if (rIndex > -1) {
    store.currentDict.articles[rIndex] = cloneDeep(val)
  }
  setArticle(val)
}

function edit(val: Article = articleData.article) {
  if (!articleIsActive)return
  // tabIndex = 1
  // wordData.words = [
  //   {
  //     ...cloneDeep(DefaultWord),
  //     name: 'test'
  //   }
  // ]
  // wordData.index = 0
  // return
  editArticle = val
  showEditArticle = true
}

function wrong(word: Word) {
  let lowerName = word.name.toLowerCase();
  if (!store.wrong.originWords.find((v: Word) => v.name.toLowerCase() === lowerName)) {
    store.wrong.originWords.push(word)
  }
  if (!store.skipWordNamesWithSimpleWords.includes(lowerName)) {
    if (!practiceStore.wrongWords.find((v) => v.name.toLowerCase() === lowerName)) {
      practiceStore.wrongWords.push(word)
      practiceStore.wrongWordNumber++
    }
  }
}

function over() {
  if (practiceStore.wrongWordNumber === 0) {
    // if (false) {
    console.log('这章节完了')
    let now = Date.now()
    let stat: DisplayStatistics = {
      startDate: practiceStore.startDate,
      endDate: now,
      spend: now - practiceStore.startDate,
      total: practiceStore.total,
      correctRate: -1,
      wrongWordNumber: practiceStore.wrongWordNumber,
      wrongWords: practiceStore.wrongWords,
    }
    stat.correctRate = 100 - Math.trunc(((stat.wrongWordNumber) / (stat.total)) * 100)
    emitter.emit(EventKey.openStatModal, stat)
  } else {
    tabIndex = 1
    wordData.words = practiceStore.wrongWords
    wordData.index = 0
  }
}

function nextWord(word: ArticleWord) {
  if (!store.skipWordNamesWithSimpleWords.includes(word.name.toLowerCase()) && !word.isSymbol) {
    practiceStore.inputWordNumber++
  }
}

function handleChangeChapterIndex(val: ArticleItem) {
  let rIndex = articleData.articles.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    store.currentDict.chapterIndex = rIndex
    getCurrentPractice()
  }
}

const settingStore = useSettingStore()

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

function sort(list: Word[]) {
  wordData.words = list
  wordData.index = 0
}

function play() {
  if (!articleIsActive) return
  typingArticleRef?.play()
}

function show() {
  if (!articleIsActive) return
  typingArticleRef?.showSentence()
}


function onKeyUp(e: KeyboardEvent) {
  typingArticleRef.hideSentence()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('e', e)
  switch (e.key) {
    case 'Backspace':
      typingArticleRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

function skip() {
  if (!articleIsActive) return
  typingArticleRef?.nextSentence()
}

function collect(e: KeyboardEvent) {
  if (!articleIsActive) return
  toggleArticleCollect(articleData.article)
}

//包装一遍，因为快捷建的默认参数是Event
function shortcutKeyEdit(){
  edit()
}

onMounted(() => {
  init()
  emitter.on(EventKey.changeDict, init)
  emitter.on(EventKey.next, next)

  emitter.on(ShortcutKey.NextChapter, next)
  emitter.on(ShortcutKey.PlayWordPronunciation, play)
  emitter.on(ShortcutKey.ShowWord, show)
  emitter.on(ShortcutKey.Next, skip)
  emitter.on(ShortcutKey.ToggleCollect, collect)
  emitter.on(ShortcutKey.EditArticle, shortcutKeyEdit)
})

onUnmounted(() => {
  emitter.off(EventKey.changeDict, init)
  emitter.off(EventKey.next, next)
  emitter.off(ShortcutKey.NextChapter, next)
  emitter.off(ShortcutKey.PlayWordPronunciation, play)
  emitter.off(ShortcutKey.ShowWord, show)
  emitter.off(ShortcutKey.Next, skip)
  emitter.off(ShortcutKey.ToggleCollect, collect)
  emitter.off(ShortcutKey.EditArticle, shortcutKeyEdit)
})

defineExpose({getCurrentPractice})

</script>

<template>
  <div class="practice-article">
    <div class="swiper-wrapper">
      <div class="swiper-list" :class="`step${tabIndex}`">
        <div class="swiper-item">
          <TypingArticle
              ref="typingArticleRef"
              :active="tabIndex === 0"
              @edit="edit"
              @wrong="wrong"
              @over="skip"
              @nextWord="nextWord"
              :article="articleData.article"
          />
        </div>
        <div class="swiper-item">
          <div class="typing-word-wrapper">
            <TypingWord
                @sort="sort"
                :words="wordData.words"
                :index="wordData.index"
                v-if="tabIndex === 1"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="panel-wrapper">
      <Panel v-if="tabIndex === 0">
        <template v-slot="{active}">
          <div class="panel-page-item">
            <div class="list-header">
              <div class="left">
                <BaseIcon title="切换词典"
                          @click="emitter.emit(EventKey.openDictModal,'list')"
                          icon="carbon:change-catalog"/>
                <div class="title">
                  {{ store.currentDict.name }}
                </div>
                <Tooltip
                    :title="`下一章(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.NextChapter]})`"
                    v-if="store.currentDict.chapterIndex < articleData.articles .length - 1">
                  <IconWrapper>
                    <Icon @click="emitter.emit(EventKey.next)" icon="octicon:arrow-right-24"/>
                  </IconWrapper>
                </Tooltip>
              </div>
              <div class="right">
                {{ articleData.articles.length }}篇文章
              </div>
            </div>

            <ArticleList
                :isActive="active"
                :static="false"
                :show-border="true"
                :show-translate="settingStore.translate"
                @title="e => emitter.emit(EventKey.openArticleContentModal,e.item)"
                @click="handleChangeChapterIndex"
                :active-id="articleData.article.id"
                :list="articleData.articles ">
              <template v-slot:suffix="{item,index}">
                <BaseIcon
                    v-if="!isArticleCollect(item)"
                    class="collect"
                    @click="toggleArticleCollect(item)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class="fill"
                    @click="toggleArticleCollect(item)"
                    title="取消收藏" icon="ph:star-fill"/>
              </template>
            </ArticleList>
          </div>
        </template>
      </Panel>
    </div>

    <EditSingleArticleModal
        v-model="showEditArticle"
        :article="editArticle"
        @save="saveArticle"
    />
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

$article-width: 50vw;

.swiper-wrapper {
  height: 100%;
  overflow: hidden;

  .swiper-list {
    transition: transform .3s;
    height: 200%;

    .swiper-item {
      height: 50%;
      overflow: auto;
      display: flex;
      justify-content: center;
    }
  }

  .step1 {
    transform: translate3d(0, -50%, 0);
  }
}

.practice-article {
  flex: 1;
  overflow: hidden;
  width: $article-width;
}

.typing-word-wrapper {
  width: var(--toolbar-width);
}

.panel-wrapper {
  position: fixed;
  left: 0;
  top: 10rem;
  z-index: 1;
  margin-left: calc(50% + ($article-width / 2) + var(--space));
  height: calc(100% - 20rem);
}

</style>