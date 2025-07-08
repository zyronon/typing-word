<script setup lang="ts">
import Tooltip from "@/pages/pc/components/Tooltip.vue"
import useTheme from "@/hooks/theme.ts"
import {useBaseStore} from "@/stores/base.ts"

import {Icon} from '@iconify/vue';

import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import {watch} from "vue"
import VolumeSetting from "@/pages/pc/components/toolbar/VolumeSetting.vue";
import RepeatSetting from "@/pages/pc/components/toolbar/RepeatSetting.vue";
import TranslateSetting from "@/pages/pc/components/toolbar/TranslateSetting.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {ShortcutKey} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import {useNav} from "@/utils";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const statisticsStore = usePracticeStore()

const headerRef = $ref<HTMLDivElement>(null)
const moreOptionsRef = $ref<HTMLDivElement>(null)

watch([() => settingStore.showToolbar, () => headerRef], n => {
  if (n[1]) {
    if (n[0]) {
      n[1].style.marginTop = '.8rem'
    } else {
      let rect = n[1].getBoundingClientRect()
      n[1].style.marginTop = `-${rect.height}px`
    }
  }
})


const {nav} = useNav()
</script>

<template>
  <header ref="headerRef">
    <div class="content">
      <div class="dict-name">
        <Tooltip
            :title="`词典详情(${settingStore.shortcutKeyMap[ShortcutKey.OpenDictDetail]})`">
          <div class="info" @click="emitter.emit(EventKey.openDictModal,'detail')">
            {{ store.currentStudyWordDict.name }}
          </div>
        </Tooltip>
        <BaseIcon title="切换词典"
                  @click="nav('/dict')"
                  icon="gg:arrows-exchange"/>
      </div>
      <div class="options" >
        <Tooltip
            :title="`开关默写模式(${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
        >
          <IconWrapper>
            <Icon icon="majesticons:eye-off-line"
                  v-if="settingStore.dictation"
                  @click="settingStore.dictation = false"/>
            <Icon icon="mdi:eye-outline"
                  v-else
                  @click="settingStore.dictation = true"/>
          </IconWrapper>
        </Tooltip>

        <TranslateSetting/>

        <VolumeSetting/>

        <RepeatSetting/>

        <BaseIcon
            @click="settingStore.showPanel = !settingStore.showPanel"
            :title="`单词本(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
            icon="tdesign:menu-unfold"/>
      </div>

    </div>
    <Tooltip :title="settingStore.showToolbar?'收起':'展开'">
      <Icon icon="icon-park-outline:down"
            @click="settingStore.showToolbar = !settingStore.showToolbar"
            class="arrow"
            :class="!settingStore.showToolbar && 'down'"
            width="24"
            color="#999"/>
    </Tooltip>
  </header>

</template>

<style lang="scss">
.info {
  border-radius: .5rem;
  color: var(--color-font-1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all .3s;
  padding: .5rem .6rem;

  &:hover {
    background: var(--color-main-active);
    color: white;
  }
}
</style>
<style scoped lang="scss">


header {
  width: var(--toolbar-width);
  margin-top: 1rem;
  background: var(--color-second-bg);
  border-radius: .8rem;
  margin-bottom: 1.8rem;
  position: relative;
  z-index: 2;
  padding: .4rem var(--space);
  box-sizing: border-box;
  gap: 1rem;
  border: 1px solid var(--color-item-border);
  transition: all var(--anim-time);
  box-shadow: var(--shadow);

  .content {
    min-height: var(--toolbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .dict-name {
      display: flex;
      max-width: 45%;
      font-size: 1rem;
      position: relative;
      align-items: center;
      gap: .3rem;
    }

    .options {
      display: flex;
      align-items: center;
      gap:.2rem;
    }
  }

  .arrow {
    position: absolute;
    bottom: 0;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: translate3d(-50%, 100%, 0) rotate(180deg);
    padding: .5rem;

    &.down {
      transform: translate3d(-50%, 100%, 0) rotate(0);
    }
  }
}
</style>
