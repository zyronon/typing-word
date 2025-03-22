<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import {enArticle} from "@/assets/dictionary.ts";
import BasePage from "@/pages/pc/components/BasePage.vue";

const base = useBaseStore()
const router = useRouter()

function clickEvent(e) {
  console.log('e', e)
}
</script>

<template>
  <BasePage>
    <div class="flex gap-6">
      <div class="card w-1/4 flex flex-col">
        <div class="title">
          我的词典
        </div>
        <div class="grid flex-1 flex gap-5 mt-4">
          <div class="p-4 flex-1 rounded-md bg-slate-200 relative">
            <span>收藏</span>
            <div class="absolute bottom-4 right-4">3篇</div>
          </div>
        </div>
        <div class="grid flex-1 flex gap-5 mt-4">
          <div class="p-4 flex-1 rounded-md bg-slate-200 relative">
            <span>添加</span>
            <div class="absolute bottom-4 right-4">3篇</div>
          </div>
        </div>
      </div>
      <div class="w-3/4">
        <div class="card ">
          <div class="flex justify-between items-center">
            <div class="bg-slate-200 p-3 rounded-md cursor-pointer flex items-center">
              <span class="text-lg font-bold">{{ base.currentArticleDict.name }}</span>
              <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
              <Icon icon="uil:setting" class="text-2xl ml-2"/>
            </div>
            <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                 @click="router.push('/learn-article')">
              开始学习
            </div>
          </div>
          <div class="mt-5 text-sm">已学习5555个单词的1%</div>
          <el-progress class="mt-1" :percentage="80" :show-text="false"></el-progress>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <div class="title">文章</div>
      <div class="mt-4 flex gap-4">
        <div
            class="bg-white rounded-md p-4 h-40 w-30 relative cursor-pointer"
            v-for="dict in enArticle"
        >
          <div class="top">
            <div class="name">{{ dict.name }}</div>
            <div class="desc">{{ dict.description }}</div>
          </div>
          <div class="absolute bottom-4 right-4">{{ dict.length }}篇</div>
        </div>
      </div>
    </div>
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