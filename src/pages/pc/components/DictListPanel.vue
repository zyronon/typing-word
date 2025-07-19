<script setup lang="ts">

import {DictResource} from "@/types.ts";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {groupBy} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import Input from "@/pages/pc/components/Input.vue";
import BaseButton from "@/components/BaseButton.vue";
import {computed} from "vue";
import DictList from "@/pages/pc/components/list/DictList.vue";
import Empty from "@/components/Empty.vue";

const emit = defineEmits<{
  add: [],
  selectDict: [val: { dict: any, index: number }]
}>()
const store = useBaseStore()


function groupByDictTags(dictList: DictResource[]) {
  return dictList.reduce<Record<string, DictResource[]>>((result, dict) => {
    dict.tags.forEach((tag) => {
      if (result[tag]) {
        result[tag].push(dict)
      } else {
        result[tag] = [dict]
      }
    })
    return result
  }, {})
}

const groupedByCategoryAndTag = $computed(() => {
  const groupByCategory = groupBy(dictionaryResources, 'category')
  let data = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    data.push([key, groupByDictTags(value)])
  }
  return data
})

let showSearchInput = $ref(false)
let searchKey = $ref('')

const searchList = computed(() => {
  if (searchKey) {
    let s = searchKey.toLowerCase()
    return dictionaryResources.filter((item) => {
      return item.name.toLowerCase().includes(s)
          || item.category.toLowerCase().includes(s)
          || item.tags.join('').replace('所有', '').toLowerCase().includes(s)
          || item?.url?.toLowerCase?.().includes?.(s)
    })
  }
  return []
})

defineExpose({startSearch: () => showSearchInput = true})
</script>

<template>
  <div class="card">
    <div class="flex gap-4" v-if="showSearchInput">
      <Input placeholder="请输入词典名称/缩写/类别" v-model="searchKey" class="flex-1" autofocus/>
      <BaseButton @click="showSearchInput = false, searchKey = ''">取消</BaseButton>
    </div>
    <div class="title flex justify-between" v-else>
      <span>词典列表</span>
      <BaseIcon @click="showSearchInput = true" icon="fluent:search-24-regular"/>
    </div>
    <div class="mt-4" v-if="searchKey">
      <DictList
          v-if="searchList.length "
          @selectDict="e => emit('selectDict',e)"
          :list="searchList"
          :select-id="'-1'"/>
      <Empty v-else text="没有相关词典"/>
    </div>
    <div class="w-full" v-else>
      <DictGroup
          v-for="item in groupedByCategoryAndTag"
          :select-id="store.currentStudyWordDict.id"
          @selectDict="e => emit('selectDict',e)"
          :groupByTag="item[1]"
          :category="item[0]"
      />
    </div>

  </div>

</template>

<style scoped lang="scss">
</style>
