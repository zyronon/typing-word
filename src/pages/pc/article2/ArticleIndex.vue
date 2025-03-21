<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BasePage from "@/pages/pc/components/BasePage.vue";

const base = useBaseStore()
const router = useRouter()

function clickEvent(e) {
  console.log('e', e)
}
</script>

<template>
  <BasePage>
    <article class="">
      <div class="text-align-center text-xl font-bold">One good turn deserves another</div>
      <div>
        I was having dinner at a restaurant when Tony Steele came in. Tony worked in a lawyer's office years ago, but he is now working at a bank. He gets a good salary, but he always borrows money from his friends and never pays it back. Tony saw me and came and sat at the same table. He has never borrowed money from me. While he was eating, I asked him to lend me twenty pounds. To my surprise, he gave me the money immediately. I have never borrowed any money from you, Tony said, so now you can pay for my dinner!
      </div>
    </article>
  </BasePage>
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