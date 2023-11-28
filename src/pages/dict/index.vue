<script setup lang="ts">

import DictManage from "@/pages/dict/DictManage.vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";

const router = useRoute()

onMounted(()=>{

})
</script>

<template>
  <div id="page">
    <DictManage/>
  </div>
</template>

<style scoped lang="scss">
#page {
  background: var(--color-main-bg);
  height: 100%;
  width: 100%;
}

</style>

