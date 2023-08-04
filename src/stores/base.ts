import {defineStore} from 'pinia'
import {Config, Word} from "../types.ts"

export const useBaseStore = defineStore('base', {
  state: () => ({
      newWords: [],
      skipWords: [],
      skipWordNames: [],
      dict: 'nce2',
      chapterIndex: 0,
      wordIndex: 0,
    }
  ),
  getters: {
    word: (state): Word => {
      return state.wordList?.[state.chapterIndex]?.[state.wordIndex] ?? {
        trans: [],
        name: ''
      }
    },
  },
  actions: {
    init(config: Config) {
    },
  },
})