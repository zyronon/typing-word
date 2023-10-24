<script setup lang="ts">
import {$ref} from "vue/macros";
import TypingArticle from "@/components/Practice/PracticeArticle/TypingArticle.vue";

let tabIndex = $ref(0)

</script>

<template>
  <div class="swiper-wrapper content">
    <div class="swiper-list" :class="`step${tabIndex}`">
      <div class="swiper-item">
        <TypingArticle/>
      </div>
      <div class="swiper-item">
        <TypingArticle/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>