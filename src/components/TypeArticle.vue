<script setup lang="ts">

import {usePlayWordAudio} from "@/hooks/usePlayWordAudio.ts"
import {onMounted, reactive} from "vue"
import {cloneDeep} from "lodash"

let article1 = `How does the older investor differ in his approach to investment from the younger investor?
There is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?
Well, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.
So what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.
For instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.
If you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.
*'Periwigs' is the name of a fictitious company.
INVESTOR'S CHRONICLE, March 23 1990`

// article1 = `Last week I went to the theatre.\nI had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. I cant hear a word! I said angrily.
// Its none of your business, the young man said rudely. This is a private conversation!`

let article2 = `What is one of the features of modern camping where nationality is concerned?
Economy is one powerful motive for camping, since after the initial outlay upon equipment, or through hiring it, the total expense can be far less than the cost of hotels. But, contrary to a popular assumption, it is far from being the only one, or even the greatest. The man who manoeuvres carelessly into his twenty pounds' worth of space at one of Europe's myriad permanent sites may find himself bumping a Bentley. More likely, Ford Escort will be hub to hub with Renault or Mercedes, but rarely with bicycles made for two.
That the equipment of modern camping becomes yearly more sophisticated is an entertaining paradox for the cynic, a brighter promise for the hopeful traveler who has sworn to get away from it all. It also provides-and some student sociologist might care to base his thesis upon the phenomenon -- an escape of another kind. The modern traveller is often a man who dislikes the Splendide and the Bellavista, not because he cannot afford, or shuns their material comforts. but because he is afford of them. Affluent he may be, but he is by no means sure what to tip the doorman or the chambermaid. Master in his own house, he has little idea of when to say boo to a maitre d'hotel.
From all such fears camping releases him. Granted, a snobbery of camping itself, based upon equipment and techniques, already exists; but it is of a kind that, if he meets it, he can readily understand and deal with. There is no superior 'they' in the shape of managements and hotel hierarchies to darken his holiday days.
To such motives, yet another must be added. The contemporary phenomenon of car worship is to be explained not least by the sense of independence and freedom that ownership entails. To this pleasure camping gives an exquisite refinement.
From one's own front door to home or foreign hills or sands and back again, everything is to hand. Not only are the means of arriving at the holiday paradise entirely within one's own command and keeping, but the means of escape from holiday hel (if the beach proves too crowded, the local weather too inclement) are there, outside -- or, as likely, part of -- the tent.
Idealists have objected to the package tour, that the traveller abroad thereby denies himself the opportunity of getting to know the people of the country visited. Insularity and self-containment, it is argued, go hand in hand. The opinion does not survive experience of a popular Continental camping place. Holiday hotels tend to cater for one nationality of visitors especially, sometimes exclusively. Camping sites, by contrast, are highly cosmopolitan. Granted, a preponderance of Germans is a characteristic that seems common to most Mediterranean sites; but as yet there is no overwhelmingly specialized patronage. Notices forbidding the open-air drying of clothes, or the use of water points for car washing, or those inviting 'our camping friends' to a dance or a boat trip are printed not only in French or Italian or Spanish, but also in English, German and Dutch. At meal times the odour of sauerkraut vies with that of garlic. The Frenchman's breakfast coffee competes with the Englishman's bacon and eggs.
Whether the remarkable growth of organized camping means the eventual death of the more independent kind is hard to say. Municipalities naturally want to secure the campers' site fees and other custom. Police are wary of itinerants who cannot be traced to a recognized camp boundary or to four walls. But most probably it will all depend upon campers themselves: how many heath fires they cause; how much litter they leave; in short, whether or not they wholly alienate landowners and those who live in the countryside. Only good scouting is likely to preserve the freedoms so dear to the heart of the eternal Boy Scout.
NIGEL BUXTON The Great Escape from The Weekend Telegraph`

let isPlay = $ref(false)
let inputRef = $ref<HTMLInputElement>(null)

const [playAudio] = usePlayWordAudio()

interface Article {
  sections: {
    sentence: string,
    words: string[]
  }[][]
}

let article = reactive<Article>({
  sections: []
})

