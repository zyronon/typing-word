<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import {onMounted, watch} from "vue"
import {DefaultDict, Dict, DictResource, DictType, Sort, Word} from "@/types.ts"
import {chunk, cloneDeep, reverse, shuffle} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import WordListDialog from "@/components/dialog/WordListDialog.vue";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import Empty from "@/components/Empty.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/components/dialog/Dialog.vue";
import EditBatchArticleModal from "@/components/article/EditBatchArticleModal.vue";
import {nanoid} from "nanoid";
import DictListPanel from "@/components/DictListPanel.vue";
import {useRouter} from "vue-router";
import ArticleList4 from "@/components/list2/ArticleList4.vue";
import BaseList from "@/components/list2/BaseList.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let router = useRouter()

let step = $ref(1)
let loading = $ref(false)
let show = $ref(false)

function close() {
  show = false
}

let chapterList2 = $ref([])

async function selectDict(val: { dict: DictResource | Dict, index: number }) {
  let item = val.dict
  // console.log('item', item)
  step = 1
  loading = true
  let find: Dict = store.myDictList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
    runtimeStore.editDict.id = nanoid(6)
    //设置默认章节单词数
    runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
  }

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {
  } else {
    //如果不是自定义词典，并且有url地址才去下载
    if (!runtimeStore.editDict.isCustom && runtimeStore.editDict.url) {
      let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
      if (runtimeStore.editDict.type === DictType.word) {
        if (!runtimeStore.editDict.originWords.length) {
          let r = await fetch(url)
          let v = await r.json()
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.originWords = cloneDeep(v)
          changeSort(runtimeStore.editDict.sort)
        } else {
          runtimeStore.editDict.length = runtimeStore.editDict.words.length + runtimeStore.editDict.residueWords.length
        }
      }
      if (runtimeStore.editDict.type === DictType.article) {
        if (!runtimeStore.editDict.articles.length) {
          let r = await fetch(url)
          let v = await r.json()
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.articles = cloneDeep(v)
        } else {
          runtimeStore.editDict.length = runtimeStore.editDict.articles.length
        }
      }
    }
  }
  chapterList2 = runtimeStore.editDict.chapterWords.map((v, i) => ({id: i}))
  loading = false
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
  close()
}

function clickEvent(e) {
  console.log('e', e)
}

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

