<script setup lang="ts">
import {$ref} from "vue/macros";
import TypingArticle from "./TypingArticle.vue";
import {Article, DefaultArticle, TranslateType} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import TypingWord from "@/components/Practice/PracticeWord/TypingWord.vue";
import ArticlePanel from "./ArticlePanel.vue";
import {onMounted, watch} from "vue";
import {renewSectionTexts, renewSectionTranslates} from "@/hooks/translate.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {useBaseStore} from "@/stores/base.ts";
import EditSingleArticleModal from "@/components/Article/EditSingleArticleModal.vue";

const store = useBaseStore()
let tabIndex = $ref(0)
let wordData = $ref({
  words: [],
  index: -1
})
let index = $ref(0)
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
  () => store.current.dictType,
  () => store.currentDict.chapterIndex,
], n => {
  console.log('n', n)
  getCurrentPractice()
})

onMounted(() => {
  getCurrentPractice()
})

function getCurrentPractice() {
  // console.log('store.currentDict',store.currentDict)
  // return
  if (!store.currentDict.articles.length) return
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
}

function saveArticle(val: Article) {
  console.log('saveArticle', val)
  showEditArticle = false
  // articleData.article = cloneDeep(store.currentDict.articles[store.currentDict.chapterIndex])
  store.currentDict.articles[store.currentDict.chapterIndex] = articleData.article = val
}

function edit(val: Article) {
  editArticle = val
  showEditArticle = true
}

</script>

<template>
  <div class="practice-article">
    <div class="swiper-wrapper content">
      <div class="swiper-list" :class="`step${tabIndex}`">
        <div class="swiper-item">
          <TypingArticle
              :article="articleData.article"
          />
        </div>
        <div class="swiper-item">
          <TypingWord
              :words="wordData.words"
              :index="wordData.index"
              v-if="tabIndex === 1"
          />
        </div>
      </div>
    </div>

    <div class="panel-wrapper">
      <ArticlePanel :list="[]" v-model:index="index"/>
    </div>

    <EditSingleArticleModal
        v-model="showEditArticle"
        :article="editArticle"
        @save="saveArticle"
    />
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

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

.panel-wrapper {
  position: fixed;
  left: 0;
  top: 10rem;
  z-index: 1;
  margin-left: calc(50% + ($article-width / 2) + $space);
  height: calc(100% - 20rem);
}
</style>