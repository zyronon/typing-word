<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import {useWindowClick} from "@/hooks/event.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {nextTick, watch} from "vue";

const store = useBaseStore()
let timer = 0
let show = $ref(false)
useWindowClick(() => show = false)

function toggle(val) {
  clearTimeout(timer)
  if (val) {
    emitter.emit(EventKey.closeOther)
    show = val
  } else {
    timer = setTimeout(() => {
      show = val
    }, 100)
  }
}

function clickJumpSpecifiedChapter(index: number) {
  emitter.emit(EventKey.jumpSpecifiedChapter, index)
}

const listRef: HTMLElement = $ref(null as any)

watch(() => show, n => {
  if (n){
    nextTick(()=>{
      listRef?.children[store.currentDict.chapterIndex]?.scrollIntoView({block: 'center'})
    })
  }
})
</script>

<template>
  <div class="ChapterName" @click.stop="null">
    <div class="info hvr-grow"
         @mouseenter="toggle(true)"
         @mouseleave="toggle(false)"
    >
      {{ store.chapterName }}
    </div>
    <MiniDialog
        v-model="show"
        @mouseenter="toggle(true)"
        @mouseleave="toggle(false)"
        style="width: 230rem;"
    >
      <div class="chapter-list" ref="listRef">
        <div class="chapter-list-item"
             :class="store.currentDict.chapterIndex === index && 'active'"
             v-for="(item,index) in store.currentDict.chapterWords"
             @click="clickJumpSpecifiedChapter(index)">
          <input type="radio" :checked="store.currentDict.chapterIndex === index">
          <div class="title">第{{ index + 1 }}章&nbsp;&nbsp;&nbsp;{{ item.length }}词</div>
        </div>
      </div>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">
.ChapterName {
  position: relative;
}

.chapter-list {
  max-height: 250rem;
  overflow: auto;
  padding-right: 5rem;

  .chapter-list-item {
    margin-bottom: 7rem;
    height: 36rem;
    display: flex;
    align-items: center;
    gap: 10rem;
    width: 100%;
    box-sizing: border-box;
    background: var(--color-item-bg);
    color: var(--color-font-1);
    font-size: 18rem;
    border-radius: 8rem;
    transition: all .3s;
    padding: 10rem;
    border: 1px solid var(--color-item-border);

    &:hover {
      background: var(--color-item-hover);
    }

    &.active {
      background: var(--color-item-active);
    }
  }
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>