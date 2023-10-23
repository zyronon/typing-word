import {defineStore} from "pinia"
import {DefaultDict, Dict, DictType, Sort} from "@/types.ts";

export interface RuntimeState {
  disableEventListener: boolean,
  modalList: Array<{ id: string | number, close: Function }>
  editDict: Dict
}

export const useRuntimeStore = defineStore('runtime', {
  state: (): RuntimeState => {
    return {
      disableEventListener: false,
      modalList: [],
      editDict: {...DefaultDict},
    }
  },
})