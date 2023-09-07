export type Word = {
  "name": string,
  "usphone": string,
  "ukphone": string,
  "trans": string[]
}

export const DefaultWord: Word = {
  name: '',
  usphone: '',
  ukphone: '',
  trans: []
}

export const SaveKey = 'type-word-config'

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
  description: string,
  category: string,
  tags: string[],
  url: string,
  length: number,
  language: string,
  languageCategory: string,
}

export enum DictType {
  newDict = 'newDict',
  skipDict = 'skipDict',
  wrongDict = 'wrongDict',
  innerDict = 'innerDict',
  customDict = 'customDict',
}


export interface Sentence {
  sentence: string,
  words: string[]
}

export interface Article {
  article: string,
  articleTranslate: string,
  newWords: Word[],
  articleAllWords: string[],
  sections: Sentence[][],
  translate: {
    sentence: string,
    location: string
  }[],
}

export interface Dict {
  name: string,
  sort: Sort,
  type: DictType,
  originWords: Word[],//原始单词
  words: Word[],
  chapterWordNumber: number,//章节单词数量
  chapterWords: Word[][],
  // articles: Article[],
  chapterIndex: number,
  chapterWordIndex: number,
  statistics: Statistics[],
  url: string,
}

export interface Statistics {
  startDate: number,//开始日期
  endDate: number//结束日期
  spend: number,//花费时间
  wordNumber: number//单词数量
  correctRate: number//正确率
  wrongWordNumber: number//错误数
}

export const DefaultStatistics: Statistics = {
  startDate: Date.now(),
  endDate: -1,
  spend: -1,
  wordNumber: -1,
  correctRate: -1,
  wrongWordNumber: -1,
}

export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2
}

export interface State {
  newWordDict: Dict,
  skipWordDict: Dict,
  wrongWordDict: Dict,
  dict: Dict,
  oldDicts: Dict[],
  current: {
    dictType: DictType,
    words: Word[],
    index: number,
    wrongWords: Word[],
    originWrongWords: Word[],
    repeatNumber: number,
    statistics: Statistics
  },
  simpleWords: string[],
  sideIsOpen: boolean,
  isDictation: boolean,
  theme: string,
  setting: {
    showToolbar: boolean,
    show: boolean,
    value1: boolean,
    value2: number,
    value3: number,
    value4: boolean,
  }
}

export const ShortKeyMap = {
  Show: 'Escape',
  Ignore: 'Tab',
  Remove: '`',
  Collect: 'Enter',
}