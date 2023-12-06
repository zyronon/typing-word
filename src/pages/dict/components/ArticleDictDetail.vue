<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import Empty from "@/components/Empty.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {$computed, $ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {Article, DefaultArticle, DefaultDict, Dict, DictResource, DictType, Sort, TranslateType} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import EditBatchArticleModal from "@/components/article/EditBatchArticleModal.vue";
import {no} from "@/utils";
import {Icon} from "@iconify/vue";
import EditDict from "@/pages/dict/components/EditDict.vue";
import {nanoid} from "nanoid";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import * as XLSX from "xlsx";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {syncMyDictList} from "@/hooks/dict.ts";
import {useWindowClick} from "@/hooks/event.ts";
import ArticleList from "@/components/list/ArticleList.vue";
import * as copy from "copy-to-clipboard";
import {getTranslateText} from "@/hooks/article.ts";

const emit = defineEmits<{
  back: []
}>()

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let chapterIndex = $ref(-1)
let article: Article = $ref(cloneDeep(DefaultArticle))
let isEditDict = $ref(false)
let showExport = $ref(false)
let loading = $ref(false)
let listRef = $ref()
useWindowClick(() => showExport = false)

const isPinDict = $computed(() => {
  return [DictType.collect, DictType.wrong, DictType.simple].includes(runtimeStore.editDict.type)
})

const activeId = $computed(() => {
  return runtimeStore.editDict.articles?.[chapterIndex]?.id ?? ''
})

async function getDictDetail(val: {
  dict: DictResource | Dict,
  index: number
}) {
  let item = val.dict
  // console.log('word-getDictDetail', item)
  chapterIndex = -1
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
  }

  //如果不是自定义词典，并且有url地址才去下载
  if (!runtimeStore.editDict.isCustom && runtimeStore.editDict.url) {
    let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
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

  loading = false
}


function handleCheckedChange(val) {
  let rIndex = runtimeStore.editDict.articles.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    chapterIndex = rIndex
    article = val.item
  }
}

function delArticle(index: number) {
  runtimeStore.editDict.articles.splice(index, 1)

  if (runtimeStore.editDict.articles.length) {
    if (chapterIndex >= runtimeStore.editDict.articles.length - 1) {
      chapterIndex = runtimeStore.editDict.articles.length - 1
      article = runtimeStore.editDict.articles[chapterIndex]
    }
    if (chapterIndex === index) {
      article = runtimeStore.editDict.articles[chapterIndex]
    }
  } else {
    article = cloneDeep(DefaultArticle)
    chapterIndex = -1
  }
  syncMyDictList(runtimeStore.editDict)
  ElMessage.success('删除成功！')
}

async function resetDict() {
  MessageBox.confirm(
      '删除所有自定义内容: 章节、排序、单词，并恢复至默认状态，确认恢复？',
      '提示',
      async () => {
        chapterIndex = -1
        article = cloneDeep(DefaultArticle)
        if (runtimeStore.editDict.url) {
          runtimeStore.editDict.sort = Sort.normal
          runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
          let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
          let r = await fetch(url)
          let v = await r.json()
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.articles = cloneDeep(v)
          syncMyDictList(runtimeStore.editDict)
          ElMessage.success('恢复成功')
        } else {
          ElMessage.success('恢复失败')
        }
      }
  )
}

