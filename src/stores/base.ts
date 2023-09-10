import {defineStore} from 'pinia'
import {Dict, DictType, Sort, State, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash";
import {emitter, EventKey} from "@/utils/eventBus.ts"

export const useBaseStore = defineStore('base', {
  state: (): State => {
    return {
      newWordDict: {
        name: '生词本',
        sort: Sort.normal,
        type: DictType.newDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      skipWordDict: {
        name: '简单词',
        sort: Sort.normal,
        type: DictType.skipDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      wrongWordDict: {
        name: '错词本',
        sort: Sort.normal,
        type: DictType.wrongDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      dict: {
        name: '新概念英语-2',
        sort: Sort.normal,
        type: DictType.innerDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '/dicts/NCE_2.json',
      },
      oldDicts: [],
      current: {
        dictType: DictType.innerDict,
        words: [],
        index: -1,
        wrongWords: [],
        originWrongWords: [],
        repeatNumber: 0,
        statistics: {
          startDate: -1,
          endDate: -1,
          spend: -1,
          wordNumber: -1,
          correctRate: -1,
          wrongWordNumber: -1,
        }
      },
      sideIsOpen: false,
      isDictation: true,
      setting: {
        showToolbar: true,
        show: false,
        value1: false,
        value2: 50,
        value3: 1,
        value4: false,
      },
      simpleWords: [
        'a', 'an', 'of', 'and',
        'i', 'my', 'you', 'your',
        'me', 'am', 'is', 'do', 'are',
        'what', 'who', 'where', 'how', 'no', 'yes',
        'not', 'did', 'were', 'can', 'could', 'it',
        'the', 'to'
      ],
      theme: 'auto',
      load: false
    }
  },
  getters: {
    skipWordNames: (state: State) => {
      return state.skipWordDict.originWords.map(v => v.name.toLowerCase())
    },
    skipWordNamesWithSimpleWords: (state: State) => {
      return state.skipWordDict.originWords.map(v => v.name.toLowerCase()).concat(state.simpleWords)
    },
    currentDict(state: State): Dict {
      switch (state.current.dictType) {
        case DictType.newDict:
          return state.newWordDict
        case DictType.skipDict:
          return state.skipWordDict
        case DictType.wrongDict:
          return state.wrongWordDict
        case DictType.innerDict:
        case DictType.customDict:
          return state.dict
      }
    },
    wordIndex(state: State): number {
      return this.currentDict.wordIndex
    },
    chapter(state: State): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
    word(state: State): Word {
      return state.current.words[state.current.index] ?? {
        trans: [],
        name: '',
        usphone: '',
        ukphone: '',
      }
    },
    dictTitle(state: State) {
      let title = this.currentDict.name
      if ([DictType.innerDict, DictType.customDict].includes(this.current.dictType)) {
        title += `  第${this.currentDict.chapterIndex + 1}章`
        title += this.current.repeatNumber ? '  复习错词' : ''
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
    setCurrentWord(words: Word[], restart: boolean = false, index: number = 0) {
      this.current.words = cloneDeep(words)
      if (restart) {
        this.current.repeatNumber = 0
        this.current.originWrongWords = []
        this.current.statistics = {
          startDate: Date.now(),
          endDate: -1,
          spend: -1,
          wordNumber: words.length,
          correctRate: -1,
          wrongWordNumber: -1,
        }
      } else {
        this.current.repeatNumber++
        if (!this.current.originWrongWords.length) {
          this.current.originWrongWords = cloneDeep(this.current.wrongWords)
        }
        this.current.statistics.correctRate = -1
        this.current.statistics.wrongWordNumber = -1
      }
      this.current.index = index
      this.current.wrongWords = []
    },
    async init() {
      // let configStr = localStorage.getItem(SaveKey)
      // if (configStr) {
      //   let obj: Config = JSON.parse(configStr)
      //   this.setState(obj)
      // }
      if (this.current.dictType === DictType.innerDict) {
        let r = await fetch(`/public/${this.dict.url}`)
        r.json().then(v => {
          this.dict.originWords = cloneDeep(v)
          this.dict.words = cloneDeep(v)
          this.dict.chapterWords = chunk(this.dict.words, this.dict.chapterWordNumber)
          this.setCurrentWord(this.chapter, true)
          this.load = true
        })
      }
    },
    saveStatistics() {
      let currentStat = cloneDeep(this.current.statistics)
      currentStat.endDate = Date.now()
      currentStat.spend = Date.now() - currentStat.startDate
      currentStat.wrongWordNumber = this.current.originWrongWords.length
      currentStat.correctRate = 100 - Math.trunc((currentStat.wrongWordNumber / currentStat.wordNumber) * 100)
      // console.log(cloneDeep(currentStat))
      if (currentStat.spend > 1000 * 10) {
        this.currentDict.statistics.push(currentStat)
      }
      return currentStat
    },
    async changeDict(dict: Dict, chapterIndex: number = dict.chapterIndex, chapterWordIndex: number = dict.chapterWordNumber) {
      this.saveStatistics()
      console.log('changeDict', cloneDeep(dict), chapterIndex, chapterWordIndex)
      this.current.dictType = dict.type
      if ([DictType.newDict,
        DictType.skipDict,
        DictType.wrongDict].includes(dict.type)) {
        this[dict.type].chapterIndex = chapterIndex
        this[dict.type].chapterWordIndex = chapterWordIndex
      } else {
        this.dict = cloneDeep(dict)
        if (dict.originWords.length) {
          let r = await fetch(`/public/${this.dict.url}`)
          let v = await r.json()
          this.dict.originWords = cloneDeep(v)
          this.dict.words = cloneDeep(v)
          this.dict.chapters = chunk(this.dict.words, this.dict.chapterWordNumber)
        }
        this.dict.chapterIndex = chapterIndex
        this.dict.chapterWordIndex = chapterWordIndex
      }
      this.setCurrentWord(this.chapter, true, chapterWordIndex)
      emitter.emit(EventKey.resetWord)
    }
  },
})