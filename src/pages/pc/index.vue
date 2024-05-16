<script setup lang="ts">

import {ShortcutKey} from "@/types.ts";
import Logo from "@/pages/pc/components/Logo.vue";
import {Icon} from "@iconify/vue";
import {usePracticeStore} from "@/stores/practice.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

const practiceStore = usePracticeStore()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
</script>

<template>
  <div class="layout">
    <div class="aside">
      <div class="top">
        <Logo/>
        <div class="row">
          <Icon icon="material-symbols-light:dictionary-outline-sharp"/>
          <!--          <Icon icon="streamline:dictionary-language-book"/>-->
          <span>单词</span>
        </div>
        <div class="row">
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
      <div class="bottom">
        <div class="row"
             :title="`设置(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
             @click="runtimeStore.showSettingModal = true">
          <Icon icon="uil:setting"/>
          <span>试卷</span>
        </div>
      </div>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  font-size: 14rem;
}

.aside {
  background: white;
  //position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 200rem;
  padding: 20rem 10rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .row {
    padding: 10rem;
    display: flex;
    align-items: center;
    gap: 10rem;
    font-size: 16rem;
    //font-weight: bold;

    svg {
      font-size: 36rem;
    }
  }
}

.content {
  flex: 1;
}
</style>