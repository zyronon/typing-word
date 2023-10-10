<script setup lang="ts">

import {Dict} from "@/types.ts"
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {$computed} from "vue/macros";

const props = defineProps<{
  dict: Dict,
  activeIndex?: number
  isArticle?: boolean
}>()

const emit = defineEmits<{
  'update:activeIndex': [index: number]
  showWord: [list: any[]]
}>()


const list: any[] = $computed(() => {
  if (props.isArticle) return props.dict.articles
  return props.dict.chapterWords
})

</script>

<template>
  <div class="list">
    <div class="item"
         :class="activeIndex === index && 'active'"
         v-for="(item,index) in list"
         @click="emit('update:activeIndex', index)">
      <input type="radio" :checked="activeIndex === index">
      <template v-if="isArticle">
        <div class="title"
             @click.stop="emitter.emit(EventKey.openArticleListModal,item)"
        >{{ index + 1 }}.&nbsp;&nbsp;&nbsp;{{ item.title }}
        </div>
      </template>
      <template v-else>
        <div class="title"
             @click.stop="emitter.emit(EventKey.openWordListModal,{title:`第${index + 1}章`,list:item})"
        >第{{ index + 1 }}章&nbsp;&nbsp;&nbsp;{{ item.length }}词
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.list {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
  gap: 10rem;
  //padding-right: 10rem;

  .item {
    padding: 15rem;
    background: var(--color-item-bg);
    color: var(--color-font-1);
    display: flex;
    gap: 10rem;
    border-radius: 8rem;
    border-bottom: 1px solid #e1e1e1;

    &.active {
      background: var(--color-item-active);
      color: var(--color-font-active-1);

      &:hover {
        .title {
          border-bottom: 2px solid white !important;
        }
      }
    }

    &:hover {
      .title {
        border-bottom: 2px solid var(--color-item-active);
      }
    }

    input {
      cursor: pointer;
    }

    .title {
      transition: all .3s;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
  }
}
</style>