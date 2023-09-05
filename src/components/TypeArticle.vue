<script setup lang="ts">

import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import {computed, nextTick, onMounted, reactive} from "vue"
import {cloneDeep} from "lodash"
import 快速打字的机械键盘声音Mp3 from '../assets/sound/key-sounds/快速打字的机械键盘声音.mp3'
import 键盘快速打字的声音Mp3 from '../assets/sound/key-sounds/键盘快速打字的声音.mp3'
import 电话打字的声音Mp3 from '../assets/sound/key-sounds/电话打字的声音.mp3'
import 老式机械 from '../assets/sound/key-sounds/老式机械.mp3'
import 机械0 from '../assets/sound/key-sounds/jixie/机械0.mp3'
import 机械1 from '../assets/sound/key-sounds/jixie/机械1.mp3'
import 机械2 from '../assets/sound/key-sounds/jixie/机械2.mp3'
import 机械3 from '../assets/sound/key-sounds/jixie/机械3.mp3'
import beep from '../assets/sound/beep.wav'
import correct from '../assets/sound/correct.wav'
import {useSound} from "@/hooks/useSound.ts"
import {CnKeyboardMap, useSplitArticle} from "@/hooks/useSplitArticle";
import {$computed, $ref} from "vue/macros";
import {Article, DictType, SaveKey, Sentence, ShortKeyMap, Word} from "@/types";
import {useBaseStore} from "@/stores/base";

let article1 = `How does the older investor differ in his approach to investment from the younger investor?
There is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?
Well, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.
So what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.
For instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.
If you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.
*'Periwigs' is the name of a fictitious company.
INVESTOR'S CHRONICLE, March 23 1990`

// article1 = `How does the older investor differ in his approach to investment from the younger investor?How does the older investor differ in his approach to investment from the younger investor?`
article1 = `Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. ‘I can't hear a word!’ I said angrily.
‘It's none of your business, ’ the young man said rudely. ‘This is a private conversation!’`

let article2 = `What is one of the features of modern camping where nationality is concerned?
Economy is one powerful motive for camping, since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.
That the equipment of modern camping becomes yearly more sophisticated is an entertaining paradox for the cynic, a brighter promise for the hopeful traveler who has sworn to get away from it all. It also provides-and some student sociologist might care to base his thesis upon the phenomenon -- an escape of another kind. The modern traveller is often a man who dislikes the Splendide and the Bellavista, not because he cannot afford, or shuns their material comforts. but because he is afford of them. Affluent he may be, but he is by no means sure what to tip the doorman or the chambermaid. Master in his own house, he has little idea of when to say boo to a maitre d'hotel.
From all such fears camping releases him. Granted, a snobbery of camping itself, based upon equipment and techniques, already exists; but it is of a kind that, if he meets it, he can readily understand and deal with. There is no superior 'they' in the shape of managements and hotel hierarchies to darken his holiday days.
To such motives, yet another must be added. The contemporary phenomenon of car worship is to be explained not least by the sense of independence and freedom that ownership entails. To this pleasure camping gives an exquisite refinement.
From one's own front door to home or foreign hills or sands and back again, everything is to hand. Not only are the means of arriving at the holiday paradise entirely within one's own command and keeping, but the means of escape from holiday hel (if the beach proves too crowded, the local weather too inclement) are there, outside -- or, as likely, part of -- the tent.
Idealists have objected to the package tour, that the traveller abroad thereby denies himself the opportunity of getting to know the people of the country visited. Insularity and self-containment, it is argued, go hand in hand. The opinion does not survive experience of a popular Continental camping place. Holiday hotels tend to cater for one nationality of visitors especially, sometimes exclusively. Camping sites, by contrast, are highly cosmopolitan. Granted, a preponderance of Germans is a characteristic that seems common to most Mediterranean sites; but as yet there is no overwhelmingly specialized patronage. Notices forbidding the open-air drying of clothes, or the use of water points for car washing, or those inviting 'our camping friends' to a dance or a boat trip are printed not only in French or Italian or Spanish, but also in English, German and Dutch. At meal times the odour of sauerkraut vies with that of garlic. The Frenchman's breakfast coffee competes with the Englishman's bacon and eggs.
Whether the remarkable growth of organized camping means the eventual death of the more independent kind is hard to say. Municipalities naturally want to secure the campers' site fees and other custom. Police are wary of itinerants who cannot be traced to a recognized camp boundary or to four walls. But most probably it will all depend upon campers themselves: how many heath fires they cause; how much litter they leave; in short, whether or not they wholly alienate landowners and those who live in the countryside. Only good scouting is likely to preserve the freedoms so dear to the heart of the eternal Boy Scout.
NIGEL BUXTON The Great Escape from The Weekend Telegraph`

article2 = `Economy is one powerful motive for camping? since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.`
let isPlay = $ref(false)
let inputRef = $ref<HTMLInputElement>(null)
let articleWrapperRef = $ref<HTMLInputElement>(null)

