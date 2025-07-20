<script setup lang="ts">

import BasePage from "@/pages/pc/components/BasePage.vue";
import BackIcon from "@/components/BackIcon.vue";
import Empty from "@/components/Empty.vue";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import {useBaseStore} from "@/stores/base.ts";
import {Article, getDefaultArticle} from "@/types.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import BaseButton from "@/components/BaseButton.vue";
import {useRoute, useRouter} from "vue-router";
import EditBook from "@/pages/pc/article/components/EditBook.vue";
import {computed, onMounted} from "vue";
import {cloneDeep} from "lodash-es";

const runtimeStore = useRuntimeStore()
const base = useBaseStore()
const router = useRouter()
const route = useRoute()

let isEdit = $ref(false)
let isAdd = $ref(false)

let article: Article = $ref(getDefaultArticle())
let chapterIndex = $ref(-1)

function handleCheckedChange(val) {
  let rIndex = runtimeStore.editDict.articles.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    chapterIndex = rIndex
    article = val.item
  }
}

const activeId = $computed(() => {
  return runtimeStore.editDict.articles?.[chapterIndex]?.id ?? ''
})

function addMyStudyList() {
  let rIndex = base.article.bookList.findIndex(v => v.name === runtimeStore.editDict.name)
  if (rIndex > -1) {
    base.article.studyIndex = rIndex
  } else {
    base.article.bookList.push(runtimeStore.editDict)
    base.article.studyIndex = base.article.bookList.length - 1
  }
  router.back()
}

const showBookDetail = computed(() => {
  return !(isAdd || isEdit);
})

onMounted(() => {
  if (route.query?.isAdd) {
    isAdd = true
  }else {
    if (!runtimeStore.editDict.id) {
      router.push("/article")
    }
  }
})

function formClose() {
  if (isEdit) isEdit = false
  else router.back()
}
</script>

<template>
  <BasePage>
    <div class="card mb-0 h-[95vh] flex flex-col" v-if="showBookDetail">
      <div class="flex justify-between items-center relative">
        <BackIcon class="z-2" @click="$router.back"/>
        <div class="absolute text-2xl text-align-center w-full">{{ runtimeStore.editDict.name }}</div>
        <div class="flex gap-2">
          <BaseButton type="info" @click="isEdit = true">编辑</BaseButton>
          <BaseButton type="info" @click="router.push('batch-edit-article')">文章管理</BaseButton>
          <BaseButton @click="addMyStudyList">学习</BaseButton>
        </div>
      </div>
      <div class="text-lg  ">介绍：{{ runtimeStore.editDict.description }}</div>
      <div class="line my-3"></div>

      <div class="flex flex-1 overflow-hidden">
        <div class="left flex-[2] scroll p-0">
          <ArticleList
              v-if="runtimeStore.editDict.articles.length"
              @title="handleCheckedChange"
              @click="handleCheckedChange"
              :list="runtimeStore.editDict.articles"
              :active-id="activeId">
          </ArticleList>
          <Empty v-else/>
        </div>
        <div class="right flex-[4] shrink-0 pl-4 overflow-auto">
          <div v-if="chapterIndex>-1">
            <div class="en-article-family title text-xl">
              <div class="text-center text-2xl">{{ article.title }}</div>
              <div class="text-2xl" v-if="article.text">
                <div class="my-5" v-for="t in article.text.split('\n\n')">{{ t }}</div>
              </div>
            </div>
            <div class="mt-2">
              <div class="text-center text-2xl">{{ article.titleTranslate }}</div>
              <div class="text-xl" v-if="article.textTranslate">
                <div class="my-5" v-for="t in article.textTranslate.split('\n\n')">{{ t }}</div>
              </div>
              <Empty v-else/>
            </div>
          </div>
          <Empty v-else/>
        </div>
      </div>
    </div>

    <div class="card mb-0 h-[95vh]" v-else>
      <div class="flex justify-between items-center relative">
        <BackIcon class="z-2" @click="isAdd ? $router.back():(isEdit = false)"/>
        <div class="absolute text-2xl text-align-center w-full">{{
            runtimeStore.editDict.id ? '修改' : '创建'
          }}书籍
        </div>
      </div>
      <div class="center">
        <EditBook
            :is-add="isAdd"
            :is-book="true"
            @close="formClose"
            @submit="isEdit = isAdd = false"
        />
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

</style>
