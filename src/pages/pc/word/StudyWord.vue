<script setup lang="ts">

import {onMounted, provide, watch} from "vue";

import Statistics from "@/pages/pc/word/Statistics.vue";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {getDefaultWord, ShortcutKey, StudyData, Word} from "@/types.ts";
import {useOnKeyboardEventListener, useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";
import {getCurrentStudyWord, useWordOptions} from "@/hooks/dict.ts";
import {cloneDeep, shuffle} from "lodash-es";
import {useRouter} from "vue-router";
import {Icon} from "@iconify/vue";
import Footer from "@/pages/pc/word/components/Footer.vue";
import Panel from "@/pages/pc/components/Panel.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import Type from "@/pages/pc/word/components/Type.vue";
import Empty from "@/components/Empty.vue";
import {useBaseStore} from "@/stores/base.ts";
import {usePracticeStore} from "@/stores/practice.ts";

interface IProps {
  new: Word[],
  review: Word[],
  write: Word[],
}

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const {toggleTheme} = useTheme()
const router = useRouter()
const store = useBaseStore()
const statStore = usePracticeStore()
const typingRef: any = $ref()
let allWrongWords = new Set()
let showStatDialog = $ref(false)
let studyData = $ref<IProps>({
  new: [],
  review: [],
  write: []
})

let data = $ref<StudyData>({
  index: 0,
  words: [],
  wrongWords: [],
})

provide('studyData', data)

onMounted(() => {
  if (runtimeStore.routeData) {
    studyData = runtimeStore.routeData
  } else {
    router.push('/word')
  }
})

watch(() => studyData, () => {
  data.words = studyData.new
  data.index = 0
  data.wrongWords = []
  allWrongWords = new Set()

  statStore.step = 0
  statStore.startDate = Date.now()
  statStore.inputWordNumber = 0
  statStore.wrong = 0
  statStore.total = studyData.review.concat(studyData.new).concat(studyData.write).length
  statStore.newWordNumber = studyData.new.length
  statStore.index = 0
}, {immediate: true, deep: true})

const word = $computed(() => {
  return data.words[data.index] ?? getDefaultWord()
})

const prevWord: Word = $computed(() => {
  return data.words?.[data.index - 1] ?? undefined
})

const nextWord: Word = $computed(() => {
  return data.words?.[data.index + 1] ?? undefined
})

function next(isTyping: boolean = true) {
  showStatDialog = true
  return
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('当前学完了，但还有错词')
      data.words = shuffle(cloneDeep(data.wrongWords))
      data.index = 0
      data.wrongWords = []
    } else {
      console.log('当前学完了，没错词', statStore.total, statStore.step, data.index)
      isTyping && statStore.inputWordNumber++

      //学完了
      if (statStore.step === 2) {
        statStore.spend = Date.now() - statStore.startDate
        console.log('全完学完了')
        emitter.emit(EventKey.openStatModal, {})
        // emit('complete', {})
      }

      //开始默认所有单词
      if (statStore.step === 1) {
        console.log('开始默认所有单词')
        statStore.step++
        settingStore.dictation = true
        data.words = shuffle(studyData.write.concat(studyData.new).concat(studyData.review))
        data.index = 0
      }

      //开始复习
      if (statStore.step === 0) {
        statStore.step++
        if (studyData.review.length) {
          console.log('开始复习')
          data.words = shuffle(studyData.review)
          settingStore.dictation = false
          data.index = 0
        } else {
          next()
        }
      }
    }
  } else {
    data.index++
    isTyping && statStore.inputWordNumber++
    console.log('这个词完了')
  }
}

function onTypeWrong() {
  let temp = word.word.toLowerCase()
  if (!allWrongWords.has(word.word.toLowerCase())) {
    allWrongWords.add(word.word.toLowerCase())
    statStore.wrong++
  }
  //测试时这里会卡一下，加上requestIdleCallback就好了
  requestIdleCallback(() => {
    if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === temp)) {
      store.wrong.words.push(word)
      store.wrong.length = store.wrong.words.length
    }
    if (!data.wrongWords.find((v: Word) => v.word.toLowerCase() === temp)) {
      data.wrongWords.push(word)
    }
  })
}

function onKeyUp(e: KeyboardEvent) {
  // console.log('onKeyUp', e)
  typingRef.hideWord()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('onKeyDown', e)
  switch (e.key) {
    case 'Backspace':
      typingRef.del()
      break
  }
}

