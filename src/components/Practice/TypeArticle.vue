<script setup lang="ts">

import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import {computed, nextTick, onMounted, reactive, watch} from "vue"
import {cloneDeep} from "lodash"
import 快速打字的机械键盘声音Mp3 from '../..//assets/sound/key-sounds/快速打字的机械键盘声音.mp3'
import 键盘快速打字的声音Mp3 from '../..//assets/sound/key-sounds/键盘快速打字的声音.mp3'
import 电话打字的声音Mp3 from '../..//assets/sound/key-sounds/电话打字的声音.mp3'
import 老式机械 from '../..//assets/sound/key-sounds/老式机械.mp3'
import 机械0 from '../..//assets/sound/key-sounds/jixie/机械0.mp3'
import 机械1 from '../..//assets/sound/key-sounds/jixie/机械1.mp3'
import 机械2 from '../..//assets/sound/key-sounds/jixie/机械2.mp3'
import 机械3 from '../..//assets/sound/key-sounds/jixie/机械3.mp3'
import beep from '../..//assets/sound/beep.wav'
import correct from '../..//assets/sound/correct.wav'
import {useSound} from "@/hooks/useSound.ts"
import {CnKeyboardMap, useSplitArticle, useSplitCNArticle} from "@/hooks/useSplitArticle";
import {$computed, $ref} from "vue/macros";
import {
  Article,
  ArticleWord,
  DefaultWord,
  DictType,
  SaveKey,
  Sentence,
  ShortKeyMap,
  TranslateEngine,
  Word
} from "@/types";
import {useBaseStore} from "@/stores/base";
import Footer from "@/components/Practice/Footer.vue"
import {usePracticeStore} from "@/components/Practice/usePracticeStore.ts";
import {useEventListener} from "@/hooks/useEvent.ts";
import TypeWord from "@/components/Practice/TypeWord.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Baidu from "@opentranslate/baidu";
import {axiosInstance} from "@/utils/http";
import {translate} from "element-plus";
import useSleep from "@/hooks/useSleep.ts";
import {useNetworkTranslate} from "@/hooks/translate.ts";

let article1 = `How does the older investor differ in his approach to investment from the younger investor?
There is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?
Well, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.
So what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.
For instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.
If you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.
*'Periwigs' is the name of a fictitious company.
INVESTOR'S CHRONICLE, March 23 1990`

article1 = `How does the older investor differ in his approach to investment from the younger investor?`
article1 = `Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. ‘I can't hear a word!’ I said angrily.
‘It's none of your business, ’ the young man said rudely. ‘This is a private conversation!’`
// article1 = `Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it.`

let article2 = `What is one of the features of modern camping where nationality is concerned?
Economy is one powerful motive for camping, since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.
That the equipment of modern camping becomes yearly more sophisticated is an entertaining paradox for the cynic, a brighter promise for the hopeful traveler who has sworn to get away from it all. It also provides-and some student sociologist might care to base his thesis upon the phenomenon -- an escape of another kind. The modern traveller is often a man who dislikes the Splendide and the Bellavista, not because he cannot afford, or shuns their material comforts. but because he is afford of them. Affluent he may be, but he is by no means sure what to tip the doorman or the chambermaid. Master in his own house, he has little idea of when to say boo to a maitre d'hotel.
From all such fears camping releases him. Granted, a snobbery of camping itself, based upon equipment and techniques, already exists; but it is of a kind that, if he meets it, he can readily understand and deal with. There is no superior 'they' in the shape of managements and hotel hierarchies to darken his holiday days.
To such motives, yet another must be added. The contemporary phenomenon of car worship is to be explained not least by the sense of independence and freedom that ownership entails. To this pleasure camping gives an exquisite refinement.
From one's own front door to home or foreign hills or sands and back again, everything is to hand. Not only are the means of arriving at the holiday paradise entirely within one's own command and keeping, but the means of escape from holiday hel (if the beach proves too crowded, the local weather too inclement) are there, outside -- or, as likely, part of -- the tent.
Idealists have objected to the package tour, that the traveller abroad thereby denies himself the opportunity of getting to know the people of the country visited. Insularity and self-containment, it is argued, go hand in hand. The opinion does not survive experience of a popular Continental camping place. Holiday hotels tend to cater for one nationality of visitors especially, sometimes exclusively. Camping sites, by contrast, are highly cosmopolitan. Granted, a preponderance of Germans is a characteristic that seems common to most Mediterranean sites; but as yet there is no overwhelmingly specialized patronage. Notices forbidding the open-air drying of clothes, or the use of water points for car washing, or those inviting 'our camping friends' to a dance or a boat trip are printed not only in French or Italian or Spanish, but also in English, German and Dutch. At meal times the odour of sauerkraut vies with that of garlic. The Frenchman's breakfast coffee competes with the Englishman's bacon and eggs.
Whether the remarkable growth of organized camping means the eventual death of the more independent kind is hard to say. Municipalities naturally want to secure the campers' site fees and other custom. Police are wary of itinerants who cannot be traced to a recognized camp boundary or to four walls. But most probably it will all depend upon campers themselves: how many heath fires they cause; how much litter they leave; in short, whether or not they wholly alienate landowners and those who live in the countryside. Only good scouting is likely to preserve the freedoms so dear to the heart of the eternal Boy Scout.
NIGEL BUXTON The Great Escape from The Weekend Telegraph`

