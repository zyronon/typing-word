<script setup lang="ts">
import {childrenEnglish, dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {watch} from "vue"
import {Dict, Dictionary, DictType, Sort, Word} from "@/types.ts"
import {chunk} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import WordList from "@/components/WordList.vue";
import ChapterList from "@/components/ChapterList.vue"
import Modal from "@/components/Modal/Modal.vue";
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import codeFlag from '@/assets/img/flags/code.png'
import deFlag from '@/assets/img/flags/de.png'
import enFlag from '@/assets/img/flags/en.png'
import jpFlag from '@/assets/img/flags/ja.png'
import DictGroup from "@/components/Toolbar/DictGroup.vue";

const store = useBaseStore()

interface IProps {
  modelValue: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

const emit = defineEmits([
  'close',
])

let currentSelectDict: Dict = $ref(store.currentDict)
let step = $ref(0)

const currentSelectChapter: Word[] = $computed(() => {
  return currentSelectDict.chapterWords?.[currentSelectDict.chapterIndex] ?? []
})

watch(() => props.modelValue, (n: boolean) => {
  currentSelectDict = store.currentDict
})

async function selectDict(item: Dict) {
  currentSelectDict = {
    ...item,
    sort: Sort.normal,
    type: DictType.publicDict,
    originWords: [],
    words: [],
    chapterWordNumber: 15,
    chapterWords: [],
    chapterIndex: 0,
    chapterWordIndex: 0,
    statistics: []
  }
  let r = await fetch(`/public/${item.url}`)
  r.json().then(v => {
    currentSelectDict.originWords = v
    currentSelectDict.words = v
    currentSelectDict.chapterWords = chunk(v, currentSelectDict.chapterWordNumber)
  })
}

function changeDict() {
  store.changeDict(currentSelectDict)
  close()
}

function close() {
  console.log('close')
  emit('close')
}

function resetChapterList() {
  currentSelectDict.chapterWords = chunk(currentSelectDict.words, currentSelectDict.chapterWordNumber)
}

const options = [
  {id: 'en', name: '英语', flag: enFlag},
  {id: 'ja', name: '日语', flag: jpFlag},
  {id: 'de', name: '德语', flag: deFlag},
  {id: 'code', name: 'Code', flag: codeFlag},
]
let currentLanguage = $ref('en')

function groupBy<T>(elements: T[], iteratee: (value: T) => string) {
  return elements.reduce<Record<string, T[]>>((result, value) => {
    const key = iteratee(value)
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      result[key].push(value)
    } else {
      result[key] = [value]
    }
    return result
  }, {})
}

function groupByDictTags(dicts: Dictionary[]) {
  return dicts.reduce<Record<string, Dictionary[]>>((result, dict) => {
    dict.tags.forEach((tag) => {
      if (Object.prototype.hasOwnProperty.call(result, tag)) {
        result[tag].push(dict)
      } else {
        result[tag] = [dict]
      }
    })
    return result
  }, {})
}

const groupedByCategoryAndTag = $computed(() => {
  const currentLanguageCategoryDicts = dictionaryResources.filter((dict) => dict.languageCategory === currentLanguage)
  const groupedByCategory = Object.entries(groupBy(currentLanguageCategoryDicts, (dict) => dict.category))
  const groupedByCategoryAndTag = groupedByCategory.map(
      ([category, dicts]) => [category, groupByDictTags(dicts)] as [string, Record<string, Dictionary[]>],
  )
  console.log('groupedByCategoryAndTag', groupedByCategoryAndTag)
  return groupedByCategoryAndTag
})

</script>

<template>
  <Modal :show-close="false"
         @close="close">
    <div class="slide">
      <div class="slide-list" :class="`step${step}`">
        <div class="dict-page">
          <header>
            <div class="tabs">
              <div class="tab"
                   :class="currentLanguage === item.id && 'active'"
                   @click="currentLanguage = item.id"
                   v-for="item in options">
                <img :src='item.flag'/>
                <span>{{ item.name }}</span>
              </div>
            </div>
            <Icon @click="close"
                  class="hvr-grow pointer"
                  width="20" color="#929596"
                  icon="ion:close-outline"/>
          </header>
          <div class="page-content">
            <div class="dict-list-wrapper">
              <DictGroup
                  v-for="item in groupedByCategoryAndTag"
                  :groupByTag="item[1]"/>
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
                  :list="currentSelectDict.chapterWords"
                  v-model:active-index="currentSelectDict.chapterIndex"
              />
              <div class="footer">
                <BaseButton @click="changeDict">确定</BaseButton>
              </div>
            </div>
          </div>
        </div>
        <div class="dict-detail-page">
          <header>
            <div class="left">
              <Icon icon="octicon:arrow-left-24"
                    @click.stop="step = 0"
                    class="go" width="20" color="#ffffff"/>
              <div class="title">
                词典详情
              </div>
            </div>
            <Icon @click="close"
                  class="hvr-grow pointer"
                  width="20" color="#929596"
                  icon="ion:close-outline"/>
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
              <ChapterList :list="currentSelectDict.chapterWords"
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
        transition: all .5s;
        border-bottom: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 6rem;

        &.active {
          border-bottom: 2px solid $main;
        }

        img {
          height: 30rem;
        }
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