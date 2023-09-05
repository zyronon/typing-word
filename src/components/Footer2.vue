<script setup lang="ts">

import {$computed, $ref} from "vue/macros"
import {onMounted, onUnmounted} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import Tooltip from "@/components/Tooltip.vue"
import {Down} from "@icon-park/vue-next"

interface IProps {
  total: number,
  startDate: number
  inputNumber: number
  wrongNumber: number
  correctRate: number
}

const props = withDefaults(defineProps<IProps>(), {
  total: 0,
  startDate: Date.now,
  inputNumber: 0,
  wrongNumber: 0,
  correctRate: 0,
})

const store = useBaseStore()

function format(val: number, suffix: string = '') {
  return val === 0 ? '-' : (val + suffix)
}

const progress = $computed(() => {
  if (!props.total) return 0
  return ((props.inputNumber / props.total) * 100)
})

let speedMinute = $ref(0)
let timer = $ref(0)
onMounted(() => {
  timer = setInterval(() => {
    speedMinute = Math.floor((Date.now() - props.startDate) / 1000 / 60)
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})

</script>

<template>
  <div class="footer" :class="!store.setting.showToolbar && 'hide'">
    <Tooltip :title="store.setting.showToolbar?'收起':'展开'">
      <Down
          @click="store.setting.showToolbar = !store.setting.showToolbar"
          class="arrow"
          :class="!store.setting.showToolbar && 'down'"
          theme="outline" size="24" fill="#999"/>
    </Tooltip>
    <div class="bottom">
      <el-progress :percentage="progress"
                   :stroke-width="8"
                   :show-text="false"/>
      <div class="stat">
        <div class="row">
          <div class="num">{{ speedMinute }}分钟</div>
          <div class="line"></div>
          <div class="name">时间</div>
        </div>
        <div class="row">
          <div class="num">{{ total }}</div>
          <div class="line"></div>
          <div class="name">单词总数</div>
        </div>
        <div class="row">
          <div class="num">{{ inputNumber }}</div>
          <div class="line"></div>
          <div class="name">输入数</div>
        </div>
        <div class="row">
          <div class="num">{{ format(props.wrongNumber) }}</div>
          <div class="line"></div>
          <div class="name">错误数</div>
        </div>
        <div class="row">
          <div class="num">{{ format(props.correctRate, '%') }}</div>
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
@import "@/assets/css/colors.scss";

.footer {
  width: 100%;
  margin-bottom: 30rem;
  transition: all .3s;
  position: relative;
  margin-top: 30rem;

  &.hide {
    margin-bottom: -90rem;
    margin-top: 65rem;

    .arrow {
      transform: translate3d(-50%, -220%, 0) rotate(180deg);
    }

    .progress {
      bottom: calc(100% + 30rem);
    }
  }

  .arrow {
    position: absolute;
    top: 0;
    left: 50%;
    cursor: pointer;
    transition: all .3s;
    transform: translate3d(-50%, -100%, 0) rotate(0);
    padding: 5rem;
  }

  .bottom {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10rem;
    background: var(--color-header-bg);
    padding: 2rem 10rem 10rem 10rem;
    z-index: 2;

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