import {defineStore} from 'pinia'
import {Config, Dict, SaveKey, State, Word} from "../types.ts"
import {chunk} from "lodash";
import NCE_2 from "../assets/dicts/NCE_2.json";

export const useBaseStore = defineStore('base', {
  state: (): State => {
    return {
      newWordDict: {
        wordList: [],
        chapterList: [],
        chapterIndex: -1,
        wordIndex: -1,
      },
      skipWordDict: {
        wordList: [],
        chapterList: [],
        chapterIndex: -1,
        wordIndex: -1,
      },
      dict: {
        id: 'nce2',
        name: '新概念英语-2',
        description: '新概念英语第二册',
        category: '青少年英语',
        tags: ['新概念英语'],
        url: '/dicts/NCE_2.json',
        length: 858,
        language: 'en',
        languageCategory: 'en',
        wordList: [],
        chapterList: [],
        chapterIndex: 0,
        wordIndex: 0,
      },
      currentDictType: {
        name: 'inner',
        dictUrl: '/dicts/NCE_2.json'
      },
      sideIsOpen: false,
    }
  },
  getters: {
    skipWordNames: (state: State) => {
      return state.skipWordDict.wordList.map(v => v.name)
    },
    currentDict(state: State): Dict {
      switch (state.currentDictType.name) {
        case "newWordDict":
          return state.newWordDict
        case "skipWordDict":
          return state.skipWordDict
        case 'inner':
        case 'custom':
          return state.dict
      }
    },
    chapter(): Word[] {
      return this.currentDict.chapterList[this.currentDict.wordIndex] ?? []
    },
    word(): Word {
      return this.chapter[this.currentDict.wordIndex] ?? {
        trans: [],
        name: ''
      }
    },
  },
  actions: {
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
    },
    async init() {
      let configStr = localStorage.getItem(SaveKey)
      if (configStr) {
        let obj: Config = JSON.parse(configStr)
        this.setState(obj)
      }
      if (this.currentDictType.name === 'inner') {
        let r = await fetch(`/public/${this.currentDictType.dictUrl}`)
        r.json().then(v => {
          this.dict.wordList = v
          this.dict.chapterList = chunk(this.dict.wordList, 15)
        })
      }
      if (this.currentDictType.name === 'custom') {
        let r = await fetch(`/public/${this.currentDictType.dictUrl}`)
        r.json().then(v => {
          this.dict.wordList = v
          this.dict.chapterList = chunk(this.dict.wordList, 15)
        })
      }
    },
    changeDict() {

    }
  },
})