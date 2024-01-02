<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import BaseButton from "@/components/BaseButton.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import {$ref} from "vue/macros";
import {Dict, DictType} from "@/types.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useWordOptions} from "@/hooks/dict.ts";
import Empty from "@/components/Empty.vue";

const store = useBaseStore()
let practiceType = $ref(DictType.word)

function changeIndex(dict: Dict) {
  store.changeDict(dict, practiceType)
}

const {
  delWrongWord,
} = useWordOptions()

</script>

<template>
  <div class="panel-page-item">
    <template v-if="store.wrong.words.length">
      <div class="list-header">
        <div class="dict-name">总词数：{{ store.wrong.words.length }}</div>
        <template
            v-if="store.currentDict.type !== DictType.wrong && store.wrong.words.length">
          <PopConfirm
              :title="`确认切换？`"
              @confirm="changeIndex( store.wrong)"
          >
            <BaseButton size="small">切换</BaseButton>
          </PopConfirm>
        </template>
      </div>
      <WordList
          class="word-list"
          :list="store.wrong.words">
        <template v-slot:suffix="{item,index}">
          <BaseIcon
              class="del"
              @click="delWrongWord(item)"
              title="移除"
              icon="solar:trash-bin-minimalistic-linear"/>
        </template>
      </WordList>
    </template>
    <Empty v-else/>
  </div>
</template>

<style scoped lang="scss">

</style>