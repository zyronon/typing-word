<script setup lang="ts">
import {onMounted, onUnmounted} from "vue"
import NCE_2 from '@/assets/dicts/NCE_2.json'
import {chunk} from "lodash"
import {$ref} from "vue/macros"
// import {$ref, $computed} from 'vue/macros'
// import MCE_3 from './assets/dicts/NCE_3.json'

type Word = { "name": string, "usphone": string, "ukphone": string, "trans": string[] }
let wordList: Word[][] = chunk(NCE_2 as any, 15)
let chapterIndex = $ref(0)
let wordIndex = $ref(0)
let word: Word = $computed(() => {
  return wordList[chapterIndex][wordIndex]
})
let input = $ref('')
let wrong = $ref('')
let skipWordList = $ref([])
let newWordList = $ref([])

function next() {
  if (wordIndex === wordList[chapterIndex].length - 1) {
    if (chapterIndex !== wordList.length - 1) {
      wordIndex = 0
      chapterIndex++
      console.log('这一章节完了')
    } else {
      console.log('这本书完了')
    }
  } else {
    wordIndex++
    console.log('这个词完了')
  }
  wrong = input = ''
}

function onKeyDown(e: KeyboardEvent) {
  if (e.keyCode >= 65 && e.keyCode <= 90) {
    let letter = e.key.toLowerCase()
    if (input + letter === word.name.slice(0, input.length + 1)) {
      input += letter
      wrong = ''
    } else {
      wrong = letter
      setTimeout(() => {
        wrong = ''
        // wrong = input = ''
      }, 500)
    }
    if (input === word.name) {
      next()
    }
  } else {
    console.log('e', e)
    switch (e.key) {
      case 'Backspace':
        if (wrong) {
          wrong = ''
        } else {
          input = input.slice(0, -1)
        }
        break
      case 'Enter':
        newWordList.push(word)
        break
      case 'Tab':
        e.preventDefault()
        skipWordList.push(word)
        next()
        break
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
