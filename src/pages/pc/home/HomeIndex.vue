<script setup lang="ts">
import {splitEnArticle2} from "@/hooks/article.ts";
import test from '../../test/test.vue'

function test1() {
  splitEnArticle2(
      `While it is yet to be seen what direction the second Trump administration will take globally in its China policy, VOA traveled to the main island of Mahe in Seychelles to look at how China and the U.S. have impacted the country, and how each is fairing in that competition for influence there.
      `)
}

function test2() {
  splitEnArticle2(
      `
      Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. I cant hear a word! I said angrily.
      Its none of your business, the young man said rudely. This is a private conversation!
      `)
}
</script>

<template>
  <div class="word flex center h-screen ">
    <El-Button @click="test1">test1</El-Button>
    <El-Button @click="test2">test2</El-Button>
    <test/>
  </div>
</template>
