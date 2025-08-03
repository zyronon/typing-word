<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {_dateFormat, _getAccomplishDate, _getAccomplishDays, _getDictDataByUrl, useNav} from "@/utils";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {DictResource, getDefaultDict} from "@/types.ts";
import {onMounted, watch} from "vue";
import {getCurrentStudyWord} from "@/hooks/dict.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import Book from "@/pages/pc/components/Book.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import {ElMessage, ElProgress, ElSlider} from 'element-plus';
import BaseButton from "@/components/BaseButton.vue";

const store = useBaseStore()
const router = useRouter()
const {nav} = useNav()
const runtimeStore = useRuntimeStore()

let currentStudy = $ref({
  new: [],
  review: [],
  write: []
})

//todo 当选完词返回时，计算今日任务时，还是老的词典
onMounted(init)
watch(() => store.load, init)

async function init() {
  if (store.word.studyIndex >= 3) {
    if (!store.sdict.custom && !store.sdict.words.length) {
      store.word.bookList[store.word.studyIndex] = await _getDictDataByUrl(store.sdict)
    }
  }
  // console.log(store.sdict)
  if (!currentStudy.new.length && store.sdict.words.length) {
    currentStudy = getCurrentStudyWord()
  }
}

function startStudy() {
  // return store.sdict.lastLearnIndex = store.sdict.length - 1
  // store.sdict.complete = true
  // store.sdict.lastLearnIndex = 20
  // currentStudy = getCurrentStudyWord()
// return
  // return  store.sdict.lastLearnIndex = store.sdict.length - 1
  if (store.sdict.id) {
    if (!store.sdict.words.length) {
      return ElMessage.warning('没有单词可学习！')
    }
    nav('study-word', {}, currentStudy)
  } else {
    ElMessage.warning('请先选择一本词典')
  }
}

function setPerDayStudyNumber() {
  if (store.sdict.id) {
    show = true
    tempPerDayStudyNumber = store.sdict.perDayStudyNumber
  } else {
    ElMessage.warning('请先选择一本词典')
  }
}

let show = $ref(false)
let tempPerDayStudyNumber = $ref(0)

function changePerDayStudyNumber() {
  store.sdict.perDayStudyNumber = tempPerDayStudyNumber
  currentStudy = getCurrentStudyWord()
}

async function goDictDetail(val: DictResource) {
  runtimeStore.editDict = getDefaultDict(val)
  nav('dict-detail', {})
}

let isMultiple = $ref(false)
let selectIds = $ref([])

function handleBatchDel() {
  selectIds.forEach(id => {
    let r = store.word.bookList.findIndex(v => v.id === id)
    if (r !== -1) {
      if (store.word.studyIndex === r) {
        store.word.studyIndex = -1
      }
      if (store.word.studyIndex > r) {
        store.word.studyIndex--
      }
      store.word.bookList.splice(r, 1)
    }
  })
  selectIds = []
  ElMessage.success("删除成功！")
}

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

// 统计所有词典的学习日期
const allStudyDays = $computed(() => {
  const dateCountMap = new Map<string, { count: number, spend: number }>();
  store.word.bookList.forEach(dict => {
    if (Array.isArray(dict.statistics)) {
      dict.statistics.forEach(stat => {
        // 格式化为 'YYYY-MM-DD'
        const date = _dateFormat(stat.startDate, 'YYYY-MM-DD');
        if (!date) return;
        // spend 直接累加原始毫秒数
        const spend = Number(stat.spend || stat.speed) || 0;
        if (!dateCountMap.has(date)) {
          dateCountMap.set(date, {count: 1, spend});
        } else {
          const v = dateCountMap.get(date)!;
          v.count += 1;
          v.spend += spend;
        }
      });
    }
  });
  // 转为 [{ date, count, spend }]
  return Array.from(dateCountMap.entries()).map(([date, {count, spend}]) => ({date, count, spend}));
});

function clickActivityEvent(e) {
  // e.date 是 'YYYY-MM-DD'
  const day = allStudyDays.find(item => item.date === e.date);
  if (day) {
    // 这里将毫秒转为分钟和小时
    const min = Math.round(day.spend / 1000 / 60);
    let msg = '';
    if (min < 60) {
      msg = ` 学习了${min}分钟`;
    } else {
      const hour = (min / 60).toFixed(1);
      msg = ` 学习了${min}分钟（约${hour}小时）`;
    }
    ElMessage.success(e.date + msg);
  } else {
    ElMessage.info('当天无学习记录');
  }
}

