<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";
import {useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {getDefaultDict} from "@/types.ts";
import {onMounted, watch} from "vue";
import {getCurrentStudyWord} from "@/hooks/dict.ts";
import {usePracticeStore} from "@/stores/practice.ts";

const store = useBaseStore()
const statStore = usePracticeStore()
const router = useRouter()
const {nav} = useNav()

function clickEvent(e) {
  console.log('e', e)
}

let showMore = $ref(false)
const otherWordDictList = $computed(() => {
  if (showMore) return store.otherWordDictList
  else return store.otherWordDictList.slice(0, 4)
})


let currentStudy = $ref({
  new: [],
  review: [],
  write: []
})
watch(() => store.load, n => {
  if (n) {
    currentStudy = getCurrentStudyWord()
  }
})

onMounted(() => {
  if (!currentStudy.new.length) {
    currentStudy = getCurrentStudyWord()
  }
})

function study() {
  nav('study-word', {}, currentStudy)
}

</script>

<template>
  <BasePage>
    <div class="card flex gap-10 items-center">
      <div class="flex-1">
        <div class="flex gap-5">
          <div class="bg-slate-200 px-3 h-14 rounded-md flex items-center">
            <span class="text-xl font-bold">{{ store.currentStudyWordDict.name }}</span>
            <BaseIcon
                title="切换词典"
                icon="gg:arrows-exchange"
                class="ml-4"
                @click="router.push('/dict')"/>
          </div>
          <div class="flex-1 flex flex-col justify-end items-end">
            <div class="flex gap-3">
              <div class="">
                <div class="title">
                  每日目标
                </div>
                <div class="flex">
                  <div style="color:#ac6ed1;" class="cursor-pointer" v-if="false">
                    更改目标
                  </div>
                  <div class="text-xs">学习 {{ store.currentStudy.word.perDayStudyNumber }} 个单词</div>
                </div>
              </div>
              <div class="bg-slate-200 w-10 h-10 flex center text-2xl rounded">
                {{ store.currentStudy.word.perDayStudyNumber }}
              </div>
            </div>
            <div class="mt-2">
              <div>预计完成日期：2024-04-01</div>
            </div>
          </div>
        </div>
        <div class="mt-2">
          <div class="text-sm flex justify-between">
            已学习{{ store.currentStudyWordProgress }}%
            <span>{{ store.currentStudy.word.lastLearnIndex }} /{{ store.currentStudyWordDict.words.length }}词</span>
          </div>
          <el-progress class="mt-1" :percentage="store.currentStudyWordProgress" :show-text="false"></el-progress>
        </div>
      </div>

      <div class="w-3/10 flex flex-col gap-4">
        <div class="center text-xl">今日任务</div>
        <div class="flex">
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ currentStudy.new.length }}</div>
            <div class="text">新词数</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ currentStudy.review.length }}</div>
            <div class="text">复习数</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{
                currentStudy.new.length + currentStudy.review.length + currentStudy.write.length
              }}
            </div>
            <div class="text">默写数</div>
          </div>
        </div>
      </div>
      <div class="">
        <div class="rounded-xl bg-slate-800 flex items-center gap-2 py-3 px-5 text-white cursor-pointer"
             @click="study">
          <span>开始学习</span>
          <Icon icon="icons8:right-round" class="text-2xl"/>
        </div>
      </div>
    </div>

    <div class="card  flex flex-col">
      <div class="title">
        我的词典
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <div class="my-dict" @click="nav('edit-word-dict',{type:0})">
          <span>收藏</span>
          <div class="absolute bottom-4 right-4">{{ store.collectWord.length }}个词</div>
        </div>
        <div class="my-dict" @click="nav('edit-word-dict',{type:1})">
          <span>错词本</span>
          <div class="absolute bottom-4 right-4">{{ store.wrong2.length }}个词</div>
        </div>
        <div class="my-dict" @click="nav('edit-word-dict',{type:2})">
          <span>简单词</span>
          <div class="absolute bottom-4 right-4">{{ store.simple2.length }}个词</div>
        </div>
        <div class="my-dict" @click="nav('edit-word-dict',{type:3})">
          <span>已掌握</span>
          <div class="absolute bottom-4 right-4">{{ store.master.length }}个词</div>
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
              <BaseIcon title="删除" icon="hugeicons:delete-02" @click="store.delWordDict(i)"/>
              <BaseIcon title="学习" icon="nonicons:go-16" @click="store.changeWordDict(getDefaultDict(i))"/>
            </div>
          </div>
          <div class="mt-5 text-sm">已学习5555个单词的1%</div>
          <el-progress class="mt-1" :percentage="80" color="white" :show-text="false"></el-progress>
        </div>
      </div>
      <div class="flex justify-center mt-2 text-2xl" v-if="store.otherWordDictList.length > 4">
        <BaseIcon @click="showMore = !showMore" v-if="showMore" icon="mingcute:up-line"/>
        <BaseIcon @click="showMore = !showMore" v-else icon="mingcute:down-line"/>
      </div>
    </div>

    <div class="card">
      <div class="title">
        已学习 <span class="text-3xl">159</span> 天
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
  @apply rounded-xl p-4 mt-5;
  background: var(--color-second-bg);
}

.center {
  @apply flex justify-center items-center;
}

.title {
  @apply text-lg font-medium;
}

.my-dict {
  @apply p-4 rounded-md bg-slate-200 relative cursor-pointer h-40;
}
</style>