<script setup lang="ts">
import {dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {onUnmounted, watch} from "vue"
import {DefaultDict, Dict, DictResource, DictType, languageCategoryOptions, Sort} from "@/types.ts"
import {chunk, cloneDeep, groupBy, reverse, shuffle} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import Modal from "@/components/Modal/Modal.vue";
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import DictGroup from "@/components/Toolbar/DictGroup.vue";
import {v4 as uuidv4} from "uuid";
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import ChapterList from "@/components/ChapterList.vue";
import WordListModal from "@/components/WordListModal.vue";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";

interface IProps {
  modelValue?: boolean,
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
})

const emit = defineEmits<{
  close: []
}>()

const baseStore = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let currentLanguage = $ref('en')
let currentTranslateLanguage = $ref('common')
let groupByLanguage = groupBy(dictionaryResources, 'language')
let translateLanguageList = $ref([])

let step = $ref(1)

watch(() => props.modelValue, (n: boolean) => {
  let find = baseStore.myDicts.find((v: Dict) => v.name === baseStore.currentDict.name)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  }
})

async function selectDict(item: DictResource) {
  console.log('item', item)
  step = 1
  let find: Dict = baseStore.myDicts.find((v: Dict) => v.name === item.name)
  if (find) {
    if (find.type === DictType.article) {
      if (!find.articles.length) {
        let r = await fetch(`./dicts/${find.language}/${find.type}/${find.translateLanguage}/${find.url}`)
        let v = await r.json()
        find.articles = v.map(s => {
          s.id = uuidv4()
          return s
        })
      }
      runtimeStore.editDict = cloneDeep(find)
    }
  } else {
    let data: Dict = {
      ...cloneDeep(DefaultDict),
      ...item,
    }

    let r = await fetch(`./dicts/${data.language}/${data.type}/${data.translateLanguage}/${item.url}`)
    r.json().then(v => {
      console.log('v', v)
      if (data.type === DictType.article) {
        data.articles = cloneDeep(v.map(s => {
          s.id = uuidv4()
          return s
        }))
        runtimeStore.editDict = cloneDeep(data)
      } else {
        data.originWords = v
        data.words = v
        data.chapterWords = chunk(v, data.chapterWordNumber)
        runtimeStore.editDict = cloneDeep(data)
        console.log(' runtimeStore.editDict', runtimeStore.editDict)
      }
    })
  }
}

function changeDict() {
  baseStore.changeDict(runtimeStore.editDict)
  close()
}

function close() {
  emit('close')
}


