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

let show = $ref(false)
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
    <div class="fixed top-8 left-8 z-9">
      <BaseIcon
          :title="`收起(${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
          @click="show = !show"
          icon="hugeicons:menu-square"/>
      <div class="menus flex flex-col" v-if="show">
        <BaseIcon
            title="单词"
            @click="router.push('/word')"
            icon="material-symbols-light:dictionary-outline-sharp"/>
        <BaseIcon
            title="文章"
            @click="router.push('/article')"
            icon="ph:article-ny-times"/>
        <BaseIcon
            title="试卷"
            icon="healthicons:i-exam-multiple-choice-outline"/>
        <BaseIcon
            :title="`展开(${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
            @click="settingStore.showSide = !settingStore.showSide"
            icon="formkit:right"/>
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
    @apply cursor-pointer rounded-md  text p-2 my-2 flex items-center gap-2;
    transition: all .5s;

    &:hover {
      background: var(--color-primary);
      color: white;
    }

    svg {
      font-size: 1.5rem;
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