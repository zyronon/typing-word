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

let isPlay = $ref(false)
let inputRef = $ref<HTMLInputElement>(null)

const [playAudio] = usePlayWordAudio()

interface Article {
  section: {
    sentence: string,
    words: string[]
  }[][]
}

let article = reactive<Article>({
  section: []
})

onMounted(() => {
  let sections = article1.split('\n')
  sections = sections.reduce((previousValue: any[], currentValue, currentIndex, array) => {
    console.log(cloneDeep(currentValue))
    let sentences = currentValue.replace('\n', '').split('.')
    console.log(cloneDeep(sentences))
    sentences = sentences.filter(v => v).map((v, index, arr) => {
      v += index === arr.length - 1 ? '' : '.'
      return v
    })
    console.log(cloneDeep(sentences))

    sentences = sentences.reduce((previousValue: string[], currentValue: string, currentIndex, array) => {
      let r = currentValue.split(',')
      r = r.map((v, index) => {
        v += index === r.length - 1 ? '' : ','
        return v
      })
      previousValue = previousValue.concat(r)
      return previousValue
    }, [])
    console.log(cloneDeep(sentences))

    sentences = sentences.reduce((previousValue: string[], currentValue: string, currentIndex, array) => {
      let r = currentValue.split('?')
      r = r.map((v, index) => {
        v += index === r.length - 1 ? '' : '?'
        return v
      })
      previousValue = previousValue.concat(r)
      return previousValue
    }, [])
    console.log(cloneDeep(sentences))


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

function keyDown(e: KeyboardEvent) {
  console.log('keyDown', e.key)
  inputRef.value = ''
  e.preventDefault()
}
</script>

<template>
  <div class="type-wrapper">
    <article v-if="true" @click="focus">
      <span v-for="i in article.sentences" @click="playAudio(i)">
        <span class="word" v-for="word in i.words">{{ word }}</span>
      </span>
    </article>
    <input ref="inputRef"
           class="input"
           type="text"
           @keydown="keyDown">
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.type-wrapper {
  height: 100%;
  overflow: auto;

  article {
    font-size: 24rem;
    line-height: 1.5;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    letter-spacing: 0rem;
    color: gray;
    white-space: pre-line;

    span {
      //background: red;
      //margin-right: 50rem;
    }

    .word {
      margin-right: 10rem;
    }
  }

  .input {
    position: fixed;
    left: 100vw;
  }
}
</style>