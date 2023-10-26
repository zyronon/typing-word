<script setup lang="ts">
import {watch} from "vue"
import {$computed, $ref} from "vue/macros"
import {useBaseStore} from "@/stores/base.ts"
import {DictType, DisplayStatistics, ShortKeyMap, Word} from "../../../types";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import Options from "@/components/Practice/Options.vue";
import Typing from "@/components/Practice/PracticeWord/Typing.vue";
import WordPanel from "@/components/Practice/PracticeWord/WordPanel.vue";

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
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

watch(() => props.words, () => {
  data.words = props.words
  data.index = props.index
  data.originWrongWords = []
  data.wrongWords = []

  practiceStore.wrongWords = []
  practiceStore.repeatNumber = 0
  practiceStore.startDate = Date.now()
  practiceStore.correctRate = -1
  practiceStore.total = props.words.length
  practiceStore.inputWordNumber = 0
  practiceStore.wrongWordNumber = 0
}, {immediate: true})

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

function skip() {
  next(false)
}

function collect() {
  if (!store.collect.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
    store.collect.originWords.push(word)
    store.collect.words.push(word)
    store.collect.chapterWords = [store.collect.words]
  }
}

function remove() {
  if (!store.skipWordNames.includes(word.name.toLowerCase())) {
    store.skip.originWords.push(word)
    store.skip.words.push(word)
    store.skip.chapterWords = [store.skip.words]
  }
  next(false)
}

function onKeyUp(e: KeyboardEvent) {
  typingRef.hideWord()
}

function wordWrong() {
  if (!store.wrong.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
    store.wrong.originWords.push(word)
    store.wrong.words.push(word)
    store.wrong.chapterWords = [store.wrong.words]
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
    case ShortKeyMap.Collect:
      collect()
      break
    case ShortKeyMap.Remove:
      remove()
      break
    case ShortKeyMap.Ignore:
      skip()
      e.preventDefault()
      break
    case ShortKeyMap.Show:
      typingRef.showWord()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

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
      <Tooltip title="快捷键：Tab">
        <div class="next"
             @click="next(false)"
             v-if="nextWord">
          <div class="word" :class="settingStore.dictation && 'shadow'">{{ nextWord.name }}</div>
          <Icon class="arrow" icon="bi:arrow-right" width="22"/>
        </div>
      </Tooltip>
    </div>
    <Typing
        ref="typingRef"
        :word="word"
        @wrong="wordWrong"
        @next="next"
    />
    <Options
        @remove="remove"
        @skip="skip"
        @collect="collect"
    />
    <WordPanel :list="data.words" v-model:index="data.index"/>
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

    .shadow {
      color: transparent !important;
      text-shadow: #b0b0b0 0 0 6px;
      user-select: none;
    }
  }


}
</style>