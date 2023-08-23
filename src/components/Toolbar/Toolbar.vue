<script setup lang="ts">
import Tooltip from "@/components/Tooltip.vue"
import {
  DatabaseFail,
  Down,
  MenuFold,
  Moon,
  PreviewCloseOne,
  PreviewOpen,
  SettingTwo,
  SunOne,
  VolumeNotice,
  Bug
} from "@icon-park/vue-next"
import IconRepeat from '~icons/tabler/repeat'
import useThemeColor from "@/hooks/useThemeColor.ts"
import {useBaseStore} from "@/stores/base.ts"
import SettingModal from "@/components/Toolbar/SettingModal.vue"
import FeedbackModal from "@/components/Toolbar/FeedbackModal.vue"

const {appearance, toggle} = useThemeColor()
const store = useBaseStore()
const showFeedbackModal = $ref(false)
const showSettingModal = $ref(false)
</script>

<template>
  <header :class="!store.setting.showToolbar && 'hide'">
    <div class="info" @click="store.dictModalIsOpen = true">
      CTE-4 第5章
    </div>
    <div class="options">
      <Tooltip title="切换主题">
        <moon v-if="appearance === 'dark'" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"
              @click="toggle"/>
        <sun-one v-else theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2" @click="toggle"/>
      </Tooltip>
      <Tooltip title="设置">
        <setting-two @click="showSettingModal = true" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <Tooltip title="反馈">
        <bug @click="showFeedbackModal = true" theme="outline" size="20" fill="#999" :strokeWidth="2"/>
      </Tooltip>
      <Tooltip title="音效设置">
        <volume-notice theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <IconRepeat></IconRepeat>
      <Tooltip title="单词本">
        <preview-open theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
        <preview-close-one theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <div class="my-button" @click="store.dictModalIsOpen2 = true">ok</div>
      <Tooltip title="单词本">
        <menu-fold class="menu" @click="store.sideIsOpen = !store.sideIsOpen"
                   theme="outline" size="20" fill="#929596"
                   :strokeWidth="2"/>
      </Tooltip>
    </div>
    <Tooltip :title="store.setting.showToolbar?'收起':'展开'">
      <down
          @click="store.setting.showToolbar = !store.setting.showToolbar"
          class="arrow"
          :class="!store.setting.showToolbar && 'down'"
          theme="outline" size="24" fill="#999"/>
    </Tooltip>
  </header>
  <SettingModal v-model="showSettingModal"/>
  <FeedbackModal v-model="showFeedbackModal"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

header {
  margin-top: 10rem;
  height: 60rem;
  width: 50%;
  background: var(--color-header-bg);
  display: flex;
  justify-content: space-between;
  border-radius: 8rem;
  position: relative;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;
  transition: all .3s;

  .info {
    font-size: 22rem;
    color: black;
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

  &.hide {
    transform: translateY(calc(-100% - 10rem));
  }

  .arrow {
    position: absolute;
    bottom: 0;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: translate3d(-50%, 120%, 0) rotate(180deg);

    &.down {
      transform: translate3d(-50%, 120%, 0) rotate(0);
    }
  }
}
</style>