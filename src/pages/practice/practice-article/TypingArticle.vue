<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, watch} from "vue"
import {$computed, $ref} from "vue/macros";
import {Article, ArticleWord, DefaultArticle, ShortcutKey, ShortcutKeyMap, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Options from "@/pages/practice/Options.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import Tooltip from "@/components/Tooltip.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {useArticleOptions} from "@/hooks/dict.ts";

interface IProps {
  article: Article,
  sectionIndex?: number,
  sentenceIndex?: number,
  wordIndex?: number,
  stringIndex?: number,
  active: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
  active: true,
})

const emit = defineEmits<{
  ignore: [],
  wrong: [val: Word],
  nextWord: [val: ArticleWord],
  over: [],
  edit: [val: Article]
}>()

let isPlay = $ref(false)
let typeArticleRef = $ref<HTMLInputElement>(null)
let articleWrapperRef = $ref<HTMLInputElement>(null)
let sectionIndex = $ref(0)
let sentenceIndex = $ref(0)
let wordIndex = $ref(0)
let stringIndex = $ref(0)
let input = $ref('')
let wrong = $ref('')
let isSpace = $ref(false)
let hoverIndex = $ref({
  sectionIndex: -1,
  sentenceIndex: -1,
})
const currentIndex = computed(() => {
  return `${sectionIndex}${sentenceIndex}${wordIndex}`
})

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()

const store = useBaseStore()
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

watch(() => props.article, () => {
  sectionIndex = props.sectionIndex
  sentenceIndex = props.sentenceIndex
  wordIndex = props.wordIndex
  stringIndex = props.stringIndex
  typeArticleRef?.scrollTo({top: 0, behavior: "smooth"})
  calcTranslateLocation()
}, {immediate: true})

watch(() => settingStore.dictation, () => {
  calcTranslateLocation()
})

onMounted(() => {
  emitter.on(EventKey.resetWord, () => {
    wrong = input = ''
  })
  emitter.on(EventKey.onTyping, onTyping)
})

onUnmounted(() => {
  emitter.off(EventKey.resetWord,)
  emitter.off(EventKey.onTyping, onTyping)
})

function nextSentence() {
  // wordData.words = [
  //   {"name": "pharmacy", "trans": ["药房；配药学，药剂学；制药业；一批备用药品"], "usphone": "'fɑrməsi", "ukphone": "'fɑːməsɪ"},
  //   // {"name": "foregone", "trans": ["过去的；先前的；预知的；预先决定的", "发生在…之前（forego的过去分词）"], "usphone": "'fɔrɡɔn", "ukphone": "fɔː'gɒn"}, {"name": "president", "trans": ["总统；董事长；校长；主席"], "usphone": "'prɛzɪdənt", "ukphone": "'prezɪd(ə)nt"}, {"name": "plastic", "trans": ["塑料的；（外科）造型的；可塑的", "塑料制品；整形；可塑体"], "usphone": "'plæstɪk", "ukphone": "'plæstɪk"}, {"name": "provisionally", "trans": ["临时地，暂时地"], "usphone": "", "ukphone": ""}, {"name": "incentive", "trans": ["动机；刺激", "激励的；刺激的"], "usphone": "ɪn'sɛntɪv", "ukphone": "ɪn'sentɪv"}, {"name": "calculate", "trans": ["计算；以为；作打算"], "usphone": "'kælkjulet", "ukphone": "'kælkjʊleɪt"}
  // ]
  // return

  let currentSection = props.article.sections[sectionIndex]

  isSpace = false
  stringIndex = 0
  wordIndex = 0
  input = wrong = ''

  //todo 计得把略过的单词加上统计里面去
  // if (!store.skipWordNamesWithSimpleWords.includes(currentWord.name.toLowerCase()) && !currentWord.isSymbol) {
  //   practiceStore.inputNumber++
  // }

  sentenceIndex++
  if (!currentSection[sentenceIndex]) {
    sentenceIndex = 0
    sectionIndex++
    if (!props.article.sections[sectionIndex]) {
      console.log('打完了')
      emit('over')
    }
  } else {
    if (settingStore.dictation) {
      calcTranslateLocation()
    }
    playWordAudio(currentSection[sentenceIndex].text)
  }
}

