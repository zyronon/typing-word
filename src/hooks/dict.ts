import {Word} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";


export function useWordOptions() {
  const store = useBaseStore()

  function isWordCollect(val: Word) {
    return !!store.collect.originWords.find(v => v.name.toLowerCase() === val.name.toLowerCase())
  }

  function toggleWordCollect(val: Word) {
    let rIndex = store.collect.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
    if (rIndex > -1) {
      store.collect.originWords.splice(rIndex, 1)
    } else {
      let rIndex = store.simple.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
      if (rIndex > -1) {
        store.simple.originWords.splice(rIndex, 1)
      }
      store.collect.originWords.push(val)
    }
  }

  function isWordSimple(val: Word) {
    return !!store.simple.originWords.find(v => v.name.toLowerCase() === val.name.toLowerCase())
  }

  function toggleWordSimple(val: Word) {
    let rIndex = store.simple.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
    if (rIndex > -1) {
      store.simple.originWords.splice(rIndex, 1)
    } else {
      let rIndex = store.collect.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
      if (rIndex > -1) {
        store.collect.originWords.splice(rIndex, 1)
      }
      store.simple.originWords.push(val)
    }
  }

  function delWrongWord(val: Word) {
    let rIndex = store.wrong.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
    if (rIndex > -1) {
      store.wrong.originWords.splice(rIndex, 1)
    }
  }

  function delSimpleWord(val: Word) {
    let rIndex = store.simple.originWords.findIndex(v => v.name.toLowerCase() === val.name.toLowerCase())
    if (rIndex > -1) {
      store.simple.originWords.splice(rIndex, 1)
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