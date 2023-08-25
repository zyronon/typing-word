import {defineStore} from 'pinia'
import {Config, Dict, DictType, SaveKey, Sort, State, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash";

export const useBaseStore = defineStore('base', {
    state: (): State => {
        return {
            newWordDict: {
                type: DictType.newWordDict,
                sort: Sort.normal,
                name: '生词本',
                description: '生词本',
                category: '',
                tags: [],
                url: '',
                length: -1,
                language: 'en',
                languageCategory: 'en',
                wordList: [],
                chapterList: [],
                chapterIndex: 0,
                wordIndex: 0,
                dictStatistics: []
            },
            skipWordDict: {
                type: DictType.skipWordDict,
                sort: Sort.normal,
                name: '已忽略',
                description: '已忽略',
                category: '',
                tags: [],
                url: '',
                length: -1,
                language: 'en',
                languageCategory: 'en',
                wordList: [],
                chapterList: [],
                chapterIndex: 0,
                wordIndex: 0,
                dictStatistics: []
            },
            wrongDict: {
                type: DictType.wrongDict,
                sort: Sort.normal,
                name: '已忽略',
                description: '已忽略',
                category: '',
                tags: [],
                url: '',
                length: -1,
                language: 'en',
                languageCategory: 'en',
                wordList: [],
                chapterList: [],
                chapterIndex: 0,
                wordIndex: 0,
                dictStatistics: []
            },
            dict: {
                type: DictType.inner,
                sort: Sort.normal,
                name: '新概念英语-2',
                description: '新概念英语第二册',
                category: '青少年英语',
                tags: ['新概念英语'],
                url: '/dicts/NCE_2.json',
                length: 858,
                language: 'en',
                languageCategory: 'en',
                wordList: [],
                chapterList: [],
                chapterIndex: 0,
                wordIndex: 0,
                dictStatistics: []
            },
            oldDicts: [],
            currentDictType: DictType.inner,
            sideIsOpen: false,
            dictModalIsOpen: false,
            dictModalIsOpen2: false,
            setting: {
                showToolbar: true,
                show: false,
                value1: false,
                value2: 50,
                value3: 1,
                value4: false,
            }
        }
    },
    getters: {
        skipWordNames: (state: State) => {
            return state.skipWordDict.wordList.map(v => v.name)
        },
        currentDict(state: State): Dict {
            switch (state.currentDictType) {
                case DictType.newWordDict:
                    return state.newWordDict
                case DictType.skipWordDict:
                    return state.skipWordDict
                case DictType.wrongDict:
                    return state.wrongDict
                case DictType.inner:
                case DictType.custom:
                    return state.dict
            }
        },
        chapter(): Word[] {
            return this.currentDict.chapterList[this.currentDict.chapterIndex] ?? []
        },
        word(): Word {
            return this.chapter[this.currentDict.wordIndex] ?? {
                trans: [],
                name: ''
            }
        },
    },
    actions: {
        setState(obj: any) {
            for (const [key, value] of Object.entries(obj)) {
                this[key] = value
            }
            // console.log('this/', this)
        },
        async init() {
            let configStr = localStorage.getItem(SaveKey)
            if (configStr) {
                let obj: Config = JSON.parse(configStr)
                this.setState(obj)
            }
            if (this.currentDictType === DictType.inner) {
                let r = await fetch(`/public/${this.dict.url}`)
                r.json().then(v => {
                    this.dict.wordList = v
                    this.dict.chapterList = chunk(this.dict.wordList, 15)
                })
            }
            if (this.currentDictType === DictType.custom) {
                let r = await fetch(`/public/${this.dict.url}`)
                r.json().then(v => {
                    this.dict.wordList = v
                    this.dict.chapterList = chunk(this.dict.wordList, 15)
                })
            }
            this.dictModalIsOpen = false
            this.dictModalIsOpen2 = false
        },
        async changeDict(dict: Dict, chapterIndex: number = -1, wordIndex: number = -1) {
            console.log('changeDict',dict)
            if ([DictType.newWordDict,
                DictType.skipWordDict,
                DictType.wrongDict].includes(dict.type)) {
                this.currentDictType = dict.type
                this[dict.type].chapterList = [this[dict.type].wordList]
                this[dict.type].chapterIndex = 0
                this[dict.type].wordIndex = wordIndex === -1 ? 0 : wordIndex
            } else {
                if (dict.name === this.dict.name) {
                    this.currentDictType = dict.type
                    if (wordIndex !== -1) this.dict.wordIndex = wordIndex
                    if (chapterIndex !== -1) this.dict.chapterIndex = chapterIndex
                } else {
                    // let r = await fetch(`/public/${dict.url}`)
                    // r.json().then(v => {
                    //     this.currentDictType === dict.type
                    // })
                    this.dict = cloneDeep(dict)
                    // this.dict.chapterList = chunk(this.dict.wordList, 15)
                    // this.dict.chapterIndex = chapterIndex === -1 ? 0 : chapterIndex
                    // this.dict.wordIndex = wordIndex === -1 ? 0 : wordIndex
                    this.currentDictType = dict.type
                }
            }
        }
    },
})