<script setup lang="ts">

import {Icon} from "@iconify/vue";
import Close from "@/components/icon/Close.vue";
import BaseButton from "@/components/BaseButton.vue";
import {watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";

import {isMobile} from "@/utils";

let settingStore = useSettingStore()
let showNotice = $ref(false)
let show = $ref(false)
let num = $ref(5)
let timer = -1
let mobile = $ref(isMobile())
const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

function toggleNotice() {
  showNotice = true
  settingStore.first = false
  timer = setInterval(() => {
    num--
    if (num <= 0) close()
  }, 1000)
}

function close() {
  clearInterval(timer)
  show = settingStore.first = false
}

watch(() => settingStore.load, (n) => {
  if (n && settingStore.first) {
    show = true
  }
})


</script>

<template>
  <transition name="right">
    <div class="CollectNotice"
         :class="{mobile}"
         v-if="show">
      <div class="notice">
        坚持练习，提高外语能力。将
        <span class="active">「Type Words」</span>
        保存为书签，永不迷失！
      </div>
      <div class="wrapper">
        <transition name="fade">
          <div class="collect" v-if="showNotice">
            <div class="href-wrapper">
              <div class="round">
                <div class="href">2study.top</div>
                <Icon
                    width="22"
                    icon="mdi:star-outline"/>
              </div>
              <div class="right">
                👈
                <Icon
                    class="star"
                    width="22"
                    icon="mdi:star"/>
                点亮它!
              </div>
            </div>
            <div class="collect-keyboard" v-if="!mobile">或使用收藏快捷键<span
                class="active">{{ isMac ? 'Command' : 'Ctrl' }} + D</span></div>
          </div>
          <BaseButton v-else size="large" @click="toggleNotice">我想收藏</BaseButton>
        </transition>
      </div>
      <div class="close-wrapper">
        <span v-show="showNotice"><span class="active">{{ num }}s</span> 后自动关闭</span>
        <Close @click="close" title="关闭"/>
      </div>
    </div>
  </transition>

</template>

<style scoped lang="scss">

.right-enter-active,
.right-leave-active {
  transition: all .5s ease;
}

.right-enter-from,
.right-leave-to {
  transform: translateX(110%);
}

.CollectNotice {
  position: fixed;
  right: var(--space);
  top: var(--space);
  z-index: 2;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-second-bg);
  padding: 1.8rem;
  border-radius: 0.7rem;
  width: 30rem;
  gap: 2.4rem;
  color: var(--color-font-1);
  line-height: 1.5;
  border: 1px solid var(--color-item-border);
  box-shadow: var(--shadow);
  box-sizing: border-box;

  &.mobile {
    width: 95%;
    padding: 0.6rem;
  }

  .notice {
    margin-top: 2.4rem;
  }

  .active {
    color: var(--color-main-active);
  }

  .wrapper {
    .collect {
      display: flex;
      flex-direction: column;
      align-items: center;

      .href-wrapper {
        display: flex;
        font-size: 1rem;
        align-items: center;
        gap: 0.6rem;

        .round {
          color: var(--color-font-1);
          border-radius: 3rem;
          padding: 0.6rem 0.6rem;
          padding-left: 1.2rem;
          gap: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-main-bg);

          .href {
            font-size: 0.9rem;
          }
        }

        .star {
          color: var(--color-main-active);
        }

        .right {
          display: flex;
          align-items: center;
        }
      }

      .collect-keyboard {
        margin-top: 1.2rem;
        font-size: 1rem;

        span {
          margin-left: 0.6rem;
        }
      }
    }
  }

  .close-wrapper {
    right: var(--space);
    top: var(--space);
    position: absolute;
    font-size: 0.9rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: var(--color-font-1);
    gap: 0.6rem;
  }
}

</style>
