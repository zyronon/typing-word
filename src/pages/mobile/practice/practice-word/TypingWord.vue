<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {DefaultDisplayStatistics, DictType, getDefaultWord, ShortcutKey, Sort, Word} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener, useWindowClick} from "@/hooks/event.ts";
import Typing from "@/pages/mobile/practice/practice-word/Typing.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useWordOptions} from "@/hooks/dict.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import BaseButton from "@/components/BaseButton.vue";
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import MobilePanel from "@/pages/mobile/components/MobilePanel.vue";
import router from "@/router.ts";
import {Icon} from "@iconify/vue";
import useTheme from "@/hooks/theme.ts";

interface IProps {
  words: Word[],
  index: number,
}

const props = withDefaults(defineProps<IProps>(), {
  words: [],
  index: -1
})

const emit = defineEmits<{
  'update:words': [val: Word[]],
  sort: [val: Word[]]
}>()

const typingRef: any = $ref()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const statisticsStore = usePracticeStore()
const settingStore = useSettingStore()
const {toggleTheme} = useTheme()

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()

let data = $ref({
  index: props.index,
  words: props.words,
  wrongWords: [],
})

let stat = cloneDeep(DefaultDisplayStatistics)
let showSortOption = $ref(false)
useWindowClick(() => showSortOption = false)

watch(() => props.words, () => {
  data.words = props.words
  data.index = props.index
  data.wrongWords = []

  statisticsStore.startDate = Date.now()
  statisticsStore.correctRate = -1
  statisticsStore.inputWordNumber = 0
  statisticsStore.wrong = 0
  stat = cloneDeep(DefaultDisplayStatistics)

}, {immediate: true})

watch(data, () => {
  statisticsStore.total = data.words.length
  statisticsStore.index = data.index
})

const word: Word = $computed(() => {
  return data.words[data.index] ?? getDefaultWord()
})

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {

    //复制当前错词，因为第一遍错词是最多的，后续的练习都是从错词中练习
    if (stat.total === -1) {
      let now = Date.now()
      stat = {
        startDate: statisticsStore.startDate,
        endDate: now,
        spend: now - statisticsStore.startDate,
        total: props.words.length,
        correctRate: -1,
        inputWordNumber: statisticsStore.inputWordNumber,
        wrong: data.wrongWords.length,
        wrongWords: data.wrongWords,
      }
      stat.correctRate = 100 - Math.trunc(((stat.wrong) / (stat.total)) * 100)
    }

    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)

      statisticsStore.total = data.words.length
      statisticsStore.index = data.index = 0
      statisticsStore.inputWordNumber = 0
      statisticsStore.wrong = 0
      data.wrongWords = []
    } else {
      console.log('这章节完了')
      isTyping && statisticsStore.inputWordNumber++

      let now = Date.now()
      stat.endDate = now
      stat.spend = now - stat.startDate

      emitter.emit(EventKey.openStatModal, stat)
    }
  } else {
    data.index++
    isTyping && statisticsStore.inputWordNumber++
    console.log('这个词完了')
    if ([DictType.word].includes(store.currentDict.type)
        && store.skipWordNames.includes(word.word.toLowerCase())) {
      next()
    }
  }
}

function wordWrong() {
  if (!store.wrong.originWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    store.wrong.originWords.push(word)
  }
  if (!data.wrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    data.wrongWords.push(word)
    statisticsStore.wrong++
  }
}

function onKeyUp(e: KeyboardEvent) {
  typingRef.hideWord()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('e', e)
  switch (e.key) {
    case 'Backspace':
      typingRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

//TODO 略过忽略的单词上
function prev() {
  if (data.index === 0) {
    ElMessage.warning('已经是第一个了~')
  } else {
    data.index--
  }
}

function skip(e: KeyboardEvent) {
  next(false)
  // e.preventDefault()
}

function show(e: KeyboardEvent) {
  typingRef.showWord()
}

function collect(e: KeyboardEvent) {
  toggleWordCollect(word)
}

function toggleWordSimpleWrapper() {
  if (!isWordSimple(word)) {
    toggleWordSimple(word)
    //延迟一下，不知道为什么不延迟会导致当前条目不自动定位到列表中间
    setTimeout(() => next(false))
  } else {
    toggleWordSimple(word)
  }
}

function play() {
  typingRef.play()
}

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    emit('sort', reverse(cloneDeep(data.words)))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    emit('sort', shuffle(data.words))
  }
}

