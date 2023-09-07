<script setup lang="ts">

import Toolbar from "@/components/Toolbar/Toolbar.vue"
import TypeArticle from "@/components/TypeArticle.vue"


</script>

<template>
  <div class="practice">
    <Toolbar/>
    <TypeArticle/>
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