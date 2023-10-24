<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"

import {$computed, $ref} from "vue/macros"
import {computed, provide, watch} from "vue"
import {Dict, DictType, Word} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";
import Close from "@/components/Close.vue";

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
      case DictType.collect:
        return tabIndex = 1;
      case DictType.skip:
        return tabIndex = 3;
      case DictType.wrong:
        return tabIndex = 2;
      case DictType.word:
      case DictType.customWord:
        return tabIndex = 0;
    }
  }
})

const currentDict: Dict = $computed(() => {
  return store.myDicts[store.current.index]
})

const currentData = $computed(() => {
  if (store.current.dictType !== currentDict.type) return {
    list: currentDict.chapterWords[currentDict.chapterIndex] ?? [],
    index: -1
  }
  else return props
})

const newData = $computed(() => {
  if (store.current.dictType !== DictType.collect) return {list: store.collect.words ?? [], index: -1}
  else return props
})

const wrongData = $computed(() => {
  if (store.current.dictType !== DictType.wrong) return {list: store.wrong.words ?? [], index: -1}
  else return props
})

const skipData = $computed(() => {
  if (store.current.dictType !== DictType.skip) return {list: store.skip.words ?? [], index: -1}
  else return props
})

function changeIndex(i: number, dict: Dict) {
  dict.wordIndex = i
  console.log('i', i, dict.type)
  if (store.current.dictType === dict.type) {
    emit('update:index', i)
  } else {
    store.changeDict(dict, dict.chapterIndex, i)
  }
}

</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="panel" v-if="settingStore.showPanel">
        <header>
          <Transition name="fade">
            <Close
                @click="settingStore.showPanel = false"
                v-if="!settingStore.showToolbar"/>
          </Transition>
          <div class="tabs">
            <div class="tab current" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
              {{ currentDict.name + `  第${currentDict.chapterIndex + 1}章` }}
            </div>
            <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">{{ store.collect.name }}</div>
            <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">
              {{ store.wrong.name }}
            </div>
            <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.skip.name }}</div>
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
              <footer v-if="![DictType.customWord,DictType.word].includes(store.current.dictType)">
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
                <div class="dict-name">总词数：{{ newData.list.length }}</div>
              </header>
              <div class="content">
                <WordList
                    class="word-list"
                    @change="(i:number) => changeIndex(i,store.collect)"
                    :isActive="settingStore.showPanel && tabIndex === 1"
                    :list="newData.list"
                    :activeIndex="newData.index"/>
              </div>
              <footer v-if="store.current.dictType !== DictType.collect && newData.list.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="changeIndex(0,store.collect)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
            <div class="slide-item">
              <header>
                <a href="" target="_blank"></a>
                <div class="dict-name">总词数：{{ wrongData.list.length }}</div>
              </header>
              <div class="content">
                <WordList
                    class="word-list"
                    @change="(i:number) => changeIndex(i,store.wrong)"
                    :isActive="settingStore.showPanel && tabIndex === 2"
                    :list="wrongData.list"
                    :activeIndex="wrongData.index"/>
              </div>
              <footer
                  v-if="store.current.dictType !== DictType.wrong && wrongData.list.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="changeIndex(0,store.wrong)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
            <div class="slide-item">
              <header>
                <div class="dict-name">总词数：{{ skipData.list.length }}</div>
              </header>
              <div class="content">
                <WordList
                    class="word-list"
                    @change="(i:number) => changeIndex(i,store.skip)"
                    :isActive="settingStore.showPanel && tabIndex === 3"
                    :list="skipData.list"
                    :activeIndex="skipData.index"/>
              </div>
              <footer v-if="store.current.dictType !== DictType.skip && skipData.list.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="changeIndex(0,store.skip)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable.scss";

$width: 20vw;
$header-height: 50rem;

.slide {
  width: 100%;
  flex: 1;
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
    min-height: 50rem;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    padding: 10rem 15rem;
    border-bottom: 1px solid #e1e1e1;
    gap: 15rem;

    .close {
      cursor: pointer;
    }

    .tabs {
      justify-content: flex-end;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 15rem;
      font-size: 14rem;
      color: gray;

      .tab {
        cursor: pointer;
        word-break: keep-all;
        font-size: 16rem;

        &.active {
          color: rgb(36, 127, 255);
          font-weight: bold;
        }
      }

      .current {
        word-break: break-word;
      }
    }

  }
}

</style>
