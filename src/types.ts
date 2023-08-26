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
export type Word = {
  "name": string,
  "usphone": string,
  "ukphone": string,
  "trans": string[]
}

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

export enum DictType {
  newWordDict = 'newWordDict',
  skipWordDict = 'skipWordDict',
  allWrongDict = 'allWrongDict',
  currentWrongDict = 'currentWrongDict',
  inner = 'inner',
  custom = 'custom',
}

export interface Dict extends DictJson {
  sort: Sort,
  type: DictType,
  wordList: Word[],
  chapterList: Word[][],
  chapterIndex: number,
  wordIndex: number,
  chapterWordNumber: number,
  dictStatistics: DictStatistics[],
  statistics?: Statistics
}

export interface DictStatistics {
  startDate: number,//开始日期
  endDate: number//结束日期
  chapterWordNumber: number//章节单词数量
  statistics: Array<Statistics>
}

export interface Statistics {
  startDate: number,//开始日期
  endDate: number//结束日期
  correctRate: number//正确率
  correctNumber: number//正确数
}

export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2
}

export interface State {
  newWordDict: Dict,
  skipWordDict: Dict,
  allWrongDict: Dict,
  currentWrongDict: Dict,
  dict: Dict,
  oldDicts: Dict[],
  currentDictType: DictType,
  lastDictType: DictType,
  sideIsOpen: boolean,
  statModalIsOpen: boolean,
  isDictation: boolean,
  setting: {
    showToolbar: boolean,
    show: boolean,
    value1: boolean,
    value2: number,
    value3: number,
    value4: boolean,
  }
}