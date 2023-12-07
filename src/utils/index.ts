import localforage from "localforage";
import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {BaseState, DefaultBaseState} from "@/stores/base.ts";
import {DefaultSettingState, SettingState} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import {Dict, DictType} from "@/types.ts";

export function getRandom(a: number, b: number): number {
    return Math.random() * (b - a) + a;
}

export function no() {
    ElMessage.warning('未现实')
}

export function checkAndUpgradeSaveDict(val: string) {
    // console.log(configStr)
    // console.log('s', new Blob([val]).size)
    // val = ''
    if (val) {
        try {
            let data
            if (typeof val === 'string') {
                data = JSON.parse(val)
            } else {
                data = val
            }
            let state: BaseState = data.val
            if (typeof state !== 'object') {
                return {}
            }
            if (!data.version) {
                return {}
            }
            let version = Number(data.version)
            // console.log('state', state)
            let defaultBaseState = DefaultBaseState()
            if (version === SAVE_DICT_KEY.version) {
                //防止人为删除数据，导致数据不完整报错
                for (const [key, value] of Object.entries(defaultBaseState)) {
                    if (state[key] !== undefined) defaultBaseState[key] = state[key]
                }
                return defaultBaseState
            } else {
                //防止人为删除数据，导致数据不完整报错
                for (const [key, value] of Object.entries(defaultBaseState)) {
                    if (state[key] !== undefined) defaultBaseState[key] = state[key]
                }
                return defaultBaseState
            }
        } catch (e) {
            return {}
        }
    }
    return {}
}

export function checkAndUpgradeSaveSetting(val: string) {
    // console.log(configStr)
    // console.log('s', new Blob([val]).size)
    // val = ''
    if (val) {
        try {
            let data
            if (typeof val === 'string') {
                data = JSON.parse(val)
            } else {
                data = val
            }
            let state: SettingState = data.val
            if (typeof state !== 'object') {
                return {}
            }
            if (!data.version) {
                return {}
            }
            let version = Number(data.version)

            let defaultSettingState = DefaultSettingState()
            if (version === SAVE_SETTING_KEY.version) {
                //防止人为删除数据，导致数据不完整报错
                for (const [key, value] of Object.entries(defaultSettingState)) {
                    if (state[key] !== undefined) defaultSettingState[key] = state[key]
                }
                return defaultSettingState
            } else {
                //为了保持永远是最新的快捷键选项列表，但保留住用户的自定义设置，去掉无效的快捷键选项
                //例: 2版本，可能有快捷键A。3版本没有了
                for (const [key, value] of Object.entries(defaultSettingState.shortcutKeyMap)) {
                    if (state.shortcutKeyMap[key] !== undefined) defaultSettingState.shortcutKeyMap[key] = state.shortcutKeyMap[key]
                }
                delete state.shortcutKeyMap

                for (const [key, value] of Object.entries(defaultSettingState)) {
                    if (state[key] !== undefined) defaultSettingState[key] = state[key]
                }
                return defaultSettingState
            }
        } catch (e) {
            return {}
        }
    }
    return {}
}

//筛选未自定义的词典，未自定义的词典不需要保存单词，用的时候再下载
export function shakeCommonDict(n: BaseState): BaseState {
    let data: BaseState = cloneDeep(n)
    data.myDictList.map((v: Dict) => {
        if (v.isCustom) {
            if (v.type === DictType.article) {
                v.articles.map(s => {
                    delete s.sections
                })
            }
        } else {
            if (v.type === DictType.word) v.originWords = []
            if (v.type === DictType.article) v.articles = []
            v.words = []
            v.chapterWords = []
        }
    })
    return data
}