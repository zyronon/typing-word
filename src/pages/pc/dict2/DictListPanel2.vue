<script setup lang="ts">

import {getDefaultDict, Sort,} from "@/types.ts";
import {groupBy, uniq} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";
import enFlag from "@/assets/img/flags/en.png";
import jaFlag from "@/assets/img/flags/ja.png";
import deFlag from "@/assets/img/flags/de.png";
import codeFlag from "@/assets/img/flags/code.png";
import BaseIcon from "@/components/BaseIcon.vue";
import {useNav} from "@/utils";
import {onMounted} from "vue";
import dict from '@/assets/dict.json'

const store = useBaseStore()

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

let dictData = $ref({})
let currentTabIndex = $ref('0')
let currentTranslateLanguage2 = $ref(1)
const currentLangDictList = $computed(() => {
  return dictData[currentTabIndex] ?? {}
})

const currentTranDictList = $computed(() => {
  return currentLangDictList[currentTranslateLanguage2] ?? {}
})

onMounted(() => {
  let d: any = groupBy(dict, 'langType')
  for (let dKey in d) {
    d[dKey] = groupBy(d[dKey], 'tranType')
    for (const dKey2 in d[dKey]) {
      d[dKey][dKey2] = groupBy(d[dKey][dKey2], 'category')
      for (const dKey3 in d[dKey][dKey2]) {
        d[dKey][dKey2][dKey3] = {
          tags: uniq(d[dKey][dKey2][dKey3].sort((a, b) => a.id - b.id).map(v => v.tags).flat()),
          list: d[dKey][dKey2][dKey3],
          name: dKey3
        }
      }
    }
  }
  dictData = d
  console.log('dict', d)
})

function formatLangType(val) {
  switch (Number(val)) {
    case 0:
      return '英语'
    case 1:
      return '汉语'
  }
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
                 :class="currentTabIndex === item && 'active'"
                 @click="currentTabIndex = item"
                 v-for="item in Object.keys(dictData)">
              <span>{{ formatLangType(item) }}</span>
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
          <el-radio-group v-model="currentTranslateLanguage2">
            <el-radio-button border v-for="i in Object.keys(currentLangDictList)" :value="i">{{
                formatLangType(i)
              }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <DictGroup
            v-for="item in currentTranDictList"
            :select-id="store.currentDict.id"
            @selectDict="change"
            :item="item"
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