<script setup lang="ts">

import {DictResource} from "@/types.ts";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {groupBy} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";

const emit = defineEmits<{
  add: [],
  selectDict: [val: { dict: any, index: number }]
}>()
const store = useBaseStore()

let currentLanguage = $ref('en')
let currentTranslateLanguage = $ref('common')
let groupByLanguage = groupBy(dictionaryResources, 'language')

function groupByDictTags(dictList: DictResource[]) {
  return dictList.reduce<Record<string, DictResource[]>>((result, dict) => {
    dict.tags.forEach((tag) => {
      if (Object.prototype.hasOwnProperty.call(result, tag)) {
        result[tag].push(dict)
      } else {
        result[tag] = [dict]
      }
    })
    return result
  }, {})
}

const groupByTranslateLanguage = $computed(() => {
  return groupBy(groupByLanguage[currentLanguage], 'translateLanguage')
})

const groupedByCategoryAndTag = $computed(() => {
  const currentTranslateLanguageDictList = groupByTranslateLanguage[currentTranslateLanguage]
  const groupByCategory = groupBy(currentTranslateLanguageDictList, 'category')

  let data = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    data.push([key, groupByDictTags(value)])
  }
  // console.log('groupedByCategoryAndTag', data)
  return data
})

</script>

<template>
  <div class="w-full">
    <DictGroup
        v-for="item in groupedByCategoryAndTag"
        :select-id="store.currentStudyWordDict.id"
        @selectDict="e => emit('selectDict',e)"
        :groupByTag="item[1]"
        :category="item[0]"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
