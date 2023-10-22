import {defineStore} from 'pinia'
import {Dict, DictType, DisplayStatistics, SaveDictKey, Sort, Statistics, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {v4 as uuidv4} from 'uuid';

export interface State {
  newWordDict: Dict,
  skipWordDict: Dict,
  wrongWordDict: Dict,
  myDicts: Dict[],
  current: {
    dictType: DictType,
    index: number,
    editIndex: number,
    repeatNumber: number,
  },
  simpleWords: string[],
  load: boolean
}

export const useBaseStore = defineStore('base', {
  state: (): State => {
    return {
      newWordDict: {
        id:'newWordDict',
        name: '生词本',
        sort: Sort.normal,
        type: DictType.newWordDict,
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
        id:'skipWordDict',
        name: '简单词',
        sort: Sort.normal,
        type: DictType.skipWordDict,
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
        id:'wrongWordDict',
        name: '错词本',
        sort: Sort.normal,
        type: DictType.wrongWordDict,
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
      myDicts: [
        {
          id:'新概念英语2-课文',
          name: '新概念英语2-课文',
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
          url: 'NCE_2.json',
          translateLanguage: 'common',
          language: 'en',
          resourceType: "article"
        },
        {
          id:'新概念英语2',
          name: '新概念英语2',
          sort: Sort.normal,
          type: DictType.publicDict,
          originWords: [],
          articles: [],
          words: [],
          chapterWordNumber: 15,
          chapterWords: [],
          chapterIndex: 0,
          chapterWordIndex: 0,
          statistics: [],
          url: 'nce-new-2.json',
          translateLanguage: 'common',
          language: 'en',
          resourceType: "word"
        }
      ],
      current: {
        dictType: DictType.publicDict,
        // dictType: DictType.publicArticle,
        index: 1,
        editIndex: 0,
        repeatNumber: 0,
      },
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
        case DictType.newWordDict:
          return state.newWordDict
        case DictType.skipWordDict:
          return state.skipWordDict
        case DictType.wrongWordDict:
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
        DictType.newWordDict,
        DictType.wrongWordDict,
        DictType.skipWordDict,
      ].includes(this.current.dictType)) {

      } else {
        if ([
          DictType.publicDict,
          DictType.customDict,
        ].includes(this.current.dictType)) {
          if (!this.currentDict.originWords.length) {
            let r = await fetch(`/dicts/${this.currentDict.language}/${this.currentDict.resourceType}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
            // let r = await fetch(`.${this.currentDict.url}`)
            r.json().then(v => {
              this.currentDict.originWords = cloneDeep(v)
              this.currentDict.words = cloneDeep(v)
              this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
              this.load = true
            })
          }
        }

        if ([
          DictType.publicArticle,
          DictType.customArticle,
        ].includes(this.current.dictType)) {
          if (!this.currentDict.articles.length) {
            let r = await fetch(`/dicts/${this.currentDict.language}/${this.currentDict.resourceType}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
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
    saveStatistics(statistics: DisplayStatistics) {
      if (statistics.spend > 1000 * 10) {
        delete statistics.wrongWords
        this.currentDict.statistics.push(statistics)
      }
    },
    async changeDict(dict: Dict, chapterIndex: number = dict.chapterIndex, chapterWordIndex: number = dict.chapterWordNumber) {
      //TODO 保存统计
      // this.saveStatistics()
      console.log('changeDict', cloneDeep(dict), chapterIndex, chapterWordIndex)
      this.current.dictType = dict.type
      if ([DictType.newWordDict,
        DictType.skipWordDict,
        DictType.wrongWordDict].includes(dict.type)) {
        this[dict.type].chapterIndex = chapterIndex
        this[dict.type].chapterWordIndex = chapterWordIndex
      } else {
        let rIndex = this.myDicts.findIndex((v: Dict) => v.name === dict.name)
        if (rIndex > -1) {
          this.myDicts[rIndex] = dict
          this.current.index = rIndex
        } else {
          this.myDicts.push(cloneDeep(dict))
          this.current.index = this.myDicts.length - 1
        }
      }
      emitter.emit(EventKey.resetWord)
    }
  },
})