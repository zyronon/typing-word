import {defineStore} from 'pinia'
import {Config, SaveKey, Word} from "../types.ts"
import {chunk} from "lodash";
import NCE_2 from "../assets/dicts/NCE_2.json";

export const useBaseStore = defineStore('base', {
    state: () => {
        return {
            newWords: [],
            skipWords: [],
            skipWordNames: [],
            wordList: [],
            wordListSplit: [],
            dict: 'nce2',
            chapterIndex: 0,
            wordIndex: 0,
            sideIsOpen: false,
        }
    },
    getters: {
        chapter: (state): Word[] => {
            return state.wordListSplit?.[state.chapterIndex] ?? []
        },
        word(state): Word {
            return this.chapter[state.wordIndex] ?? {
                trans: [],
                name: ''
            }
        },
    },
    actions: {
        init() {
            let configStr = localStorage.getItem(SaveKey)
            if (configStr) {
                let obj: Config = JSON.parse(configStr)
                this.newWords = obj.newWords
                this.skipWords = obj.skipWords
                this.skipWordNames = obj.skipWordNames
                this.dict = obj.dict
                this.chapterIndex = obj.chapterIndex
                this.wordIndex = 0
            }

            if (this.dict === 'nce2') {
                this.wordList = NCE_2
                this.wordListSplit = chunk(this.wordList, 15)
                // console.log('this.wordListSplit', this.wordListSplit)
                // let wordTemp = wordList?.[config.chapterIndex]?.[config.wordIndex]
                // if (wordTemp && config.skipWordNames.includes(wordTemp.name)) {
                //   next()
                // }
            }
        },
        setState(obj: any) {
            for (const [key, value] of Object.entries(obj)) {
                this[key] = value
            }
        }
    },
})