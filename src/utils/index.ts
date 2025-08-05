import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {BaseState, DefaultBaseState} from "@/stores/base.ts";
import {getDefaultSettingState} from "@/stores/setting.ts";
import {Dict, DictResource, DictType} from "@/types/types.ts";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {nanoid} from "nanoid";
import dayjs from 'dayjs'
import axios from "axios";
import {env} from "@/config/ENV.ts";
import {nextTick} from "vue";
import {dictionaryResources, enArticle} from "@/assets/dictionary.ts";
import {ElMessage} from "element-plus";
import {getDefaultArticle, getDefaultDict, getDefaultWord} from "@/types/func.ts";

export function no() {
  ElMessage.warning('未现实')
}

//检测多余字段，防止人为删除数据，导致数据不完整报错
function checkRiskKey(origin: object, target: object) {
  for (const [key, value] of Object.entries(origin)) {
    if (target[key] !== undefined) origin[key] = target[key]
  }
}

export function checkAndUpgradeSaveDict(val: any) {
  // console.log(configStr)
  // console.log('s', new Blob([val]).size)
  // val = ''
  let defaultState = DefaultBaseState()
  if (val) {
    try {
      let data: any
      if (typeof val === 'string') {
        data = JSON.parse(val)
      } else {
        data = val
      }
      if (!data.version) return defaultState
      let state: any = data.val
      if (typeof state !== 'object') return defaultState
      state.load = false
      let version = Number(data.version)
      // console.log('state', state)
      if (version === SAVE_DICT_KEY.version) {
        //防止人为删除数据，导致数据不完整报错
        for (const [key, value] of Object.entries(defaultState)) {
          if (state[key] !== undefined) defaultState[key] = state[key]
        }
        return defaultState
      } else {
        if (version === 3) {
          let studyDictId = ''
          if (state.current.index >= 0) {
            let dict = state.myDictList[state.current.index]
            if (dict) {
              studyDictId = dict.id
            }
          }

          const safeString = (str) => (typeof str === 'string' ? str.trim() : '');

          function formatWord(dict) {
            dict.words = dict.words.map(v => {
              return getDefaultWord({
                word: v.name,
                phonetic0: v.usphone,
                phonetic1: v.ukphone,
                trans: v.trans.map(line => {
                  const match = line.match(/^([^\s.]+\.?)\s*(.*)$/);
                  if (match) {
                    let pos = safeString(match[1]);
                    let cn = safeString(match[2]);

                    // 如果 pos 不是常规词性（不以字母开头），例如 "【名】"
                    if (!/^[a-zA-Z]+\.?$/.test(pos)) {
                      cn = safeString(line); // 整行放到 cn
                      pos = ''; // pos 置空
                    }

                    return {pos, cn};
                  }
                  return {pos: '', cn: safeString(line)};
                })
              })
            })
            dict.statistics = dict.statistics.map(v => {
              return {
                startDate: v.startDate,
                spend: v.endDate - v.startDate,
                total: v.total,
                new: v.total,
                wrong: v.wrongWordNumber
              }
            })
            dict.articles = dict.articles.map(v => {
              let r = getDefaultArticle({
                textTranslate: v.textCustomTranslate
              })
              checkRiskKey(r, v)
              return r
            })
          }

          state.myDictList.map((v: any) => {
            try {
              let currentDictId = v.id
              let currentType = v.type
              delete v.type
              if (['collect', 'simple', 'wrong'].includes(v.type)) {
                formatWord(v)
                delete v.id
                delete v.name
                if (currentType === 'collect') {
                  if (currentDictId === studyDictId) defaultState.word.studyIndex = 0
                  checkRiskKey(defaultState.word.bookList[0], v)
                }
                if (currentType === 'simple') {
                  if (currentDictId === studyDictId) defaultState.word.studyIndex = 2
                  checkRiskKey(defaultState.word.bookList[2], v)
                }
                if (currentType === 'wrong') {
                  if (currentDictId === studyDictId) defaultState.word.studyIndex = 1
                  checkRiskKey(defaultState.word.bookList[1], v)
                }
              }
              if (currentType === 'word') {
                if (v.isCustom) {
                  formatWord(v)
                  let dict = getDefaultDict({custom: true})
                  checkRiskKey(dict, v)
                  defaultState.word.bookList.push(dict)
                  if (currentDictId === studyDictId) defaultState.word.studyIndex = defaultState.word.bookList.length - 1
                } else {
                  //当时把选中的词典的id设为随机了，导致通过id找不到
                  let r = dictionaryResources.find(a => a.name === v.name)
                  if (r) {
                    formatWord(v)
                    let dict = getDefaultDict(r)
                    checkRiskKey(dict, v)
                    dict.id = r.id
                    defaultState.word.bookList.push(dict)
                    if (currentDictId === studyDictId) defaultState.word.studyIndex = defaultState.word.bookList.length - 1
                  }
                }
              }
              if (currentType === 'article') {
                if (v.isCustom) {
                  formatWord(v)
                  let dict = getDefaultDict({custom: true})
                  checkRiskKey(dict, v)
                  defaultState.article.bookList.push(dict)
                  if (currentDictId === studyDictId) defaultState.article.studyIndex = defaultState.article.bookList.length - 1
                } else {
                  //当时把选中的词典的id设为随机了
                  let r = enArticle.find(a => a.name === v.name)
                  if (r) {
                    formatWord(v)
                    let dict = getDefaultDict(r)
                    checkRiskKey(dict, v)
                    dict.id = r.id
                    defaultState.article.bookList.push(dict)
                    if (currentDictId === studyDictId) defaultState.article.studyIndex = defaultState.article.bookList.length - 1
                  }
                }
              }
            } catch (e) {
              console.log('升级数据失败！')
            }
          })
        }
        //防止人为删除数据，导致数据不完整报错
        for (const [key, value] of Object.entries(defaultState)) {
          if (state[key] !== undefined) defaultState[key] = state[key]
        }
        return defaultState
      }
    } catch (e) {
      return defaultState
    }
  }
  return defaultState
}

