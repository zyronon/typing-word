<script setup lang="ts">
import {Word} from "../../types.ts";
import {useSettingStore} from "@/stores/setting.ts";
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

const listRef: HTMLElement = $ref(null as any)

function scrollViewToCenter(index: number) {
  if (index === -1) return
  listRef.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
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

watch(() => props.list, () => {
  listRef.scrollTo(0, 0)
})

const playWordAudio = usePlayWordAudio()

</script>

<template>
  <div class="common-list" ref="listRef">
    <div class="common-list-item"
         v-for="(source,index) in list" :key="index"
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
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/variable";

.common-list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  flex: 1;
  overflow: overlay;
  padding: 0 var(--space);
}
</style>
