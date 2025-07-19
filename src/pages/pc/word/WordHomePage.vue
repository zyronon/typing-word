<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {_getAccomplishDate, _getAccomplishDays, useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {Dict, DictResource, getDefaultDict} from "@/types.ts";
import {onMounted} from "vue";
import {getCurrentStudyWord} from "@/hooks/dict.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {EventKey, useEvent} from "@/utils/eventBus.ts";
import DictListPanel from "@/pages/pc/components/DictListPanel.vue";
import DictGroup from "@/pages/pc/components/list/DictGroup.vue";
import {cloneDeep} from "lodash-es";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {getArticleBookDataByUrl} from "@/utils/article.ts";

const store = useBaseStore()
const router = useRouter()
const {nav} = useNav()
const runtimeStore = useRuntimeStore()

function clickEvent(e) {
  console.log('e', e)
}

let currentStudy = $ref({
  new: [],
  review: [],
  write: []
})

onMounted(() => {
  if (!currentStudy.new.length) {
    currentStudy = getCurrentStudyWord()
  }
})

useEvent(EventKey.changeDict, () => {
  currentStudy = getCurrentStudyWord()
})

function study() {
  nav('study-word', {}, currentStudy)
}

let show = $ref(false)
let tempPerDayStudyNumber = $ref(0)

function changePerDayStudyNumber() {
  store.sdict.perDayStudyNumber = tempPerDayStudyNumber
  currentStudy = getCurrentStudyWord()
}

function selectDict(e) {
  console.log(e)
}

async function goDictDetail2(val: Dict) {
  runtimeStore.editDict = cloneDeep(val)
  nav('edit-word-dict')
}

async function getBookDetail(val: DictResource) {
  let r = await getArticleBookDataByUrl(val)
  runtimeStore.editDict = cloneDeep(r)
  nav('book-detail')
}

let dictListRef = $ref<any>()

function addDict() {

}

</script>

<template>
  <BasePage>
    <div class="card flex gap-10">
      <div class="flex-1 flex flex-col gap-2">
        <div class="flex">
          <div class="bg-slate-200 px-3 h-14 rounded-md flex items-center">
            <span class="text-xl font-bold">{{ store.sdict.name }}</span>
            <BaseIcon
                title="切换词典"
                icon="gg:arrows-exchange"
                class="ml-4"
                @click="router.push('/dict')"/>
          </div>
        </div>
        <div class="">
          <div class="text-sm flex justify-between">
            已学习{{ store.currentStudyProgress }}%
            <span>{{ store.sdict.lastLearnIndex }} / {{
                store.sdict.words.length
              }}</span>
          </div>
          <el-progress class="mt-1" :percentage="store.currentStudyProgress" :show-text="false"></el-progress>
        </div>
        <div class="text-sm text-align-end">
          预计完成日期：{{ _getAccomplishDate(store.sdict.words.length, store.sdict.perDayStudyNumber) }}
        </div>
      </div>

      <div class="w-3/10 flex flex-col justify-evenly">
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

      <div class="flex flex-col items-end justify-around">
        <div class="flex gap-1 items-center">
          每日目标
          <div
              style="color:#ac6ed1;"
              @click="show = true;tempPerDayStudyNumber = store.sdict.perDayStudyNumber"
              class="bg-slate-200 px-2 h-10 flex center text-2xl rounded cursor-pointer">
            {{ store.sdict.perDayStudyNumber }}
          </div>
          个单词
        </div>
        <div class="rounded-xl bg-slate-800 flex items-center gap-2 py-3 px-5 text-white cursor-pointer"
             @click="study">
          <span>开始学习</span>
          <Icon icon="icons8:right-round" class="text-2xl"/>
        </div>
      </div>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">我的词典</div>
        <div class="color-blue cursor-pointer" @click="addDict">创建个人词典</div>
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <div class="book" v-for="item in store.word.bookList" @click="goDictDetail2(item)">
          <span>{{ item.name }}</span>
          <div class="absolute bottom-4 right-4">{{ item.words.length }}个词</div>
        </div>
        <div class="book" @click="dictListRef.startSearch()">
          <div class="center h-full">
            <Icon
                width="40px"
                icon="fluent:add-20-filled"/>
          </div>
        </div>
      </div>
    </div>

    <DictListPanel
        ref="dictListRef"
        @selectDict="selectDict"
    />

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

    <Dialog v-model="show"
            title="每日目标"
            :footer="true"
            @ok="changePerDayStudyNumber"
    >
      <div class="target-modal">
        <div class="center text-2xl gap-2">
          <span class="text-3xl" style="color:rgb(176,116,211)">{{
              tempPerDayStudyNumber
            }}</span>个单词
        </div>
        <div class="center text-sm" :style="{opacity:tempPerDayStudyNumber === 20?1:0}">
          推荐
        </div>
        <el-slider :min="10"
                   :step="10"
                   show-stops :marks="{10: '10',200: '200'}"
                   size="small"
                   class="my-6"
                   :max="200"
                   v-model="tempPerDayStudyNumber"
        />
        <div class="flex gap-2 mb-2 mt-10 items-center">
          <div>预计</div>
          <span class="text-2xl"
                style="color:rgb(176,116,211)">{{
              _getAccomplishDays(store.sdict.words.length, tempPerDayStudyNumber)
            }}</span>天完成学习
        </div>
        <div>
          要达到最佳效果，就坚持每天学习。每天学20个单词是最理想的，但就算再忙的时候每天学10个也有助你养成良好的学习习惯。
        </div>
      </div>
    </Dialog>

  </BasePage>
</template>

<style scoped lang="scss">
.target-modal {
  width: 30rem;
  padding: var(--space);
  padding-top: 0;
  color: var(--color-font-1);

}
</style>
