<script setup lang="ts">

import {Icon} from "@iconify/vue";
import IconWrapper from "@/components/IconWrapper.vue";
import useTheme from "@/hooks/theme.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {$ref} from "vue/macros";
import SlideItem from "@/components/slide/SlideItem.vue";
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/components/list/WordList.vue";
import {useRouter} from "vue-router";
import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

const {toggleTheme} = useTheme()
const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
let index = $ref(0)
let isShowStarCount = $ref(false)

function $nav() {
}

function $no() {
}
</script>

<template>
  <div class="page my">
    <div ref="float" class="float">
      <div class="right">
        <IconWrapper>
          <Icon icon="fluent:search-24-regular"/>
        </IconWrapper>
        <IconWrapper>
          <Icon icon="ep:moon"
                v-if="settingStore.theme === 'dark'"
                @click="toggleTheme"/>
          <Icon icon="tabler:sun" v-else @click="toggleTheme"/>
        </IconWrapper>
      </div>
    </div>
    <div ref="desc" class="desc">
      <header ref="header"></header>
      <div class="detail">
        <div class="heat">
          <div class="text" @click="isShowStarCount = true">
            <span>收藏</span>
            <span class="num">123</span>
          </div>
          <div class="text" @click="$nav('/people/follow-and-fans',{type:0})">
            <span>错误</span>
            <span class="num">123</span>
          </div>
          <div class="text" @click="$nav('/people/follow-and-fans',{type:1})">
            <span>已掌握</span>
            <span class="num">123</span>
          </div>
        </div>
        <div class="description">
          <span>您已坚持了164天，加油！</span>
        </div>
        <div class="grid">
          <div class="item" @click="router.push('/mobile/data-manage')">
            <img src="@/assets/img/collect.png" alt="">
            <span>收藏</span>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <img src="@/assets/img/book2.png" alt="">
            <span>错词本</span>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <img src="@/assets/img/complete.png" alt="">
            <span>简单词</span>
          </div>
        </div>
        <div class="setting-list">
          <div class="item" @click="router.push('/mobile/setting')">
            <Icon icon="uil:setting" width="22"/>
            <div class="right">
              <span>设置</span>
              <Icon class="arrow" icon="mingcute:right-line" width="20"/>
            </div>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <Icon icon="mdi:database-cog-outline" width="22"/>
            <div class="right">
              <span>数据同步</span>
              <Icon class="arrow" icon="mingcute:right-line" width="20"/>
            </div>
          </div>
          <div class="item">
            <Icon icon="pepicons-pencil:letter-open" width="22"/>
            <div class="right">
              <span>反馈问题</span>
              <Icon class="arrow" icon="mingcute:right-line" width="20"/>
            </div>
          </div>
          <div class="item">
            <Icon icon="mdi:about-circle-outline" width="22"/>
            <div class="right" style="border-bottom: none">
              <span>关于我们</span>
              <Icon class="arrow" icon="mingcute:right-line" width="20"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "common.scss";


.my {
  font-size: 18rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-font-2);
  background: var(--color-second-bg);

  .float {
    position: fixed;
    box-sizing: border-box;
    width: 100vw;
    z-index: 2;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 46rem;
    padding: 0 15rem;
    background: transparent;
    transition: all .2s;

    .right {
    }
  }

  .desc {
    width: 100%;

    header {
      color: white;
      height: 200rem;
      background-image: url('../../assets/img/a.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-sizing: border-box;
    }

    .detail {
      transform: translateY(-50rem);
      //padding: 20rem;
      background: var(--color-second-bg);
      padding-top: 30rem;
      border-radius: 20rem 20rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 20rem;
      padding: 20rem;

      .heat {
        display: flex;
        align-items: center;
        font-size: 16rem;
        gap: 30rem;

        .num {
          font-weight: bold;
        }

        .text {
          display: flex;
          align-items: center;
          gap: 10rem;
        }
      }

      .description {
        font-size: 16rem;
      }

      .grid {
        display: flex;
        justify-content: space-between;
        padding: 20rem;
        background: var(--color-header-bg);
        border-radius: 8rem;

        .item {
          height: 60rem;
          gap: 10rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          img {
            width: 40rem;
          }
        }
      }

    }
  }
}
</style>