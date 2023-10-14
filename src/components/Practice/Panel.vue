<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"

import {$computed, $ref} from "vue/macros"
import {computed, provide, watch} from "vue"
import {Dict, DictType, Word} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";

const props = defineProps<{
  list?: Word[],
  index: number
}>()
const emit = defineEmits<{
  'update:index': [i: number]
}>()
const store = useBaseStore()
const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

watch(() => settingStore.showPanel, n => {
  if (n) {
    switch (store.current.dictType) {
      case DictType.newWordDict:
        return tabIndex = 1;
      case DictType.skipWordDict:
        return tabIndex = 3;
      case DictType.wrongWordDict:
        return tabIndex = 2;
      case DictType.publicDict:
      case DictType.customDict:
        return tabIndex = 0;
    }
  }
})

const currentDict: Dict = $computed(() => {
  return store.myDicts[store.current.index]
})

const currentData = $computed(() => {
  if (store.current.dictType !== currentDict.type) return {list: currentDict.chapterWords[currentDict.chapterIndex] ?? [], index: -1}
  else return props
})

const newWordDictData = $computed(() => {
  if (store.current.dictType !== DictType.newWordDict) return {list: store.newWordDict.words ?? [], index: -1}
  else return props
})

const wrongWordDictData = $computed(() => {
  if (store.current.dictType !== DictType.wrongWordDict) return {list: store.wrongWordDict.words ?? [], index: -1}
  else return props
})

const skipWordDictData = $computed(() => {
  if (store.current.dictType !== DictType.skipWordDict) return {list: store.skipWordDict.words ?? [], index: -1}
  else return props
})

function changeIndex(i: number, dict: Dict) {
  dict.chapterWordIndex = i
  console.log('i', i, dict.type)
  if (store.current.dictType === dict.type) {
    emit('update:index', i)
  } else {
    store.changeDict(dict, dict.chapterIndex, i)
  }
}

</script>
<template>
  <Transition name="fade">
    <div class="panel" v-if="settingStore.showPanel">
      <header>
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
            {{ currentDict.name + `  第${currentDict.chapterIndex + 1}章` }}
          </div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">{{ store.newWordDict.name }}</div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">
            {{ store.wrongWordDict.name }}
          </div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.skipWordDict.name }}</div>
        </div>
      </header>
      <div class="slide">
        <div class="slide-list" :class="`step${tabIndex}`">
          <div class="slide-item">
            <header>
              <div class="dict-name">词数：{{ currentData.list.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(i:number) => changeIndex(i,currentDict)"
                  :isActive="settingStore.showPanel && tabIndex === 0"
                  :list="currentData.list"
                  :activeIndex="currentData.index"/>
            </div>
            <footer v-if="![DictType.customDict,DictType.publicDict].includes(store.current.dictType)">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="changeIndex(0,currentDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <div class="dict-name">总词数：{{ newWordDictData.list.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(i:number) => changeIndex(i,store.newWordDict)"
                  :isActive="settingStore.showPanel && tabIndex === 1"
                  :list="newWordDictData.list"
                  :activeIndex="newWordDictData.index"/>
            </div>
            <footer v-if="store.current.dictType !== DictType.newWordDict && newWordDictData.list.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="changeIndex(0,store.newWordDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <a href="" target="_blank"></a>
              <div class="dict-name">总词数：{{ wrongWordDictData.list.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(i:number) => changeIndex(i,store.wrongWordDict)"
                  :isActive="settingStore.showPanel && tabIndex === 2"
                  :list="wrongWordDictData.list"
                  :activeIndex="wrongWordDictData.index"/>
            </div>
            <footer
                v-if="store.current.dictType !== DictType.wrongWordDict && wrongWordDictData.list.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="changeIndex(0,store.wrongWordDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <div class="dict-name">总词数：{{ skipWordDictData.list.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(i:number) => changeIndex(i,store.skipWordDict)"
                  :isActive="settingStore.showPanel && tabIndex === 3"
                  :list="skipWordDictData.list"
                  :activeIndex="skipWordDictData.index"/>
            </div>
            <footer v-if="store.current.dictType !== DictType.skipWordDict && skipWordDictData.list.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="changeIndex(0,store.skipWordDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable.scss";

$width: 20vw;
$header-height: 50rem;

.slide {
  width: 100%;
  height: calc(100% - $header-height);
  overflow: hidden;

  .slide-list {
    width: 400%;
    height: 100%;
    display: flex;
    transition: all .5s;

    .slide-item {
      width: $width;
      height: 100%;
      display: flex;
      flex-direction: column;

      > header {
        padding: 0 $space;
        height: $header-height;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10rem;
        font-size: 18rem;
        color: black;
      }

      .content {
        flex: 1;
        overflow: auto;
        padding-bottom: $space;
      }

      footer {
        padding-right: $space;
        height: 50rem;
        align-items: center;
      }
    }
  }

  .step1 {
    transform: translate3d(-25%, 0, 0);
  }

  .step2 {
    transform: translate3d(-50%, 0, 0);
  }

  .step3 {
    transform: translate3d(-75%, 0, 0);
  }
}

.panel {
  position: fixed;
  left: 0;
  top: 10rem;
  border-radius: 8rem;
  margin-left: calc(50% + (var(--toolbar-width) / 2) + $space);
  width: $width;
  background: var(--color-second-bg);
  height: calc(100% - 20rem);
  display: flex;
  flex-direction: column;
  transition: all .3s;
  z-index: 1;

  & > header {
    height: $header-height;
    position: relative;
    display: flex;
    align-items: center;

    .tabs {
      padding: 10rem 20rem;
      justify-content: flex-end;
      width: 100%;
      display: flex;
      align-items: flex-end;
      border-bottom: 1px solid #e1e1e1;
      gap: 15rem;
      font-size: 14rem;
      color: gray;

      .tab {
        cursor: pointer;

        &.active {
          font-size: 16rem;
          color: rgb(36, 127, 255);
          font-weight: bold;
        }
      }
    }

    .close {
      cursor: pointer;
      position: absolute;
      right: 20rem;
    }
  }
}

</style>
