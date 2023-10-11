<script setup lang="ts">
import {saveAs} from "file-saver";
import {onUnmounted, reactive} from "vue";
import {Article, DefaultArticle, DictType, Sort, TranslateType} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep} from "lodash-es";
import BaseIcon from "@/components/BaseIcon.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$computed, $ref} from "vue/macros";
import List from "@/components/List.vue";
import {v4 as uuidv4} from 'uuid';
import {Icon} from "@iconify/vue";
import Modal from "@/components/Modal/Modal.vue";
import EditArticle from "@/components/Article/EditArticle.vue";
import {onMounted} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useDisableEventListener} from "@/hooks/event.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";


const base = useBaseStore()
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

function selectArticle(item: Article) {
  article = cloneDeep(item)
  // console.log('article', article)
}

function add() {
  let editArticle: Article = editArticleRef.getEditArticle()

  const newArticle = () => {
    article = cloneDeep(DefaultArticle)
    // article.title = 'a'
    // article.text = 'b'
  }
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
            if (r) newArticle()
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
            if (r) newArticle()
          },
          () => void 0,
      )
    }
  }

  newArticle()
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
      base.current.editIndex = base.myDicts.length - 1
      showImportBtn = true
    } catch (e) {
      showImportBtn = true
      ElMessage.error('文件解析失败，报错原因：' + e.message)
    }
  }
}

function exportData() {
  let data = {
    name: base.currentEditDict.name,
    articles: cloneDeep(base.currentEditDict.articles).map(v => {
      delete v.sections
      delete v.id
      return v
    }),
    url: location.origin + base.currentEditDict.url,
    statistics: base.currentEditDict.statistics,
  }

  let blob = new Blob([JSON.stringify(data, null, 2)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, `${data.name}.json`);
}

function saveArticle(val: Article) {
  console.log('saveArticle', val)
  if (val.id !== '-1') {
    let rIndex = base.currentEditDict.articles.findIndex(v => v.id === val.id)
    if (rIndex > -1) {
      base.currentEditDict.articles[rIndex] = cloneDeep(val)
    }
  } else {
    let has = base.currentEditDict.articles.find((item: Article) => item.title === val.title)
    if (has) {
      return ElMessage.error('已存在同名文章！')
    }
    val.id = uuidv4()
    base.currentEditDict.articles.push(val)
    article = cloneDeep(val)
  }
  //TODO 保存完成后滚动到对应位置
  ElMessage.success('保存成功！')
}

const list = $computed(() => {
  if (article.id === '-1') {
    return base.currentEditDict.articles.concat([article])
  }
  return base.currentEditDict.articles
})

function getTitle(item: Article, index: number,) {
  if (item.id === '-1') return 'New article'
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
          <div class="dict-name">{{ base.currentEditDict.name }}</div>
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
          :article="article"/>

      <Icon @click="show = false"
            class="close hvr-grow pointer"
            width="20" color="#929596"
            icon="ion:close-outline"/>
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