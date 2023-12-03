import bookFlag from "@/assets/img/flags/book.png";
import enFlag from "@/assets/img/flags/en.png";
import jpFlag from "@/assets/img/flags/ja.png";
import deFlag from "./assets/img/flags/de.png";
import codeFlag from "@/assets/img/flags/code.png";
import myFlag from "@/assets/img/flags/my.png";
import {DefaultChapterWordNumber} from "@/stores/setting.ts";

export type Word = {
  "name": string,
  "usphone": string,
  "ukphone": string,
  "trans": string[]
  checked?: boolean,
  id?: any,
}

export const DefaultWord: Word = {
  name: '',
  usphone: '',
  ukphone: '',
  trans: []
}

export const PronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type TranslateLanguageType = 'en' | 'zh-CN' | 'ja' | 'de' | 'common' | ''
export type LanguageType = 'en' | 'ja' | 'de' | 'code'

export type DictResource = {
  id: string
  name: string
  description: string
  url: string
  length: number
  category: string
  tags: string[]
  translateLanguage: TranslateLanguageType
  type: DictType
  language: LanguageType
}


export enum DictType {
  collect = 'collect',
  simple = 'simple',
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
  textCustomTranslate: string,
  textCustomTranslateIsFormat: boolean,//翻译是否格式化
  textNetworkTranslate: string,
  newWords: Word[],
  textAllWords: string[],
  sections: Sentence[][],
  useTranslateType: TranslateType
}

export const DefaultArticle: Article = {
  // id: nanoid(6),
  id: '',
  title: '',
  titleTranslate: '',
  text: '',
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
  inputWordNumber: number//输入数
}

export const DefaultDisplayStatistics: DisplayStatistics = {
  startDate: Date.now(),
  endDate: -1,
  spend: -1,
  total: -1,
  correctRate: -1,
  wrongWordNumber: -1,
  inputWordNumber: -1,
  wrongWords: [],
}

export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2
}

export const ShortcutKeyMap = {
  Show: 'Escape',
  Ignore: 'Tab',
  Remove: '`',
  Collect: 'Enter',
}

export const SaveDict = {
  key: 'typing-word-dict',
  version: 3
}
export const SaveConfig = {
  key: 'typing-word-config',
  version: 8
}

export enum ShortcutKey {
  ShowWord = 'ShowWord',
  EditArticle = 'EditArticle',
  Next = 'Next',
  Previous = 'Previous',
  ToggleSimple = 'ToggleSimple',
  ToggleCollect = 'ToggleCollect',
  NextChapter = 'NextChapter',
  PreviousChapter = 'PreviousChapter',
  RepeatChapter = 'RepeatChapter',
  DictationChapter = 'DictationChapter',
  PlayWordPronunciation = 'PlayWordPronunciation',
  // PlayTranslatePronunciation = 'PlayTranslatePronunciation',
  ToggleShowTranslate = 'ToggleShowTranslate',
  ToggleDictation = 'ToggleDictation',
  OpenSetting = 'OpenSetting',
  OpenDictDetail = 'OpenDictDetail',
  ToggleTheme = 'ToggleTheme',
  ToggleConciseMode = 'ToggleConciseMode',
  TogglePanel = 'TogglePanel'
}

export const DefaultShortcutKeyMap = {
  [ShortcutKey.EditArticle]: 'Ctrl+E',
  [ShortcutKey.ShowWord]: 'Escape',
  [ShortcutKey.Previous]: 'Alt+⬅',
  [ShortcutKey.Next]: 'Tab',
  [ShortcutKey.ToggleSimple]: '`',
  [ShortcutKey.ToggleCollect]: 'Enter',
  [ShortcutKey.PreviousChapter]: 'Ctrl+⬅',
  [ShortcutKey.NextChapter]: 'Ctrl+➡',
  [ShortcutKey.RepeatChapter]: 'Ctrl+Enter',
  [ShortcutKey.DictationChapter]: 'Alt+Enter',
  [ShortcutKey.PlayWordPronunciation]: 'Ctrl+P',
  // [ShortcutKey.PlayTranslatePronunciation]: 'Ctrl+O',
  [ShortcutKey.ToggleShowTranslate]: 'Ctrl+Z',
  [ShortcutKey.ToggleDictation]: 'Ctrl+I',
  [ShortcutKey.OpenSetting]: 'Ctrl+S',
  [ShortcutKey.ToggleTheme]: 'Ctrl+Q',
  [ShortcutKey.OpenDictDetail]: 'Ctrl+J',
  [ShortcutKey.ToggleConciseMode]: 'Ctrl+M',
  [ShortcutKey.TogglePanel]: 'Ctrl+L',
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
  {id: 'my', name: '我的', flag: myFlag},
]

export const DefaultDict: Dict = {
  id: '',
  name: '',
  description: '',
  sort: Sort.normal,
  originWords: [],//原始单词
  words: [],
  chapterWordNumber: DefaultChapterWordNumber,//章节单词数量
  chapterWords: [],
  residueWords: [],//未分配单词
  chapterIndex: 0,//章节下标
  wordIndex: 0,//单词下标
  articles: [],
  statistics: [],
  isCustom: false,
  length: 0,
  /*资源属性*/
  resourceId: '',
  url: '',
  category: '',
  tags: [],
  translateLanguage: 'common',
  type: DictType.customWord,
  language: 'en',
}

export interface Dict {
  id: string,
  name: string,
  description: string,
  sort: Sort,
  originWords: Word[],//原始单词
  words: Word[],
  chapterWordNumber: number,//章节单词数量
  chapterWords: Word[][],
  residueWords: Word[],
  chapterIndex: number,//章节下标
  wordIndex: number,//单词下标
  articles: Article[],
  statistics: Statistics[],
  isCustom: boolean,
  length: number,
  /*资源属性*/
  resourceId: string,
  category: string
  tags: string[]
  language: LanguageType
  type: DictType
  translateLanguage: TranslateLanguageType
  url: string,
}

export interface ArticleItem {
  item: Article,
  index: number
}

export interface WordItem {
  item: Article,
  index: number
}

