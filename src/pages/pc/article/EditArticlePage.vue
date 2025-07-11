<script setup lang="ts">

import EditArticle2 from "@/pages/pc/article/components/EditArticle2.vue";
import BaseIcon from "@/components/BaseIcon.vue";
</script>

<template>
  <div class="h-screen">
    <BaseIcon
        title="返回"
        @click="$router.back"
        icon="formkit:left"/>
    <EditArticle2 class="vue"></EditArticle2>
  </div>

</template>

<style scoped lang="scss">

</style>
