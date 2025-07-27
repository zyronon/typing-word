<script setup lang="ts">

import DictPlan from "@/pages/mobile/components/DictPlan.vue";
import NavBar from "@/pages/mobile/components/NavBar.vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {Dict, getDefaultDict} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import {nanoid} from "nanoid";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";


const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const route = useRoute()
let load = $ref(false)

onMounted(() => {
  // console.log('route', route.query.id)
  let item = dictionaryResources.find(v => v.id === route.query.id)
  let find: Dict = store.word.bookList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...getDefaultDict(),
      ...item,
    })
    runtimeStore.editDict.id = nanoid(6)
  }
  load = true
})
</script>

<template>
  <div class="mobile-page">
    <NavBar title="设置任务量"/>
    <DictPlan v-if="load"/>
  </div>
</template>

<style scoped lang="scss">

</style>
