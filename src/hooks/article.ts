import {ArticleWord, DefaultArticleWord, Sentence} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import nlp from "compromise";
import {split} from "sentence-splitter";

interface KeyboardMap {
  Period: string,
  Comma: string,
  Slash: string,
  Exclamation: string,
  QuoteLeft: string,
  QuoteRight: string,
}

export const CnKeyboardMap: KeyboardMap = {
  Period: '。',
  Comma: '，',
  Slash: '？',
  Exclamation: '！',
  QuoteLeft: '“',
  QuoteRight: '”',
}
export const EnKeyboardMap: KeyboardMap = {
  Period: '.',
  Comma: ',',
  Slash: '?',
  Exclamation: '!',
  QuoteLeft: `'`,
  QuoteRight: `'`,
}

export function splitEnArticle(text: string): { sections: Sentence[][], newText: string } {
  // console.log(text)
  // console.time()
  let keyboardMap = EnKeyboardMap
  // text = "On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration. It was Sunday? I never get up early on Sundays! I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again.' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train,' she said. 'I'm coming to see you.'\n    'But I'm still having breakfast,' I said\n    'What are you doing?' she asked.\n    'I'm having breakfast,' I repeated.\n    'Dear me,' she said. 'Do you always get up so late? It's one o'clock'"
  // text = "Mr.James Scott has a garage in Silbury and now he has just bought another garage in Pinhurst. Pinhurst is only five miles from Silbury, but Mr. Scott cannot get a telephone for his new garage, so he has just bought twelve pigeons. Yesterday, a pigeon carried the first message from Pinhurst to Silbury. The bird covered the distance in three minutes. Up to now, Mr.Scott has sent a great many requests for spare parts and other urgent messages from one garage to the other. In this way, he has begun his own private 'telephone' service."
  // text = "How does the older investor differ in his approach to investment from the younger investor?\nThere is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?\nWell, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.\nSo what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.\nFor instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.\nIf you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.\n*'Periwigs' is the name of a fictitious company.\nINVESTOR'S CHRONICLE, March 23 1990"

  let sections: Sentence[][] = []
  text && text.trim().split('\n').map((rowSection, i) => {
    let section: Sentence[] = []
    sections.push(section)
    rowSection = rowSection.trim()

    let doc = nlp.tokenize(rowSection)
    let sentences = doc.json()
    // console.log('--')
    sentences.map(sentenceRow => {
      let sentence: Sentence = {
        //他没有空格，导致修改一行一行的数据时，汇总时全没有空格了，库无法正常断句
        text: sentenceRow.text + ' ',
        // text: '',
        translate: '',
        words: []
      }
      section.push(sentence)

      const checkQuote = (pre: string) => {
        let nearSymbolPosition = null
        //TODO 可以优化成for+break
        section.toReversed().map((sentenceItem, b) => {
          sentenceItem.words.toReversed().map((wordItem, c) => {
            if (wordItem.symbolPosition !== '' && nearSymbolPosition === null) {
              nearSymbolPosition = wordItem.symbolPosition
            }
          })
        })

        let word3: ArticleWord = {
          ...DefaultArticleWord,
          name: pre,
          nextSpace: false,
          isSymbol: true,
          symbolPosition: ''
        };

        if (nearSymbolPosition === 'end' || nearSymbolPosition === null) {
          word3.symbolPosition = 'start'
          sentence.words.push(word3)
        } else {
          sentence.words[sentence.words.length - 1].nextSpace = false
          word3.symbolPosition = 'end'
          word3.nextSpace = true

          let addCurrent = false
          sentence.words.toReversed().map((wordItem, c) => {
            if (wordItem.symbolPosition === 'start' && !addCurrent) {
              addCurrent = true
            }
          })
          if (addCurrent) {
            sentence.words.push(word3)
          } else {
            // 'Do you always get up so late? It's one o'clock!' 会被断成两句
            let lastSentence = section[section.length - 2]
            lastSentence.words = lastSentence.words.concat(sentence.words)
            lastSentence.words.push(word3)
            section.pop()
          }
        }
      }

      const checkSymbol = (post: string, nextSpace: boolean = true) => {
        switch (post) {
          case keyboardMap.Period:
          case keyboardMap.Comma:
          case keyboardMap.Slash:
          case keyboardMap.Exclamation:
            sentence.words[sentence.words.length - 1].nextSpace = false
            let word2 = cloneDeep({
              ...DefaultArticleWord,
              name: post,
              isSymbol: true,
              nextSpace
            });
            sentence.words.push(word2)
            break
          case keyboardMap.QuoteLeft:
          case ')':
            checkQuote(post)
            break
          case `.'`:
          case `!'`:
          case `?'`:
          case `,'`:
          case `*'`:
            post.split('').map(v => {
              checkSymbol(v, false)
            })
            break
          //类似于这种的“' -- ”的。需要保留空格，用了一个占位符才处理，因为每个符号都会把前面的那个字符的nextSpace改为false
          case ' ':
            sentence.words[sentence.words.length - 1].nextSpace = true
            let word3 = cloneDeep({
              ...DefaultArticleWord,
              name: 'placeholder',
              isSymbol: true,
              nextSpace: false,
            });
            sentence.words.push(word3)
            break
          default:
            // console.log('post', post)
            //这里多半是一些奇怪的连接符之类的
            if (post.length > 1) {
              post.split('').map(v => {
                checkSymbol(v, false)
              })
            } else {
              sentence.words[sentence.words.length - 1].nextSpace = false
              let word3 = cloneDeep({
                ...DefaultArticleWord,
                name: post,
                isSymbol: true,
                nextSpace: false,
              });
              sentence.words.push(word3)
            }
            break
        }
      }

      sentenceRow.terms.map(v => {
        // console.log('v', v)
        if (v.text) {
          let pre: string = v.pre.trim()
          if (pre) {
            checkQuote(pre)
          }

          let word = cloneDeep({...DefaultArticleWord, name: v.text, nextSpace: true});
          sentence.words.push(word)

          let post: string = v.post
          //判断是不是等于空，因为正常的词后面都会有个空格。这种不需要处理。
          if (post && post !== ' ') {
            checkSymbol(post)
          }
        }
      })

      //去除空格占位符
      sentence.words = sentence.words.filter(v => v.name !== 'placeholder')
    })
  })

  // sections = sections.filter(sectionItem => sectionItem.length)
  // sections.map((sectionItem, a) => {
  //   sectionItem.map((sentenceItem, b) => {
  //     sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
  //       previousValue += currentValue.name + (currentValue.nextSpace ? ' ' : '')
  //       return previousValue
  //     }, '')
  //   })
  // })
  // console.log(sections)
  // console.timeEnd()
  return {
    newText: text,
    sections
  }
}

