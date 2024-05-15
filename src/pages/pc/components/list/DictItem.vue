<script setup lang="ts">

import {Dict, DictType} from "@/types.ts";
import {Icon} from "@iconify/vue";
import BaseIcon from "@/components/BaseIcon.vue";

const props = defineProps<{
  dict?: Dict,
  active?: boolean
  showDel?: boolean
}>()

const emit = defineEmits<{
  add: []
  del: []
}>()

let length = $computed(() => {
  let isWord = [DictType.word, DictType.collect, DictType.simple, DictType.wrong].includes(props.dict.type)
  let len: any = ''
  if (props.dict.length) {
    len = props.dict.length
    len += (isWord ? '词' : '篇')
  } else {
    if (isWord) {
      len = props.dict.originWords.length + '词'
    } else {
      len = props.dict.articles.length + '篇'
    }
  }
  return len
})
</script>

<template>
  <div
      class="dict-item anim"
      :class="active && 'active'"
  >
    <template v-if="dict.id">
      <div class="top">
        <div class="name">{{ dict.name }}</div>
        <div class="desc">{{ dict.description }}</div>
      </div>
      <div class="bottom">
        <div class="num">{{ length }}</div>
      </div>
      <div class="pin" v-if="dict.type === DictType.article">文章</div>
      <div class="del" v-if="dict.showDel && !active" >
        <BaseIcon icon="solar:trash-bin-minimalistic-linear" @click="emit('del')"/>
      </div>
    </template>
    <div v-else class="add" @click.stop="emit('add')">
      <Icon icon="fluent:add-20-filled" width="38" color="#929596"/>
    </div>
  </div>

</template>

<style scoped lang="scss">
.dict-item {
  cursor: pointer;
  box-sizing: border-box;
  padding: 10rem;
  width: 125rem;
  height: 165rem;
  border-radius: 10rem;
  position: relative;
  background: var(--color-third-bg);
  border: 1px solid var(--color-item-border);
  color: var(--color-font-1);
  font-size: 14rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;

  .name {
    font-size: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box; //作为弹性伸缩盒子模型显示。
    -webkit-box-orient: vertical; //设置伸缩盒子的子元素排列方式--从上到下垂直排列
    -webkit-line-clamp: 2; //显示的行
  }

  .desc {
    color: var(--color-font-2);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box; //作为弹性伸缩盒子模型显示。
    -webkit-box-orient: vertical; //设置伸缩盒子的子元素排列方式--从上到下垂直排列
    -webkit-line-clamp: 2; //显示的行
  }

  .num {
    text-align: right;
    color: var(--color-font-2);
    //font-weight: bold;
  }

  .go {
    position: absolute;
    right: 10rem;
    bottom: 15rem;
  }

  .del {
    position: absolute;
    top: 10rem;
    right: 10rem;
    opacity: 0;
    transition: opacity .3s;
  }

  &.active {
    background: var(--color-item-active);
  }

  &:hover {
    background: var(--color-item-active);

    .del {
      opacity: 1;
    }
  }

  .add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .pin {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 55rem;
    width: 55rem;
    color: white;
    //background-color: skyblue;
    background-color: var(--color-main-active);
    clip-path: polygon(0 10%, 0% 100%, 100% 100%);
    font-size: 12rem;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    padding: 4rem;
    box-sizing: border-box;
  }
}

</style>