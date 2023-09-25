<script setup lang="ts" generic="T">

import BaseIcon from "@/components/BaseIcon.vue";
import Input from "@/components/Input.vue";
import {$ref} from "vue/macros";
import {cloneDeep, throttle} from "lodash-es";

let dragIndex = $ref(-1)

interface IProps {
  list: T[]
  searchKey: string,
  selectIndex: number,
  rowKey: (item: T) => string
}

const props = defineProps<IProps>()
const emit = defineEmits<{
  selectArticle: [index: number],
  delArticle: [item: T],
  'update:searchKey': [val: string],
  'update:list': [list: T[]],
}>()
let draggable = $ref(false)

function dragstart(index: number) {
  dragIndex = index;
}

const dragenter = throttle((e, index) => {
  // console.log('dragenter', 'dragIndex', dragIndex, 'index', index)
  e.preventDefault();
  // 避免源对象触发自身的dragenter事件
  if (dragIndex !== index && dragIndex !== -1) {
    const source = props.list[dragIndex];
    let temp = cloneDeep(props.list)
    temp.splice(dragIndex, 1);
    temp.splice(index, 0, source);
    emit('update:list', temp)
    // props.list = temp
    // 排序变化后目标对象的索引变成源对象的索引
    dragIndex = index;
  }
}, 200)

function dragover(e, index) {
  // console.log('dragover')
  e.preventDefault();
}

function dragend() {
  // console.log('dragend')
  draggable = false
  dragIndex = -1
}

</script>

<template>
  <div class="list-wrapper">
    <div class="search">
      <Input :model-value="searchKey"
             @update:model-value="(e:string) => emit('update:searchKey',e)"
      />
    </div>
    <transition-group
        name="drag"
        class="list"
        tag="div"
    >
      <div class="item"
           :class="[
                (props.selectIndex ===  index) && 'active',
                draggable  && 'draggable',
                (dragIndex === index) && 'active'
             ]"
           @click="emit('selectArticle',index)"
           v-for="(item,index) in props.list"
           :key="rowKey(item)"
           :draggable="draggable"
           @dragstart="dragstart(index)"
           @dragenter="dragenter($event, index)"
           @dragover="dragover($event, index)"
           @dragend="dragend()"
      >
        <div class="left">
          <slot :item="item" :index="index"></slot>
        </div>
        <div class="right">
          <BaseIcon
              @click="emit('delArticle',item)"
              title="删除" icon="fluent:delete-24-regular"/>
          <div
              @mousedown="draggable = true"
              @mouseup="draggable = false"
          >
            <BaseIcon
                icon="carbon:move"/>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
.drag-move, /* 对移动中的元素应用的过渡 */
.drag-enter-active,
.drag-leave-active {
  transition: all 0.5s ease;
}

.drag-enter-from,
.drag-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.drag-leave-active {
  position: absolute;
}

.list-wrapper {
  flex: 1;
  overflow: auto;
  padding-right: 5rem;

  .search {
    margin: 10rem 0;
    width: 260rem;
  }

  .list {
    .item {
      width: 260rem;
      box-sizing: border-box;
      background: #e1e1e1;
      border-radius: 8rem;
      margin-bottom: 10rem;
      padding: 10rem;
      display: flex;
      justify-content: space-between;
      transition: all .3s;

      .right {
        display: flex;
        flex-direction: column;
        transition: all .3s;
        opacity: 0;
      }

      &:hover {
        .right {
          opacity: 1;
        }
      }

      &.active {
        background: var(--color-item-active);
        color: white;
      }

      &.draggable {
        cursor: move;
      }
    }
  }
}
</style>