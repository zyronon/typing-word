<!--<script setup lang="ts">-->

<!--import {Icon} from "@iconify/vue";-->
<!--import IconWrapper from "@/components/IconWrapper.vue";-->
<!--import useTheme from "@/hooks/theme.ts";-->
<!--import {useSettingStore} from "@/stores/setting.ts";-->
<!---->
<!--import SlideItem from "@/components/slide/SlideItem.vue";-->
<!--import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";-->
<!--import BaseIcon from "@/components/BaseIcon.vue";-->
<!--import WordList from "@/components/list/WordList.vue";-->
<!--import {useRouter} from "vue-router";-->
<!--import {useBaseStore} from "@/stores/base.ts";-->
<!--import {useRuntimeStore} from "@/stores/runtime.ts";-->

<!--const {toggleTheme} = useTheme()-->
<!--const router = useRouter()-->
<!--const store = useBaseStore()-->
<!--const runtimeStore = useRuntimeStore()-->
<!--const settingStore = useSettingStore()-->
<!--let index = $ref(0)-->
<!--let isShowStarCount = $ref(false)-->

<!--function $nav() {-->
<!--}-->

<!--function $no() {-->
<!--}-->
<!--</script>-->

<!--<template>-->
<!--  <div class="page setting">-->
<!--    <div ref="float" class="float">-->
<!--      <div class="right">-->
<!--        <IconWrapper>-->
<!--          <Icon icon="fluent:search-24-regular"/>-->
<!--        </IconWrapper>-->
<!--        <IconWrapper>-->
<!--          <Icon icon="ep:moon"-->
<!--                v-if="settingStore.theme === 'dark'"-->
<!--                @click="toggleTheme"/>-->
<!--          <Icon icon="tabler:sun" v-else @click="toggleTheme"/>-->
<!--        </IconWrapper>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div ref="desc" class="desc">-->
<!--      <header ref="header"></header>-->
<!--      <div class="detail">-->
<!--        <div class="heat">-->
<!--          <div class="text" @click="isShowStarCount = true">-->
<!--            <span>收藏</span>-->
<!--            <span class="num">123</span>-->
<!--          </div>-->
<!--          <div class="text" @click="$nav('/people/follow-and-fans',{type:0})">-->
<!--            <span>错误</span>-->
<!--            <span class="num">123</span>-->
<!--          </div>-->
<!--          <div class="text" @click="$nav('/people/follow-and-fans',{type:1})">-->
<!--            <span>已掌握</span>-->
<!--            <span class="num">123</span>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="description">-->
<!--          <span>您已坚持了164天，加油！</span>-->
<!--        </div>-->
<!--        <div class="my-buttons">-->
<!--          <div class="button" @click="router.push('/mobile/setting')">-->
<!--            <span>设置</span>-->
<!--          </div>-->
<!--          <div class="button" @click="router.push('/mobile/data-manage')">-->
<!--            <span>数据同步</span>-->
<!--            <div class="not-read"></div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="nav">-->
<!--      <div class="tabs">-->
<!--        <div class="tab" :class="index === 0 && 'active'" @click="index = 0">当前</div>-->
<!--        <div class="tab" :class="index === 1 && 'active'" @click="index = 1">收藏</div>-->
<!--        <div class="tab" :class="index === 2 && 'active'" @click="index = 2">错词本</div>-->
<!--        <div class="tab" :class="index === 3 && 'active'" @click="index = 3">已掌握</div>-->
<!--      </div>-->
<!--      <div class="indicator" :style="{left:index * 25 + '%'}"></div>-->
<!--    </div>-->
<!--    <SlideHorizontal-->
<!--        v-model:index="index">-->
<!--      <SlideItem>-->
<!--      </SlideItem>-->
<!--      <SlideItem>-->
<!--        <div class="panel-page-item">-->
<!--          <div class="list-header">-->
<!--            <div class="left">-->
<!--              <div class="dict-name">总词数：{{ store.collect.words.length }}</div>-->
<!--              <BaseIcon icon="fluent:add-12-regular" title="添加" @click="addCollect"/>-->
<!--            </div>-->
<!--          </div>-->
<!--          <WordList-->
<!--              v-if="store.collect.words.length"-->
<!--              class="word-list"-->
<!--              :list="store.collect.words">-->
<!--            <template v-slot:suffix="{item,index}">-->
<!--              <BaseIcon-->
<!--                  class="del"-->
<!--                  title="移除"-->
<!--                  icon="solar:trash-bin-minimalistic-linear"/>-->
<!--            </template>-->
<!--          </WordList>-->
<!--        </div>-->
<!--      </SlideItem>-->
<!--      <SlideItem>4</SlideItem>-->
<!--      <SlideItem>4</SlideItem>-->
<!--    </SlideHorizontal>-->
<!--  </div>-->
<!--</template>-->

