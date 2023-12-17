<script setup lang="ts">

import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$computed, $ref} from "vue/macros";
import {groupBy} from "lodash-es";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {DictResource, languageCategoryOptions} from "@/types.ts";
import {onMounted} from "vue";
import DictGroup from "@/components/list/DictGroup.vue";
import router from "@/router.ts";

let index = $ref(1)

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

let articleData = $ref({
  translateLanguageList: [],
  currentTranslateLanguage: '',
  dictList: []
})

let wordData = $ref({
  translateLanguageList: [],
  currentTranslateLanguage: '',
  dictList: []
})

function getData(type: string) {
  let articleList = dictionaryResources.filter(v => v.type === type)
  let data = groupBy(articleList, 'translateLanguage')
  let translateLanguageList = Object.keys(data)
  let currentTranslateLanguage = translateLanguageList[0]

  const currentTranslateLanguageDictList = data[currentTranslateLanguage]
  const groupByCategory = groupBy(currentTranslateLanguageDictList, 'category')

  let dictList = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    dictList.push([key, groupByDictTags(value)])
  }
  return {
    translateLanguageList,
    currentTranslateLanguage,
    dictList,
  }
}

onMounted(() => {
  let temp = getData('article')
  articleData = temp
  let temp1 = getData('word')
  wordData = temp1
})

function selectDict(val) {
  console.log('val', val)
  router.push('/mobile/set-dict-plan')
}
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
    <SlideHorizontal
        v-model:index="index">
      <SlideItem>
        <div class="translate">
          <span>翻译：</span>
          <el-radio-group v-model="articleData.currentTranslateLanguage">
            <el-radio-button border v-for="i in articleData.translateLanguageList" :label="i">{{
                $t(i)
              }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <DictGroup
            v-for="item in articleData.dictList"
            :select-id="store.currentDict.id"
            :groupByTag="item[1]"
            :category="item[0]"
        />
      </SlideItem>
      <SlideItem style="display: flex;">
        <div class="scroll">
          <div class="translate">
            <span>翻译：</span>
            <el-radio-group v-model="wordData.currentTranslateLanguage">
              <el-radio-button border v-for="i in wordData.translateLanguageList" :label="i">{{
                  $t(i)
                }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <DictGroup
              @select-dict="selectDict"
              v-for="item in wordData.dictList"
              :select-id="store.currentDict.id"
              :groupByTag="item[1]"
              :category="item[0]"
          />
        </div>
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