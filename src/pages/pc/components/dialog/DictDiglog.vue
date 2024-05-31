<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import {onMounted} from "vue"
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import "vue-activity-calendar/style.css";
import WordListDialog from "@/pages/pc/components/dialog/WordListDialog.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()

let show = $ref(false)
let chapterWordNumber = $ref(0)

function close() {
  show = false
}

function showAllWordModal() {
  emitter.emit(EventKey.openWordListModal, {
    title: store.currentStudyWordDict.name,
    translateLanguage: store.currentStudyWordDict.translateLanguage,
    list: store.currentStudyWordDict.words
  })
}

onMounted(() => {
  emitter.on(EventKey.openDictModal, (typ) => {
    show = true
  })
})


</script>

<template>
  <Dialog
      :header="false"
      v-model="show"
      :show-close="false">
    <div id="DictDialog">
      <header>
        <div class="text-2xl">
          {{ store.currentStudyWordDict.name }}
        </div>
        <Icon @click="close"
              class="hvr-grow pointer"
              width="20" color="#929596"
              icon="ion:close-outline"/>
      </header>
      <div class="detail">
        <div class="desc">{{ store.currentStudyWordDict.description }}</div>
        <div class="text flex align-center gap-2">
          <div>总词汇： {{ store.currentStudyWordDict.originWords.length }}词</div>
          <BaseIcon icon="circum:view-list"
                    @click='showAllWordModal'
                    title="单词列表"
          />
        </div>
        <div class="text">开始日期：-</div>
        <div class="text">花费时间：-</div>
        <div class="text">累积错误：-</div>
        <div class="text">进度：
          <el-progress :percentage="0"
                       :stroke-width="8"
                       :show-text="false"/>
        </div>
        <div class="row">
          <div class="label">每日目标</div>
          <el-slider
              class="my-slider"
              :min="10"
              :step="10"
              :max="store.currentStudyWordDict.words.length < 10 ? 10 : 500"
              size="small"
              v-model="chapterWordNumber"
          />
        </div>
        <div class="notice">
          <span class="text">最小:10</span>
          <span class="text">最大:{{ store.currentStudyWordDict.words.length < 10 ? 10 : 500 }}</span>
        </div>
      </div>
      <div class="footer">
        <BaseButton @click="close">关闭</BaseButton>
      </div>
    </div>
  </Dialog>
  <WordListDialog/>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

$header-height: 4rem;

#DictDialog {
  //position: fixed;
  //left: 50%;
  //top: 50%;
  //transform: translate(-50%, -50%);
  background: var(--color-second-bg);
  z-index: 99999;
  width: 30rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    cursor: pointer;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    height: $header-height;
    align-items: center;
    justify-content: space-between;
    color: var(--color-font-3);
    padding: 0 var(--space);

    .left {
      display: flex;
      gap: .6rem;
      align-items: center;
    }
  }

  .detail {
    padding-left: var(--space);
    flex: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    gap: .2rem;
    position: relative;
    font-size: .9rem;
    padding-right: var(--space);

    .name {
      font-size: 1.6rem;
      width: 95%;
    }

    .desc {
      font-size: 1rem;
      margin-bottom: 1.2rem;
    }


    :deep(.edit-icon) {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  .footer {
    box-sizing: content-box;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: var(--space);
    padding-right: var(--space);
    margin: var(--space) 0;
  }
}


</style>

