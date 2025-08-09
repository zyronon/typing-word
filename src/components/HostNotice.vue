<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";
import {watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";

let settingStore = useSettingStore()
let show = $ref(false)

function toggleNotice() {
  show = false
}

watch(() => settingStore.load, (n) => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'redirect') {
    show = true
  }
})

</script>

<template>
  <transition name="right">
    <div class="HostNotice" v-if="show">
      <div class="notice">
        <div>检查到您是通过老域名 typing-word.ttentau.top 访问的本网站，特此弹窗提示！</div>
        <p>老域名已不再续费，7天后过期将无法访问，请更换为新域名 <span class="active"><a href="https://2study.top">2study.top</a></span>
          访问</p>
      </div>
      <div class="wrapper">
        <BaseButton size="large" @click="toggleNotice">关闭</BaseButton>
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

.HostNotice {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-second-bg);
  padding: 30rem;
  border-radius: 12rem;
  width: 500rem;
  color: var(--color-font-1);
  line-height: 1.5;
  border: 1px solid var(--color-item-border);
  box-shadow: var(--shadow);

  .notice {
    margin-top: 30rem;
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
        font-size: 16rem;
        align-items: center;
        gap: 10rem;

        .round {
          color: var(--color-font-1);
          border-radius: 50rem;
          padding: 10rem 10rem;
          padding-left: 20rem;
          gap: 30rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-main-bg);

          .href {
            font-size: 14rem;
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
        margin-top: 20rem;
        font-size: 16rem;

        span {
          margin-left: 10rem;
        }
      }
    }
  }

  .close-wrapper {
    right: var(--space);
    top: var(--space);
    position: absolute;
    font-size: 14rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: var(--color-font-1);
    gap: 10rem;
  }
}

</style>
