<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import "vue-activity-calendar/style.css";
import WordListDialog from "@/pages/pc/components/dialog/WordListDialog.vue";
import {emitter, EventKey, useEvent} from "@/utils/eventBus.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {_dateFormat} from "@/utils";
import {sumBy} from "lodash-es";

const store = useBaseStore()

let show = $ref(false)

function showAllWordModal() {
  emitter.emit(EventKey.openWordListModal, {
    title: store.sdict.name,
    translateLanguage: store.sdict.translateLanguage,
    list: store.sdict.words
  })
}

useEvent(EventKey.openDictModal, () => {
  show = true
})

const startDate = $computed(() => {
  if (store.sdict.statistics.length) {
    return _dateFormat(store.sdict.statistics[0].startDate, 'YYYY-MM-DD')
  } else {
    return '-'
  }
})

const speedTime = $computed(() => {
  let d = Math.ceil(sumBy(store.sdict.statistics, 'speed') / 1000 / 60)
  if (d < 60) return d + '分钟'
  else return (d / 60).toFixed(1) + '小时'
})

</script>

<template>
  <Dialog
      v-model="show"
      :title="store.sdict.name "
  >
    <div id="DictDialog">
      <div class="detail">
        <div class="desc">{{ store.sdict.description }}</div>
        <div class="text flex align-center gap-2">
          <div>总词汇： {{ store.sdict.words.length }}词</div>
          <BaseIcon icon="circum:view-list"
                    @click='showAllWordModal'
                    title="单词列表"
          />
        </div>
        <div class="text">开始日期：{{ startDate }}</div>
        <div class="text">花费时长：{{ speedTime }}</div>
        <div class="text">累积错误：{{ sumBy(store.sdict.statistics, 'wrong') }}</div>
        <div class="mt-2">
          <div class="text-sm flex justify-between">
            已学习{{ store.currentStudyProgress }}%
            <span>{{ store.sdict.lastLearnIndex }} / {{
                store.sdict.words.length
              }}</span>
          </div>
          <el-progress class="mt-1" :percentage="store.currentStudyProgress" :show-text="false"></el-progress>
        </div>
      </div>
    </div>
  </Dialog>
  <WordListDialog/>
</template>

<style scoped lang="scss">

#DictDialog {
  width: 20rem;

  .detail {
    color: var(--color-font-1);
    gap: .2rem;
    position: relative;
    font-size: .9rem;
    padding: var(--space);
    padding-top: 0;
  }
}
</style>

