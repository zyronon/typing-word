import {defineStore} from "pinia"
import {DefaultDict, Dict, DictType, Sort, Word} from "@/types.ts";

export interface RuntimeState {
  disableEventListener: boolean,
  modalList: Array<{ id: string | number, close: Function }>
  editDict: Dict
  showDictModal: boolean
  showSettingModal: boolean
}

export const useRuntimeStore = defineStore('runtime', {
  state: (): RuntimeState => {
    return {
      disableEventListener: false,
      modalList: [],
      editDict: {...DefaultDict},
      showDictModal: false,
      showSettingModal: false,
    }
  },
})