const [playAudio] = usePlayWordAudio()
// const [playKeySound, setAudio] = useSound([机械0, 机械1, 机械2, 机械3], 1)
const [playKeySound, setAudio] = useSound([老式机械], 3)
// const [playKeySound, setAudio] = useSound([电话打字的声音Mp3], 3)
const [playBeep] = useSound([beep], 1)
const [playCorrect] = useSound([correct], 1)

const store = useBaseStore()


let sectionIndex = $ref(0)
let sentenceIndex = $ref(0)
let wordIndex = $ref(6)
let index = $ref(0)
let input = $ref('')
let wrong = $ref('')
let isSpace = $ref(false)
let isDictation = $ref(true)
let showFullWord = $ref(false)
let hoverIndex = $ref({
  sectionIndex: 0,
  sentenceIndex: 0,
})

let article = reactive<Article>({
  article: article1,
  articleTranslate: `上星期我去看戏。我的座位很好，戏很有意思，但我却无法欣赏。一青年男子与一青年女子坐在我的身后，大声地说着话。我非常生气，因为我听不见演员在说什么。我回过头去，怒视着那一男一女，他们却毫不理会。最后，我忍不住了，又一次回过头去，生气地说，“我一个字也听不见了！”
“不关你的事，”那男的毫不客气地说，“这是私人间的谈话！”`,
  newWords: [],
  articleAllWords: [],
  sections: [],
  translate: [],
})
const simpleWord = [
  'a', 'an', 'of', 'and',
  'i', 'my', 'you', 'your',
  'me', 'am', 'is', 'do', 'are',
  'what', 'who', 'where', 'how', 'no', 'yes',
  'not', 'did', 'were', 'can', 'could'
]
onMounted(() => {
  let t1 = useSplitArticle(article.article)
  let wordNumber = 0
  t1.map(v => {
    v.map(w => {
      wordNumber += w.words.length
    })
  })
  console.log('t1', t1)
  console.log('wordNumber', wordNumber)

  setTimeout(() => {
    store.current = {
      dictType: DictType.innerDict,
      words: [],
      index: wordIndex,
      wrongWords: [],
      originWrongWords: [],
      repeatNumber: 0,
      statistics: {
        startDate: Date.now(),
        endDate: -1,
        spend: -1,
        wordNumber: wordNumber,
        correctRate: -1,
        wrongWordNumber: -1,
      }
    }
  }, 1000)
  let a = ``
  let t = useSplitArticle(a, 'cn', CnKeyboardMap)
  t.map((v, i) => {
    v.map((w, j) => {
      article.translate.push({
        sentence: w.sentence,
        location: i + '-' + j
      })
    })
  })
  article.sections = t1
  console.log(cloneDeep(article))
  calcTranslateLocation()
})

