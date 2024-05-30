import {defineStore} from "pinia"
import {DefaultDict, Dict} from "@/types.ts";
import {cloneDeep} from "lodash-es";

export interface RuntimeState {
  disableEventListener: boolean,
  modalList: Array<{ id: string | number, close: Function }>
  editDict: Dict
  showDictModal: boolean
  showSettingModal: boolean
  excludeRoutes: any[]
  routeData: any,
}

export const useRuntimeStore = defineStore('runtime', {
  state: (): RuntimeState => {
    return {
      routeData: null,
      disableEventListener: false,
      modalList: [],
      editDict: cloneDeep(DefaultDict),
      showDictModal: false,
      showSettingModal: false,
      excludeRoutes: [],
    }
  },
  actions: {
    updateExcludeRoutes(val: any) {
      // console.log('val', val)
      if (val.type === 'add') {
        if (!this.excludeRoutes.find(v => v === val.value)) {
          this.excludeRoutes.push(val.value)
        }
      } else {
        let resIndex = this.excludeRoutes.findIndex(v => v === val.value)
        if (resIndex !== -1) {
          this.excludeRoutes.splice(resIndex, 1)
        }
      }
      // console.log('store.excludeRoutes', this.excludeRoutes)
    },
  }
})