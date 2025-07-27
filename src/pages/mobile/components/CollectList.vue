<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import BaseButton from "@/components/BaseButton.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import {Dict, DictType} from "@/types.ts";
import {useRouter} from "vue-router";
import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {cloneDeep} from "lodash-es";
import {useWordOptions} from "@/hooks/dict.ts";

const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
let practiceType = $ref(DictType.word)

const showCollectToggleButton = $computed(() => {
  if (store.sdict.type === DictType.collect) {
    // if (store.current.practiceType !== practiceType) {
    //   return (practiceType === DictType.word && store.collectWord.words.length) ||
    //       (practiceType === DictType.article && store.collectWord.articles.length)
    // }
  } else {
    return (practiceType === DictType.word && store.collectWord.words.length) ||
        (practiceType === DictType.article && store.collectWord.articles.length)
  }
  return false
})

function changeIndex(dict: Dict) {
  store.changeDict(dict, practiceType)
}

function addCollect() {
  runtimeStore.editDict = cloneDeep(store.collect)
  router.push({path: '/dict', query: {type: 'addWordOrArticle'}})
}

const {
  delWrongWord,
  delSimpleWord,
  toggleWordCollect,
} = useWordOptions()

</script>

<template>
  <div class="panel-page-item">
    <div class="list-header">
      <div class="left">
        <div class="dict-name">总词数：{{ store.collectWord.words.length }}</div>
        <BaseIcon icon="fluent:add-12-regular" title="添加" @click="addCollect"/>
      </div>
      <template v-if="showCollectToggleButton">
        <PopConfirm
            :title="`确认切换？`"
            @confirm="changeIndex( store.collect)"
        >
          <BaseButton size="small">切换</BaseButton>
        </PopConfirm>
      </template>
    </div>
    <WordList
        v-if="store.collectWord.words.length"
        class="word-list"
        :list="store.collectWord.words">
      <template v-slot:suffix="{item,index}">
        <BaseIcon
            class="del"
            @click="toggleWordCollect(item)"
            title="移除"
            icon="solar:trash-bin-minimalistic-linear"/>
      </template>
    </WordList>
  </div>
</template>

<style scoped lang="scss">

</style>
