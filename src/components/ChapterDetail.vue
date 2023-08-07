<script setup lang="ts">
import {ArrowLeft} from '@icon-park/vue-next'
import {computed, inject} from "vue"
import WordList from "@/components/WordList.vue"
import {useBaseStore} from "@/stores/base.ts"

const store = useBaseStore()
const back = inject('back')
const stepIndex = inject('stepIndex')
const tabIndex = inject('tabIndex')
const isActive = computed(() => {
  return stepIndex.value === 2 && tabIndex.value === 0 && store.sideIsOpen
})

</script>

<template>
  <div class="chapter-detail page">
    <header>
      <arrow-left @click="back" theme="outline" size="20" fill="#929596" :strokeWidth="2"/>
      <div class="dict-name">16.</div>
    </header>
    <WordList :active="isActive" :word-list="store.chapter" :index="store.wordIndex"></WordList>
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