export function checkAndUpgradeSaveSetting(val: any) {
  // console.log(configStr)
  // console.log('s', new Blob([val]).size)
  // val = ''
  let defaultState = getDefaultSettingState()
  if (val) {
    try {
      let data
      if (typeof val === 'string') {
        data = JSON.parse(val)
      } else {
        data = val
      }
      if (!data.version) return defaultState
      let state: any = data.val
      if (typeof state !== 'object') return defaultState
      state.load = false
      let version = Number(data.version)
      if (version === SAVE_SETTING_KEY.version) {
        checkRiskKey(defaultState, state)
        return defaultState
      } else {
        //为了保持永远是最新的快捷键选项列表，但保留住用户的自定义设置，去掉无效的快捷键选项
        //例: 2版本，可能有快捷键A。3版本没有了
        checkRiskKey(defaultState.shortcutKeyMap, state.shortcutKeyMap)
        delete state.shortcutKeyMap
        checkRiskKey(defaultState, state)
        return defaultState
      }
    } catch (e) {
      return defaultState
    }
  }
  return defaultState
}

//筛选未自定义的词典，未自定义的词典不需要保存单词，用的时候再下载
export function shakeCommonDict(n: BaseState): BaseState {
  let data: BaseState = cloneDeep(n)
  data.word.bookList.map((v: Dict) => {
    if (!v.custom) v.words = []
  })
  data.article.bookList.map((v: Dict) => {
    if (!v.custom) v.articles = []
  })
  return data
}

export function isMobile(): boolean {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
}

