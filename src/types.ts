export type Config = {
  newWords: Word[],
  skipWords: Word[],
  skipWordNames: string[],
  dict: string,
  currentDict: {
    wordList: Word[],
    chapterList: Word[][],
    name: string,
    desc: string
  }
  chapterIndex: number,
  wordIndex: number,
}
export type Word = {"name": string, "usphone": string, "ukphone": string, "trans": string[]}

export const SaveKey = 'bb-word-config'

export const PronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type PronunciationType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja' | 'de'
export type PhoneticType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja' | 'de'
export type LanguageType = 'en' | 'romaji' | 'zh' | 'ja' | 'code' | 'de'
export type LanguageCategoryType = 'en' | 'ja' | 'de' | 'code'


export type DictionaryResource = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  length: number
  language: LanguageType
  languageCategory: LanguageCategoryType
  //override default pronunciation when not undefined
  defaultPronIndex?: number
}

export type Dictionary = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  length: number
  language: LanguageType
  languageCategory: LanguageCategoryType
  // calculated in the store
  chapterCount: number
  //override default pronunciation when not undefined
  defaultPronIndex?: number
}

export type PronunciationConfig = {
  name: string
  pron: PronunciationType
}

export type LanguagePronunciationMapConfig = {
  defaultPronIndex: number
  pronunciation: PronunciationConfig[]
}

export type LanguagePronunciationMap = {
  [key in LanguageType]: LanguagePronunciationMapConfig
}

export type SoundResource = {
  key: string
  name: string
  filename: string
}


export interface DictJson {
  name: string,
  description: string,
  category: string,
  tags: string[],
  url: string,
  length: number,
  language: string,
  languageCategory: string,
}

export interface Dict extends DictJson {
  wordList: Word[],
  chapterList: Word[][],
  chapterIndex: number,
  wordIndex: number,
}

export interface State {
  newWordDict: {
    wordList: Word[],
    chapterList: Word[][],
    chapterIndex: number,
    wordIndex: number,
  },
  skipWordDict: {
    wordList: Word[],
    chapterList: Word[][],
    chapterIndex: number,
    wordIndex: number,
  },
  dict: Dict,
  currentDictType: {
    name: 'newWordDict' | 'skipWordDict' | 'inner' | 'custom',
    dictUrl: string
  }
  sideIsOpen: boolean,
}