<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"
import {ArrowLeft, ArrowRight, MenuFold} from '@icon-park/vue-next'

import {$ref} from "vue/macros"
import {computed, provide} from "vue"
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import {Swiper as SwiperClass} from "swiper/types"
import {Dict, DictType} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"

const store = useBaseStore()
const swiperIns0: SwiperClass = $ref(null as any)
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

function slideTo(index: number) {
  swiperIns0.slideTo(tabIndex = index)
}


function changeDict(dict: Dict, i: number) {
  if (store.currentDictType.name !== dict.type) {
    store.currentDictType = {
      name: dict.type,
      dictUrl: dict.url
    }
  }
  store.currentDict.wordIndex = i
}

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
          <div class="page0">
            <header>
              <arrow-left theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
              <div class="dict-name">{{ store.dict.chapterIndex + 1 }}.</div>
            </header>
            <WordList
                class="word-list"
                @change="(e:number) => store.changeDict(store.dict,-1,e)"
                :isActive="store.sideIsOpen && tabIndex === 0"
                :list="store.dict.chapterList[store.dict.chapterIndex]??[]"
                :activeIndex="store.dict.wordIndex"/>
            <!--            <footer v-if="![DictType.custom,DictType.inner].includes(store.currentDictType.name)">-->
            <footer>
              <PopConfirm
                  :title="`确认花费 10 个铜币向  的这条回复发送感谢？`"
                  @confirm="store.changeDict(store.dict)"
              >
                <div class="my-button" >
                  切换
                </div>
              </PopConfirm>
            </footer>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="page0">
            <header>
              <div class="dict-name">总词数：{{ store.newWordDict.wordList.length }}</div>
            </header>
            <WordList
                class="word-list"
                @change="(e:number) => store.changeDict(store.newWordDict,-1,e)"
                :isActive="store.sideIsOpen && tabIndex === 1"
                :list="store.newWordDict.wordList"
                :activeIndex="store.newWordDict.wordIndex"/>
            <footer v-if="store.currentDictType.name !== DictType.newWordDict && store.newWordDict.wordList.length">
              <div class="my-button" @click="store.changeDict(store.newWordDict)">
                切换
              </div>
            </footer>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="page0">
            <header>
              <div class="dict-name">总词数：{{ store.skipWordDict.wordList.length }}</div>
            </header>
            <WordList
                class="word-list"
                @change="(e:number) => store.changeDict(store.skipWordDict,-1,e)"
                :isActive="store.sideIsOpen && tabIndex === 2"
                :list="store.skipWordDict.wordList"
                :activeIndex="store.skipWordDict.wordIndex"/>
            <footer v-if="store.currentDictType.name !== DictType.skipWordDict && store.skipWordDict.wordList.length">
              <div class="my-button" @click="store.changeDict(store.skipWordDict)">
                切换
              </div>
            </footer>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
  <menu-fold v-if="!store.sideIsOpen" class="menu" @click="store.sideIsOpen = true"
             theme="outline" size="20" fill="#929596"
             :strokeWidth="2"/>
</template>
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
  background: $dark-second-bg;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  margin-right: -$width;

  &.open {
    margin-right: 0;
  }

  $header-height: 40rem;

  & > header {
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
  }

  footer {
    padding-right: $space;
    height: 50rem;
    align-items: center;
  }

  .page0 {
    height: 100%;
    display: flex;
    flex-direction: column;

    header {
      padding: 0 $space;
      height: $header-height;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10rem;
      font-size: 18rem;
      color: white;
    }

    .word-list {
      flex: 1;
      padding-bottom: $space;
    }
  }

  .page1 {
    height: 100%;
    display: flex;
    flex-direction: column;

    header {
      padding: 0 $space;
      height: $header-height;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10rem;
      font-size: 18rem;
      color: white;
    }
  }
}

</style>
