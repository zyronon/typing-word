<script setup lang="ts">
import { DefaultWord, ShortcutKey, Word } from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import { $computed, $ref } from "vue/macros";
import { useBaseStore } from "@/stores/base.ts";
import { usePracticeStore } from "@/stores/practice.ts";
import { useSettingStore } from "@/stores/setting.ts";
import { usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio, useTTsPlayAudio } from "@/hooks/sound.ts";
import { emitter, EventKey } from "@/utils/eventBus.ts";
import { cloneDeep } from "lodash-es";
import { onUnmounted, watch, onMounted } from "vue";
import Tooltip from "@/components/Tooltip.vue";

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
let waitNext = $ref(false)
//输入锁定，因为跳转到下一个单词有延时，如果重复在延时期间内重复输入，导致会跳转N次
let inputLock = false
let wordRepeatCount = 0
const settingStore = useSettingStore()

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()
const ttsPlayAudio = useTTsPlayAudio()
const volumeIconRef: any = $ref()
const volumeTranslateIconRef: any = $ref()

let displayWord = $computed(() => {
  return props.word.name.slice(input.length + wrong.length)
})

watch(() => props.word, () => {
  wrong = input = ''
  wordRepeatCount = 0
  inputLock = false
  if (settingStore.wordSound) {
    volumeIconRef?.play(400, true)
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
  if (waitNext) {
    if (e.code === 'Space') {
      emit('next')
      waitNext = false
    }
    return
  }
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
    volumeIconRef?.play()
    setTimeout(() => {
      wrong = ''
    }, 500)
  }

  if (isWordRight) {
    playCorrect()
    if (settingStore.repeatCount == 100) {
      if (settingStore.repeatCustomCount <= wordRepeatCount + 1) {
        if (settingStore.autoNext) {
          setTimeout(() => emit('next'), settingStore.waitTimeForChangeWord)
        } else {
          waitNext = true
          inputLock = false
        }
      } else {
        repeat()
      }
    } else {
      if (settingStore.repeatCount <= wordRepeatCount + 1) {
        if (settingStore.autoNext) {
          setTimeout(() => emit('next'), settingStore.waitTimeForChangeWord)
        } else {
          waitNext = true
          inputLock = false
        }
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
    //如果默写情况下，看了提示也视为输入错误
    emit('wrong')
  }
}

function hideWord() {
  showFullWord = false
}

function play() {
  volumeIconRef?.play()
}

defineExpose({del, showWord, hideWord, play})
</script>

<template>
  <div class="typing-word">
    <div class="translate"
         :style="{
      fontSize: settingStore.fontSize.wordTranslateFontSize +'rem',
      opacity: settingStore.translate ? 1 : 0
    }"
    >
      <div class="translate-item" v-for="(v,i) in word.trans">
        <span>{{ v }}</span>
        <!--        <div class="volumeIcon">-->
        <!--          <Tooltip-->
        <!--              v-if="i === word.trans.length - 1"-->
        <!--              :title="`发音(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.PlayTranslatePronunciation]})`"-->
        <!--          >-->
        <!--            <VolumeIcon-->
        <!--                ref="volumeTranslateIconRef"-->
        <!--                :simple="true"-->
        <!--                :cb="()=>ttsPlayAudio(word.trans.join(';'))"/>-->
        <!--          </Tooltip>-->
        <!--        </div>-->
      </div>
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
                @mouseenter="showWord">{{
              displayWord.split('').map(() => settingStore.dictationShowWordLength ? '_' : '&nbsp;').join('')
            }}</span>
          <span class="letter" v-else @mouseleave="hideWord">{{ displayWord }}</span>
        </template>
        <span class="letter" v-else>{{ displayWord }}</span>
      </div>
      <Tooltip
          :title="`发音(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
      >
        <VolumeIcon ref="volumeIconRef" :simple="true" :cb="() => playWordAudio(word.name)"/>
      </Tooltip>
    </div>
    <div class="phonetic" v-if="settingStore.wordSoundType === 'us' && word.usphone">[{{ word.usphone }}]</div>
    <div class="phonetic" v-if="settingStore.wordSoundType === 'uk' && word.ukphone">[{{ word.ukphone }}]</div>
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
  word-break: break-word;

  .phonetic, .translate {
    font-size: 20rem;
    margin-left: -30rem;
    transition: all .3s;
  }

  .phonetic {
    margin-top: 5rem;
    font-family: var(--word-font-family);
  }

  .translate {
    position: absolute;
    transform: translateY(-50%);
    margin-bottom: 90rem;
    color: var(--color-font-2);

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