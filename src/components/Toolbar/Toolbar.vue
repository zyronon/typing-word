<script setup lang="ts">
import Tooltip from "@/components/Tooltip.vue"
import useTheme from "@/hooks/useTheme.ts"
import {useBaseStore} from "@/stores/base.ts"
import SettingModal from "@/components/Toolbar/SettingModal.vue"
import FeedbackModal from "@/components/Toolbar/FeedbackModal.vue"
import DictModal from "@/components/Toolbar/DictModal.vue"

import {Icon} from '@iconify/vue';

import IconWrapper from "@/components/IconWrapper.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {watch} from "vue"
import VolumeSetting from "@/components/Toolbar/VolumeSetting.vue";
import RepeatSetting from "@/components/Toolbar/RepeatSetting.vue";
import TranslateSetting from "@/components/Toolbar/TranslateSetting.vue";
import Add from "@/components/Toolbar/Add.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

const {toggle} = useTheme()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const practiceStore = usePracticeStore()

const showFeedbackModal = $ref(false)
const showSettingModal = $ref(false)
const headerRef = $ref<HTMLDivElement>(null)

watch(() => settingStore.showToolbar, n => {
  if (headerRef) {
    if (n) {
      headerRef.style.marginTop = '10rem'
    } else {
      let rect = headerRef.getBoundingClientRect()
      headerRef.style.marginTop = `-${rect.height}px`
    }
  }
})
</script>

<template>
  <header ref="headerRef">
    <div class="content">
      <div class="info hvr-grow" @click="runtimeStore.showDictModal = true">
        {{ store.dictTitle }} {{ practiceStore.repeatNumber ? '  复习错词' : '' }}
      </div>
      <div class="options">
        <Tooltip title="收起图标">
          <IconWrapper>
            <Icon :icon="`system-uicons:window-collapse-${settingStore.collapse?'left':'right'}`"
                  @click="settingStore.collapse = !settingStore.collapse"/>
          </IconWrapper>
        </Tooltip>

        <div class="more"  v-if="!settingStore.collapse">
          <Tooltip title="开关默写模式">
            <IconWrapper>
              <Icon icon="majesticons:eye-off-line"
                    v-if="settingStore.dictation"
                    @click="settingStore.dictation = false"/>
              <Icon icon="mdi:eye-outline"
                    v-else
                    @click="settingStore.dictation = true"/>
            </IconWrapper>
          </Tooltip>

          <TranslateSetting/>

          <VolumeSetting/>

          <RepeatSetting/>

          <Add/>

          <Tooltip title="反馈">
            <IconWrapper>
              <Icon icon="octicon:bug-24" @click="showFeedbackModal = true"/>
            </IconWrapper>
          </Tooltip>

          <Tooltip title="切换主题">
            <IconWrapper>
              <Icon icon="ep:moon" v-if="settingStore.theme === 'dark'"
                    @click="toggle"/>
              <Icon icon="tabler:sun" v-else @click="toggle"/>
            </IconWrapper>
          </Tooltip>
        </div>

        <Tooltip title="设置">
          <IconWrapper>
            <Icon icon="uil:setting" @click="showSettingModal = true"/>
          </IconWrapper>
        </Tooltip>
        <!--        <div class="base-button" @click="emitter.emit(EventKey.openStatModal)">ok</div>-->

        <Tooltip title="单词本">
          <IconWrapper>
            <Icon icon="tdesign:menu-unfold" class="menu" @click="settingStore.showPanel = !settingStore.showPanel"/>
          </IconWrapper>
        </Tooltip>
      </div>
    </div>
    <Tooltip :title="settingStore.showToolbar?'收起':'展开'">
      <Icon icon="icon-park-outline:down"
            @click="settingStore.showToolbar = !settingStore.showToolbar"
            class="arrow"
            :class="!settingStore.showToolbar && 'down'"
            width="24"
            color="#999"/>
    </Tooltip>
  </header>
  <DictModal :model-value="runtimeStore.showDictModal" @close="runtimeStore.showDictModal = false"/>
  <SettingModal v-if="showSettingModal" @close="showSettingModal = false"/>
  <FeedbackModal v-if="showFeedbackModal" @close="showFeedbackModal = false"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

header {
  width: var(--toolbar-width);
  margin-top: 10rem;
  background: var(--color-second-bg);
  border-radius: 8rem;
  margin-bottom: 30rem;
  position: relative;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;
  transition: all .3s;
  gap: 10rem;
  border: 1px solid var(--color-item-border);


  .content {
    min-height: 60rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info {
      font-size: 17rem;
      padding: 6rem 10rem;
      border-radius: 6rem;
      color: var(--color-font-1);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all .3s;

      &:hover {
        background: var(--color-main-active);
        color: white;
      }
    }

    .options {
      display: flex;
      align-items: center;
      gap: 10rem;

      .more {
        display: flex;
        gap: 10rem;
        align-items: center;
        //overflow: hidden;
        transition: all .3s;
      }
    }
  }

  .arrow {
    position: absolute;
    bottom: 0;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: translate3d(-50%, 100%, 0) rotate(180deg);
    padding: 5rem;

    &.down {
      transform: translate3d(-50%, 100%, 0) rotate(0);
    }
  }
}
</style>