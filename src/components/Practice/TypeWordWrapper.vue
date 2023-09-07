<script setup lang="ts">

import TypeWord from "@/components/TypeWord.vue"
import {onMounted, watch} from "vue"
import {$ref} from "vue/macros"
import Footer2 from "@/components/Footer2.vue"
import {usePracticeStore} from "@/components/Practice/usePracticeStore.ts"

const store = usePracticeStore()

watch(store.$state, () => {
  if (store.index < 1) {
    return store.correctRate = -1
  }
  if (store.wrongWords.length > store.index) {
    return store.correctRate = 0
  }
  store.correctRate = 100 - Math.trunc((store.wrongWords.length / store.index) * 100)
})

onMounted(() => {

})


</script>

<template>
  <TypeWord
      v-model:data="data"
  />
  <Footer2
      :total="data.words.length"
      :startDate="data.startDate"
      :inputNumber="data.index"
      :wrongNumber="data.wrongWords"
      :correctRate="data.correctRate"
  />
</template>

<style scoped lang="scss">

</style>