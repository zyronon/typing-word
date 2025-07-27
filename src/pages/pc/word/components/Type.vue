<script setup lang="ts">
import {getDefaultWord, ShortcutKey, Word} from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio, useTTsPlayAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted, onUnmounted, watch} from "vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import SentenceHightLightWord from "@/pages/pc/word/components/SentenceHightLightWord.vue";

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
// const ttsPlayAudio = useTTsPlayAudio()
const volumeIconRef: any = $ref()
// const volumeTranslateIconRef: any = $ref()

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
}, {deep: true})

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
  console.log('onTyping')
  inputLock = true
  let letter = e.key
  let isTypingRight = false
  if (settingStore.ignoreCase) {
    isTypingRight = letter.toLowerCase() === props.word.word[input.length].toLowerCase()
  } else {
    isTypingRight = letter === props.word.word[input.length]
  }
  if (isTypingRight) {
    input += letter
    wrong = ''
    playKeyboardAudio()
  } else {
    wrong = letter
    playBeep()
    volumeIconRef?.play()
    setTimeout(() => {
      wrong = ''
    }, 500)
    emit('wrong')
  }

  if (input.toLowerCase() === props.word.word.toLowerCase()) {
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

let tab = $ref(0)
</script>

<template>
  <div class="typing-word">
    <div class="flex flex-col items-center">
      <div class="flex gap-1 mt-26">
        <div class="phonetic" v-if="settingStore.wordSoundType === 'us' && word.phonetic0">[{{
            (settingStore.dictation && !showFullWord) ? '_'.repeat(word.phonetic0.length) : word.phonetic0
          }}]
        </div>
        <div class="phonetic" v-if="settingStore.wordSoundType === 'uk' && word.phonetic1">[{{
            (settingStore.dictation && !showFullWord) ? '_'.repeat(word.phonetic1.length) : word.phonetic1
          }}]
        </div>

        <Tooltip
            :title="`发音(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
        >
          <VolumeIcon ref="volumeIconRef" :simple="true" :cb="() => playWordAudio(word.word)"/>
        </Tooltip>
      </div>

      <div class="word my-1"
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

      <div class="translate anim"
           v-opacity="settingStore.translate"
           :style="{
      fontSize: settingStore.fontSize.wordTranslateFontSize +'px',
    }"
      >
        <div class="my-2 flex" v-for="(v,i) in word.trans">
          <div class="shrink-0" :class="v.pos && 'w-12'">{{ v.pos }}</div>
          <span>{{ v.cn }}</span>
        </div>
      </div>
    </div>
    <div class="other">
      <template v-if="word.sentences && word.sentences.length">
        <div class="line-white my-4"></div>
        <div class="sentences">
          <div class="sentence my-2" v-for="item in word.sentences">
            <SentenceHightLightWord class="text-lg" :text="item.c" :word="word.word"
                                    :dictation="settingStore.dictation"/>
            <div class="text-md anim" v-opacity="settingStore.translate">{{ item.cn }}</div>
          </div>
        </div>
      </template>

      <template v-if="word.phrases.length || word.synos.length || word.relWords.root || word.etymology.length">
        <div class="line-white my-4"></div>
        <div class="tabs">
          <div @click="tab = 0" class="tab" :class="tab === 0 && 'active'">短语</div>
          <div @click="tab = 1" class="tab" :class="tab === 1 && 'active'">同近义词</div>
          <div @click="tab = 2" class="tab" :class="tab === 2 && 'active'">同根词</div>
          <div @click="tab = 3" class="tab" :class="tab === 3 && 'active'">词源</div>
        </div>
      </template>
      <template v-if="tab === 0">
        <div class="my-2" v-for="item in word.phrases">
          <SentenceHightLightWord class="text-lg" :text="item.c" :word="word.word" :high-light="false"
                                  :dictation="settingStore.dictation"/>
          <div class="text-md anim" v-opacity="settingStore.translate">{{ item.cn }}</div>
        </div>
      </template>
      <template v-if="tab === 1">
        <div class="flex my-2" v-for="item in word.synos">
          <div class="text-lg w-12">{{ item.pos }}</div>
          <div>
            <div class="text-md">{{ item.cn }}</div>
            <span class="text-md" v-for="(i,j) in item.ws">{{ i }} {{ j !== item.ws.length - 1 ? ' / ' : '' }} </span>
          </div>
        </div>
      </template>
      <template v-if="tab === 2">
        <div class="mt-2">
          <div v-if="word.relWords.root">
            词根：{{ word.relWords.root }}
          </div>
          <div class="flex my-2" v-for="item in word.relWords.rels">
            <div class="text-lg w-12">{{ item.pos }}</div>
            <div>
              <div class="flex gap-4" v-for="itemj in item.words">
                <div class="text-md">{{ itemj.c }}</div>
                <div class="text-md">{{ itemj.cn }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="tab === 3">
        <div class="my-2" v-for="item in word.etymology">
          <div class="text-lg">{{ item.t }}</div>
          <div class="text-md">{{ item.d }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.typing-word {
  width: 100%;
  flex: 1;
  overflow: auto;
  word-break: break-word;
  position: relative;
  color: var(--color-font-2);

  .phonetic, .translate {
    font-size: 1.2rem;
  }

  .phonetic {
    color: var(--color-font-1);
    font-family: var(--word-font-family);
  }

  .word {
    font-size: 3rem;
    line-height: 1;
    font-family: var(--en-article-family);
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

  .tabs {
    @apply: text-lg font-medium;
    display: flex;
    gap: 2rem;

    .tab {
      cursor: pointer;

      &.active {
        border-bottom: 2px solid var(--color-font-1);
      }
    }
  }

}
</style>
