import {defineStore} from "pinia"
import {Word} from "@/types.ts"

export interface PracticeState {
  wrongWords: Word[],
  //todo 废弃
  repeatNumber: number,
  startDate: number,
  total: number,
  index: number,//当前输入的第几个，用于和total计算进度
  newWordNumber: number,
  inputWordNumber: number,//当前总输入了多少个单词（不包含跳过）
  wrongWordNumber: number,
  correctRate: number,
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => {
    return {
      wrongWords: [],
      repeatNumber: 0,
      startDate: Date.now(),
      correctRate: -1,
      total: 0,
      index: 0,
      newWordNumber: 0,
      inputWordNumber: 0,
      wrongWordNumber: 0,
    }
  },
})