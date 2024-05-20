<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import DictListPanel2 from "./DictListPanel2.vue";
import {Icon} from '@iconify/vue'
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";

const base = useBaseStore()
const router = useRouter()

function clickEvent(e) {
  console.log('e', e)
}
</script>

<template>
  <div class="word flex justify-center ">
    <div class="container2">
      <DictListPanel2
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  @apply rounded-xl bg-white p-4 mt-5;
}

.center {
  @apply flex justify-center items-center;
}

.title {
  @apply text-lg font-medium;
}
</style>