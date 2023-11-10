import {defineStore} from 'pinia'
import {DefaultDict, Dict, DictType, DisplayStatistics, SaveDict, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {v4 as uuidv4} from 'uuid';
import {useRuntimeStore} from "@/stores/runtime.ts";

export interface State {
  collect: Dict,
  simple: Dict,
  wrong: Dict,
  myDicts: Dict[],
  current: {
    dictType: DictType,
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
  state: (): State => {
    return {
      collect: {
        ...cloneDeep(DefaultDict),
        id: 'collect',
        name: '收藏',
        type: DictType.collect,
      },
      simple: {
        ...cloneDeep(DefaultDict),
        id: 'skip',
        name: '简单词',
        type: DictType.simple,
      },
      wrong: {
        ...cloneDeep(DefaultDict),
        id: 'wrong',
        name: '错词本',
        type: DictType.wrong,
      },
      myDicts: [
        {
          ...cloneDeep(DefaultDict),
          id: '新概念英语2-课文',
          name: '新概念英语2-课文',
          type: DictType.article,
          url: 'NCE_2.json',
          translateLanguage: 'common',
          language: 'en',
        },
        {
          ...cloneDeep(DefaultDict),
          id: '新概念英语2',
          name: '新概念英语2',
          type: DictType.word,
          url: 'nce-new-2.json',
          resourceId: 'nce-new-2',
          translateLanguage: 'common',
          language: 'en',
        }
      ],
      current: {
        dictType: DictType.word,
        index: 1,
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
    skipWordNames: (state: State) => {
      return state.simple.originWords.map(v => v.name.toLowerCase())
    },
    skipWordNamesWithSimpleWords: (state: State) => {
      return state.simple.originWords.map(v => v.name.toLowerCase()).concat(state.simpleWords)
    },
    isArticle(state: State): boolean {
      //如果是收藏时，特殊判断
      if (state.current.dictType === DictType.collect) {
        return state.current.practiceType === DictType.article
      }
      return [
        DictType.article,
        DictType.customArticle
      ].includes(state.current.dictType)
    },
    editDict(state: State) {
      if (state.current.editIndex === -1) {
        return cloneDeep(DefaultDict)
      }
      switch (state.current.editIndex) {
        case 0:
          return state.collect
        case 1:
          return state.simple
        case 2:
          return state.wrong
        default:
          return state.myDicts[state.current.editIndex]
      }
    },
    currentDict(state: State): Dict {
      switch (state.current.dictType) {
        case DictType.collect:
          return state.collect
        case DictType.simple:
          return state.simple
        case DictType.wrong:
          return state.wrong
        case DictType.word:
        case DictType.article:
        case DictType.customWord:
        case DictType.customArticle:
          return this.myDicts[this.current.index]
      }
    },
    currentEditDict(): Dict {
      return this.myDicts[this.current.editIndex]
    },
    wordIndex(state: State): number {
      return this.currentDict.wordIndex
    },
    chapter(state: State): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
    dictTitle(state: State) {
      let title = this.currentDict.name
      switch (state.current.dictType) {
        case DictType.collect:
          if (state.current.dictType === DictType.collect) {
            title += `  第${this.currentDict.chapterIndex + 1}章`
          }
          break
        case DictType.word:
        case DictType.article:
        case DictType.customWord:
        case DictType.customArticle:
          title += `  第${this.currentDict.chapterIndex + 1}章`
          break
      }
      return title
    }
  },
  actions: {
    setEditDict(val: Dict) {
      if (this.current.editIndex !== -1) {
        switch (this.current.editIndex) {
          case 0:
            return this.collect = val
          case 1:
            return this.simple = val
          case 2:
            return this.wrong = val
          default:
            return this.myDicts[this.current.editIndex] = val
        }
      }
    },
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
      // console.log('this/', this)
    },
    async init() {
      return new Promise(async resolve => {

        let configStr = localStorage.getItem(SaveDict.key)
        if (configStr) {
          let obj: State = JSON.parse(configStr)
          // this.setState(obj)
        }

        if ([
          DictType.collect,
          DictType.wrong,
          DictType.simple,
        ].includes(this.current.dictType)) {

        } else {
          if ([
            DictType.word,
            DictType.customWord,
          ].includes(this.current.dictType)) {
            if (!this.currentDict.originWords.length) {
              let r = await fetch(`./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
              // let r = await fetch(`.${this.currentDict.url}`)
              r.json().then(v => {
                if (this.currentDict.translateLanguage === 'common') {
                  const runtimeStore = useRuntimeStore()
                  fetch('./translate/en2zh_CN-min.json').then(r2 => {
                  // fetch('http://sc.ttentau.top/en2zh_CN-min.json').then(r2 => {
                    r2.json().then((list: Word[]) => {
                      runtimeStore.translateWordList = list

                      this.currentDict.originWords = cloneDeep(v)
                      this.currentDict.words = cloneDeep(v)
                      this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
                      this.currentDict.chapterWords[this.currentDict.chapterIndex].map((w: Word) => {
                        let res = list.find(a => a.name === w.name)
                        if (res) w = Object.assign(w, res)
                      })

                      resolve(true)
                    })
                  })
                } else {
                  this.currentDict.originWords = cloneDeep(v)
                  this.currentDict.words = cloneDeep(v)
                  this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
                  resolve(true)
                }
              })
            } else {
              resolve(true)
            }
          }

          if ([
            DictType.article,
            DictType.customArticle,
          ].includes(this.current.dictType)) {
            console.log(1, this.currentDict)
            if (!this.currentDict.articles.length) {
              console.log(2)
              let r = await fetch(`./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
              r.json().then((v: any[]) => {
                console.log(3)
                this.currentDict.articles = cloneDeep(v.map(v => {
                  v.id = uuidv4()
                  return v
                }))
                resolve(true)
              })
            } else {
              resolve(true)
            }
          }
        }
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
      this.current.dictType = dict.type
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
        let rIndex = this.myDicts.findIndex((v: Dict) => v.name === dict.name)
        if (rIndex > -1) {
          this.myDicts[rIndex] = dict
          this.current.index = rIndex
        } else {
          this.myDicts.push(cloneDeep(dict))
          this.current.index = this.myDicts.length - 1
        }
      }
      emitter.emit(EventKey.resetWord)
    }
  },
})