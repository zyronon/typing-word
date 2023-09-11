import {Article, Sentence, TranslateEngine} from "@/types.ts";
import Baidu from "@opentranslate/baidu";
import {axiosInstance} from "@/utils/http.ts";
import useSleep from "@/hooks/useSleep.ts";
import {CnKeyboardMap, useSplitCNArticle} from "@/hooks/useSplitArticle.ts";
import {Translator} from "@opentranslate/translator/src/translator.ts";

export function useLocalTranslate(article: Article, translate: string) {
  if (translate) {
    let articleTranslate = useSplitCNArticle(translate, 'cn', CnKeyboardMap)

    for (let i = 0; i < article.sections.length; i++) {
      let v = article.sections[i]
      for (let j = 0; j < v.length; j++) {
        let sentence = v[j]
        sentence.translate = articleTranslate[i][j].sentence
      }
    }
  }
}

/***
 * @desc
 * @param article 文章实体
 * @param translateEngine 翻译引擎
 * @param allShow 是否翻译完所有之后才显示
 * */
export async function useNetworkTranslate(article: Article, translateEngine: TranslateEngine, allShow: boolean = false) {
  if (article.networkTranslate) {
    useLocalTranslate(article, article.networkTranslate)
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
      let promiseList = []
      let retryCount = 0
      let retryCountMap = new Map()

      const translate = async (sentence: Sentence) => {
        try {
          let r = await translator.translate(sentence.sentence, 'en', 'zh-CN')
          if (r) {
            const cb = () => {
              sentence.translate = r.trans.paragraphs[0]
              article.networkTranslate += sentence.translate
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
            retryCountMap.set(sentence.sentence, 0)
            let errResult: any
            let cb = await promise.catch(err => {
              errResult = err
            })

            while (errResult) {
              let count = retryCountMap.get(sentence.sentence)
              if (count > 2) break
              cb = await errResult().catch(err => {
                errResult = err
              })
              retryCountMap.set(sentence.sentence, count + 1)
            }
            if (cb) cb()
            index++
            console.log(index, total)
          }
        }
      }
      if (!promiseList.length) return

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
        resolve(true)
      })
    }
  }
}