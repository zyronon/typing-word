import {defineStore} from "pinia"
import {cloneDeep, merge} from "lodash-es";
import {DefaultShortcutKeyMap} from "@/types.ts";
import {SAVE_SETTING_KEY} from "@/utils/const.ts";
import {checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting} from "@/utils";

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
  load: boolean
}

export const DefaultSettingState = (): SettingState => ({
  showToolbar: true,
  show: false,
  showPanel: true,
  sideExpand: true,

  allSound: true,
  wordSound: true,
  wordSoundVolume: 100,
  wordSoundSpeed: 1,
  wordSoundType: 'us',
  keyboardSound: true,
  keyboardSoundVolume: 100,
  keyboardSoundFile: '机械键盘2',
  translateSound: true,
  translateSoundVolume: 100,
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
  load: false
})
export const DefaultChapterWordNumber = 30
export const useSettingStore = defineStore('setting', {
  state: (): SettingState => {
    return DefaultSettingState()
  },
  actions: {
    setState(obj: any) {
      //这样不会丢失watch的值的引用
      merge(this, obj)
    },
    init() {
      return new Promise(resolve => {
        let configStr = localStorage.getItem(SAVE_SETTING_KEY.key)
        if (!configStr) configStr = localStorage.getItem(SAVE_SETTING_KEY.oldKey)
        let data = checkAndUpgradeSaveSetting(configStr)
        this.setState(data)
        localStorage.setItem(SAVE_SETTING_KEY.key, JSON.stringify({val: this.$state, version: SAVE_SETTING_KEY.version}))
        this.load = true
        resolve(true)
      })
    }
  }
})
