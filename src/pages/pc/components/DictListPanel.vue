<script setup lang="ts">

import {DictResource, languageCategoryOptions} from "@/types.ts";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {groupBy} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import DictList from "@/pages/pc/components/list/DictList.vue";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";

const emit = defineEmits<{
  add: [],
  selectDict: [val: { dict: any, index: number }]
}>()
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
      common: store.myDictList.map((v, i) => {
        if (i >= 3) {
          // v.showDel = true
        }
        return v
      }).concat([{id: '',} as any])
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

function del(e) {
  store.myDictList.splice(e.index, 1)
}

</script>

<template>
  <div class="dict-list-panel">
    <header>
      <div class="tabs">
        <div class="tab"
             :class="currentLanguage === item.id && 'active'"
             @click="currentLanguage = item.id"
             v-for="item in languageCategoryOptions">
          <img :src='item.flag' alt=""/>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </header>
    <div class="page-content">
      <div class="dict-list-wrapper">
        <template v-if="currentLanguage === 'my'">
          <DictList
              @add="emit('add')"
              @selectDict="e => emit('selectDict',e)"
              @del="del"
              :select-id="store.currentDict.id"
              :list="groupByTranslateLanguage['common']"/>
        </template>
        <template v-else>
          <div class="translate ">
            <span>释义：</span>
            <el-radio-group v-model="currentTranslateLanguage">
              <el-radio-button border v-for="i in translateLanguageList" :value="i">{{ $t(i) }}</el-radio-button>
            </el-radio-group>
          </div>
          <DictGroup
              v-for="item in groupedByCategoryAndTag"
              :select-id="store.currentDict.id"
              @selectDict="e => emit('selectDict',e)"
              :groupByTag="item[1]"
              :category="item[0]"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.dict-list-panel {
  width: 50%;
  height: 100%;
  $header-height: 5rem;
  //padding: var(--space);
  padding-top: 0;
  box-sizing: border-box;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: $header-height;

    .tabs {
      display: flex;
      gap: 2rem;

      .tab {
        color: var(--color-font-1);
        cursor: pointer;
        padding: 1rem;
        padding-bottom: 0.5rem;
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
    display: flex;
    height: calc(100% - $header-height);

    .dict-list-wrapper {
      flex: 1;
      overflow: auto;
      height: 100%;
      padding-right: 1rem;

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
