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
import {_getDictDataByUrl, cloneDeep, shuffle} from "@/utils";
import {useRoute, useRouter} from "vue-router";
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
import {dictionaryResources} from "@/assets/dictionary.ts";
import {ElMessage} from "element-plus";

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
const route = useRoute()
const store = useBaseStore()
const statStore = usePracticeStore()
const typingRef: any = $ref()
let allWrongWords = new Set()
let showStatDialog = $ref(false)
let loading = $ref(false)
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

onMounted(() => {
  let dictId = route.query.q
  //如果url里有词典id，那么直接请求词典数据，并加到bookList里面进行学习
  if (dictId) {
    let dictResource = dictionaryResources.find(v => v.id === dictId)
    if (dictResource) {
      loading = true
      requestIdleCallback(() => {
        _getDictDataByUrl(dictResource).then(r => {
          store.changeDict(r)
          studyData = getCurrentStudyWord()
          loading = false
        })
      })
    } else {
      router.push('/word')
    }
  } else {
    if (runtimeStore.routeData) {
      studyData = runtimeStore.routeData
    } else {
      router.push('/word')
    }
  }
})

watch(() => studyData, () => {
  if (studyData.new.length === 0) {
    if (studyData.review.length) {
      settingStore.dictation = false
      statStore.step = 2
      data.words = studyData.review
    } else {
      if (studyData.write.length) {
        settingStore.dictation = true
        data.words = studyData.write
        statStore.step = 4
      } else {
        ElMessage.warning('没有可学习的单词！')
        router.push('/word')
      }
    }
  } else {
    settingStore.dictation = false
    data.words = studyData.new
    statStore.step = 0
  }
  data.index = 0
  data.wrongWords = []
  allWrongWords = new Set()

  statStore.startDate = Date.now()
  statStore.inputWordNumber = 0
  statStore.wrong = 0
  statStore.total = studyData.review.length + studyData.new.length + studyData.write.length
  statStore.newWordNumber = studyData.new.length
  statStore.reviewWordNumber = studyData.review.length
  statStore.writeWordNumber = studyData.write.length
  statStore.index = 0
})

provide('studyData', data)

const dictIsEnd = $computed(() => {
  return store.sdict.lastLearnIndex === store.sdict.length
})
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
  // showStatDialog = true
  // return
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('当前学完了，但还有错词')
      data.words = shuffle(cloneDeep(data.wrongWords))
      data.index = 0
      data.wrongWords = []
    } else {
      console.log('当前学完了，没错词', statStore.total, statStore.step, data.index)
      if (isTyping) statStore.inputWordNumber++

      //学完了
      if (statStore.step === 4) {
        statStore.spend = Date.now() - statStore.startDate
        console.log('全完学完了')
        showStatDialog = true
        // emit('complete', {})
      }

      //开始默认所有单词
      if (statStore.step === 3) {
        statStore.step++
        if (studyData.write.length) {
          console.log('开始默认所有单词')
          settingStore.dictation = true
          data.words = shuffle(studyData.write)
          data.index = 0
        } else {
          console.log('开始默认所有单词-无单词路过')
          next()
        }
      }

      //开始默写昨日
      if (statStore.step === 2) {
        statStore.step++
        if (studyData.review.length) {
          console.log('开始默写昨日')
          settingStore.dictation = true
          data.words = shuffle(studyData.review)
          data.index = 0
        } else {
          console.log('开始默写昨日-无单词路过')
          next()
        }
      }

      //开始复习昨日
      if (statStore.step === 1) {
        statStore.step++
        if (studyData.review.length) {
          console.log('开始复习昨日')
          settingStore.dictation = false
          data.words = shuffle(studyData.review)
          data.index = 0
        } else {
          console.log('开始复习昨日-无单词路过')
          next()
        }
      }

      //开始默写新词
      if (statStore.step === 0) {
        statStore.step++
        console.log('开始默写新词')
        settingStore.dictation = true
        data.words = shuffle(studyData.new)
        data.index = 0
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
  console.log('重学一遍')
  settingStore.dictation = false
  if (store.sdict.lastLearnIndex === 0 && store.sdict.complete) {
    //如果是刚刚完成，那么学习进度要从length减回去，因为lastLearnIndex为0了，同时改complete为false
    store.sdict.lastLearnIndex = store.sdict.length - statStore.newWordNumber
    store.sdict.complete = false
  } else {
    //将学习进度减回去
    store.sdict.lastLearnIndex = store.sdict.lastLearnIndex - statStore.newWordNumber
  }
  emitter.emit(EventKey.resetWord)
  let temp = cloneDeep(studyData)
  //排除已掌握单词
  temp.new = temp.new.filter(v => !store.knownWords.includes(v.word))
  temp.review = temp.review.filter(v => !store.knownWords.includes(v.word))
  temp.write = temp.write.filter(v => !store.knownWords.includes(v.word))
  studyData = temp
}

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

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function togglePanel() {
  settingStore.showPanel = !settingStore.showPanel
}

function continueStudy() {
  settingStore.dictation = false
  studyData = getCurrentStudyWord()
}

useEvents([
  [EventKey.repeatStudy, repeat],
  [EventKey.continueStudy, continueStudy],
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
        <template v-slot:title>
          <span>{{ store.sdict.name }} ({{ data.index + 1 }} / {{ data.words.length }})</span>
        </template>
        <div class="panel-page-item pl-4">
          <WordList
              v-if="data.words.length"
              :is-active="true"
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
      </Panel>
    </div>
  </div>
  <Statistics v-model="showStatDialog"/>
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
