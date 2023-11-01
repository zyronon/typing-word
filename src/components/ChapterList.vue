<script setup lang="ts">

import {Dict, Word} from "@/types.ts"
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {$computed} from "vue/macros";
import {useRuntimeStore} from "@/stores/runtime.ts";

const props = defineProps<{
  dict: Dict,
  activeIndex?: number
  isArticle?: boolean
}>()

const emit = defineEmits<{
  'update:activeIndex': [index: number]
}>()

const runtimeStore = useRuntimeStore()

const list: any[] = $computed(() => {
  if (props.isArticle) return props.dict.articles
  return props.dict.chapterWords
})


function showWordListModal(index: number, item: Word[]) {
  if (runtimeStore.editDict.translateLanguage === 'common') {
    console.time()
    item.map((w: Word) => {
      if (!w.trans.length) {
        let res = runtimeStore.translateWordList.find(a => a.name === w.name)
        if (res) w = Object.assign(w, res)
      }
    })
    console.timeEnd()
  }
  emitter.emit(EventKey.openWordListModal, {title: `第${index + 1}章`, list: item})
}
</script>

<template>
  <div class="list">
    <div class="common-list-item"
         :class="activeIndex === index && 'active'"
         v-for="(item,index) in list"
         @click="emit('update:activeIndex', index)">
      <div class="flex gap10">
        <input type="radio" :checked="activeIndex === index">
        <template v-if="isArticle">
          <div class="title"
               @click.stop="emitter.emit(EventKey.openArticleListModal,item)"
          >{{ index + 1 }}.&nbsp;&nbsp;&nbsp;{{ item.title }}
          </div>
        </template>
        <template v-else>
          <div class="title"
               @click.stop="showWordListModal(index,item)"
          >第{{ index + 1 }}章&nbsp;&nbsp;&nbsp;{{ item.length }}词
          </div>
        </template>
      </div>
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

  .common-list-item {

    &:hover {
      .title {
        border-bottom: 2px solid gray !important;
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