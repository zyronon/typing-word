import {defineStore} from 'pinia'
import {Config, Dict, DictType, SaveKey, State, Word} from "../types.ts"
import {chunk, cloneDeep} from "lodash";

export const useBaseStore = defineStore('base', {
    state: (): State => {
        return {
            newWordDict: {
                type: DictType.newWordDict,
                wordList: [],
                chapterList: [],
                chapterIndex: -1,
                wordIndex: -1,
            },
            skipWordDict: {
                type: DictType.skipWordDict,
                wordList: [],
                chapterList: [],
                chapterIndex: -1,
                wordIndex: -1,
            },
            dict: {
                type: DictType.inner,
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
            },
            currentDictType: {
                name: DictType.inner,
                dictUrl: '/dicts/NCE_2.json'
            },
            sideIsOpen: false,
            dictModalIsOpen: false,
        }
    },
    getters: {
        skipWordNames: (state: State) => {
            return state.skipWordDict.wordList.map(v => v.name)
        },
        currentDict(state: State): Dict {
            switch (state.currentDictType.name) {
                case DictType.newWordDict:
                    return state.newWordDict
                case DictType.skipWordDict:
                    return state.skipWordDict
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
            console.log('this/', this)
        },
        async init() {
            let configStr = localStorage.getItem(SaveKey)
            if (configStr) {
                let obj: Config = JSON.parse(configStr)
                this.setState(obj)
            }
            if (this.currentDictType.name === DictType.inner) {
                let r = await fetch(`/public/${this.currentDictType.dictUrl}`)
                r.json().then(v => {
                    this.dict.wordList = v
                    this.dict.chapterList = chunk(this.dict.wordList, 15)
                })
            }
            if (this.currentDictType.name === DictType.custom) {
                let r = await fetch(`/public/${this.currentDictType.dictUrl}`)
                r.json().then(v => {
                    this.dict.wordList = v
                    this.dict.chapterList = chunk(this.dict.wordList, 15)
                })
            }
        },
        async changeDict(dict: Dict, chapterIndex: number = -1, wordIndex: number = -1) {
            if ([DictType.newWordDict, DictType.skipWordDict].includes(dict.type)) {
                this.currentDictType.name = dict.type
                this.currentDictType.dictUrl = ''
                this[dict.type].chapterList = [this[dict.type].wordList]
                this[dict.type].chapterIndex = chapterIndex === -1 ? 0 : chapterIndex
                this[dict.type].wordIndex = wordIndex === -1 ? 0 : wordIndex
            } else {
                if (dict.name === this.dict.name) {
                    this.currentDictType.name === dict.type
                    this.currentDictType.dictUrl = dict.url
                    if (wordIndex !== -1) this.dict.wordIndex = wordIndex
                    if (chapterIndex !== -1) this.dict.chapterIndex = chapterIndex
                } else {
                    // let r = await fetch(`/public/${dict.url}`)
                    // r.json().then(v => {
                    //     this.currentDictType.name === dict.type
                    //     this.currentDictType.dictUrl = dict.url
                    //
                    // })
                    this.dict = cloneDeep(dict)
                    this.dict.chapterList = chunk(this.dict.wordList, 15)
                    this.dict.chapterIndex = chapterIndex === -1 ? 0 : chapterIndex
                    this.dict.wordIndex = wordIndex === -1 ? 0 : wordIndex
                }

            }

        }
    },
})