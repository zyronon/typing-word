import {defineStore} from "pinia"
import {cloneDeep} from "lodash-es";
import {DefaultShortcutKeyMap, SaveConfig} from "@/types.ts";

export interface SettingState {
  showToolbar: boolean,
  show: boolean,

  allSound: boolean,
  wordSound: boolean,
  wordSoundVolume: number,
  wordSoundSpeed: number,
  wordSoundType: string,
  keyboardSound: boolean,
  keyboardSoundVolume: number,
  keyboardSoundFile: string,
  translateSound: boolean,
  translateSoundVolume: number,
  effectSound: boolean,
  effectSoundVolume: number,
  repeatCount: number,
  repeatCustomCount?: number,
  dictation: boolean,
  translate: boolean,
  showNearWord: boolean
  ignoreCase: boolean
  allowWordTip: boolean
  waitTimeForChangeWord: number
  fontSize: {
    articleForeignFontSize: number,
    articleTranslateFontSize: number,
    wordForeignFontSize: number,
    wordTranslateFontSize: number,
  },
  showPanel: boolean,
  theme: string,
  collapse: boolean,
  shortcutKeyMap: Record<string, string>
}


export const useSettingStore = defineStore('setting', {
  state: (): SettingState => {
    return {
      showToolbar: true,
      show: false,
      showPanel: true,

      allSound: true,
      wordSound: true,
      wordSoundVolume: 100,
      wordSoundSpeed: 1,
      wordSoundType: 'us',
      keyboardSound: true,
      keyboardSoundVolume: 100,
      keyboardSoundFile: '老式机械',
      translateSound: true,
      translateSoundVolume: 100,
      effectSound: true,
      effectSoundVolume: 100,
      repeatCount: 1,
      repeatCustomCount: null,
      dictation: false,
      translate: true,

      showNearWord: true,
      ignoreCase: true,
      allowWordTip: true,
      fontSize: {
        articleForeignFontSize: 48,
        articleTranslateFontSize: 20,
        wordForeignFontSize: 48,
        wordTranslateFontSize: 20,
      },
      waitTimeForChangeWord: 300,

      theme: 'auto',
      collapse: false,
      shortcutKeyMap: cloneDeep(DefaultShortcutKeyMap)
    }
  },
  actions: {
    setState(obj: any) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value
      }
    },
    init() {
      return new Promise(resolve => {
        const setDefaultConfig = () => {
          localStorage.setItem(SaveConfig.key, JSON.stringify({val: this.$state, version: SaveConfig.version}))
        }
        let configStr = localStorage.getItem(SaveConfig.key)
        if (configStr) {
          try {
            let obj: any = JSON.parse(configStr)
            if (!obj.version) {
              setDefaultConfig()
            } else {
              if (obj.version !== SaveConfig.version) {
                setDefaultConfig()
              } else {
                this.setState(obj.val)
              }
            }
          } catch (e) {
            setDefaultConfig()
          }
        }
        resolve()
      })
    }
  }
})