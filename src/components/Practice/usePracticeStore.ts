import {defineStore} from "pinia"
import {State, Word} from "@/types.ts"

export interface PracticeState {
    index: number,
    words: Word[],
    wrongWords: Word[],
    originWrongWords: Word[],
    repeatNumber: number,
    startDate: number,
    correctRate: number,
    total: number,
    inputNumber: number,
    wrongNumber: number,
}

export const usePracticeStore = defineStore('practice', {
    state: (): PracticeState => {
        return {
            index: -1,
            words: [],
            wrongWords: [],
            originWrongWords: [],
            repeatNumber: 0,
            startDate: Date.now(),
            correctRate: -1,
            total: -1,
            inputNumber: -1,
            wrongNumber: -1,
        }
    },
    getters: {
        word(state: PracticeState): Word {
            return state.words[state.index] ?? {
                trans: [],
                name: '',
                usphone: '',
                ukphone: '',
            }
        },
    }
})