import {Dict, DictResource} from "@/types/types.ts";
import {getDictFile} from "@/utils/index.ts";
import {cloneDeep} from "@/utils";
import {nanoid} from "nanoid";
import {getDefaultDict} from "@/types/func.ts";

export async function getArticleBookDataByUrl(val: DictResource) {
  let dictResourceUrl = `./dicts/${val.language}/${val.type}/${val.translateLanguage}/${val.url}`;
  let s = await getDictFile(dictResourceUrl)
  let articles = cloneDeep(s.map(v => {
    v.id = nanoid(6)
    return v
  }))
  return cloneDeep({
    ...getDefaultDict(),
    ...val,
    articles
  })
}
