<script setup lang="ts">

import {ShortcutKey} from "@/types.ts";
import Logo from "@/pages/pc/components/Logo.vue";
import {Icon} from "@iconify/vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useRouter} from "vue-router";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import useTheme from "@/hooks/theme.ts";
import BaseIcon from "@/components/BaseIcon.vue";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const router = useRouter()
const {toggleTheme} = useTheme()

</script>

<template>
  <div class="layout">
    <div class="aside" :class="{'hide':settingStore.showSide}">
      <div class="top">
        <Logo/>
        <div class="row" @click="router.push('/home')">
          <Icon icon="iconoir:home"/>
          <span>主页</span>
        </div>
        <div class="row" @click="router.push('/word')">
          <Icon icon="material-symbols-light:dictionary-outline-sharp"/>
          <!--          <Icon icon="streamline:dictionary-language-book"/>-->
          <span>单词</span>
        </div>
        <div class="row" @click="router.push('/article')">
          <Icon icon="ph:article-ny-times"/>
          <span>文章</span>
        </div>
        <div class="row">
          <Icon icon="healthicons:i-exam-multiple-choice-outline"/>
          <span>试卷</span>
        </div>
        <div class="row">
          <Icon icon="mdi-light:forum"/>
          <span>社区</span>
        </div>
      </div>
      <div class="bottom flex justify-evenly ">
        <BaseIcon
            :title="`收起(${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
            @click="settingStore.showSide = !settingStore.showSide"
            icon="formkit:left"/>
        <Tooltip
            :title="`切换主题(${settingStore.shortcutKeyMap[ShortcutKey.ToggleTheme]})`"
        >
          <IconWrapper>
            <Icon icon="ep:moon" v-if="settingStore.theme === 'dark'"
                  @click="toggleTheme"/>
            <Icon icon="tabler:sun" v-else @click="toggleTheme"/>
          </IconWrapper>
        </Tooltip>
        <BaseIcon
            :title="`设置(${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
            @click="runtimeStore.showSettingModal = true"
            icon="uil:setting"/>
      </div>
    </div>
    <BaseIcon
        class="fixed top-5 left-6 z-9"
        :title="`收起(${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
        @click="settingStore.showSide = !settingStore.showSide"
        icon="formkit:right"/>
    <div class="flex-1 z-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  display: flex;
}

.aside {
  background: white;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--aside-width);
  padding: 1rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: rgb(0 0 0 / 3%) 0px 0px 12px 0px;
  transition: all .3s;

  .row {
    @apply cursor-pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    //font-weight: bold;

    svg {
      font-size: 2rem;
    }
  }

  &.hide {
    transform: translateX(-12rem);
  }
}

.content {
  flex: 1;
}
</style>