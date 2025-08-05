import {Article, ArticleWord, Dict, DictType, Word} from "@/types/types.ts";
import {shallowReactive} from "vue";

export function getDefaultWord(val: Partial<Word> = {}): Word {
  return {
    custom: false,
    "word": "",
    "phonetic0": "",
    "phonetic1": "",
    "trans": [],
    "sentences": [],
    "phrases": [],
    "synos": [],
    "relWords": {
      "root": "",
      "rels": []
    },
    "etymology": [],
    ...val
  }
}

export function getDefaultArticleWord(val: Partial<ArticleWord> = {}): ArticleWord {
  return getDefaultWord({
    nextSpace: true,
    isSymbol: false,
    symbolPosition: '',
    ...val
  }) as ArticleWord
}

export function getDefaultArticle(val: Partial<Article> = {}): Article {
  return {
    id: '',
    title: '',
    titleTranslate: '',
    text: '',
    textTranslate: '',
    newWords: [],
    textAllWords: [],
    sections: [],
    audioSrc: '',
    lrcPosition: [],
    questions: [],
    ...val
  }
}

export function getDefaultDict(val: Partial<Dict> = {}): Dict {
  return {
    id: '',
    name: '',
    description: '',
    url: '',
    length: 0,
    category: '',
    tags: [],
    translateLanguage: '',
    type: DictType.word,
    language: 'en',
    lastLearnIndex: 0,
    perDayStudyNumber: 20,
    custom: false,
    complete: false,
    ...val,
    words: shallowReactive(val.words ?? []),
    articles: shallowReactive(val.articles ?? []),
    statistics: shallowReactive(val.statistics ?? [])
  }
}
