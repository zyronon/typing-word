import {defineStore} from 'pinia'
import {DefaultDict, DefaultWord, Dict, DictType, DisplayStatistics, SaveDict, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {v4 as uuidv4} from 'uuid';
import {useRuntimeStore} from "@/stores/runtime.ts";
import * as localforage from "localforage";

export interface BaseState {
  myDictList: Dict[],
  current: {
    index: number,
    editIndex: number,
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
        },
        {
          ...cloneDeep(DefaultDict),
          id: 'skip',
          name: '简单词',
          type: DictType.simple,
          category: '自带字典'
        },
        {
          ...cloneDeep(DefaultDict),
          id: 'wrong',
          name: '错词本',
          type: DictType.wrong,
          category: '自带字典'
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
          type: DictType.article
        },
        {
          ...cloneDeep(DefaultDict),
          name: '新概念英语(新版)-2',
          description: '新概念英语新版第二册',
          category: '青少年英语',
          tags: ['新概念英语'],
          url: 'nce-new-2.json',
          translateLanguage: 'common',
          language: 'en',
          type: DictType.word
        },
      ],
      current: {
        index: 4,
        editIndex: 0,
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
      return this.myDictList[0]
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
        DictType.customArticle
      ].includes(this.currentDict.type)
    },
    editDict(state: BaseState) {
      if (state.current.editIndex === -1) {
        return cloneDeep(DefaultDict)
      }
      return state.myDictList.filter(v => [DictType.customWord, DictType.customArticle].includes(v.type))[state.current.editIndex - 3]
    },
    currentDict(): Dict {
      return this.myDictList[this.current.index]
    },
    currentEditDict(): Dict {
      return this.myDictList[this.current.editIndex]
    },
    wordIndex(state: BaseState): number {
      return this.currentDict.wordIndex
    },
    chapter(state: BaseState): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
    dictTitle(state: BaseState) {
      let title = this.currentDict.name
      return title + this.chapterName
    },
    chapterName(state: BaseState) {
      let title = ''
      switch (this.currentDict.type) {
        case DictType.collect:
          if (state.current.practiceType === DictType.word) {
            return `第${this.currentDict.chapterIndex + 1}章`
          }
        case DictType.word:
        case DictType.customWord:
          return `第${this.currentDict.chapterIndex + 1}章`
      }
      return title
    }
  },
  actions: {
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
      // console.log('this/', this)
    },
    async init() {
      return new Promise(async resolve => {
        try {
          let configStr: string = await localforage.getItem(SaveDict.key)
          console.log('s', configStr)
          if (configStr) {
            let data = JSON.parse(configStr)
            let state: BaseState = data.val
            state.load = false

            if (data.version === SaveDict.version) {
              this.setState(state)
            } else {
              this.setState(state)
            }
          }
        } catch (e) {
          console.error('读取本地dict数据失败',e)
        }

        if (this.current.index < 3) {

        } else {
          let dictResourceUrl = `./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`;
          if ([
            DictType.word,
            DictType.customWord,
          ].includes(this.currentDict.type)) {
            if (!this.currentDict.originWords.length) {
              let r = await fetch(dictResourceUrl)
              // let r = await fetch(`.${this.currentDict.url}`)
              let v = await r.json()
              if (this.currentDict.translateLanguage === 'common') {
                const runtimeStore = useRuntimeStore()
                let r2 = await fetch('./translate/en2zh_CN-min.json')
                // fetch('http://sc.ttentau.top/en2zh_CN-min.json').then(r2 => {
                let list: Word[] = await r2.json()

                runtimeStore.translateWordList = list

                this.currentDict.originWords = cloneDeep(v)
                this.currentDict.words = cloneDeep(v)
                this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
                this.currentDict.chapterWords[this.currentDict.chapterIndex].map((w: Word) => {
                  let res = list.find(a => a.name === w.name)
                  if (res) w = Object.assign(w, res)
                })
              } else {
                this.currentDict.originWords = cloneDeep(v)
                this.currentDict.words = cloneDeep(v)
                this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
              }
            }
          }

          if ([
            DictType.article,
            DictType.customArticle,
          ].includes(this.currentDict.type)) {
            if (!this.currentDict.articles.length) {
              let r = await fetch(dictResourceUrl)
              let s: any[] = await r.json()
              this.currentDict.articles = cloneDeep(s.map(v => {
                v.id = uuidv4()
                return v
              }))
            }
          }
        }
        resolve(true)
      })
    },
    saveStatistics(statistics: DisplayStatistics) {
      if (statistics.spend > 1000 * 10) {
        delete statistics.wrongWords
        this.currentDict.statistics.push(statistics)
      }
    },
    async changeDict(dict: Dict, chapterIndex: number = dict.chapterIndex, chapterWordIndex: number = dict.chapterWordNumber, practiceType: DictType) {
      //TODO 保存统计
      // this.saveStatistics()
      console.log('changeDict', cloneDeep(dict), chapterIndex, chapterWordIndex)
      this.currentDict.type = dict.type
      this.current.practiceType = practiceType
      if ([DictType.collect,
        DictType.simple,
        DictType.wrong].includes(dict.type)) {
        this[dict.type].chapterIndex = 0
        this[dict.type].chapterWordIndex = chapterWordIndex
        this[dict.type].chapterWords = [this[dict.type].words]
      } else {
        if (dict.type === DictType.article || dict.type === DictType.customArticle) {
          if (chapterIndex > dict.articles.length) {
            dict.chapterIndex = 0
          }
        } else {
          if (chapterIndex > dict.chapterWords.length) {
            dict.chapterIndex = 0
          }
        }
        let rIndex = this.myDictList.findIndex((v: Dict) => v.name === dict.name)
        if (rIndex > -1) {
          this.myDictList[rIndex] = dict
          this.current.index = rIndex
        } else {
          this.myDictList.push(cloneDeep(dict))
          this.current.index = this.myDictList.length - 1
        }
      }
      emitter.emit(EventKey.resetWord)
    }
  },
})