const progressTextLeft = $computed(() => {
  if (store.sdict.complete) return '已学完，进入总复习阶段'
  return '已学习' + store.currentStudyProgress + '%'
})
const progressTextRight = $computed(() => {
  // if (store.sdict.complete) return store.sdict?.length
  return store.sdict?.lastLearnIndex
})


</script>

<template>
  <BasePage>
    <div class="card flex gap-10">
      <div class="flex-1 flex flex-col gap-2">
        <div class="flex">
          <div class="bg-third px-3 h-14 rounded-md flex items-center">
            <span class="text-xl font-bold">{{ store.sdict.name || '请选择书籍开始学习' }}</span>
            <BaseIcon title="切换词典" :icon="store.sdict.name ? 'gg:arrows-exchange' : 'fluent:add-20-filled'"
                      class="ml-4"
                      @click="router.push('/dict-list')"/>
          </div>
        </div>
        <div class="">
          <div class="text-sm flex justify-between">
            <span>{{ progressTextLeft }}</span>
            <span>{{ progressTextRight }} / {{ store.sdict.words.length }}</span>
          </div>
          <ElProgress class="mt-1" :percentage="store.currentStudyProgress" :show-text="false"></ElProgress>
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
            <div class="text">新词</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ currentStudy.review.length }}</div>
            <div class="text">复习</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ currentStudy.write.length }}
            </div>
            <div class="text">默写</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end justify-around ">
        <div class="flex gap-1 items-center">
          每日目标
          <div style="color:#ac6ed1;" @click="setPerDayStudyNumber"
               class="bg-third px-2 h-10 flex center text-2xl rounded cursor-pointer">
            {{ store.sdict.id ? store.sdict.perDayStudyNumber : 0 }}
          </div>
          个单词 <span class="color-blue cursor-pointer" @click="setPerDayStudyNumber">更改</span>
        </div>
        <BaseButton :disabled="!store.sdict.name" @click="startStudy">
          <div class="flex items-center gap-2">
            <span>开始学习</span>
            <Icon icon="icons8:right-round" class="text-2xl"/>
          </div>
        </BaseButton>
      </div>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">我的词典</div>
        <div class="flex gap-4 items-center">
          <PopConfirm title="确认删除所有选中词典？" @confirm="handleBatchDel" v-if="selectIds.length">
            <BaseIcon class="del" title="删除" icon="solar:trash-bin-minimalistic-linear"/>
          </PopConfirm>

          <div class="color-blue cursor-pointer" v-if="store.word.bookList.length > 3"
               @click="isMultiple = !isMultiple; selectIds = []">{{ isMultiple ? '取消' : '管理词典' }}
          </div>
          <div class="color-blue cursor-pointer" @click="nav('dict-detail', { isAdd: true })">创建个人词典</div>
        </div>
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <Book :is-add="false" quantifier="个词" :item="item" :checked="selectIds.includes(item.id)"
              @check="() => toggleSelect(item)" :show-checkbox="isMultiple && j >= 3"
              v-for="(item, j) in store.word.bookList" @click="goDictDetail(item)"/>
        <Book :is-add="true" @click="router.push('/dict-list')"/>
      </div>
    </div>


    <div class="card">
      <div class="title">
        已学习 <span class="text-3xl">{{ allStudyDays.length }}</span> 天
      </div>
      <div class="center">
        <ActivityCalendar :data="allStudyDays"
                          :width="40"
                          :height="7"
                          :cellLength="16"
                          :cellInterval="8"
                          :fontSize="12"
                          :showLevelFlag="true"
                          :showWeekDayFlag="true"
                          :clickEvent="clickActivityEvent"/>
      </div>
    </div>

    <Dialog v-model="show" title="每日目标" :footer="true" @ok="changePerDayStudyNumber">
      <div class="target-modal">
        <div class="center text-2xl gap-2">
          <span class="text-3xl" style="color:rgb(176,116,211)">{{
              tempPerDayStudyNumber
            }}</span>个单词
        </div>
        <div class="center text-sm" :style="{ opacity: tempPerDayStudyNumber === 20 ? 1 : 0 }">
          推荐
        </div>
        <ElSlider :min="10" :step="10" show-stops :marks="{ 10: '10', 200: '200' }" size="small" class="my-6"
                  :max="200" v-model="tempPerDayStudyNumber"/>
        <div class="flex gap-2 mb-2 mt-10 items-center">
          <div>预计</div>
          <span class="text-2xl" style="color:rgb(176,116,211)">{{
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
