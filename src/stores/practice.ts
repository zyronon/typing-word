import {defineStore} from "pinia"
import {Word} from "@/types.ts"

export interface PracticeState {
  type: 'word' | 'article',
  wrongWords: Word[],
  repeatNumber: number,
  startDate: number,
  total: number,
  inputNumber: number,
  wrongNumber: number,
  correctRate: number,
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => {
    return {
      // type: 'articles',
      type: 'word',
      wrongWords: [],
      repeatNumber: 0,
      startDate: Date.now(),
      correctRate: -1,
      total: 0,
      inputNumber: 0,
      wrongNumber: 0,
    }
  },
})