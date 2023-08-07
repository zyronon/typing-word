<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"
import {ArrowRight, MenuFold} from '@icon-park/vue-next'

import {$ref} from "vue/macros"
import DictList from "@/components/DictList.vue"
import ChapterList from "@/components/ChapterList.vue"
import {provide} from "vue"
import ChapterDetail from "@/components/ChapterDetail.vue"
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';

const store = useBaseStore()
const props = defineProps({
  modelValue: Boolean,
})

defineEmits(['update:modelValue'])


let step = $ref(0)
let tabIndex = $ref(0)

function next() {
  step++
}

function back() {
  step--
}

provide('next', next)
provide('back', back)

const onSwiper = (swiper) => {
  console.log(swiper);
};
const onSlideChange = () => {
  console.log('slide change');
};
</script>

<template>
  <div class="side" :class="modelValue&&'open'">
    <header>
      <div class="tabs">
        <div class="tab" :class="tabIndex===0&&'active'" @click="tabIndex = 0">单词表</div>
        <div class="tab" :class="tabIndex===1&&'active'" @click="tabIndex = 1">生词本</div>
        <div class="tab" :class="tabIndex===2&&'active'" @click="tabIndex = 2">已忽略</div>
      </div>
      <arrow-right class="close"
                   @click="$emit('update:modelValue', false)"
                   theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
    </header>
    <div class="side-content">
      <swiper
          :slides-per-view="3"
          :space-between="50"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
      >
        <swiper-slide>
          <DictList/>
        </swiper-slide>
        <swiper-slide>
          <WordList class="page" :word-list="store.newWords" :index="0"/>
        </swiper-slide>
        <swiper-slide>
          <WordList class="page" :word-list="store.skipWords" :index="0"/>
        </swiper-slide>
      </swiper>
    </div>

    <!--    <div class="wrapper">-->
    <!--      <div class="pages" v-if="tabIndex === 0" :class="`step${step}`">-->
    <!--        <DictList/>-->
    <!--        <ChapterList/>-->
    <!--        <ChapterDetail/>-->
    <!--      </div>-->
    <!--      <WordList class="page" v-if="tabIndex === 1" :word-list="store.newWords" :index="0"></WordList>-->
    <!--      <WordList v-if="tabIndex === 2" :word-list="store.skipWords" :index="0"></WordList>-->
    <!--    </div>-->
  </div>
  <menu-fold v-if="!modelValue" class="menu" @click="$emit('update:modelValue', true)"
             theme="outline" size="20" fill="#929596"
             :strokeWidth="2"/>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

.side {
  $width: 20vw;
  background: $dark-bg2;
  width: $width;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  margin-right: -$width;

  &.open {
    margin-right: 0;
  }

  header {
    position: relative;
    display: flex;
    align-items: center;

    .tabs {
      padding: 10rem 20rem;
      width: 100%;
      display: flex;
      align-items: flex-end;
      border-bottom: 1px solid #e1e1e1;
      gap: 15rem;
      font-size: 14rem;
      color: gray;

      .tab {
        cursor: pointer;

        &.active {
          font-size: 16rem;
          color: rgb(36, 127, 255);
          font-weight: bold;
        }
      }
    }

    .close {
      cursor: pointer;
      position: absolute;
      right: 20rem;
    }
  }

  .side-content {
    //flex: 1;

    .swiper {
      width: 100%;
      height: 100%;
    }
  }

  .wrapper {
    flex: 1;
    overflow: hidden;

    .pages {
      width: 20vw * 3;
      height: 100%;
      display: flex;
      transition: all .3s;

      &.step0 {
        transform: translate3d(0, 0, 0);
      }

      &.step1 {
        transform: translate3d(-20vw, 0, 0);
      }

      &.step2 {
        transform: translate3d(-40vw, 0, 0);
      }
    }
  }
}


.menu {
  position: fixed;
  right: 20rem;
  top: 20rem;
}


.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>