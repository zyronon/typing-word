import {defineStore} from 'pinia'
import {DefaultDict, Dict, DictType, DisplayStatistics, SaveDict, Word} from "../types.ts"
import {chunk, cloneDeep, merge} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {useRuntimeStore} from "@/stores/runtime.ts";
import * as localforage from "localforage";
import {nanoid} from "nanoid";
import {state} from "vue-tsc/out/shared";

export interface BaseState {
  myDictList: Dict[],
  current: {
    index: number,
    practiceType: DictType,//练习类型，目前仅词典为collect时判断是练单词还是文章使用
  },
  simpleWords: string[],
  load: boolean
}

// words: [
//   {
//     "name": "cancelcancelcancelcancelcancelcancelcancelcancel",
//     "trans": ['取消取消取消取消取消取消取消取消取消取消取消取消取消取消取消取消'],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "prepare",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "half",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "spacious",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "analyse",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "costing",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
//   {
//     "name": "nowadays",
//     "trans": [],
//     "usphone": "",
//     "ukphone": ""
//   },
// ],

export const useBaseStore = defineStore('base', {
  state: (): BaseState => {
    return {
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
          length: 13
        },
        {
          ...cloneDeep(DefaultDict),
          id: 'nce-new-2',
          name: '新概念英语(新版)-2',
          description: '新概念英语新版第二册',
          category: '青少年英语',
          tags: ['新概念英语'],
          url: 'nce-new-2.json',
          translateLanguage: 'common',
          language: 'en',
          type: DictType.word,
          resourceId: 'nce-new-2',
          length: 862
        },
      ],
      current: {
        index: 3,
        // dictType: DictType.article,
        // index: 0,
        practiceType: DictType.word,
      },
      simpleWords: [
        'a', 'an',
        'i', 'my', 'you', 'your', 'me', 'it',
        'am', 'is', 'do', 'are', 'did', 'were',
        'what', 'who', 'where', 'how', 'no', 'yes',
        'not', 'can', 'could',
        'the', 'to', 'of', 'for', 'and', 'that', 'this', 'be'
      ],
      load: false
    }
  },
  getters: {
    collect() {
      return this.myDictList[0] ?? {}
    },
    simple(): Dict {
      return this.myDictList[1]
    },
    wrong() {
      return this.myDictList[2]
    },
    skipWordNames() {
      return this.simple.originWords.map(v => v.name.toLowerCase())
    },
    skipWordNamesWithSimpleWords() {
      return this.simple.originWords.map(v => v.name.toLowerCase()).concat(this.simpleWords)
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
      return this.myDictList[this.current.index]
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
    async init() {
      return new Promise(async resolve => {
        try {
          let configStr: string = await localforage.getItem(SaveDict.key)
          // console.log(configStr)
          // console.log('s', new Blob([configStr]).size)
          // configStr = ''
          if (configStr) {
            let data = JSON.parse(configStr)
            let state: BaseState = data.val
            let version = Number(data.version)
            // console.log('state', state)
            state.load = false

            if (version === SaveDict.version) {
              this.setState(state)
            } else {
              if (version === 2) {

              }
              // this.setState(state)
            }
          }
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }
        const runtimeStore = useRuntimeStore()

        if (this.current.index < 3) {

        } else {
          let dictResourceUrl = `./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`;
          if ([DictType.word].includes(this.currentDict.type)) {
            if (!this.currentDict.originWords.length) {
              let r = await fetch(dictResourceUrl)
              // let r = await fetch(`.${this.currentDict.url}`)
              let v = await r.json()
              v.map(s => {
                s.id = nanoid(6)
              })
              if (this.currentDict.translateLanguage === 'common') {
                let r2 = await fetch('./translate/en2zh_CN-min.json')
                // fetch('http://sc.ttentau.top/en2zh_CN-min.json').then(r2 => {
                let list: Word[] = await r2.json()
                if (list && list.length) {
                  runtimeStore.translateWordList = list
                }
              }
              this.currentDict.originWords = cloneDeep(v)
              this.currentDict.words = cloneDeep(v)
              this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
            }
          }

          if ([DictType.article].includes(this.currentDict.type)) {
            if (!this.currentDict.articles.length) {
              let r = await fetch(dictResourceUrl)
              let s: any[] = await r.json()
              this.currentDict.articles = cloneDeep(s.map(v => {
                v.id = nanoid(6)
                return v
              }))
            }
          }
        }

        //TODO 先这样，默认加载
        if (!runtimeStore.translateWordList.length) {
          setTimeout(async () => {
            let r2 = await fetch('./translate/en2zh_CN-min.json')
            // fetch('http://sc.ttentau.top/en2zh_CN-min.json').then(r2 => {
            let list: Word[] = await r2.json()
            if (list && list.length) {
              runtimeStore.translateWordList = list
            }
          })
        }
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
        if (dict.type === DictType.article) {
          if (chapterIndex > dict.articles.length) {
            dict.chapterIndex = 0
            dict.wordIndex = 0
          }
        } else {
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