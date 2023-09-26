import {DefaultArticleWord, Sentence, Word} from "@/types.ts";
import {cloneDeep, indexOf} from "lodash-es";
import {split} from 'sentence-splitter'
import tokenizer from 'sbd'

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
  text = text.replaceAll(`"S`, `'S`)
  text = text.replaceAll(`"m`, `'m`)
  text = text.replaceAll(`"d`, `'d`)
  text = text.replaceAll(`"ve`, `'ve`)
  text = text.replaceAll(`"clock`, `'clock`)
  console.log('splitEnArticle', text)
  // console.log('splitEnArticle length', text.length)

  text.split('').map((v, i, arr) => {
    // if (i > 2306) debugger
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
        let nearSymbolPosition = null
        let indexs = {
          a: -1,
          b: -1,
          c: -1
        }
        //TODO 可以优化成for+break
        sections.toReversed().map((sectionItem, a) => {
          sectionItem.toReversed().map((sentenceItem, b) => {
            sentenceItem.words.toReversed().map((wordItem, c) => {
              if (wordItem.symbolPosition !== '' && nearSymbolPosition === null) {
                nearSymbolPosition = wordItem.symbolPosition
                indexs = {a, b, c}
              }
            })
          })
        })

        if (nearSymbolPosition === 'end' || nearSymbolPosition === null) {
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
        //如果是空行，就删除
        if (!sentence.words.length) {
          section.pop()
          sentence = section[section.length - 1]
        }
        //判断name有没有值，有值说明最后一句没有结束符，正常来说一句话以句号或逗号结尾
        if (word.name.length) {
          sentence.words.push(word)
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
        // if (v === '2')debugger
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
        //如果是空行，就删除
        if (!sentence.words.length) {
          section.pop()
          sentence = section[section.length - 1]
        }
        //判断name有没有值，有值说明最后一句没有结束符，正常来说一句话以句号或逗号结尾
        if (word.name.length) {
          sentence.words.push(word)
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

export function splitEnArticle2(text: string) {
  let keyboardMap = EnKeyboardMap
  text = "On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration. It was Sunday? I never get up early on Sundays! I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again.' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train,' she said. 'I'm coming to see you.'\n    'But I'm still having breakfast,' I said\n    'What are you doing?' she asked.\n    'I'm having breakfast,' I repeated.\n    'Dear me,' she said. 'Do you always get up so late? It's one o'clock!'"
  //去除头和尾部的空格
  text = text.trim()
  // text = text.replaceAll(`‘`, '"')
  // text = text.replaceAll(`’`, '"')
  // text = text.replaceAll(`“`, '"')
  // text = text.replaceAll(`”`, '"')
  // 替换所有单引号为双引号
  // text = text.replaceAll(`'`, '"')
  // 将缩写词的双引号替换回单引号
  // text = text.replaceAll(`"t`, `'t`)
  // text = text.replaceAll(`"s`, `'s`)
  // text = text.replaceAll(`"S`, `'S`)
  // text = text.replaceAll(`"m`, `'m`)
  // text = text.replaceAll(`"d`, `'d`)
  // text = text.replaceAll(`"ve`, `'ve`)
  // text = text.replaceAll(`"re`, `'re`)
  // text = text.replaceAll(`"clock`, `'clock`)
  // console.log('splitEnArticle', text)

  let optional_options = {newline_boundaries: true};
  let sentences = tokenizer.sentences(text, optional_options);
  console.log(sentences);

  let sections: Sentence[][] = []
  text.split('\n').map((rowSection, i) => {
    rowSection = rowSection.trim()
    // console.log(split(rowSection,{
    //   SeparatorParser:{
    //     separatorCharacters:['.']
    //   }
    // }))
    return
    // let section: Sentence[] = []
    // sections.push(section)
    //
    // // console.log('rowSection', rowSection)
    // rowSection.split('.').map((rowSentence, j) => {
    //
    //   rowSentence = rowSentence.trim()
    //   if (rowSentence) {
    //     //如果以.结尾，那么最后一项为空，忽略
    //     // if (rowSentence && rowSentence[rowSentence.length - 1] !== "'") {
    //     //   rowSentence += '.'
    //     // }
    //     if (rowSentence === '"') {
    //       let lastSentence = section[section.length - 1]
    //       lastSentence.text += '"'
    //     } else {
    //       console.log('rowSentence', rowSentence)
    //       rowSentence += '.'
    //       let sentence: Sentence = {
    //         text: rowSentence,
    //         translate: '',
    //         words: []
    //       }
    //       section.push(sentence)
    //     }
    //
    //     // rowSentence.split('').map((v, i, arr) => {
    //     //
    //     // })
    //     // let word = cloneDeep({...DefaultArticleWord, name: '', nextSpace: true});
    //     // rowSentence.split('').map((v, i, arr) => {
    //     //   switch (v) {
    //     //     case ' ':
    //     //       if (word.name) {
    //     //         sentence.words.push(word)
    //     //         word = cloneDeep(DefaultArticleWord)
    //     //       }
    //     //       break
    //     //     case keyboardMap.Period:
    //     //       word.nextSpace = false
    //     //       sentence.words.push(word)
    //     //       sentence.words.push(cloneDeep({...DefaultArticleWord, name: v, nextSpace: true, isSymbol: true}))
    //     //       word = cloneDeep(DefaultArticleWord)
    //     //       break
    //     //     case keyboardMap.Comma:
    //     //     case keyboardMap.Slash:
    //     //     case keyboardMap.Exclamation:
    //     //       word.nextSpace = false
    //     //       sentence.words.push(word)
    //     //       sentence.words.push(cloneDeep({...DefaultArticleWord, name: v, nextSpace: true, isSymbol: true}))
    //     //       section.push({
    //     //         text: '',
    //     //         translate: '',
    //     //         words: []
    //     //       })
    //     //       sentence = section[section.length - 1]
    //     //       word = cloneDeep(DefaultArticleWord)
    //     //       break
    //     //     case keyboardMap.QuoteLeft:
    //     //       let nearSymbolPosition = null
    //     //       //TODO 可以优化成for+break
    //     //       section.toReversed().map((sentenceItem, b) => {
    //     //         sentenceItem.words.toReversed().map((wordItem, c) => {
    //     //           if (wordItem.symbolPosition !== '' && nearSymbolPosition === null) {
    //     //             nearSymbolPosition = wordItem.symbolPosition
    //     //           }
    //     //         })
    //     //       })
    //     //
    //     //       if (nearSymbolPosition === 'end' || nearSymbolPosition === null) {
    //     //         sentence.words.push(cloneDeep({
    //     //           ...DefaultArticleWord,
    //     //           name: v,
    //     //           nextSpace: false,
    //     //           isSymbol: true,
    //     //           symbolPosition: 'start'
    //     //         }))
    //     //         word = cloneDeep(DefaultArticleWord)
    //     //       } else {
    //     //         let addCurrent = false
    //     //         sentence.words.toReversed().map((wordItem, c) => {
    //     //           if (wordItem.symbolPosition === 'start' && !addCurrent) {
    //     //             addCurrent = true
    //     //           }
    //     //         })
    //     //         if (addCurrent) {
    //     //           //`“这是私人谈话”`这种没有结束符号的情况，swtich走不到结束符号，也就不会起新的一行
    //     //           if (word.name.length) {
    //     //             sentence.words.push(word)
    //     //           }
    //     //           sentence.words.push(cloneDeep({
    //     //             ...DefaultArticleWord,
    //     //             name: v,
    //     //             nextSpace: true,
    //     //             isSymbol: true,
    //     //             symbolPosition: 'end'
    //     //           }))
    //     //           word = cloneDeep(DefaultArticleWord)
    //     //         } else {
    //     //           debugger
    //     //           let lastSentence = section[section.length - 2]
    //     //           lastSentence.words[lastSentence.words.length - 1].nextSpace = false
    //     //           lastSentence.words.push(cloneDeep({
    //     //             ...DefaultArticleWord,
    //     //             name: v,
    //     //             nextSpace: true,
    //     //             isSymbol: true,
    //     //             symbolPosition: 'end'
    //     //           }))
    //     //         }
    //     //       }
    //     //       break
    //     //     default:
    //     //       // if (v === '2')debugger
    //     //       word.name += v
    //     //       break
    //     //   }
    //     // })
    //
    //   }
    // })
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
  // console.log('--')
  //
  // console.log(split(`'What a day!' I thought.`,{
  //   SeparatorParser:{
  //     separatorCharacters:['!']
  //   }
  // }))
  // console.log('--')
  // console.log(split(`On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration.`,))
}
