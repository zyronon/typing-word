<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";
import {useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {watch} from "vue";
import {getDefaultDict} from "@/types.ts";

const base = useBaseStore()
const router = useRouter()
const {nav} = useNav()

function clickEvent(e) {
  console.log('e', e)
}

let showMore = $ref(false)
const otherWordDictList = $computed(() => {
  if (showMore) return base.otherWordDictList
  else return base.otherWordDictList.slice(0, 4)
})
</script>

<template>
  <BasePage>
    <div class="flex gap-6">
      <div class="card w-1/2 flex flex-col">
        <div class="title">
          我的词典
        </div>
        <div class="grid flex-1 flex gap-5 mt-4">
          <div class="my-dict" @click="nav('edit-word-dict',{type:0})">
            <span>收藏</span>
            <div class="absolute bottom-4 right-4">{{ base.collectWord.length }}个词</div>
          </div>
          <div class="my-dict" @click="nav('edit-word-dict',{type:1})">
            <span>错词本</span>
            <div class="absolute bottom-4 right-4">{{ base.wrong2.length }}个词</div>
          </div>
          <div class="my-dict" @click="nav('edit-word-dict',{type:2})">
            <span>简单词</span>
            <div class="absolute bottom-4 right-4">{{ base.simple2.length }}个词</div>
          </div>
        </div>
      </div>
      <div class="w-1/2">
        <div class="card ">
          <div class="flex justify-between items-center">
            <div class="bg-slate-200 p-3 rounded-md cursor-pointer flex items-center">
              <span class="text-lg font-bold">{{ base.currentStudyWordDict.name }}</span>
              <BaseIcon
                  title="切换词典"
                  icon="gg:arrows-exchange"
                  class="ml-2"
                  @click="router.push('/dict')"/>
            </div>
            <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                 @click="router.push('study-word')">
              开始学习
            </div>
          </div>
          <div class="mt-5 text-sm">已学习{{
              base.currentStudyWordDict.words.length
            }}个单词的{{ base.currentStudyWordProgress }}%
          </div>
          <el-progress class="mt-1" :percentage="base.currentStudyWordProgress" :show-text="false"></el-progress>
        </div>
        <div class="card flex gap-3">
          <div class="bg-slate-200 w-10 h-10 flex center text-2xl rounded">
            0
          </div>
          <div class="flex-1">
            <div class="flex justify-between">
              <div class="title">
                每日目标
              </div>
              <div style="color:#ac6ed1;" class="cursor-pointer">
                更改目标
              </div>
            </div>
            <div class="mt-2 text-xs">学习 {{ base.currentStudy.word.perDayStudyNumber }} 个单词</div>
            <el-progress class="flex-1 mt-1" :percentage="80" :show-text="false"></el-progress>
          </div>
        </div>
      </div>
    </div>

    <div class="card" v-if="otherWordDictList.length">
      <div class="flex justify-between">
        <div class="title">
          其他学习词典
        </div>
        <BaseIcon icon="ic:round-add"
                  title="切换词典"
                  @click="router.push('/dict')"/>
      </div>
      <div class="grid grid-cols-2 gap-6 mt-5 ">
        <div class=" p-4 rounded-md justify-between items-center bg-slate-200 " v-for="i in otherWordDictList">
          <div class="flex justify-between w-full">
            <span>{{ i.name }}</span>
            <div class="text-2xl ml-2 flex gap-4">
              <BaseIcon title="删除" icon="hugeicons:delete-02" @click="base.delWordDict(i)"/>
              <BaseIcon title="学习" icon="nonicons:go-16" @click="base.changeWordDict(getDefaultDict(i))"/>
            </div>
          </div>
          <div class="mt-5 text-sm">已学习5555个单词的1%</div>
          <el-progress class="mt-1" :percentage="80" color="white" :show-text="false"></el-progress>
        </div>
      </div>
      <div class="flex justify-center mt-2 text-2xl" v-if="base.otherWordDictList.length > 4">
        <BaseIcon @click="showMore = !showMore" v-if="showMore" icon="mingcute:up-line"/>
        <BaseIcon @click="showMore = !showMore" v-else icon="mingcute:down-line"/>
      </div>
    </div>

    <div class="card">
      <div class="title">
        学习记录
      </div>
      <div class="center">
        <ActivityCalendar
            :data="[{ date: '2023-05-22', count: 5 }]"
            :width="40"
            :height="7"
            :cellLength="16"
            :cellInterval="8"
            :fontSize="12"
            :showLevelFlag="false"
            :showWeekDayFlag="false"
            :clickEvent="clickEvent"
        />
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

.my-dict {
  @apply p-4 flex-1 rounded-md bg-slate-200 relative cursor-pointer;
}
</style>