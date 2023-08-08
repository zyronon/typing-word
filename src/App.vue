<script setup lang="ts">
import {computed, onMounted, onUnmounted, provide, watch} from "vue"
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
import {$ref} from "vue/macros"
import {useSound} from "@/hooks/useSound.ts"
import {useBaseStore} from "@/stores/base.ts"
import {SaveKey, Word} from "./types";
import WordList from "./components/WordList.vue";
import Side from "@/components/Side.vue"
import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import DictModal from "@/components/DictModal.vue"

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)
let isDictation = $ref(true)
let activeIndex = $ref(-1)
const store = useBaseStore()

const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
// const [playKeySound, setAudio] = useSound([老式机械], 3)
// const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)
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

// watch(store.$state, (n) => {
//   localStorage.setItem(SaveKey, JSON.stringify(n))
// })

function next() {
  if (store.wordIndex === store.chapter.length - 1) {
    if (store.chapterIndex !== store.currentDict.chapterList.length - 1) {
      store.currentDict.wordIndex = 0
      store.currentDict.chapterIndex++
      console.log('这一章节完了')
    } else {
      console.log('这本书完了')
    }
  } else {
    store.currentDict.wordIndex++
    // console.log('这个词完了')
  }
  if (store.skipWordNames.includes(store.word.name)) {
    next()
  }
  wrong = input = ''
}

function onKeyUp(e: KeyboardEvent) {
  showFullWord = false
}

async function onKeyDown(e: KeyboardEvent) {
  if (e.keyCode >= 65 && e.keyCode <= 90 || e.code === 'Space') {
    let letter = e.key.toLowerCase()
    if (input + letter === store.word.name.slice(0, input.length + 1)) {
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
    if (input === store.word.name) {
      playCorrect()
      setTimeout(next, 200)
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

const [playAudio] = usePlayWordAudio()

const showDictModal = $ref(false)

</script>

<template>
  <div class="main-page">
    <div class="content">
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
          <div class="option" :class="activeIndex === 0 &&'active'">忽略</div>
          <div class="option" :class="activeIndex === 1 &&'active'">收藏</div>
          <div class="option" :class="activeIndex === 2 &&'active'">下一个</div>
        </div>
      </div>
    </div>
    <!--    <Side/>-->
    <DictModal/>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

.main-page {
  background: $dark-bg;
  width: 100vw;
  height: 100%;
  overflow: hidden;
  display: flex;
  font-size: 14rem;

  .content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .type-word {
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