// article2 = `Economy is one powerful motive for camping? since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.`

const [playAudio] = usePlayWordAudio()
// const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
const [playKeySound, setAudio] = useSound([老式机械], 3)
// const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)

const store = useBaseStore()
const practiceStore = usePracticeStore()

let isPlay = $ref(false)
let articleWrapperRef = $ref<HTMLInputElement>(null)
let tabIndex = $ref(0)
let sectionIndex = $ref(0)
let sentenceIndex = $ref(0)
let wordIndex = $ref(0)
let stringIndex = $ref(0)
let input = $ref('')
let wrong = $ref('')
let isSpace = $ref(false)
let isDictation = $ref(false)
let showTranslate = $ref(true)
let showFullWord = $ref(false)
let hoverIndex = $ref({
  sectionIndex: -1,
  sentenceIndex: -1,
})

let wordData = $ref({
  words: [],
  index: -1
})

let article = reactive<Article>({
  article: article1,
  customTranslate: `上星期我去看戏。我的座位很好，戏很有意思，但我却无法欣赏。一青年男子与一青年女子坐在我的身后，大声地说着话。我非常生气，因为我听不见演员在说什么。我回过头去，怒视着那一男一女，他们却毫不理会。最后，我忍不住了，又一次回过头去，生气地说，“我一个字也听不见了！”
“不关你的事，”那男的毫不客气地说，“这是私人间的谈话！”`,
  networkTranslate: '',
  newWords: [],
  articleAllWords: [],
  sections: [],
  isTranslated: false,
})

onMounted(async () => {
  if (!article.sections.length) {
    article.sections = useSplitArticle(article.article)
  }

  practiceStore.total = 0
  article.sections.map((v, i) => {
    v.map((w, j) => {
      w.words.map(s => {
        if (!store.skipWordNamesWithSimpleWords.includes(s.name.toLowerCase()) && !s.isSymbol) {
          practiceStore.total++
        }
      })
    })
  })
  practiceStore.startDate = Date.now()
  calcTranslateLocation()

  console.time()
  await useNetworkTranslate(article, TranslateEngine.Baidu, false)
  console.timeEnd()
  // console.log(cloneDeep(article))
})

