<script setup lang="ts">

import TypingWord from "@/pages/mobile/practice/practice-word/TypingWord.vue";
import {useBaseStore} from "@/stores/base.ts";
import {onMounted} from "vue";
import {ShortcutKey, Word} from "@/types.ts";
import {EventKey, useEvents} from "@/utils/eventBus.ts";

const store = useBaseStore()

let wordData = $ref({
  words: [],
  index: -1
})

function getCurrentPractice() {

}

function sort(list: Word[]) {
  wordData.index = 0
  // syncMyDictList(store.currentDict)
}

function next() {
  getCurrentPractice()
}

onMounted(() => {
  getCurrentPractice()

})

useEvents([
  [EventKey.changeDict, getCurrentPractice],
  [EventKey.continueStudy, next],
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
