import {defineStore} from 'pinia'
import {Article, DefaultDict, Dict, DictType, DisplayStatistics, Sort, Word} from "../types.ts"
import {chunk, cloneDeep, merge, reverse, shuffle} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {useRuntimeStore} from "@/stores/runtime.ts";
import * as localforage from "localforage";
import {nanoid} from "nanoid";
import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {checkAndUpgradeSaveDict, getDictFile} from "@/utils";

export interface BaseState {
  myDictList: Dict[],
  collectDictIds: string[],
  current: {
    index: number,
    practiceType: DictType,//练习类型，目前仅词典为collect时判断是练单词还是文章使用
  },
  simpleWords: string[],
  load: boolean

  collectArticle?: Article[],
  collectWord?: Word[],
  simple2?: Word[],
  wrong2?: Word[],
  articleDictList?: Dict[]
  wordDictList?: Dict[],
  currentStudy?: {
    word: {
      dictIndex: number,
      perDayStudyNumber: number,
      lastLearnIndex: number,
    },
    article: {
      dictIndex: number,
      lastLearnIndex: number,
    }
  }
}

export const DefaultBaseState = (): BaseState => ({
  collectWord: [],
  collectArticle: [],
  simple2: [],
  wrong2: [],
  articleDictList: [
    {
      ...cloneDeep(DefaultDict),
      id: 'article_nce2',
      name: "新概念英语2-课文",
      description: '新概念英语2-课文',
      category: '英语学习',
      tags: ['新概念英语'],
      url: 'NCE_2.json',
      translateLanguage: 'common',
      language: 'en',
      type: DictType.article,
      resourceId: 'article_nce2',
      length: 96
    },
  ],
  wordDictList: [
    {
      ...cloneDeep(DefaultDict),
      id: 'cet4',
      name: 'CET-4',
      description: '大学英语四级词库',
      category: '中国考试',
      tags: ['大学英语'],
      url: 'CET4_T.json',
      length: 2607,
      translateLanguage: 'common',
      language: 'en',
      type: DictType.word
    },
  ],
  currentStudy: {
    word: {
      dictIndex: 0,
      perDayStudyNumber: 30,
      lastLearnIndex: 0,
    },
    article: {
      dictIndex: 0,
      lastLearnIndex: 0,
    },
  },

  myDictList: [
    {
      ...cloneDeep(DefaultDict),
      id: 'collect',
      name: '收藏',
      type: DictType.collect,
      category: '自带字典',
      tags: ['自带'],
      isCustom: true,
    },
    {
      ...cloneDeep(DefaultDict),
      id: 'skip',
      name: '简单词',
      type: DictType.simple,
      category: '自带字典',
      isCustom: true,
    },
    {
      ...cloneDeep(DefaultDict),
      id: 'wrong',
      name: '错词本',
      type: DictType.wrong,
      category: '自带字典',
      isCustom: true,
    },
    {
      ...cloneDeep(DefaultDict),
      id: 'cet4',
      name: 'CET-4',
      description: '大学英语四级词库',
      category: '中国考试',
      tags: ['大学英语'],
      url: 'CET4_T.json',
      length: 2607,
      translateLanguage: 'common',
      language: 'en',
      type: DictType.word
    },
    {
      ...cloneDeep(DefaultDict),
      id: 'article_nce2',
      name: "新概念英语2-课文",
      description: '新概念英语2-课文',
      category: '英语学习',
      tags: ['新概念英语'],
      url: 'NCE_2.json',
      translateLanguage: 'common',
      language: 'en',
      type: DictType.article,
      resourceId: 'article_nce2',
      length: 96
    },
    // {
    //   ...cloneDeep(DefaultDict),
    //   id: 'nce-new-2',
    //   name: '新概念英语(新版)-2',
    //   description: '新概念英语新版第二册',
    //   category: '青少年英语',
    //   tags: ['新概念英语'],
    //   url: 'nce-new-2.json',
    //   translateLanguage: 'common',
    //   language: 'en',
    //   type: DictType.word,
    //   resourceId: 'nce-new-2',
    //   length: 862
    // },
  ],
  collectDictIds: [],
  current: {
    index: 4,
    // dictType: DictType.article,
    // dictIndex: 0,
    practiceType: DictType.article,
  },
  simpleWords: [
    'a', 'an',
    'i', 'my', 'you', 'your', 'me', 'it',
    'what', 'who', 'where', 'how', 'when', 'which',
    'be', 'am', 'is', 'do', 'are', 'did', 'were', 'was', 'can', 'could', 'will', 'would',
    'the', 'that', 'this', 'to', 'of', 'for', 'and', 'at', 'not', 'no', 'yes',
  ],
  load: false
})

