import {defineStore} from "pinia"

export interface RuntimeState {
  disableEventListener: boolean,
  modalList: Array<{ id: string | number, close: Function }>
}

export const useRuntimeStore = defineStore('runtime', {
  state: (): RuntimeState => {
    return {
      disableEventListener: false,
      modalList: []
    }
  },
})