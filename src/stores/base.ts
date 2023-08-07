import {defineStore} from 'pinia'
import {Config, SaveKey, Word} from "../types.ts"
import {chunk} from "lodash";
import NCE_2 from "../assets/dicts/NCE_2.json";

export const useBaseStore = defineStore('base', {
  state: () => {
    return {
      newWords: [],
      skipWords: [],
      skipWordNames: [],
      currentDict: {
        wordList: [],
        chapterList: [],
        name: '新概念第二册',
        desc: '',
      },
      chapterIndex: 0,
      wordIndex: 0,
      sideIsOpen: false,
    }
  },
  getters: {
    chapter: (state): Word[] => {
      return state.currentDict.chapterList?.[state.chapterIndex] ?? []
    },
    word(state): Word {
      return this.chapter[state.wordIndex] ?? {
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
    init() {
      let configStr = localStorage.getItem(SaveKey)
      if (configStr) {
        let obj: Config = JSON.parse(configStr)
        this.newWords = obj.newWords
        this.skipWords = obj.skipWords
        this.skipWordNames = obj.skipWordNames
        this.currentDict = obj.currentDict
        this.chapterIndex = obj.chapterIndex
        this.wordIndex = 0
      }
      if (this.currentDict.name === '新概念第二册') {
        this.currentDict.wordList = NCE_2
        this.currentDict.chapterList = chunk(NCE_2, 15)
        // console.log('this.wordListSplit', this.wordListSplit)
        // let wordTemp = wordList?.[config.chapterIndex]?.[config.wordIndex]
        // if (wordTemp && config.skipWordNames.includes(wordTemp.name)) {
        //   next()
        // }
      }
    },
    changeDict() {

    }
  },
})