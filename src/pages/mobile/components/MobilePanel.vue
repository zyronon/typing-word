<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"

import {computed, provide, watch} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import {EventKey, useEvent} from "@/utils/eventBus.ts";
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

useEvent(EventKey.changeDict, () => {
  tabIndex = 0
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
