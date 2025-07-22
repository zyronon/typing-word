<script setup lang="ts">
import {getDefaultWord, ShortcutKey, Word} from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {nextTick, onMounted, onUnmounted, watch} from "vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";

interface IProps {
  word: Word,
}

const props = withDefaults(defineProps<IProps>(), {
  word: () => getDefaultWord(),
})

const emit = defineEmits<{
  complete: [],
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
  return props.word.word.slice(input.length + wrong.length)
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
    isTypingRight = letter.toLowerCase() === props.word.word[input.length].toLowerCase()
    isWordRight = (input + letter).toLowerCase() === props.word.word.toLowerCase()
  } else {
    isTypingRight = letter === props.word.word[input.length]
    isWordRight = (input + letter) === props.word.word
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
    volumeIconRef?.play()
    setTimeout(() => {
      wrong = ''
    }, 500)
  }

  if (isWordRight) {
    playCorrect()
    if (settingStore.repeatCount == 100) {
      if (settingStore.repeatCustomCount <= wordRepeatCount + 1) {
        setTimeout(() => emit('complete'), settingStore.waitTimeForChangeWord)
      } else {
        repeat()
      }
    } else {
      if (settingStore.repeatCount <= wordRepeatCount + 1) {
        setTimeout(() => emit('complete'), settingStore.waitTimeForChangeWord)
      } else {
        repeat()
      }
    }
  } else {
    inputLock = false
  }
}

function del() {
  console.log('del')
  playKeyboardAudio()

  if (wrong) {
    wrong = ''
  } else {
    input = input.slice(0, -1)
  }
  console.log(input)
}

function showWord() {
  if (settingStore.allowWordTip) {
    showFullWord = true
  }
}

function hideWord() {
  showFullWord = false
}

function play() {
  volumeIconRef?.play()
}

defineExpose({del, showWord, hideWord, play})

let transHeight = $ref(150)
let transWrapperRef = $ref<HTMLDivElement>()
let showEnd = $ref(true)

const transStyle = $computed(() => {
  return {
    'justify-content': showEnd ? 'flex-end' : 'unset',
    height: transHeight + 'px',
    opacity: settingStore.translate ? 1 : 0
  }
})

watch(() => props.word, () => {
  wrong = input = ''
  wordRepeatCount = 0
  inputLock = false
  if (settingStore.wordSound) {
    volumeIconRef?.play(400, true)
  }
  transHeight = 150
  nextTick(() => {
    console.log('transWrapperRef.scrollHeight', transWrapperRef.scrollHeight)
    let scrollHeight = transWrapperRef.scrollHeight
    if (scrollHeight <= 240) {
      showEnd = true
      if (scrollHeight > transHeight) {
        transHeight = scrollHeight
      }
    } else {
      showEnd = scrollHeight <= transHeight
    }
  })
})

</script>

<template>
  <div class="typing-word">
    <div class="translate"
         :style="transStyle"
    >
      <div class="wrapper" ref="transWrapperRef">
        <div class="translate-item" v-for="(v,i) in word.trans">
          <span>{{ (v.pos ? v.pos + '.' : '') + v.cn }}</span>
        </div>
      </div>
    </div>
    <div class="word-wrapper"
         :style="{marginTop: transHeight + 6 + 'px'}"
    >
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
      <Tooltip
          :title="`发音(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
      >
        <VolumeIcon ref="volumeIconRef" :simple="true" :cb="() => playWordAudio(word.word)"/>
      </Tooltip>
    </div>
    <div class="phonetic" v-if="settingStore.wordSoundType === 'us' && word.phonetic0">[{{ word.phonetic0 }}]</div>
    <div class="phonetic" v-if="settingStore.wordSoundType === 'uk' && word.phonetic1">[{{ word.phonetic1 }}]</div>
    <transition name="fade">
      <div class="other" v-if="settingStore.detail">
        <div class="sentences" v-if="word.sentences && word.sentences.length">
          <div class="title">例句</div>
          <div class="sentence" v-for="item in word.sentences">
            <div class="tran">{{ item.tran }}</div>
            <div class="v">{{ item.v }}</div>
          </div>
        </div>
        <div class="sentences" v-if="word.phrases && word.phrases.length">
          <div class="title">短语</div>
          <div class="sentence" v-for="item in word.phrases">
            <div class="tran">{{ item.tran }}</div>
            <div class="v">{{ item.v }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">

.typing-word {
  width: 95%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
  position: relative;
  color: var(--color-font-2);
  overflow: auto;
  padding-bottom: 20rem;

  &::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }

  .other {
    margin-top: 10rem;
    width: 100%;
    font-size: 18rem;

    .sentences {
      margin-bottom: 20rem;

      .title {
      }

      .sentence {
        margin-bottom: 8rem;

        .tran {
          color: white;
          font-size: 18rem;
          margin-bottom: 2rem;
        }

        .v {
          color: var(--color-font-1);
          font-size: 14rem;
        }
      }
    }
  }

  .phonetic, .translate {
    transition: opacity .3s;
  }

  .phonetic {
    font-size: 14rem;
    margin-top: 5rem;
    font-family: var(--word-font-family);
  }

  .translate {
    font-size: 18rem;
    width: 100%;
    position: absolute;
    height: 150px;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: auto;

    .wrapper {
    }

    &:hover {
      .volumeIcon {
        opacity: 1;
      }
    }

    .translate-item {
      display: flex;
      align-items: center;
      gap: 10rem;
    }

    .volumeIcon {
      transition: opacity .3s;
      opacity: 0;
    }
  }

  .word-wrapper {
    margin-top: 150px;
    margin-left: 30rem;
    display: flex;
    align-items: center;
    gap: 10rem;
    color: var(--color-font-1);

    .word {
      font-size: 48rem;
      line-height: 1;
      font-family: var(--word-font-family);
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
