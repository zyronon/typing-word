<script setup lang="ts">

import EditArticle from "@/pages/pc/article/components/EditArticle.vue";
import BaseIcon from "@/components/BaseIcon.vue";
</script>

<template>
  <div class="h-screen">
    <BaseIcon
        title="返回"
        @click="$router.back"
        icon="formkit:left"/>
    <EditArticle class="vue"></EditArticle>
  </div>

</template>

<style scoped lang="scss">

</style>
