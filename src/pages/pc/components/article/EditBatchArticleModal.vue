<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {Article, DefaultArticle} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";
import {$ref} from "vue/macros";
import List from "@/pages/pc/components/list/List.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import EditArticle from "@/pages/pc/components/article/EditArticle.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useDisableEventListener, useWindowClick} from "@/hooks/event.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {nanoid} from "nanoid";
import {syncMyDictList} from "@/hooks/dict.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";

const emit = defineEmits<{
  importData: [val: Event]
  exportData: [val: string]
}>()
const base = useBaseStore()
const runtimeStore = useRuntimeStore()

let article = $ref<Article>(cloneDeep(DefaultArticle))
let show = $ref(false)
let editArticleRef: any = $ref()
let listEl: any = $ref()

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
            () => resolve(true),
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
            () => resolve(true),
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
    val.id = nanoid(6)
    runtimeStore.editDict.articles.push(val)
    setTimeout(() => {
      listEl.scrollBottom()
    })
  }
  article = cloneDeep(val)
  //TODO 保存完成后滚动到对应位置
  ElMessage.success('保存成功！')
  syncMyDictList(runtimeStore.editDict)
  return true
}

function saveAndNext(val: Article) {
  if (saveArticle(val)) {
    add()
  }
}

let showExport = $ref(false)
useWindowClick(() => showExport = false)

</script>

<template>
  <Dialog
      v-model="show"
      :full-screen="true"
      :header="false"
  >
    <div class="add-article">
      <div class="slide">
        <header>
          <div class="dict-name">{{ runtimeStore.editDict.name }}</div>
        </header>
        <List
            ref="listEl"
            v-model:list="runtimeStore.editDict.articles"
            :select-item="article"
            @del-select-item="article = cloneDeep(DefaultArticle)"
            @select-item="selectArticle"
        >
          <template v-slot="{item,index}">
            <div class="name"> {{ `${index + 1}. ${item.title}` }}</div>
            <div class="translate-name"> {{ `   ${item.titleTranslate}` }}</div>
          </template>
        </List>
        <div class="add" v-if="!article.title">
          正在添加新文章...
        </div>
        <div class="footer">
          <div class="import">
            <BaseButton size="small">导入</BaseButton>
            <input type="file"
                   accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                   @change="e => emit('importData',e)">
          </div>
          <div class="export"
               style="position: relative"
               @click.stop="null">
            <BaseButton size="small" @click="showExport = true">导出</BaseButton>
            <MiniDialog
                v-model="showExport"
                style="width: 80rem;bottom: calc(100% + 10rem);top:unset;"
            >
              <div class="mini-row-title">
                导出选项
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="emit('exportData',{type:'all',data:[]})">全部文章</BaseButton>
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="emit('exportData',{type:'chapter',data:article})">当前章节</BaseButton>
              </div>
            </MiniDialog>
          </div>
          <BaseButton size="small" @click="add">新增</BaseButton>
        </div>
      </div>
      <EditArticle
          ref="editArticleRef"
          type="batch"
          @save="saveArticle"
          @saveAndNext="saveAndNext"
          :article="article"/>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.add-article {
  //position: fixed;
  position: relative;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  color: var(--color-font-1);
  background: var(--color-second-bg);
  display: flex;

  .close {
    position: absolute;
    right: 20rem;
    top: 20rem;
  }

  .slide {
    width: 14vw;
    height: 100%;
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
        color: var(--color-font-1);
      }
    }

    .name {
      font-size: 18rem;
    }

    .translate-name {
      font-size: 16rem;
    }

    .add {
      width: 260rem;
      box-sizing: border-box;
      border-radius: 8rem;
      margin-bottom: 10rem;
      padding: 10rem;
      display: flex;
      justify-content: space-between;
      transition: all .3s;
      color: var(--color-font-1);
      background: var(--color-item-active);
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