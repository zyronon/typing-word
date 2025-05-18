import {Article, ArticleWord, DefaultArticleWord, DictType, Sentence, TranslateType} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import nlp from "compromise/one";
import {split} from "sentence-splitter";
import {usePlayWordAudio} from "@/hooks/sound.ts";

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
  console.log('splitEnArticle')
  //将中文符号替换
  text = text.replaceAll('’', "'")
  text = text.replaceAll('—', "-")
  text = text.replaceAll('”', '"')
  text = text.replaceAll('“', '"')

  // console.time()
  let keyboardMap = EnKeyboardMap

  let sections: Sentence[][] = []
  text && text.trim().split('\n\n').filter(v => v).map((sectionText, i) => {
    let section: Sentence[] = []
    sections.push(section)
    sectionText = sectionText.trim()

    let doc = nlp(sectionText)
    let sentenceNlpList = []
    // console.log('ss', sentenceNlpList)
    doc.json().map(item => {

      //如果整句大于15个单词以上，检测是否有 逗号子句
      if (item.terms.length > 15) {
        //正则匹配“逗号加and|but|so|because"
        let list = item.text.split(/,\s(?=(and|but|so|because)\b)/).filter(_ => {
          //匹配完之后会把and|but|so|because也提出来，这里不需要重复的，直接筛选掉
          if (_ && !['and', 'but', 'so', 'because'].includes(_)) return _
        })
        if (list.length === 1) {
          sentenceNlpList.push(item)
        } else {
          list.map((text, i) => {
            //分割后每句都没有逗号了，所以除了最后一句外需要加回来
            sentenceNlpList = sentenceNlpList.concat(nlp(text + (i !== list.length - 1 ? ',' : '')).json())
          })
        }
      } else {
        sentenceNlpList.push(item)
      }
    })

    sentenceNlpList.map(item => {
      let sentence: Sentence = cloneDeep({
        //他没有空格，导致修改一行一行的数据时，汇总时全没有空格了，库无法正常断句
        text: item.text + ' ',
        // text: '',
        translate: '',
        words: [],
        audioPosition: [],
      })
      section.push(sentence)

      const checkQuote = (pre: string, index?: number) => {
        let nearSymbolPosition = null
        if (index === 0) {
          nearSymbolPosition = 'end'
        } else {
          //TODO 可以优化成for+break
          section.toReversed().map((sentenceItem, b) => {
            sentenceItem.words.toReversed().map((wordItem, c) => {
              if (wordItem.symbolPosition !== '' && nearSymbolPosition === null) {
                nearSymbolPosition = wordItem.symbolPosition
              }
            })
          })
        }

        let word3: ArticleWord = {
          ...DefaultArticleWord,
          word: pre,
          nextSpace: false,
          isSymbol: true,
          symbolPosition: ''
        };
        // console.log('rrr', item)
        // console.log('nearSymbolPosition', nearSymbolPosition)
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
            // 'Do you always get up so late? It'LICENSE one o'clock!' 会被断成两句
            let lastSentence = section[section.length - 2]
            lastSentence.words = lastSentence.words.concat(sentence.words)
            lastSentence.words.push(word3)
            sentence.words = []
            //这里还不能直接删除sentence，因为后面还有一个  sentence.words = sentence.words.filter(v => v.word !== 'placeholder') 的判断
            // section.pop()
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
              word: post,
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
            // console.log('sentence', sentence)
            //遇到“The clock has stopped!' I looked at my watch.”
            //检测到stopped!' 的'时，如果前引号不在当前句，会把当前句的word合并到前一句。那么当前句的word就为空了，会报错
            //所以需要检测一下
            if (sentence.words.length) {
              sentence.words[sentence.words.length - 1].nextSpace = true
              let word3 = cloneDeep({
                ...DefaultArticleWord,
                word: 'placeholder',
                isSymbol: true,
                nextSpace: false,
              });
              sentence.words.push(word3)
            }
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
                word: post,
                isSymbol: true,
                nextSpace: false,
              });
              sentence.words.push(word3)
            }
            break
        }
      }

      item.terms.map((v, index: number) => {
        // console.log('v', v)
        if (v.text) {
          let pre: string = v.pre.trim()
          if (pre) {
            checkQuote(pre, index)
          }

          let word = cloneDeep({...DefaultArticleWord, word: v.text, nextSpace: true});
          sentence.words.push(word)

          let post: string = v.post
          //判断是不是等于空，因为正常的词后面都会有个空格。这种不需要处理。
          if (post && post !== ' ') {
            checkSymbol(post)
          }
        }
      })

      //去除空格占位符
      sentence.words = sentence.words.filter(v => v.word !== 'placeholder')
      //如果是空的，直接去掉
      if (!sentence.words.length) {
        section.pop()
      }
    })

    // console.log(sentenceNlpList)
  })

  sections = sections.filter(sectionItem => sectionItem.length)
  sections.map((sectionItem, a) => {
    sectionItem.map((sentenceItem, b) => {
      sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
        previousValue += currentValue.word + (currentValue.nextSpace ? ' ' : '')
        return previousValue
      }, '')
    })
  })

  // console.log(sections)

  text = sections.map(v => v.map(s => s.text.trim()).join('\n')).join('\n\n');
  // console.log('s',text)
  return {
    //s.text.trim()的trim()不能去掉，因为这个方法会重复执行，要保证句子后面只有一个\n，不trim() \n就会累加
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
      // console.log('LICENSE', )
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
  // console.log('sections', sections)
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

export function isArticle(type: DictType): boolean {
  return [
    DictType.article,
  ].includes(type)
}

export function getTranslateText(article: Article) {
  if (article.useTranslateType === TranslateType.custom) {

    return article.textCustomTranslate
      .split('\n\n').filter(v => v)
  } else if (article.useTranslateType === TranslateType.network) {
    return article.textNetworkTranslate
      .split('\n\n').filter(v => v)
  } else {
    return []
  }
}

export function usePlaySentenceAudio() {
  const playWordAudio = usePlayWordAudio()
  let timer = $ref(0)

  function playSentenceAudio(sentence: Sentence, ref?: HTMLAudioElement, article?: Article) {
    if (sentence.audioPosition?.length && article.audioSrc && ref) {
      clearTimeout(timer)
      if (ref.played) {
        ref.pause()
      }
      let start = sentence.audioPosition[0];
      ref.currentTime = start
      ref.play()
      let end = sentence.audioPosition?.[1]
      if (end && end !== -1) {
        timer = setTimeout(() => {
          ref.pause()
        }, (end - start) * 1000)
      }
    } else {
      playWordAudio(sentence.text)
    }
  }

  return {
    playSentenceAudio
  }
}