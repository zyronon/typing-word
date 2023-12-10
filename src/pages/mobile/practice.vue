<script setup lang="ts">

import {useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {$computed, $ref} from "vue/macros";
import {ShortcutKey, Sort, Word} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {syncMyDictList, useWordOptions} from "@/hooks/dict.ts";
import {onMounted, onUnmounted, watch} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import Options from "@/pages/practice/Options.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import MobilePanel from "@/pages/mobile/components/MobilePanel.vue";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import WordList from "@/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let wordData = $ref({
  words: [],
  index: -1,
  wrongWords: [],
})

const word: Word = $computed(() => {
  return wordData.words[wordData.index] ?? {
    trans: [],
    name: '',
    usphone: '',
    ukphone: '',
  }
})

function getCurrentPractice() {
  if (store.chapter.length) {
    wordData.words = store.chapter
    wordData.index = 0

    store.chapter.map((w: Word) => {
      if (!w.trans.length) {
        let res = runtimeStore.translateWordList.find(a => a.name === w.name)
        if (res) w = Object.assign(w, res)
      }
    })

    wordData.words = cloneDeep(store.chapter)
    emitter.emit(EventKey.resetWord)
  }
}

function sort(list: Word[]) {
  store.currentDict.chapterWords[store.currentDict.chapterIndex] = wordData.words = list
  wordData.index = 0
  syncMyDictList(store.currentDict)
}

function next() {
  if (store.currentDict.chapterIndex >= store.currentDict.chapterWords.length - 1) {
    store.currentDict.chapterIndex = 0
  } else store.currentDict.chapterIndex++

  getCurrentPractice()
}

watch(() => store.load, n => {
  getCurrentPractice()
})

onMounted(() => {
  getCurrentPractice()
})

onUnmounted(() => {
})
const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple,
  toggleWordSimpleWrapper
} = useWordOptions()

let showSortOption = $ref(false)
</script>

<template>
  <div id="mobile">
    <div class="slide">
      <div class="slide-list" :class="{showPanel:settingStore.showPanel}">
        <div class="practice" @click.stop="settingStore.showPanel = false">
          <div class="tool-bar">
            <BaseIcon
                v-if="!isWordCollect(word)"
                class="collect"
                @click="toggleWordCollect(word)"
                icon="ph:star"/>
            <BaseIcon
                v-else
                class="fill"
                @click="toggleWordCollect(word)"
                icon="ph:star-fill"/>

            <BaseIcon
                @click="settingStore.showPanel = !settingStore.showPanel"
                icon="tdesign:menu-unfold"/>
          </div>
          <div class="word-content">
            <div class="translate">
              <div class="translate-item" v-for="(v,i) in word.trans">
                <span>{{ v }}</span>
              </div>
            </div>
            <div class="word">
              {{ word.name }}
            </div>
            <div class="phonetic" v-if="settingStore.wordSoundType === 'us' && word.usphone">[{{ word.usphone }}]</div>
            <div class="phonetic" v-if="settingStore.wordSoundType === 'uk' && word.ukphone">[{{ word.ukphone }}]</div>
          </div>
          <div class="options">
            <div class="wrapper">
              <BaseButton>不认识</BaseButton>
              <BaseButton @click="wordData.index++">认识</BaseButton>
            </div>
          </div>
        </div>
        <div class="list">
          <MobilePanel>
            <template v-slot="{active}">
              <div class="panel-page-item"
                   v-loading="!store.load"
              >
                <div class="list-header">
                  <div class="left">
                    <div class="title">
                      {{ store.chapterName }}
                    </div>
                    <BaseIcon title="切换词典"
                              @click="emitter.emit(EventKey.openDictModal,'list')"
                              icon="carbon:change-catalog"/>
                    <div style="position:relative;"
                         @click.stop="null">
                      <BaseIcon
                          title="改变顺序"
                          icon="icon-park-outline:sort-two"
                          @click="showSortOption = !showSortOption"
                      />
                      <MiniDialog
                          v-model="showSortOption"
                          style="width: 130rem;"
                      >
                        <div class="mini-row-title">
                          列表循环设置
                        </div>
                        <div class="mini-row">
                          <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                          <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
                        </div>
                      </MiniDialog>
                    </div>
                    <BaseIcon icon="bi:arrow-right"
                              @click="next"
                              v-if="store.currentDict.chapterIndex < store.currentDict.chapterWords.length - 1"/>
                  </div>
                  <div class="right">
                    {{ wordData.words.length }}个单词
                  </div>
                </div>
                <WordList
                    v-if="wordData.words.length"
                    :is-active="active"
                    :static="false"
                    :show-word="!settingStore.dictation"
                    :show-translate="settingStore.translate"
                    :list="wordData.words"
                    :activeIndex="wordData.index"
                    @click="(val:any) => wordData.index = val.index"
                >
                  <template v-slot:suffix="{item,index}">
                    <BaseIcon
                        v-if="!isWordCollect(item)"
                        class="collect"
                        @click="toggleWordCollect(item)"
                        title="收藏" icon="ph:star"/>
                    <BaseIcon
                        v-else
                        class="fill"
                        @click="toggleWordCollect(item)"
                        title="取消收藏" icon="ph:star-fill"/>
                    <BaseIcon
                        v-if="!isWordSimple(item)"
                        class="easy"
                        @click="toggleWordSimple(item)"
                        title="标记为简单词"
                        icon="material-symbols:check-circle-outline-rounded"/>
                    <BaseIcon
                        v-else
                        class="fill"
                        @click="toggleWordSimple(item)"
                        title="取消标记简单词"
                        icon="material-symbols:check-circle-rounded"/>
                  </template>
                </WordList>
                <Empty v-else/>
              </div>
            </template>
          </MobilePanel>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#mobile {
  position: relative;
  z-index: 1;
  font-size: 14rem;
  color: black;
  width: 100%;
  height: 100%;

  $list-width: 75vw;

  .slide {
    width: 100%;
    height: 100%;

    .slide-list {
      width: calc(100vw + $list-width);
      height: 100%;
      display: flex;
      transition: all .5s;
    }
    .showPanel{
      transform: translateX(-$list-width);
    }
  }

  .practice {
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10rem;

    .tool-bar {
      height: 50rem;
      display: flex;
      padding: 0 10rem;
      align-items: center;
      justify-content: flex-end;
      gap: 10rem;
    }

    .word-content {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .translate {
        width: 80%;
        font-size: 18rem;

        .translate-item {
          display: flex;
          align-items: center;
          gap: 10rem;
        }
      }

      .word {
        font-size: 26rem;
      }

      .phonetic {
        font-size: 16rem;
      }
    }

    .options {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 20rem;

      .wrapper {
        width: 80%;
        display: flex;
        flex-direction: column;
        gap: 10rem;
      }

      .base-button {
        width: 100%;
      }
    }
  }

  .list {
    width: $list-width;
  }
}
</style>