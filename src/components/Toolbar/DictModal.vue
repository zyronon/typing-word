<script setup lang="ts">
import {childrenEnglish} from '@/assets/dictionary.ts'
import {ArrowLeft, ArrowRight, Close} from '@icon-park/vue-next'
import {useBaseStore} from "@/stores/base.ts"
import {watch} from "vue"
import {Dict, DictType, Sort, Word} from "@/types.ts"
import {chunk} from "lodash";
import {$computed, $ref} from "vue/macros";
import WordList from "@/components/WordList.vue";
import ChapterList from "@/components/ChapterList.vue"
import Modal from "@/components/Modal/Modal.vue";
import BaseButton from "@/components/BaseButton.vue";

const store = useBaseStore()

interface IProps {
  modelValue: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

const emit = defineEmits([
  'update:modelValue',
])

let currentSelectDict: Dict = $ref(store.currentDict)
let step = $ref(0)

const currentSelectChapter: Word[] = $computed(() => {
  return currentSelectDict.chapterList?.[currentSelectDict.chapterIndex] ?? []
})

watch(() => props.modelValue, (n: boolean) => {
  currentSelectDict = store.currentDict
})

async function selectDict(item: Dict) {
  currentSelectDict = {
    ...item,
    type: DictType.inner,
    sort: Sort.normal,
    wordList: [],
    chapterList: [],
    chapterIndex: 0,
    chapterWordNumber: 15,
    wordIndex: 0,
    dictStatistics: []
  }
  let r = await fetch(`/public/${item.url}`)
  r.json().then(v => {
    currentSelectDict.wordList = v
    currentSelectDict.chapterList = chunk(v, currentSelectDict.chapterWordNumber)
  })
}

function changeDict() {
  store.changeDict(currentSelectDict)
  close()
}

function close() {
  console.log('close')
  emit('update:modelValue', false)
}

function resetChapterList() {
  currentSelectDict.chapterList = chunk(currentSelectDict.wordList, currentSelectDict.chapterWordNumber)
}
</script>

<template>
  <Modal :modelValue="props.modelValue"
         @close="close">
    <div class="slide">
      <div  class="slide-list" :class="`step${step}`">
        <div  class="dict-page">
          <header>
            <div class="tabs">
              <div class="tab">
                <span>英语</span>
              </div>
              <div class="tab">
                <span>日语</span>
              </div>
              <div class="tab">
                <span>德语</span>
              </div>
            </div>
            <Close @click="close" theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
          </header>
          <div class="page-content">
            <div class="dict-list-wrapper">
              <div class="tags">
                <div class="tag" :class="i === 5 &&'active'" v-for="i in 2">六级</div>
              </div>
              <div class="dict-list">
                <div class="dict-item anim"
                     :class="currentSelectDict.name === i.name && 'active'" v-for="i in childrenEnglish"
                     @click="selectDict(i)"
                >
                  <div class="name">{{ i.name }}</div>
                  <div class="desc">{{ i.description }}</div>
                  <div class="num">{{ i.length }}词</div>

