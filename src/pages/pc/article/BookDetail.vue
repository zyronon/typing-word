<script setup lang="ts">

import BasePage from "@/pages/pc/components/BasePage.vue";
import BackIcon from "@/pages/pc/components/BackIcon.vue";
import Empty from "@/components/Empty.vue";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import {useBaseStore} from "@/stores/base.ts";
import {Article, DictId, DictType, getDefaultArticle, getDefaultDict} from "@/types.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import BaseButton from "@/components/BaseButton.vue";
import {useRoute, useRouter} from "vue-router";
import EditBook from "@/pages/pc/article/components/EditBook.vue";
import {computed, onMounted} from "vue";
import {_getDictDataByUrl} from "@/utils";
import BaseIcon from "@/components/BaseIcon.vue";
import {useArticleOptions} from "@/hooks/dict.ts";

const runtimeStore = useRuntimeStore()
const base = useBaseStore()
const router = useRouter()
const route = useRoute()

let isEdit = $ref(false)
let isAdd = $ref(false)
let loading = $ref(false)
let studyLoading = $ref(false)

let selectArticle: Article = $ref(getDefaultArticle())

function handleCheckedChange(val) {
  selectArticle = val.item
}

async function addMyStudyList() {
  studyLoading = true
  base.changeBook(runtimeStore.editDict)
  studyLoading = false
  if (route.query?.from) {
    router.back()
  }
  router.back()
}

const showBookDetail = computed(() => {
  return !(isAdd || isEdit);
})

async function init() {
  if (route.query?.isAdd) {
    isAdd = true
    runtimeStore.editDict = getDefaultDict()
  } else {
    if (!runtimeStore.editDict.id) {
      await router.push("/article")
    } else {
      if (!runtimeStore.editDict.articles.length
          && !runtimeStore.editDict.custom
          && ![DictId.articleCollect].includes(runtimeStore.editDict.id)
      ) {
        loading = true
        let r = await _getDictDataByUrl(runtimeStore.editDict, DictType.article)
        loading = false
        runtimeStore.editDict = r
      }
      if (runtimeStore.editDict.articles.length) {
        selectArticle = runtimeStore.editDict.articles[0]
      }
    }
  }
}

onMounted(init)

function formClose() {
  if (isEdit) isEdit = false
  else router.back()
}

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

</script>

<template>
  <BasePage>
    <div class="card mb-0 h-[95vh] flex flex-col" v-if="showBookDetail">
      <div class="flex justify-between items-center relative">
        <BackIcon class="z-2" @click="$router.back"/>
        <div class="absolute text-2xl text-align-center w-full">{{ runtimeStore.editDict.name }}</div>
        <div class="flex">
          <BaseButton type="info" @click="isEdit = true">编辑</BaseButton>
          <BaseButton type="info" @click="router.push('batch-edit-article')">文章管理</BaseButton>
          <BaseButton :loading="studyLoading" @click="addMyStudyList">学习</BaseButton>
        </div>
      </div>
      <div class="text-lg  ">介绍：{{ runtimeStore.editDict.description }}</div>
      <div class="line my-3"></div>

      <div class="flex flex-1 overflow-hidden">
        <div class="left flex-[2] scroll p-0">
          <ArticleList
              v-if="runtimeStore.editDict.length"
              @title="handleCheckedChange"
              @click="handleCheckedChange"
              :list="runtimeStore.editDict.articles"
              :active-id="selectArticle.id">
            <template v-slot:suffix="{item,index}">
              <BaseIcon
                  v-if="!isArticleCollect(item)"
                  class="collect"
                  @click="toggleArticleCollect(item)"
                  title="收藏" icon="ph:star"/>
              <BaseIcon
                  v-else
                  class="fill"
                  @click="toggleArticleCollect(item)"
                  title="取消收藏" icon="ph:star-fill"/>
            </template>
          </ArticleList>
          <Empty v-else/>
        </div>
        <div class="right flex-[4] shrink-0 pl-4 overflow-auto">
          <div v-if="selectArticle.id">
            <div class="en-article-family title text-xl">
              <div class="text-center text-2xl">
                <audio :src="selectArticle.audioSrc" controls></audio>
              </div>
              <div class="text-center text-2xl">{{ selectArticle.title }}</div>
              <div class="text-2xl" v-if="selectArticle.text">
                <div class="my-5" v-for="t in selectArticle.text.split('\n\n')">{{ t }}</div>
              </div>
            </div>
            <div class="mt-2">
              <div class="text-center text-2xl">{{ selectArticle.titleTranslate }}</div>
              <div class="text-xl" v-if="selectArticle.textTranslate">
                <div class="my-5" v-for="t in selectArticle.textTranslate.split('\n\n')">{{ t }}</div>
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
        <div class="absolute text-2xl text-align-center w-full">{{ runtimeStore.editDict.id ? '修改' : '创建' }}书籍
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
