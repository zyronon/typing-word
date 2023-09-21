import {DefaultArticleWord, Sentence, Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";

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
  QuoteLeft: '"',
  QuoteRight: '"',
}

export function splitEnArticle(text: string, lang: string = 'en', keyboardMap: KeyboardMap = EnKeyboardMap): {
  sections: Sentence[][],
  newText: string
} {
  let sections: Sentence[][] = []
  let section: Sentence[] = []
  let sentence: Sentence = {
    text: '',
    translate: '',
    words: []
  }
  section.push(sentence)
  sections.push(section)
  let word = cloneDeep({...DefaultArticleWord, name: '', nextSpace: true});

  //去除头和尾部的空格
  text = text.trim()
  //加\n用于添加最后一段
  text += '\n'
  text = text.replaceAll(`‘`, '"')
  text = text.replaceAll(`’`, '"')
  text = text.replaceAll(`“`, '"')
  text = text.replaceAll(`”`, '"')
  //替换所有单引号为双引号
  text = text.replaceAll(`'`, '"')
  //将缩写词的双引号替换回单引号
  text = text.replaceAll(`"t`, `'t`)
  text = text.replaceAll(`"s`, `'s`)

  text.split('').map((v, i, arr) => {
    switch (v) {
      case ' ':
        if (word.name) {
          sentence.words.push(word)
          word = cloneDeep(DefaultArticleWord)
        }
        break
      case keyboardMap.Period:
      case keyboardMap.Comma:
      case keyboardMap.Slash:
      case keyboardMap.Exclamation:
        word.nextSpace = false
        sentence.words.push(word)
        sentence.words.push(cloneDeep({...DefaultArticleWord, name: v, nextSpace: true, isSymbol: true}))
        section.push({
          text: '',
          translate: '',
          words: []
        })
        sentence = section[section.length - 1]
        word = cloneDeep(DefaultArticleWord)
        break
      case keyboardMap.QuoteLeft:
        let symbolPosition = null
        let indexs = {
          a: -1,
          b: -1,
          c: -1
        }
        //TODO 可以优化成for+break
        sections.toReversed().map((sectionItem, a) => {
          sectionItem.toReversed().map((sentenceItem, b) => {
            sentenceItem.words.toReversed().map((wordItem, c) => {
              if (wordItem.symbolPosition !== '' && symbolPosition === null) {
                symbolPosition = wordItem.symbolPosition === 'end'
                indexs = {a, b, c}
              }
            })
          })
        })

        if (symbolPosition || symbolPosition === null) {
          sentence.words.push(cloneDeep({
            ...DefaultArticleWord,
            name: v,
            nextSpace: false,
            isSymbol: true,
            symbolPosition: 'start'
          }))
          word = cloneDeep(DefaultArticleWord)
        } else {
          let addCurrent = false
          sentence.words.toReversed().map((wordItem, c) => {
            if (wordItem.symbolPosition === 'start' && !addCurrent) {
              addCurrent = true
            }
          })
          if (addCurrent) {
            //`“这是私人谈话”`这种没有结束符号的情况，swtich走不到结束符号，也就不会起新的一行
            if (word.name.length) {
              sentence.words.push(word)
            }
            sentence.words.push(cloneDeep({
              ...DefaultArticleWord,
              name: v,
              nextSpace: true,
              isSymbol: true,
              symbolPosition: 'end'
            }))
            word = cloneDeep(DefaultArticleWord)
          } else {
            let lastSentence = section[section.length - 2]
            lastSentence.words[lastSentence.words.length - 1].nextSpace = false
            lastSentence.words.push(cloneDeep({
              ...DefaultArticleWord,
              name: v,
              nextSpace: true,
              isSymbol: true,
              symbolPosition: 'end'
            }))
          }
        }

        break
      case '\n':
        if (!sentence.words.length) {
          section.pop()
        }
        if (i !== arr.length - 1) {
          sections.push([])
          section = sections[sections.length - 1]
          section.push({
            text: '',
            translate: '',
            words: []
          })
          sentence = section[section.length - 1]
          word = cloneDeep(DefaultArticleWord)
        }
        break
      default:
        word.name += v
        break
    }
  })
  sections = sections.filter(sectionItem => sectionItem.length)
  sections.map((sectionItem, a) => {
    sectionItem.map((sentenceItem, b) => {
      sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
        previousValue += currentValue.name + (currentValue.nextSpace ? ' ' : '')
        return previousValue
      }, '')
    })
  })
  return {
    newText: text,
    sections
  }
}

