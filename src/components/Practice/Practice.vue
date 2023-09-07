<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue"
import {watch} from "vue";
import {usePracticeStore} from "@/components/Practice/usePracticeStore.ts";
import Footer from "@/components/Practice/Footer.vue";
import TypeWord from "@/components/Practice/TypeWord.vue";
import TypeArticle from "@/components/Practice/TypeArticle.vue";

const practiceStore = usePracticeStore()

watch(practiceStore, () => {
  if (practiceStore.inputNumber < 1) {
    return practiceStore.correctRate = -1
  }
  if (practiceStore.wrongNumber > practiceStore.inputNumber) {
    return practiceStore.correctRate = 0
  }
  practiceStore.correctRate = 100 - Math.trunc(((practiceStore.wrongNumber) / (practiceStore.inputNumber)) * 100)
})

</script>

<template>
  <div class="practice">
    <Toolbar/>
    <TypeArticle v-if="practiceStore.type === 'article'"/>
    <TypeWord v-else/>
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