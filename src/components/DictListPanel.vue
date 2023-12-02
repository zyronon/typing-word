<script setup lang="ts">

import {DictResource, languageCategoryOptions} from "@/types.ts";
import {$computed, $ref} from "vue/macros";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {groupBy} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import DictList from "@/components/list/DictList.vue";
import DictGroup from "@/components/list/DictGroup.vue";

const emit = defineEmits<{
  add: [],
  selectDict: [val: { dict: any, index: number }]
}>()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

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
      common: store.myDictList.concat([{name: '',} as any])
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
              :list="groupByTranslateLanguage['common']"/>
        </template>
        <template v-else>
          <div class="translate">
            <span>翻译：</span>
            <el-radio-group v-model="currentTranslateLanguage">
              <el-radio-button border v-for="i in translateLanguageList" :label="i">{{ i }}</el-radio-button>
            </el-radio-group>
          </div>
          <DictGroup
              v-for="item in groupedByCategoryAndTag"
              :select-dict-name="runtimeStore.editDict.resourceId"
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
@import "@/assets/css/variable";

.dict-list-panel {
  width: 50%;
  height: 100%;
  $header-height: 60rem;
  padding: var(--space);
  padding-top: 0;
  box-sizing: border-box;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: $header-height;

    .tabs {
      display: flex;
      gap: 20rem;

      .tab {
        color: var(--color-font-1);
        cursor: pointer;
        padding: 10rem;
        padding-bottom: 5rem;
        transition: all .5s;
        border-bottom: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 6rem;

        &.active {
          border-bottom: 2px solid $main;
        }

        img {
          height: 30rem;
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
      padding-right: 10rem;

      .translate {
        display: flex;
        align-items: center;
        color: var(--color-font-1);
        margin-bottom: 30rem;

        & > span {
          font-size: 22rem;
        }
      }
    }
  }
}

</style>