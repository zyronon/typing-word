import {Article, Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {markRaw} from "vue";


export function useWordOptions() {
  const store = useBaseStore()

  function isWordCollect(val: Word) {
    return !!store.collectWord.words.find(v => v.word.toLowerCase() === val.word.toLowerCase())
  }

  function toggleWordCollect(val: Word) {
    let rIndex = store.collectWord.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.collectWord.words.splice(rIndex, 1)
    } else {
      store.collectWord.words.push(val)
      // store.collectWord.words = markRaw(store.collectWord.words.concat([val]))
    }
  }

  function isWordSimple(val: Word) {
    return !!store.known.words.find(v => v.word.toLowerCase() === val.word.toLowerCase())
  }

  function toggleWordSimple(val: Word) {
    let rIndex = store.known.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.known.words.splice(rIndex, 1)
    } else {
      let rIndex = store.collectWord.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
      if (rIndex > -1) {
        store.collectWord.words.splice(rIndex, 1)
      }
      store.known.words.push(val)
    }
  }

  function delWrongWord(val: Word) {
    let rIndex = store.wrong.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.wrong.words.splice(rIndex, 1)
    }
  }

  function delSimpleWord(val: Word) {
    let rIndex = store.known.words.findIndex(v => v.word.toLowerCase() === val.word.toLowerCase())
    if (rIndex > -1) {
      store.known.words.splice(rIndex, 1)
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
    return !!store.collectArticle.articles.find(v => v.title.toLowerCase() === val.title.toLowerCase())
  }

  function toggleArticleCollect(val: Article) {
    let rIndex = store.collectArticle.articles.findIndex(v => v.title.toLowerCase() === val.title.toLowerCase())
    if (rIndex > -1) {
      store.collectArticle.articles.splice(rIndex, 1)
    } else {
      store.collectArticle.articles.push(val)
    }
  }

  return {
    isArticleCollect,
    toggleArticleCollect,
  }
}

export function getCurrentStudyWord() {
  // console.time()
  const store = useBaseStore()
  let data = {new: [], review: [], write: []}
  let dict = store.sdict;
  if (dict.words?.length) {
    const getList = (startIndex: number, endIndex: number) => dict.words.slice(startIndex, endIndex)

    const perDay = store.sdict.perDayStudyNumber;
    const totalNeed = perDay * 3;
    let start = dict.lastLearnIndex;
    let end = start + dict.perDayStudyNumber

    if (dict.complete) {
      //如果是已完成，那么把应该学的新词放到复习词组里面
      dict.words.slice(start, end).map(item => {
        if (!store.knownWords.includes(item.word)) {
          data.review.push(item)
        }
      })
      //如果起点index 减去总默写不足的话，那就直接从最后面取
      //todo 这里有空了，优化成往前滚动取值
      if (start - totalNeed < 0) {
        end = dict.length
      } else {
        end = start
      }
    } else {
      dict.words.slice(start, end).map(item => {
        if (!store.knownWords.includes(item.word)) {
          data.new.push(item)
        }
      })
      end = start
      start = start - dict.perDayStudyNumber
      if (start < 0) start = 0
      //取上一次学习的单词用于复习
      let list = getList(start, end)
      list.map(item => {
        if (!store.knownWords.includes(item.word)) {
          data.review.push(item)
        }
      })

      end = start
    }

    // console.log(start,end)
    // end = start
    // start = start - dict.perDayStudyNumber * 3
    // //在上次学习再往前取前3次学习的单词用于默写
    // list = getList(start, end)
    // list.map(item => {
    //   if (!store.knownWords.includes(item.word)) {
    //     data.write.push(item)
    //   }
    // })

    //write数组放的是上上次之前的单词，总的数量为perDayStudyNumber * 3，取单词的规则为：从后往前取6个perDayStudyNumber的，越靠前的取的单词越多。

    // 上上次更早的单词
    if (end > 0) {
      const allWords = dict.words;
      const candidateWords = allWords.slice(0, end).filter(w => !store.knownWords.includes(w.word));

      // 分6组，每组 perDay 个
      const groupCount = 6;
      const groupSize = perDay;
      const groups: Word[][] = [];
      for (let i = 0; i < groupCount; i++) {
        const start = candidateWords.length - (i + 1) * groupSize;
        const end = candidateWords.length - i * groupSize;
        if (start < 0 && end <= 0) break;
        groups.unshift(candidateWords.slice(Math.max(0, start), Math.max(0, end)));
      }

      // 分配数量，靠前组多，靠后组少
      // 例如分配比例 [1,2,3,4,5,6]
      const ratio = [1, 2, 3, 4, 5, 6];
      const ratioSum = ratio.reduce((a, b) => a + b, 0);
      const realRatio = ratio.map(r => Math.round(r * totalNeed / ratioSum));

      // 按比例从每组取单词
      let writeWords: Word[] = [];
      for (let i = 0; i < groups.length; i++) {
        writeWords = writeWords.concat(groups[i].slice(-realRatio[i]));
      }
      // 如果数量不够，补足
      if (writeWords.length < totalNeed) {
        const extra = candidateWords.filter(w => !writeWords.includes(w)).slice(-(totalNeed - writeWords.length));
        writeWords = writeWords.concat(extra);
      }
      // 最终数量截断
      writeWords = writeWords.slice(-totalNeed);

      //这里需要反转一下，越靠近今天的单词，越先练习
      data.write = writeWords.reverse();
    }
  }
  // console.timeEnd()
  // console.log('data', data)
  return data
}