function onTyping(e: KeyboardEvent) {
  if (!props.active) return
  if (!props.article.sections.length) return
  // console.log('keyDown', e.key, e.code, e.keyCode)
  wrong = ''
  let currentSection = props.article.sections[sectionIndex]
  let currentSentence = currentSection[sentenceIndex]
  let currentWord: ArticleWord = currentSentence.words[wordIndex]

  const nextWord = () => {
    isSpace = false
    stringIndex = 0
    wordIndex++

    emit('nextWord', currentWord)

    if (!currentSentence.words[wordIndex]) {
      wordIndex = 0
      sentenceIndex++
      if (!currentSection[sentenceIndex]) {
        sentenceIndex = 0
        sectionIndex++

        if (!props.article.sections[sectionIndex]) {
          console.log('打完了')
        }
      } else {
        if (settingStore.dictation) {
          calcTranslateLocation()
        }
        playWordAudio(currentSection[sentenceIndex].text)
      }
    }
  }

  if (isSpace) {
    if (e.code === 'Space') {
      nextWord()
    } else {
      wrong = ' '
      playBeep()

      setTimeout(() => {
        wrong = ''
        wrong = input = ''
      }, 500)
    }
    playKeyboardAudio()
  } else {
    let letter = e.key

    let key = currentWord.name[stringIndex]
    // console.log('key', key,)

    let isRight = false
    if (settingStore.ignoreCase) {
      isRight = key.toLowerCase() === letter.toLowerCase()
    } else {
      isRight = key === letter
    }
    if (isRight) {
      input += letter
      wrong = ''
      // console.log('匹配上了')
      stringIndex++
      //如果当前词没有index，说明这个词完了，下一个是空格
      if (!currentWord.name[stringIndex]) {
        input = wrong = ''
        if (!currentWord.isSymbol) {
          playCorrect()
        }
        if (currentWord.nextSpace) {
          isSpace = true
        } else {
          nextWord()
        }
      }
    } else {
      emit('wrong', currentWord)
      wrong = letter
      playBeep()
      setTimeout(() => {
        wrong = ''
      }, 500)
      // console.log('未匹配')
    }
    playKeyboardAudio()
  }
  e.preventDefault()

}

function calcTranslateLocation() {
  nextTick(() => {
    setTimeout(() => {
      let articleRect = articleWrapperRef.getBoundingClientRect()
      props.article.sections.map((v, i) => {
        v.map((w, j) => {
          let location = i + '-' + j
          let wordClassName = `.word${location}`
          let word = document.querySelector(wordClassName)
          let wordRect = word.getBoundingClientRect()
          let translateClassName = `.translate${location}`
          let translate: HTMLDivElement = document.querySelector(translateClassName)

          translate.style.opacity = '1'
          translate.style.top = wordRect.top - articleRect.top - 22 + 'px'
          // @ts-ignore
          translate.firstChild.style.width = wordRect.left - articleRect.left + 'px'
          // console.log(word, wordRect.left - articleRect.left)
          // console.log('word-wordRect', wordRect)
        })
      })
    }, 300)
  })
}

