import {DictResource, DictType} from "@/types.ts"
import {newDicts} from "@/assets/newDicts.ts";

// 英语文章
export const enArticle: DictResource[] = [
  {
    id: 'article_nce2',
    name: "新概念英语2-课文",
    description: '新概念英语2-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_2.json',
    length: 96,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  },
  {
    id: 'article_nce3',
    name: "新概念英语3-课文",
    description: '新概念英语3-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_3.json',
    length: 3,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  },
  {
    id: 'article_nce4',
    name: "新概念英语4-课文",
    description: '新概念英语4-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_4.json',
    length: 3,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  }
]

export const dictionaryResources: DictResource[] = [
  // ...chinaExam,
  // ...internationalExam,
  // ...childrenEnglish,
  ...newDicts,
  // ...enArticle,
]
