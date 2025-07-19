<script setup lang="ts">
import TypingArticle from "./TypingArticle.vue";
import {Article, ArticleItem, ArticleWord, DisplayStatistics, getDefaultArticle, ShortcutKey, Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import Panel from "../../components/Panel.vue";
import {onMounted, onUnmounted} from "vue";
import {useBaseStore} from "@/stores/base.ts";
import EditSingleArticleModal from "@/pages/pc/article/components/EditSingleArticleModal.vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import {useArticleOptions} from "@/hooks/dict.ts";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import VolumeSetting from "@/pages/pc/components/toolbar/VolumeSetting.vue";
import TranslateSetting from "@/pages/pc/components/toolbar/TranslateSetting.vue";
import {genArticleSectionData, usePlaySentenceAudio} from "@/hooks/article.ts";

const store = useBaseStore()
const statisticsStore = usePracticeStore()
const runtimeStore = useRuntimeStore()

let tabIndex = $ref(0)
let wordData = $ref({
  words: [],
  index: -1
})
let articleData = $ref({
  articles: [],
  article: getDefaultArticle(),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})
let showEditArticle = $ref(false)
let typingArticleRef = $ref<any>()
let editArticle = $ref<Article>(getDefaultArticle())
let articleIsActive = $computed(() => tabIndex === 0)

function next() {
  if (!articleIsActive) return
  if (store.currentBook.lastLearnIndex >= articleData.articles.length - 1) {
    store.currentBook.lastLearnIndex = 0
  } else store.currentBook.lastLearnIndex++

  emitter.emit(EventKey.resetWord)
  getCurrentPractice()
}

function init() {
  if (!store.currentBook.articles.length) return
  articleData.articles = cloneDeep(store.currentBook.articles)
  getCurrentPractice()
  console.log('inin', articleData.article)

}

function setArticle(val: Article) {
  let tempVal = cloneDeep(val)
  articleData.articles[store.currentBook.lastLearnIndex] = tempVal
  articleData.article = tempVal
  statisticsStore.inputWordNumber = 0
  statisticsStore.wrong = 0
  statisticsStore.total = 0
  statisticsStore.startDate = Date.now()
  articleData.article.sections.map((v, i) => {
    v.map((w, j) => {
      w.words.map(s => {
        if (!store.skipWordNamesWithSimpleWords.includes(s.word.toLowerCase()) && !s.isSymbol) {
          statisticsStore.total++
        }
      })
    })
  })
}

function getCurrentPractice() {
  // console.log('store.currentBook',store.currentBook)
  // return
  tabIndex = 0
  articleData.article = getDefaultArticle()

  let currentArticle = articleData.articles[store.currentBook.lastLearnIndex]
  let tempArticle = getDefaultArticle(currentArticle)
  // console.log('article', tempArticle)
  if (tempArticle.sections.length) {
    setArticle(tempArticle)
  } else {
    genArticleSectionData(tempArticle)
    setArticle(tempArticle)
  }
}

function saveArticle(val: Article) {
  console.log('saveArticle', val, JSON.stringify(val.lrcPosition))
  console.log('saveArticle', val.textTranslate)
  showEditArticle = false
  let rIndex = store.currentBook.articles.findIndex(v => v.id === val.id)
  if (rIndex > -1) {
    store.currentBook.articles[rIndex] = cloneDeep(val)
  }
  setArticle(val)
}

function edit(val: Article = articleData.article) {
  if (!articleIsActive) return
  // tabIndex = 1
  // wordData.words = [
  //   {
  //     ...cloneDeep(DefaultWord),
  //     word: 'test'
  //   }
  // ]
  // wordData.index = 0
  // return
  editArticle = val
  showEditArticle = true
}

function wrong(word: Word) {
  let lowerName = word.word.toLowerCase();
  if (!store.wrong.originWords.find((v: Word) => v.word.toLowerCase() === lowerName)) {
    store.wrong.originWords.push(word)
  }
  if (!store.skipWordNamesWithSimpleWords.includes(lowerName)) {
  }
}

function over() {
  if (statisticsStore.wrong === 0) {
    // if (false) {
    console.log('这章节完了')
    let now = Date.now()
    let stat: DisplayStatistics = {
      startDate: statisticsStore.startDate,
      endDate: now,
      spend: now - statisticsStore.startDate,
      total: statisticsStore.total,
      correctRate: -1,
      wrong: statisticsStore.wrong,
    }
    stat.correctRate = 100 - Math.trunc(((stat.wrong) / (stat.total)) * 100)
    emitter.emit(EventKey.openStatModal, stat)
  } else {
    tabIndex = 1
    wordData.index = 0
  }
}

function nextWord(word: ArticleWord) {
  if (!store.skipWordNamesWithSimpleWords.includes(word.word.toLowerCase()) && !word.isSymbol) {
    statisticsStore.inputWordNumber++
  }
}

function handleChangeChapterIndex(val: ArticleItem) {
  let rIndex = articleData.articles.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    store.currentBook.lastLearnIndex = rIndex
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
function shortcutKeyEdit() {
  edit()
}

onMounted(() => {
  init()
})

useEvents([
  [EventKey.changeDict, init],
  [EventKey.next, next],

  [ShortcutKey.NextChapter, next],
  [ShortcutKey.PlayWordPronunciation, play],
  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.EditArticle, shortcutKeyEdit],
])

defineExpose({getCurrentPractice})

const emit = defineEmits<{
  ignore: [],
  wrong: [val: Word],
  nextWord: [val: ArticleWord],
  over: [],
  edit: [val: Article]
}>()

function format(val: number, suffix: string = '', check: number = -1) {
  return val === check ? '-' : (val + suffix)
}

const progress = $computed(() => {
  if (!statisticsStore.total) return 0
  if (statisticsStore.index > statisticsStore.total) return 100
  return ((statisticsStore.index / statisticsStore.total) * 100)
})

let speedMinute = $ref(0)
let timer = $ref(0)
onMounted(() => {
  timer = setInterval(() => {
    speedMinute = Math.floor((Date.now() - statisticsStore.startDate) / 1000 / 60)
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})

let audioRef = $ref<HTMLAudioElement>()
const {playSentenceAudio} = usePlaySentenceAudio()

</script>

<template>
  <div class="practice-wrapper">
    <div class="practice-article">
      <TypingArticle
          ref="typingArticleRef"
          :active="tabIndex === 0"
          @edit="edit"
          @wrong="wrong"
          @over="skip"
          @nextWord="nextWord"
          @play="e => playSentenceAudio(e,audioRef,articleData.article)"
          :article="articleData.article"
      />

      <Teleport to="body">
        <div class="panel-wrapper">
          <Panel v-if="tabIndex === 0">
            <template v-slot="{active}">
              <div class="panel-page-item">
                <div class="list-header">
                  <div class="left">
                    <BaseIcon title="切换词典"
                              icon="carbon:change-catalog"/>
                    <div class="title">
                      {{ store.currentBook.name }}
                    </div>
                    <Tooltip
                        :title="`下一章(${settingStore.shortcutKeyMap[ShortcutKey.NextChapter]})`"
                        v-if="store.currentBook.lastLearnIndex < articleData.articles.length - 1">
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
                    :show-translate="settingStore.translate"
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
      </Teleport>

      <EditSingleArticleModal
          v-model="showEditArticle"
          :article="editArticle"
          @save="saveArticle"
      />
    </div>
    <div class="footer " :class="!settingStore.showToolbar && 'hide'">
      <div class="bottom">
        <div class="flex justify-between">
          <div>
            <el-progress
                class="flex-1"
                :percentage="progress"
                :stroke-width="8"
                :show-text="false"/>
            <div class="stat">
              <div class="row">
                <div class="num">{{ speedMinute }}分钟</div>
                <div class="line"></div>
                <div class="name">时间</div>
              </div>
              <div class="row">
                <div class="num">{{ statisticsStore.total }}</div>
                <div class="line"></div>
                <div class="name">单词总数</div>
              </div>
              <div class="row">
                <div class="num">{{ format(statisticsStore.inputWordNumber, '', 0) }}</div>
                <div class="line"></div>
                <div class="name">输入数</div>
              </div>
              <div class="row">
                <div class="num">{{ format(statisticsStore.wrong, '', 0) }}</div>
                <div class="line"></div>
                <div class="name">错误数</div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-center justify-center gap-1">
            <audio ref="audioRef" v-if="articleData.article.audioSrc" :src="articleData.article.audioSrc"
                   controls></audio>
            <div class="flex gap-3 center">
              <BaseIcon
                  :title="`下一句(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
                  icon="icon-park-outline:go-ahead"
                  @click="emit('over')"/>
              <BaseIcon
                  :title="`重听(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
                  icon="fluent:replay-16-filled"
                  @click="play"/>

              <Tooltip
                  :title="`开关默写模式(${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
              >
                <IconWrapper>
                  <Icon icon="majesticons:eye-off-line"
                        v-if="settingStore.dictation"
                        @click="settingStore.dictation = false"/>
                  <Icon icon="mdi:eye-outline"
                        v-else
                        @click="settingStore.dictation = true"/>
                </IconWrapper>
              </Tooltip>

              <TranslateSetting/>

              <BaseIcon
                  :title="`编辑(${settingStore.shortcutKeyMap[ShortcutKey.EditArticle]})`"
                  icon="tabler:edit"
                  @click="emitter.emit(ShortcutKey.EditArticle)"
              />
              <BaseIcon
                  @click="settingStore.showPanel = !settingStore.showPanel"
                  :title="`面板(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
                  icon="tdesign:menu-unfold"/>
            </div>
          </div>
        </div>
      </div>
      <div class="progress">
        <el-progress :percentage="progress"
                     :stroke-width="8"
                     :show-text="false"/>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">

.practice-wrapper {
  font-size: 0.9rem;
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  //padding-right: var(--practice-wrapper-padding-right);
  transform: translateX(var(--practice-wrapper-translateX));
}

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
  width: var(--article-width);
}

.typing-word-wrapper {
  width: var(--toolbar-width);
}

.panel-wrapper {
  position: fixed;
  left: 0;
  top: .6rem;
  z-index: 1;
  margin-left: var(--article-panel-margin-left);
  height: calc(100% - 1.2rem);
}

.footer {
  width: var(--article-width);
  margin-bottom: .8rem;
  transition: all var(--anim-time);
  position: relative;
  margin-top: 1rem;

  &.hide {
    margin-bottom: -6rem;
    margin-top: 3rem;

    .progress {
      bottom: calc(100% + 1.8rem);
    }
  }

  .bottom {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border-radius: .6rem;
    background: var(--color-second-bg);
    padding: .2rem var(--space) .4rem var(--space);
    z-index: 2;
    border: 1px solid var(--color-item-border);
    box-shadow: var(--shadow);

    .stat {
      margin-top: .5rem;
      display: flex;
      justify-content: space-around;
      gap: 2rem;

      .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
        width: 5rem;
        color: gray;

        .line {
          height: 1px;
          width: 100%;
          background: var(--color-sub-gray);
        }
      }
    }
  }

  .progress {
    width: 100%;
    transition: all .3s;
    padding: 0 .6rem;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
  }

  :deep(.el-progress-bar__inner) {
    background: var(--color-scrollbar);
  }

}

</style>
