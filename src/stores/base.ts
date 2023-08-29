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
        type: DictType.newWordDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapters: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      skipWordDict: {
        name: '简单词',
        sort: Sort.normal,
        type: DictType.skipWordDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapters: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      wrongWordDict: {
        name: '错词本',
        sort: Sort.normal,
        type: DictType.wrongWordDict,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapters: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
      dict: {
        name: '新概念英语-2',
        sort: Sort.normal,
        type: DictType.inner,
        originWords: [],
        words: [],
        chapterWordNumber: 15,
        chapters: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '/dicts/NCE_2.json',
      },
      oldDicts: [],
      current: {
        dictType: DictType.inner,
        words: [],
        index: -1,
        wrongWords: [],
        repeatNumber: -1,
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
      theme: 'auto'
    }
  },
  getters: {
    isWrongMode(state: State) {
      return state.current.repeatNumber > 0
    },
    skipWordNames: (state: State) => {
      return state.skipWordDict.words.map(v => v.name)
    },
    currentDict(state: State): Dict {
      switch (state.current.dictType) {
        case DictType.newWordDict:
          return state.newWordDict
        case DictType.skipWordDict:
          return state.skipWordDict
        case DictType.wrongWordDict:
          return state.wrongWordDict
        case DictType.inner:
        case DictType.custom:
          return state.dict
      }
    },
    wordIndex(state: State): number {
      return this.currentDict.wordIndex
    },
    chapter(state: State): Word[] {
      return this.currentDict.chapters[this.currentDict.chapterIndex] ?? []
    },
    word(state: State): Word {
      return state.current.words[state.current.index] ?? {
        trans: [],
        name: '',
        usphone: '',
        ukphone: '',
      }
    },
  },
  actions: {
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
      // console.log('this/', this)
    },
    async init() {
      // let configStr = localStorage.getItem(SaveKey)
      // if (configStr) {
      //   let obj: Config = JSON.parse(configStr)
      //   this.setState(obj)
      // }
      if (this.current.dictType === DictType.inner) {
        let r = await fetch(`/public/${this.dict.url}`)
        r.json().then(v => {
          this.dict.originWords = cloneDeep(v)
          this.dict.words = cloneDeep(v)
          this.dict.chapters = chunk(this.dict.originWords, this.dict.chapterWordNumber)
        })
      }
      this.dict.wordIndex = 0
    },
    async changeDict(dict: Dict, chapterIndex: number = -1, chapterWordIndex: number = -1) {
      console.log('changeDict', dict)
      emitter.emit(EventKey.resetWord)
      if ([DictType.newWordDict,
        DictType.skipWordDict,
        DictType.wrongWordDict].includes(dict.type)) {
        this.current.dictType = dict.type
        this[dict.type].chapters = [this[dict.type].wordList]
        this[dict.type].chapterIndex = 0
        this[dict.type].chapterWordIndex = chapterWordIndex === -1 ? 0 : chapterWordIndex
      } else {
        this.dict = cloneDeep(dict)
        this.current.dictType = dict.type
        if (chapterWordIndex !== -1) this.dict.chapterWordIndex = chapterWordIndex
        if (chapterIndex !== -1) this.dict.chapterIndex = chapterIndex
      }
      console.log('this.dict', this.dict)
    }
  },
})