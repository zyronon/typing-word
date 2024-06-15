<script setup lang="ts">

import {DictResource, getDefaultDict, Sort,} from "@/types.ts";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {groupBy} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";
import enFlag from "@/assets/img/flags/en.png";
import jaFlag from "@/assets/img/flags/ja.png";
import deFlag from "@/assets/img/flags/de.png";
import codeFlag from "@/assets/img/flags/code.png";
import BaseIcon from "@/components/BaseIcon.vue";
import {useRouter} from "vue-router";
import {useNav} from "@/utils";

const emit = defineEmits<{
  add: [],
  selectDict: [val: { dict: any, index: number }]
}>()
const store = useBaseStore()

let currentLanguage = $ref('en')
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
  let data = groupBy(groupByLanguage[currentLanguage], 'translateLanguage')
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

function del(e) {
  store.myDictList.splice(e.index, 1)
}

const languageCategoryOptions = [
  {id: 'en', name: '英语', flag: enFlag},
  {id: 'ja', name: '日语', flag: jaFlag},
  {id: 'de', name: '德语', flag: deFlag},
  {id: 'code', name: 'Code', flag: codeFlag},
]

const {nav, back} = useNav()

function change(e) {
  console.log('e', e.dict)
  e.dict.sort = Sort.normal
  store.changeWordDict(getDefaultDict(e.dict))
  ElMessage.success('切换成功')
  back()
}
</script>

<template>
  <div class="dict-list-panel">
    <header class="flex justify-center pb-3">
      <div class="container2 flex justify-between items-center">
        <div class="flex items-center gap-5">
          <BaseIcon icon="ion:chevron-back" title="返回" @click="back"/>
          <div class="tabs">
            <div class="tab"
                 :class="currentLanguage === item.id && 'active'"
                 @click="currentLanguage = item.id"
                 v-for="item in languageCategoryOptions">
              <img :src='item.flag' alt=""/>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <BaseIcon icon="lucide:search"/>
      </div>
    </header>
    <div class="page-content">
      <div class="dict-list-wrapper">
        <div class="translate ">
          <span>释义：</span>
          <el-radio-group v-model="currentTranslateLanguage">
            <el-radio-button border v-for="i in translateLanguageList" :value="i">{{ $t(i) }}</el-radio-button>
          </el-radio-group>
        </div>
        <DictGroup
            v-for="item in groupedByCategoryAndTag"
            :select-id="store.currentDict.id"
            @selectDict="change"
            :groupByTag="item[1]"
            :category="item[0]"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.dict-list-panel {
  width: 100%;
  height: 100%;
  $header-height: 4rem;
  //padding: var(--space);
  padding-top: 0;
  box-sizing: border-box;

  header {
    position: fixed;
    top: 0;
    //left: var(--aside-width);
    //width: calc(100vw - var(--aside-width));
    left: 0;
    width: 100vw;
    z-index: 9;
    background: var(--color-main-bg);

    .tabs {
      display: flex;
      gap: 1.5rem;

      .tab {
        color: var(--color-font-1);
        cursor: pointer;
        padding: .3rem;
        transition: all .5s;
        border-bottom: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 0.6rem;

        &.active {
          $main: rgb(64, 158, 255);
          border-bottom: 2px solid $main;
        }

        img {
          height: 2rem;
        }
      }
    }
  }

  .page-content {
    padding-top: 4rem;
    display: flex;

    .dict-list-wrapper {
      flex: 1;
      overflow: auto;
      height: 100%;

      .translate {
        display: flex;
        align-items: center;
        color: var(--color-font-1);
        margin-bottom: 1rem;

        & > span {
          font-size: 1.2rem;
        }
      }
    }
  }
}

</style>