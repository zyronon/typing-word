<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import NCE_2 from './assets/dicts/NCE_2.json'
import 快速打字的机械键盘声音Mp3 from './assets/sound/key-sounds/快速打字的机械键盘声音.mp3'
import 键盘快速打字的声音Mp3 from './assets/sound/key-sounds/键盘快速打字的声音.mp3'
import 电话打字的声音Mp3 from './assets/sound/key-sounds/电话打字的声音.mp3'
import 老式机械 from './assets/sound/key-sounds/老式机械.mp3'
import 机械0 from './assets/sound/key-sounds/jixie/机械0.mp3'
import 机械1 from './assets/sound/key-sounds/jixie/机械1.mp3'
import 机械2 from './assets/sound/key-sounds/jixie/机械2.mp3'
import 机械3 from './assets/sound/key-sounds/jixie/机械3.mp3'
import beep from './assets/sound/beep.wav'
import correct from './assets/sound/correct.wav'
import {chunk} from "lodash"
import {$ref} from "vue/macros"
import {useSound} from "@/hooks/useSound.ts"
// import {$ref, $computed} from 'vue/macros'
// import MCE_3 from './assets/dicts/NCE_3.json'

type Config = {
  newWords: Word[],
  skipWords: Word[],
  skipWordNames: string[],
  dict: string,
  chapterIndex: number,
  wordIndex: number,
}
type Word = {"name": string, "usphone": string, "ukphone": string, "trans": string[]}
let wordList: Word[][] = $ref([])
let input = $ref('')
let wrong = $ref('')
let activeIndex = $ref(-1)
let config: Config = $ref({
  newWords: [],
  skipWords: [],
  skipWordNames: [],
  dict: 'nce2',
  chapterIndex: 0,
  wordIndex: 0,
})

// const [play, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
const [play, setAudio] = useSound([老式机械], 3)
// const [play, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)

let word: Word = $computed(() => {
  return wordList?.[config.chapterIndex]?.[config.wordIndex] ?? {
    trans: [],
    name: ''
  }
})
const saveKey = 'bb-word-config'
onMounted(() => {
  let configStr = localStorage.getItem(saveKey)
  if (configStr) {
    let obj: Config = JSON.parse(configStr)
    config.newWords = obj.newWords
    config.skipWords = obj.skipWords
    config.skipWordNames = obj.skipWordNames
    config.dict = obj.dict
    config.chapterIndex = obj.chapterIndex
    config.wordIndex = 0
  }
  if (config.dict === 'nce2') {
    wordList = chunk(NCE_2, 15) as any
    let wordTemp = wordList?.[config.chapterIndex]?.[config.wordIndex]
    if (wordTemp && config.skipWordNames.includes(wordTemp.name)) {
      next()
    }
  }


  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  // console.log('onUnmounted')
  window.removeEventListener('keydown', onKeyDown)
})

watch(config, (n) => {
  localStorage.setItem(saveKey, JSON.stringify(n))
})

function next() {
  if (config.wordIndex === wordList[config.chapterIndex].length - 1) {
    if (config.chapterIndex !== wordList.length - 1) {
      config.wordIndex = 0
      config.chapterIndex++
      console.log('这一章节完了')
    } else {
      console.log('这本书完了')
    }
  } else {
    config.wordIndex++
    // console.log('这个词完了')
  }
  if (config.skipWordNames.includes(word.name)) {
    next()
  }

  wrong = input = ''
}

async function onKeyDown(e: KeyboardEvent) {
  if (e.keyCode >= 65 && e.keyCode <= 90 || e.code === 'Space') {
    let letter = e.key.toLowerCase()
    if (input + letter === word.name.slice(0, input.length + 1)) {
      input += letter
      wrong = ''
      play()
    } else {
      wrong = letter
      playBeep()
      setTimeout(() => {
        wrong = ''
        // wrong = input = ''
      }, 500)
    }
    if (input === word.name) {
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
      case 'Enter':
        if (!config.newWords.find(v => v.name === word.name)) {
          config.newWords.push(word)
        }
        activeIndex = 1
        break
      case '`':
        if (!config.skipWordNames.includes(word.name)) {
          config.skipWords.push(word)
          config.skipWordNames = config.skipWords.map(v => v.name)
        }
        activeIndex = 0
        next()
        break
      case 'Tab':
        e.preventDefault()
        activeIndex = 2
        next()
        break
    }
    setTimeout(() => {
      activeIndex = -1
    }, 200)
  }
}

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

function generateWordSoundSrc(word: string, pronunciation: string) {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
  }
}

function playAudio() {
  let audio = new Audio(generateWordSoundSrc(word.name, 'us'))
  audio.play()
}
</script>

<template>
  <div class="page">
    <div class="translate">{{ word.trans.join('；') }}</div>
    <div class="word-wrapper">
      <div class="word" :class="wrong&&'is-wrong'">
        <span class="input" v-if="input">{{ input }}</span>
        <span class="wrong" v-if="wrong">{{ wrong }}</span>
        <span class="letter">{{ word.name.slice(input.length + wrong.length) }}</span>
      </div>
      <div class="audio" @click="playAudio">播放</div>
    </div>
    <div class="phonetic">{{ word.usphone }}</div>
    <div class="options">
      <div class="option" :class="activeIndex === 0 &&'active'">忽略</div>
      <div class="option" :class="activeIndex === 1 &&'active'">收藏</div>
      <div class="option" :class="activeIndex === 2 &&'active'">下一个</div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.page {
  background: rgb(17, 24, 39);
  width: 100%;
  height: 100%;
  display: flex;
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

    .option {
      cursor: pointer;
      padding: 6rem 10rem;
      border-radius: 4rem;
      background: gray;
      color: white;

      &:hover {
        //background: rgb(70, 67, 67) !important;
        background: red;
      }

      &.active {
        background: red;
      }
    }
  }

  .phonetic, .translate {
    font-size: 20rem;
  }

  .word-wrapper {
    display: flex;
    align-items: center;
    gap: 10rem;

    .word {
      font-size: 48rem;
      line-height: 1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      letter-spacing: 2.5rem;

      .input {
        color: rgba(74, 222, 128, 0.8);
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

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
