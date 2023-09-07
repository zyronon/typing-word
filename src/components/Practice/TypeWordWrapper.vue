<script setup lang="ts">

import TypeWord from "@/components/TypeWord.vue"
import {onMounted} from "vue"
import {$ref} from "vue/macros"
import {watch} from "vue/dist/vue"
import Footer2 from "@/components/Footer2.vue"

let data = $ref({
  index: -1,
  words: [],
  wrongWords: [],
  originWrongWords: [],
  repeatNumber: 0,
  startDate: Date.now(),
  correctRate: -1,
})

watch(data, () => {
  if (data.index < 1) {
    return data.correctRate = -1
  }
  if (data.wrongWords.length > data.index) {
    return data.correctRate = 0
  }
  data.correctRate = 100 - Math.trunc((data.wrongWords.length / data.index) * 100)
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