const chapterList = $computed(() => {
  return dictIsArticle ? runtimeStore.editDict.articles.length : runtimeStore.editDict.chapterWords.length
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

let wordListRef: any = $ref()

function option(type: string) {
  show = false
  setTimeout(() => {
    router.push({path: '/dict', query: {type: type}})
  }, 500)
}

/**/
/* 单词修改相关*/
/**/


watch(() => step, v => {
  if (v === 0) {
  }
})


onMounted(() => {
  emitter.on(EventKey.openDictModal, (type: 'detail' | 'list' | 'my') => {
    if (type === "detail") {
      selectDict({dict: store.currentDict, index: 0})
    }
    if (type === "list") {
      // currentLanguage = 'en'
      step = 0
    }
    if (type === "my") {
      // currentLanguage = 'my'
      step = 0
    }
    show = true
  })
})

function addDict() {
  show = false
  setTimeout(() => {
    router.push({path: '/dict', query: {type: 'addDict'}})
  }, 500)
}


function showWordListModal(val: { item: Word, index: number }) {
  emitter.emit(EventKey.openWordListModal, {
    title: `第${val.index + 1}章`,
    translateLanguage: runtimeStore.editDict.translateLanguage,
    list: runtimeStore.editDict.chapterWords[val.index]
  })
}
</script>

<template>
  <Dialog
      :header="false"
      v-model="show"
      :show-close="false">
    <div id="DictDialog">
      <Slide :slide-count="2" :step="step">
        <DictListPanel
            @add="addDict"
            @select-dict="selectDict"
        />
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
          <div class="detail">
            <div class="page-content">
              <div class="left-column">
                <BaseIcon
                    v-if="![DictType.collect,DictType.wrong,DictType.simple].includes(runtimeStore.editDict.type)"
                    class="edit-icon"
                    title="编辑词典"
                    icon="tabler:edit"
                    @click='option("editDict")'
                />
                <div class="name">{{ runtimeStore.editDict.name }}</div>
                <div class="desc">{{ runtimeStore.editDict.description }}</div>
                <div class="text flex align-center gap10">
                  <div v-if="dictIsArticle">总文章：{{ runtimeStore.editDict.articles.length }}篇
                  </div>
                  <div v-else>总词汇：
                    <span class="count" @click="showAllWordModal">{{
                        runtimeStore.editDict.originWords.length
                      }}词</span>
                  </div>
                  <BaseIcon icon="mi:add"
                            @click='option("addWordOrArticle")'
                            :title="`添加${dictIsArticle?'文章':'单词'}`"
                  />
                </div>
                <div class="text">开始日期：-</div>
                <div class="text">花费时间：-</div>
                <div class="text">累积错误：-</div>
                <div class="text">进度：
                  <el-progress :percentage="0"
                               :stroke-width="8"
                               :show-text="false"/>
                </div>
              </div>
              <div class="center-column">
                <div class="common-title">学习设置</div>
                <div class="setting">
                  <template v-if="!dictIsArticle">
                    <div class="row">
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
                  </template>
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
                    <div class="label">{{ dictIsArticle ? '句子' : '单词' }}发音</div>
                    <div class="option">
                      <el-radio-group v-model="settingStore.wordSoundType">
                        <el-radio label="us" size="large">美音</el-radio>
                        <el-radio label="uk" size="large">英音</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                  <div class="row">
                    <div class="label">{{ dictIsArticle ? '句子' : '单词' }}自动发音</div>
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
              </div>
              <div class="right-column">
                <div class="common-title">
                  <span>{{ dictIsArticle ? '文章' : '章节' }}列表</span>
                  <BaseIcon
                      icon="fluent:notepad-edit-20-regular"
                      @click='option("detail")'
                      style="position: absolute;right: 20rem;"
                      :title="`管理${dictIsArticle?'文章':'章节'}`"
                  />
                </div>
                <template v-if="dictIsArticle">
                  <ArticleList4
                      v-if="runtimeStore.editDict.articles.length"
                      :isActive="false"
                      v-loading="loading"
                      :show-border="true"
                      @title="(val:any) => emitter.emit(EventKey.openArticleListModal,val.item)"
                      @click="(val:any) => runtimeStore.editDict.chapterIndex = val.index"
                      :active-index="runtimeStore.editDict.chapterIndex"
                      :list="runtimeStore.editDict.articles">
                    <template v-slot:prefix="{item,index}">
                      <input type="radio" :checked="runtimeStore.editDict.chapterIndex === index">
                    </template>
                  </ArticleList4>
                  <Empty v-else/>
                </template>
                <template v-else>
                  <BaseList
                      ref="chapterListRef"
                      v-if="chapterList2.length"
                      :list="chapterList2"
                      :show-border="true"
                      @click="(val:any) => runtimeStore.editDict.chapterIndex = val.index"
                      :active-index="runtimeStore.editDict.chapterIndex"
                  >
                    <template v-slot:prefix="{ item, index }">
                      <input type="radio" :checked="runtimeStore.editDict.chapterIndex === item.id">
                    </template>
                    <template v-slot="{ item, index }">
                      <div class="item-title" @click.stop="showWordListModal({item,index})">
                        <span>第{{ item.id + 1 }}章</span>&nbsp;&nbsp;&nbsp;
                        <span>{{ runtimeStore.editDict.chapterWords[item.id]?.length }}词</span>
                      </div>
                    </template>
                  </BaseList>
                  <Empty v-else/>
                </template>
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
      </Slide>
    </div>
  </Dialog>
  <WordListDialog/>
  <EditBatchArticleModal/>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

$header-height: 60rem;

#DictDialog {
  //position: fixed;
  //left: 50%;
  //top: 50%;
  //transform: translate(-50%, -50%);
  background: var(--color-second-bg);
  z-index: 99999;
  width: 1000rem;
  height: 75vh;
}

.dict-detail-page {
  width: 50%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    cursor: pointer;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    height: $header-height;
    align-items: center;
    justify-content: space-between;
    color: var(--color-font-3);
    padding: 0 var(--space);

    .left {
      display: flex;
      gap: 10rem;
      align-items: center;
    }
  }

  .detail {
    padding-left: var(--space);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .page-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      position: relative;

      .left-column {
        overflow: auto;
        flex: 4;
        display: flex;
        flex-direction: column;
        gap: 10rem;
        min-height: 100rem;
        position: relative;
        color: var(--color-font-1);
        font-size: 14rem;
        position: relative;
        padding-right: var(--space);

        .name {
          font-size: 24rem;
          width: 95%;
        }

        .desc {
          font-size: 16rem;
          margin-bottom: 20rem;
        }

        .count {
          cursor: pointer;
          border-bottom: 2px solid var(--color-item-active);
        }

        :deep(.edit-icon) {
          position: absolute;
          top: 0;
          right: 0;
        }
      }

      .center-column {
        overflow: auto;
        flex: 7;
        background: white;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);

        .setting {
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

      }

      .right-column {
        flex: 8;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);
        display: flex;
        flex-direction: column;

        .tabs {
          display: flex;
          margin-bottom: 10rem;

          .tab {
            font-size: 20rem;
            color: var(--color-font-3);
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;

            span {
              cursor: pointer;
              border-bottom: 3px solid transparent;
              padding-bottom: 10rem;
              transition: all .3s;
            }

            &.active {
              color: var(--color-font-1);

              span {
                border-bottom: 3px solid var(--color-main-active);
              }
            }
          }

        }

        .scroll {
          height: calc(100% - 45rem);
        }
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
      gap: var(--space);
      padding-right: var(--space);
    }
  }
}
</style>

