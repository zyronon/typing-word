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


export function splitArticle(article: string, lang: string = 'en', keyboardMap: KeyboardMap = EnKeyboardMap): Sentence[][] {
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
  //加\n用于添加最后一段
  article += '\n'
  if (lang === 'en') {
    article = article.replaceAll(`‘`, '"')
    article = article.replaceAll(`’`, '"')
    article = article.replaceAll(`“`, '"')
    article = article.replaceAll(`”`, '"')
  }

  // console.log('article', article)

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
        section.pop()
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
  sections.map((sectionItem, a) => {
    sectionItem.map((sentenceItem, b) => {
      sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
        previousValue += currentValue.name + (currentValue.nextSpace ? ' ' : '')
        return previousValue
      }, '')
    })
  })
  // if (!sections.length && section.length) {
  //     sections.push(section)
  // }

  return sections
}

export function splitCNArticle(article: string, lang: string = 'en', keyboardMap: KeyboardMap = CnKeyboardMap): Sentence[][] {
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
  //加\n用于添加最后一段
  article += '\n'
  // console.log('article', article)

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

        } else {
          let addCurrent = false
          sentence.words.toReversed().map((wordItem, c) => {
            if (wordItem.symbolPosition === 'start' && !addCurrent) {
              addCurrent = true
            }
          })
          if (addCurrent) {
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
        section.pop()
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
  sections.map((sectionItem, a) => {
    sectionItem.map((sentenceItem, b) => {
      sentenceItem.text = sentenceItem.words.reduce((previousValue: string, currentValue) => {
        previousValue += currentValue.name + (currentValue.nextSpace ? ' ' : '')
        return previousValue
      }, '')
    })
  })
  // if (!sections.length && section.length) {
  //     sections.push(section)
  // }

  return sections
}
