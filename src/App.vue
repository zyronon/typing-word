<script setup lang="ts">

import {onMounted, watch} from "vue";
import {BaseState, useBaseStore} from "@/stores/base.ts";
import {Dict, DictType, SaveConfig, SaveDict} from "@/types.ts"
import Practice from "@/pages/practice/index.vue"
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import Backgorund from "@/components/Backgorund.vue";
import useTheme from "@/hooks/theme.ts";
import * as localforage from "localforage";
import SettingDialog from "@/components/dialog/SettingDialog.vue";
import ArticleContentDialog from "@/components/dialog/ArticleContentDialog.vue";
import {useStartKeyboardEventListener} from "@/hooks/event.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const {setTheme} = useTheme()

watch(store.$state, (n: BaseState) => {
  let data: BaseState = cloneDeep(n)
  data.myDictList.map((v: Dict) => {
    if (v.isCustom) {
      if (v.type === DictType.article) {
        v.articles.map(s => {
          delete s.sections
        })
      }
    } else {
      if (v.type === DictType.word) v.originWords = []
      if (v.type === DictType.article) v.articles = []
      v.words = []
      v.chapterWords = []
    }
  })
  localforage.setItem(SaveDict.key, JSON.stringify({val: data, version: SaveDict.version}))
})

watch(settingStore.$state, (n) => {
  localStorage.setItem(SaveConfig.key, JSON.stringify({val: n, version: SaveConfig.version}))
})

//检测几个特定词典
watch(store.collect.originWords, (n) => {
  store.collect.words = cloneDeep(n)
  store.collect.chapterWords = [store.collect.words]
})
watch(store.simple.originWords, (n) => {
  store.simple.words = cloneDeep(n)
  store.simple.chapterWords = [store.simple.words]
})
watch(store.wrong.originWords, (n) => {
  store.wrong.words = cloneDeep(n)
  store.wrong.chapterWords = [store.wrong.words]
})

async function init() {
  console.time()
  store.init().then(() => {
    store.load = true
    // console.timeEnd()
  })
  await settingStore.init()
  setTheme(settingStore.theme)
}

onMounted(() => {
  init()
})


</script>

<template>
  <Backgorund/>
  <router-view/>
  <ArticleContentDialog/>
  <SettingDialog v-if="runtimeStore.showSettingModal" @close="runtimeStore.showSettingModal = false"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.main-page {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14rem;
  display: flex;
  justify-content: center;
}
</style>
