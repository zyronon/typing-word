import {defineStore} from "pinia"
import {checkAndUpgradeSaveSetting, cloneDeep} from "@/utils";
import {DefaultShortcutKeyMap} from "@/types/types.ts";
import {SAVE_SETTING_KEY} from "@/utils/const.ts";

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
  effectSound: boolean,
  effectSoundVolume: number,
  repeatCount: number,
  repeatCustomCount?: number,
  dictation: boolean,
  translate: boolean,
  detail: boolean,
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
  sideExpand: boolean,
  theme: string,
  collapse: boolean,
  chapterWordNumber: number,
  shortcutKeyMap: Record<string, string>,
  first: boolean
  firstTime: number
  load: boolean
}

export const DefaultChapterWordNumber = 30

export const getDefaultSettingState = (): SettingState => ({
  showToolbar: true,
  show: false,
  showPanel: true,
  sideExpand: false,

  allSound: true,
  wordSound: true,
  wordSoundVolume: 100,
  wordSoundSpeed: 1,
  wordSoundType: 'us',
  keyboardSound: true,
  keyboardSoundVolume: 100,
  keyboardSoundFile: '机械键盘2',
  effectSound: true,
  effectSoundVolume: 100,
  repeatCount: 1,
  repeatCustomCount: null,
  dictation: false,
  translate: true,
  detail: false,

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
  chapterWordNumber: DefaultChapterWordNumber,
  shortcutKeyMap: cloneDeep(DefaultShortcutKeyMap),
  first: true,
  firstTime: Date.now(),
  load: false
})

export const useSettingStore = defineStore('setting', {
  state: (): SettingState => {
    return getDefaultSettingState()
  },
  actions: {
    setState(obj: any) {
      this.$patch(obj)
    },
    init() {
      return new Promise(resolve => {
        let configStr = localStorage.getItem(SAVE_SETTING_KEY.key)
        let data = checkAndUpgradeSaveSetting(configStr)
        this.setState(data)
        this.load = true
        resolve(true)
      })
    }
  }
})
