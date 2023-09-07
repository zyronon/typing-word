<script setup lang="ts">
import {computed, onMounted, onUnmounted, provide, watch} from "vue"
import 快速打字的机械键盘声音Mp3 from '../assets/sound/key-sounds/快速打字的机械键盘声音.mp3'
import 键盘快速打字的声音Mp3 from '../assets/sound/key-sounds/键盘快速打字的声音.mp3'
import 电话打字的声音Mp3 from '../assets/sound/key-sounds/电话打字的声音.mp3'
import 老式机械 from '../assets/sound/key-sounds/老式机械.mp3'
import 机械0 from '../assets/sound/key-sounds/jixie/机械0.mp3'
import 机械1 from '../assets/sound/key-sounds/jixie/机械1.mp3'
import 机械2 from '../assets/sound/key-sounds/jixie/机械2.mp3'
import 机械3 from '../assets/sound/key-sounds/jixie/机械3.mp3'
import beep from '../assets/sound/beep.wav'
import correct from '../assets/sound/correct.wav'
import {$computed, $ref} from "vue/macros"
import {useSound} from "@/hooks/useSound.ts"
import {useBaseStore} from "@/stores/base.ts"
import {DictType, SaveKey, ShortKeyMap, Word} from "../types";
import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import useTheme from "@/hooks/useTheme.ts";
import Tooltip from "@/components/Tooltip.vue";
import BaseButton from "@/components/BaseButton.vue";
import {
  Down,
  Delete,
} from "@icon-park/vue-next"
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep} from "lodash"

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)
let activeIndex = $ref(-1)
const store = useBaseStore()

// const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
// const [playKeySound, setAudio] = useSound([老式机械], 3)
const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)
const [playAudio] = usePlayWordAudio()


interface IProps {
  total: number,
  startDate: number
  inputNumber: number
  wrongNumber: number
  correctRate: number
}

const props = withDefaults(defineProps<IProps>(), {
  total: 0,
  startDate: Date.now(),
  inputNumber: 0,
  wrongNumber: 0,
  correctRate: 0,
})

const resetWord = $computed(() => {
  return store.word.name.slice(input.length + wrong.length)
})
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  emitter.on(EventKey.resetWord, () => {
    input = ''
  })
})

onUnmounted(() => {
  // console.log('onUnmounted')
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

function next() {
  if (store.current.index === store.current.words.length - 1) {
    if (store.current.wrongWords.length) {
      store.setCurrentWord(store.current.wrongWords)
    } else {
      if (store.currentDict.chapterIndex !== store.currentDict.chapterWords.length - 1) {
        console.log('这一章节完了')
        emitter.emit(EventKey.openStatModal)
      } else {
        console.log('这本书完了')
        emitter.emit(EventKey.openStatModal)
      }
    }
  } else {
    store.current.index++

    console.log('这个词完了')
  }
  if ([DictType.customDict, DictType.innerDict].includes(store.current.dictType) && store.skipWordNames.includes(store.word.name.toLowerCase())) {
    next()
  }

  if (store.current.index) {
    store.current.statistics.wrongWordNumber = store.current.wrongWords.length
    store.current.statistics.correctRate = Math.trunc(((store.current.index - store.current.wrongWords.length) / (store.current.index)) * 100)
  } else {
    store.current.statistics.wrongWordNumber = -1
    store.current.statistics.correctRate = -1
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
    if ((input + letter).toLowerCase() === store.word.name.toLowerCase().slice(0, input.length + 1)) {
      input += letter
      wrong = ''
      playKeySound()
    } else {
      if (!store.wrongWordDict.originWords.find((v: Word) => v.name.toLowerCase() === store.word.name.toLowerCase())) {
        store.wrongWordDict.originWords.push(store.word)
        store.wrongWordDict.words.push(store.word)
        store.wrongWordDict.chapterWords = [store.wrongWordDict.words]
      }
      if (!store.current.wrongWords.find((v: Word) => v.name.toLowerCase() === store.word.name.toLowerCase())) {
        store.current.wrongWords.push(store.word)
      }
      store.current.statistics.correctRate = Math.trunc(((store.current.index + 1 - store.current.wrongWords.length) / (store.current.index + 1)) * 100)
      wrong = letter
      playKeySound()
      playBeep()
      setTimeout(() => {
        wrong = ''
        // wrong = input = ''
      }, 500)
    }
    if (input.toLowerCase() === store.word.name.toLowerCase()) {
      playCorrect()
      setTimeout(next, 300)
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
        if (!store.newWordDict.originWords.find((v: Word) => v.name === store.word.name)) {
          store.newWordDict.originWords.push(store.word)
          store.newWordDict.words.push(store.word)
          store.newWordDict.chapterWords = [store.newWordDict.words]
        }
        activeIndex = 1
        break
      case ShortKeyMap.Remove:
        if (!store.skipWordNames.includes(store.word.name)) {
          store.skipWordDict.originWords.push(store.word)
          store.skipWordDict.words.push(store.word)
          store.skipWordDict.chapterWords = [store.skipWordDict.words]
        }
        activeIndex = 0
        next()
        break
      case ShortKeyMap.Ignore:
        e.preventDefault()
        activeIndex = 2
        next()
        break
      case ShortKeyMap.Show:
        showFullWord = true
        break
    }
    setTimeout(() => {
      activeIndex = -1
    }, 200)
  }
}


const {toggle} = useTheme()

</script>

<template>
  <div class="type-word">
    <div class="translate">{{ store.word.trans.join('；') }}</div>
    <div class="word-wrapper">
      <div class="word" :class="wrong && 'is-wrong'">
        <span class="input" v-if="input">{{ input }}</span>
        <span class="wrong" v-if="wrong">{{ wrong }}</span>
        <template v-if="store.isDictation">
          <span class="letter" v-if="!showFullWord"
                @mouseenter="showFullWord = true">{{ resetWord.split('').map(v => '_').join('') }}</span>
          <span class="letter" v-else @mouseleave="showFullWord = false">{{ resetWord }}</span>
        </template>
        <span class="letter" v-else>{{ resetWord }}</span>
      </div>
      <div class="audio" @click="playAudio(store.word.name)">播放</div>
    </div>
    <div class="phonetic">{{ store.word.usphone }}</div>
    <div class="options">
      <BaseButton keyboard="`" :active="activeIndex === 0">
        忽略
      </BaseButton>
      <BaseButton keyboard="Enter" :active="activeIndex === 1">
        收藏
      </BaseButton>
      <BaseButton keyboard="Tab" :active="activeIndex === 2">
        下一个
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.type-word {
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