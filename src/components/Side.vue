<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import WordList from "@/components/WordList.vue"

import {$ref} from "vue/macros"
import {computed, onMounted, provide} from "vue"
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import {Swiper as SwiperClass} from "swiper/types"
import {DictType} from "@/types.ts"
import PopConfirm from "@/components/PopConfirm.vue"
import BaseButton from "@/components/BaseButton.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts"

const store = useBaseStore()
const swiperIns0: SwiperClass = $ref(null as any)
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))

function slideTo(index: number) {
  swiperIns0.slideTo(tabIndex = index)
}

onMounted(() => {
  emitter.on(EventKey.openSide, () => {
    store.sideIsOpen = !store.sideIsOpen
    if (store.sideIsOpen) {
      switch (store.current.dictType) {
        case DictType.newDict:
          return tabIndex = 1;
        case DictType.skipDict:
          return tabIndex = 3;
        case DictType.wrongDict:
          return tabIndex = 2;
        case DictType.innerDict:
        case DictType.customDict:
          return tabIndex = 0;
      }
    }
  })
})


const newWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.newDict) return -1
  else {
    if (store.current.repeatNumber) {
      return store.chapter.findIndex(v => v.name === store.word.name)
    }
    return store.current.index
  }
})

const dictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.innerDict) return -1
  else {
    if (store.current.repeatNumber) {
      return store.chapter.findIndex(v => v.name === store.word.name)
    }
    return store.current.index
  }
})


const wrongWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.wrongDict) return -1
  else {
    if (store.current.repeatNumber) {
      return store.chapter.findIndex(v => v.name === store.word.name)
    }
    return store.current.index
  }
})


const skipWordDictActiveIndex = computed(() => {
  if (store.current.dictType !== DictType.skipDict) return -1
  else {
    if (store.current.repeatNumber) {
      return store.chapter.findIndex(v => v.name === store.word.name)
    }
    return store.current.index
  }
})

</script>
<template>
  <Transition name="fade">
    <div class="side" v-if="store.sideIsOpen">
      <header>
        <div class="tabs">
          <div class="tab" :class="tabIndex===0&&'active'" @click="slideTo(0)">{{ store.dict.name }}</div>
          <div class="tab" :class="tabIndex===1&&'active'" @click="slideTo(1)">{{ store.newWordDict.name }}</div>
          <div class="tab" :class="tabIndex===2&&'active'" @click="slideTo(2)">{{ store.wrongWordDict.name }}</div>
          <div class="tab" :class="tabIndex===3&&'active'" @click="slideTo(3)">{{ store.skipWordDict.name }}</div>
        </div>
      </header>
      <div class="side-content">
        <swiper :initial-slide="tabIndex" @swiper="e=>swiperIns0 = e" class="mySwiper" :allow-touch-move="false">
          <swiper-slide>
            <div class="page0">
              <header>
                <div class="dict-name">{{ store.dict.chapterIndex + 1 }}.</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.dict,store.dict.chapterIndex,e)"
                  :isActive="store.sideIsOpen && tabIndex === 0"
                  :list="store.dict.chapterWords[store.dict.chapterIndex]??[]"
                  :activeIndex="dictActiveIndex"/>
              <footer v-if="![DictType.customDict,DictType.innerDict].includes(store.current.dictType)">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.dict)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="page0">
              <header>
                <div class="dict-name">总词数：{{ store.newWordDict.originWords.length }}</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.newWordDict,store.newWordDict.chapterIndex,e)"
                  :isActive="store.sideIsOpen && tabIndex === 1"
                  :list="store.newWordDict.words"
                  :activeIndex="newWordDictActiveIndex"/>
              <footer v-if="store.current.dictType !== DictType.newDict && store.newWordDict.words.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.newWordDict)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="page0">
              <header>
                <a href="" target="_blank"></a>
                <div class="dict-name">总词数：{{ store.wrongWordDict.originWords.length }}</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.wrongWordDict,store.wrongWordDict.chapterIndex,e)"
                  :isActive="store.sideIsOpen && tabIndex === 2"
                  :list="store.wrongWordDict.words"
                  :activeIndex="wrongWordDictActiveIndex"/>
              <footer
                  v-if="store.current.dictType !== DictType.wrongDict && store.wrongWordDict.words.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.wrongWordDict)"
                >
                  <BaseButton>切换</BaseButton>
                </PopConfirm>
              </footer>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="page0">
              <header>
                <div class="dict-name">总词数：{{ store.skipWordDict.originWords.length }}</div>
              </header>
              <WordList
                  class="word-list"
                  @change="(e:number) => store.changeDict(store.skipWordDict,store.skipWordDict.chapterIndex,e)"
                  :isActive="store.sideIsOpen && tabIndex === 3"
                  :list="store.skipWordDict.words"
                  :activeIndex="skipWordDictActiveIndex"/>
              <footer v-if="store.current.dictType !== DictType.skipDict && store.skipWordDict.words.length">
                <PopConfirm
                    :title="`确认切换？`"
                    @confirm="store.changeDict(store.skipWordDict)"
                >
                  <BaseButton>切换</BaseButton>
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
  left: calc(100% + $space);
  width: $width;
  background: var(--color-second-bg);
  //background: white;
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
      color: black;
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
