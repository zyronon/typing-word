import {defineStore} from 'pinia'
import {Dict, DictId, getDefaultDict, Word} from "../types.ts"
import {cloneDeep} from "@/utils";
import * as localforage from "localforage";
import {nanoid} from "nanoid";
import {SAVE_DICT_KEY} from "@/utils/const.ts";
import {_getStudyProgress, checkAndUpgradeSaveDict, getDictFile} from "@/utils";
import {markRaw, shallowReactive} from "vue";

export interface BaseState {
  simpleWords: string[],
  load: boolean
  word: {
    studyIndex: number,
    bookList: Dict[],
  },
  article: {
    bookList: Dict[],
    studyIndex: number,
  }
}

export const DefaultBaseState = (): BaseState => ({
  simpleWords: [
    'a', 'an',
    'i', 'my', 'me', 'you', 'your', 'he', 'his', 'she', 'her', 'it',
    'what', 'who', 'where', 'how', 'when', 'which',
    'be', 'am', 'is', 'was', 'are', 'were', 'do', 'did', 'can', 'could', 'will', 'would',
    'the', 'that', 'this', 'and', 'not', 'no', 'yes',
    'to', 'of', 'for', 'at', 'in'
  ],
  load: false,
  word: {
    bookList: [
      getDefaultDict({id: DictId.wordCollect, name: '收藏'}),
      getDefaultDict({id: DictId.wordWrong, name: '错词'}),
      getDefaultDict({id: DictId.wordKnown, name: '已掌握'}),
      // getDefaultDict({
      //   id: 'nce-new-2',
      //   name: '新概念英语(新版)-2',
      //   description: '新概念英语新版第二册',
      //   category: '青少年英语',
      //   tags: ['新概念英语'],
      //   url: 'nce-new-2_v2.json',
      //   length: 862,
      //   translateLanguage: 'common',
      //   language: 'en',
      //   type: DictType.word
      // }),
    ],
    studyIndex: -1,
  },
  article: {
    bookList: [
      getDefaultDict({id: DictId.articleCollect, name: '收藏'})
    ],
    studyIndex: -1,
  }
})

export const useBaseStore = defineStore('base', {
  state: (): BaseState => {
    return DefaultBaseState()
  },
  getters: {
    collectWord(): Dict {
      return this.word.bookList[0]
    },
    collectArticle(): Dict {
      return this.article.bookList[0]
    },
    wrong(): Dict {
      return this.word.bookList[1]
    },
    known(): Dict {
      return this.word.bookList[2]
    },
    knownWords(): string[] {
      return this.known.words.map((v: Word) => v.word.toLowerCase())
    },
    knownWordsWithSimpleWords() {
      return this.known.words.map((v: Word) => v.word.toLowerCase()).concat(this.simpleWords)
    },
    currentStudyWordDict(): Dict {
      if (this.word.studyIndex >= 0) {
        return this.word.bookList[this.word.studyIndex] ?? getDefaultDict()
      }
      return getDefaultDict()
    },
    sdict(): Dict {
      return this.currentStudyWordDict
    },
    currentStudyProgress(): number {
      if (!this.sdict.words?.length) return 0
      if (this.sdict.complete) return 100
      return _getStudyProgress(this.sdict.lastLearnIndex, this.sdict.words?.length)
    },
    currentBook(): Dict {
      return this.article.bookList[this.article.studyIndex] ?? {}
    },
    currentBookProgress(): number {
      if (this.currentBook.name) return Number(Number(this.currentBook.lastLearnIndex / this.currentBook.length).toFixed(2))
      return 0
    },
  },
  actions: {
    setState(obj: BaseState) {
      obj.word.bookList.map(book => {
        book.words = shallowReactive(book.words)
        book.articles = shallowReactive(book.articles)
        book.statistics = shallowReactive(book.statistics)
      })
      obj.article.bookList.map(book => {
        book.words = shallowReactive(book.words)
        book.articles = shallowReactive(book.articles)
        book.statistics = shallowReactive(book.statistics)
      })
      this.$patch(obj)
    },
    async init(outData?: any) {
      return new Promise(async resolve => {
        try {
          if (outData) {
            this.setState(outData)
          } else {
            let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
            let data = checkAndUpgradeSaveDict(configStr)
            this.setState(data)
          }
          localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: this.$state, version: SAVE_DICT_KEY.version}))
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }

        if (this.article.studyIndex >= 1) {
          let current = this.article.bookList[this.article.studyIndex]
          let dictResourceUrl = `./dicts/${current.language}/${current.type}/${current.translateLanguage}/${current.url}`;
          if (!current.articles.length) {
            let s = await getDictFile(dictResourceUrl)
            current.articles = cloneDeep(s.map(v => {
              v.id = nanoid(6)
              return v
            }))
          }
          // console.log('this.currentBook', this.currentBook.articles[0])
        }
        resolve(true)
      })
    },
    //改变词典
    changeDict(val: Dict) {
      //把其他的词典的单词数据都删掉，全保存在内存里太卡了
      this.word.bookList.slice(3).map(v => {
        if (!v.custom) {
          v.words = shallowReactive([])
        }
      })
      let rIndex = this.word.bookList.findIndex((v: Dict) => v.id === val.id)
      if (val.words.length < val.perDayStudyNumber) {
        val.perDayStudyNumber = val.words.length
      }
      if (rIndex > -1) {
        this.word.studyIndex = rIndex
        this.word.bookList[this.word.studyIndex].words = shallowReactive(val.words)
        this.word.bookList[this.word.studyIndex].perDayStudyNumber = val.perDayStudyNumber
      } else {
        this.word.bookList.push(getDefaultDict(val))
        this.word.studyIndex = this.word.bookList.length - 1
      }
    },
  },
})
