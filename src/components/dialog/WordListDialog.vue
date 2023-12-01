<script setup lang="ts">

import Dialog from "@/components/dialog/Dialog.vue";
import {$ref} from "vue/macros";
import {onMounted, onUnmounted, watch} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import WordList from "@/components/list2/WordList.vue";

let show = $ref(false)
let loading = $ref(false)
let list = $ref([])
let title = $ref('')
let progress = $ref(0)
const runtimeStore = useRuntimeStore()

onMounted(() => {
  emitter.on(EventKey.openWordListModal, (val: any) => {
    show = true
    list = val.list
    title = val.title + `(${list.length}词)`
    requestIdleCallback(() => {
      let count = 0
      if (val.translateLanguage === 'common') {
        for (let index = 0; index < list.length; index++) {
          let w = list[index]
          if (!w.trans.length) {
            requestIdleCallback(() => {
              if (list.length) {
                let res = runtimeStore.translateWordList.find(a => a.name === w.name)
                if (res) w = Object.assign(w, res)
                count++
                if (count === list.length) {
                  progress = 100
                } else {
                  if (count % 30 === 0) progress = (count / list.length) * 100
                }
              }
            })
          } else {
            count++
            if (count === list.length) {
              progress = 100
            } else {
              if (count % 30 === 0) progress = (count / list.length) * 100
            }
          }
        }
      }
    })
  })
})

watch(() => show, v => {
  if (!v) {
    list = []
    progress = 0
  }
})

onUnmounted(() => {
  emitter.off(EventKey.openWordListModal)
})

</script>

<template>
  <Dialog
      :title="title"
      v-model="show">
    <div class="all-word">
      <div class="progress-wrapper" v-if="progress !== 100 && list.length > 1000">
        <span>词典加载进度:</span>
        <el-progress :percentage="progress"
                     :stroke-width="8"
                     :duration="0"
                     :indeterminate="false"
                     :show-text="false"/>
      </div>
      <WordList
          class="word-list"
          :list="list">
      </WordList>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
@import "@/assets/css/style";

.all-word {
  padding-bottom: var(--space);
  padding-top: 0;
  width: 400rem;
  height: 75vh;
  display: flex;
  flex-direction: column;

  .progress-wrapper {
    padding: 0 var(--space);
    height: 45rem;
    display: flex;
    align-items: center;
    gap: 10rem;
    font-size: 14rem;
    color: var(--color-font-1);

    .el-progress {
      flex: 1;
    }
  }
}
</style>
