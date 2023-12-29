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
  <div class="page setting">
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
            <Icon icon="uil:setting" width="22"/>
            <span>收藏</span>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <Icon icon="uil:setting" width="22"/>
            <span>错词本</span>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <Icon icon="uil:setting" width="22"/>
            <span>简单词</span>
          </div>
        </div>
        <div class="list">
          <div class="item" @click="router.push('/mobile/setting')">
            <div class="left">
              <Icon icon="uil:setting" width="22"/>
              <span>设置</span>
            </div>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>

          <div class="item" @click="router.push('/mobile/data-manage')">
            <div class="left">
              <Icon icon="uil:setting" width="22"/>
              <span>数据同步</span>
            </div>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>
          <div class="item" @click="router.push('/mobile/data-manage')">
            <div class="left">
              <Icon icon="uil:setting" width="22"/>
              <span>反馈问题</span>
            </div>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>
          <div class="item">
            <div class="left">
              <Icon icon="mdi:about-circle-outline" width="22"/>
              <span>关于我们</span>
            </div>
            <Icon class="arrow" icon="mingcute:right-line" width="20"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$main-bg: rgb(21, 23, 36);
$second-btn-color: rgb(58, 58, 70);

.setting {
  font-size: 18rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $main-bg;

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
      background-image: url('../../assets/img/b.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-sizing: border-box;
    }

    //消息页面
    $msg-bg: rgb(22, 22, 22);
    $msg-subpage-card-bg: rgb(28, 30, 43); //二级页面，卡片背景

    .detail {
      transform: translateY(-50rem);
      background: $main-bg;
      //padding: 20rem;
      padding-top: 30rem;
      border-radius: 20rem 20rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 20rem;

      .heat {
        padding:0 20rem;
        color: white;
        display: flex;
        align-items: center;
        font-size: 16rem;
        gap: 30rem;

        .num {
          color: white;
          font-weight: bold;
        }

        .text {
          display: flex;
          align-items: center;
          gap: 10rem;
        }
      }

      .description {
        padding:0 20rem;
        font-size: 16rem;
        color: white;
      }

      .grid {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid gray;
        padding: 20rem;

        .item {
          height: 60rem;
          gap: 10rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
        }
      }

      .list {
        padding: 20rem;
        padding-top: 0;

        .item {
          margin-bottom: 10rem;
          position: relative;
          flex: 1;
          font-size: 16rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 6rem;
          //background: $second-btn-color;
          height: 50rem;
          color: white;

          .left {
            display: flex;
            align-items: center;
            gap: 10rem;
          }
        }
      }
    }
  }

  .nav {
    font-size: 16rem;
    width: 100%;
    height: 50rem;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    background: $main-bg;

    .tabs {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .tab {
        height: 45rem;
        width: 45%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: gray;
        transition: color .3s;

        &.active {
          font-weight: bold;
          color: white;
        }
      }
    }

    .indicator {
      height: 2px;
      background: gold;
      width: 25%;
      position: relative;
      transition: all .3s;
      //left: 50%;
    }
  }
}
</style>