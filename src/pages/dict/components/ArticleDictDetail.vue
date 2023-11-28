<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import Empty from "@/components/Empty.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import ArticleList3 from "@/components/list/ArticleList3.vue";
import {$ref} from "vue/macros";
import VirtualWordList2 from "@/components/list/VirtualWordList2.vue";
import {cloneDeep} from "lodash-es";
import {Article, DefaultArticle, TranslateType} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import EditBatchArticleModal from "@/components/article/EditBatchArticleModal.vue";

const runtimeStore = useRuntimeStore()
let chapterIndex = $ref(-1)
let article: Article = $ref(cloneDeep(DefaultArticle))

function handleCheckedChange(val) {
  chapterIndex = val.index
  article = val.data
}

function delArticle(index: number) {
  runtimeStore.editDict.articles.splice(index, 1)

  if (runtimeStore.editDict.articles.length) {
    if (chapterIndex === index) {
      article = runtimeStore.editDict.articles[index]
    }
  } else {
    article = cloneDeep(DefaultArticle)
  }

  ElMessage.success('删除成功！')
}

</script>

<template>
  <div class="article-detail">
    <div class="chapter-list">
      <div class="header">
        <div class="common-title">
          <span>文章管理</span>
          <div class="options">
            <BaseIcon
                @click="emitter.emit(EventKey.openArticleListModal)"
                icon="fluent:add-20-filled"
                title="新增章节"/>
            <span>{{ runtimeStore.editDict.articles.length }}篇</span>
          </div>
        </div>
      </div>
      <div class="wrapper">
        <ArticleList3
            v-if="runtimeStore.editDict.articles.length"
            :list="runtimeStore.editDict.articles"
            @click="handleCheckedChange"
            :active-index="chapterIndex"
        >
          <template v-slot:prefix="{data,index}">
            <input type="radio" :checked="chapterIndex === index">
          </template>
          <template v-slot="{data,index}">
            <BaseIcon
                class-name="del"
                @click="emitter.emit(EventKey.openArticleListModal,data)"
                title="编辑"
                icon="tabler:edit"/>
            <BaseIcon
                class-name="del"
                @click="delArticle(index)"
                title="删除"
                icon="solar:trash-bin-minimalistic-linear"/>
          </template>
        </ArticleList3>
        <Empty v-else/>
      </div>
    </div>
    <div class="article-content word-font-family">
      <div class="title">
        <div>{{ article.title }}</div>
      </div>
      <div class="text" v-if="article.text">
        <div class="sentence" v-for="t in article.text.split('\n')">{{ t }}</div>
      </div>
      <Empty v-else/>
    </div>
    <div class="article-content">
      <div class="title">
        <div>{{ article.titleTranslate }}</div>
      </div>
      <div class="text" v-if="article.textCustomTranslate">
        {{ article.textCustomTranslate }}
      </div>
      <Empty v-else/>
    </div>
  </div>
  <EditBatchArticleModal/>
</template>

<style scoped lang="scss">
.article-detail {
  width: 100%;
  height: 100%;
  display: flex;
  gap: var(--space);

  .box {
    background: white;
    border-radius: 10rem;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    padding-bottom: var(--space);
    display: flex;
    flex-direction: column;
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
      text-align: center;
      margin-bottom: var(--space);
      font-size: 24rem;
    }

    .text {
      //white-space: pre-wrap;
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