<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, watch} from "vue"
import {Article, ArticleWord, DefaultArticle, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import jq from 'jquery'
import {_nextTick} from "@/utils";


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
//是否是输入空格
let isSpace = $ref(false)
let hoverIndex = $ref({
  sectionIndex: -1,
  sentenceIndex: -1,
})
let cursor = $ref({})
let isEnd = $ref(false)

const currentIndex = computed(() => {
  return `${sectionIndex}${sentenceIndex}${wordIndex}`
})

const playBeep = usePlayBeep()
const playCorrect = usePlayCorrect()
const playKeyboardAudio = usePlayKeyboardAudio()
const playWordAudio = usePlayWordAudio()

const store = useBaseStore()
const statisticsStore = usePracticeStore()
const settingStore = useSettingStore()

//当跳过句子时，会同时触发光标检测和布局检测，但布局检测
let isDelayCheckCursorPosition = false

window.$ = jq
watch([() => sectionIndex, () => sentenceIndex, () => wordIndex, () => stringIndex], ([a, b, c,]) => {
  checkCursorPosition(a, b, c)
})

watch(() => props.article, () => {
  sectionIndex = props.sectionIndex
  sentenceIndex = props.sentenceIndex
  wordIndex = props.wordIndex
  stringIndex = props.stringIndex
  typeArticleRef?.scrollTo({top: 0, behavior: "smooth"})
  checkTranslateLocation()
  checkCursorPosition()
}, {immediate: true})

watch(() => settingStore.dictation, () => {
  if (settingStore.translate) {
    checkTranslateLocation()
  }
  isDelayCheckCursorPosition = true
  checkCursorPosition()
})
watch(() => settingStore.translate, () => {
  isDelayCheckCursorPosition = true
  checkCursorPosition()
  checkTranslateLocation()
})


function checkCursorPosition(a = sectionIndex, b = sentenceIndex, c = wordIndex) {
  console.log('checkCursorPosition', isDelayCheckCursorPosition)
  _nextTick(() => {
    let currentWord = jq(`.section:nth(${a}) .sentence:nth(${b}) .word:nth(${c})`)
    // console.log(a, b, c, currentWord)
    if (currentWord.length) {
      let end = currentWord.find('.word-end')
      // console.log(end)
      if (end.length) {
        let articleRect = articleWrapperRef.getBoundingClientRect()
        cursor = {
          top: end.offset().top - articleRect.top,
          left: end.offset().left - articleRect.left,
        }
        // console.log(cursor)
      }
    }
    isDelayCheckCursorPosition = false
  }, isDelayCheckCursorPosition ? 300 : 0)
}

function checkTranslateLocation() {
  console.log('checkTranslateLocation')
  _nextTick(() => {
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
    // checkCursorPosition(sectionIndex, sentenceIndex, wordIndex)
  }, 300)
}


let lockNextSentence = false

function nextSentence() {
  if (lockNextSentence) return
  lockNextSentence = true
  // wordData.words = [
  //   {"word": "pharmacy", "trans": ["药房；配药学，药剂学；制药业；一批备用药品"], "phonetic0": "'fɑrməsi", "phonetic1": "'fɑːməsɪ"},
  //   // {"word": "foregone", "trans": ["过去的；先前的；预知的；预先决定的", "发生在…之前（forego的过去分词）"], "phonetic0": "'fɔrɡɔn", "phonetic1": "fɔː'gɒn"}, {"word": "president", "trans": ["总统；董事长；校长；主席"], "phonetic0": "'prɛzɪdənt", "phonetic1": "'prezɪd(ə)nt"}, {"word": "plastic", "trans": ["塑料的；（外科）造型的；可塑的", "塑料制品；整形；可塑体"], "phonetic0": "'plæstɪk", "phonetic1": "'plæstɪk"}, {"word": "provisionally", "trans": ["临时地，暂时地"], "phonetic0": "", "phonetic1": ""}, {"word": "incentive", "trans": ["动机；刺激", "激励的；刺激的"], "phonetic0": "ɪn'sɛntɪv", "phonetic1": "ɪn'sentɪv"}, {"word": "calculate", "trans": ["计算；以为；作打算"], "phonetic0": "'kælkjulet", "phonetic1": "'kælkjʊleɪt"}
  // ]
  // return

  let currentSection = props.article.sections[sectionIndex]

  isSpace = false
  stringIndex = 0
  wordIndex = 0
  input = wrong = ''

  //todo 计得把略过的单词加上统计里面去
  // if (!store.skipWordNamesWithSimpleWords.includes(currentWord.word.toLowerCase()) && !currentWord.isSymbol) {
  //   statisticsStore.inputNumber++
  // }

  sentenceIndex++
  if (!currentSection[sentenceIndex]) {
    sentenceIndex = 0
    sectionIndex++
    if (!props.article.sections[sectionIndex]) {
      console.log('打完了')
      isEnd = true
      emit('over')
    }
  } else {
    if (settingStore.dictation){
      isDelayCheckCursorPosition = true
    }
    if (settingStore.dictation && settingStore.translate) {
      checkTranslateLocation()
    }
    playWordAudio(currentSection[sentenceIndex].text)
  }
  lockNextSentence = false
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
      nextSentence()
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

    let key = currentWord.word[stringIndex]
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
      if (!currentWord.word[stringIndex]) {
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
      // emit('wrong', currentWord)
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


function play() {
  let currentSection = props.article.sections[sectionIndex]

  return playWordAudio(currentSection[sentenceIndex].text)
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

function del() {
  if (wrong) {
    wrong = ''
  } else {
    input = input.slice(0, -1)
  }
}

function playWord(word: ArticleWord) {
  playWordAudio(word.word)
}

function currentWordString(word: ArticleWord, i: number, i2: number,) {
  let str = word.word.slice(input.length + wrong.length, input.length + wrong.length + 1)
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
  let str = word.word.slice(input.length + wrong.length + (wrong ? 0 : 1))
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (settingStore.dictation) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

function getAllWord(word: ArticleWord, i: number, i2: number, i3: number) {
  let str = word.word
  if (word.isSymbol) {
    return str
  }

  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  //剩100是因为，可能存在特殊情况，比如003,010这种，0 12 24，100
  if (sectionIndex * 10000 + sentenceIndex * 100 + wordIndex < i * 10000 + i2 * 100 + i3 && settingStore.dictation) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

function showSentence(i1: number = sectionIndex, i2: number = sentenceIndex) {
  hoverIndex = {sectionIndex: i1, sentenceIndex: i2}
}

function hideSentence() {
  hoverIndex = {sectionIndex: -1, sentenceIndex: -1}
}

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

defineExpose({showSentence, play, del, hideSentence, nextSentence})


</script>

<template>
  <div class="typing-article" ref="typeArticleRef">
    <header class="mb-4">
      <div class="title word">{{ props.article.title }}</div>
      <div class="titleTranslate" v-if="settingStore.translate">{{ props.article.titleTranslate }}</div>
    </header>
    <div class="article-content" ref="articleWrapperRef">
      <article :class="settingStore.translate && 'tall'">
        <div class="section" v-for="(section,indexI) in props.article.sections">
                <span class="sentence"
                      :class="[
                          sectionIndex === indexI && sentenceIndex === indexJ && settingStore.dictation
                          ?'dictation':''
                      ]"
                      @mouseenter="settingStore.allowWordTip && showSentence(indexI,indexJ)"
                      @mouseleave="hideSentence"
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
                         (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>=indexW && stringIndex>=word.word.length)
                        ?'wrote':
                        ''),
                        (`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace && wrong )?'word-wrong':'',
                        indexW === 0 && `word${indexI}-${indexJ}`
                        ]"
                      @click="playWord(word)">
                    <span class="all-word" v-if="`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace">
                      <span class="word-start" v-if="input">{{ input }}</span>
                      <span class="word-end">
                        <span class="wrong" :class="wrong === ' ' && 'bg-wrong'" v-if="wrong">{{ wrong }}</span>
                        <span class="input" v-else>{{ currentWordString(word, indexI, indexJ) }}</span>
                        <span>{{ currentWordEnd(word, indexI, indexJ,) }}</span>
                      </span>
                    </span>
                    <span v-else class="all-word">{{ getAllWord(word, indexI, indexJ, indexW) }}</span>
                    <span
                        v-if="word.nextSpace"
                        class="word-end"
                        :class="[
                           (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && wrong) && 'bg-wrong',
                        ]"
                    >
                      <span class="word-space"
                            :class="[
                            `${indexI}${indexJ}${indexW}`,
                            settingStore.dictation && 'to-bottom',
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong ) && 'wait',
                        ]"
                      ></span>
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
      <div class="cursor" v-if="!isEnd" :style="{top:cursor.top+'px',left:cursor.left+'px'}"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.wrote {
  //color: green;
  color: rgb(22, 163, 74);
}

.word {
  position: relative;
}

$article-width: 1000px;
.typing-article {
  height: 100%;
  width: 100%;
  overflow: auto;

  header {
    word-wrap: break-word;
    position: relative;
    padding-top: 1rem;

    .title {
      text-align: center;
      font-weight: bold;
      color: rgba(gray, .8);
      font-size: 2.2rem;
      font-family: var(--word-font-family);
    }

    .titleTranslate {
      @extend .title;
      font-size: 1.2rem;
      font-family: unset;
    }
  }

  .article-content {
    position: relative;
    //opacity: 0;
  }

  article {
    font-size: 1.6rem;
    line-height: 1.3;
    color: gray;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;

    &.tall {
      line-height: 2.5;
    }

    .section {
      margin-bottom: 3rem;

      .sentence {
        transition: all .3s;

        &:first-child {
          padding-left: .2rem;
        }

        &.dictation {
          font-family: var(--word-font-family);
          letter-spacing: .2rem;
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
    font-size: 1.1rem;
    color: gray;
    line-height: 3.5;
    letter-spacing: .2rem;
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
    display: inline-block;
    width: 0.8rem;
    height: 1.5rem;
    margin: 0 1px;
    box-sizing: border-box;

    &.to-bottom {
      transform: translateY(0.3rem);
    }

    &.wait {
      border-bottom: 2px solid gray;

      &::after {
        content: ' ';
        position: absolute;
        width: .1rem;
        height: .25rem;
        background: gray;
        bottom: 0;
        right: 0;
      }

      &::before {
        content: ' ';
        position: absolute;
        width: .1rem;
        height: .26rem;
        background: gray;
        bottom: 0;
        left: 0;
      }
    }
  }


  .word-start {
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
    line-height: 1;
    color: gray;
    background: rgba(red, 0.6);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

.cursor {
  position: absolute;
  left: 0;
  top: 0;
  height: 1.8rem;
  animation: underline 1s infinite steps(1, start);
}

@keyframes underline {
  0%, 100% {
    border-left: .1rem solid black;
  }
  50% {
    border-left: .1rem solid transparent;
  }
}

</style>