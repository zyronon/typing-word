<script setup lang="ts">
import {dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {onMounted, watch} from "vue"
import {Dict, DictionaryResource, DictType, Sort, Word} from "@/types.ts"
import {chunk, cloneDeep} from "lodash-es";
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
import bookFlag from '@/assets/img/flags/book.png'
import DictGroup from "@/components/Toolbar/DictGroup.vue";
import {v4 as uuidv4} from "uuid";

const store = useBaseStore()

interface IProps {
  modelValue?: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

const emit = defineEmits<{
  close: []
}>()

const options = [
  {id: 'article', name: '文章', flag: bookFlag},
  {id: 'en', name: '英语', flag: enFlag},
  {id: 'ja', name: '日语', flag: jpFlag},
  {id: 'de', name: '德语', flag: deFlag},
  {id: 'code', name: 'Code', flag: codeFlag},
]
let currentLanguage = $ref('en')
let currentSelectDict: Dict = $ref(cloneDeep(store.currentDict))
let step = $ref(1)

const currentSelectChapter: Word[] = $computed(() => {
  return currentSelectDict.chapterWords?.[currentSelectDict.chapterIndex] ?? []
})

watch(() => props.modelValue, (n: boolean) => {
  currentSelectDict = store.currentDict
})

async function selectDict(item: DictionaryResource) {
  if (item.name === currentSelectDict.name) return
  currentSelectDict = {
    ...item,
    sort: Sort.normal,
    type: DictType.publicDict,
    originWords: [],
    words: [],
    chapterWordNumber: 30,
    chapterWords: [],
    chapterIndex: 0,
    chapterWordIndex: 0,
    statistics: [],
    articles: []
  }
  if (item.languageCategory === 'article') {
    currentSelectDict.type = DictType.publicArticle
    let r = await fetch(`${item.url}`)
    r.json().then(v => {
      currentSelectDict.articles = cloneDeep(v.map(v => {
        v.id = uuidv4()
        return v
      }))
    })
  } else {
    currentSelectDict.type = DictType.publicDict
    let r = await fetch(`${item.url}`)
    r.json().then(v => {
      currentSelectDict.originWords = v
      currentSelectDict.words = v
      currentSelectDict.chapterWords = chunk(v, currentSelectDict.chapterWordNumber)
    })
  }
  step = 1
}

function changeDict() {
  store.changeDict(currentSelectDict)
  close()
}

function close() {
  emit('close')
}

function resetChapterList() {
  currentSelectDict.chapterWords = chunk(currentSelectDict.words, currentSelectDict.chapterWordNumber)
}

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

function groupByDictTags(dicts: DictionaryResource[]) {
  return dicts.reduce<Record<string, DictionaryResource[]>>((result, dict) => {
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
      ([category, dicts]) => [category, groupByDictTags(dicts)] as [string, Record<string, DictionaryResource[]>],
  )
  console.log('groupedByCategoryAndTag', groupedByCategoryAndTag)
  return groupedByCategoryAndTag
})

let radio1 = $ref('')
</script>

<template>
  <Modal :show-close="false"
         :header="false"
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
                  :select-dict-name="currentSelectDict.name"
                  @selectDict="selectDict"
                  @detail="step = 1"
                  :groupByTag="item[1]"/>
            </div>
            <div class="chapter-wrapper" v-if="false">
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
                    class="go" width="20" color="#000000"/>
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
              <div class="detail">
                <div class="name">{{ currentSelectDict.name }}</div>
                <div class="desc">{{ currentSelectDict.description }}</div>
                <div class="num">{{ currentSelectDict.length }}词</div>
                <div class="num">{{ currentSelectDict.chapterWords.length }}章</div>
              </div>
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
            </div>
            <div class="other">
              <WordList
                  v-if="false"
                  class="word-list" :list="[]" :activeIndex="-1" :isActive="false"/>
              <!--                  class="word-list" :list="currentSelectDict.words" :activeIndex="-1" :isActive="false"/>-->
              <div class="footer">
                <BaseButton @click="step = 0">返回</BaseButton>
                <BaseButton>确定</BaseButton>
              </div>
            </div>
            <div class="setting">
              <div class="title">学习设置</div>
              <div class="row">
                <div class="label">学习模式</div>
                <div class="option">
                  <el-radio-group v-model="radio1" class="ml-4">
                    <el-radio label="1" size="large">再认</el-radio>
                    <el-radio label="2" size="large">拼写</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">单词发音</div>
                <div class="option">
                  <el-radio-group v-model="radio1" class="ml-4">
                    <el-radio label="1" size="large">美音</el-radio>
                    <el-radio label="2" size="large">英音</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">词序</div>
                <div class="option">
                  <el-radio-group v-model="radio1" class="ml-4">
                    <el-radio label="1" size="large">随机</el-radio>
                    <el-radio label="2" size="large">正常</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">单词自动发音</div>
                <div class="option">
                  <el-switch v-model="radio1"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
              </div>
              <div class="row">
                <div class="label">是否显示翻译</div>
                <div class="option">
                  <el-switch v-model="radio1"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
              </div>
              <div class="row">
                <div class="label">忽略大小写</div>
                <div class="option">
                  <el-switch v-model="radio1"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
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
    color: #000;

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
    gap: $space;

    .dict-info {
      flex: 3;
      color: black;

      .detail {
        cursor: pointer;
        padding: 10rem;
        min-height: 100rem;
        position: relative;
        border-radius: 10rem;
        background: var(--color-item-bg);
        color: var(--color-font-1);
        font-size: 14rem;

        .name {
          font-size: 28rem;
          margin-bottom: 10rem;
        }

        .desc {
          font-size: 18rem;
          margin-bottom: 30rem;
        }
      }
    }

    .setting {
      flex: 5;
      background: white;
      border-radius: 10rem;
      background: var(--color-item-bg);
      color: var(--color-font-1);
      padding: 10rem;

      .title {
        font-size: 20rem;
        color: gray;
        text-align: center;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40rem;
      }
    }

    .other {
      flex: 5;
      background: white;
      border-radius: 10rem;
      background: var(--color-item-bg);
      color: var(--color-font-1);
      padding: 10rem;

      .word-list {
        height: calc(100% - $footer-height);
      }
    }
  }
}
</style>