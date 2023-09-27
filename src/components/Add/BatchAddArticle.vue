<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import AddArticle2 from "@/components/Add/AddArticle2.vue";
import {$ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {DefaultArticle} from "@/types.ts";
import {onMounted, watch} from "vue";
import {splitCNArticle, splitEnArticle} from "@/hooks/article.ts";

const base = useBaseStore()

let articleData = $ref({
  article: cloneDeep(DefaultArticle),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})

onMounted(() => {
  // splitEnArticle('')
  splitCNArticle('')
})
</script>

<template>
  <div id="BatchAddArticle">
    <AddArticle2/>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

#BatchAddArticle {
  width: 100vw;
  height: 100vh;
  display: flex;
  color: black;
}
</style>