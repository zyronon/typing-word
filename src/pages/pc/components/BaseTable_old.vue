<script setup lang="ts">

import {useSettingStore} from "@/stores/setting.ts";
import {nextTick} from "vue";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {Sort} from "@/types.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep, reverse, shuffle} from "lodash-es";
import Input from "@/pages/pc/components/Input.vue";

let list = defineModel('list')

const props = withDefaults(defineProps<{
  activeIndex?: number,
  activeId?: string,
  isActive?: boolean
  showBorder?: boolean
}>(), {
  activeIndex: -1,
  activeId: '',
  isActive: false,
  showBorder: false,
})

const emit = defineEmits<{
  click: [val: {
    item: any,
    index: number
  }],
}>()

const settingStore = useSettingStore()
const listRef: any = $ref()

function scrollToBottom() {
  nextTick(() => {
    listRef?.scrollTo(0, listRef.scrollHeight)
  })
}

function scrollToItem(index: number) {
  nextTick(() => {
    listRef?.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
  })
}

function itemIsActive(item: any, index: number) {
  return props.activeId ?
      props.activeId === item.id
      : props.activeIndex === index
}

defineExpose({scrollToBottom, scrollToItem})

let pageNo = $ref(1)
let pageSize = $ref(50)
let currentList = $computed({
  get() {
    if (searchKey) {
      return list.value.filter(v => v.word.includes(searchKey))
    }
    return list.value.slice((pageNo - 1) * pageSize, (pageNo - 1) * pageSize + pageSize)
  },
  set(v) {
    list.value = v
  }
})

let selectIds = $ref([])
let selectAll = $computed(()=>{
  return !!selectIds.length
})

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

function toggleSelectAll() {
  if (selectAll) {
    selectIds = []
  } else {
    selectIds = currentList.map(v => v.id)
  }
}

let searchKey = $ref('')
let showSortDialog = $ref(false)
let showSearchInput = $ref(false)

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    list.value = reverse(cloneDeep(list.value))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    list.value = shuffle(cloneDeep(list.value))
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="">
      <div
          v-if="showSearchInput"
          class="flex gap-2"
      >
        <Input v-model="searchKey"
               class="flex-1"/>
        <BaseButton @click="showSearchInput = false">取消</BaseButton>
      </div>
      <div class="flex justify-between " v-else>
        <el-checkbox
            @click="toggleSelectAll"
            :model-value="selectAll"
            size="large"/>
        <div class="flex gap-2 relative">
          <BaseIcon
              v-if="selectIds.length"
              @click="emit('del')"
              class="del"
              title="删除"
              icon="solar:trash-bin-minimalistic-linear"/>
          <BaseIcon
              @click="emit('add')"
              icon="fluent:add-20-filled"
              title="添加单词"/>
          <BaseIcon
              title="改变顺序"
              icon="icon-park-outline:sort-two"
              @click="showSortDialog = !showSortDialog"
          />
          <BaseIcon
              @click="showSearchInput = !showSearchInput"
              title="搜索"
              icon="fluent:search-24-regular"/>
          <MiniDialog
              v-model="showSortDialog"
              style="width: 8rem;"
          >
            <div class="mini-row-title">
              列表顺序设置
            </div>
            <div class="mini-row">
              <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
              <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
            </div>
          </MiniDialog>
        </div>
      </div>
    </div>
    <div
        class="flex-1 overflow-auto"
        ref="listRef">
      <div class="list-item-wrapper"
           v-for="(item,index) in currentList"
           :key="item.id"
      >
        <div class="common-list-item"
             :class="{
            active:itemIsActive(item,index),
            border:showBorder
          }"
             @click="emit('click',{item,index})"
        >
          <div class="left">
            <el-checkbox
                :model-value="selectIds.includes(item.id)"
                @change="toggleSelect(item)"
                size="large"/>
            <div class="title-wrapper">
              <div class="item-title">
                <span class="word">{{ item.word }}</span>
                <span class="phonetic">{{ item.phonetic0 }}</span>
                <VolumeIcon class="volume"></VolumeIcon>
              </div>
              <div class="item-sub-title">
                <div v-for="v in item.trans">{{ (v.pos ? v.pos + '.' : '') + (v.cn || v.en) }}</div>
              </div>
            </div>
          </div>
          <div class="right">
            <slot name="suffix" :item="item" :index="index"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end">
      <el-pagination background
                     v-model:current-page="pageNo"
                     v-model:page-size="pageSize"
                     layout="prev, pager, next" :total="list.length"/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>