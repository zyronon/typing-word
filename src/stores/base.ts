import {defineStore} from 'pinia'
import {Config, Word} from "../types.ts"
import {chunk} from "lodash";
import NCE_2 from "../assets/dicts/NCE_2.json";

export const useBaseStore = defineStore('base', {
  state: () => ({
      newWords: [],
      skipWords: [],
      skipWordNames: [],
      wordList: [],
      wordListSplit: [],
      dict: 'nce2',
      chapterIndex: 0,
      wordIndex: 0,
    }
  ),
  getters: {
    word: (state): Word => {
      return state.wordListSplit?.[state.chapterIndex]?.[state.wordIndex] ?? {
        trans: [],
        name: ''
      }
    },
  },
  actions: {
    init(config: Config) {
      this.newWords = config.newWords
      this.skipWords = config.skipWords
      this.skipWordNames = config.skipWordNames
      this.dict = config.dict
      this.chapterIndex = config.chapterIndex
      this.wordIndex = 0

      if (this.dict === 'nce2') {
        this.wordList = NCE_2
        this.wordListSplit = chunk(this.wordList, 15)
        console.log('this.wordListSplit', this.wordListSplit)
        // let wordTemp = wordList?.[config.chapterIndex]?.[config.wordIndex]
        // if (wordTemp && config.skipWordNames.includes(wordTemp.name)) {
        //   next()
        // }
      }
    },
  },
})