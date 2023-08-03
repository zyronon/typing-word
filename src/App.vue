<script setup lang="ts">
import {onMounted, onUnmounted} from "vue"
import NCE_2 from '@/assets/dicts/NCE_2.json'
import {chunk} from "lodash"
import {$ref} from "vue/macros"
// import {$ref, $computed} from 'vue/macros'
// import MCE_3 from './assets/dicts/NCE_3.json'

type Word = {"name": string, "usphone": string, "ukphone": string, "trans": string[]}
const wordList: Word[][] = chunk(NCE_2 as any, 15)
const chapterIndex = $ref(0)
const wordIndex = $ref(0)
const word: Word = $computed(() => {
  return wordList[chapterIndex][wordIndex]
})
let input = $ref('')
let wrong = $ref('')

function onKeyDown(e: KeyboardEvent) {
  if (e.keyCode >= 65 && e.keyCode <= 90) {
    let letter = e.key.toLowerCase()
    if (input + letter === word.name.slice(0, input.length + 1)) {
      input += letter
    } else {
      wrong = letter
      setTimeout(() => {
        wrong = input = ''
      }, 1000)
    }
  }
}

onMounted(() => {
  console.log('word', word)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  console.log('onUnmounted')
  window.removeEventListener('keydown', onKeyDown)
})

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
    <div class="word-wrapper">
      <div class="word">
        <span class="input" v-if="input">{{ input }}</span>
        <span class="wrong" v-if="wrong">{{ wrong }}</span>
        <span class="letter">{{ word.name.slice(input.length + wrong.length) }}</span>
      </div>
      <div class="audio" @click="playAudio">播放</div>
    </div>
    <div class="phonetic">{{ word.usphone }}</div>
    <div class="translate">{{ word.trans.join('；') }}</div>
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

  .word-wrapper {
    display: flex;
    align-items: center;
    gap: 10rem;

    .word {
      font-size: 48rem;
      line-height: 1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      letter-spacing: 2rem;

      .input {
        color: rgba(74, 222, 128, 0.8);
      }

      .wrong {
        color: rgba(red, 0.6);
      }
    }
  }
}
</style>
