<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import DictListPanel from "@/pages/pc/components/DictListPanel.vue";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";

const base = useBaseStore()
const router = useRouter()

function clickEvent(e) {
  console.log('e', e)
}
</script>

<template>
  <div class="word flex justify-center ">
    <div class="w-5/10 pt-5">
      <div class="flex gap-6">
        <div class="card w-1/2 flex flex-col">
          <div class="title">
            我的词典
          </div>
          <div class="grid flex-1 flex gap-5 mt-4">
            <div class="p-4 flex-1 rounded-md bg-slate-200 relative" v-for="i in 3">
              <span>收藏</span>
              <div class="absolute bottom-4 right-4">333个词</div>
            </div>
          </div>
        </div>
        <div class="w-1/2">
          <div class="card ">
            <div class="flex justify-between items-center">
              <div class="bg-slate-200 p-3 rounded-md cursor-pointer flex items-center">
                <span class="text-lg font-bold">{{ base.currentDict.name }}</span>
                <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
                <Icon icon="uil:setting" class="text-2xl ml-2"/>
              </div>
              <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                   @click="router.push('/practice')">
                开始学习
              </div>
            </div>
            <div class="mt-5 text-sm">已学习5555个单词的1%</div>
            <el-progress class="mt-1" percentage="80" :show-text="false"></el-progress>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between">
          <div class="title">
            其他学习词典
          </div>
          <BaseIcon icon="ic:round-add" @click="router.push('/dict')"/>
        </div>
        <div class="grid grid-cols-2 gap-6 mt-5 ">
          <div class=" p-4 rounded-md justify-between items-center bg-slate-200 " v-for="i in 3">
            <div class="flex justify-between w-full">
              <span>{{ base.currentDict.name }}</span>
              <div class="text-2xl ml-2 flex gap-4">
                <Icon icon="hugeicons:delete-02"/>
                <Icon icon="nonicons:go-16"/>
              </div>
            </div>
            <div class="mt-5 text-sm">已学习5555个单词的1%</div>
            <el-progress class="mt-1" percentage="80" color="white" :show-text="false"></el-progress>
          </div>
        </div>
        <div class="flex justify-center mt-2 text-2xl">
          <Icon icon="mingcute:down-line"/>
        </div>
      </div>
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