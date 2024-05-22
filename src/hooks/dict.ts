import {Article, Dict, DictType, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {chunk, cloneDeep} from "lodash-es";
import {isArticle} from "@/hooks/article.ts";
import {nanoid} from "nanoid";


export function useWordOptions() {
  const store = useBaseStore()

  function isWordCollect(val: Word) {
    return !!store.collectWord.find(v => v.word.toLowerCase() === val.word.toLowerCase())
  }

  function toggleWordCollect(val: Word) {
    let rIndex = store.collectWord.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.collectWord.splice(rIndex, 1)
    } else {
      let rIndex = store.simple2.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
      if (rIndex > -1) {
        store.simple2.splice(rIndex, 1)
      }
      store.collectWord.push(val)
    }
  }

  function isWordSimple(val: Word) {
    return !!store.simple2.find(v => v.word.toLowerCase() === val.word.toLowerCase())
  }

  function toggleWordSimple(val: Word) {
    let rIndex = store.simple2.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.simple2.splice(rIndex, 1)
    } else {
      let rIndex = store.collectWord.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
      if (rIndex > -1) {
        store.collectWord.splice(rIndex, 1)
      }
      store.simple2.push(val)
    }
  }

  function delWrongWord(val: Word) {
    let rIndex = store.wrong2.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.wrong2.splice(rIndex, 1)
    }
  }

  function delSimpleWord(val: Word) {
    let rIndex = store.simple2.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.simple2.splice(rIndex, 1)
    }
  }

  return {
    isWordCollect,
    toggleWordCollect,
    isWordSimple,
    toggleWordSimple,
    delWrongWord,
    delSimpleWord
  }
}

export function useArticleOptions() {
  const store = useBaseStore()

  function isArticleCollect(val: Article) {
    return !!store.collect.articles.find(v => v.title.toLowerCase() === val.title.toLowerCase())
  }

  function toggleArticleCollect(val: Article) {
    let rIndex = store.collect.articles.findIndex(v => v.title.toLowerCase() === val.title.toLowerCase())
    if (rIndex > -1) {
      store.collect.articles.splice(rIndex, 1)
    } else {
      store.collect.articles.push(val)
    }
  }

  return {
    isArticleCollect,
    toggleArticleCollect,
  }
}

//同步到我的词典列表
export function syncMyDictList(dict: Dict, isCustom = true) {
  const store = useBaseStore()
  //任意修改，都将其变为自定义词典
  dict.isCustom = isCustom
  if (isArticle(dict.type)) {
    dict.length = dict.articles.length
  } else {
    dict.length = dict.words.length
  }

  let rIndex = store.myDictList.findIndex(v => v.id === dict.id)
  if (rIndex > -1) {
    store.myDictList[rIndex] = cloneDeep(dict)
  } else {
    store.myDictList.push(cloneDeep(dict))
  }
}