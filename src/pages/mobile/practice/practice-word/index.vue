<script setup lang="ts">

import TypingWord from "@/pages/mobile/practice/practice-word/TypingWord.vue";

import {cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted, onUnmounted} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey, Word} from "@/types.ts";
import {emitter, EventKey, useEvent, useEvents} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {syncMyDictList} from "@/hooks/dict.ts";

const store = useBaseStore()

let wordData = $ref({
  words: [],
  index: -1
})

function getCurrentPractice() {

}

function sort(list: Word[]) {
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

function next() {
  getCurrentPractice()
}

onMounted(() => {
  getCurrentPractice()

})

useEvents([
  [EventKey.changeDict, getCurrentPractice],
  [EventKey.next, next],
  [ShortcutKey.NextChapter, next],
])

defineExpose({getCurrentPractice})

</script>

<template>
  <div class="practice">
    <TypingWord
        @sort="sort"
        v-model:words="wordData.words"
        :index="wordData.index"/>
  </div>
</template>

<style scoped lang="scss">
.practice {
  flex: 1;
  display: flex;
}
</style>
