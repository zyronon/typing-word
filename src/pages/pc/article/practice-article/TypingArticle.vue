<script setup lang="ts">
import {computed, onMounted, onUnmounted, watch} from "vue"
import {Article, ArticleWord, getDefaultArticle, Sentence, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {usePlayBeep, usePlayCorrect, usePlayKeyboardAudio, usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {_nextTick} from "@/utils";
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import {getTranslateText} from "@/hooks/article.ts";
import BaseButton from "@/components/BaseButton.vue";
import QuestionForm from "@/pages/pc/article/components/QuestionForm.vue";

interface IProps {
  article: Article,
  sectionIndex?: number,
  sentenceIndex?: number,
  wordIndex?: number,
  stringIndex?: number,
  active: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => getDefaultArticle(),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
  active: true,
})

const emit = defineEmits<{
  ignore: [],
  wrong: [val: Word],
  play: [val: Sentence],
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
let cursor = $ref({
  top: 0,
  left: 0,
})
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

watch([() => sectionIndex, () => sentenceIndex, () => wordIndex, () => stringIndex], ([a, b, c,]) => {
  checkCursorPosition(a, b, c)
})

watch(() => props.article, () => {
  sectionIndex = props.sectionIndex
  sentenceIndex = props.sentenceIndex
  wordIndex = props.wordIndex
  stringIndex = props.stringIndex
  typeArticleRef?.scrollTo({top: 0, behavior: "smooth"})
  checkTranslateLocation().then(() => checkCursorPosition())
}, {immediate: true})

watch(() => settingStore.translate, () => {
  checkTranslateLocation().then(() => checkCursorPosition())
})


function checkCursorPosition(a = sectionIndex, b = sentenceIndex, c = wordIndex) {
  // console.log('checkCursorPosition')
  _nextTick(() => {
    // 选中目标元素
    const currentWord = document.querySelector(`.section:nth-of-type(${a + 1}) .sentence:nth-of-type(${b + 1}) .word:nth-of-type(${c + 1})`);
    if (currentWord) {
      // 在 currentWord 内找 .word-end
      const end = currentWord.querySelector('.word-end');
      if (end) {
        // 获取 articleWrapper 的位置
        const articleRect = articleWrapperRef.getBoundingClientRect();
        const endRect = end.getBoundingClientRect();
        // 计算相对位置
        cursor = {
          top: endRect.top - articleRect.top,
          left: endRect.left - articleRect.left,
        };
      }
    }
  },)
}

function checkTranslateLocation() {
  // console.log('checkTranslateLocation')
  return new Promise<void>(resolve => {
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
          translate.style.top = wordRect.top - articleRect.top + 24 + 'px'
          // @ts-ignore
          translate.firstChild.style.width = wordRect.left - articleRect.left + 'px'
          // console.log(word, wordRect.left - articleRect.left)
          // console.log('word-wordRect', wordRect)
        })
      })
      resolve()
    }, 300)
  })
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
  // if (!store.knownWordsWithSimpleWords.includes(currentWord.word.toLowerCase()) && !currentWord.isSymbol) {
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
    } else {
      emit('play', props.article.sections[sectionIndex][0])
    }
  } else {
    emit('play', currentSection[sentenceIndex])
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
    if (sectionIndex === 0 && sentenceIndex === 0 && wordIndex === 0 && stringIndex === 0) {
      emit('play', currentSection[sentenceIndex])
    }
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
  emit('play', currentSection[sentenceIndex])
}

function del() {
  if (wrong) {
    wrong = ''
  } else {
    input = input.slice(0, -1)
  }
}

function indexWord(word: ArticleWord) {
  return word.word.slice(input.length, input.length + 1)
}

function remainderWord(word: ArticleWord,) {
  return word.word.slice(input.length + 1)
}

function showSentence(i1: number = sectionIndex, i2: number = sentenceIndex) {
  hoverIndex = {sectionIndex: i1, sentenceIndex: i2}
}

function hideSentence() {
  hoverIndex = {sectionIndex: -1, sentenceIndex: -1}
}

function onContextMenu(e: MouseEvent, sentence: Sentence, i, j) {
  //prevent the browser's default menu
  e.preventDefault();
  //show your menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "从这开始",
        onClick: () => {
          sectionIndex = i
          sentenceIndex = j
          emit('play', sentence)
        }
      },
      {
        label: "播放",
        onClick: () => {
          emit('play', sentence)
        }
      },
      {
        label: "复制",
        onClick: () => {
          navigator.clipboard.writeText(sentence.text).then(r => {
            ElMessage({
              message: '已复制',
              type: 'success',
            })
          })
        }
      },
      {
        label: "语法分析",
        onClick: () => {
          navigator.clipboard.writeText(sentence.text).then(r => {
            ElMessage({
              message: '已复制！随后将打开语法分析网站！',
              type: 'success',
              duration: 3000
            })
            setTimeout(() => {
              window.open('https://enpuz.com/')
            }, 1000)
          })
        }
      },
    ]
  });
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

let showQuestions = $ref(false)
</script>

