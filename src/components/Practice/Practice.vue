<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue"
import {onMounted, watch} from "vue";
import {usePracticeStore} from "@/components/Practice/usePracticeStore.ts";
import Footer from "@/components/Practice/Footer.vue";
import TypeWord from "@/components/Practice/TypeWord.vue";
import TypeArticle from "@/components/Practice/TypeArticle.vue";
import {useBaseStore} from "@/stores/base.ts";

const practiceStore = usePracticeStore()
const store = useBaseStore()

watch(practiceStore, () => {
  if (practiceStore.inputNumber < 1) {
    return practiceStore.correctRate = -1
  }
  if (practiceStore.wrongNumber > practiceStore.inputNumber) {
    return practiceStore.correctRate = 0
  }
  practiceStore.correctRate = 100 - Math.trunc(((practiceStore.wrongNumber) / (practiceStore.inputNumber)) * 100)
})
let wordData = $ref({
  words: [],
  index: -1
})

let articleData = $ref({

})
watch(()=>store.load,n=>{
  if (n){
    wordData.words = store.chapter
    wordData.index = 0
  }
})

onMounted(() => {

})


</script>

<template>
  <div class="practice">
    <Toolbar/>
    <TypeArticle v-if="practiceStore.type === 'article'"/>
    <TypeWord
        :words="wordData.words"
        :index="wordData.index"
        v-else/>
    <Footer/>
  </div>
</template>

<style scoped lang="scss">
.practice {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>