function groupByDictTags(dictList: DictResource[]) {
  return dictList.reduce<Record<string, DictResource[]>>((result, dict) => {
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

const groupByTranslateLanguage = $computed(() => {
  let data: any
  if (currentLanguage === 'article') {
    let articleList = dictionaryResources.filter(v => v.type === 'article')
    data = groupBy(articleList, 'translateLanguage')
  } else {
    data = groupBy(groupByLanguage[currentLanguage], 'translateLanguage')
  }
  translateLanguageList = Object.keys(data)
  currentTranslateLanguage = translateLanguageList[0]
  return data
})

const groupedByCategoryAndTag = $computed(() => {
  const currentTranslateLanguageDictList = groupByTranslateLanguage[currentTranslateLanguage]
  const groupByCategory = groupBy(currentTranslateLanguageDictList, 'category')

  let data = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    data.push([key, groupByDictTags(value)])
  }
  // console.log('data', data)
  return data
})

function clickEvent(e) {
  console.log('e', e)
}

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

function showAllWordModal() {
  emitter.emit(EventKey.openWordListModal, {
    title: runtimeStore.editDict.name,
    translateLanguage: runtimeStore.editDict.translateLanguage,
    list: runtimeStore.editDict.words
  })
}

function resetChapterList() {
  runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, runtimeStore.editDict.chapterWordNumber)
}

function changeSort(v) {
  if (v === Sort.normal) {
    runtimeStore.editDict.words = cloneDeep(runtimeStore.editDict.originWords)
  } else if (v === Sort.random) {
    runtimeStore.editDict.words = shuffle(cloneDeep(runtimeStore.editDict.originWords))
  } else {
    runtimeStore.editDict.words = reverse(cloneDeep(runtimeStore.editDict.originWords))
  }
  resetChapterList()
}

onUnmounted(() => {
  close()
})
</script>

<template>
  <Modal
      :header="false"
      :model-value="props.modelValue"
      :show-close="false"
      @close="close">
    <div class="slide">
      <div class="slide-list" :class="`step${step}`">
        <div class="dict-page">
          <header>
            <div class="tabs">
              <div class="tab"
                   :class="currentLanguage === item.id && 'active'"
                   @click="currentLanguage = item.id"
                   v-for="item in languageCategoryOptions">
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
              <div class="translate">
                <span>翻译：</span>
                <el-radio-group v-model="currentTranslateLanguage">
                  <el-radio-button border v-for="i in translateLanguageList" :label="i">{{ i }}</el-radio-button>
                </el-radio-group>
              </div>
              <DictGroup
                  v-for="item in groupedByCategoryAndTag"
                  :select-dict-name="runtimeStore.editDict.resourceId"
                  @selectDict="selectDict"
                  @detail="step = 1"
                  :groupByTag="item[1]"
                  :category="item[0]"
              />
            </div>
          </div>
        </div>
        <div class="dict-detail-page">
          <header>
            <div class="left" @click.stop="step = 0">
              <Icon icon="octicon:arrow-left-24" class="go" width="20"/>
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
            <div class="detail">
              <div class="name">{{ runtimeStore.editDict.name }}</div>
              <div class="desc">{{ runtimeStore.editDict.description }}</div>
              <div class="num"
                   v-if="dictIsArticle"
              >总文章：{{ runtimeStore.editDict.articles.length }}篇
              </div>
              <div class="num" v-else>
                总词汇：<span class="count"
                             @click="showAllWordModal"
              >{{ runtimeStore.editDict.originWords.length }}词</span>
              </div>
              <div class="num">开始日期：-</div>
              <div class="num">花费时间：-</div>
              <div class="num">累积错误：-</div>
              <div class="num">进度：
                <el-progress :percentage="0"
                             :stroke-width="8"
                             :show-text="false"/>
              </div>
            </div>
            <div class="setting">
              <div class="common-title">学习设置</div>
              <div class="row" v-if="!isArticle(runtimeStore.editDict.type)">
                <div class="label">每章单词数</div>
                <el-slider :min="10"
                           :step="10"
                           :max="100"
                           v-model="runtimeStore.editDict.chapterWordNumber"
                           @change="resetChapterList"
                />
                <div class="option">
                  <span>{{ runtimeStore.editDict.chapterWordNumber }}</span>
                </div>
              </div>
              <div class="row">
                <div class="label">单词顺序</div>
                <div class="option">
                  <el-radio-group v-model="runtimeStore.editDict.sort"
                                  @change="changeSort"
                  >
                    <el-radio :label="Sort.normal" size="large">默认</el-radio>
                    <el-radio :label="Sort.random" size="large">随机</el-radio>
                    <el-radio :label="Sort.reverse" size="large">反转</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">学习模式</div>
                <div class="option">
                  <el-radio-group v-model="settingStore.dictation">
                    <el-radio :label="false" size="large">再认</el-radio>
                    <el-radio :label="true" size="large">拼写</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">单词发音</div>
                <div class="option">
                  <el-radio-group v-model="settingStore.wordSoundType">
                    <el-radio label="us" size="large">美音</el-radio>
                    <el-radio label="uk" size="large">英音</el-radio>
                  </el-radio-group>
                </div>
              </div>
              <div class="row">
                <div class="label">单词自动发音</div>
                <div class="option">
                  <el-switch v-model="settingStore.wordSound"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
              </div>
              <div class="row">
                <div class="label">是否显示翻译</div>
                <div class="option">
                  <el-switch v-model="settingStore.translate"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
              </div>
              <div class="row">
                <div class="label">忽略大小写</div>
                <div class="option">
                  <el-switch v-model="settingStore.ignoreCase"
                             inline-prompt
                             active-text="开"
                             inactive-text="关"
                  />
                </div>
              </div>
            </div>
            <div class="other">
              <div class="common-title">
                <template v-if="dictIsArticle">
                  文章列表：共{{ runtimeStore.editDict.articles.length }}章
                </template>
                <template v-else>
                  章节列表：共{{
                    runtimeStore.editDict.chapterWords.length
                  }}章(每章{{ runtimeStore.editDict.chapterWordNumber }}词)
                </template>
              </div>
              <ChapterList
                  :is-article="dictIsArticle"
                  v-model:active-index="runtimeStore.editDict.chapterIndex"
                  :dict="runtimeStore.editDict"/>
            </div>
          </div>
          <div v-if="false" class="activity">
            <ActivityCalendar
                :data="[{ date: '2023-05-22', count: 5 }]"
                :width="40"
                :height="7"
                :cellLength="16"
                :cellInterval="8"
                :fontSize="12"
                :showLevelFlag="false"
                :showWeekDayFlag="false"
                :clickEvent="clickEvent"
            />
          </div>
          <div class="footer">
            <!--            <BaseButton @click="step = 0">导出</BaseButton>-->
            <BaseButton @click="close">关闭</BaseButton>
            <BaseButton @click="changeDict">切换</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Modal>
  <WordListModal/>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

$modal-mask-bg: rgba(#000, .15);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

.slide {
  width: 1000rem;
  height: 75vh;

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

      .translate {
        display: flex;
        align-items: center;
        color: var(--color-font-1);
        margin-bottom: 30rem;

        & > span {
          font-size: 22rem;
        }
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
  display: flex;
  flex-direction: column;

  header {
    cursor: pointer;
    width: 100%;
    display: flex;
    height: $header-height;
    align-items: center;
    justify-content: space-between;
    color: var(--color-font-3);

    .left {
      display: flex;
      gap: 10rem;
      align-items: center;
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    position: relative;
    gap: $space;

    .common-title {
      font-size: 20rem;
      color: var(--color-font-1);
      text-align: center;
      margin-bottom: 10rem;
    }

    .detail {
      overflow: auto;
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 10rem;
      padding: 15rem;
      min-height: 100rem;
      position: relative;
      border-radius: 10rem;
      background: var(--color-second-bg);
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

      .count {
        cursor: pointer;
        border-bottom: 2px solid var(--color-item-active);
      }
    }

    .setting {
      overflow: auto;
      flex: 4;
      background: white;
      border-radius: 10rem;
      background: var(--color-second-bg);
      color: var(--color-font-1);
      padding: 15rem;

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40rem;
        word-break: keep-all;
        gap: 10rem;

        .el-radio {
          margin-right: 10rem;
        }
      }
    }

    .other {
      flex: 5;
      border-radius: 10rem;
      background: var(--color-second-bg);
      color: var(--color-font-1);
      padding: 10rem;
      display: flex;
      flex-direction: column;
    }
  }

  .activity {
    display: flex;
    justify-content: center;
  }

  .footer {
    box-sizing: content-box;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: $space;
  }
}
</style>

