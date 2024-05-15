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
import {$ref} from "vue/macros";
import {DictType, ShortcutKey} from "@/types.ts";
import ChapterName from "@/pages/pc/components/toolbar/ChapterName.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import BaseIcon from "@/components/BaseIcon.vue";

const {toggleTheme} = useTheme()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
const practiceStore = usePracticeStore()

const headerRef = $ref<HTMLDivElement>(null)
const moreOptionsRef = $ref<HTMLDivElement>(null)

watch([() => settingStore.showToolbar, () => headerRef], n => {
  if (n[1]) {
    if (n[0]) {
      n[1].style.marginTop = '10rem'
    } else {
      let rect = n[1].getBoundingClientRect()
      n[1].style.marginTop = `-${rect.height}px`
    }
  }
})

function toggle() {
  if (settingStore.collapse) {
    setTimeout(() => {
      moreOptionsRef.style.overflow = 'unset'
    }, 300)
  } else {
    moreOptionsRef.style.overflow = 'hidden'
  }
  settingStore.collapse = !settingStore.collapse
}

watch(() => store.load, n => {
  if (!settingStore.collapse) {
    moreOptionsRef.style.overflow = 'unset'
  }
})

</script>

<template>
  <header ref="headerRef">
    <div class="content">
      <div class="dict-name">
        <Tooltip
            :title="`词典详情(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.OpenDictDetail]})`">
          <div class="info hvr-grow" @click="emitter.emit(EventKey.openDictModal,'detail')">
            {{ store.currentDict.name }} {{ practiceStore.repeatNumber ? '  复习错词' : '' }}
          </div>
        </Tooltip>
        <ChapterName v-if="store.currentDict.type === DictType.word"/>
        <div class="info-text" v-if="practiceStore.repeatNumber">
          复习错词
        </div>
      </div>

      <div class="options" ref="moreOptionsRef">
        <div class="more" :class="settingStore.collapse && 'hide'">
          <Tooltip title="收起图标">
            <IconWrapper>
              <Icon :icon="`system-uicons:window-collapse-${settingStore.collapse?'left':'right'}`"
                    @click="toggle"/>
            </IconWrapper>
          </Tooltip>

          <Tooltip
              :title="`开关默写模式(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
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

          <!--                    <Add/>-->

          <BaseIcon
              @click="emitter.emit(EventKey.openDictModal,'my')"
              title="添加"
              icon="ic:outline-cloud-upload"/>


          <Tooltip
              :title="`切换主题(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.ToggleTheme]})`"
          >
            <IconWrapper>
              <Icon icon="ep:moon" v-if="settingStore.theme === 'dark'"
                    @click="toggleTheme"/>
              <Icon icon="tabler:sun" v-else @click="toggleTheme"/>
            </IconWrapper>
          </Tooltip>
        </div>

        <div class="with-bg anim">
          <BaseIcon
              @click="runtimeStore.showSettingModal = true"
              :title="`设置(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.OpenSetting]})`"
              icon="uil:setting"/>
          <BaseIcon
              @click="settingStore.showPanel = !settingStore.showPanel"
              :title="`单词本(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
              icon="tdesign:menu-unfold"/>
        </div>
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
  border-radius: 6rem;
  color: var(--color-font-1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all .3s;
  padding: 6rem 8rem;

  &:hover {
    background: var(--color-main-active);
    color: white;
  }
}

.info-text {
  @extend .info;
  cursor: unset;

  &:hover {
    background: unset;
  }
}
</style>
<style scoped lang="scss">
@import "@/assets/css/style";

.test-enter-active,
.test-leave-active {
  transition: all 0.3s;
}

.test-enter-from,
.test-leave-to {
  width: 0;
}

header {
  width: var(--toolbar-width);
  margin-top: 10rem;
  background: var(--color-second-bg);
  border-radius: 8rem;
  margin-bottom: 30rem;
  position: relative;
  z-index: 2;
  padding: 4rem var(--space);
  box-sizing: border-box;
  gap: 10rem;
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
      font-size: 17rem;
      position: relative;
    }

    .hide {
      transform: translateX(calc(100% - 36rem));
    }

    .options {
      display: flex;
      align-items: center;
      overflow: hidden;

      .icon-wrapper {
        margin-left: 10rem;
      }

      :deep(.icon-wrapper) {
        margin-left: 10rem;
      }

      .more {
        display: flex;
        align-items: center;
        transition: all .3s;
      }

      .with-bg {
        display: flex;
        align-items: center;
        position: relative;
        background: var(--color-second-bg);
      }
    }
  }

  .arrow {
    position: absolute;
    bottom: 0;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: translate3d(-50%, 100%, 0) rotate(180deg);
    padding: 5rem;

    &.down {
      transform: translate3d(-50%, 100%, 0) rotate(0);
    }
  }
}
</style>