export function splitCNArticle(article: string, lang: string = 'cn', keyboardMap: KeyboardMap = CnKeyboardMap): Sentence[][] {
  let sections: Sentence[][] = []
  let section: Sentence[] = []
  let sentence: Sentence = {
    text: '',
    translate: '',
    words: []
  }
  section.push(sentence)
  sections.push(section)
  let word = cloneDeep({...DefaultArticleWord, name: '', nextSpace: true});
  //去除头和尾部的空格
  article = article.trim()
  //加\n用于添加最后一段
  article += '\n'
  // console.log('articles', articles)

  article.split('').map((v, i, arr) => {
    switch (v) {
      case ' ':
        if (word.name) {
          sentence.words.push(word)
          word = cloneDeep(DefaultArticleWord)
        }
        break
      case keyboardMap.Period:
      case keyboardMap.Comma:
      case keyboardMap.Slash:
      case keyboardMap.Exclamation:
        word.nextSpace = false
        sentence.words.push(word)
        sentence.words.push(cloneDeep({...DefaultArticleWord, name: v, nextSpace: true}))
        section.push({
          text: '',
          translate: '',
          words: []
        })
        sentence = section[section.length - 1]
        word = cloneDeep(DefaultArticleWord)
        break
      case keyboardMap.QuoteLeft:
        sentence.words.push(cloneDeep({
          ...DefaultArticleWord,
          name: v,
          nextSpace: false,
          isSymbol: true,
          symbolPosition: 'start'
        }))
        word = cloneDeep(DefaultArticleWord)
        break
      case keyboardMap.QuoteRight:
        let nearSymbolPosition = null
        //TODO 可以优化成for+break
        sections.toReversed().map((sectionItem, a) => {
          sectionItem.toReversed().map((sentenceItem, b) => {
            sentenceItem.words.toReversed().map((wordItem, c) => {
              if (wordItem.symbolPosition !== '' && nearSymbolPosition === null) {
                nearSymbolPosition = wordItem.symbolPosition
              }
            })
          })
        })

        if (nearSymbolPosition === 'start' || nearSymbolPosition === null) {
          let addCurrent = false
          sentence.words.toReversed().map((wordItem, c) => {
            if (wordItem.symbolPosition === 'start' && !addCurrent) {
              addCurrent = true
            }
          })
          if (addCurrent) {
            //`“这是私人谈话”`这种没有结束符号的情况，swtich走不到结束符号，也就不会起新的一行
            if (word.name.length) {
              sentence.words.push(word)
            }
            sentence.words.push(cloneDeep({
              ...DefaultArticleWord,
              name: v,
              nextSpace: true,
              isSymbol: true,
              symbolPosition: 'end'
            }))
            word = cloneDeep(DefaultArticleWord)
          } else {
            let lastSentence = section[section.length - 2]
            lastSentence.words[lastSentence.words.length - 1].nextSpace = false
            lastSentence.words.push(cloneDeep({
              ...DefaultArticleWord,
              name: v,
              nextSpace: true,
              isSymbol: true,
              symbolPosition: 'end'
            }))
          }
        }
        break
      case '\n':
        if (!sentence.words.length) {
          section.pop()
        }
        if (i !== arr.length - 1) {
          sections.push([])
          section = sections[sections.length - 1]
          section.push({
            text: '',
            translate: '',
            words: []
          })
          sentence = section[section.length - 1]
          word = cloneDeep(DefaultArticleWord)
        }
        break
      default:
        word.name += v
        break
    }
  })
  // console.log(cloneDeep(sections))
  sections = sections.filter(sectionItem => sectionItem.length)
  sections.map((sectionItem, a) => {
    sectionItem.map((sentenceItem, b) => {
      sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
        previousValue += currentValue.name + (currentValue.nextSpace ? ' ' : '')
        return previousValue
      }, '')
    })
  })

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

