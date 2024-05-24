<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import DictListPanel2 from "./DictListPanel2.vue";
import {useRouter} from "vue-router";
import BasePage from "@/pages/pc/components/BasePage.vue";

const base = useBaseStore()
const router = useRouter()

</script>

<template>
  <BasePage>
    <DictListPanel2
    />
  </BasePage>
</template>

<style scoped lang="scss">
</style>