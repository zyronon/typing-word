<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {_getAccomplishDate, _getAccomplishDays, _getDictDataByUrl, useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {Dict, DictResource} from "@/types.ts";
import {onMounted} from "vue";
import {getCurrentStudyWord} from "@/hooks/dict.ts";
import {EventKey, useEvent} from "@/utils/eventBus.ts";
import DictListPanel from "@/pages/pc/components/DictListPanel.vue";
import {cloneDeep} from "lodash-es";
import {useRuntimeStore} from "@/stores/runtime.ts";
import Book from "@/pages/pc/components/Book.vue";

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
  if (store.sdict.id) {
    nav('study-word', {}, currentStudy)
  } else {
    ElMessage.warning('请先选择一本词典')
    dictListRef.startSearch()
  }
}

function setPerDayStudyNumber() {
  if (store.sdict.id) {
    show = true
    tempPerDayStudyNumber = store.sdict.perDayStudyNumber
  } else {
    ElMessage.warning('请先选择一本词典')
    dictListRef.startSearch()
  }
}

let show = $ref(false)
let tempPerDayStudyNumber = $ref(0)

function changePerDayStudyNumber() {
  store.sdict.perDayStudyNumber = tempPerDayStudyNumber
  currentStudy = getCurrentStudyWord()
}

function selectDict(e) {
  console.log(e.dict)
  getDictDetail(e.dict)
}

async function goDictDetail2(val: Dict) {
  runtimeStore.editDict = cloneDeep(val)
  nav('dict-detail', {})
}

async function getDictDetail(val: DictResource) {
  let r = await _getDictDataByUrl(val)
  runtimeStore.editDict = cloneDeep(r)
  nav('dict-detail', {})
}

let dictListRef = $ref<any>()


</script>

<template>
  <BasePage>
    <div class="card flex gap-10">
      <div class="flex-1 flex flex-col gap-2">
        <div class="flex">
          <div class="bg-slate-200 px-3 h-14 rounded-md flex items-center">
            <span class="text-xl font-bold">{{ store.sdict.name || '请选择书籍开始学习' }}</span>
            <BaseIcon
                title="切换词典"
                :icon="store.sdict.name ? 'gg:arrows-exchange':'fluent:add-20-filled'"
                class="ml-4"
                @click="dictListRef.startSearch()"/>
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
              @click="setPerDayStudyNumber"
              class="bg-slate-200 px-2 h-10 flex center text-2xl rounded cursor-pointer">
            {{ store.sdict.id ? store.sdict.perDayStudyNumber : 0 }}
          </div>
          个单词
        </div>
        <div class="rounded-xl bg-slate-800 flex items-center gap-2 py-3 px-5 text-white cursor-pointer"
             :class="store.sdict.name || 'opacity-70 cursor-not-allowed'"
             @click="study">
          <span>开始学习</span>
          <Icon icon="icons8:right-round" class="text-2xl"/>
        </div>
      </div>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">我的词典</div>
        <div class="flex gap-4">
          <div class="color-blue cursor-pointer" v-if="store.word.bookList.length > 3">管理词典</div>
          <div class="color-blue cursor-pointer" @click="nav('dict-detail', {isAdd: true})">创建个人词典</div>
        </div>
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <Book :is-add="false"
              quantifier="个词"
              :item="item"
              v-for="item in store.word.bookList"
              @click="goDictDetail2(item)"/>
        <Book :is-add="true"
              @click="dictListRef.startSearch()"/>
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
          想要达到最佳效果，就要坚持每天学习。每天学20个单词是最理想的，但就算再忙的时候每天学10个也有助你养成良好的学习习惯
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
