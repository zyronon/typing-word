<script setup lang="ts">
import {onMounted, watch} from "vue"
import {$computed, $ref} from "vue/macros"
import {useBaseStore} from "@/stores/base.ts"
import {DictType, DisplayStatistics, ShortKeyMap, Word} from "../../types";
import BaseButton from "@/components/BaseButton.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import VolumeIcon from "@/components/VolumeIcon.vue";
import Tooltip from "@/components/Tooltip.vue";
import Panel from "@/components/Practice/Panel.vue";

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

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)
//输入锁定，因为跳转到下一个单词有延时，如果重复在延时期间内重复输入，导致会跳转N次
let inputLock = $ref(false)
let activeBtnIndex = $ref(-1)
let wordRepeatCount = $ref(0)
const store = useBaseStore()
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()
const volumeIconRef: any = $ref()

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

watch(() => data.index, (n) => {
  wrong = input = ''
  practiceStore.index = n
  wordRepeatCount = 0
  inputLock = false
  if (settingStore.wordSound) {
    playWordAudio(word.name)
    volumeIconRef?.play()
  }
})

let allList = $ref([])


const word = $computed(() => {
  // let w = data.words[data.index]
  // let s = allList.find(s => s.name === w.name)
  // if (s) return s
  // else return w ?? {
  //   trans: [],
  //   name: '',
  //   usphone: '',
  //   ukphone: '',
  // }
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

let resetWord = $computed(() => {
  return word.name.slice(input.length + wrong.length)
})


onMounted(() => {
  emitter.on(EventKey.resetWord, () => {
    wrong = input = ''
  })

})

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)
      if (!data.originWrongWords.length) {
        data.originWrongWords = cloneDeep(data.wrongWords)
      }
      data.index = 0
      practiceStore.total = data.words.length
      practiceStore.index = 0
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
    if ([DictType.customDict, DictType.publicDict].includes(store.current.dictType)
        && store.skipWordNames.includes(word.name.toLowerCase())) {
      next()
    }
  }
}

function prev() {
  data.index--
}

function ignore() {
  activeBtnIndex = 2
  next(false)
  setTimeout(() => {
    activeBtnIndex = -1
  }, 200)
}

function collect() {
  if (!store.newWordDict.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
    store.newWordDict.originWords.push(word)
    store.newWordDict.words.push(word)
    store.newWordDict.chapterWords = [store.newWordDict.words]
  }
  activeBtnIndex = 1
  setTimeout(() => {
    activeBtnIndex = -1
  }, 200)
}

function remove() {
  if (!store.skipWordNames.includes(word.name.toLowerCase())) {
    store.skipWordDict.originWords.push(word)
    store.skipWordDict.words.push(word)
    store.skipWordDict.chapterWords = [store.skipWordDict.words]
  }
  activeBtnIndex = 0
  next(false)
  setTimeout(() => {
    activeBtnIndex = -1
  }, 200)
}

function onKeyUp(e: KeyboardEvent) {
  showFullWord = false
}

function repeat() {
  setTimeout(() => {
    wrong = input = ''
    wordRepeatCount++
    inputLock = false

    if (settingStore.wordSound) {
      playWordAudio(word.name)
      volumeIconRef?.play()
    }
  }, settingStore.waitTimeForChangeWord)
}

