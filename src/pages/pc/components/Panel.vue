<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"

import {computed, onMounted, onUnmounted, provide, watch} from "vue"
import {Dict, DictType, ShortcutKey} from "@/types.ts"
import PopConfirm from "@/pages/pc/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {useSettingStore} from "@/stores/setting.ts";
import Close from "@/components/icon/Close.vue";
import Empty from "@/components/Empty.vue";
import {useArticleOptions, useWordOptions} from "@/hooks/dict.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {emitter, EventKey, useEvent} from "@/utils/eventBus.ts";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {cloneDeep} from "lodash-es";
import WordList from "@/pages/pc/components/list/WordList.vue";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import Slide from "@/pages/pc/components/Slide.vue";
import {useNav} from "@/utils";

const props = withDefaults(defineProps<{
  type?: DictType
}>(), {
  type: DictType.word
})

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

function changeIndex(dict: Dict) {
  store.changeDict(dict, practiceType)
}

useEvent(EventKey.changeDict, () => {
  tabIndex = 0
})

const {
  delWrongWord,
  delSimpleWord,
  toggleWordCollect,
} = useWordOptions()

const {
  toggleArticleCollect
} = useArticleOptions()

const {nav} = useNav()

const showCollectToggleButton = $computed(() => {
  if (props.type === DictType.word) return store.collectWord.words.length
  return store.collectArticle.articles.length
})

function changeCollect() {
  if (props.type === DictType.word) {
    store.currentStudy.word.dictIndex = -store.collectWord.index
  } else {

  }
}

</script>
<template>
  <Transition name="fade">
    <div class="panel anim" v-show="settingStore.showPanel">
      <header>
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">当前</div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">收藏</div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">{{ store.simple.name }}</div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.wrong.name }}</div>
          <div class="tab" :class="tabIndex === 4 && 'active'" @click="tabIndex = 4">{{ store.master.name }}</div>
        </div>
        <Tooltip
            :title="`关闭(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
        >
          <Close @click="settingStore.showPanel = false"/>
        </Tooltip>
      </header>
      <Slide :slide-count="4" :step="tabIndex">
        <div class="slide-item">
          <slot :active="tabIndex === 0 && settingStore.showPanel"></slot>
        </div>
        <div class="slide-item">
          <div class="panel-page-item">
            <div class="list-header">
              <div class="left">
                <div class="dict-name" v-if="props.type === DictType.word && store.collectWord.words.length">
                  {{ store.collectWord.words.length }}个单词
                </div>
                <div class="dict-name" v-if="props.type === DictType.article && store.collectArticle.articles.length">
                  {{ store.collectArticle.articles.length }}篇文章
                </div>
                <BaseIcon icon="fluent:add-12-regular" title="添加" @click="nav('edit-word-dict',{type:0})"/>
              </div>
              <template v-if="showCollectToggleButton">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="changeCollect"
                >
                  <BaseButton size="small">切换</BaseButton>
                </PopConfirm>
              </template>
            </div>
            <template v-if="props.type === DictType.word">
              <WordList
                  v-if="store.collectWord.words.length"
                  class="word-list"
                  :list="store.collectWord.words">
                <template v-slot:suffix="{item,index}">
                  <BaseIcon
                      class="del"
                      @click="toggleWordCollect(item)"
                      title="移除"
                      icon="solar:trash-bin-minimalistic-linear"/>
                </template>
              </WordList>
              <Empty v-else/>
            </template>
            <template v-else>
              <ArticleList
                  v-if="store.collectArticle.articles.length"
                  :list="store.collectArticle.articles">
                <template v-slot:suffix="{item,index}">
                  <BaseIcon
                      class="del"
                      @click="toggleArticleCollect(item)"
                      title="移除"
                      icon="solar:trash-bin-minimalistic-linear"/>
                </template>
              </ArticleList>
              <Empty v-else/>
            </template>
          </div>
        </div>
        <div class="slide-item">
          <div class="panel-page-item">
            <div class="list-header">
              <div class="left">
                <div class="dict-name">总词数：{{ store.simple.words.length }}</div>
                <BaseIcon icon="fluent:add-12-regular" title="添加" @click="nav('edit-word-dict',{type:2})"/>
              </div>
              <template v-if="store.simple.words.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="changeIndex( store.simple)"
                >
                  <BaseButton size="small">切换</BaseButton>
                </PopConfirm>
              </template>
            </div>
            <WordList
                v-if="store.simple.words.length"
                class="word-list"
                :list="store.simple.words">
              <template v-slot:suffix="{item,index}">
                <BaseIcon
                    class="del"
                    @click="delSimpleWord(item)"
                    title="移除"
                    icon="solar:trash-bin-minimalistic-linear"/>
              </template>
            </WordList>
            <Empty v-else/>
          </div>
        </div>
        <div class="slide-item">
          <div class="panel-page-item" v-if="store.wrong.words.length">
            <div class="list-header">
              <div class="dict-name">总词数：{{ store.wrong.words.length }}</div>
              <PopConfirm
                  :title="`确认切换？`"
                  @confirm="changeIndex( store.wrong)"
              >
                <BaseButton size="small">切换</BaseButton>
              </PopConfirm>
            </div>
            <WordList
                class="word-list"
                :list="store.wrong.words">
              <template v-slot:suffix="{item,index}">
                <BaseIcon
                    class="del"
                    @click="delWrongWord(item)"
                    title="移除"
                    icon="solar:trash-bin-minimalistic-linear"/>
              </template>
            </WordList>
          </div>
          <Empty v-else/>
        </div>
      </Slide>
    </div>
  </Transition>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable";

$header-height: 3rem;
.slide-item {
  width: var(--panel-width);
  height: 100%;
}

.panel {
  border-radius: .5rem;
  width: var(--panel-width);
  background: var(--color-second-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  z-index: 1;
  border: 1px solid var(--color-item-border);
  box-shadow: var(--shadow);

  & > header {
    min-height: 3rem;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .6rem .9rem;
    border-bottom: 1px solid #e1e1e1;
    gap: 1rem;

    .close {
      cursor: pointer;
    }

    .tabs {
      display: flex;
      align-items: center;
      gap: .9rem;
      font-size: .8rem;

      .tab {
        cursor: pointer;
        word-break: keep-all;
        font-size: 1rem;
        transition: all .3s;
        color: gray;

        &.active {
          color: var(--color-main-active);
          font-weight: bold;
        }
      }
    }
  }
}
</style>
