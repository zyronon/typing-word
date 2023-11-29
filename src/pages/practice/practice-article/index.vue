<script setup lang="ts">
import {$ref} from "vue/macros";
import TypingArticle from "./TypingArticle.vue";
import {Article, ArticleWord, DefaultArticle, DisplayStatistics, ShortcutKey, TranslateType, Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import TypingWord from "@/pages/practice/practice-word/TypingWord.vue";
import Panel from "../Panel.vue";
import {onMounted, watch} from "vue";
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
import ArticleList2 from "@/components/list/ArticleList2.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {useArticleOptions} from "@/hooks/dict.ts";
import ArticleList4 from "@/components/list2/ArticleList4.vue";

const store = useBaseStore()
const practiceStore = usePracticeStore()
const runtimeStore = useRuntimeStore()

let tabIndex = $ref(0)
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
let showEditArticle = $ref(false)
let editArticle = $ref<Article>(cloneDeep(DefaultArticle))

watch([
  () => store.current.index,
  () => store.load,
  () => store.currentDict.type,
  () => store.currentDict.chapterIndex,
], n => {
  console.log('n', n)
  getCurrentPractice()
})

onMounted(() => {
  getCurrentPractice()
})

function setArticle(val: Article) {
  store.currentDict.articles[store.currentDict.chapterIndex] = cloneDeep(val)
  articleData.article = cloneDeep(val)
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
  if (!store.currentDict.articles.length) return
  tabIndex = 0
  articleData.article = cloneDeep(DefaultArticle)

  let currentArticle = store.currentDict.articles[store.currentDict.chapterIndex]
  let tempArticle = {...DefaultArticle, ...currentArticle}
  console.log('article', tempArticle)
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
  // articleData.article = cloneDeep(store.currentDict.articles[store.currentDict.chapterIndex])
  setArticle(val)
}

function edit(val: Article) {
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

function changePracticeArticle(val: Article) {
  let rIndex = store.currentDict.articles.findIndex(v => v.id === val.id)
  if (rIndex > -1) {
    store.currentDict.chapterIndex = rIndex
  }
}

defineExpose({getCurrentPractice})
const settingStore = useSettingStore()

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()
</script>

<template>
  <div class="practice-article">
    <div class="swiper-wrapper">
      <div class="swiper-list" :class="`step${tabIndex}`">
        <div class="swiper-item">
          <TypingArticle
              :active="tabIndex === 0"
              @edit="edit"
              @wrong="wrong"
              @over="over"
              @nextWord="nextWord"
              :article="articleData.article"
          />
        </div>
        <div class="swiper-item">
          <div class="typing-word-wrapper">
            <TypingWord
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
                  {{ store.dictTitle }}
                </div>
                <Tooltip
                    :title="`下一章(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.NextChapter]})`"
                    v-if="store.currentDict.chapterIndex < store.currentDict.articles.length - 1">
                  <IconWrapper>
                    <Icon @click="emitter.emit(EventKey.next)" icon="octicon:arrow-right-24"/>
                  </IconWrapper>
                </Tooltip>
              </div>
              <div class="right">
                {{ store.currentDict.articles.length }}篇文章
              </div>
            </div>

            <ArticleList4
                v-if="true"
                :isActive="active"
                :show-translate="settingStore.translate"
                :active-id="articleData.article.id"
                :list="store.currentDict.articles">
              <template v-slot:suffix="{item,index}">
                <BaseIcon
                    v-if="!isArticleCollect(item)"
                    class-name="collect"
                    @click="toggleArticleCollect(item)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class-name="fill"
                    @click="toggleArticleCollect(item)"
                    title="取消收藏" icon="ph:star-fill"/>
              </template>
            </ArticleList4>

            <ArticleList2
                v-else
                :isActive="active"
                :show-translate="settingStore.translate"
                @select-item="changePracticeArticle"
                :active-index="store.currentDict.chapterIndex"
                v-model:list="store.currentDict.articles">
              <template v-slot="{source,index}">
                <BaseIcon
                    v-if="!isArticleCollect(source)"
                    class-name="collect"
                    @click="toggleArticleCollect(source)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class-name="fill"
                    @click="toggleArticleCollect(source)"
                    title="取消收藏" icon="ph:star-fill"/>
              </template>
            </ArticleList2>
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