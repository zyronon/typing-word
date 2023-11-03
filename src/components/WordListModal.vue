<script setup lang="ts">

import VolumeIcon from "@/components/VolumeIcon.vue";
import Modal from "@/components/Modal/Modal.vue";
import {$ref} from "vue/macros";
import {onMounted, onUnmounted, watch} from "vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import ListItem from "@/components/ListItem.vue";
import {Word} from "@/types.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

let show = $ref(false)
let loading = $ref(false)
let list = $ref([])
let title = $ref('')
let progress = $ref(0)
const playWordAudio = usePlayWordAudio()
const runtimeStore = useRuntimeStore()

onMounted(() => {
  emitter.on(EventKey.openWordListModal, (val: any) => {
    show = true
    list = val.list
    title = val.title
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
  <Modal
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
      <virtual-list class="virtual-list"
                    :keeps="20"
                    data-key="name"
                    :data-sources="list"
                    :estimate-size="85"
                    item-class="dict-virtual-item"
      >
        <template #={source}>
          <ListItem
              class="common-list-item"
              :show-volume="true">
            <div class="item-title">
              <span class="word">{{ source.name }}</span>
              <span class="phonetic">{{ source.usphone }}</span>
              <VolumeIcon class="volume" @click="playWordAudio(source.name)"></VolumeIcon>
            </div>
            <div class="item-sub-title" v-if="source.trans.length">{{ source.trans.join('；') }}</div>
          </ListItem>
        </template>
      </virtual-list>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
@import "@/assets/css/style";

.all-word {
  padding: $space;
  padding-top: 0;
  width: 400rem;
  height: 75vh;

  .progress-wrapper {
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

<style lang="scss">
@import "@/assets/css/variable.scss";

.virtual-list {
  overflow: auto;
  height: 100%;
}

.dict-virtual-item {
  margin-bottom: 15rem;
}

</style>
