<script setup lang="ts">

import {Dict, Word} from "@/types.ts"
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {$computed} from "vue/macros";
import {useRuntimeStore} from "@/stores/runtime.ts";
import BaseIcon from "@/components/BaseIcon.vue";

const props = defineProps<{
  dict: Dict,
  activeIndex?: number
  isArticle?: boolean
}>()

const emit = defineEmits<{
  'update:activeIndex': [index: number]
  del: [index: number]
}>()

const runtimeStore = useRuntimeStore()

const list: any[] = $computed(() => {
  if (props.isArticle) return props.dict.articles
  return props.dict.chapterWords
})


function showWordListModal(index: number, item: Word[]) {
  emitter.emit(EventKey.openWordListModal, {
    title: `第${index + 1}章`,
    translateLanguage: runtimeStore.editDict.translateLanguage,
    list: item
  })
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
        <div class="left">
          <template v-if="isArticle">
            <div class="item-title"
                 @click.stop="emitter.emit(EventKey.openArticleListModal,item)"
            >{{ index + 1 }}.&nbsp;{{ item.title }}
            </div>
            <div class="item-sub-title" v-if="item.titleTranslate"> {{ item.titleTranslate }}</div>
          </template>
          <template v-else>
            <div class="item-title"
                 @click.stop="showWordListModal(index,item)"
            >第{{ index + 1 }}章&nbsp;&nbsp;&nbsp;{{ item.length }}词
            </div>
          </template>
        </div>
      </div>
      <div class="right" v-if="isArticle">
        <BaseIcon
            class-name="del"
            @click="emit('del',index)"
            title="移除"
            icon="solar:trash-bin-minimalistic-linear"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.list {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
  gap: 10rem;
  padding: 0 var(--space);
  //padding-right: 10rem;

  .common-list-item {

    input {
      cursor: pointer;
    }

    .item-title {
      transition: all .3s;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }

    :deep(.del) {
      opacity: 0;
    }

    &:hover {
      .item-title {
        border-bottom: 2px solid gray !important;
      }

      :deep(.del) {
        opacity: 1;
      }
    }

  }
}
</style>