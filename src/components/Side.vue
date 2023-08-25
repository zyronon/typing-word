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
import BaseButton from "@/components/BaseButton.vue";

const store = useBaseStore()
const swiperIns0: SwiperClass = $ref(null as any)
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

function slideTo(index: number) {
  swiperIns0.slideTo(tabIndex = index)
}

function changeDict(dict: Dict, i: number) {
  if (store.currentDictType !== dict.type) {
    store.currentDictType = dict.type
  }
  store.currentDict.wordIndex = i
}

</script>
<template>
  <Transition name="fade">
    <div class="side"  v-if="store.sideIsOpen">
      <header>
        <div class="tabs">
          <div class="tab" :class="tabIndex===0&&'active'" @click="slideTo(0)">单词表</div>
          <div class="tab" :class="tabIndex===1&&'active'" @click="slideTo(1)">生词本</div>
          <div class="tab" :class="tabIndex===2&&'active'" @click="slideTo(2)">纠错本</div>
          <div class="tab" :class="tabIndex===3&&'active'" @click="slideTo(3)">已忽略</div>
        </div>
      </header>
      <div class="side-content">
        <swiper @swiper="e=>swiperIns0 = e" class="mySwiper" :allow-touch-move="false">
          <swiper-slide>
            <div class="page0">
              <header>
                <div class="dict-name">{{ store.dict.chapterIndex + 1 }}.</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.dict,-1,e)"
                  :isActive="store.sideIsOpen && tabIndex === 0"
                  :list="store.dict.chapterList[store.dict.chapterIndex]??[]"
                  :activeIndex="store.dict.wordIndex"/>
              <footer v-if="![DictType.custom,DictType.inner].includes(store.currentDictType)">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.dict)"
                >
                  <div class="my-button">
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
              <footer v-if="store.currentDictType !== DictType.newWordDict && store.newWordDict.wordList.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.newWordDict)"
                >
                  <div class="my-button">
                    切换
                  </div>
                </PopConfirm>
              </footer>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="page0">
              <header>
                <a href="" target="_blank"></a>
                <div class="dict-name">总词数：{{ store.wrongDict.wordList.length }}</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.wrongDict,-1,e)"
                  :isActive="store.sideIsOpen && tabIndex === 2"
                  :list="store.wrongDict.wordList"
                  :activeIndex="store.wrongDict.wordIndex"/>
              <footer v-if="store.currentDictType !== DictType.wrongDict && store.wrongDict.wordList.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.wrongDict)"
                >
                  <BaseButton>
                    切换
                  </BaseButton>
                </PopConfirm>
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
                  :isActive="store.sideIsOpen && tabIndex === 3"
                  :list="store.skipWordDict.wordList"
                  :activeIndex="store.skipWordDict.wordIndex"/>
              <footer v-if="store.currentDictType !== DictType.skipWordDict && store.skipWordDict.wordList.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.skipWordDict)"
                >
                  <div class="my-button hvr-grow">
                    切换
                  </div>
                </PopConfirm>
              </footer>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </Transition>

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
  position: absolute;
  right: 0;
  width: $width;
  background: var(--color-second-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all .3s;
  //transform: rotate(-90deg);
  //transform-origin: 0 0;
  z-index: 1;

  $header-height: 40rem;

  & > header {
    height: $header-height;
    position: relative;
    display: flex;
    align-items: center;

    .tabs {
      padding: 10rem 20rem;
      justify-content: flex-end;
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
      justify-content: flex-end;
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
