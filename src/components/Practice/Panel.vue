<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"

import {$ref} from "vue/macros"
import {computed, provide, watch} from "vue"
import 'swiper/css';
import {DictType, Word} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";

const props = defineProps<{
  list?: Word[],
  index: number
}>()
const store = useBaseStore()
const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

watch(() => settingStore.showPanel, n => {
  if (n) {
    switch (store.current.dictType) {
      case DictType.newDict:
        return tabIndex = 1;
      case DictType.skipDict:
        return tabIndex = 3;
      case DictType.wrongDict:
        return tabIndex = 2;
      case DictType.publicDict:
      case DictType.customDict:
        return tabIndex = 0;
    }
  }
})
const newWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.newDict) return -1
  else return props.index
})

const wrongWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.wrongDict) return -1
  else return props.index
})

const skipWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.skipDict) return -1
  else return props.index
})

function changeIndex(i: number) {

}

</script>
<template>
  <Transition name="fade">
    <div class="panel" v-if="settingStore.showPanel">
      <header>
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">{{ store.dictTitle }}</div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">{{ store.newWordDict.name }}</div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">{{
              store.wrongWordDict.name
            }}
          </div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.skipWordDict.name }}</div>
        </div>
      </header>
      <div class="slide">
        <div class="slide-list" :class="`step${tabIndex}`">
          <div class="slide-item">
            <header>
              <div class="dict-name">词数：{{ props.list.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.currentDict,store.currentDict.chapterIndex,e)"
                  :isActive="settingStore.showPanel && tabIndex === 0"
                  :list="props.list??[]"
                  :activeIndex="props.index"/>
            </div>
            <footer v-if="![DictType.customDict,DictType.publicDict].includes(store.current.dictType)">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="store.changeDict(store.currentDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <div class="dict-name">总词数：{{ store.newWordDict.originWords.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.newWordDict,store.newWordDict.chapterIndex,e)"
                  :isActive="settingStore.showPanel && tabIndex === 1"
                  :list="store.newWordDict.words"
                  :activeIndex="newWordDictActiveIndex"/>
            </div>
            <footer v-if="store.current.dictType !== DictType.newDict && store.newWordDict.words.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="store.changeDict(store.newWordDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <a href="" target="_blank"></a>
              <div class="dict-name">总词数：{{ store.wrongWordDict.originWords.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.wrongWordDict,store.wrongWordDict.chapterIndex,e)"
                  :isActive="settingStore.showPanel && tabIndex === 2"
                  :list="store.wrongWordDict.words"
                  :activeIndex="wrongWordDictActiveIndex"/>
            </div>
            <footer
                v-if="store.current.dictType !== DictType.wrongDict && store.wrongWordDict.words.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="store.changeDict(store.wrongWordDict)"
              >
                <BaseButton>切换</BaseButton>
              </PopConfirm>
            </footer>
          </div>
          <div class="slide-item">
            <header>
              <div class="dict-name">总词数：{{ store.skipWordDict.originWords.length }}</div>
            </header>
            <div class="content">
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.skipWordDict,store.skipWordDict.chapterIndex,e)"
                  :isActive="settingStore.showPanel && tabIndex === 3"
                  :list="store.skipWordDict.words"
                  :activeIndex="skipWordDictActiveIndex"/>
            </div>
            <footer v-if="store.current.dictType !== DictType.skipDict && store.skipWordDict.words.length">
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="store.changeDict(store.skipWordDict)"
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
@import "@/assets/css/colors";

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
  height: calc(100% - 40rem);
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