                  <arrow-right v-if="currentSelectDict.name === i.name"
                               @click.stop="step = 1"
                               class="go"
                               theme="outline" size="20" fill="#ffffff"
                               :strokeWidth="2"/>
                </div>
              </div>
            </div>
            <div class="chapter-wrapper">
              <div class="chapter-word-number">
                <span>每章单词数:</span>
                <el-slider :min="10"
                           :step="10"
                           :max="100"
                           v-model="currentSelectDict.chapterWordNumber"
                           @change="resetChapterList"
                />
                <span>{{ currentSelectDict.chapterWordNumber }}</span>
              </div>
              <ChapterList
                  class="chapter-list"
                  :list="currentSelectDict.chapterList"
                  v-model:active-index="currentSelectDict.chapterIndex"
              />
              <div class="footer">
                <BaseButton @click="changeDict">确定</BaseButton>
              </div>
            </div>
          </div>
        </div>
        <div  class="dict-detail-page">
          <header>
            <div class="left">
              <arrow-left
                  @click="step = 0"
                  class="go" theme="outline" size="20" fill="#ffffff"
                  :strokeWidth="2"/>
              <div class="title">
                词典详情
              </div>
            </div>
            <Close @click="close" theme="outline" size="20" fill="#929596"
                   :strokeWidth="2"/>
          </header>
          <div class="page-content">
            <div class="dict-info">
              <div class="dict-item">
                <div class="name">{{ currentSelectDict.name }}</div>
                <div class="desc">{{ currentSelectDict.description }}</div>
                <div class="num">{{ currentSelectDict.length }}词</div>
              </div>
            </div>
            <div class="chapter-wrapper">
              <ChapterList :list="currentSelectDict.chapterList"
                           v-model:active-index="currentSelectDict.chapterIndex"
              />
            </div>
            <div class="other">
              <WordList class="word-list" :list="currentSelectChapter" :activeIndex="-1" :isActive="false"/>
              <div class="footer">
                <BaseButton>返回</BaseButton>
                <BaseButton>确定</BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors";

$modal-mask-bg: rgba(#000, .15);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

.slide {
  width: 1100rem;
  height: 70vh;

  .slide-list {
    width: 200%;
    height: 100%;
    display: flex;
    transition: all .5s;
  }

  .step1 {
    transform: translate3d(-50%, 0, 0);
  }
}

.dict-item {
  cursor: pointer;
  padding: 10rem;
  border-radius: 10rem;
  position: relative;
  background: var(--color-item-bg);
  color: var(--color-font-1);
  font-size: 14rem;

  .name {
    font-size: 18rem;
  }

  .desc {
    color: var(--color-font-2);
  }

  .num {
    font-weight: bold;
  }

  .go {
    position: absolute;
    right: 10rem;
    bottom: 15rem;
  }

  &.active {
    background: var(--color-item-active);
    color: var(--color-font-active-1);

    .desc {
      color: var(--color-font-active-2);
    }
  }
}

$footer-height: 40rem;

.chapter-wrapper {
  min-width: 300rem;

  .chapter-word-number {
    padding-left: $space;
    display: flex;
    color: black;
    gap: 10rem;
    font-size: 14rem;
    word-break: keep-all;
    align-items: center;
  }

  .chapter-list {
    height: calc(100% - $footer-height);
  }
}

.footer {
  box-sizing: content-box;
  height: $footer-height;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: $space;
}

.dict-page {
  width: 50%;
  height: 100%;
  $header-height: 60rem;
  padding: $space;
  padding-top: 0;
  box-sizing: border-box;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: $header-height;

    .tabs {
      display: flex;
      gap: 20rem;

      .tab {
        color: var(--color-font-1);
        cursor: pointer;
        padding: 10rem;
        padding-bottom: 5rem;
        border-bottom: 2px solid $main;
      }
    }
  }

  .page-content {
    display: flex;
    height: calc(100% - $header-height);

    .dict-list-wrapper {
      flex: 1;
      overflow: auto;
      height: 100%;
      padding-right: $space;

      .tags {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10rem;

        .tag {
          color: var(--color-font-1);
          cursor: pointer;
          padding: 5rem 10rem;
          border-radius: 20rem;

          &.active {
            color: var(--color-font-active-1);
            background: gray;
          }
        }
      }

      .dict-list {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15rem;
      }
    }
  }
}

.dict-detail-page {
  width: 50%;
  height: 100%;
  $header-height: 60rem;
  padding: $space;
  padding-top: 0;
  box-sizing: border-box;

  header {
    width: 100%;
    display: flex;
    height: $header-height;
    align-items: center;
    justify-content: space-between;

    .left {
      display: flex;
      gap: 10rem;
      align-items: center;
    }
  }

  .page-content {
    display: flex;
    height: calc(100% - $header-height);
    position: relative;

    .dict-info {
      width: 20%;
    }

    .chapter-wrapper {
      width: 40%;

      .chapter-list {
        height: 100%;
      }
    }

    .other {
      flex: 1;
      height: 100%;

      .word-list {
        height: calc(100% - $footer-height);
      }
    }
  }
}
</style>