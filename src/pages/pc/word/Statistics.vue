<script setup lang="ts">
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {useBaseStore} from "@/stores/base.ts";
import BaseButton from "@/components/BaseButton.vue";
import {ShortcutKey} from "@/types.ts";
import {emitter, EventKey, useEvent, useEvents} from "@/utils/eventBus.ts";
import {Icon} from '@iconify/vue';
import {useSettingStore} from "@/stores/setting.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {dayjs} from "element-plus";

const store = useBaseStore()
const settingStore = useSettingStore()
const statStore = usePracticeStore()
let open = $ref(false)

useEvent(EventKey.openStatModal, () => {
  let data = {
    speed: statStore.speed,
    startDate: statStore.startDate,
    total: statStore.total,
    wrong: statStore.wrong,
  }
  store.sdict.lastLearnIndex = store.sdict.lastLearnIndex + statStore.newWordNumber
  store.sdict.statistics.push(data as any)
  store.sdict.statistics.sort((a, b) => a.startDate - b.startDate)

  console.log('staa', JSON.parse(JSON.stringify(store.sdict.statistics)))
  open = true
})

const close = () => {
  open = false
}

useEvents([
  [ShortcutKey.NextChapter, close],
  [ShortcutKey.RepeatChapter, close],
  [ShortcutKey.DictationChapter, close],
])

function options(emitType: 'write' | 'repeat' | 'next') {
  open = false
  emitter.emit(EventKey[emitType])
}

//todo
const isEnd = $computed(() => {
  return false
})

</script>

<template>
  <Dialog
      :header="false"
      v-model="open">
    <div class="statistics relative flex flex-col gap-6">
      <div class="w-full flex flex-col justify-evenly">
        <div class="center text-xl mb-2">已完成今日任务</div>
        <div class="flex">
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ statStore.newWordNumber }}</div>
            <div class="text">新词数</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{ statStore.newWordNumber }}</div>
            <div class="text">复习数</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-4xl font-bold">{{
                statStore.newWordNumber
              }}
            </div>
            <div class="text">默写数</div>
          </div>
        </div>
      </div>

      <div class="text-xl text-center flex flex-col justify-around">
        <div>非常棒! 坚持了 <span class="color-green font-bold text-2xl">{{
            dayjs().diff(statStore.startDate, 'm')
          }}</span>
          分钟
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
      <div class="flex justify-center gap-4 ">
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.RepeatChapter]"
            @click="options('repeat')">
          重学
        </BaseButton>
        <BaseButton
            :keyboard="settingStore.shortcutKeyMap[ShortcutKey.NextChapter]"
            @click="options('next')">
          {{ isEnd ? '重新练习' : '再来一组' }}
        </BaseButton>
      </div>
    </div>
  </Dialog>
</template>
<style scoped lang="scss">
$card-radius: .5rem;
$dark-second-bg: rgb(60, 63, 65);
$item-hover: rgb(75, 75, 75);

.statistics {
  padding: var(--space);
  width: 30rem;
  background: $dark-second-bg;
  border-radius: $card-radius;
}

</style>
