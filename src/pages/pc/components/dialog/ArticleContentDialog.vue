<script setup lang="ts">

import Dialog from "@/pages/pc/components/dialog/Dialog.vue";

import {onMounted, onUnmounted, watch} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import WordList from "@/pages/pc/components/list/WordList.vue";
import {Article, DefaultArticle} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import Empty from "@/components/Empty.vue";
import {getTranslateText} from "@/hooks/article.ts";

let show = $ref(false)
let loading = $ref(false)
const runtimeStore = useRuntimeStore()
let article: Article = $ref(cloneDeep(DefaultArticle))

onMounted(() => {
  emitter.on(EventKey.openArticleContentModal, (val: any) => {
    show = true
    article = cloneDeep(val)
  })
})

onUnmounted(() => {
  emitter.off(EventKey.openArticleContentModal)
})

</script>

<template>
  <Dialog
      :header="false"
      v-model="show">
    <div class="content">
      <div class="article-content">
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
        <div class="text" v-if="getTranslateText(article).length">
          <div class="sentence" v-for="t in getTranslateText(article)">{{ t }}</div>
        </div>
        <Empty v-else/>
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
@import "@/assets/css/style";

.content {
  width: 70vw;
  height: 75vh;
  display: flex;
  gap: var(--space);
  padding: var(--space);
  color: var(--color-font-1);

  .article-content {
    flex: 1;
    overflow: hidden;
    font-size: 20rem;
    display: flex;
    flex-direction: column;

    .title {
      text-align: center;
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
