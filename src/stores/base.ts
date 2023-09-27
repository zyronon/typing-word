import {defineStore} from 'pinia'
import {Dict, DictType, SaveDictKey, Sort, Statistics, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {v4 as uuidv4} from 'uuid';

export interface State {
  newWordDict: Dict,
  skipWordDict: Dict,
  wrongWordDict: Dict,
  dict: Dict,
  myDicts: Dict[],
  current: {
    dictType: DictType,
    index: number,
    editIndex: number,
    repeatNumber: number,
  },
  simpleWords: string[],
  sideIsOpen: boolean,
  load: boolean
}

export const useBaseStore = defineStore('base', {
  state: (): State => {
    return {
      newWordDict: {
        name: '生词本',
        sort: Sort.normal,
        type: DictType.newDict,
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
      skipWordDict: {
        name: '简单词',
        sort: Sort.normal,
        type: DictType.skipDict,
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
      wrongWordDict: {
        name: '错词本',
        sort: Sort.normal,
        type: DictType.wrongDict,
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
      // dict: {
      //     name: '新概念英语-2',
      //     sort: Sort.normal,
      //     type: DictType.innerDict,
      //     originWords: [],
      //     articles: [],
      //     words: [],
      //     chapterWordNumber: 15,
      //     chapterWords: [],
      //     chapterIndex: 0,
      //     chapterWordIndex: 0,
      //     statistics: [],
      //     url: '/dicts/NCE_2.json',
      // },
      dict: {
        name: '新概念英语-2',
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
        url: '/articles/NCE_2.json',
      },
      myDicts: [
        {
          name: '新概念英语-2',
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
          url: '/articles/NCE_2.json',
        }
      ],
      current: {
        dictType: DictType.publicArticle,
        index: 0,
        editIndex: 0,
        repeatNumber: 0,
      },
      sideIsOpen: false,
      simpleWords: [
        'a', 'an', 'of', 'and',
        'i', 'my', 'you', 'your',
        'me', 'am', 'is', 'do', 'are',
        'what', 'who', 'where', 'how', 'no', 'yes',
        'not', 'did', 'were', 'can', 'could', 'it',
        'the', 'to'
      ],
      load: false
    }
  },
  getters: {
    skipWordNames: (state: State) => {
      return state.skipWordDict.originWords.map(v => v.name.toLowerCase())
    },
    skipWordNamesWithSimpleWords: (state: State) => {
      return state.skipWordDict.originWords.map(v => v.name.toLowerCase()).concat(state.simpleWords)
    },
    isArticle(state: State): boolean {
      return [
        DictType.publicArticle,
        DictType.customArticle
      ].includes(state.current.dictType)
    },
    currentDict(state: State): Dict {
      switch (state.current.dictType) {
        case DictType.newDict:
          return state.newWordDict
        case DictType.skipDict:
          return state.skipWordDict
        case DictType.wrongDict:
          return state.wrongWordDict
        case DictType.publicDict:
        case DictType.publicArticle:
        case DictType.customDict:
        case DictType.customArticle:
          return this.myDicts[this.current.index]
      }
    },
    currentEditDict(): Dict {
      return this.myDicts[this.current.editIndex]
    },
    wordIndex(state: State): number {
      return this.currentDict.wordIndex
    },
    chapter(state: State): Word[] {
      return this.currentDict.chapterWords[this.currentDict.chapterIndex] ?? []
    },
    //TODO 废弃
    word(state: State): Word {
      return {trans: [], name: '', usphone: '', ukphone: '',}
    },
    dictTitle(state: State) {
      let title = this.currentDict.name
      if ([DictType.publicDict, DictType.customDict].includes(this.current.dictType)) {
        title += `  第${this.currentDict.chapterIndex + 1}章`
      }
      return title
    }
  },
  actions: {
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
      // console.log('this/', this)
    },
    async init() {
      let configStr = localStorage.getItem(SaveDictKey)
      if (configStr) {
        let obj: State = JSON.parse(configStr)
        // this.setState(obj)
      }

      if ([
        DictType.newDict,
        DictType.wrongDict,
        DictType.skipDict,
      ].includes(this.current.dictType)) {

      } else {
        if ([
          DictType.publicDict,
          DictType.customDict,
        ].includes(this.current.dictType)) {
          if (!this.currentDict.originWords.length) {
            let r = await fetch(`${this.currentDict.url}`)
            r.json().then(v => {
              this.currentDict.originWords = cloneDeep(v)
              this.currentDict.words = cloneDeep(v)
              this.currentDict.chapterWords = chunk(this.dict.words, this.dict.chapterWordNumber)
              this.load = true
            })
          }
        }

        if ([
          DictType.publicArticle,
          DictType.customArticle,
        ].includes(this.current.dictType)) {
          if (!this.currentDict.articles.length) {
            let r = await fetch(`${this.currentDict.url}`)
            r.json().then((v: any[]) => {
              this.currentDict.articles = cloneDeep(v.map(v => {
                v.id = uuidv4()
                return v
              }))
              this.load = true
            })
          }
        }
      }
    },
    saveStatistics(statistics: Statistics) {
      if (statistics.spend > 1000 * 10) {
        this.currentDict.statistics.push(statistics)
      }
    },
    async changeDict(dict: Dict, chapterIndex: number = dict.chapterIndex, chapterWordIndex: number = dict.chapterWordNumber) {
      this.saveStatistics()
      console.log('changeDict', cloneDeep(dict), chapterIndex, chapterWordIndex)
      this.current.dictType = dict.type
      if ([DictType.newDict,
        DictType.skipDict,
        DictType.wrongDict].includes(dict.type)) {
        this[dict.type].chapterIndex = chapterIndex
        this[dict.type].chapterWordIndex = chapterWordIndex
      } else {
        this.dict = cloneDeep(dict)
        if (dict.originWords.length) {
          let r = await fetch(`/public/${this.dict.url}`)
          let v = await r.json()
          this.dict.originWords = cloneDeep(v)
          this.dict.words = cloneDeep(v)
          this.dict.chapters = chunk(this.dict.words, this.dict.chapterWordNumber)
        }
        this.dict.chapterIndex = chapterIndex
        this.dict.chapterWordIndex = chapterWordIndex
      }
      emitter.emit(EventKey.resetWord)
    }
  },
})