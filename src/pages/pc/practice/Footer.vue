<script setup lang="ts">

import {$computed, $ref} from "vue/macros"
import {onMounted, onUnmounted} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {usePracticeStore} from "@/stores/practice.ts";
import {useSettingStore} from "@/stores/setting.ts";

const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

function format(val: number, suffix: string = '', check: number = -1) {
  return val === check ? '-' : (val + suffix)
}

const progress = $computed(() => {
  if (!practiceStore.total) return 0
  if (practiceStore.index > practiceStore.total) return 100
  return ((practiceStore.index / practiceStore.total) * 100)
})

let speedMinute = $ref(0)
let timer = $ref(0)
onMounted(() => {
  timer = setInterval(() => {
    speedMinute = Math.floor((Date.now() - practiceStore.startDate) / 1000 / 60)
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})

</script>

<template>
  <div class="footer " :class="!settingStore.showToolbar && 'hide'">
    <div class="bottom ">
      <el-progress
          :percentage="progress"
          :stroke-width="8"
          :show-text="false"/>
      <div class="stat">
        <div class="row">
          <div class="num">{{ speedMinute }}分钟</div>
          <div class="line"></div>
          <div class="name">时间</div>
        </div>
        <div class="row">
          <div class="num">{{ practiceStore.total }}</div>
          <div class="line"></div>
          <div class="name">单词总数</div>
        </div>
        <div class="row">
          <div class="num">{{ format(practiceStore.inputWordNumber, '', 0) }}</div>
          <div class="line"></div>
          <div class="name">输入数</div>
        </div>
        <div class="row">
          <div class="num">{{ format(practiceStore.wrongWordNumber, '', 0) }}</div>
          <div class="line"></div>
          <div class="name">错误数</div>
        </div>
        <div class="row">
          <div class="num">{{ format(practiceStore.correctRate, '%') }}</div>
          <div class="line"></div>
          <div class="name">正确率</div>
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
  width: var(--toolbar-width);
  margin-bottom: .8rem;
  transition: all var(--anim-time);
  position: relative;
  margin-top: 1rem;

  &.hide {
    margin-bottom: -7rem;
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

}
</style>