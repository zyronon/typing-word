import {defineStore} from "pinia"
import {Dict, DictType, Sort} from "@/types.ts";

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
      editDict: {
        name: '',
        sort: Sort.normal,
        type: DictType.publicArticle,
        originWords: [],
        articles: [],
        words: [],
        chapterWordNumber: 15,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        url: '',
      },
    }
  },
})