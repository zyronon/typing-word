<script setup lang="ts">
import "vue-activity-calendar/style.css";
import {useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {DictResource, getDefaultDict} from "@/types/types.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Empty from "@/components/Empty.vue";
import Input from "@/pages/pc/components/Input.vue";
import BaseButton from "@/components/BaseButton.vue";
import DictList from "@/pages/pc/components/list/DictList.vue";
import BackIcon from "@/pages/pc/components/BackIcon.vue";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";
import {useBaseStore} from "@/stores/base.ts";
import {useRouter} from "vue-router";
import {groupBy} from "@/utils";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {computed} from "vue";

const {nav} = useNav()
const runtimeStore = useRuntimeStore()
const store = useBaseStore()
const router = useRouter()

function selectDict(e) {
  console.log(e.dict)
  getDictDetail(e.dict)
}

async function getDictDetail(val: DictResource) {
  runtimeStore.editDict = getDefaultDict(val)
  nav('dict-detail', {from: 'list'})
}


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

const searchList = computed<any[]>(() => {
  if (searchKey) {
    let s = searchKey.toLowerCase()
    return dictionaryResources.filter((item) => {
      return item.id.toLowerCase().includes(s)
          || item.name.toLowerCase().includes(s)
          || item.category.toLowerCase().includes(s)
          || item.tags.join('').replace('所有', '').toLowerCase().includes(s)
          || item?.url?.toLowerCase?.().includes?.(s)
    })
  }
  return []
})

</script>

<template>
  <BasePage>
    <div class="card">
      <div class="flex items-center relative gap-2">
        <BackIcon class="z-2" @Click='router.back()'/>
        <div class="flex flex-1 gap-4" v-if="showSearchInput">
          <Input placeholder="请输入词典名称/缩写/类别" v-model="searchKey" class="flex-1" autofocus/>
          <BaseButton @click="showSearchInput = false, searchKey = ''">取消</BaseButton>
        </div>
        <div class="py-1 flex flex-1 justify-end" v-else>
          <span class="page-title absolute w-full center">词典列表</span>
          <BaseIcon @click="showSearchInput = true"
                    class="z-1"
                    icon="fluent:search-24-regular"/>
        </div>
      </div>
      <div class="mt-4" v-if="searchKey">
        <DictList
            v-if="searchList.length "
            @selectDict="selectDict"
            :list="searchList"
            :select-id="'-1'"/>
        <Empty v-else text="没有相关词典"/>
      </div>
      <div class="w-full" v-else>
        <DictGroup
            v-for="item in groupedByCategoryAndTag"
            :select-id="store.currentStudyWordDict.id"
            @selectDict="selectDict"
            :groupByTag="item[1]"
            :category="item[0]"
        />
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">
</style>
