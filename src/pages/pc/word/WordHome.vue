<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import DictListPanel from "@/pages/pc/components/DictListPanel.vue";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";

const base = useBaseStore()
const router = useRouter()

function clickEvent(e) {
  console.log('e', e)
}
</script>

<template>
  <div class="word flex justify-center overflow-auto	">
    <div class="w-3/5">

      <div class="card">
        <div class="title">
          当前学习
        </div>
        <div class="mt-4 flex justify-between items-center">
          <div class="bg-slate-200 p-5 rounded-md cursor-pointer flex items-center">
            <span>{{ base.currentDict.name }}</span>
            <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
          </div>
          <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
               @click="router.push('/practice')">
            开始学习
          </div>
        </div>
      </div>
      <div class="card">
        <div class="title">
          其他学习词典
        </div>
        <div class="flex flex-wrap">
          <div class="flex w-1/2 justify-between items-center">
            <div class="bg-slate-200 p-5 rounded-md cursor-pointer flex items-center">
              <span>{{ base.currentDict.name }}</span>
              <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
            </div>
            <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                 @click="router.push('/practice')">
              开始学习
            </div>
          </div>
          <div class="flex w-1/2 justify-between items-center">
            <div class="bg-slate-200 p-5 rounded-md cursor-pointer flex items-center">
              <span>{{ base.currentDict.name }}</span>
              <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
            </div>
            <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                 @click="router.push('/practice')">
              开始学习
            </div>
          </div>
          <div class="flex w-1/2 justify-between items-center">
            <div class="bg-slate-200 p-5 rounded-md cursor-pointer flex items-center">
              <span>{{ base.currentDict.name }}</span>
              <Icon icon="gg:arrows-exchange" class="text-2xl ml-2"/>
            </div>
            <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
                 @click="router.push('/practice')">
              开始学习
            </div>
          </div>
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

      <DictListPanel
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  @apply rounded-xl bg-white p-5 mt-10 ;
}

.center {
  @apply flex justify-center items-center;
}

.title {
  @apply text-xl font-bold;
}
</style>