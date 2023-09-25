import {v4 as uuidv4} from 'uuid';

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
    publicDict = 'publicDict',
    customDict = 'customDict',
    publicArticle = 'publicArticle',
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
    id: uuidv4(),
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

export interface Dict {
    name: string,
    sort: Sort,
    type: DictType,
    originWords: Word[],//原始单词
    words: Word[],
    chapterWordNumber: number,//章节单词数量
    chapterWords: Word[][],
    articles: Article[],
    chapterIndex: number,
    chapterWordIndex: number,
    statistics: Statistics[],
    url: string,
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