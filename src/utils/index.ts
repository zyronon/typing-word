import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {BaseState, DefaultBaseState} from "@/stores/base.ts";
import {DefaultSettingState, SettingState} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import {Dict, DictResource, DictType, getDefaultDict} from "@/types.ts";
import {ArchiveReader, libarchiveWasm} from "libarchive-wasm";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {nanoid} from "nanoid";
import dayjs from 'dayjs'
import axios from "axios";
import {env} from "@/config/ENV.ts";
import {nextTick} from "vue";

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
        if (version <= 4) {
          state = defaultBaseState
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
  data.word.bookList.map((v: Dict) => {
    if (!v.custom) v.words = []
  })
  data.article.bookList.map((v: Dict) => {
    if (!v.custom) v.words = []
  })
  return data
}

export function isMobile(): boolean {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
}

export function getDictFile(url: string) {
  return new Promise<any[]>(async resolve => {
    let r = await fetch(url).catch(r => {
      console.log('getDictFile_error', r)
    })
    let v = await r.json()
    resolve(v)
  })
}

export function useNav() {
  const router = useRouter()
  const runtimeStore = useRuntimeStore()

  function nav(path, query = {}, data?: any) {
    if (data) {
      runtimeStore.routeData = cloneDeep(data)
    }
    router.push({path, query})
  }

  return {nav, back: router.back}
}

export function _dateFormat(val: any, format?: string): string {
  if (!val) return
  if (String(val).length === 10) {
    val = val * 1000
  }
  const d = new Date(Number(val))
  return dayjs(d).format(format)
}

export function _fetch(url: string) {
  return new Promise<any[]>(async (resolve, reject) => {
    await fetch(url).then(async r => {
      let v = await r.json()
      resolve(v)
    }).catch(r => {
      console.log('err', r)
      reject(r)
    })
  })
}

export async function _checkDictWords(dict: Dict) {
  console.log('_checkDictWords', dict)
  if ([DictType.collect,
    DictType.known,
    DictType.wrong].includes(dict.dictType)) {
  } else {
    //TODO　需要和其他需要下载的地方统一
    //如果不是自定义词典，并且有url地址才去下载
    if (!dict.custom && dict.fileName) {
      // let rrr = await axios('http://localhost/static/dict/en/zh/Top50Prepositions-v1.json')
      // console.log('r', rrr)
      // return
      let url = `http://localhost/index.php/v1/support/getDictFile?id=${dict.id}&v=${dict.version}`
      // let res: any = await axios(`http://localhost/index.php/v1/support/getDictFile?id=2`)
      let res: any
      try {
        res = await axios(url)
      } catch (err) {
        console.log('err', err)
      }
      console.log('res', res)
      //说明重定向了
      let r
      if (res && res.request.responseURL !== url) {
        r = res.data
      } else {
        let dictLocalUrl = `./dicts/${dict.language}/${dict.type}/${dict.translateLanguage}/${dict.url}`;
        let r3 = await fetch(dictLocalUrl)
        try {
          r = await r3.json()
        } catch (e) {
        }
        console.log('r', r)
      }
      // // dict.words = Object.freeze(v)
      // dict.words = v
      dict = Object.assign(dict, r)
    }
  }
}

export async function getWordDictList() {
  let url = `${env.api}/v1/support/getWordDictListFile?v=${env.word_dict_list_version}`
  let res: any = await axios(url)
  // let res: any = await axios(`http://localhost/index.php/v1/support/getDictFile?id=2`)
  console.log('res', res)
  //说明重定向了
  let r
  if (res.request.responseURL !== url) {
    r = res.data
  } else {
    let dictLocalUrl = `./word_dict_list.json`;
    let r3 = await fetch(dictLocalUrl)
    try {
      let r1 = await r3.json()
      r = r1.data
    } catch (e) {

    }
  }
  return r
}

//获取完成天数
export function _getAccomplishDays(total: number, dayNumber: number) {
  return Math.ceil(total / dayNumber)
}

//获取完成日期
export function _getAccomplishDate(total: number, dayNumber: number) {
  let d = _getAccomplishDays(total, dayNumber)
  return dayjs().add(d, 'day').format('YYYY-MM-DD')
}

//获取学习进度
export function _getStudyProgress(index: number, total: number) {
  return Number(((index / total) * 100).toFixed())
}

export function _nextTick(cb: () => void, time?: number) {
  if (time) {
    nextTick(() => setTimeout(cb, time))
  } else {
    nextTick(cb)
  }
}

export function _copy(val: string) {
  navigator.clipboard.writeText(val)
}

export function _parseLRC(lrc: string): { start: number, end: number, text: string }[] {
  const lines = lrc.split("\n").filter(line => line.trim() !== "");
  const regex = /\[(\d{2}):(\d{2}\.\d{2})\](.*)/;
  let parsed: any = [];

  for (let i = 0; i < lines.length; i++) {
    let match = lines[i].match(regex);
    if (match) {
      let start = parseFloat(match[1]) * 60 + parseFloat(match[2]); // 转换成秒
      let text = match[3].trim();

      // 计算结束时间（下一个时间戳）
      let nextMatch = lines[i + 1] ? lines[i + 1].match(regex) : null;
      let end = nextMatch ? parseFloat(nextMatch[1]) * 60 + parseFloat(nextMatch[2]) : null;

      parsed.push({start, end, text});
    }
  }

  return parsed;
}

export async function _getDictDataByUrl(val: Dict) {
  let dictResourceUrl = `./dicts/${val.language}/word/${val.url}`.replace('.json', '_v2.json');
  let s = await getDictFile(dictResourceUrl)
  let words = cloneDeep(s.map(v => {
    v.id = nanoid(6)
    return v
  }))
  return getDefaultDict({
    ...val,
    words
  })
}
