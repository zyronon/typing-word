<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/list/WordList.vue"

import {$ref} from "vue/macros"
import {computed, provide, watch} from "vue"
import {Dict, DictType} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";
import Close from "@/components/icon/Close.vue";
import Empty from "@/components/Empty.vue";
import ArticleList from "@/components/Article/ArticleList.vue";
import {useWordOptions} from "@/hooks/dict.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

watch(() => settingStore.showPanel, n => {
  if (n) {
    tabIndex = 0
  }
})

let practiceType = $ref(DictType.word)

function changeIndex(i: number, dict: Dict) {
  store.changeDict(dict, dict.chapterIndex, i, practiceType)
  setTimeout(() => {
    tabIndex = 0
  })
}

const {
  delWrongWord,
  delSimpleWord
} = useWordOptions()

</script>
<template>
  <Transition name="fade">
    <div class="panel" v-show="settingStore.showPanel">
      <header>
        <Transition name="fade">
          <Close
              @click="settingStore.showPanel = false"
              v-if="!settingStore.showToolbar"/>
        </Transition>
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">当前</div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">{{ store.collect.name }}</div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">{{ store.simple.name }}</div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.wrong.name }}</div>
        </div>
      </header>
      <div class="slide">
        <div class="slide-list" :class="`step${tabIndex}`">
          <div class="slide-item">
            <slot :active="tabIndex === 0 && settingStore.showPanel"></slot>
          </div>
          <div class="slide-item">
            <div class="panel-page-item">
              <div class="list-header">
                <div class="left">
                  <el-radio-group v-model="practiceType">
                    <el-radio-button border :label="DictType.word">单词</el-radio-button>
                    <el-radio-button border :label="DictType.article">文章</el-radio-button>
                  </el-radio-group>
                  <Tooltip title="添加">
                    <IconWrapper>
                      <Icon icon="fluent:add-12-regular"/>
                    </IconWrapper>
                  </Tooltip>
                  <div class="dict-name" v-if="practiceType === DictType.word && store.collect.words.length">
                    {{ store.collect.words.length }}个单词
                  </div>
                  <div class="dict-name" v-if="practiceType === DictType.article && store.collect.articles.length">
                    {{ store.collect.articles.length }}篇文章
                  </div>
                </div>
                <template v-if="store.current.dictType !== DictType.collect &&
             (
                   ( practiceType === DictType.word && store.collect.words.length) ||
                ( practiceType === DictType.article && store.collect.articles.length)
              )">
                  <PopConfirm
                      :title="`确认切换？`"
                      @confirm="changeIndex(0,store.collect)"
                  >
                    <BaseButton size="small">切换</BaseButton>
                  </PopConfirm>
                </template>
              </div>
              <template v-if="practiceType === DictType.word">
                <WordList
                    v-if="store.collect.words.length"
                    class="word-list"
                    :list="store.collect.words"/>
                <Empty v-else/>
              </template>
              <template v-else>
                <ArticleList
                    v-if="store.collect.articles.length"
                    style="padding: 0 20rem;"
                    :select-item="{id: ''} as any"
                    v-model:list="store.collect.articles"/>
                <Empty v-else/>
              </template>
            </div>
          </div>
          <div class="slide-item">
            <div class="panel-page-item" v-if="store.simple.words.length">
              <div class="list-header">
                <div class="dict-name">总词数：{{ store.simple.words.length }}</div>
                <template v-if="store.current.dictType !== DictType.simple && store.simple.words.length">
                  <PopConfirm
                      :title="`确认切换？`"
                      @confirm="changeIndex(0,store.simple)"
                  >
                    <BaseButton size="small">切换</BaseButton>
                  </PopConfirm>
                </template>
              </div>
              <WordList
                  class="word-list"
                  :show-del="true"
                  @del="delSimpleWord"
                  :list="store.simple.words"/>
            </div>
            <Empty v-else/>
          </div>
          <div class="slide-item">
            <div class="panel-page-item" v-if="store.wrong.words.length">
              <div class="list-header">
                <div class="dict-name">总词数：{{ store.wrong.words.length }}</div>
                <template
                    v-if="store.current.dictType !== DictType.wrong && store.wrong.words.length">
                  <PopConfirm
                      :title="`确认切换？`"
                      @confirm="changeIndex(0,store.wrong)"
                  >
                    <BaseButton size="small">切换</BaseButton>
                  </PopConfirm>
                </template>
              </div>
              <WordList
                  class="word-list"
                  :show-del="true"
                  @del="delWrongWord"
                  :list="store.wrong.words"/>
            </div>
            <Empty v-else/>
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
        font-size: 16rem;
        color: black;
      }

      .content {
        flex: 1;
        overflow: auto;
        padding-bottom: $space;
      }

      footer {
        padding-right: $space;
        margin-bottom: 10rem;
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
  border-radius: 8rem;
  width: $width;
  background: var(--color-second-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  z-index: 1;
  border: 1px solid var(--color-item-border);


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
    }

  }
}

</style>