function calcTranslateLocation() {
  if (!showTranslate) return
  nextTick(() => {
    setTimeout(() => {
      let articleRect = articleWrapperRef.getBoundingClientRect()
      article.sections.map((v, i) => {
        v.map((w, j) => {
          let location = i + '-' + j
          let wordClassName = `.word${location}`
          let word = document.querySelector(wordClassName)
          let wordRect = word.getBoundingClientRect()
          let translateClassName = `.translate${location}`
          let translate: HTMLDivElement = document.querySelector(translateClassName)

          translate.style.opacity = '1'
          translate.style.top = wordRect.top - articleRect.top - 20 + 'px'
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
  return playAudio(article1)
  if (isPlay) {
    isPlay = false
    return window.speechSynthesis.pause();
  }
  let msg = new SpeechSynthesisUtterance();
  msg.text = article1
  msg.rate = 0.5;
  msg.pitch = 1;
  msg.lang = 'en-US';
  // msg.lang = 'zh-HK';
  isPlay = true
  window.speechSynthesis.speak(msg);
}

const currentIndex = computed(() => {
  return `${sectionIndex}${sentenceIndex}${wordIndex}`
})

function onKeyDown(e: KeyboardEvent) {
  if (tabIndex !== 0) return
  // console.log('keyDown', e.key, e.code, e.keyCode)
  wrong = ''
  let currentSection = article.sections[sectionIndex]
  let currentSentence = currentSection[sentenceIndex]
  let currentWord: ArticleWord = currentSentence.words[wordIndex]

  const nextWord = () => {
    isSpace = false
    stringIndex = 0
    wordIndex++

    if (!store.skipWordNamesWithSimpleWords.includes(currentWord.name.toLowerCase()) && !currentWord.isSymbol) {
      practiceStore.inputNumber++
    }

    if (!currentSentence.words[wordIndex]) {
      wordIndex = 0
      sentenceIndex++
      if (!currentSection[sentenceIndex]) {
        sentenceIndex = 0
        sectionIndex++
      } else {
        if (isDictation) {
          calcTranslateLocation()
        }
        playAudio(currentSection[sentenceIndex].sentence)
      }
    }
  }
  //非英文模式下，输入区域的 keyCode 均为 229时，
  if ((e.keyCode >= 65 && e.keyCode <= 90)
      || (e.keyCode >= 48 && e.keyCode <= 57)
      || e.code === 'Space'
      || e.code === 'Slash'
      || e.code === 'Quote'
      || e.code === 'Comma'
      || e.code === 'BracketLeft'
      || e.code === 'BracketRight'
      || e.code === 'Period'
      || e.code === 'Minus'
      || e.code === 'Equal'
      || e.code === 'Semicolon'
      || e.code === 'Backquote'
      || e.keyCode === 229
  ) {
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
      playKeySound()
    } else {
      let letter = e.key

      let key = currentWord.name[stringIndex]
      console.log('key', key,)
      if (key === letter) {
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
        if (!store.wrongWordDict.originWords.find((v: Word) => v.name.toLowerCase() === currentWord.name.toLowerCase())) {
          store.wrongWordDict.originWords.push(currentWord)
          store.wrongWordDict.words.push(currentWord)
          store.wrongWordDict.chapterWords = [store.wrongWordDict.words]
        }

        if (!store.skipWordNamesWithSimpleWords.includes(currentWord.name.toLowerCase())) {
          if (!practiceStore.wrongWords.find((v) => v.name.toLowerCase() === currentWord.name.toLowerCase())) {
            practiceStore.wrongWords.push(currentWord)
            practiceStore.wrongNumber++
          }
        }

        wrong = letter
        playBeep()
        setTimeout(() => {
          wrong = ''
        }, 500)
        // console.log('未匹配')
      }
      playKeySound()
    }
  } else {
    switch (e.key) {
      case 'Backspace':
        if (wrong) {
          wrong = ''
        } else {
          input = input.slice(0, -1)
        }
        break
      case ShortKeyMap.Collect:

        break
      case ShortKeyMap.Remove:

        break
      case ShortKeyMap.Ignore:

        break
      case ShortKeyMap.Show:
        hoverIndex = {
          sectionIndex: sectionIndex,
          sentenceIndex: sentenceIndex,
        }
        break
    }
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

useEventListener('keydown', onKeyDown)
useEventListener('keyup', onKeyUp)

function playWord(word: ArticleWord) {
  playAudio(word.name)
}

function currentWordInput(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length, input.length + wrong.length + 1)
  if (word.isSymbol) {
    return str
  }
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (isDictation) {
    return '_'
  }
  return str
}

function currentWordEnd(word: ArticleWord, i: number, i2: number,) {
  let str = word.name.slice(input.length + wrong.length + (wrong ? 0 : 1))
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (isDictation) {
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
      && isDictation
  ) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

</script>

<template>
  <div class="type-wrapper">
    <div class="swiper-wrapper content">
      <div class="swiper-list" :class="`step${tabIndex}`">
        <div class="swiper-item">
          <div class="article-wrapper" ref="articleWrapperRef">
            <article>
              <div class="section"
                   v-for="(section,indexI) in article.sections">
                <span class="sentence"
                      :class="[
                          sectionIndex === indexI && sentenceIndex === indexJ && isDictation
                          ?'isDictation':''
                      ]"
                      @mouseenter="hoverIndex = {sectionIndex : indexI,sentenceIndex :indexJ}"
                      @mouseleave="hoverIndex = {sectionIndex : -1,sentenceIndex :-1}"
                      @click="playAudio(sentence.sentence)"
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
                            (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong && isDictation) && 'word-space',
                        ]">
                      {{ (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && isDictation) ? '_' : ' ' }}
                    </span>
                  </span>
                </span>
              </div>
            </article>
            <div class="translate">
              <template v-for="(v,i) in article.sections">
                <div class="row"
                     :class="`translate${i+'-'+j}`"
                     v-for="(item,j) in v">
                  <span class="space"></span>
                  <span class="text">{{ item.translate }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="swiper-item">
          <TypeWord
              :words="wordData.words"
              :index="wordData.index"
              v-if="tabIndex === 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.wrote {
  //color: green;
  color: rgb(22, 163, 74);
}

.type-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  .content {
    width: 1000px;
  }

  .article-wrapper {
    position: relative;

    article {
      //height: 100%;
      font-size: 24rem;
      line-height: 1.9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      color: gray;
      word-break: keep-all;
      word-wrap: break-word;
      white-space: pre-wrap;
      padding-top: 20rem;

      .isDictation {
        letter-spacing: 3rem;
      }

      .section {
        margin-bottom: $space;

        .sentence {
          transition: all .3s;
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
      line-height: 2.5;
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
    font-weight: bold;
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

.swiper-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .swiper-list {
    transition: transform .3s;
    height: 200%;

    .swiper-item {
      height: 50%;
      overflow: auto;
      display: flex;
    }
  }

  .step1 {
    transform: translate3d(0, -50%, 0);
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