export const useBaseStore = defineStore('base', {
  state: (): BaseState => {
    return DefaultBaseState()
  },
  getters: {
    collect(): Dict {
      return this.myDictList[0]
    },
    simple(): Dict {
      return this.myDictList[1]
    },
    wrong(): Dict {
      return this.myDictList[2]
    },
    skipWordNames() {
      return this.simple.originWords.map(v => v.word.toLowerCase())
    },
    skipWordNamesWithSimpleWords() {
      return this.simple.originWords.map(v => v.word.toLowerCase()).concat(this.simpleWords)
    },
    isArticle(state: BaseState): boolean {
      //如果是收藏时，特殊判断
      if (this.currentDict.type === DictType.collect) {
        return state.current.practiceType === DictType.article
      }
      return [
        DictType.article,
      ].includes(this.currentDict.type)
    },
    currentDict(): Dict {
      return this.myDictList[this.current.index] ?? {}
    },
    currentWordDict(): Dict {
      return this.wordDictList[this.currentStudy.word.dictIndex] ?? {}
    },
    currentArticleDict(): Dict {
      return this.articleDictList[this.currentStudy.article.dictIndex] ?? {}
    },
    chapter(state: BaseState): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
    chapterName(state: BaseState) {
      let title = ''
      switch (this.currentDict.type) {
        case DictType.collect:
          if (state.current.practiceType === DictType.article) {
            return `第${this.currentDict.chapterIndex + 1}章`
          }
        case DictType.wrong:
        case DictType.simple:
          return this.currentDict.name
        case DictType.word:
          return `第${this.currentDict.chapterIndex + 1}章`
      }
      return title
    }
  },
  actions: {
    setState(obj: any) {
      //这样不会丢失watch的值的引用
      merge(this, obj)
    },
    async init(outData?: any) {
      return new Promise(async resolve => {
        try {
          if (outData) {
            this.setState(outData)
          } else {
            let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
            let data = checkAndUpgradeSaveDict(configStr)
            // this.setState(data)
          }
          localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: this.$state, version: SAVE_DICT_KEY.version}))
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }
        const runtimeStore = useRuntimeStore()


        if (this.current.index < 3) {
          //前三本词典的isCustom为true。数据全都保存了，不需要处理了
        } else {
          //自定义的词典，文章只删除了sections，单词并未做删除，所以这里不需要处理
          if (this.currentDict.isCustom) {

          } else {
            //处理非自定义的情况。
            let dictResourceUrl = `./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`;
            if ([DictType.word].includes(this.currentDict.type)) {
              if (!this.currentDict.originWords.length) {
                let v = await getDictFile(dictResourceUrl)
                // v = v.slice(0, 50)
                v.map(s => {
                  s.id = nanoid(6)
                })
                this.currentDict.originWords = cloneDeep(v)
                this.currentDict.words = cloneDeep(v)
                this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
              }
            }

            if ([DictType.article].includes(this.currentDict.type)) {
              if (!this.currentDict.articles.length) {
                let s = await getDictFile(dictResourceUrl)
                this.currentDict.articles = cloneDeep(s.map(v => {
                  v.id = nanoid(6)
                  return v
                }))
              }
            }
          }
        }

        let currentDict = this.wordDictList[this.currentStudy.word.dictIndex]
        let dictResourceUrl = `./dicts/${currentDict.language}/${currentDict.type}/${currentDict.translateLanguage}/${currentDict.url}`;
        if (!currentDict.originWords.length) {
          let v = await getDictFile(dictResourceUrl)
          // v = v.slice(0, 50)
          v.map(s => {
            s.id = nanoid(6)
          })
          currentDict.originWords = cloneDeep(v)
          currentDict.words = cloneDeep(v)
          currentDict.chapterWords = chunk(currentDict.words, currentDict.chapterWordNumber)
        }

        currentDict = this.articleDictList[this.currentStudy.article.dictIndex]
        dictResourceUrl = `./dicts/${currentDict.language}/${currentDict.type}/${currentDict.translateLanguage}/${currentDict.url}`;
        if (!currentDict.articles.length) {
          let s = await getDictFile(dictResourceUrl)
          currentDict.articles = cloneDeep(s.map(v => {
            v.id = nanoid(6)
            return v
          }))
        }

        console.log('this.wordDictList', this.articleDictList)
        emitter.emit(EventKey.changeDict)
        resolve(true)
      })
    },
    saveStatistics(statistics: DisplayStatistics) {
      if (statistics.spend > 1000 * 10) {
        delete statistics.wrongWords
        this.currentDict.statistics.push(statistics)
      }
    },
    async changeDict(dict: Dict, practiceType?: DictType, chapterIndex?: number, wordIndex?: number) {
      //TODO 保存统计
      // this.saveStatistics()
      console.log('changeDict', cloneDeep(dict), chapterIndex, wordIndex)
      if (chapterIndex === undefined) chapterIndex = dict.chapterIndex
      if (wordIndex === undefined) wordIndex = dict.wordIndex
      if (practiceType === undefined) this.current.practiceType = practiceType
      if ([DictType.collect,
        DictType.simple,
        DictType.wrong].includes(dict.type)) {
        dict.chapterIndex = 0
        dict.wordIndex = wordIndex
        dict.chapterWordNumber = dict.words.length
        dict.chapterWords = [dict.words]
      } else {
        //TODO　需要和其他需要下载的地方统一
        let url = `./dicts/${dict.language}/${dict.type}/${dict.translateLanguage}/${dict.url}`;
        if (dict.type === DictType.article) {
          if (!dict.articles.length) {
            let r = await fetch(url)
            let v = await r.json()
            v.map(s => {
              s.id = nanoid(6)
            })
            dict.articles = cloneDeep(v)
          } else {
            dict.length = dict.articles.length
          }
          if (chapterIndex > dict.articles.length) {
            dict.chapterIndex = 0
            dict.wordIndex = 0
          }
        } else {
          //如果不是自定义词典，并且有url地址才去下载
          if (!dict.isCustom && dict.url) {
            if (!dict.originWords.length) {
              let v = await getDictFile(url)
              v.map(s => {
                s.id = nanoid(6)
              })
              dict.originWords = cloneDeep(v)
              if (dict.sort === Sort.normal) {
                dict.words = cloneDeep(dict.originWords)
              } else if (dict.sort === Sort.random) {
                dict.words = shuffle(dict.originWords)
              } else {
                dict.words = reverse(dict.originWords)
              }
              dict.words.map(v => v.checked = false)
              dict.chapterWords = chunk(dict.words, dict.chapterWordNumber)
              dict.length = dict.words.length
            } else {
              dict.length = dict.words.length
            }
          }
          if (chapterIndex > dict.chapterWords.length) {
            dict.chapterIndex = 0
            dict.wordIndex = 0
          }
        }
      }
      // await checkDictHasTranslate(dict)
      let rIndex = this.myDictList.findIndex((v: Dict) => v.id === dict.id)
      if (rIndex > -1) {
        this.myDictList[rIndex] = dict
        this.current.index = rIndex
      } else {
        this.myDictList.push(cloneDeep(dict))
        this.current.index = this.myDictList.length - 1
      }

      emitter.emit(EventKey.changeDict)
    }
  },
})