function play() {
  return playWordAudio('article1')
  if (isPlay) {
    isPlay = false
    return window.speechSynthesis.pause();
  }
  let msg = new SpeechSynthesisUtterance();
  msg.text = 'article1'
  msg.rate = 0.5;
  msg.pitch = 1;
  msg.lang = 'en-US';
  // msg.lang = 'zh-HK';
  isPlay = true
  window.speechSynthesis.speak(msg);
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.active) return
  switch (e.key) {
    case 'Backspace':
      if (wrong) {
        wrong = ''
      } else {
        input = input.slice(0, -1)
      }
      break
    case ShortcutKeyMap.Collect:

      break
    case ShortcutKeyMap.Remove:
      break
    case ShortcutKeyMap.Ignore:
      nextSentence()
      break
    case ShortcutKeyMap.Show:
      if (settingStore.allowWordTip) {
        hoverIndex = {
          sectionIndex: sectionIndex,
          sentenceIndex: sentenceIndex,
        }
      }
      break
  }

  // console.log(
  //     'sectionIndex', sectionIndex,
  //     'sentenceIndex', sentenceIndex,
  //     'wordIndex', wordIndex,
  //     'stringIndex', stringIndex,
  // )
  e.preventDefault()
}

function onKeyUp() {
  hoverIndex = {
    sectionIndex: -1,
    sentenceIndex: -1,
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

// useEventListener('keydown', onKeyDown)
// useEventListener('keyup', onKeyUp)

function playWord(word: ArticleWord) {
  playWordAudio(word.name)
}

function currentWordInput(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length, input.length + wrong.length + 1)
  if (word.isSymbol) {
    return str
  }
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (settingStore.dictation) {
    return '_'
  }
  return str
}

function currentWordEnd(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length + (wrong ? 0 : 1))
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (settingStore.dictation) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

function otherWord(word: ArticleWord, i: number, i2: number, i3: number) {
  let str = word.name
  if (word.isSymbol) {
    return str
  }

  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  //剩100是因为，可能存在特殊情况，比如003,010这种，0 12 24，100
  if (sectionIndex * 10000 + sentenceIndex * 100 + wordIndex < i * 10000 + i2 * 100 + i3
      && settingStore.dictation
  ) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

</script>

<template>
  <div class="typing-article" ref="typeArticleRef">
    <header>
      <div class="title word">{{ props.article.title }}</div>
      <div class="titleTranslate" v-if="settingStore.translate">{{ props.article.titleTranslate }}</div>
      <div class="options-wrapper">
        <div class="flex gap10">
          <BaseIcon
              :title="`编辑(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.EditArticle]})`"
              icon="tabler:edit"
              @click="emit('edit',props.article)"
          />
          <BaseIcon
              v-if="!isArticleCollect(props.article)"
              class="collect"
              @click="toggleArticleCollect(props.article)"
              :title="`收藏(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
              icon="ph:star"/>
          <BaseIcon
              v-else
              class="fill"
              @click="toggleArticleCollect(props.article)"
              :title="`取消收藏(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
              icon="ph:star-fill"/>
          <BaseIcon
              :title="`跳过(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
              icon="icon-park-outline:go-ahead"
              @click="emit('over')"/>
        </div>
      </div>
    </header>
    <div class="article-content" ref="articleWrapperRef">
      <article>
        <div class="section"
             v-for="(section,indexI) in props.article.sections">
                <span class="sentence"
                      :class="[
                          sectionIndex === indexI && sentenceIndex === indexJ && settingStore.dictation
                          ?'dictation':''
                      ]"
                      @mouseenter="settingStore.allowWordTip && (hoverIndex = {sectionIndex : indexI,sentenceIndex :indexJ})"
                      @mouseleave="hoverIndex = {sectionIndex : -1,sentenceIndex :-1}"
                      @click="playWordAudio(sentence.text)"
                      v-for="(sentence,indexJ) in section">
                  <span
                      v-for="(word,indexW) in sentence.words"
                      class="word"
                      :class="[(sectionIndex>indexI
                        ?'wrote':
                        (sectionIndex>=indexI &&sentenceIndex>indexJ)
                        ?'wrote' :
                        (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>indexW)
                        ?'wrote':
                         (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>=indexW && stringIndex>=word.name.length)
                        ?'wrote':
                        ''),
                        (`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace && wrong )?'word-wrong':'',
                        indexW === 0 && `word${indexI}-${indexJ}`
                        ]"
                      @click="playWord(word)">
                    <span v-if="`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace">
                      <span class="input" v-if="input">{{ input }}</span>
                      <span class="wrong" :class="wrong === ' ' && 'bg-wrong'" v-if="wrong">{{ wrong }}</span>
                      <span class="bottom-border" v-else>{{ currentWordInput(word, indexI, indexJ) }}</span>
                      <span>{{ currentWordEnd(word, indexI, indexJ,) }}</span>
                    </span>
                    <span v-else>{{ otherWord(word, indexI, indexJ, indexW) }}</span>
                    <span
                        v-if="word.nextSpace"
                        :class="[
                            `${indexI}${indexJ}${indexW}`,
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && wrong) && 'bg-wrong',
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong) && 'bottom-border',
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong && settingStore.dictation) && 'word-space',
                        ]">
                      {{
                        (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && settingStore.dictation) ? '_' : ' '
                      }}
                    </span>
                  </span>
                </span>
        </div>
      </article>
      <div class="translate" v-show="settingStore.translate">
        <template v-for="(v,i) in props.article.sections">
          <div class="row"
               :class="`translate${i+'-'+j}`"
               v-for="(item,j) in v">
            <span class="space"></span>
            <Transition name="fade">
              <span class="text" v-if="item.translate">{{ item.translate }}</span>
            </Transition>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.wrote {
  //color: green;
  color: rgb(22, 163, 74);
}

