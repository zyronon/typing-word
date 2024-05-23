<script setup lang="ts">

import BasePage from "@/pages/pc/components/BasePage.vue";
import WordDictDetail from "@/pages/pc/dict/components/WordDictDetail.vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
onMounted(() => {
  console.log('r', route.query.type)
})
</script>

<template>
  <BasePage>
    <WordDictDetail/>
  </BasePage>
</template>

<style scoped lang="scss">

</style>