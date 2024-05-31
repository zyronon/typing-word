import {Article, Dict, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {cloneDeep, shuffle} from "lodash-es";
import {isArticle} from "@/hooks/article.ts";


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
    return !!store.collectArticle.find(v => v.title.toLowerCase() === val.title.toLowerCase())
  }

  function toggleArticleCollect(val: Article) {
    let rIndex = store.collectArticle.findIndex(v => v.title.toLowerCase() === val.title.toLowerCase())
    if (rIndex > -1) {
      store.collectArticle.splice(rIndex, 1)
    } else {
      store.collectArticle.push(val)
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

export function getCurrentStudyWord() {
  console.time()
  const store = useBaseStore()
  let data = {new: [], review: [], write: []}
  let c = store.currentStudy.word
  let dict = store.currentStudyWordDict;
  if (dict.words?.length) {
    for (let i = c.lastLearnIndex; i < dict.words.length; i++) {
      if (data.new.length >= c.perDayStudyNumber) break
      let item = dict.words[i]
      if (!store.simple2.map(v => v.word.toLowerCase()).includes(item.word.toLowerCase())) {
        data.new.push(item)
      }
    }

    const getList = (startIndex, endIndex) => {
      if (startIndex < 0) return []
      return dict.words.slice(startIndex, endIndex)
    }

    let s = c.lastLearnIndex - c.perDayStudyNumber
    let e = c.lastLearnIndex
    //取上一次学习的单词用于复习
    let list = getList(s, e)
    list.map(item => {
      if (!store.master.map(v => v.word.toLowerCase()).includes(item.word.toLowerCase())) {
        data.review.push(item)
      }
    })
    data.review = shuffle(data.review)

    //取前天至再往前数3天的单词，用于默写，
    Array.from({length: 4}).map((_, j) => {
      e = s
      s -= c.perDayStudyNumber
      list = getList(s, e)
      let d = []
      for (let i = 0; i < list.length; i++) {
        if (j === 3) {
          if (d.length >= c.perDayStudyNumber - data.write.length) break
        } else {
          if (d.length >= Math.floor(c.perDayStudyNumber / 4)) break
        }
        let item = list[i]
        if (!store.master.map(v => v.word.toLowerCase()).includes(item.word.toLowerCase())) {
          d.push(item)
        }
      }
      data.write = data.write.concat(d)
    })

    data.write = shuffle(data.write)
  }

  console.timeEnd()
  console.log('data', data)
  return data
}