<!--<style scoped lang="scss">-->
<!--$main-bg: rgb(21, 23, 36);-->
<!--$second-btn-color: rgb(58, 58, 70);-->

<!--.setting {-->
<!--  font-size: 18rem;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: center;-->
<!--  background: $main-bg;-->

<!--  .float {-->
<!--    position: fixed;-->
<!--    box-sizing: border-box;-->
<!--    width: 100vw;-->
<!--    z-index: 2;-->
<!--    display: flex;-->
<!--    justify-content: flex-end;-->
<!--    align-items: center;-->
<!--    height: 46rem;-->
<!--    padding: 0 15rem;-->
<!--    background: transparent;-->
<!--    transition: all .2s;-->

<!--    .right {-->
<!--    }-->
<!--  }-->

<!--  .desc {-->
<!--    width: 100%;-->

<!--    header {-->
<!--      color: white;-->
<!--      height: 200rem;-->
<!--      background-image: url('../../assets/img/a.jpg');-->
<!--      background-size: cover;-->
<!--      background-position: center;-->
<!--      background-repeat: no-repeat;-->
<!--      box-sizing: border-box;-->
<!--    }-->

<!--    //消息页面-->
<!--    $msg-bg: rgb(22, 22, 22);-->
<!--    $msg-subpage-card-bg: rgb(28, 30, 43); //二级页面，卡片背景-->

<!--    .detail {-->
<!--      transform: translateY(-10rem);-->
<!--      background: $main-bg;-->
<!--      padding: 20rem;-->
<!--      padding-bottom: 0;-->
<!--      border-radius: 10rem 10rem 0 0;-->
<!--      display: flex;-->
<!--      flex-direction: column;-->
<!--      gap: 20rem;-->

<!--      .heat {-->
<!--        color: white;-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        font-size: 16rem;-->
<!--        gap: 30rem;-->

<!--        .num {-->
<!--          color: white;-->
<!--          font-weight: bold;-->
<!--        }-->

<!--        .text {-->
<!--          display: flex;-->
<!--          align-items: center;-->
<!--          gap: 10rem;-->
<!--        }-->
<!--      }-->

<!--      .description {-->
<!--        font-size: 16rem;-->
<!--        color: white;-->
<!--      }-->

<!--      .my-buttons {-->
<!--        display: flex;-->
<!--        gap: 20rem;-->
<!--        justify-content: space-between;-->

<!--        .button {-->
<!--          position: relative;-->
<!--          flex: 1;-->
<!--          font-size: 16rem;-->
<!--          display: flex;-->
<!--          align-items: center;-->
<!--          justify-content: center;-->
<!--          border-radius: 6rem;-->
<!--          background: $second-btn-color;-->
<!--          height: 40rem;-->
<!--          color: white;-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->

<!--  .nav {-->
<!--    font-size: 16rem;-->
<!--    width: 100%;-->
<!--    height: 50rem;-->
<!--    top: 0;-->
<!--    left: 0;-->
<!--    right: 0;-->
<!--    z-index: 1;-->
<!--    background: $main-bg;-->

<!--    .tabs {-->
<!--      width: 100%;-->
<!--      display: flex;-->
<!--      justify-content: space-between;-->

<!--      .tab {-->
<!--        height: 45rem;-->
<!--        width: 45%;-->
<!--        display: flex;-->
<!--        justify-content: center;-->
<!--        align-items: center;-->
<!--        color: gray;-->
<!--        transition: color .3s;-->

<!--        &.active {-->
<!--          font-weight: bold;-->
<!--          color: white;-->
<!--        }-->
<!--      }-->
<!--    }-->

<!--    .indicator {-->
<!--      height: 2px;-->
<!--      background: gold;-->
<!--      width: 25%;-->
<!--      position: relative;-->
<!--      transition: all .3s;-->
<!--      //left: 50%;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
