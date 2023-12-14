import {defineStore} from "pinia"
import {DefaultDict, Dict} from "@/types.ts";
import {cloneDeep} from "lodash-es";

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
      editDict: cloneDeep(DefaultDict),
      showDictModal: false,
      showSettingModal: false,
    }
  },
})