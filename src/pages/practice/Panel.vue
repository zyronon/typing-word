<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"

import {$ref} from "vue/macros"
import {computed, onMounted, provide, watch} from "vue"
import {Dict, DictType, ShortcutKey} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";
import Close from "@/components/icon/Close.vue";
import Empty from "@/components/Empty.vue";
import {useArticleOptions, useWordOptions} from "@/hooks/dict.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import CommonWordList from "@/components/list/CommonWordList.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import ArticleList2 from "@/components/list/ArticleList2.vue";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {cloneDeep} from "lodash-es";

const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
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
}

onMounted(() => {
  emitter.on(EventKey.changeDict, () => {
    tabIndex = 0
  })
})

const {
  delWrongWord,
  delSimpleWord,
  toggleWordCollect,
} = useWordOptions()

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

function addCollect() {
  runtimeStore.editDict = cloneDeep(store.collect)
  router.push({path: '/dict', query: {type: 'addWordOrArticle'}})
}

function addSimple() {
  runtimeStore.editDict = cloneDeep(store.simple)
  router.push({path: '/dict', query: {type: 'addWordOrArticle'}})
}

</script>
<template>
  <Transition name="fade">
    <div class="panel anim" v-show="settingStore.showPanel">
      <header>
        <Transition name="fade">
          <Tooltip
              v-if="!settingStore.showToolbar"
              :title="`关闭(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
          >
            <Close @click="settingStore.showPanel = false"/>
          </Tooltip>
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
                  <div class="dict-name" v-if="practiceType === DictType.word && store.collect.words.length">
                    {{ store.collect.words.length }}个单词
                  </div>
                  <div class="dict-name" v-if="practiceType === DictType.article && store.collect.articles.length">
                    {{ store.collect.articles.length }}篇文章
                  </div>
                  <Tooltip title="添加">
                    <IconWrapper>
                      <Icon icon="fluent:add-12-regular" @click="addCollect"/>
                    </IconWrapper>
                  </Tooltip>
                </div>
                <template v-if="store.currentDict.type !== DictType.collect &&
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
                <CommonWordList
                    v-if="store.collect.words.length"
                    class="word-list"
                    :list="store.collect.words">
                  <template v-slot="{word,index}">
                    <BaseIcon
                        class-name="del"
                        @click="toggleWordCollect(word)"
                        title="移除"
                        icon="solar:trash-bin-minimalistic-linear"/>
                  </template>
                </CommonWordList>
                <Empty v-else/>
              </template>
              <template v-else>
                <ArticleList2
                    v-if="store.collect.articles.length"
                    :show-translate="true"
                    v-model:list="store.collect.articles">
                  <template v-slot="{source,index}">
                    <BaseIcon
                        class-name="del"
                        @click="toggleArticleCollect(source)"
                        title="移除"
                        icon="solar:trash-bin-minimalistic-linear"/>
                  </template>
                </ArticleList2>

                <Empty v-else/>
              </template>
            </div>
          </div>
          <div class="slide-item">
            <div class="panel-page-item">
              <div class="list-header">
                <div class="left">
                  <div class="dict-name">总词数：{{ store.simple.words.length }}</div>
                  <Tooltip title="添加">
                    <IconWrapper>
                      <Icon icon="fluent:add-12-regular" @click="addSimple"/>
                    </IconWrapper>
                  </Tooltip>
                </div>
                <template v-if="store.currentDict.type !== DictType.simple && store.simple.words.length">
                  <PopConfirm
                      :title="`确认切换？`"
                      @confirm="changeIndex(0,store.simple)"
                  >
                    <BaseButton size="small">切换</BaseButton>
                  </PopConfirm>
                </template>
              </div>
              <CommonWordList
                  v-if="store.simple.words.length"
                  class="word-list"
                  :list="store.simple.words">
                <template v-slot="{word,index}">
                  <BaseIcon
                      class-name="del"
                      @click="delSimpleWord(word)"
                      title="移除"
                      icon="solar:trash-bin-minimalistic-linear"/>
                </template>
              </CommonWordList>
              <Empty v-else/>
            </div>
          </div>
          <div class="slide-item">
            <div class="panel-page-item" v-if="store.wrong.words.length">
              <div class="list-header">
                <div class="dict-name">总词数：{{ store.wrong.words.length }}</div>
                <template
                    v-if="store.currentDict.type !== DictType.wrong && store.wrong.words.length">
                  <PopConfirm
                      :title="`确认切换？`"
                      @confirm="changeIndex(0,store.wrong)"
                  >
                    <BaseButton size="small">切换</BaseButton>
                  </PopConfirm>
                </template>
              </div>
              <CommonWordList
                  class="word-list"
                  :list="store.wrong.words">
                <template v-slot="{word,index}">
                  <BaseIcon
                      class-name="del"
                      @click="delWrongWord(word)"
                      title="移除"
                      icon="solar:trash-bin-minimalistic-linear"/>
                </template>
              </CommonWordList>
            </div>
            <Empty v-else/>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable";

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
      width: var(--panel-width);
      height: 100%;
      display: flex;
      flex-direction: column;

      > header {
        padding: 0 var(--space);
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
        padding-bottom: var(--space);
      }

      footer {
        padding-right: var(--space);
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
  width: var(--panel-width);
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
