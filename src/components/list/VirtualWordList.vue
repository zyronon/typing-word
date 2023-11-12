<script setup lang="ts">
import {Word} from "../../types.ts";
import {useSettingStore} from "@/stores/setting.ts";
import WordItem from "@/components/list/WordItem.vue";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {watch} from 'vue'

const props = withDefaults(defineProps<{
  list: Word[],
  activeIndex?: number,
  isActive?: boolean
  showTranslate?: boolean
  showWord?: boolean
}>(), {
  activeIndex: -1,
  isActive: false,
  showTranslate: true,
  showWord: true
})

const emit = defineEmits<{
  change: [val: { word: Word, index: number }],
}>()

const settingStore = useSettingStore()
const listRef: any = $ref()

function scrollViewToCenter(index: number) {
  if (index === -1) return
  listRef.scrollToIndex(index)
  // listRef.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
}

watch(() => props.activeIndex, (n: any) => {
  if (settingStore.showPanel) {
    scrollViewToCenter(n)
  }
})

watch(() => props.isActive, (n: boolean) => {
  setTimeout(() => {
    if (n) scrollViewToCenter(props.activeIndex)
  }, 300)
})

// watch(() => props.list, () => {
//   listRef.scrollTo(0, 0)
// })

const playWordAudio = usePlayWordAudio()

function reset() {
  listRef.reset()
}

function scrollToBottom() {
  listRef.scrollToIndex(props.list.length - 1)

}

defineExpose({scrollToBottom})

</script>

<template>
  <virtual-list class="virtual-list"
                :keeps="20"
                data-key="name"
                :data-sources="list"
                :estimate-size="85"
                ref="listRef"
                item-class="dict-virtual-item"
  >
    <template #={source,index}>
      <div class="common-list-item"
           :class="{active:activeIndex === index}"
           @click="emit('change',{word:source,index})"
      >
        <div class="left">
          <div class="item-title">
            <span class="word" :class="!showWord && 'text-shadow'">{{ source.name }}</span>
            <span class="phonetic">{{ source.usphone }}</span>
            <VolumeIcon class="volume" @click="playWordAudio(source.name)"></VolumeIcon>
          </div>
          <div class="item-sub-title" v-if="source.trans.length && showTranslate">
            <div v-for="item in source.trans">{{ item }}</div>
          </div>
        </div>
        <div class="right">
          <slot :word="source" :index="index"></slot>
        </div>
      </div>
    </template>
  </virtual-list>
</template>

<style lang="scss">
@import "@/assets/css/variable";

.virtual-list {
  overflow: overlay;
  height: 100%;
  padding: 0 var(--space);
}

.dict-virtual-item {
  margin-bottom: 15rem;
}

</style>
