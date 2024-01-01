<script setup lang="ts">

import {Icon} from "@iconify/vue";
import useTheme from "@/hooks/theme.ts";
import {useSettingStore} from "@/stores/setting.ts";
import NavBar from "@/pages/mobile/components/NavBar.vue";
import {ref} from "vue";
import router from "@/router.ts";

const {toggleTheme} = useTheme()
const settingStore = useSettingStore()
// @ts-ignore
const gitLastCommitHash = ref(LATEST_COMMIT_HASH);

</script>

<template>
  <div class="mobile-page setting">
    <NavBar title="设置"/>
    <div class="content">
      <div class="setting-list">
        <div class="item" @click="router.push('music-setting')">
          <Icon icon="bx:headphone" width="22"/>
          <div class="right">
            <span>音效设置</span>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>
        </div>
        <div class="item" @click="router.push('other-setting')">
          <Icon icon="icon-park-outline:setting-config" width="22"/>
          <div class="right" style="border-bottom: none">
            <span>其他设置</span>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>
        </div>
      </div>
      <div class="git-log">
        Build {{ gitLastCommitHash }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../common";

.setting {
  display: flex;
  flex-direction: column;
  background: var(--color-second-bg);

  .content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 20rem;
    box-sizing: border-box;
  }

}
</style>