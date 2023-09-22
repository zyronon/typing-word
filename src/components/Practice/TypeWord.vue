<script setup lang="ts">
import {onMounted, watch, watchEffect} from "vue"
import {$computed, $ref} from "vue/macros"
import {useBaseStore} from "@/stores/base.ts"
import {DictType, DisplayStatistics, ShortKeyMap, Statistics, Word} from "../../types";
import BaseButton from "@/components/BaseButton.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {useEventListener, useOnKeyboardEventListener} from "@/hooks/event.ts";

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
let activeBtnIndex = $ref(-1)
const store = useBaseStore()
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()


watch(() => props.words, () => {
  data.words = props.words
  data.index = props.words.length ? 0 : -1

  practiceStore.wrongWords = []
  practiceStore.repeatNumber = 0
  practiceStore.startDate = Date.now()
  practiceStore.correctRate = -1
  practiceStore.total = props.words.length
  practiceStore.inputWordNumber = 0
  practiceStore.wrongWordNumber = 0
}, {immediate: true})


let word = $computed(() => {
  return data.words[data.index] ?? {
    trans: [],
    name: '',
    usphone: '',
    ukphone: '',
  }
})

let resetWord = $computed(() => {
  return word.name.slice(input.length + wrong.length)
})

onMounted(() => {
  emitter.on(EventKey.resetWord, () => {
    wrong = input = ''
  })
})

function next() {
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)
      if (!data.originWrongWords.length) {
        data.originWrongWords = cloneDeep(data.wrongWords)
      }
      data.index = 0
      practiceStore.total = data.words.length
      practiceStore.inputWordNumber = 0
      practiceStore.wrongWordNumber = 0
      practiceStore.repeatNumber++
      data.wrongWords = []
    } else {
      console.log('这章节完了')
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
    practiceStore.inputWordNumber++
    console.log('这个词完了')
    if ([DictType.customDict, DictType.publicDict].includes(store.current.dictType)
        && store.skipWordNames.includes(word.name.toLowerCase())) {
      next()
    }
  }
  wrong = input = ''
}

function onKeyUp(e: KeyboardEvent) {
  showFullWord = false
}

async function onKeyDown(e: KeyboardEvent) {
  //TODO 还有横杠
  if ((e.keyCode >= 65 && e.keyCode <= 90) || e.code === 'Space') {
    let letter = e.key
    let isWrong = false
    if (settingStore.ignoreCase) {
      isWrong = (input + letter).toLowerCase() !== word.name.toLowerCase().slice(0, input.length + 1)
    } else {
      isWrong = (input + letter) !== word.name.slice(0, input.length + 1)
    }
    if (!isWrong) {
      input += letter
      wrong = ''
      playKeyboardAudio()
    } else {
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
    }
    if (input.toLowerCase() === word.name.toLowerCase()) {
      playCorrect()
      setTimeout(next, settingStore.waitTimeForChangeWord)
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
        if (!store.newWordDict.originWords.find((v: Word) => v.name.toLowerCase() === word.name.toLowerCase())) {
          store.newWordDict.originWords.push(word)
          store.newWordDict.words.push(word)
          store.newWordDict.chapterWords = [store.newWordDict.words]
        }
        activeBtnIndex = 1
        break
      case ShortKeyMap.Remove:
        if (!store.skipWordNames.includes(word.name.toLowerCase())) {
          store.skipWordDict.originWords.push(word)
          store.skipWordDict.words.push(word)
          store.skipWordDict.chapterWords = [store.skipWordDict.words]
        }
        activeBtnIndex = 0
        next()
        break
      case ShortKeyMap.Ignore:
        e.preventDefault()
        activeBtnIndex = 2
        next()
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
    <div class="translate"
         :style="{fontSize: settingStore.fontSize.wordTranslateFontSize +'rem'}"
    >{{ word.trans.join('；') }}
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
      <div class="audio" @click="playWordAudio(word.name)">播放</div>
    </div>
    <div class="phonetic">{{ word.usphone }}</div>
    <div class="options">
      <BaseButton keyboard="`" :active="activeBtnIndex === 0">
        忽略
      </BaseButton>
      <BaseButton keyboard="Enter" :active="activeBtnIndex === 1">
        收藏
      </BaseButton>
      <BaseButton keyboard="Tab" :active="activeBtnIndex === 2">
        下一个
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.type-word {
  flex: 1;
  display: flex;
  //display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 14rem;
  color: gray;
  gap: 2rem;

  .options {
    margin-top: 10rem;
    display: flex;
    gap: 15rem;
    font-size: 18rem;
  }

  .phonetic, .translate {
    font-size: 20rem;
    margin-left: -30rem;
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