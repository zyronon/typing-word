<script setup lang="ts">
import {computed, provide} from "vue"
import {ShortcutKey} from "@/types.ts"
import {useSettingStore} from "@/stores/setting.ts";
import Close from "@/components/icon/Close.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";

const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))


</script>
<template>
  <Transition name="fade">
    <div class="panel anim" v-show="settingStore.showPanel">
      <header class="flex justify-between items-center py-3 px-space">
        <div class="color-main"><slot name="title"></slot></div>
        <Tooltip
            :title="`关闭(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
        >
          <Close @click="settingStore.showPanel = false"/>
        </Tooltip>
      </header>
      <div class="flex-1 overflow-hidden">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>
<style scoped lang="scss">

.panel {
  border-radius: .5rem;
  width: var(--panel-width);
  background: var(--color-second);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  z-index: 1;
  border: 1px solid var(--color-item-border);
  box-shadow: var(--shadow);
}
</style>
