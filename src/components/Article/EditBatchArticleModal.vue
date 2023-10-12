<script setup lang="ts">
import {saveAs} from "file-saver";
import {onMounted, onUnmounted} from "vue";
import {Article, DefaultArticle, DictType, Sort} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep} from "lodash-es";
import BaseIcon from "@/components/BaseIcon.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$computed, $ref} from "vue/macros";
import List from "@/components/List.vue";
import {v4 as uuidv4} from 'uuid';
import Modal from "@/components/Modal/Modal.vue";
import EditArticle from "@/components/Article/EditArticle.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useDisableEventListener} from "@/hooks/event.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {useRuntimeStore} from "@/stores/runtime.ts";


const base = useBaseStore()
const runtimeStore = useRuntimeStore()

let article = $ref<Article>(cloneDeep(DefaultArticle))
let show = $ref(false)
let showImportBtn = $ref(true)
let editArticleRef: any = $ref()

onMounted(() => {
  emitter.on(EventKey.openArticleListModal, (val: Article) => {
    console.log('val', val)
    show = true
    if (val) {
      article = cloneDeep(val)
    }
  })
})

onUnmounted(() => {
  emitter.off(EventKey.openArticleListModal)
})

useDisableEventListener(() => show)

async function selectArticle(item: Article) {
  let r = await checkDataChange()
  if (r) {
    article = cloneDeep(item)
  }
}

function checkDataChange() {
  return new Promise(resolve => {
    let editArticle: Article = editArticleRef.getEditArticle()

    if (editArticle.id !== '-1') {
      editArticle.title = editArticle.title.trim()
      editArticle.titleTranslate = editArticle.titleTranslate.trim()
      editArticle.text = editArticle.text.trim()
      editArticle.textCustomTranslate = editArticle.textCustomTranslate.trim()
      editArticle.textNetworkTranslate = editArticle.textNetworkTranslate.trim()

      if (
          editArticle.title !== article.title ||
          editArticle.titleTranslate !== article.titleTranslate ||
          editArticle.text !== article.text ||
          editArticle.textCustomTranslate !== article.textCustomTranslate ||
          editArticle.textNetworkTranslate !== article.textNetworkTranslate ||
          editArticle.useTranslateType !== article.useTranslateType
      ) {
        return MessageBox.confirm(
            '检测到数据有变动，是否保存？',
            '提示',
            async () => {
              let r = await editArticleRef.save('save')
              if (r) resolve(true)
            },
            () => void 0,
        )
      }
    } else {
      if (editArticle.title.trim() && editArticle.text.trim()) {
        return MessageBox.confirm(
            '检测到数据有变动，是否保存？',
            '提示',
            async () => {
              let r = await editArticleRef.save('save')
              if (r) resolve(true)
            },
            () => void 0,
        )
      }
    }
    resolve(true)
  })
}

async function add() {
  let r = await checkDataChange()
  if (r) {
    article = cloneDeep(DefaultArticle)
  }
}

function importData(e: Event) {
  showImportBtn = false
  let file = e.target.files[0]
  let reader = new FileReader();//新建一个FileReader
  reader.readAsText(file, "UTF-8");//读取文件
  reader.onload = function (evt) { //读取完文件之后会回来这里
    let fileString = evt.target.result; // 读取文件内容
    // console.log('fileString', fileString)
    try {
      let obj: any = JSON.parse(fileString)
      console.log('obj', obj)
      if (!obj?.name) {
        showImportBtn = true
        return ElMessage.error('请填写词典名称！')
      } else {
        if (base.myDicts.find(v => v.name === obj.name)) {
          showImportBtn = true
          return ElMessage.error('词典名称已存在！')
        }
      }
      if (!obj?.articles) {
        showImportBtn = true
        return ElMessage.error('请填写文章！')
      }
      if (!obj?.articles instanceof Array) {
        showImportBtn = true
        return ElMessage.error('请填写文章！')
      }
      for (let i = 0; i < obj.articles.length; i++) {
        let item = obj.articles[i]
        if (!item?.title) {
          showImportBtn = true
          return ElMessage.error(`请填写第${i + 1}篇文章名称！`)
        }
        if (!item?.text) {
          showImportBtn = true
          return ElMessage.error(`请填写第${i + 1}篇文章正文！`)
        }
        if (item?.useTranslateType === 'custom') {
          if (!item?.textCustomTranslate) {
            showImportBtn = true
            return ElMessage.error(`请填写第${i + 1}篇文章 翻译 正文！`)
          }
        }

        if (!obj.articles[i]?.titleTranslate) obj.articles[i].titleTranslate = ''
        if (!obj.articles[i]?.textFormat) obj.articles[i].textFormat = ''
        if (!obj.articles[i]?.textCustomTranslate) obj.articles[i].textCustomTranslate = ''
        if (!obj.articles[i]?.newWords) obj.articles[i].newWords = []
        if (!obj.articles[i]?.textCustomTranslateIsFormat) obj.articles[i].textCustomTranslateIsFormat = false
        if (!obj.articles[i]?.useTranslateType) obj.articles[i].useTranslateType = 'none'
        if (!obj.articles[i]?.textAllWords) obj.articles[i].textAllWords = []
        if (!obj.articles[i]?.sections) obj.articles[i].sections = []
        obj.articles[i].id = uuidv4()
      }
      obj.sort = Sort.normal
      obj.type = DictType.customArticle
      obj.originWords = []
      obj.words = []
      obj.chapterWords = []
      obj.chapterWordNumber = 0
      obj.chapterIndex = 0
      obj.chapterWordIndex = 0
      obj.url = ''
      if (!obj.statistics) obj.statistics = []

      ElMessage.success({
        message: '导入成功，已切换到',
        duration: 5000
      })
      base.myDicts.push(obj)
      runtimeStore.editDict = cloneDeep(runtimeStore.editDict)
      showImportBtn = true
    } catch (e) {
      showImportBtn = true
      ElMessage.error('文件解析失败，报错原因：' + e.message)
    }
  }
}

