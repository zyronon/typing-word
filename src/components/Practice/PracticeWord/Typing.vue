<script setup lang="ts">
import {DefaultWord, Word} from "@/types.ts";
import VolumeIcon from "@/components/VolumeIcon.vue";
import {$computed, $ref} from "vue/macros";
import {useBaseStore} from "@/stores/base.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {cloneDeep} from "lodash-es";
import {onUnmounted, watch, onMounted} from "vue";

interface IProps {
  word: Word,
}

const props = withDefaults(defineProps<IProps>(), {
  word: () => cloneDeep(DefaultWord),
})

const emit = defineEmits<{
  next: [],
  wrong: []
}>()

let input = $ref('')
let wrong = $ref('')
let showFullWord = $ref(false)
//输入锁定，因为跳转到下一个单词有延时，如果重复在延时期间内重复输入，导致会跳转N次
let inputLock = false
let wordRepeatCount = 0
const settingStore = useSettingStore()

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()
const volumeIconRef: any = $ref()

let displayWord = $computed(() => {
  return props.word.name.slice(input.length + wrong.length)
})

watch(() => props.word, () => {
  wrong = input = ''
  wordRepeatCount = 0
  inputLock = false
  if (settingStore.wordSound) {
    volumeIconRef?.play()
  }
})

onMounted(() => {
  emitter.on(EventKey.resetWord, () => {
    wrong = input = ''
  })

  emitter.on(EventKey.onTyping, onTyping)
})

onUnmounted(() => {
  emitter.off(EventKey.resetWord)
  emitter.off(EventKey.onTyping, onTyping)
})

function repeat() {
  setTimeout(() => {
    wrong = input = ''
    wordRepeatCount++
    inputLock = false

    if (settingStore.wordSound) {
      volumeIconRef?.play()
    }
  }, settingStore.waitTimeForChangeWord)
}

async function onTyping(e: KeyboardEvent) {
  if (inputLock) return
  inputLock = true
  let letter = e.key
  let isTypingRight = false
  let isWordRight = false
  if (settingStore.ignoreCase) {
    isTypingRight = letter.toLowerCase() === props.word.name[input.length].toLowerCase()
    isWordRight = (input + letter).toLowerCase() === props.word.name.toLowerCase()
  } else {
    isTypingRight = letter === props.word.name[input.length]
    isWordRight = (input + letter) === props.word.name
  }
  if (isTypingRight) {
    input += letter
    wrong = ''
    playKeyboardAudio()
  } else {
    emit('wrong')
    wrong = letter
    playKeyboardAudio()
    playBeep()
    setTimeout(() => {
      wrong = ''
    }, 500)
  }

  if (isWordRight) {
    playCorrect()
    if (settingStore.repeatCount == 100) {
      if (settingStore.repeatCustomCount <= wordRepeatCount + 1) {
        setTimeout(() => emit('next'), settingStore.waitTimeForChangeWord)
      } else {
        repeat()
      }
    } else {
      if (settingStore.repeatCount <= wordRepeatCount + 1) {
        setTimeout(() => emit('next'), settingStore.waitTimeForChangeWord)
      } else {
        repeat()
      }
    }
  } else {
    inputLock = false
  }
}

function del() {
  playKeyboardAudio()

  if (wrong) {
    wrong = ''
  } else {
    input = input.slice(0, -1)
  }
}

function showWord() {
  if (settingStore.allowWordTip) {
    showFullWord = true
  }
}

function hideWord() {
  showFullWord = false
}

defineExpose({del, showWord, hideWord})
</script>

<template>
  <div class="typing-word">
      <div class="translate"
           :style="{
      fontSize: settingStore.fontSize.wordTranslateFontSize +'rem',
      opacity: settingStore.translate ? 1 : 0
    }"
      >
        <div v-for="i in word.trans">{{ i }}</div>
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
              displayWord.split('').map(() => '_').join('')
            }}</span>
            <span class="letter" v-else @mouseleave="showFullWord = false">{{ displayWord }}</span>
          </template>
          <span class="letter" v-else>{{ displayWord }}</span>
        </div>
        <VolumeIcon ref="volumeIconRef" :simple="true" :cb="()=>playWordAudio(word.name)"/>
      </div>
      <div class="phonetic">{{ settingStore.wordSoundType === 'us' ? word.usphone : word.ukphone }}</div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.typing-word {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .phonetic, .translate {
    font-size: 20rem;
    margin-left: -30rem;
    transition: all .3s;
  }

  .translate{
    position: absolute;
    transform: translateY(-50%);
    margin-bottom: 90rem;
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