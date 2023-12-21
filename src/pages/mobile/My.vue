<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import useTheme from "@/hooks/theme.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {go} from "@/utils";
import router from "@/router.ts";

const {toggleTheme} = useTheme()
const settingStore = useSettingStore()

</script>

<template>
  <div class="page setting">

    <div class="setting-list">
      <div class="item">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>收藏</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>错词本</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item" @click="router.push('/mobile/setting')">
        <div class="left">
          <Icon icon="uil:setting" width="22"/>
          <span>设置</span>
        </div>
        <Icon class="arrow" icon="mingcute:right-line" width="20"/>
      </div>
      <div class="item">
        <div class="left">
          <Icon icon="mdi:about-circle-outline" width="22"/>
          <span>问题反馈</span>
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
      <div class="item">
        <IconWrapper>
          <Icon icon="ep:moon" v-if="settingStore.theme === 'dark'"
                @click="toggleTheme"/>
          <Icon icon="tabler:sun" v-else @click="toggleTheme"/>
        </IconWrapper>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.setting {
  font-size: 18rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .setting-list {
    margin-top: 100rem;
    background: var(--color-third-bg);
    border-radius: 8rem;
    width: 80%;

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