import {defineStore} from 'pinia'
import {DefaultDict, Dict, DictType, DisplayStatistics, SaveDictKey, Sort, Statistics, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {v4 as uuidv4} from 'uuid';
import {useRuntimeStore} from "@/stores/runtime.ts";

export interface State {
  collect: Dict,
  skip: Dict,
  wrong: Dict,
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
      collect: {
        ...cloneDeep(DefaultDict),
        id: 'collect',
        name: '收藏',
        type: DictType.collect,
      },
      skip: {
        ...cloneDeep(DefaultDict),
        id: 'skip',
        name: '简单词',
        type: DictType.skip,
      },
      wrong: {
        ...cloneDeep(DefaultDict),
        id: 'wrong',
        name: '错词本',
        type: DictType.wrong,
      },
      myDicts: [
        {
          ...cloneDeep(DefaultDict),
          id: '新概念英语2-课文',
          name: '新概念英语2-课文',
          type: DictType.article,
          url: 'NCE_2.json',
          translateLanguage: 'common',
          language: 'en',
        },
        {
          ...cloneDeep(DefaultDict),
          id: '新概念英语2',
          name: '新概念英语2',
          type: DictType.word,
          url: 'nce-new-2.json',
          resourceId: 'nce-new-2',
          translateLanguage: 'common',
          language: 'en',
        }
      ],
      current: {
        // dictType: DictType.word,
        // index: 1,
        dictType: DictType.article,
        index: 0,
        editIndex: 0,
        repeatNumber: 0,
      },
      simpleWords: [
        'a', 'an',
        'i', 'my', 'you', 'your', 'me', 'it',
        'am', 'is', 'do', 'are', 'did', 'were',
        'what', 'who', 'where', 'how', 'no', 'yes',
        'not', 'can', 'could',
        'the', 'to', 'of', 'for', 'and', 'that', 'this', 'be'
      ],
      load: false
    }
  },
  getters: {
    skipWordNames: (state: State) => {
      return state.skip.originWords.map(v => v.name.toLowerCase())
    },
    skipWordNamesWithSimpleWords: (state: State) => {
      return state.skip.originWords.map(v => v.name.toLowerCase()).concat(state.simpleWords)
    },
    isArticle(state: State): boolean {
      return [
        DictType.article,
        DictType.customArticle
      ].includes(state.current.dictType)
    },
    currentDict(state: State): Dict {
      switch (state.current.dictType) {
        case DictType.collect:
          return state.collect
        case DictType.skip:
          return state.skip
        case DictType.wrong:
          return state.wrong
        case DictType.word:
        case DictType.article:
        case DictType.customWord:
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
      if ([DictType.word, DictType.customWord].includes(this.current.dictType)) {
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
        DictType.collect,
        DictType.wrong,
        DictType.skip,
      ].includes(this.current.dictType)) {

      } else {
        if ([
          DictType.word,
          DictType.customWord,
        ].includes(this.current.dictType)) {
          if (!this.currentDict.originWords.length) {
            let r = await fetch(`./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
            // let r = await fetch(`.${this.currentDict.url}`)0
            r.json().then(v => {
              if (this.currentDict.translateLanguage === 'common') {
                const runtimeStore = useRuntimeStore()
                fetch('./translate/en2zh_CN.json').then(r => {
                  r.json().then((list: Word[]) => {
                    console.time()
                    runtimeStore.translateWordList = list

                    v.map((w: Word) => {
                      let res = list.find(a => a.name === w.name)
                      if (res) w = Object.assign(w, res)
                    })

                    this.currentDict.originWords = cloneDeep(v)
                    this.currentDict.words = cloneDeep(v)
                    this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
                    this.load = true

                    console.timeEnd()
                  })
                })
              } else {
                this.currentDict.originWords = cloneDeep(v)
                this.currentDict.words = cloneDeep(v)
                this.currentDict.chapterWords = chunk(this.currentDict.words, this.currentDict.chapterWordNumber)
                this.load = true
              }
            })
          }
        }

        if ([
          DictType.article,
          DictType.customArticle,
        ].includes(this.current.dictType)) {
          console.log(1,this.currentDict)
          if (!this.currentDict.articles.length) {
            console.log(2)
            let r = await fetch(`./dicts/${this.currentDict.language}/${this.currentDict.type}/${this.currentDict.translateLanguage}/${this.currentDict.url}`)
            r.json().then((v: any[]) => {
              console.log(3)
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
      if ([DictType.collect,
        DictType.skip,
        DictType.wrong].includes(dict.type)) {
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