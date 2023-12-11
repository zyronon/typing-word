<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";
import router from "@/router.ts";

function goPractice(){
  router.push('/mobile-practice')
}
</script>

<template>
<div class="page home">
  <BaseButton @click="goPractice">继续</BaseButton>
</div>
</template>

<style scoped lang="scss">

</style>