function exportData() {
  let data = {
    name: runtimeStore.editDict.name,
    articles: cloneDeep(runtimeStore.editDict.articles).map(v => {
      delete v.sections
      delete v.id
      return v
    }),
    url: location.origin + runtimeStore.editDict.url,
    statistics: runtimeStore.editDict.statistics,
  }

  let blob = new Blob([JSON.stringify(data, null, 2)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, `${data.name}.json`);
}

function saveArticle(val: Article): boolean {
  console.log('saveArticle', val)
  if (val.id) {
    let rIndex = runtimeStore.editDict.articles.findIndex(v => v.id === val.id)
    if (rIndex > -1) {
      runtimeStore.editDict.articles[rIndex] = cloneDeep(val)
    }
  } else {
    let has = runtimeStore.editDict.articles.find((item: Article) => item.title === val.title)
    if (has) {
      ElMessage.error('已存在同名文章！')
      return false
    }
    val.id = uuidv4()
    runtimeStore.editDict.articles.push(val)
  }
  article = cloneDeep(val)
  //TODO 保存完成后滚动到对应位置
  ElMessage.success('保存成功！')
  return true
}

function saveAndNext(val: Article) {
  if (saveArticle(val)) {
    add()
  }
}

const list = $computed(() => {
  if (!article.id) {
    return runtimeStore.editDict.articles.concat([article])
  }
  return runtimeStore.editDict.articles
})

function getTitle(item: Article, index: number,) {
  if (!item.id) return 'New article'
  return `${index + 1}. ${item.title}`
}
</script>

<template>
  <Modal
      v-model="show"
      :full-screen="true"
      :header="false"
  >
    <div class="add-article">
      <div class="slide">
        <header>
          <div class="dict-name">{{ runtimeStore.editDict.name }}</div>
          <BaseIcon title="选择其他词典/文章" icon="carbon:change-catalog"/>
        </header>
        <List
            v-model:list="list"
            :select-item="article"
            @del-select-item="article = cloneDeep(DefaultArticle)"
            @select-item="selectArticle"
        >
          <template v-slot="{item,index}">
            <div class="name"> {{ getTitle(item, index) }}</div>
            <div class="translate-name"> {{ `   ${item.titleTranslate}` }}</div>
          </template>
        </List>
        <div class="footer">
          <div class="import" v-if="showImportBtn">
            <BaseButton>导入</BaseButton>
            <input type="file" accept="application/json" @change="importData">
          </div>
          <BaseButton @click="exportData">导出</BaseButton>
          <BaseButton @click="add">新增</BaseButton>
        </div>
      </div>
      <EditArticle
          ref="editArticleRef"
          type="batch"
          @save="saveArticle"
          @saveAndNext="saveAndNext"
          :article="article"/>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.add-article {
  //position: fixed;
  position: relative;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  color: black;
  background: var(--color-main-bg);
  display: flex;

  .close {
    position: absolute;
    right: 20rem;
    top: 20rem;
  }

  .slide {
    height: 100%;
    background: white;
    padding: 0 10rem;
    display: flex;
    flex-direction: column;

    $height: 60rem;

    header {
      height: $height;
      display: flex;
      justify-content: space-between;
      align-items: center;
      //opacity: 0;

      .dict-name {
        font-size: 30rem;
        color: black;
      }
    }

    .name {
      font-size: 18rem;
    }

    .translate-name {
      font-size: 16rem;
    }

    .footer {
      height: $height;
      display: flex;
      gap: 10rem;
      align-items: center;
      justify-content: flex-end;

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
}
</style>