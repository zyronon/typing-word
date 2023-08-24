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
import {$ref} from "vue/macros"
import {useSound} from "@/hooks/useSound.ts"
import {useBaseStore} from "@/stores/base.ts"
import {DictType, SaveKey, Word} from "../types";
import WordList from "../components/WordList.vue";
import Side from "@/components/Side.vue"
import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import DictModal from "@/components/Modal/DictModal.vue"
import Backgorund from "@/components/Backgorund.vue"
import Statistics from "@/components/Modal/Statistics.vue";
import useThemeColor from "@/hooks/useThemeColor";
import Tooltip from "@/components/Tooltip.vue";
import Toolbar from "@/components/Toolbar/Toolbar.vue"
import {KeyboardOne} from "@icon-park/vue-next";
import BaseButton from "@/components/BaseButton.vue";
import Type from "@/components/Type.vue";

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)
let isDictation = $ref(false)
let activeIndex = $ref(-1)
const store = useBaseStore()

// const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
// const [playKeySound, setAudio] = useSound([老式机械], 3)
const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)
const [playAudio] = usePlayWordAudio()

const keyMap = {
  Show: 'Escape',
  Ignore: 'Tab',
  Remove: '`',
  Collect: 'Enter',
}

const restWord = $computed(() => {
  return store.word.name.slice(input.length + wrong.length)
})
onMounted(() => {
  store.init()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  // console.log('onUnmounted')
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

watch(store.$state, (n) => {
  localStorage.setItem(SaveKey, JSON.stringify(n))
})

function next() {
  if (store.currentDict.wordIndex === store.chapter.length - 1) {
    if (store.currentDict.chapterIndex !== store.currentDict.chapterList.length - 1) {
      store.currentDict.wordIndex = 0
      store.currentDict.chapterIndex++
      console.log('这一章节完了')
    } else {
      console.log('这本书完了')
      return
    }
  } else {
    store.currentDict.wordIndex++

    // var msg = new SpeechSynthesisUtterance();
    // // msg.text = store.word.name
    // msg.text = 'Hawaii wildfires burn historic town of Lahaina to the ground'
    // msg.rate = 0.8;
    // msg.pitch = 1;
    // msg.lang = 'en-US';
    // window.speechSynthesis.speak(msg);

    console.log('这个词完了')
  }
  if ([DictType.custom, DictType.inner].includes(store.currentDictType) && store.skipWordNames.includes(store.word.name)) {
    next()
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
      case keyMap.Collect:
        if (!store.newWordDict.wordList.find((v: Word) => v.name === store.word.name)) {
          store.newWordDict.wordList.push(store.word)
        }
        activeIndex = 1
        break
      case keyMap.Remove:
        if (!store.skipWordNames.includes(store.word.name)) {
          store.skipWordDict.wordList.push(store.word)
        }
        activeIndex = 0
        next()
        break
      case keyMap.Ignore:
        e.preventDefault()
        activeIndex = 2
        next()
        break
      case keyMap.Show:
        showFullWord = true
        break
    }
    setTimeout(() => {
      activeIndex = -1
    }, 200)
  }
}


const show = $ref(false)
const {appearance, toggle} = useThemeColor()

</script>

<template>
  <div class="type-word">
    <div class="translate">{{ store.word.trans.join('；') }}</div>
    <div class="word-wrapper">
      <div class="word" :class="wrong&&'is-wrong'">
        <span class="input" v-if="input">{{ input }}</span>
        <span class="wrong" v-if="wrong">{{ wrong }}</span>
        <template v-if="isDictation">
          <span class="letter" v-if="!showFullWord"
                @mouseenter="showFullWord = true">{{ restWord.split('').map(v => '_').join('') }}</span>
          <span class="letter" v-else @mouseleave="showFullWord = false">{{ restWord }}</span>
        </template>
        <span class="letter" v-else>{{ restWord }}</span>
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