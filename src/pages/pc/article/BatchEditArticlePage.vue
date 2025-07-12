<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {Article, getDefaultArticle} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep} from "lodash-es";
import {useBaseStore} from "@/stores/base.ts";

import List from "@/pages/pc/components/list/List.vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useDisableEventListener, useWindowClick} from "@/hooks/event.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {nanoid} from "nanoid";
import {syncMyDictList} from "@/hooks/dict.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import EditArticle2 from "@/pages/pc/article/components/EditArticle2.vue";
import BaseIcon from "@/components/BaseIcon.vue";

const emit = defineEmits<{
  importData: [val: Event]
  exportData: [val: string]
}>()
const base = useBaseStore()
const runtimeStore = useRuntimeStore()

let article = $ref<Article>(getDefaultArticle())
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
      editArticle.textTranslate = editArticle.textTranslate.trim()

      if (
          editArticle.title !== article.title ||
          editArticle.titleTranslate !== article.titleTranslate ||
          editArticle.text !== article.text ||
          editArticle.textTranslate !== article.textTranslate
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
    article = getDefaultArticle()
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
  <div class="add-article">
    <div class="aslide">
      <header class="flex justify-between items-center">
        <BaseIcon
            title="返回"
            @click="$router.back"
            icon="formkit:left"/>
        <div class="text-xl">{{ runtimeStore.editDict.name }}</div>
      </header>
      <List
          ref="listEl"
          v-model:list="runtimeStore.editDict.articles"
          :select-item="article"
          @del-select-item="article = getDefaultArticle()"
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
    <EditArticle2
        ref="editArticleRef"
        type="batch"
        @save="saveArticle"
        @saveAndNext="saveAndNext"
        :article="article"/>
  </div>
</template>

<style scoped lang="scss">


.add-article {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  color: var(--color-font-1);
  background: var(--color-second-bg);
  display: flex;

  .close {
    position: absolute;
    right: 1.2rem;
    top: 1.2rem;
  }

  .aslide {
    width: 14vw;
    height: 100%;
    padding: 0 .6rem;
    display: flex;
    flex-direction: column;

    $height: 4rem;

    header {
      height: $height;
    }

    .name {
      font-size: 1.1rem;
    }

    .translate-name {
      font-size: 1rem;
    }

    .add {
      width: 16rem;
      box-sizing: border-box;
      border-radius: .5rem;
      margin-bottom: .6rem;
      padding: .6rem;
      display: flex;
      justify-content: space-between;
      transition: all .3s;
      color: var(--color-font-1);
      background: var(--color-item-active);
    }

    .footer {
      height: $height;
      display: flex;
      gap: .6rem;
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
