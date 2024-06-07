<script setup lang="ts">

import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {cloneDeep} from "lodash-es";
import {_checkDictWords} from "@/utils";
import WordList from "@/pages/pc/components/list/WordList.vue";
import {getDefaultDict} from "@/types.ts";
import BasePage from "@/pages/pc/components/BasePage.vue";

const runtimeStore = useRuntimeStore()
const route = useRoute()
let dict = $ref(getDefaultDict())

onMounted(() => {
  switch (Number(route.query.type)) {
    case -1:
      if (runtimeStore.routeData) {
        dict = cloneDeep(runtimeStore.routeData)
        _checkDictWords(dict)
      }
      break
  }
})

</script>

<template>
  <BasePage>
    <div class="h-100 flex  ">
      <WordList
          ref="listRef"
          :list="dict.words"
      >
      </WordList>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

</style>