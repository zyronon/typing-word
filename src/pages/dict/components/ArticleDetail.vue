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

const runtimeStore = useRuntimeStore()
let chapterIndex = $ref(0)
let article: Article = $ref(cloneDeep(DefaultArticle))

function handleCheckedChange(val) {
  chapterIndex = val.index
  article = val.data
}


</script>

<template>
  <div class="article-detail">
    <div class="chapter-list">
      <div class="header">
        <div class="common-title">
          <span>章节管理</span>
          <div class="options">
            <BaseIcon
                icon="fluent:add-20-filled"
                title="新增章节"/>
          </div>
        </div>
        <div class="select">
          <BaseButton size="small" @click="showAllocationChapterDialog = true">智能分配</BaseButton>
          <span>{{ runtimeStore.editDict.articles.length }}章</span>
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
                @click="emit('edit',{data,index})"
                title="编辑"
                icon="tabler:edit"/>
            <BaseIcon
                class-name="del"
                @click="del({data,index})"
                title="删除"
                icon="solar:trash-bin-minimalistic-linear"/>
          </template>
        </ArticleList3>
        <template v-if="false">
          <RecycleScroller
              v-if="runtimeStore.editDict.articles.length"
              ref="chapterListRef"
              style="height: 100%;"
              :items="runtimeStore.editDict.articles"
              :item-size="63"
              key-field="id"
              v-slot="{ item,index }"
          >
            <div style="padding: 0 15rem;">
              <div class="common-list-item"
                   :class="chapterIndex === item.id && 'active'"
                   @click="handleChangeCurrentChapter(item.id)">
                <div class="flex gap10 flex1 ">
                  <input type="radio" :checked="chapterIndex === item.id">
                  <div class="item-title flex flex1 space-between">
                    <span>{{ index + 1 }}.</span>
                    <span>{{ item.title }}</span>
                  </div>
                </div>
                <div class="right">
                  <BaseIcon
                      class-name="del"
                      @click="delWordChapter(item.id)"
                      title="移除"
                      icon="solar:trash-bin-minimalistic-linear"/>
                </div>
              </div>
            </div>
          </RecycleScroller>
          <Empty v-else/>
        </template>
      </div>
    </div>
    <div class="article-content">
      <div class="title">①原文</div>
      <div class="item">
        <div class="label">标题：</div>
        <p>{{ article.title }}</p>
      </div>
      <div class="item basic">
        <div class="label">正文：</div>
        <p>
          {{ article.text }}
        </p>
      </div>
    </div>
    <div class="article-content">
      <div class="title">①原文</div>
      <div class="item">
        <div class="label">标题：</div>
        <p>{{ article.titleTranslate }}</p>
      </div>
      <div class="item basic">
        <div class="label">正文：</div>
        <p>
          {{ article.textCustomTranslate }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.article-detail {
  width: 100%;
  height: 100%;
  display: flex;
  gap: var(--space);

  .chapter-list {
    width: 400rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: white;
    border-radius: 10rem;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    padding-bottom: var(--space);

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
      overflow: hidden;
    }
  }

  .article-content {
    flex: 1;
    overflow: auto;
  }
}
</style>