<template>
  <div class="typing-article" ref="typeArticleRef">

    <header class="mb-4">
      <div class="title word">{{ props.article.title }}</div>
      <div class="titleTranslate" v-if="settingStore.translate">{{ props.article.titleTranslate }}</div>
    </header>

    <div class="article-content" ref="articleWrapperRef">
      <article :class="[
          settingStore.translate && 'tall',
          settingStore.dictation && 'dictation',
      ]">
        <div class="section" v-for="(section,indexI) in props.article.sections">
                <span class="sentence"
                      :class="[
                          hoverIndex.sectionIndex === indexI &&  hoverIndex.sentenceIndex === indexJ
                          &&'hover-show'
                      ]"
                      @contextmenu="e=>onContextMenu(e,sentence,indexI,indexJ)"
                      @mouseenter="settingStore.allowWordTip && showSentence(indexI,indexJ)"
                      @mouseleave="hideSentence"
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
                        ]">
                    <span class="word-wrap" v-if="`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace">
                      <span class="word-start" v-if="input">{{ input }}</span>
                      <span class="word-end">
                        <span class="wrong" :class="wrong === ' ' && 'bg-wrong'" v-if="wrong">{{ wrong }}</span>
                        <span :class="!word.isSymbol && 'dictation-hide'" v-else>{{ indexWord(word) }}</span>
                        <span class="dictation-hide">{{ remainderWord(word) }}</span>
                      </span>
                      <span class="border-bottom" v-if="settingStore.dictation"></span>
                    </span>
                    <span v-else class="word-wrap">
                      <span :class="!word.isSymbol && 'dictation-hide'">{{ word.word }}</span>
                      <span class="border-bottom" v-if="settingStore.dictation"></span>
                    </span>
                    <span
                        v-if="word.nextSpace"
                        class="word-end"
                        :class="[
                           (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && wrong) && 'bg-wrong',
                        ]"
                    >
                      <span class="word-space"
                            :class="[
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
        <template v-for="(v,indexI) in props.article.sections">
          <div class="row"
               :class="[
                   `translate${indexI+'-'+indexJ}`,
                   (sectionIndex>indexI
                        ?'wrote':
                        (sectionIndex>=indexI &&sentenceIndex>indexJ)
                        ?'wrote' :
                        ''),
                        ]"
               v-for="(item,indexJ) in v">
            <span class="space"></span>
            <Transition name="fade">
              <span class="text" v-if="item.translate">{{ item.translate }}</span>
            </Transition>
          </div>
        </template>
      </div>
      <div class="cursor" v-if="!isEnd" :style="{top:cursor.top+'px',left:cursor.left+'px'}"></div>
    </div>

    <div class="options flex justify-center" v-if="isEnd">
      <BaseButton
          v-if="store.currentBook.lastLearnIndex < store.currentBook.articles.length - 1"
          @click="emitter.emit(EventKey.continueStudy)">下一章
      </BaseButton>
    </div>

    <div class="translate-bottom mb-10" v-if="settingStore.translate">
      <header class="mb-4">
        <div class="text-2xl center">{{ props.article.titleTranslate }}</div>
      </header>
      <template v-if="getTranslateText(article).length">
        <div class="text-xl mb-4 indent-8" v-for="t in getTranslateText(article)">{{ t }}</div>
      </template>
    </div>

    <div class="center">
      <BaseButton @click="showQuestions =! showQuestions">显示题目</BaseButton>
    </div>
    <div class="toggle" v-if="showQuestions">
      <QuestionForm :questions="article.questions"
                    :duration="300"
                    :immediateFeedback="false"
                    :randomize="true"
      />
    </div>

  </div>
</template>

<style scoped lang="scss">

.wrote {
  color: grey;
  //color: rgb(22, 163, 74);
}

.typing-article {
  height: 100%;
  width: 100%;
  overflow: auto;
  color: var(--color-article);
  font-size: 1.6rem;

  header {
    word-wrap: break-word;
    position: relative;
    padding-top: 1rem;

    .title {
      text-align: center;
      font-size: 2.2rem;
      font-family: var(--en-article-family);
    }

    .titleTranslate {
      @extend .title;
      font-size: 1.2rem;
      font-family: var(--zh-article-family);
      font-weight: bold;
    }
  }

  .article-content {
    position: relative;
    //opacity: 0;
  }

  article {
    line-height: 1.3;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-family: var(--en-article-family);

    &.dictation {
      .dictation-hide {
        opacity: 0;
      }

      .border-bottom {
        display: inline-block !important;
      }
    }

    .wrote, .hover-show {
      .dictation-hide {
        opacity: 1 !important;
      }

      .border-bottom {
        display: none !important;
      }
    }

    .hover-show {
      background: var(--color-select-bg);
      color: white !important;

      .wrote {
        color: white !important;
      }
    }

    &.tall {
      line-height: 2.2;
    }

    .section {
      margin-bottom: 1.5rem;

      .sentence {
        transition: all .3s;

      }

      .word {
        display: inline-block;

        .word-wrap {
          position: relative;

          .border-bottom {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            border-bottom: 2px solid var(--color-article);
            display: none;
            transform: translateY(-0.2rem);
          }
        }
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
    font-size: 1.2rem;
    line-height: 3.0;
    letter-spacing: .2rem;
    font-family: var(--zh-article-family);
    font-weight: bold;

    .row {
      position: absolute;
      left: 0;
      width: 100%;
      opacity: 0;
      transition: all .3s;

      .space {
        transition: all .3s;
        display: inline-block;
      }
    }
  }

  .word-space {
    position: relative;
    display: inline-block;
    width: 0.8rem;
    height: 1.5rem;
    margin: 0 1px;
    box-sizing: border-box;

    &.to-bottom {
      transform: translateY(0.3rem);
    }

    &.wait {
      border-bottom: 2px solid var(--color-article);

      &::after {
        content: ' ';
        position: absolute;
        width: 2px;
        height: .25rem;
        background: var(--color-article);
        bottom: 0;
        right: 0;
      }

      &::before {
        content: ' ';
        position: absolute;
        width: 2px;
        height: .26rem;
        background: var(--color-article);
        bottom: 0;
        left: 0;
      }
    }
  }

  .word-start {
    color: var(--color-select-bg);
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
    border-left: .1rem solid var(--color-article);
  }
  50% {
    border-left: .1rem solid transparent;
  }
}

</style>