onMounted(() => {
  let sections = article2.split('\n')
  sections = sections.reduce((previousValue: any[], currentValue, currentIndex, array) => {
    // console.log(cloneDeep(currentValue))
    let sentences = currentValue.replace('\n', '').split('.')
    // console.log(cloneDeep(sentences))
    sentences = sentences.filter(v => v).map((v, index, arr) => {
      v += index === arr.length - 1 ? '' : '.'
      return v
    })
    // console.log(cloneDeep(sentences))

    sentences = sentences.reduce((previousValue: string[], currentValue: string, currentIndex, array) => {
      let r = currentValue.split(',')
      r = r.filter(v => v).map((v, index) => {
        v += index === r.length - 1 ? '' : ','
        return v
      })
      previousValue = previousValue.concat(r)
      return previousValue
    }, [])
    // console.log(cloneDeep(sentences))

    sentences = sentences.reduce((previousValue: string[], currentValue: string, currentIndex, array) => {
      let r = currentValue.split('?')
      r = r.filter(v => v).map((v, index) => {
        v += index === r.length - 1 ? '' : '?'
        return v
      })
      previousValue = previousValue.concat(r)
      return previousValue
    }, [])
    // console.log(cloneDeep(sentences))


    let section = sentences.map(v => {
      let data = {
        sentence: v.trim(),
        words: v.trim().split(' ')
      }
      return data
    })

    previousValue.push(section)

    return previousValue
  }, [])

  console.log(sections)
  article.sections = sections as any
  // console.log(cloneDeep(item.sentences))
})

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

let sectionIndex = $ref(0)
let sentenceIndex = $ref(0)
let wordIndex = $ref(0)
let index = $ref(0)
let input = $ref('')
let wrong = $ref('')
let isSpace = $ref(false)

function keyDown(e: KeyboardEvent) {
  console.log('keyDown', e.key, e.code)
  if (isSpace) {
    if (e.code === 'Space') isSpace = false
    return
  }
  if ((e.keyCode >= 65 && e.keyCode <= 90)
      || e.code === 'Space'
      || e.code === 'Slash'
      || e.code === 'Quote'
      || e.code === 'Comma'
      || e.code === 'BracketLeft'
      || e.code === 'BracketRight'
  ) {
    let letter = e.key

    let currentSection = article.sections[sectionIndex]
    let currentSentence = currentSection[sentenceIndex]
    let currentWord = currentSentence.words[wordIndex]
    let key = currentWord[index]
    if (key === letter) {
      input += letter
      wrong = ''
      console.log('匹配上了')
      index++
      if (!currentWord[index]) {
        index = 0
        input = wrong = ''
        wordIndex++
        isSpace = true
        if (!currentSentence.words[wordIndex]) {
          wordIndex = 0
          sentenceIndex++
          isSpace = true
          if (!currentSection[sentenceIndex]) {
            sentenceIndex = 0
            sectionIndex++
          }
        }
      }
    } else {
      wrong = letter
      setTimeout(() => {
        wrong = ''
        // wrong = input = ''
      }, 500)
      console.log('未匹配')
    }
  }

  console.log(
      'sectionIndex', sectionIndex,
      'sentenceIndex', sentenceIndex,
      'wordIndex', wordIndex,
      'index', index,
  )
  inputRef.value = ''
  e.preventDefault()
}
</script>

<template>
  <div class="type-wrapper">
    <article v-if="true" @click="focus">
      <p class="line" v-for="(section,indexI) in article.sections">
        <span v-for="(sentences,indexJ) in section">
          <span class="word"
                v-for="(word,indexW) in sentences.words"
                :class="(sectionIndex>indexI
                ?'green':
                (sectionIndex>=indexI &&sentenceIndex>indexJ)
                ?'green' :
                (sectionIndex>=indexI &&sentenceIndex>=indexJ && wordIndex>indexW)
                ?'green':
                'wait'
                )"
          >
            <template v-if="(sectionIndex===indexI &&sentenceIndex===indexJ && wordIndex===indexW)">
                 <span class="input" v-if="input">{{ input }}</span>
                <span class="wrong"
                      :class="wrong === ' ' && 'bg-wrong'"
                      v-if="wrong">{{ wrong === ' ' ? `&nbsp;` : wrong }}</span>{{
                word.slice(input.length + wrong.length)
              }}&nbsp;</template>
            <template v-else>{{ word }}&nbsp;</template>
            <!--          <span>{{sentences.sentence}}&nbsp;</span>-->
          </span>
        </span>
      </p>
    </article>
    <input ref="inputRef"
           class="inputEl"
           type="text"
           @keydown="keyDown">
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.green {
  color: green;
}

.type-wrapper {
  height: 100%;
  overflow: auto;

  article {
    font-size: 24rem;
    line-height: 1.5;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    letter-spacing: 0rem;
    color: gray;

    .line {
      //white-space: pre-line;
      word-break: keep-all;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    span {
      //background: red;
      //margin-right: 50rem;
    }

    .word {
      //margin-right: 10rem;
    }
  }


  .input {
    color: rgb(22, 163, 74);
  }

  .wrong {
    color: rgba(red, 0.6);
  }
  .bg-wrong {
    background: rgba(red, 0.6);
  }

  .inputEl {
    position: fixed;
    left: 100vw;
  }
}
</style>