$article-width: 1000px;
.typing-article {
  height: 100%;
  width: 100%;
  overflow: auto;

  header {
    word-wrap: break-word;
    position: relative;
    padding: 15rem 0;

    .title {
      text-align: center;
      color: rgba(gray, .8);
      font-size: 36rem;
      font-family: var(--word-font-family);
    }

    .titleTranslate {
      @extend .title;
      font-size: 20rem;
      font-family: unset;
    }

    .options-wrapper {
      position: absolute;
      right: 20rem;
      top: 0;
      display: flex;
      gap: 10rem;
      font-size: 18rem;
    }
  }

  .article-content {
    position: relative;
    //opacity: 0;
  }

  article {
    //height: 100%;
    font-size: 24rem;
    line-height: 2.5;
    color: gray;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;
    padding-top: 20rem;

    .section {
      font-family: var(--word-font-family);
      margin-bottom: var(--space);

      .sentence {
        transition: all .3s;

        &:first-child {
          padding-left: 50rem;
        }

        &.dictation {
          letter-spacing: 3rem;
        }
      }

      .word {
        display: inline-block;
      }
    }
  }

  .translate {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    font-size: 18rem;
    color: gray;
    line-height: 3.5;
    letter-spacing: 3rem;
    //display: none;

    .row {
      position: absolute;
      left: 0;
      width: 100%;
      opacity: 0;

      .space {
        transition: all .3s;
        display: inline-block;
      }
    }
  }

  .word-space {
    position: relative;
    color: gray;

    &::after {
      content: ' ';
      position: absolute;
      width: 1.5rem;
      height: 4rem;
      background: gray;
      bottom: 2rem;
      right: 2.5rem;
    }

    &::before {
      content: ' ';
      position: absolute;
      width: 1.5rem;
      height: 4rem;
      background: gray;
      bottom: 2rem;
      left: 0;
    }
  }

  .bottom-border {
    animation: underline 1s infinite steps(1, start);
  }

  .input {
    //font-weight: bold;
    color: var(--color-main-active);
  }

  .wrong {
    color: rgba(red, 0.6);
  }

  .word-wrong {
    display: inline-block;
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  .bg-wrong {
    display: inline-block;
    color: gray;
    background: rgba(red, 0.6);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

@keyframes underline {
  0%, 100% {
    border-left: 1.3rem solid black;
  }
  50% {
    border-left: 1.3rem solid transparent;
  }
}

</style>