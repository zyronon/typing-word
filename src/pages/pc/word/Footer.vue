<script setup lang="ts">

import {onMounted, onUnmounted} from "vue"
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {ShortcutKey} from "@/types.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import {Icon} from "@iconify/vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import TranslateSetting from "@/pages/pc/components/toolbar/TranslateSetting.vue";
import VolumeSetting from "@/pages/pc/components/toolbar/VolumeSetting.vue";
import RepeatSetting from "@/pages/pc/components/toolbar/RepeatSetting.vue";

const statisticsStore = usePracticeStore()
const settingStore = useSettingStore()

defineProps<{
  showEdit?: boolean,
  isCollect: boolean,
  isSimple: boolean
}>()

const emit = defineEmits<{
  toggleCollect: [],
  toggleSimple: [],
  edit: [],
  skip: [],
}>()

function format(val: number, suffix: string = '', check: number = -1) {
  return val === check ? '-' : (val + suffix)
}

const progress = $computed(() => {
  if (!statisticsStore.total) return 0
  if (statisticsStore.index > statisticsStore.total) return 100
  return ((statisticsStore.index / statisticsStore.total) * 100)
})

let speedMinute = $ref(0)
let timer = $ref(0)
onMounted(() => {
  timer = setInterval(() => {
    speedMinute = Math.floor((Date.now() - statisticsStore.startDate) / 1000 / 60)
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})

</script>

<template>
  <div class="footer" :class="!settingStore.showToolbar && 'hide'">
    <Tooltip :title="settingStore.showToolbar?'收起':'展开'">
      <Icon icon="icon-park-outline:down"
            @click="settingStore.showToolbar = !settingStore.showToolbar"
            class="arrow"
            :class="!settingStore.showToolbar && 'down'"
            width="24"
            color="#999"/>
    </Tooltip>

    <div class="bottom">
      <el-progress
          :percentage="progress"
          :stroke-width="8"
          :show-text="false"/>
      <div class="flex justify-between items-center">
        <div class="stat gap-6">
          <div class="row">
            <div class="num">{{ speedMinute }}分钟</div>
            <div class="line"></div>
            <div class="name">时间</div>
          </div>
          <div class="row">
            <div class="num">{{ statisticsStore.total }}</div>
            <div class="line"></div>
            <div class="name">单词总数</div>
          </div>
          <div class="row">
            <div class="num">{{ format(statisticsStore.inputWordNumber, '', 0) }}</div>
            <div class="line"></div>
            <div class="name">输入数</div>
          </div>
          <div class="row">
            <div class="num">{{ format(statisticsStore.wrong, '', 0) }}</div>
            <div class="line"></div>
            <div class="name">错误数</div>
          </div>
          <div class="row">
            <div class="num">{{ format(statisticsStore.correctRate, '%') }}</div>
            <div class="line"></div>
            <div class="name">正确率</div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center">
          <div class="flex">
            <BaseIcon
                v-if="!isSimple"
                class="collect"
                @click="$emit('toggleSimple')"
                :title="`标记为简单词(${settingStore.shortcutKeyMap[ShortcutKey.ToggleSimple]})`"
                icon="material-symbols:check-circle-outline-rounded"/>
            <BaseIcon
                v-else
                class="fill"
                @click="$emit('toggleSimple')"
                :title="`取消标记简单词(${settingStore.shortcutKeyMap[ShortcutKey.ToggleSimple]})`"
                icon="material-symbols:check-circle-rounded"/>

            <BaseIcon
                v-if="!isCollect"
                class="collect"
                @click="$emit('toggleCollect')"
                :title="`收藏(${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
                icon="ph:star"/>
            <BaseIcon
                v-else
                class="fill"
                @click="$emit('toggleCollect')"
                :title="`取消收藏(${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
                icon="ph:star-fill"/>

            <Tooltip
                :title="`跳过(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
            >
              <IconWrapper>
                <Icon icon="icon-park-outline:go-ahead" class="menu"
                      @click="emit('skip')"/>
              </IconWrapper>
            </Tooltip>
          </div>

          <div class="flex">
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
      </div>
    </div>
    <div class="progress">
      <el-progress :percentage="progress"
                   :stroke-width="8"
                   :show-text="false"/>
    </div>
  </div>
</template>

<style scoped lang="scss">


.footer {
  flex-shrink: 0;
  width: var(--toolbar-width);
  margin-bottom: .8rem;
  transition: all var(--anim-time);
  position: relative;
  margin-top: 1rem;

  &.hide {
    margin-bottom: -6rem;
    margin-top: 3rem;

    .progress {
      bottom: calc(100% + 1.8rem);
    }
  }

  .bottom {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border-radius: .6rem;
    background: var(--color-second-bg);
    padding: .2rem var(--space) .4rem var(--space);
    z-index: 2;
    border: 1px solid var(--color-item-border);
    box-shadow: var(--shadow);

    .stat {
      margin-top: .5rem;
      display: flex;
      justify-content: space-around;

      .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
        width: 5rem;
        color: gray;

        .line {
          height: 1px;
          width: 100%;
          background: var(--color-sub-gray);
        }
      }
    }
  }

  .progress {
    width: 100%;
    transition: all .3s;
    padding: 0 .6rem;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
  }

  :deep(.el-progress-bar__inner) {
    background: var(--color-scrollbar);
  }

  .arrow {
    position: absolute;
    top: -50%;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: rotate(0);
    padding: .5rem;

    &.down {
      top: -90%;
      transform: rotate(180deg);
    }
  }

}
</style>
