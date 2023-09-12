<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {computed, inject} from "vue"
import WordList from "@/components/WordList.vue"
import {useBaseStore} from "@/stores/base.ts"

const store = useBaseStore()
const back: () => void = inject('back')
const stepIndex: any = inject('stepIndex')
const tabIndex: any = inject('tabIndex')
const isActive = computed(() => {
  return stepIndex.value === 2 && tabIndex.value === 0 && store.sideIsOpen
})

</script>

<template>
  <div class="chapter-detail page">
    <header>
      <Icon icon="octicon:arrow-right-24" @click="back" width="20" color="#929596"/>
      <div class="dict-name">16.</div>
    </header>
    <WordList :isActive="isActive" :list="store.chapter" :activeIndex="store.wordIndex"></WordList>
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