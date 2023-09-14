import {Article, Sentence, TranslateEngine} from "@/types.ts";
import Baidu from "@opentranslate/baidu";
import {axiosInstance} from "@/utils/http.ts";
import {CnKeyboardMap, EnKeyboardMap, splitCNArticle} from "@/hooks/article.ts";
import {Translator} from "@opentranslate/translator/src/translator.ts";
import {cloneDeep} from "lodash-es";

export function updateLocalSentenceTranslate(article: Article, translate: string) {
  if (translate.trim()) {
    let articleTranslate = translate.split('\n')
    // console.log('articleTranslate', articleTranslate)
    let count = 0
    for (let i = 0; i < article.sections.length; i++) {
      let v = article.sections[i]
      for (let j = 0; j < v.length; j++) {
        let sentence = v[j]
        try {
          sentence.translate = articleTranslate[count]
        } catch (e) {
          console.log('没有对应的翻译', sentence.text)
        }
        count++
      }
      count++
    }
  }
}

export function getSentenceAllTranslateText(article: Article) {
  let str = ''
  article.sections.map((v: Sentence[]) => {
    v.map((w: Sentence, j, arr) => {
      if (w.translate) {
        str += w.translate + '\n'
      }
    })
    str += '\n'
  })
  return str
}

export function getSentenceAllText(article: Article) {
  let str = ''
  article.sections.map((v: Sentence[]) => {
    v.map((w: Sentence, j, arr) => {
      str += w.text
    })
    str += '\n'
  })
  return str
}

/***
 * @desc
 * @param article 文章实体
 * @param translateEngine 翻译引擎
 * @param allShow 是否翻译完所有之后才显示
 * @param progressCb 进度回调
 * */
export async function getNetworkTranslate(
  article: Article,
  translateEngine: TranslateEngine,
  allShow: boolean = false,
  progressCb?: (val: number) => void
) {
  if (article.networkTranslate) {
    updateLocalSentenceTranslate(article, article.networkTranslate)
  } else {
    let translator: Translator
    if (translateEngine === TranslateEngine.Baidu) {
      translator = new Baidu({
        axios: axiosInstance as any,
        config: {
          appid: "20230910001811857",
          key: "Xxe_yftQR3K3Ue43NQMC"
        }
      }) as any
    }


    if (translator) {
      if (!article.titleTranslate) {
        translator.translate(article.title, 'en', 'zh-CN').then(r => {
          article.titleTranslate = r.trans.paragraphs[0]
        })
      }

      let promiseList = []
      let retryCount = 0
      let retryCountMap = new Map()

      const translate = async (sentence: Sentence) => {
        try {
          let r = await translator.translate(sentence.text, 'en', 'zh-CN')
          if (r) {
            const cb = () => {
              sentence.translate = r.trans.paragraphs[0]
              if (!allShow) {
                //一次显示所有，顺序会乱
                article.networkTranslate += sentence.translate + '\n'
              }
            }
            return Promise.resolve(cb)
          } else {
            return Promise.reject(() => translate(sentence))
          }
        } catch (e) {
          return Promise.reject(() => translate(sentence))
        }
      }

      let total = 0
      let index = 0
      article.sections.map(v => total += v.length)

      for (let i = 0; i < article.sections.length; i++) {
        let v = article.sections[i]
        for (let j = 0; j < v.length; j++) {
          let sentence = v[j]
          let promise = translate(sentence)
          if (allShow) {
            promiseList.push(promise)
          } else {
            retryCountMap.set(sentence.text, 0)
            let errResult: any
            let cb = await promise.catch(err => {
              errResult = err
            })

            while (errResult) {
              let count = retryCountMap.get(sentence.text)
              if (count > 2) break
              cb = await errResult().catch(err => {
                errResult = err
              })
              retryCountMap.set(sentence.text, count + 1)
            }
            if (cb) cb()
            index++
            if (progressCb) {
              progressCb(Math.floor((index / total) * 100))
            }
          }
        }
      }

      if (promiseList.length) {
        let timer = -1
        let progress = 0
        if (progressCb) {
          timer = setInterval(() => {
            progress++
            if (progress > 90) {
              return clearInterval(timer)
            }
            progressCb(progress)
          }, 100)
        }

        return new Promise(async resolve => {
          let cbs = []
          do {
            if (retryCount > 2) {
              return resolve(true)
            }
            let results = await Promise.allSettled(promiseList)
            promiseList = []
            results.map(results => {
              if (results.status === 'fulfilled') {
                cbs.push(results.value)
              } else {
                promiseList.push(results.reason())
              }
            })
            retryCount++
          } while (promiseList.length)
          cbs.map(v => v())
          article.networkTranslate = getSentenceAllTranslateText(article)

          if (progressCb) {
            clearInterval(timer)
            progress = 100
            progressCb(100)
          }
          resolve(true)
        })
      } else {
        article.networkTranslate = getSentenceAllTranslateText(article)
      }
    }
  }
}