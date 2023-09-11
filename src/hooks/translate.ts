import {Article} from "@/types.ts";
import Baidu from "@opentranslate/baidu";
import {axiosInstance} from "@/utils/http.ts";
import useSleep from "@/hooks/useSleep.ts";
import {CnKeyboardMap, useSplitCNArticle} from "@/hooks/useSplitArticle.ts";

export async function useArticleTranslate(article: Article) {
  const baidu = new Baidu({
    axios: axiosInstance,
    config: {
      appid: "20230910001811857",
      key: "Xxe_yftQR3K3Ue43NQMC"
    }
  })

  let articleTranslate
  // if (article.translate) {
  if (false) {
    articleTranslate = useSplitCNArticle(article.translate, 'cn', CnKeyboardMap)
  }

  for (let i = 0; i < article.sections.length; i++) {
    let v = article.sections[i]
    for (let j = 0; j < v.length; j++) {
      let sentence = v[j]
      if (articleTranslate) {
        sentence.translate = articleTranslate[i][j].sentence
      } else {
        await useSleep(500)
        let r = await baidu.translate(sentence.sentence, 'en', 'zh-CN')
        console.log('r', r)
        sentence.translate = r.trans.paragraphs[0]
      }
    }
  }
}