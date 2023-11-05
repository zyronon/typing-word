<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import {$computed, $ref} from "vue/macros"
import {useBaseStore} from "@/stores/base.ts"
import {DefaultShortcutKeyMap, DictType, DisplayStatistics, ShortcutKey, ShortcutKeyMap, Word} from "../../../types";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import Options from "@/components/Practice/Options.vue";
import Typing from "@/components/Practice/PracticeWord/Typing.vue";
import Panel from "@/components/Practice/Panel.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import WordList from "@/components/WordList.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useWordOptions} from "@/hooks/dict.ts";

interface IProps {
  words: Word[],
  index: number,
}

const props = withDefaults(defineProps<IProps>(), {
  words: [],
  index: -1
})

let data = $ref({
  index: props.index,
  words: props.words,
  wrongWords: [],
  originWrongWords: [],
})

let typingRef: any = $ref()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()

watch(() => props.words, () => {
  data.words = props.words
  data.index = props.index
  data.originWrongWords = []
  data.wrongWords = []

  practiceStore.wrongWords = []
  practiceStore.repeatNumber = 0
  practiceStore.startDate = Date.now()
  practiceStore.correctRate = -1
  practiceStore.inputWordNumber = 0
  practiceStore.wrongWordNumber = 0
}, {immediate: true})

watch(data, () => {
  practiceStore.total = data.words.length
  practiceStore.index = data.index
})

const word = $computed(() => {
  return data.words[data.index] ?? {
    trans: [],
    name: '',
    usphone: '',
    ukphone: '',
  }
})

const prevWord: Word = $computed(() => {
  return data.words?.[data.index - 1] ?? undefined
})

const nextWord: Word = $computed(() => {
  return data.words?.[data.index + 1] ?? undefined
})

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)
      //如果原始错词没值就复制当前错词的，因为第一遍错词是最多的，后续的练习都是从错词中练习
      if (!data.originWrongWords.length) {
        data.originWrongWords = cloneDeep(data.wrongWords)
      }
      practiceStore.total = data.words.length
      practiceStore.index = data.index = 0
      practiceStore.inputWordNumber = 0
      practiceStore.wrongWordNumber = 0
      practiceStore.repeatNumber++
      data.wrongWords = []
    } else {
      console.log('这章节完了')
      isTyping && practiceStore.inputWordNumber++
      let now = Date.now()
      let stat: DisplayStatistics = {
        startDate: practiceStore.startDate,
        endDate: now,
        spend: now - practiceStore.startDate,
        total: props.words.length,
        correctRate: -1,
        wrongWordNumber: data.originWrongWords.length,
        wrongWords: data.originWrongWords,
      }
      stat.correctRate = 100 - Math.trunc(((stat.wrongWordNumber) / (stat.total)) * 100)
      emitter.emit(EventKey.openStatModal, stat)
    }
  } else {
    data.index++
    isTyping && practiceStore.inputWordNumber++
    console.log('这个词完了')
    if ([DictType.customWord, DictType.word].includes(store.current.dictType)
        && store.skipWordNames.includes(word.name.toLowerCase())) {
      next()
    }
  }
}

function prev() {
  data.index--
}


function onKeyUp(e: KeyboardEvent) {
  typingRef.hideWord()
}

function wordWrong() {
  if (!store.wrong.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
    store.wrong.originWords.push(word)
  }
  if (!data.wrongWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
    data.wrongWords.push(word)
    practiceStore.wrongWordNumber++
  }
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
    next(false)
  } else {
    toggleWordSimple(word)
  }
}

onMounted(() => {
  emitter.on(ShortcutKey.Show, show)
  emitter.on(ShortcutKey.Skip, skip)
  emitter.on(ShortcutKey.ToggleCollect, collect)
  emitter.on(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
})

onUnmounted(() => {
  emitter.off(ShortcutKey.Show, show)
  emitter.off(ShortcutKey.Skip, skip)
  emitter.off(ShortcutKey.ToggleCollect, collect)
  emitter.off(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
})

</script>

<template>
  <div class="practice-word">
    <div class="near-word" v-if="settingStore.showNearWord">
      <div class="prev"
           @click="prev"
           v-if="prevWord">
        <Icon class="arrow" icon="bi:arrow-left" width="22"/>
        <div class="word">{{ prevWord.name }}</div>
      </div>
      <div class="next"
           @click="next(false)"
           v-if="nextWord">
        <Tooltip title="快捷键：Tab">
          <div class="word" :class="settingStore.dictation && 'text-shadow'">{{ nextWord.name }}</div>
        </Tooltip>
        <Icon class="arrow" icon="bi:arrow-right" width="22"/>
      </div>
    </div>
    <Typing
        ref="typingRef"
        :word="word"
        @wrong="wordWrong"
        @next="next"
    />
    <div class="options-wrapper">
      <Options
          :is-simple="isWordSimple(word)"
          @toggle-simple="toggleWordSimpleWrapper"
          :is-collect="isWordCollect(word)"
          @toggle-collect="toggleWordCollect(word)"
          @skip="next(false)"
      />
    </div>

    <Teleport to="body">
      <div class="word-panel-wrapper">
        <Panel>
          <template v-slot="{active}">
            <div class="panel-page-item">
              <header>
                <div class="left">
                  <Tooltip title="切换词典">
                    <IconWrapper>
                      <Icon @click="runtimeStore.showDictModal = true" icon="basil:exchange-outline"/>
                    </IconWrapper>
                  </Tooltip>
                  <div class="title">
                    {{ store.dictTitle }}
                  </div>
                  <Tooltip title="下一章"
                           v-if="store.currentDict.chapterIndex < store.currentDict.chapterWords.length - 1 && !store.isArticle">
                    <IconWrapper>
                      <Icon @click="emitter.emit(EventKey.next)" icon="octicon:arrow-right-24"/>
                    </IconWrapper>
                  </Tooltip>
                </div>
                <div class="right">
                  {{ data.words.length }}个单词
                </div>
              </header>
              <WordList
                  class="word-list"
                  :is-active="active"
                  @change="(i:number) => data.index = i"
                  :show-word="!settingStore.dictation"
                  :show-translate="settingStore.translate"
                  :list="data.words"
                  :activeIndex="data.index"/>
            </div>
          </template>
        </Panel>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.practice-word {
  height: 100%;
  flex: 1;
  display: flex;
  //display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 14rem;
  color: gray;
  gap: 6rem;
  position: relative;
  width: var(--toolbar-width);

  .near-word {
    position: absolute;
    top: 0;
    width: 100%;

    & > div {
      width: 45%;
      align-items: center;

      .arrow {
        min-width: 22rem;
        min-height: 22rem;
      }
    }

    .word {
      font-size: 24rem;
      margin-bottom: 4rem;
      font-family: $word-font-family;
    }

    .prev {
      cursor: pointer;
      display: flex;
      float: left;
      gap: 10rem;
    }

    .next {
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
      gap: 10rem;
      float: right;
    }
  }

  .options-wrapper {
    position: absolute;
    //bottom: 0;
    margin-left: -30rem;
    margin-top: 120rem;
  }
}

$article-width: 50vw;

.word-panel-wrapper {
  position: fixed;
  left: 0;
  top: 10rem;
  z-index: 1;
  margin-left: calc(50% + (var(--toolbar-width) / 2) + $space);
  height: calc(100% - 20rem);
}

</style>