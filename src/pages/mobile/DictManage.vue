<script setup lang="ts">

import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$computed, $ref} from "vue/macros";
import {groupBy} from "lodash-es";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {DictResource, languageCategoryOptions} from "@/types.ts";

let index = $ref(0)

const store = useBaseStore()

let currentLanguage = $ref('my')
let currentTranslateLanguage = $ref('common')
let groupByLanguage = groupBy(dictionaryResources, 'language')
let translateLanguageList = $ref([])

function groupByDictTags(dictList: DictResource[]) {
  return dictList.reduce<Record<string, DictResource[]>>((result, dict) => {
    dict.tags.forEach((tag) => {
      if (Object.prototype.hasOwnProperty.call(result, tag)) {
        result[tag].push(dict)
      } else {
        result[tag] = [dict]
      }
    })
    return result
  }, {})
}

const groupByTranslateLanguage = $computed(() => {
  let data: any
  if (currentLanguage === 'article') {
    let articleList = dictionaryResources.filter(v => v.type === 'article')
    data = groupBy(articleList, 'translateLanguage')
  } else if (currentLanguage === 'my') {
    data = {
      common: store.myDictList.concat([{id: '',} as any])
    }
  } else {
    data = groupBy(groupByLanguage[currentLanguage], 'translateLanguage')
  }
  // console.log('groupByTranslateLanguage', data)
  translateLanguageList = Object.keys(data)
  currentTranslateLanguage = translateLanguageList[0]
  return data
})

const groupedByCategoryAndTag = $computed(() => {
  const currentTranslateLanguageDictList = groupByTranslateLanguage[currentTranslateLanguage]
  const groupByCategory = groupBy(currentTranslateLanguageDictList, 'category')

  let data = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    data.push([key, groupByDictTags(value)])
  }
  // console.log('groupedByCategoryAndTag', data)
  return data
})

</script>

<template>
  <div class="page dict-manage">
    <div class="tabs">
      <div class="tab"
           :class="currentLanguage === item.id && 'active'"
           @click="currentLanguage = item.id,index=i"
           v-for="(item,i) in languageCategoryOptions">
        <img :src='item.flag' alt=""/>
        <span>{{ item.name }}</span>
      </div>
    </div>
    <SlideHorizontal v-model:index="index">
      <SlideItem>
        1
      </SlideItem>
      <SlideItem>
        2
      </SlideItem>
      <SlideItem>3</SlideItem>
      <SlideItem>4</SlideItem>
    </SlideHorizontal>
  </div>
</template>

<style scoped lang="scss">
.dict-manage {
  font-size: 18rem;

  .tabs {
    height: 60rem;
    display: flex;
    width: 100%;
    border-bottom: 1px solid gray;

    .tab {
      width: 80rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>