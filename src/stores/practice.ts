import {defineStore} from "pinia"

export interface PracticeState {
  step: number,
  startDate: number,
  speed: number,
  total: number,
  index: number,//当前输入的第几个，用于和total计算进度
  newWordNumber: number,
  inputWordNumber: number,//当前总输入了多少个单词（不包含跳过）
  wrong: number,
  correctRate: number,
  startIndex:number,
  endIndex:number,
}

export const usePracticeStore = defineStore('practice', {
  state: (): PracticeState => {
    return {
      step: 0,
      speed: 0,
      startDate: Date.now(),
      correctRate: -1,
      total: 0,
      index: 0,
      startIndex: 0,
      endIndex: 0,
      newWordNumber: 0,
      inputWordNumber: 0,
      wrong: 0,
    }
  },
})