async function onKeyDown(e: KeyboardEvent) {
  //TODO 还有横杠
  if ((e.keyCode >= 65 && e.keyCode <= 90) || e.code === 'Space') {
    if (inputLock) return
    inputLock = true
    let letter = e.key
    let isWrong = false
    if (settingStore.ignoreCase) {
      isWrong = (input + letter).toLowerCase() !== word.name.toLowerCase().slice(0, input.length + 1)
    } else {
      isWrong = (input + letter) !== word.name.slice(0, input.length + 1)
    }
    if (isWrong) {
      if (!store.wrongWordDict.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
        store.wrongWordDict.originWords.push(word)
        store.wrongWordDict.words.push(word)
        store.wrongWordDict.chapterWords = [store.wrongWordDict.words]
      }
      if (!data.wrongWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
        data.wrongWords.push(word)
        practiceStore.wrongWordNumber++
      }
      wrong = letter
      playKeyboardAudio()
      playBeep()
      setTimeout(() => {
        wrong = ''
      }, 500)
    } else {
      input += letter
      wrong = ''
      playKeyboardAudio()
    }
    if (input.toLowerCase() === word.name.toLowerCase()) {
      playCorrect()
      if (settingStore.repeatCount == 100) {
        if (settingStore.repeatCustomCount <= wordRepeatCount + 1) {
          setTimeout(next, settingStore.waitTimeForChangeWord)
        } else {
          repeat()
        }
      } else {
        if (settingStore.repeatCount <= wordRepeatCount + 1) {
          setTimeout(next, settingStore.waitTimeForChangeWord)
        } else {
          repeat()
        }
      }
    } else {
      inputLock = false
    }
  } else {
    // console.log('e', e)
    switch (e.key) {
      case 'Backspace':
        if (wrong) {
          wrong = ''
        } else {
          input = input.slice(0, -1)
        }
        break
      case ShortKeyMap.Collect:
        collect()
        break
      case ShortKeyMap.Remove:
        remove()
        break
      case ShortKeyMap.Ignore:
        ignore()
        e.preventDefault()
        break
      case ShortKeyMap.Show:
        if (settingStore.allowWordTip) {
          showFullWord = true
        }
        break
    }
    setTimeout(() => {
      activeBtnIndex = -1
    }, 200)
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

</script>

<template>
  <div class="type-word">
    <div class="near-word" v-if="settingStore.showNearWord">
      <div class="prev"
           @click="prev"
           v-if="prevWord">
        <Icon icon="bi:arrow-left" width="22"/>
        <div class="word">
          <div>{{ prevWord.name }}</div>
          <div v-show="settingStore.translate">{{ prevWord.trans.join('；') }}</div>
        </div>
      </div>
      <Tooltip title="快捷键：Tab">
        <div class="next"
             @click="next(false)"
             v-if="nextWord">
          <div class="word">
            <div :class="settingStore.dictation && 'shadow'">{{ nextWord.name }}</div>
            <div v-show="settingStore.translate">{{ nextWord.trans.join('；') }}</div>
          </div>
          <Icon icon="bi:arrow-right" width="22"/>
        </div>
      </Tooltip>
    </div>
    <div class="translate"
         :style="{
      fontSize: settingStore.fontSize.wordTranslateFontSize +'rem',
      opacity: settingStore.translate ? 1 : 0
    }"
    >
      <div v-for="i in word.trans">{{i}}</div>
    </div>
    <div class="word-wrapper">
      <div class="word"
           :class="wrong && 'is-wrong'"
           :style="{fontSize: settingStore.fontSize.wordForeignFontSize +'rem'}"
      >
        <span class="input" v-if="input">{{ input }}</span>
        <span class="wrong" v-if="wrong">{{ wrong }}</span>
        <template v-if="settingStore.dictation">
          <span class="letter" v-if="!showFullWord"
                @mouseenter="settingStore.allowWordTip && (showFullWord = true)">{{
              resetWord.split('').map(v => '_').join('')
            }}</span>
          <span class="letter" v-else @mouseleave="showFullWord = false">{{ resetWord }}</span>
        </template>
        <span class="letter" v-else>{{ resetWord }}</span>
      </div>
      <VolumeIcon ref="volumeIconRef" :simple="true" @click="playWordAudio(word.name)"/>
    </div>
    <div class="phonetic">{{ settingStore.wordSoundType === 'us' ? word.usphone : word.ukphone }}</div>
    <div class="options">
      <BaseButton keyboard="`"
                  @click="remove"
                  :active="activeBtnIndex === 0">
        忽略
      </BaseButton>
      <BaseButton keyboard="Enter"
                  @click="collect"
                  :active="activeBtnIndex === 1">
        收藏
      </BaseButton>
      <BaseButton keyboard="Tab"
                  @click="ignore"
                  :active="activeBtnIndex === 2">
        跳过
      </BaseButton>
    </div>
    <Panel :list="data.words" v-model:index="data.index"/>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.type-word {
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

    .word {
      div {
        font-size: 24rem;
        margin-bottom: 4rem;
      }

      div:last-child {
        font-size: 14rem;
      }
    }

    .prev {
      cursor: pointer;
      display: flex;
      float: left;
      align-items: center;
      gap: 10rem;
    }

    .next {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10rem;
      float: right;

      .word {
        text-align: right;
      }
    }

    .shadow {
      color: transparent !important;
      text-shadow: #b0b0b0 0 0 6px;
      user-select: none;
    }
  }

  .options {
    margin-top: 10rem;
    display: flex;
    gap: 15rem;
    font-size: 18rem;
  }

  .phonetic, .translate {
    font-size: 20rem;
    margin-left: -30rem;
    transition: all .3s;
  }

  .word-wrapper {
    display: flex;
    align-items: center;
    gap: 10rem;

    .word {
      font-size: 48rem;
      line-height: 1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      letter-spacing: 5rem;

      .input {
        color: rgb(22, 163, 74);
      }

      .wrong {
        color: rgba(red, 0.6);
      }

      &.is-wrong {
        animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
    }
  }
}
</style>