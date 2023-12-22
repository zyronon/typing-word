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
          <Icon icon="fluent:search-24-regular"
          />
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
          <span>您已使用164天，加油！</span>
        </div>
        <div class="my-buttons">
          <div class="button" @click="router.push('/mobile/setting')">
            <span>设置</span>
          </div>
          <div class="button" @click="router.push('/mobile/data-manage')">
            <span>数据管理</span>
            <div class="not-read"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="nav">
      <div class="tabs">
        <div class="tab" :class="index === 0 && 'active'" @click="index = 0">当前</div>
        <div class="tab" :class="index === 1 && 'active'" @click="index = 1">收藏</div>
        <div class="tab" :class="index === 2 && 'active'" @click="index = 2">错词本</div>
        <div class="tab" :class="index === 3 && 'active'" @click="index = 3">简单词</div>
      </div>
      <div class="indicator" :style="{left:index * 25 + '%'}"></div>
    </div>
    <SlideHorizontal
        v-model:index="index">
      <SlideItem>

      </SlideItem>
      <SlideItem>
        <div class="panel-page-item">
          <div class="list-header">
            <div class="left">
              <div class="dict-name">总词数：{{ store.collect.words.length }}</div>
              <BaseIcon icon="fluent:add-12-regular" title="添加" @click="addCollect"/>
            </div>
          </div>
          <WordList
              v-if="store.collect.words.length"
              class="word-list"
              :list="store.collect.words">
            <template v-slot:suffix="{item,index}">
              <BaseIcon
                  class="del"
                  title="移除"
                  icon="solar:trash-bin-minimalistic-linear"/>
            </template>
          </WordList>
        </div>
      </SlideItem>
      <SlideItem>4</SlideItem>
      <SlideItem>4</SlideItem>
    </SlideHorizontal>
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
      height: 220rem;
      background-image: url('../../assets/img/header-bg.png');
      //background-image: url('data:image/jpeg;base64,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');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

      box-sizing: border-box;
    }

    //消息页面
    $msg-bg: rgb(22, 22, 22);
    $msg-subpage-card-bg: rgb(28, 30, 43); //二级页面，卡片背景


    .detail {
      transform: translateY(-10rem);
      background: $main-bg;
      padding: 0 20rem 0 20rem;
      border-radius: 10rem 10rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 20rem;

      .heat {
        color: white;
        margin-top: 10rem;
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
        font-size: 16rem;
        color: white;
      }

      .my-buttons {
        display: flex;
        gap: 20rem;
        justify-content: space-between;

        .button {
          position: relative;
          flex: 1;
          font-size: 16rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6rem;
          background: $second-btn-color;
          height: 40rem;
          color: white;
        }
      }
    }
  }

  .nav {
    font-size: 18rem;
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
      font-weight: bold;

      .tab {
        height: 45rem;
        width: 45%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: gray;
        transition: color .3s;

        &.active {
          color: white;
        }

        img {
          margin-left: 5rem;
          $width: 12rem;
          width: $width;
          height: $width;
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