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

const {toggle} = useTheme()
const store = useBaseStore()
const showFeedbackModal = $ref(false)
const showSettingModal = $ref(false)
const showDictModal = $ref(false)
const headerRef = $ref<HTMLDivElement>(null)

watch(() => store.setting.showToolbar, n => {
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
    <div class="info" @click="showDictModal = true">
            {{ store.dictTitle }}
    </div>
    <div class="options">
      <Tooltip title="切换主题">
        <IconWrapper>
          <Icon icon="ep:moon" v-if="store.theme === 'dark'"
                @click="toggle"/>
          <Icon icon="tabler:sun" v-else @click="toggle"/>
        </IconWrapper>
      </Tooltip>

      <Tooltip title="音效设置">
        <IconWrapper>
          <Icon icon="icon-park-outline:volume-notice"/>
        </IconWrapper>
      </Tooltip>

      <Tooltip title="设置单词循环">
        <IconWrapper>
          <Icon icon="tabler:repeat"/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="开关默写模式">
        <IconWrapper>
          <Icon icon="majesticons:eye-off-line" v-if="store.isDictation" @click="store.isDictation = false"/>
          <Icon icon="mdi:eye-outline" v-else @click="store.isDictation = true"/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="开关释义显示">
        <IconWrapper>
          <Icon icon="heroicons-outline:translate"/>
        </IconWrapper>
      </Tooltip>

      <Tooltip title="反馈">
        <IconWrapper>
          <Icon icon="ic:outline-cloud-upload"/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="反馈">
        <IconWrapper>
          <Icon icon="octicon:bug-24" @click="showFeedbackModal = true"/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="设置">
        <IconWrapper>
          <Icon icon="uil:setting" @click="showSettingModal = true"/>
        </IconWrapper>
      </Tooltip>
      <div class="my-button" @click="emitter.emit(EventKey.openStatModal)">ok</div>

      <Tooltip title="单词本">
        <IconWrapper>
          <Icon icon="tdesign:menu-unfold" class="menu" @click="emitter.emit(EventKey.openSide)"/>
        </IconWrapper>
      </Tooltip>
    </div>
    <Tooltip :title="store.setting.showToolbar?'收起':'展开'">
      <Icon icon="icon-park-outline:down"
            @click="store.setting.showToolbar = !store.setting.showToolbar"
            class="arrow"
            :class="!store.setting.showToolbar && 'down'"
            width="24" color="#999"/>
    </Tooltip>
  </header>
  <DictModal v-model="showDictModal"/>
  <SettingModal v-model="showSettingModal"/>
  <FeedbackModal v-model="showFeedbackModal"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

header {
  width: var(--toolbar-width);
  margin-top: 10rem;
  min-height: 60rem;
  background: var(--color-header-bg);
  display: flex;
  justify-content: space-between;
  border-radius: 8rem;
  margin-bottom: 30rem;
  //position: absolute;
  position: relative;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;
  transition: all .3s;
  gap: 10rem;
  //opacity: 0;

  .info {
    font-size: 16rem;
    color: var(--color-font-1);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .options {
    display: flex;
    align-items: center;
    gap: 10rem;
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