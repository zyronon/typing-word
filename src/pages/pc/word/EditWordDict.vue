<script setup lang="ts">

import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {cloneDeep} from "lodash-es";
import {_checkDictWords} from "@/utils";
import WordList from "@/pages/pc/components/list/WordList.vue";
import {getDefaultDict} from "@/types.ts";

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
  <WordList
      ref="listRef"
      :list="dict.words"
      v-if="dict.words?.length"
  >
  </WordList>
</template>

<style scoped lang="scss">

</style>