useStartKeyboardEventListener()

useOnKeyboardEventListener(onKeyDown, onKeyUp)

function repeat() {
  console.log('repeat')
  settingStore.dictation = false
  emitter.emit(EventKey.resetWord)
  let temp = cloneDeep(studyData)
  //排除已掌握单词
  temp.new = temp.new.filter(v => !store.knownWords.includes(v.word))
  temp.review = temp.review.filter(v => !store.knownWords.includes(v.word))
  temp.write = temp.write.filter(v => !store.knownWords.includes(v.word))
  studyData = temp
}

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

function play() {
  typingRef.play()
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

function toggleTranslate() {
  settingStore.translate = !settingStore.translate
}

function toggleDictation() {
  settingStore.dictation = !settingStore.dictation
}

function openSetting() {
  runtimeStore.showSettingModal = true
}

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function togglePanel() {
  settingStore.showPanel = !settingStore.showPanel
}

useEvents([
  [EventKey.repeatStudy, repeat],
  [EventKey.continueStudy, next],
  [EventKey.changeDict, () => {
    studyData = getCurrentStudyWord()
  }],

  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Previous, prev],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.ToggleSimple, toggleWordSimpleWrapper],
  [ShortcutKey.PlayWordPronunciation, play],

  [ShortcutKey.RepeatChapter, repeat],
  [ShortcutKey.ToggleShowTranslate, toggleTranslate],
  [ShortcutKey.ToggleDictation, toggleDictation],
  [ShortcutKey.OpenSetting, openSetting],
  [ShortcutKey.ToggleTheme, toggleTheme],
  [ShortcutKey.ToggleConciseMode, toggleConciseMode],
  [ShortcutKey.TogglePanel, togglePanel],
])

</script>

<template>
  <div class="practice-wrapper">
    <div class="practice-word">
      <div class="absolute z-1 top-4   w-full" v-if="settingStore.showNearWord">
        <div class="center gap-2 cursor-pointer float-left"
             @click="prev"
             v-if="prevWord">
          <Icon class="arrow" icon="bi:arrow-left" width="22"/>
          <Tooltip
              :title="`上一个(${settingStore.shortcutKeyMap[ShortcutKey.Previous]})`"
          >
            <div class="word">{{ prevWord.word }}</div>
          </Tooltip>
        </div>
        <div class="center gap-2 cursor-pointer float-right "
             @click="next(false)"
             v-if="nextWord">
          <Tooltip
              :title="`下一个(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
          >
            <div class="word" :class="settingStore.dictation && 'word-shadow'">{{ nextWord.word }}</div>
          </Tooltip>
          <Icon class="arrow" icon="bi:arrow-right" width="22"/>
        </div>
      </div>
      <Type
          v-loading="!store.load"
          ref="typingRef"
          :word="word"
          @wrong="onTypeWrong"
          @complete="next"
      />
      <Footer
          :is-simple="isWordSimple(word)"
          @toggle-simple="toggleWordSimpleWrapper"
          :is-collect="isWordCollect(word)"
          @toggle-collect="toggleWordCollect(word)"
          @skip="next(false)"
      />
    </div>
    <div class="word-panel-wrapper">
      <Panel>
        <template v-slot="{active}">
          <div class="panel-page-item pl-4"
               v-loading="!store.load"
          >
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
                    @click.stop="toggleWordCollect(item)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class="fill"
                    @click.stop="toggleWordCollect(item)"
                    title="取消收藏" icon="ph:star-fill"/>
                <BaseIcon
                    v-if="!isWordSimple(item)"
                    class="easy"
                    @click.stop="toggleWordSimple(item)"
                    title="标记为已掌握"
                    icon="material-symbols:check-circle-outline-rounded"/>
                <BaseIcon
                    v-else
                    class="fill"
                    @click.stop="toggleWordSimple(item)"
                    title="取消标记已掌握"
                    icon="material-symbols:check-circle-rounded"/>
              </template>
            </WordList>
            <Empty v-else/>
          </div>
        </template>
      </Panel>
    </div>
  </div>
  <Statistics v-model="showStatDialog"

  />
</template>

<style scoped lang="scss">

.practice-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.practice-word {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: var(--toolbar-width);
}

.word-panel-wrapper {
  position: absolute;
  left: var(--panel-margin-left);
  //left: 0;
  top: .8rem;
  z-index: 1;
  height: calc(100% - 1.5rem);
}
</style>
