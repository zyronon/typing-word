<script setup lang="ts">

import {onMounted, onUnmounted} from "vue"
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {Article, ArticleWord, ShortcutKey, Word} from "@/types.ts";
import {Icon} from "@iconify/vue";
import VolumeSetting from "@/pages/pc/components/toolbar/VolumeSetting.vue";
import TranslateSetting from "@/pages/pc/components/toolbar/TranslateSetting.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import {useArticleOptions} from "@/hooks/dict.ts";

const statisticsStore = usePracticeStore()
const settingStore = useSettingStore()

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

const emit = defineEmits<{
  ignore: [],
  wrong: [val: Word],
  nextWord: [val: ArticleWord],
  over: [],
  edit: [val: Article]
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
  <div class="footer " :class="!settingStore.showToolbar && 'hide'">
    <div class="bottom">
      <div class="flex gap-2">
        <el-progress
            class="flex-1"
            :percentage="progress"
            :stroke-width="8"
            :show-text="false"/>
      </div>
      <div class="flex justify-between">
       <div class="stat">
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
        <div class="flex gap-3 center">
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

          <BaseIcon
              :title="`编辑(${settingStore.shortcutKeyMap[ShortcutKey.EditArticle]})`"
              icon="tabler:edit"
              @click="emit('edit',)"
          />

          <BaseIcon
              v-if="!isArticleCollect()"
              class="collect"
              @click="toggleArticleCollect()"
              :title="`收藏(${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
              icon="ph:star"/>
          <BaseIcon
              v-else
              class="fill"
              @click="toggleArticleCollect()"
              :title="`取消收藏(${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`"
              icon="ph:star-fill"/>
          <BaseIcon
              :title="`下一句(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
              icon="icon-park-outline:go-ahead"
              @click="emit('over')"/>

          <BaseIcon
              @click="settingStore.showPanel = !settingStore.showPanel"
              :title="`面板(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
              icon="tdesign:menu-unfold"/>
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
@import "@/assets/css/variable";

.footer {
  width: var(--article-width);
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
      gap: 2rem;

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

}
</style>