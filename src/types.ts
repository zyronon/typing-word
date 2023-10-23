import bookFlag from "@/assets/img/flags/book.png";
import enFlag from "@/assets/img/flags/en.png";
import jpFlag from "@/assets/img/flags/ja.png";
import deFlag from "./assets/img/flags/de.png";
import codeFlag from "@/assets/img/flags/code.png";

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

export const SaveDictKey = 'typing-word-dict'
export const SaveConfigKey = 'typing-word-config'

export const PronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type TranslateLanguageType = 'en' | 'zh-CN' | 'ja' | 'de' | 'common' | ''
export type LanguageType = 'en' | 'ja' | 'de' | 'code'

export type DictResource = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  url: string
  length: number
  translateLanguage: TranslateLanguageType
  type: DictType
  language: LanguageType
}

export interface Dict {
  id: string,
  name: string,
  sort: Sort,
  originWords: Word[],//原始单词
  words: Word[],
  chapterWordNumber: number,//章节单词数量
  chapterWords: Word[][],
  chapterIndex: number,//章节下标
  wordIndex: number,//单词下标
  articles: Article[],
  statistics: Statistics[],
  resourceId: string,
  type: DictType,
  translateLanguage: TranslateLanguageType
  language: LanguageType
  url: string,
}


export enum DictType {
  new = 'new',
  skip = 'skip',
  wrong = 'wrong',
  word = 'word',
  customWord = 'customWord',
  article = 'article',
  customArticle = 'customArticle'
}

export const DefaultArticleWord: ArticleWord = {
  name: '',
  usphone: '',
  ukphone: '',
  trans: [],
  nextSpace: true,
  isSymbol: false,
  symbolPosition: ''
}

export interface ArticleWord extends Word {
  nextSpace: boolean,
  isSymbol: boolean,
  symbolPosition: 'start' | 'end' | '',
}

export interface Sentence {
  text: string,
  translate: string,
  words: ArticleWord[]
}

export enum TranslateType {
  custom = 'custom',
  network = 'network',
  none = 'none'
}

export interface Article {
  id: string,
  title: string,
  titleTranslate: string,
  text: string,
  textFormat: string,
  textCustomTranslate: string,
  textCustomTranslateIsFormat: boolean,//翻译是否格式化
  textNetworkTranslate: string,
  newWords: Word[],
  textAllWords: string[],
  sections: Sentence[][],
  useTranslateType: TranslateType
}

export const DefaultArticle: Article = {
  // id: uuidv4(),
  id: '',
  title: '',
  titleTranslate: '',
  text: '',
  textFormat: '',
  textCustomTranslate: '',
  textNetworkTranslate: '',
  textCustomTranslateIsFormat: false,
  newWords: [],
  textAllWords: [],
  sections: [],
  useTranslateType: TranslateType.network
}

export interface Statistics {
  startDate: number,//开始日期
  endDate: number//结束日期
  spend: number,//花费时间
  total: number//单词数量
  wrongWordNumber: number//错误数
  correctRate: number//正确率
}

export interface DisplayStatistics extends Statistics {
  wrongWords: Word[]
}

export const DefaultDisplayStatistics: DisplayStatistics = {
  startDate: Date.now(),
  endDate: -1,
  spend: -1,
  total: -1,
  correctRate: -1,
  wrongWordNumber: -1,
  wrongWords: [],
}

export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2
}

export const ShortKeyMap = {
  Show: 'Escape',
  Ignore: 'Tab',
  Remove: '`',
  Collect: 'Enter',
}

export enum TranslateEngine {
  Baidu = 0,
}

export const languageCategoryOptions = [
  {id: 'article', name: '文章', flag: bookFlag},
  {id: 'en', name: '英语', flag: enFlag},
  {id: 'ja', name: '日语', flag: jpFlag},
  {id: 'de', name: '德语', flag: deFlag},
  {id: 'code', name: 'Code', flag: codeFlag},
]

export const DefaultDict: Dict = {
  id: '',
  name: '',
  sort: Sort.normal,
  originWords: [],//原始单词
  words: [],
  chapterWordNumber: 30,//章节单词数量
  chapterWords: [],
  chapterIndex: 0,//章节下标
  wordIndex: 0,//单词下标
  articles: [],
  statistics: [],
  resourceId: '',
  type: DictType.word,
  translateLanguage: 'common',
  language: 'en',
  url: '',
}