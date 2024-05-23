import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {BaseState, DefaultBaseState} from "@/stores/base.ts";
import {DefaultSettingState, SettingState} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import {Dict, DictType} from "@/types.ts";
import {ArchiveReader, libarchiveWasm} from "libarchive-wasm";
import {useRouter} from "vue-router";

export function getRandom(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export function no() {
  ElMessage.warning('未现实')
}

export function checkAndUpgradeSaveDict(val: any) {
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
      state.load = false
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
        if (version <= 3) {
          // if (false) {
          let temp = (list: any[]): any[] => {
            return list.map(a => {
              return {
                word: a.name,
                trans: a.trans.map(b => {
                  return {
                    cn: b,
                  }
                }),
                phonetic0: a.usphone,
                phonetic1: a.ukphone,
              }
            })
          }
          state.myDictList.map(v => {
            if ([DictType.collect, DictType.simple, DictType.wrong].includes(v.type)) {
              v.originWords = temp(v.originWords)
              if (v.words) v.words = temp(v.words)
              v.chapterWords.map((s, i) => {
                v.chapterWords[i] = temp(s)
              })
            } else {
              if (v.isCustom) {
                if (v.type === DictType.word) {
                  v.originWords = temp(v.originWords)
                  if (v.words) v.words = temp(v.words)
                  v.chapterWords.map((s, i) => {
                    v.chapterWords[i] = temp(s)
                  })
                }
              }
            }
          })
        }
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

export function checkAndUpgradeSaveSetting(val: any) {
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
      state.load = false
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

export function isMobile(): boolean {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
}

export function getDictFile(url: string) {
  return new Promise<any[]>(async resolve => {
    let r = await fetch(url)
    if (url.includes('.7z')) {
      console.time()
      const data = await r.arrayBuffer();
      const mod = await libarchiveWasm();
      const reader = new ArchiveReader(mod, new Int8Array(data));
      for (const entry of reader.entries()) {
        if (entry.getPathname().endsWith('.json')) {
          let data = new TextDecoder().decode(entry.readData());
          resolve(JSON.parse(data))
        }
        console.timeEnd()
      }
      reader.free();
    } else {
      let v = await r.json()
      resolve(v)
    }
  })
}

export function useNav() {
  const router = useRouter()

  function nav(path, query = {}, data?: any) {
    // if (data) {
    //   store.routeData = cloneDeep(data)
    // }
    router.push({path, query})
  }

  return {nav, back: router.back}
}
