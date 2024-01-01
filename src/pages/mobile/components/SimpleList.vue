<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/components/list/WordList.vue";
import BaseButton from "@/components/BaseButton.vue";
import PopConfirm from "@/components/PopConfirm.vue";
import {$ref} from "vue/macros";
import {Dict, DictType} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useWordOptions} from "@/hooks/dict.ts";
import Empty from "@/components/Empty.vue";
import {cloneDeep} from "lodash-es";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";

const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
let practiceType = $ref(DictType.word)

function changeIndex(dict: Dict) {
  store.changeDict(dict, practiceType)
}

const {
  delSimpleWord,
} = useWordOptions()

function addSimple() {
  runtimeStore.editDict = cloneDeep(store.simple)
  router.push({path: '/dict', query: {type: 'addWordOrArticle'}})
}
</script>

<template>
  <div class="panel-page-item">
    <div class="list-header">
      <div class="left">
        <div class="dict-name">总词数：{{ store.simple.words.length }}</div>
        <BaseIcon icon="fluent:add-12-regular" title="添加" @click="addSimple"/>
      </div>
      <template v-if="store.currentDict.type !== DictType.simple && store.simple.words.length">
        <PopConfirm
            :title="`确认切换？`"
            @confirm="changeIndex( store.simple)"
        >
          <BaseButton size="small">切换</BaseButton>
        </PopConfirm>
      </template>
    </div>
    <WordList
        v-if="store.simple.words.length"
        class="word-list"
        :list="store.simple.words">
      <template v-slot:suffix="{item,index}">
        <BaseIcon
            class="del"
            @click="delSimpleWord(item)"
            title="移除"
            icon="solar:trash-bin-minimalistic-linear"/>
      </template>
    </WordList>
    <Empty v-else/>
  </div>
</template>

<style scoped lang="scss">

</style>