function calcTranslateLocation() {
  nextTick(() => {
    setTimeout(() => {
      let articleRect = articleWrapperRef.getBoundingClientRect()
      article.translate.map(v => {
        let wordClassName = `.word${v.location}`
        let translateClassName = `.translate${v.location}`
        let word = document.querySelector(wordClassName)
        let translate: HTMLDivElement = document.querySelector(translateClassName)
        let rect = word.getBoundingClientRect()

        translate.style.opacity = '1'
        translate.style.top = rect.top - articleRect.top - 20 + 'px'
        translate.firstChild.style.width = rect.left - articleRect.left + 'px'
        // console.log(word, rect.left - articleRect.left)
        // console.log('word-rect', rect)
      })
    }, 500)
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

function focus() {
  inputRef.focus()
}


const currentIndex = computed(() => {
  return `${sectionIndex}${sentenceIndex}${wordIndex}`
})

function onKeyDown(e: KeyboardEvent) {
  // console.log('keyDown', e.key, e.code, e.keyCode)

  wrong = ''

  let currentSection = article.sections[sectionIndex]
  let currentSentence = currentSection[sentenceIndex]
  let currentWord = currentSentence.words[wordIndex]

  if (isSpace) {
    if (e.code === 'Space') {
      isSpace = false
      index = 0
      wordIndex++
      store.current.index++

      playCorrect()
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
      let letter = e.key

      let key = currentWord[index]
      console.log('key', key,)
      if (key === letter) {
        input += letter
        wrong = ''
        console.log('匹配上了')
        index++
        //如果当前词没有index，说明这个词完了，下一个是空格
        if (!currentWord[index]) {
          input = wrong = ''
          isSpace = true
          //但如果当前句子也没有index+1，并且当前段也没sentenceIndex+1，说明本段完了，不需要打空格，直接跳到下一段吧
          if (!currentSentence.words[wordIndex + 1] && !currentSection[sentenceIndex + 1]) {
            wordIndex = sentenceIndex = index = 0
            sectionIndex++
            isSpace = false
          }
        }
      } else {
        let word: Word = {
          name: currentWord,
          usphone: '',
          ukphone: '',
          trans: []
        }
        if (!store.wrongWordDict.originWords.find((v: Word) => v.name === currentWord)) {
          store.wrongWordDict.originWords.push(word)
          store.wrongWordDict.words.push(word)
          store.wrongWordDict.chapterWords = [store.wrongWordDict.words]
        }
        if (!store.current.wrongWords.find((v: Word) => v.name === currentWord)) {
          store.current.wrongWords.push(word)
        }
        store.current.statistics.correctRate = Math.trunc(((store.current.index + 1 - store.current.wrongWords.length) / (store.current.index + 1)) * 100)

        wrong = letter
        playBeep()
        setTimeout(() => {
          wrong = ''
          // wrong = input = ''
        }, 500)
        console.log('未匹配')
      }
      playKeySound()
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
  }

  // console.log(
  //     'sectionIndex', sectionIndex,
  //     'sentenceIndex', sentenceIndex,
  //     'wordIndex', wordIndex,
  //     'index', index,
  // )
  inputRef.value = ''
  e.preventDefault()
}

function onKeyUp() {
  hoverIndex = {
    sectionIndex: -1,
    sentenceIndex: -1,
  }
}


function playWord(word: string) {
  playAudio(word)
}

function currentWordInput(word: string, i: number, i2: number,) {
  let str = word.slice(input.length + wrong.length, input.length + wrong.length + 1)

  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (isDictation) {
    return ' '
  }
  return str
}

function currentWordEnd(word: string, i: number, i2: number,) {
  let str = word.slice(input.length + wrong.length + 1)
  if (hoverIndex.sectionIndex === i && hoverIndex.sentenceIndex === i2) {
    return str
  }

  if (isDictation) {
    return str.split('').map(v => '_').join('')
  }
  return str
}

function otherWord(word: string, i: number, i2: number, i3: number) {
  let str = word

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
    <div class="trans">
      <span>翻译：</span>
      <span class="text">上周我去看戏了</span>
    </div>
    <div class="article-wrapper" ref="articleWrapperRef">
      <article @click="focus">
        <div class="section"
             v-for="(section,indexI) in article.sections">
        <span class="sentence"
              :class="[
                  sectionIndex === indexI && sentenceIndex === indexJ ?'isDictation':''
              ]"
              @mouseenter="hoverIndex = {sectionIndex : indexI,sentenceIndex :indexJ}"
              @mouseleave="hoverIndex = {sectionIndex : -1,sentenceIndex :-1}"
              @click="playAudio(sentence.sentence)"
              v-for="(sentence,indexJ) in section">
          <span class="word"
                :class="[(sectionIndex>indexI
                ?'wrote':
                (sectionIndex>=indexI &&sentenceIndex>indexJ)
                ?'wrote' :
                (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>indexW)
                ?'wrote':
                 (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>=indexW && index>=word.length)
                ?'wrote':
                ''),
                (`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace && wrong )?'word-wrong':'',
                indexW === 0 && `word${indexI}-${indexJ}`
                ]"
                @click="playWord(word)"
                v-for="(word,indexW) in sentence.words">
            <span v-if="`${indexI}${indexJ}${indexW}` === currentIndex && !isSpace">
              <span class="input" v-if="input">{{ input }}</span>
              <span class="wrong" :class="wrong === ' ' && 'bg-wrong'" v-if="wrong">{{ wrong }}</span>
              <span :class="!wrong && 'bottom-border'">{{ currentWordInput(word, indexI, indexJ) }}</span>
              <span>{{ currentWordEnd(word, indexI, indexJ,) }}</span>
            </span>
            <span v-else>{{ otherWord(word, indexI, indexJ, indexW) }}</span>
            <span
                :class="[
                    `${indexI}${indexJ}${indexW}`,
                    (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && wrong) && 'bg-wrong',
                    (`${indexI}${indexJ}${indexW}` === currentIndex && isSpace && !wrong) && 'bottom-border',
                ]">&nbsp;</span>
          </span>
        </span>
        </div>
      </article>
      <div class="translate">
        <div class="row"
             :class="`translate${item.location}`"
             v-for="item in article.translate">
          <span class="space"></span>
          <span class="text">{{ item.sentence }}</span>
        </div>
      </div>
    </div>
    <input ref="inputRef"
           class="inputEl"
           type="text"
           @keyup="onKeyUp"
           @keydown="onKeyDown">
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.wrote {
  //color: green;
  color: rgb(22, 163, 74);
}

.type-wrapper {
  height: 100%;
  overflow: auto;
  position: relative;

  .trans {
    height: 40rem;
    display: flex;
    align-items: center;
    justify-content: center;
    display: none;

    .text {
      color: var(--color-font-1);

      font-size: 22rem;
    }
  }

  article {
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

  .bottom-border {
    border-bottom: 1px solid black;
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
    background: rgba(red, 0.6);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  .inputEl {
    position: fixed;
    //left: 100vw;
  }
}
</style>