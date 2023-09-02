import {Sentence} from "@/components/TypeArticle.vue";

interface KeyboardMap {
  Period: string,
  Comma: string,
  Slash: string,
  Exclamation: string,
  Quote: string,
}

export const CnKeyboardMap: KeyboardMap = {
  Period: '。',
  Comma: '，',
  Slash: '？',
  Exclamation: '！',
  Quote: '“',
}
export const EnKeyboardMap: KeyboardMap = {
  Period: '.',
  Comma: ',',
  Slash: '?',
  Exclamation: '!',
  Quote: '"',
}

export function useSplitArticle(article: string, lang: string = 'en', keyboardMap: KeyboardMap = EnKeyboardMap): Sentence[][] {
  let sections = []
  let section = []
  let sentence = {
    sentence: '',
    words: []
  }
  let sentences = []
  let word = '';
  // console.log(article,)
  //加\n用于添加最后一段
  article += '\n'
  if (lang === 'en') {
    article = article.replaceAll(`‘`, '"')
    article = article.replaceAll(`’`, '"')
    article = article.replaceAll(`“`, '"')
    article = article.replaceAll(`”`, '"')
  }
  // console.log('article', article)

  article.split('').map(v => {
    switch (v) {
      case ' ':
        sentence.words.push(word)
        word = ''
        break
      case keyboardMap.Period:
      case keyboardMap.Comma:
      case keyboardMap.Slash:
      case keyboardMap.Exclamation:
        word += v
        sentence.words.push(word)
        sentence.words = sentence.words.filter(v => v)
        sentence.sentence = sentence.words.join(' ')
        sentences.push({
          target: sentence.sentence,
          trans: '',
          location: `${sections.length}-${section.length}`
        })
        // sentence.words.push(word)
        // sentence.words = sentence.words.filter(v => v)
        // sentence.sentence = sentence.words.join(' ')
        // sentence.sentence += v
        // sentence.words.push(v)
        section.push(sentence)
        sentence = {
          sentence: '',
          words: []
        }
        word = ''
        break
      case keyboardMap.Quote:
        let lastSentence = {
          sentence: '',
          words: []
        }
        if (section.length) {
          lastSentence = section[section.length - 1]
        } else {
          let lastSection = sections[sections.length - 1]
          lastSentence = lastSection[lastSection.length - 1]
        }
        if (lastSentence.sentence.includes(keyboardMap.Quote)) {
          lastSentence.sentence += keyboardMap.Quote
          lastSentence.words[lastSentence.words.length - 1] += keyboardMap.Quote
        } else {
          word += v
        }
        // console.log('lastSentence', lastSentence)
        break
      case '\n':
        if (section.length) {
          sections.push(section)
          section = []
          sentence = {
            sentence: '',
            words: []
          }
          word = ''
        }
        break
      default:
        word += v
        break
    }
  })
  if (!sections.length && section.length) {
    sections.push(section)
  }

  return sections
}