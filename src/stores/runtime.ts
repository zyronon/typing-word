import {defineStore} from "pinia"

export interface RuntimeState {
    disableEventListener: boolean
}

export const useRuntimeStore = defineStore('runtime', {
    state: (): RuntimeState => {
        return {
            disableEventListener: false
        }
    },
})