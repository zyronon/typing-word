<script setup lang="ts">

import {Sort, Word} from "@/types.ts";
import VirtualWordList2 from "@/components/list/VirtualWordList2.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import Empty from "@/components/Empty.vue";
import {$computed, $ref} from "vue/macros";
import {watch} from "vue";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import BaseButton from "@/components/BaseButton.vue";
import {useWindowClick} from "@/hooks/event.ts";
import {reverse, shuffle} from "lodash-es";

const props = defineProps<{
  title: string,
  emptyTitle?: string,
  showAdd?: boolean,
  list: Word[]
}>()

const emit = defineEmits<{
  add: []
  edit: [val: { word: Word, index: number }]
  del: [val: { word: Word, index: number }],
  'update:list': [val: Word[]]
}>()

let checkedAll = $ref(false)
let isIndeterminate = $ref(false)

watch(() => props.list.length, (n) => {
  checkStatus()
})
watch(() => props.list, (n) => {
  checkStatus()
})

function handleCheckedChange({word: source}: any) {
  source.checked = !source.checked
  checkStatus()
}

function checkStatus() {
  checkedAll = props.list.every(v => v.checked)
  if (checkedAll) {
    isIndeterminate = false
  } else {
    isIndeterminate = props.list.some(v => v.checked)
  }
}

function handleCheckedAll() {
  props.list.map(v => v.checked = checkedAll)
}

let checkedTotal = $computed(() => {
  return props.list.filter(v => v.checked).length
})

function del(val: { word: Word, index: number }) {
  props.list.splice(val.index, 1)
  emit('del', val)
}

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    emit('update:list', reverse(props.list))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    emit('update:list', shuffle(props.list))
  }
}

let listRef: any = $ref()

function scrollToBottom() {
  listRef.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef.scrollToItem(index)
}

defineExpose({scrollToBottom, scrollToItem})

let show = $ref(false)
useWindowClick(() => show = false)

</script>

<template>
  <div class="column">
    <div class="header">
      <div class="common-title">
        <span>{{ title }}</span>
        <div class="options">
          <div class="setting"
               v-if="list.length"
               @click.stop="null">
            <BaseIcon
                title="改变顺序"
                icon="icon-park-outline:sort-two"
                @click="show = !show"
            />
            <MiniDialog
                v-model="show"
                style="width: 130rem;"
            >
              <div class="mini-row-title">
                列表循环设置
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
              </div>
            </MiniDialog>
          </div>
          <BaseIcon
              v-if="showAdd"
              @click="emit('add')"
              icon="fluent:add-20-filled"
              title="新增单词到本章节"/>
        </div>
      </div>
      <div class="select"
           v-if="list.length"
      >
        <div class="left">
          <el-checkbox
              v-model="checkedAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckedAll"
              size="large"/>
          <span>全选</span>
        </div>
        <div class="right">{{ checkedTotal }}/{{ props.list.length }}</div>
      </div>
    </div>
    <div class="wrapper">
      <VirtualWordList2
          ref="listRef"
          :list="list"
          v-if="list.length"
          @click="handleCheckedChange"
      >
        <template v-slot:prefix="{word}">
          <el-checkbox v-model="word.checked"
                       @change="handleCheckedChange({word})"
                       size="large"/>
        </template>
        <template v-slot="{word,index}">
          <BaseIcon
              class-name="del"
              @click="emit('edit',{word,index})"
              title="编辑"
              icon="tabler:edit"/>
          <BaseIcon
              class-name="del"
              @click="del({word,index})"
              title="删除"
              icon="solar:trash-bin-minimalistic-linear"/>
        </template>
      </VirtualWordList2>
      <Empty :text="emptyTitle" v-else/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header {
  padding: 0 var(--space);

  .common-title {
    margin-bottom: 0;
    position: relative;

    .options {
      position: absolute;
      right: 0;
      display: flex;
      gap: 10rem;
    }
  }

  .select {
    height: 45rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      display: flex;
      gap: 5rem;
      align-items: center;
    }
  }
}

.wrapper {
  flex: 1;
  overflow: hidden;
}

.column {
  flex: 1;
  background: white;
  border-radius: 10rem;
  background: var(--color-second-bg);
  color: var(--color-font-1);
  padding-bottom: var(--space);
  display: flex;
  flex-direction: column;
}

</style>