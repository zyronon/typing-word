<script setup lang="ts">
import {DefaultWord, ShortcutKey, Word} from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio, useTTsPlayAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {cloneDeep} from "lodash-es";
import {onMounted, onUnmounted, watch} from "vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";

interface IProps {
  word: Word,
}

const props = withDefaults(defineProps<IProps>(), {
  word: () => cloneDeep(DefaultWord),
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
const ttsPlayAudio = useTTsPlayAudio()
const volumeIconRef: any = $ref()
const volumeTranslateIconRef: any = $ref()

let displayWord = $computed(() => {
  return props.word.word.slice(input.length + wrong.length)
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

function play() {
  volumeIconRef?.play()
}

defineExpose({del, showWord, hideWord, play})
</script>

<template>
  <div class="typing-word">
    <div class="translate"
         :style="{
      fontSize: settingStore.fontSize.wordTranslateFontSize +'px',
      opacity: settingStore.translate ? 1 : 0
    }"
    >
      <div class="translate-item" v-for="(v,i) in word.trans">
        <span>{{ (v.pos ? v.pos + '.' : '') + (v.cn || v.en) }}</span>
        <!--        <div class="volumeIcon">-->
        <!--          <Tooltip-->
        <!--              v-if="i === word.trans.length - 1"-->
        <!--              :title="`发音(${settingStore.shortcutKeyMap[ShortcutKey.PlayTranslatePronunciation]})`"-->
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
           :style="{fontSize: settingStore.fontSize.wordForeignFontSize +'px'}"
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
  position: relative;
  color: var(--color-font-2);

  .phonetic, .translate {
    font-size: 1.6rem;
    transition: all .3s;
  }

  .phonetic {
    margin-top: .3rem;
    font-family: var(--word-font-family);
  }

  .translate {
    position: absolute;
    transform: translateY(-50%);
    margin-bottom: 7rem;

    &:hover {
      .volumeIcon {
        opacity: 1;
      }
    }

    .translate-item {
      display: flex;
      align-items: center;
      gap: .8rem;
    }

    .volumeIcon {
      transition: opacity .3s;
      opacity: 0;
    }
  }

  .word-wrapper {
    margin-left: 2rem;
    display: flex;
    align-items: center;
    gap: .8rem;
    color: var(--color-font-1);

    .word {
      font-size: 3rem;
      line-height: 1;
      font-family: var(--word-font-family);
      letter-spacing: .3rem;

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