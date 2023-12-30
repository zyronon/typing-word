<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";
import router from "@/router.ts";
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from "@iconify/vue";
import {APP_NAME} from "../../utils/const.ts";

const store = useBaseStore()

function goPractice() {
  router.push('/mobile/practice')
}
</script>

<template>
  <div class="page home">
    <div class="header">
      <div class="welcome">
        我在{{ APP_NAME }}学习
      </div>
      <div class="day">
        <div class="num">151</div>
        天
      </div>
    </div>
    <div class="current-dict">
      <div class="top">
        <div class="left" @click="router.push('/mobile/dict-detail')">
          <div class="name">{{ store.currentDict.name }}</div>
          <Icon class="arrow" icon="mingcute:right-line" width="20"/>
        </div>
        <span>词表</span>
      </div>
      <el-progress
          :percentage="90"
      />
    </div>
    <div class="btn">
      <BaseButton size="large" @click="goPractice">开始背单词吧！</BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  font-size: 18rem;
  color: var(--color-font-2);
  display: flex;
  flex-direction: column;
  //align-items: center;
  //justify-content: center;

  .header {
    margin-top: 30rem;
    padding: 20rem;

    .day {
      margin-top: 20rem;
      display: flex;
      align-items: flex-end;

      .num {
        font-size: 60rem;
        transform: translateY(10rem);
      }
    }
  }

  .current-dict {
    margin: 20rem;
    padding: 20rem;
    background: var(--color-third-bg);
    border-radius: 8rem;

    .top {
      display: flex;
      gap: 20rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rem;

      .left {
        display: flex;
        align-items: center;
        gap: 4rem;
      }


      span {
        font-size: 14rem;
      }
    }
  }

  .btn {
    margin: 20rem;
  }
}
</style>