function importData(e: any) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader();
  reader.onload = function (e) {
    let data = e.target.result;
    // 读取二进制的excel
    let workbook = XLSX.read(data, {type: 'binary'});
    let res: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
    if (res.length) {
      let articles = res.map(v => {
        if (v['原文标题'] && v['原文正文']) {
          let article: Article = {
            ...DefaultArticle,
            textCustomTranslateIsFormat: false,
            useTranslateType: TranslateType.custom,
            id: nanoid(6),
            checked: false,
            title: String(v['原文标题']),
            text: String(v['原文正文']),
            titleTranslate: String(v['译文标题']),
            textCustomTranslate: String(v['译文正文']),
          }
          return article
        }
      }).filter(v => v)

      let repeat = []
      let noRepeat = []
      articles.map((v: any) => {
        let rIndex = runtimeStore.editDict.articles.findIndex(s => s.title === v.title)
        if (rIndex > -1) {
          v.index = rIndex
          repeat.push(v)
        } else {
          noRepeat.push(v)
        }
      })

      runtimeStore.editDict.articles = runtimeStore.editDict.articles.concat(noRepeat)

      if (repeat.length) {
        MessageBox.confirm(
            '文章"' + repeat.map(v => v.title).join(', ') + '" 已存在，继续将会覆盖原有文章，是否继续？',
            '检测到重复文章',
            () => {
              repeat.map(v => {
                runtimeStore.editDict.articles[v.index] = v
                delete runtimeStore.editDict.articles[v.index].index
              })
              setTimeout(listRef?.scrollToBottom, 100)
            },
            null,
            () => {
              syncMyDictList(runtimeStore.editDict)
              ElMessage.success('导入成功！')
            }
        )
      } else {
        syncMyDictList(runtimeStore.editDict)
        ElMessage.success('导入成功！')
      }
    } else {
      ElMessage.warning('导入失败！原因：没有数据')
    }
  };
  reader.readAsBinaryString(file);
}

function exportData(val: {
  type: string,
  data?: Article
}) {
  copy(JSON.stringify(cloneDeep(runtimeStore.editDict.articles).map(v => {
    delete v.sections
    return v
  })))

  const {type, data} = val
  let list = []
  let filename = ''
  if (type === 'chapter') {
    if (!data.id) {
      return ElMessage.error('请选择文章')
    }
    list = [data]
    filename = runtimeStore.editDict.name + `-${data.title}`
  } else {
    list = runtimeStore.editDict.articles
    filename = runtimeStore.editDict.name
  }
  let wb = XLSX.utils.book_new()
  let sheetData = list.map(v => {
    return {
      原文标题: v.title,
      原文正文: v.text,
      译文标题: v.titleTranslate,
      译文正文: v.textCustomTranslate,
    }
  })
  wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(sheetData)
  wb.SheetNames = ['Sheet1']
  XLSX.writeFile(wb, `${filename}-zh-CN.xlsx`);
  ElMessage.success(filename + ' 导出成功！')
  showExport = false
}

function editDict() {
  isEditDict = true
}

function add() {
  emitter.emit(EventKey.openArticleListModal)
}

function back() {
  emit('back')
  setTimeout(() => {
    isEditDict = false
  }, 500)
}

defineExpose({getDictDetail, add, editDict})


</script>

