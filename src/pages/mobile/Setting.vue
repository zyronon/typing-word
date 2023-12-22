<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import useTheme from "@/hooks/theme.ts";
import {useSettingStore} from "@/stores/setting.ts";
import NavBar from "@/pages/mobile/components/NavBar.vue";
import router from "@/router.ts";

const {toggleTheme} = useTheme()
const settingStore = useSettingStore()

</script>

<template>
  <div class="mobile-page setting">
    <NavBar title="设置"/>
    <div class="setting-list">
      <div class="item">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>音效设置</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>其他设置</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item" @click="router.push('/mobile/data-manage')">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>数据管理</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item" @click="router.push('/mobile/data-manage')">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>反馈问题</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item">
        <div class="left">
          <Icon icon="mdi:about-circle-outline" width="22"/>
          <span>关于我们</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting {
  display: flex;
  flex-direction: column;
  align-items: center;

  .setting-list {
    background: var(--color-third-bg);
    border-radius: 8rem;
    width: 90%;

    .item {
      height: 60rem;
      padding: 0 20rem;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left {
        display: flex;
        align-items: center;
        gap: 10rem;
      }
    }
  }
}
</style>