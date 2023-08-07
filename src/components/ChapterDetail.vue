<script setup lang="ts">
import {ArrowLeft} from '@icon-park/vue-next'
import {inject} from "vue"
import WordList from "@/components/WordList.vue"
import {useBaseStore} from "@/stores/base.ts"

const store = useBaseStore()
const back = inject('back')

</script>

<template>
  <div class="chapter-detail page">
    <header>
      <arrow-left @click="back" theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
      <div class="dict-name">16.</div>
    </header>
    <WordList :word-list="store.chapter" :index="store.wordIndex"></WordList>
  </div>
</template>

<style scoped lang="scss">
.chapter-wrapper {
  header {
    display: flex;
    align-items: center;
    gap: 10rem;
    margin-bottom: 10rem;

    .dict-name {
      font-size: 26rem;
    }
  }
}
</style>