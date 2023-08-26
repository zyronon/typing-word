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
  Bug,
  UploadOne
} from "@icon-park/vue-next"
import useTheme from "@/hooks/useTheme.ts"
import {useBaseStore} from "@/stores/base.ts"
import SettingModal from "@/components/Toolbar/SettingModal.vue"
import FeedbackModal from "@/components/Toolbar/FeedbackModal.vue"
import DictModal from "@/components/Toolbar/DictModal.vue"

import IconWrapper from "@/components/IconWrapper.vue";
import IconCog6Tooth from '~icons/heroicons/cog-6-tooth-solid'

import IconLanguage from '~icons/tabler/language'
import IconLanguageOff from '~icons/tabler/language-off'

import IconEye from '~icons/heroicons/eye-solid'
import IconCheck from '~icons/tabler/check'
import IconEyeSlash from '~icons/heroicons/eye-slash-solid'

import IconRepeat from '~icons/tabler/repeat'
import IconRepeatOff from '~icons/tabler/repeat-off'

const { toggle} = useTheme()
const store = useBaseStore()
const showFeedbackModal = $ref(false)
const showSettingModal = $ref(false)
const showDictModal = $ref(false)

function t() {
  console.log('t')
}
</script>

<template>
  <header :class="!store.setting.showToolbar && 'hide'">
    <div class="info" @click="showDictModal = true">
      {{ store.currentDict.name }} 第{{ store.currentDict.chapterIndex + 1 }}章
    </div>
    <div class="options">
      <Tooltip title="切换主题">
        <IconWrapper>
          <moon v-if="store.theme === 'dark'"
                @click="toggle"/>
          <sun-one v-else @click="toggle"/>
        </IconWrapper>
      </Tooltip>

      <Tooltip title="音效设置">
        <IconWrapper>
          <volume-notice/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="设置单词循环">
        <IconWrapper>
          <IconRepeat></IconRepeat>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="开关默写模式">
        <IconWrapper>
          <IconEyeSlash v-if="store.isDictation" @click="store.isDictation = false"></IconEyeSlash>
          <IconEye v-else @click="store.isDictation = true"></IconEye>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="开关释义显示">
        <IconWrapper>
          <IconLanguage></IconLanguage>
          <!--          <IconLanguageOff></IconLanguageOff>-->
        </IconWrapper>
      </Tooltip>

      <Tooltip title="反馈">
        <IconWrapper>
          <upload-one/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="反馈">
        <IconWrapper>
          <bug @click="showFeedbackModal = true"/>
        </IconWrapper>
      </Tooltip>
      <Tooltip title="设置">
        <IconWrapper>
          <IconCog6Tooth @click="showSettingModal = true"></IconCog6Tooth>
        </IconWrapper>
      </Tooltip>
      <div class="my-button" @click="store.statModalIsOpen = true">ok</div>

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
  <DictModal v-model="showDictModal"/>
  <SettingModal v-model="showSettingModal"/>
  <FeedbackModal v-model="showFeedbackModal"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

header {
  top: 10rem;
  height: 60rem;
  width: var(--toolbar-width);
  background: var(--color-header-bg);
  display: flex;
  justify-content: space-between;
  border-radius: 8rem;
  position: absolute;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;
  transition: all .3s;

  .info {
    font-size: 18rem;
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
    transform: translate3d(-50%, 100%, 0) rotate(180deg);
    padding: 10rem;

    &.down {
      transform: translate3d(-50%, 100%, 0) rotate(0);
    }
  }
}
</style>