import {defineStore} from 'pinia'
import {Dict, DictType, getDefaultDict, Sort, Word} from "../types.ts"
import {cloneDeep, merge, reverse, shuffle} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import * as localforage from "localforage";
import {nanoid} from "nanoid";
import {SAVE_DICT_KEY} from "@/utils/const.ts";
import {_checkDictWords, _getStudyProgress, checkAndUpgradeSaveDict, getDictFile} from "@/utils";

export interface BaseState {
  myDictList: Dict[],
  current: {
    index: number,
    practiceType: DictType,//练习类型，目前仅词典为collect时判断是练单词还是文章使用
  },
  simpleWords: string[],
  load: boolean

  articleDictList?: Dict[]

  commonDictList: any[],
  wordDictList?: Dict[],
  currentStudy?: {
    word: {
      dictIndex: number,
    },
    article: {
      dictIndex: number,
    }
  }
}

export const DefaultBaseState = (): BaseState => ({
  commonDictList: [
    getDefaultDict(),
    {
      ...getDefaultDict(),
      index: 1,
      name: '收藏', type: DictType.collectWord, words: [
        {
          "id": "pharmacy",
          "word": "pharmacy",
          "trans": [
            {
              "cn": "n.药房，配药学，药学，制药业，一批备用药品"
            }
          ],
          "phonetic0": "ˈfɑ:məsi",
          "phonetic1": "ˈfɑ:rməsi"
        },
        {
          "id": "foregone",
          "word": "foregone",
          "trans": [
            {
              "cn": "过去的；先前的；预知的；预先决定的"
            },
            {
              "cn": "发生在…之前（forego的过去分词）"
            }
          ],
          "phonetic0": "fɔː'gɒn",
          "phonetic1": "'fɔrɡɔn"
        },

        {
          "id": "calculate",
          "word": "calculate",
          "trans": [
            {
              "cn": "vt.& vi.计算，估计，打算，计划，旨在"
            },
            {
              "cn": "vt.预测，推测"
            }
          ],
          "phonetic0": "ˈkælkjuleɪt",
          "phonetic1": "ˈkælkjəˌlet"
        },
        {
          "id": "compete",
          "word": "compete",
          "trans": [
            {
              "cn": "vi.竞赛，竞争，比得上，参加比赛（或竞赛）"
            }
          ],
          "phonetic0": "kəmˈpi:t",
          "phonetic1": "kəmˈpit"
        },
        {
          "id": "furnish",
          "word": "furnish",
          "trans": [
            {
              "cn": "vt.陈设，布置，提供，供应，装修（房屋）"
            }
          ],
          "phonetic0": "ˈfɜ:nɪʃ",
          "phonetic1": "ˈfɜ:rnɪʃ"
        },
      ], statistics: []
    },
    {
      ...getDefaultDict(),
      index: 2, name: '收藏', type: DictType.collectArticle, articles: [], statistics: []
    },
    {
      ...getDefaultDict(),
      index: 3, name: '简单词', type: DictType.simple, words: [], statistics: []
    },
    {
      ...getDefaultDict(),
      index: 4, name: '错词', type: DictType.wrong, words: [], statistics: []
    },
    {
      ...getDefaultDict(),
      index: 5, name: '已掌握', type: DictType.master, words: [], statistics: []
    },
  ],

  articleDictList: [
    {
      ...getDefaultDict(),
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
      ...getDefaultDict(),
      "id": 137,
      "name": "新概念英语(新版)-2",
      "description": "新概念英语新版第二册",
      "length": 862,
      "version": 1,
      "fileName": "nce-new-2",
      "category": "青少年英语",
      "langType": 0,
      "tranType": 1,
      "userId": null,
      "tags": [
        "新概念英语"
      ],
      "langTypeStr": "en",
      "tranTypeStr": "zh",
      "dictType": DictType.word,
      statistics: []
    },
  ],
  currentStudy: {
    word: {
      dictIndex: 0,
    },
    article: {
      dictIndex: 0,
    },
  },

  myDictList: [
    {
      ...getDefaultDict(),
      id: 'collect',
      name: '收藏',
      type: DictType.collect,
      category: '自带字典',
      tags: ['自带'],
      isCustom: true,
    },
    {
      ...getDefaultDict(),
      id: 'skip',
      name: '简单词',
      type: DictType.simple,
      category: '自带字典',
      isCustom: true,
    },
    {
      ...getDefaultDict(),
      id: 'wrong',
      name: '错词本',
      type: DictType.wrong,
      category: '自带字典',
      isCustom: true,
    },
    {
      ...getDefaultDict(),
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
      ...getDefaultDict(),
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
  current: {
    index: 4,
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
    collectWord(): Dict {
      return this.commonDictList[1]
    },
    collectArticle(): Dict {
      return this.commonDictList[2]
    },
    simple(): Dict {
      return this.commonDictList[3]
    },
    wrong(): Dict {
      return this.commonDictList[4]
    },
    master(): Dict {
      return this.commonDictList[5]
    },
    skipWordNames() {
      return this.simple.words.map(v => v.word.toLowerCase())
    },
    skipWordNamesWithSimpleWords() {
      return this.simple.words.map(v => v.word.toLowerCase()).concat(this.simpleWords)
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
    currentStudyWordDict(): Dict {
      if (this.sword.dictIndex >= 0) {
        return this.wordDictList[this.currentStudy.word.dictIndex] ?? getDefaultDict()
      }
      return this.commonDictList[Math.abs(this.currentStudy.word.dictIndex) - 1] ?? getDefaultDict()
    },
    sdict(): Dict {
      return this.currentStudyWordDict
    },
    sword() {
      return this.currentStudy.word
    },
    currentStudyProgress(): number {
      if (!this.sdict.words?.length) return 0
      return _getStudyProgress(this.sdict.lastLearnIndex, this.sdict.words?.length)
    },
    otherWordDictList(): Dict[] {
      return this.wordDictList.filter(v => this.sdict.id !== v.id)
    },
    currentArticleDict(): Dict {
      return this.articleDictList[this.currentStudy.article.dictIndex] ?? {}
    },
    chapter(state: BaseState): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
  },
  actions: {
    setState(obj: any) {
      return
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
            this.setState(data)
          }
          localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: this.$state, version: SAVE_DICT_KEY.version}))
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }

        if (this.currentStudy.word.dictIndex >= 0) {
          // await _checkDictWords(this.currentStudyWordDict)
          // console.log('this.wordDictList', this.wordDictList[0].words[0])
        }
        if (this.currentStudy.article.dictIndex >= 0) {
          let current = this.articleDictList[this.currentStudy.article.dictIndex]
          let dictResourceUrl = `./dicts/${current.language}/${current.type}/${current.translateLanguage}/${current.url}`;
          if (!current.articles.length) {
            let s = await getDictFile(dictResourceUrl)
            current.articles = cloneDeep(s.map(v => {
              v.id = nanoid(6)
              return v
            }))
          }
          console.log('this.currentArticleDict', this.currentArticleDict.articles[0])

        }
        emitter.emit(EventKey.changeDict)
        resolve(true)
      })
    },
    async changeDict(dict: Dict, practiceType?: DictType, chapterIndex?: number, wordIndex?: number) {
    },
    async changeWordDict(dict: Dict) {
      this.wordDictList.map((v) => v.words = [])
      // await checkDictHasTranslate(newDict)
      let rIndex = this.wordDictList.findIndex((v: Dict) => v.id === dict.id)
      if (rIndex > -1) {
        this.wordDictList[rIndex] = Object.assign(dict, this.wordDictList[rIndex])
        this.currentStudy.word.dictIndex = rIndex
      } else {
        this.wordDictList.push(getDefaultDict(dict))
        this.currentStudy.word.dictIndex = this.wordDictList.length - 1
      }
      await _checkDictWords(this.currentStudyWordDict)

      console.log(' store.currentStudyWordDict', this.currentStudyWordDict)
      emitter.emit(EventKey.changeDict)
    },
    async changeArticleDict(dict: Dict) {
      //TODO 保存统计
      // this.saveStatistics()
      console.log('changeDict', cloneDeep(dict),)
      if ([DictType.collect,
        DictType.simple,
        DictType.wrong].includes(dict.type)) {
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
              dict.length = dict.words.length
            } else {
              dict.length = dict.words.length
            }
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
    },
    delWordDict(dict: Dict) {
      let oldId = this.currentStudyWordDict.id;
      let rIndex = this.wordDictList.findIndex((v: Dict) => v.id === dict.id)
      if (rIndex > -1) {
        this.wordDictList.splice(rIndex, 1)
      }
      rIndex = this.wordDictList.findIndex((v: Dict) => v.id === oldId)
      if (rIndex > -1) {
        this.currentStudy.word.dictIndex = rIndex
      }
    },

  },
})