export async function getDictFile(url: string) {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch (err) {
    console.log('getDictFile_error', err);
    return null;
  }
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
  if (dayNumber <= 0) return '-'
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

export async function _getDictDataByUrl(val: DictResource, type: DictType = DictType.word): Promise<Dict> {
  let dictResourceUrl = `./dicts/${val.language}/word/${val.url}`.replace('.json', '_v2.json');
  if (type === DictType.article) {
    dictResourceUrl = `./dicts/${val.language}/${val.type}/${val.url}`;
  }
  let s = await getDictFile(dictResourceUrl)
  if (s) {
    if (type === DictType.word) {
      let words = cloneDeep(s.map(v => {
        v.id = nanoid(6)
        return v
      }))
      return getDefaultDict({...val, words})
    } else {
      let articles = cloneDeep(s.map(v => {
        v.id = nanoid(6)
        return v
      }))
      console.log('articles',articles)
      return getDefaultDict({...val, articles})
    }
  }
  return getDefaultDict()
}

//从字符串里面转换为Word格式
export function convertToWord(raw: any) {
  const safeString = (str) => (typeof str === 'string' ? str.trim() : '');
  const safeSplit = (str, sep) =>
    safeString(str) ? safeString(str).split(sep).filter(Boolean) : [];

  // 1. trans
  const trans = safeSplit(raw.trans, '\n').map(line => {
    const match = line.match(/^([^\s.]+\.?)\s*(.*)$/);
    if (match) {
      let pos = safeString(match[1]);
      let cn = safeString(match[2]);

      // 如果 pos 不是常规词性（不以字母开头），例如 "【名】"
      if (!/^[a-zA-Z]+\.?$/.test(pos)) {
        cn = safeString(line); // 整行放到 cn
        pos = ''; // pos 置空
      }

      return {pos, cn};
    }
    return {pos: '', cn: safeString(line)};
  });

  // 2. sentences
  const sentences = safeSplit(raw.sentences, '\n\n').map(block => {
    const [c, cn] = block.split('\n');
    return {c: safeString(c), cn: safeString(cn)};
  });

  // 3. phrases
  const phrases = safeSplit(raw.phrases, '\n\n').map(block => {
    const [c, cn] = block.split('\n');
    return {c: safeString(c), cn: safeString(cn)};
  });

  // 4. synos
  const synos = safeSplit(raw.synos, '\n\n').map(block => {
    const lines = block.split('\n').map(safeString);
    const [posCn, wsStr] = lines;
    let pos = '';
    let cn = '';

    if (posCn) {
      const posMatch = posCn.match(/^([a-zA-Z.]+)(.*)$/);
      pos = posMatch ? safeString(posMatch[1]) : '';
      cn = posMatch ? safeString(posMatch[2]) : safeString(posCn);
    }
    const ws = wsStr ? wsStr.split('/').map(safeString) : [];

    return {pos, cn, ws};
  });

  // 5. relWords
  const relWordsText = safeString(raw.relWords);
  let root = '';
  const rels = [];

  if (relWordsText) {
    const relLines = relWordsText.split('\n').filter(Boolean);
    if (relLines.length > 0) {
      root = safeString(relLines[0].replace(/^词根:/, ''));
      let currentPos = '';
      let currentWords = [];

      for (let i = 1; i < relLines.length; i++) {
        const line = relLines[i].trim();
        if (!line) continue;

        if (/^[a-z]+\./i.test(line)) {
          if (currentPos && currentWords.length > 0) {
            rels.push({pos: currentPos, words: currentWords});
          }
          currentPos = safeString(line.replace(':', ''));
          currentWords = [];
        } else if (line.includes(':')) {
          const [c, cn] = line.split(':');
          currentWords.push({c: safeString(c), cn: safeString(cn)});
        }
      }
      if (currentPos && currentWords.length > 0) {
        rels.push({pos: currentPos, words: currentWords});
      }
    }
  }

  // 6. etymology
  const etymology = safeSplit(raw.etymology, '\n\n').map(block => {
    const lines = block.split('\n').map(safeString);
    const t = lines.shift() || '';
    const d = lines.join('\n').trim();
    return {t, d};
  });

  return getDefaultWord({
    id: raw.id,
    word: safeString(raw.word),
    phonetic0: safeString(raw.phonetic0),
    phonetic1: safeString(raw.phonetic1),
    trans,
    sentences,
    phrases,
    synos,
    relWords: {root, rels},
    etymology,
    custom: true
  });
}

export function cloneDeep<T>(val: T) {
  return JSON.parse(JSON.stringify(val))
}

export function shuffle<T>(array: T[]): T[] {
  const result = array.slice(); // 复制数组，避免修改原数组
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 生成 0 ~ i 的随机索引
    [result[i], result[j]] = [result[j], result[i]]; // 交换元素
  }
  return result;
}

export function last<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined;
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(func: T, wait: number) {
  let lastTime = 0;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

export function reverse<T>(array: T[]): T[] {
  return array.slice().reverse();
}

export function groupBy<T extends Record<string, any>>(array: T[], key: string) {
  return array.reduce<Record<string, T[]>>((result, item) => {
    const groupKey = String(item[key]);
    (result[groupKey] ||= []).push(item);
    return result;
  }, {});
}