onMounted(() => {
  emitter.on(ShortcutKey.ShowWord, show)
  emitter.on(ShortcutKey.Previous, prev)
  emitter.on(ShortcutKey.Next, skip)
  emitter.on(ShortcutKey.ToggleCollect, collect)
  emitter.on(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.on(ShortcutKey.PlayWordPronunciation, play)
})

onUnmounted(() => {
  emitter.off(ShortcutKey.ShowWord, show)
  emitter.off(ShortcutKey.Previous, prev)
  emitter.off(ShortcutKey.Next, skip)
  emitter.off(ShortcutKey.ToggleCollect, collect)
  emitter.off(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.off(ShortcutKey.PlayWordPronunciation, play)
})

let index = $ref(0)
watch(() => index, n => {
  settingStore.showPanel = index === 1
})

let inputRef = $ref<HTMLInputElement>()

function change(e) {
  console.log('e', e)
  e.key = e.data
  emitter.emit(EventKey.onTyping, e)
  inputRef.value = ''
}

function nextWord() {
  settingStore.translate = false
  settingStore.detail = false
  setTimeout(() => {
    next(true)
  }, 300)
}

function complete() {
  inputRef.blur()
  settingStore.detail = true
}

function unknow() {
  settingStore.translate = true
  inputRef.focus()
}

let bodyHeight = $ref('100vh')
onMounted(() => {
  bodyHeight = document.body.clientHeight + 'px'
})

</script>

<template>
  <div class="practice-center" :style="{height:bodyHeight}">
    <SlideHorizontal v-model:index="index">
      <SlideItem>
        <div class="practice-body" @click.stop="index = 0">
          <div class="tool-bar">
            <div class="left">
              <Icon icon="octicon:arrow-left-24" width="22"
                    @click="router.back()"
              />
            </div>
            <div class="right">
              <BaseIcon
                  v-if="!isWordCollect(word)"
                  class="collect"
                  @click="toggleWordCollect(word)"
                  icon="ph:star"/>
              <BaseIcon
                  v-else
                  class="fill"
                  @click="toggleWordCollect(word)"
                  icon="ph:star-fill"/>
              <BaseIcon
                  @click="index = 1"
                  icon="tdesign:menu-unfold"/>
            </div>
          </div>
          <input ref="inputRef"
                 style="position:fixed;top:-200vh;"
                 @input="change"
                 type="text">
          <Typing
              v-loading="!store.load"
              ref="typingRef"
              :word="word"
              @complete="complete"
          />
          <div class="options">
            <div class="wrapper">
              <BaseButton size="large" v-if="settingStore.detail" @click="nextWord">下一个</BaseButton>
              <template v-else>
                <BaseButton size="large" @click="unknow">不认识</BaseButton>
                <BaseButton size="large" @click="nextWord">认识</BaseButton>
              </template>
            </div>
          </div>
        </div>
      </SlideItem>
      <SlideItem style="width: 80vw;">
        <MobilePanel>
          <template v-slot="{active}">
            <div class="panel-page-item"
                 v-loading="!store.load"
            >
              <div class="list-header">
                <div class="left">
                  <div class="title">
                  </div>
                  <BaseIcon title="切换词典"
                            @click="emitter.emit(EventKey.openDictModal,'list')"
                            icon="carbon:change-catalog"/>
                  <div style="position:relative;"
                       @click.stop="null">
                    <BaseIcon
                        title="改变顺序"
                        icon="icon-park-outline:sort-two"
                        @click="showSortOption = !showSortOption"
                    />
                    <MiniDialog
                        v-model="showSortOption"
                        style="width: 130rem;"
                    >
                      <div class="mini-row-title">
                        列表循环设置
                      </div>
                      <div class="mini-row">
                        <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                        <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
                      </div>
                    </MiniDialog>
                  </div>
                  <BaseIcon icon="bi:arrow-right"
                            @click="next"
                            v-if="store.currentDict.chapterIndex < store.currentDict.chapterWords.length - 1"/>
                </div>
                <div class="right">
                  {{ data.words.length }}个单词
                </div>
              </div>
              <WordList
                  v-if="data.words.length"
                  :is-active="active"
                  :static="false"
                  :show-word="!settingStore.dictation"
                  :show-translate="settingStore.translate"
                  :list="data.words"
                  :activeIndex="data.index"
                  @click="(val:any) => data.index = val.index"
              >
                <template v-slot:suffix="{item,index}">
                  <BaseIcon
                      v-if="!isWordCollect(item)"
                      class="collect"
                      @click="toggleWordCollect(item)"
                      title="收藏" icon="ph:star"/>
                  <BaseIcon
                      v-else
                      class="fill"
                      @click="toggleWordCollect(item)"
                      title="取消收藏" icon="ph:star-fill"/>
                  <BaseIcon
                      v-if="!isWordSimple(item)"
                      class="easy"
                      @click="toggleWordSimple(item)"
                      title="标记为简单词"
                      icon="material-symbols:check-circle-outline-rounded"/>
                  <BaseIcon
                      v-else
                      class="fill"
                      @click="toggleWordSimple(item)"
                      title="取消标记简单词"
                      icon="material-symbols:check-circle-rounded"/>
                </template>
              </WordList>
              <Empty v-else/>
            </div>
          </template>
        </MobilePanel>
      </SlideItem>
    </SlideHorizontal>
  </div>
</template>

<style scoped lang="scss">
.practice-center {
  position: fixed;
  z-index: 1;
  font-size: 14rem;
  color: black;
  width: 100%;
  left: 0;
  top: 0;
  height: 100vh;
  display: flex;

  .practice-body {
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0 10rem;
    box-sizing: border-box;

    .tool-bar {
      width: 100%;
      height: 50rem;
      display: flex;
      padding: 0 10rem;
      align-items: center;
      justify-content: space-between;

      .right {
        display: flex;
        gap: 10rem;
      }
    }

    :deep(.word) {
      letter-spacing: 0;
      font-size: 36rem !important;
    }

    .options {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 20rem;

      .wrapper {
        width: 80%;
        display: flex;
        gap: 20rem;
      }

      :deep(.base-button) {
        flex: 1;
      }
    }
  }

}
</style>