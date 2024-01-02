<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"

import {$computed, $ref} from "vue/macros"
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
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRouter} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {cloneDeep} from "lodash-es";
import WordList from "@/pages/pc/components/list/WordList.vue";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import Slide from "@/pages/pc/components/Slide.vue";
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import CollectList from "@/pages/mobile/components/CollectList.vue";
import WrongList from "@/pages/mobile/components/WrongList.vue";
import SimpleList from "@/pages/mobile/components/SimpleList.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

watch(() => settingStore.showPanel, n => {
  if (n) {
    tabIndex = 0
  }
})

onMounted(() => {
  emitter.on(EventKey.changeDict, () => {
    tabIndex = 0
  })
})

onUnmounted(() => {
  emitter.off(EventKey.changeDict)
})


</script>
<template>
  <div class="panel anim">
    <header>
      <div class="tabs">
        <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">当前</div>
        <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">{{ store.collect.name }}</div>
        <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">{{ store.wrong.name }}</div>
        <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">{{ store.simple.name }}</div>
      </div>
    </header>
    <SlideHorizontal v-model:index="tabIndex">
      <SlideItem>
        <slot :active="tabIndex === 0 && settingStore.showPanel"></slot>
      </SlideItem>
      <SlideItem>
        <CollectList/>
      </SlideItem>
      <SlideItem>
        <WrongList/>
      </SlideItem>
      <SlideItem>
        <SimpleList/>
      </SlideItem>
    </SlideHorizontal>
  </div>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable";

$header-height: 50rem;
.panel {
  border-radius: 8rem;
  width: 100%;
  background: var(--color-second-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  z-index: 1;
  border: 1px solid var(--color-item-border);
  box-shadow: var(--shadow);


  & > header {
    min-height: 50rem;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rem 15rem;
    border-bottom: 1px solid #e1e1e1;
    gap: 15rem;

    .close {
      cursor: pointer;
    }

    .tabs {
      display: flex;
      align-items: center;
      gap: 15rem;
      font-size: 14rem;

      .tab {
        cursor: pointer;
        word-break: keep-all;
        font-size: 16rem;
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
