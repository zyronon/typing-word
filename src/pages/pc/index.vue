<script setup lang="ts">

import {ShortcutKey} from "@/types.ts";
import Logo from "@/pages/pc/components/Logo.vue";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/stores/setting.ts";
import {useRouter} from "vue-router";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import useTheme from "@/hooks/theme.ts";
import BaseIcon from "@/components/BaseIcon.vue";


const settingStore = useSettingStore()
const router = useRouter()
const {toggleTheme} = useTheme()


</script>

<template>
  <div class="layout">
    <!--    第一个aside 占位用-->
    <div class="aside space" :class="{'expand':settingStore.sideExpand}"></div>
    <div class="aside fixed" :class="{'expand':settingStore.sideExpand}">
      <div class="top">
        <Logo v-if="settingStore.sideExpand"/>
        <div class="row" @click="router.push('/home')">
          <Icon icon="iconoir:home"/>
          <span v-if="settingStore.sideExpand">主页</span>
        </div>
        <div class="row" @click="router.push('/word')">
          <Icon icon="material-symbols-light:dictionary-outline-sharp"/>
          <!--          <Icon icon="streamline:dictionary-language-book"/>-->
          <span v-if="settingStore.sideExpand">单词</span>
        </div>
        <div class="row" @click="router.push('/article')">
          <Icon icon="ph:article-ny-times"/>
          <span v-if="settingStore.sideExpand">文章</span>
        </div>
        <div class="row" @click="router.push('/setting')">
          <Icon icon="uil:setting"/>
          <span v-if="settingStore.sideExpand">设置</span>
        </div>
        <!--        <div class="row" @click="router.push('/article2')">-->
        <!--          <Icon icon="healthicons:i-exam-multiple-choice-outline"/>-->
        <!--          <span v-if="settingStore.sideExpand">试卷</span>-->
        <!--        </div>-->
        <!--        <div class="row">-->
        <!--          <Icon icon="mdi-light:forum"/>-->
        <!--          <span v-if="settingStore.sideExpand">社区</span>-->
        <!--        </div>-->
      </div>
      <div class="bottom flex justify-evenly ">
        <BaseIcon
            @click="settingStore.sideExpand = !settingStore.sideExpand"
            :icon="settingStore.sideExpand?'formkit:left':'formkit:right'"/>
        <Tooltip
            :title="`切换主题(${settingStore.shortcutKeyMap[ShortcutKey.ToggleTheme]})`"
            v-if="settingStore.sideExpand"
        >
          <IconWrapper>
            <Icon icon="ep:moon" v-if="settingStore.theme === 'dark'"
                  @click="toggleTheme"/>
            <Icon icon="tabler:sun" v-else @click="toggleTheme"/>
          </IconWrapper>
        </Tooltip>
      </div>
    </div>
    <div class="flex-1 z-1 relative">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--color-background);
}

.aside {
  background: var(--color-second-bg);
  height: 100vh;
  padding: 1rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: rgb(0 0 0 / 3%) 0px 0px 12px 0px;
  width: 4.5rem;
  transition: all 0.3s;
  z-index: 2;

  .row {
    @apply cursor-pointer rounded-md  text p-2 my-2 flex items-center gap-2;
    transition: all .5s;
    flex-shrink: 0;

    &:hover {
      background: var(--color-primary);
      color: white;
    }

    span {
      flex-shrink: 0;
    }

    svg {
      flex-shrink: 0;
      font-size: 1.5rem !important;
    }
  }

  &.expand {
    width: var(--aside-width);
  }
}
</style>