export function splitCNArticle(text: string): Sentence[][] {
  // text = "飞机误点了，侦探们在机场等了整整一上午。他们正期待从南非来的一个装着钻石的贵重包裹。数小时以前，有人向警方报告，说有人企图偷走这些钻石。当飞机到达时，一些侦探等候在主楼内，另一些侦探则守候在停机坪上。有两个人把包裹拿下飞机，进了海关。这时两个侦探把住门口，另外两个侦探打开了包裹。令他们吃惊的是，那珍贵的包裹里面装的全是石头和沙子！"
  // text = "那是 4.4 个星期天？而在星期天我是从来不早起的，有时我要一直躺到吃午饭的时候。上个星期天，我起得很晚。我望望窗外，外面一片昏暗。“鬼天气！”我想，“又下雨了。”正在这时，电话铃响了。是我姑母露西打来的。“我刚下火车，”她说，“我这就来看你。”\n    “但我还在吃早饭，”我说。\n    “你在干什么？”她问道。\n    “我正在吃早饭，”我又说了一遍。\n    “天啊，”她说，“你总是起得这么晚吗？现在已经1点钟了！”"
  //去除头和尾部的空格
  text = text.trim()
  let sections: Sentence[][] = []
  text && text.split('\n').map((rowSection, i) => {
    let section: Sentence[] = []
    sections.push(section)
    rowSection = rowSection.trim()
    let sentences = split(rowSection)
    sentences.map(sentenceRow => {
      let row = sentenceRow.raw
      let sentence: Sentence = {
        text: row,
        // text: '',
        translate: '',
        words: []
      }
      section.push(sentence)
      // console.log('s', )
      if (row) {
        //这个库总是会把反引号给断句到下一行
        if (row[0] === "”") {
          sentence.text = row.substr(1)
          let lastSentence = section[section.length - 2]
          lastSentence.text += "”"
          if (!sentence.text) {
            section.pop()
          }
        }
      }
      // console.log('sentence', sentenceRow)
    })
  })
  console.log('sections', sections)
  return sections
}

export function getSplitTranslateText(article: string) {
  let sections = splitCNArticle(article)
  let str = ''
  if (sections.length) {
    sections.map((sectionItem) => {
      sectionItem.map((sentenceItem) => {
        str += sentenceItem.text + '\n'
      })
      str += '\n'
    })
  }
  return str
}

