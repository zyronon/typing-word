import {defineStore} from "pinia"

export interface SettingState {
  showToolbar: boolean,
  show: boolean,

  wordSound: boolean,
  wordSoundVolume: number,
  wordSoundSpeed: number,
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
  foreignLanguageFontSize: number,
  translateLanguageFontSize: number,

  value1: boolean,
  value2: number,
  value3: number,
  value4: boolean,
}

export const useSettingStore = defineStore('setting', {
  state: (): SettingState => {
    return {
      showToolbar: true,
      show: false,

      wordSound: true,
      wordSoundVolume: 100,
      wordSoundSpeed: 1,
      keyboardSound: true,
      keyboardSoundVolume: 100,
      keyboardSoundFile: '老式机械.mp3',
      translateSound: true,
      translateSoundVolume: 100,
      effectSound: true,
      effectSoundVolume: 100,
      repeatCount: 1,
      repeatCustomCount: null,
      dictation: true,
      translate: true,

      showNearWord: true,
      ignoreCase: true,
      allowWordTip: true,
      foreignLanguageFontSize: 48,
      translateLanguageFontSize: 20,
      waitTimeForChangeWord: 300,

      value1: false,
      value2: 50,
      value3: 1,
      value4: false,
    }
  },
})