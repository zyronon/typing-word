<script setup lang="ts">
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {useBaseStore} from "@/stores/base.ts";
import Ring from "@/pages/pc/components/Ring.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import Fireworks from "@/pages/pc/components/Fireworks.vue";
import BaseButton from "@/components/BaseButton.vue";
import {ShortcutKey} from "@/types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {onMounted} from "vue";
import {Icon} from '@iconify/vue';
import {useSettingStore} from "@/stores/setting.ts";
import {usePracticeStore} from "@/stores/practice.ts";
import {dayjs} from "element-plus";

const store = useBaseStore()
const settingStore = useSettingStore()
const statStore = usePracticeStore()
let open = $ref(false)

onMounted(() => {
  emitter.on(EventKey.openStatModal, () => {
    let data = {
      startIndex: store.currentStudyWordDict.lastLearnIndex,
      endIndex: store.currentStudyWordDict.lastLearnIndex + store.currentStudyWordDict.perDayStudyNumber,
      speed: statStore.speed,
      startDate: statStore.startDate,
    }
    store.currentStudyWordDict.lastLearnIndex = data.endIndex
    store.currentStudyWordDict.statistics.push(data as any)
    store.currentStudyWordDict.statistics.sort((a, b) => a.startDate - b.startDate)

    console.log('staa', JSON.parse(JSON.stringify(store.currentStudyWordDict.statistics)))
    open = true
  })

  const close = () => {
    open = false
  }

  emitter.on(ShortcutKey.NextChapter, close)
  emitter.on(ShortcutKey.RepeatChapter, close)
  emitter.on(ShortcutKey.DictationChapter, close)
})


function options(emitType: 'write' | 'repeat' | 'next') {
  open = false
  emitter.emit(EventKey[emitType])
}

const isEnd = $computed(() => {
  return store.isArticle ?
      store.currentDict.chapterIndex === store.currentDict.articles.length - 1 :
      store.currentDict.chapterIndex === store.currentDict.chapterWords.length - 1
})

</script>

<template>
  <Dialog
      :header="false"
      v-model="open">
    <div class="statistics relative flex flex-col gap-6">
      <header>
        <div class="text-2xl">{{ store.currentStudyWordDict.name }}</div>
      </header>
      <div class="flex justify-center gap-10">
        <div class="text-xl text-center flex flex-col justify-around">
          <div class="font-bold">非常棒!</div>
          <div>坚持了 <span class="color-green font-bold text-2xl">{{ dayjs().diff(statStore.startDate, 'm') }}</span>
            分钟
          </div>
        </div>
        <Ring
            :value="statStore.newWordNumber"
            desc="New"
            :percentage="40"
        />
      </div>
      <div class="flex justify-center gap-10">
        <div class="flex justify-center items-center py-3 px-10 rounded-md color-red-500 flex-col"
             style="background: rgb(254,236,236)">
          <div class="text-3xl">{{ statStore.wrongWordNumber }}</div>
          <div class="center gap-2">
            <Icon icon="iconamoon:close" class="text-2xl"/>
            错词
          </div>
        </div>
        <div class="flex justify-center items-center py-3 px-10 rounded-md color-green-600 flex-col"
             style="background: rgb(231,248,241)">
          <div class="text-3xl">{{ statStore.total - statStore.wrongWordNumber }}</div>
          <div class="center gap-2">
            <Icon icon="tabler:check" class="text-2xl"/>
            正确
          </div>
        </div>
      </div>
      <div class="absolute right-5 top-20 flex flex-col gap-4">
        <Tooltip title="分享给朋友">
          <Icon class="hvr-grow pointer" icon="ph:share-light" width="20" color="#929596"/>
        </Tooltip>
        <Tooltip title="请我喝杯咖啡">
          <Icon class="hvr-grow pointer" icon="twemoji:teacup-without-handle" width="20" color="#929596"/>
        </Tooltip>
      </div>
      <div class="footer">
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
        <BaseButton
            type="primary"
            @click="options('next')">
          分享
        </BaseButton>
      </div>
    </div>
  </Dialog>
  <Fireworks v-if="open"/>
</template>
<style scoped lang="scss">
@import "@/assets/css/variable";

$card-radius: .5rem;
$dark-second-bg: rgb(60, 63, 65);
$item-hover: rgb(75, 75, 75);

.statistics {
  padding: var(--space);
  background: $dark-second-bg;
  border-radius: $card-radius;

  $header-height: 2.5rem;
  $footer-height: 4rem;

  header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: $header-height;
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  .content {
    display: flex;
    gap: var(--space);
    margin-bottom: 1rem;

    .shares {
      display: flex;
      flex-direction: column;
      gap: var(--space);
    }
  }

  .footer {
    height: $footer-height;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
  }
}

</style>