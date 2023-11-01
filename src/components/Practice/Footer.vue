<script setup lang="ts">

import {$computed, $ref} from "vue/macros"
import {onMounted, onUnmounted} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import Tooltip from "@/components/Tooltip.vue"
import {usePracticeStore} from "@/stores/practice.ts";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/stores/setting.ts";

const practiceStore = usePracticeStore()
const settingStore = useSettingStore()
const store = useBaseStore()

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
  <div class="footer" :class="!settingStore.showToolbar && 'hide'">
    <div class="bottom">
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
  margin-bottom: 10rem;
  transition: all .3s;
  position: relative;
  margin-top: 15rem;

  &.hide {
    margin-bottom: -90rem;
    margin-top: 50rem;

    .progress {
      bottom: calc(100% + 20rem);
    }
  }

  .bottom {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10rem;
    background: var(--color-second-bg);
    padding: 3rem 10rem 10rem 10rem;
    z-index: 2;
    border: 1px solid var(--color-item-border);

    .stat {
      margin-top: 10rem;
      display: flex;
      justify-content: space-around;

      .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10rem;
        width: 80rem;

        .line {
          height: 1px;
          width: 100%;
          background: gainsboro;
        }
      }
    }
  }

  .progress {
    width: 100%;
    transition: all .3s;
    padding: 0 10rem;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
  }
}
</style>