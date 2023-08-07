<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"
import {ArrowRight, MenuFold} from '@icon-park/vue-next'

import {$ref} from "vue/macros"
import DictList from "@/components/DictList.vue"
import ChapterList from "@/components/ChapterList.vue"
import {computed, onMounted, provide} from "vue"
import ChapterDetail from "@/components/ChapterDetail.vue"
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import {Swiper as SwiperClass} from "swiper/types"

const store = useBaseStore()

defineEmits(['update:modelValue'])
const swiperIns0: SwiperClass = $ref(null as any)
const swiperIns1: SwiperClass = $ref(null as any)

onMounted(() => {
})

let tabIndex = $ref(0)
let stepIndex = $ref(0)

function slideTo(index: number) {
  swiperIns0.slideTo(index)
  tabIndex = index
}


function next() {
  swiperIns1.slideNext()
}

function back() {
  swiperIns1.slidePrev()
}

provide('next', next)
provide('back', back)
provide('tabIndex', computed(() => tabIndex))
provide('stepIndex', computed(() => stepIndex))

</script>
<template>
  <div class="side" :class="store.sideIsOpen && 'open'">
    <header>
      <div class="tabs">
        <div class="tab" :class="tabIndex===0&&'active'" @click="slideTo(0)">单词表</div>
        <div class="tab" :class="tabIndex===1&&'active'" @click="slideTo(1)">生词本</div>
        <div class="tab" :class="tabIndex===2&&'active'" @click="slideTo(2)">已忽略</div>
      </div>
      <arrow-right class="close"
                   @click="store.sideIsOpen = false"
                   theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
    </header>
    <div class="side-content">
      <swiper @swiper="e=>swiperIns0 = e" class="mySwiper" :allow-touch-move="false">
        <swiper-slide>
          <swiper @swiper="e=>swiperIns1 = e"
                  @activeIndexChange="e=>stepIndex = e.activeIndex"
                  class="mySwiper" :allow-touch-move="false">
            <swiper-slide>
              <DictList/>
            </swiper-slide>
            <swiper-slide>
              <ChapterList/>
            </swiper-slide>
            <swiper-slide>
              <ChapterDetail/>
            </swiper-slide>
          </swiper>
        </swiper-slide>
        <swiper-slide>
          <WordList :active="store.sideIsOpen && tabIndex === 1" class="page" :word-list="store.newWords" :index="0"/>
        </swiper-slide>
        <swiper-slide>
          <WordList :active="store.sideIsOpen && tabIndex === 2" class="page" :word-list="store.skipWords" :index="0"/>
        </swiper-slide>
      </swiper>
    </div>
  </div>
  <menu-fold v-if="!store.sideIsOpen" class="menu" @click="store.sideIsOpen = true"
             theme="outline" size="20" fill="#929596"
             :strokeWidth="2"/>
</template>
<style>
.page {
  padding: 15rem;
}
</style>
<style scoped lang="scss">
@import "@/assets/css/colors";

.menu {
  position: fixed;
  right: 20rem;
  top: 20rem;
}

.side {
  $width: 20vw;
  width: $width;
  background: $dark-bg2;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  margin-right: -$width;

  &.open {
    margin-right: 0;
  }

  $header-height: 40rem;

  header {
    height: $header-height;
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
    height: calc(100% - $header-height);

    .mySwiper {
      height: 100%;
    }

    .swiper-slide {
      height: 100%;
      overflow: auto;
    }
  }
}

</style>