<template>
  <div class="article-detail">
    <header>
      <div class="back" @click.stop="back">
        <Icon icon="octicon:arrow-left-24" width="20"/>
      </div>
      <div class="left">
        <div class="top">
          <div class="title">
            {{ runtimeStore.editDict.name }}
          </div>
          <template v-if="!isPinDict">
            <BaseIcon icon="tabler:edit" @click='editDict'/>
            <BaseIcon icon="ph:star" @click='no'/>
            <BaseButton size="small" v-if="runtimeStore.editDict.isCustom" @click="resetDict">恢复默认</BaseButton>
          </template>
          <div class="import hvr-grow">
            <BaseButton size="small">导入</BaseButton>
            <input type="file"
                   accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                   @change="importData">
          </div>
          <div class="export"
               style="position: relative"
               @click.stop="null">
            <BaseButton size="small" @click="showExport = true">导出</BaseButton>
            <MiniDialog
                v-model="showExport"
                style="width: 80rem;"
            >
              <div class="mini-row-title">
                导出选项
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="exportData({type:'all',data:[]})">全部文章</BaseButton>
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="exportData({type:'chapter',data:article})">当前章节</BaseButton>
              </div>
            </MiniDialog>
          </div>
        </div>
        <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
        <div class="num">文章: {{ runtimeStore.editDict.articles.length }}篇</div>
      </div>
    </header>
    <EditDict
        :isAdd="false"
        v-if="isEditDict"
        @cancel="isEditDict = false"
        @submit="isEditDict = false"/>
    <div v-else class="content">
      <div class="chapter-list">
        <div class="header">
          <div class="common-title">
            <span>文章管理</span>
            <div class="options">
              <BaseIcon
                  @click="add"
                  icon="fluent:add-20-filled"
                  title="新增章节"/>
              <span>{{ runtimeStore.editDict.articles.length }}篇</span>
            </div>
          </div>
        </div>
        <div class="wrapper">
          <ArticleList
              ref="listRef"
              :isActive="false"
              v-if="runtimeStore.editDict.articles.length"
              :list="runtimeStore.editDict.articles"
              @title="handleCheckedChange"
              @click="handleCheckedChange"
              :active-id="activeId">
            <template v-slot:prefix="{item,index}">
              <input type="radio" :checked="activeId === item.id">
            </template>
            <template v-slot:suffix="{item,index}">
              <BaseIcon
                  class="del"
                  @click="emitter.emit(EventKey.openArticleListModal,item)"
                  title="编辑"
                  icon="tabler:edit"/>
              <BaseIcon
                  class="del"
                  @click="delArticle(index)"
                  title="删除"
                  icon="solar:trash-bin-minimalistic-linear"/>
            </template>
          </ArticleList>
          <Empty v-else/>
        </div>
      </div>
      <div class="article-content">
        <div class="title">
          <div>{{ article.title }}</div>
          <BaseIcon
              style="position:absolute;right: 0;"
              title="大屏显示"
              @click="emitter.emit(EventKey.openArticleContentModal,article)"
              icon="iconoir:expand"/>
        </div>
        <div class="text" v-if="article.text">
          <div class="sentence" v-for="t in article.text.split('\n')">{{ t }}</div>
        </div>
        <Empty v-else/>
      </div>
      <div class="article-content">
        <div class="title">
          <div>{{ article.titleTranslate }}</div>
          <BaseIcon
              style="position:absolute;right: 0;"
              title="大屏显示"
              @click="emitter.emit(EventKey.openArticleContentModal,article)"
              icon="iconoir:expand"/>
        </div>
        <div class="text" v-if="getTranslateText(article).length">
          <div class="sentence" v-for="t in getTranslateText(article)">{{ t }}</div>
        </div>
        <Empty v-else/>
      </div>
    </div>
  </div>
  <EditBatchArticleModal
      @export-data="exportData"
      @import-data="importData"/>
</template>

<style scoped lang="scss">
.article-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  header {
    width: 100%;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    color: var(--color-font-1);
    padding: 0 var(--space);
    gap: 20rem;
    margin-bottom: 20rem;

    .back {
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .left {
      display: flex;
      gap: 10rem;
      flex-direction: column;
      color: var(--color-font-2);

      .top {
        color: var(--color-font-1);
        display: flex;
        gap: 10rem;
        font-size: 20rem;
        align-items: center;
      }

      .import {
        display: inline-flex;
        position: relative;

        input {
          position: absolute;
          height: 100%;
          width: 100%;
          opacity: 0;
        }
      }
    }
  }

  .box {
    background: white;
    border-radius: 10rem;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    padding-bottom: var(--space);
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    display: flex;
    gap: var(--space);
    overflow: hidden;
  }

  .chapter-list {
    width: 400rem;
    height: 100%;
    @extend .box;

    .header {
      padding: 0 var(--space);

      .common-title {
        margin-bottom: 0;
        position: relative;

        .options {
          position: absolute;
          right: 0;
          display: flex;
          gap: 10rem;
        }
      }

      .select {
        height: 45rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .left {
          display: flex;
          gap: 5rem;
          align-items: center;
        }
      }
    }

    .wrapper {
      flex: 1;
      display: flex;
      padding-bottom: var(--space);
      overflow: hidden;
    }
  }

  .article-content {
    @extend .box;
    flex: 1;
    padding: var(--space);
    overflow: hidden;
    font-size: 20rem;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-bottom: var(--space);
      font-size: 24rem;
    }

    .text {
      text-indent: 1.5em;
      line-height: 35rem;
      overflow: auto;
      padding-right: 10rem;
      padding-bottom: 50rem;

      .sentence {
        margin-bottom: 30rem;
      }
    }
  }
}
</style>