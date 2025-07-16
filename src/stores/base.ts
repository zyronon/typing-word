import {defineStore} from 'pinia'
import {Article, Dict, DictType, getDefaultDict, Sort, Word} from "../types.ts"
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

  wordDictList?: Dict[],
  currentStudy?: {
    word: {
      dictIndex: number,
    },
  },
  word: {
    studyIndex: number,
    bookList: Dict[],
  },
  article: {
    bookList: Dict[],
    studyIndex: number,
  }
}

export const DefaultBaseState = (): BaseState => ({
  wordDictList: [],
  currentStudy: {
    word: {
      dictIndex: 0,
    },
  },
  myDictList: [],
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
  load: false,
  word: {
    bookList: [
      getDefaultDict({
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
      }),
      getDefaultDict({
        index: 2, name: '错词', type: DictType.wrong, words: [], statistics: []
      }),
      getDefaultDict({
        index: 3, name: '已掌握', type: DictType.known, words: [], statistics: []
      }),
      getDefaultDict({
        id: 'nce-new-2',
        name: '新概念英语(新版)-2',
        description: '新概念英语新版第二册',
        category: '青少年英语',
        tags: ['新概念英语'],
        url: 'nce-new-2_v2.json',
        length: 862,
        translateLanguage: 'common',
        language: 'en',
        type: DictType.word
      }),
    ],
    studyIndex: 3,
  },
  article: {
    bookList: [
      getDefaultDict({name: '收藏'})
    ],
    studyIndex: -1,
  }
})

export const useBaseStore = defineStore('base', {
  state: (): BaseState => {
    return DefaultBaseState()
  },
  getters: {
    collect(): Dict {
      return this.word.bookList[0]
    },
    collectWord(): Dict {
      return this.word.bookList[1]
    },
    collectArticle(): Dict {
      return this.word.bookList[2]
    },
    simple(): Dict {
      return this.word.bookList[2]
    },
    wrong(): Dict {
      return this.word.bookList[1]
    },
    known(): Dict {
      return this.word.bookList[2]
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
      if (this.word.studyIndex >= 0) {
        return this.word.bookList[this.word.studyIndex] ?? getDefaultDict()
      }
      return getDefaultDict()
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
      return this.word.bookList.filter(v => this.sdict.id !== v.id)
    },
    currentArticleCollectDict(): Dict {
      return this.article.bookList[0]
    },
    chapter(state: BaseState): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },

    currentBook(): Dict {
      return this.article.bookList[this.article.studyIndex] ?? {}
    },
    currentBookProgress(): number {
      if (this.currentBook.name) return Number(Number(this.currentBook.lastLearnIndex / this.currentBook.length).toFixed(2))
      return 0
    },
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
            this.setState(data)
          }
          localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: this.$state, version: SAVE_DICT_KEY.version}))
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }

        if (this.word.studyIndex >= 0) {
          // await _checkDictWords(this.currentStudyWordDict)
          let current = this.word.bookList[this.word.studyIndex]
          let dictResourceUrl = `./dicts/${current.language}/${current.type}/${current.url}`;
          current.words = await getDictFile(dictResourceUrl)

          console.log('this.current', current)
        }
        if (this.article.studyIndex >= 0) {
          let current = this.article.bookList[this.article.studyIndex]
          let dictResourceUrl = `./dicts/${current.language}/${current.type}/${current.translateLanguage}/${current.url}`;
          if (!current.articles.length) {
            let s = await getDictFile(dictResourceUrl)
            current.articles = cloneDeep(s.map(v => {
              v.id = nanoid(6)
              return v
            }))
          }
          // console.log('this.currentBook', this.currentBook.articles[0])
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
      // await _checkDictWords(this.currentStudyWordDict)

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
