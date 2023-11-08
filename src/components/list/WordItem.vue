<script setup lang="ts">

import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {Word} from "@/types.ts";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {useWordOptions} from "@/hooks/dict.ts";

const props = withDefaults(defineProps<{
  list?: Word[],
  activeIndex?: number,
  showDel?: boolean,
  isActive?: boolean
  active?: boolean
  showTranslate?: boolean
  showWord?: boolean
  word: Word
}>(), {
  activeIndex: -1,
  isActive: false,
  showDel: false,
  showTranslate: true,
  showWord: true
})

const emit = defineEmits<{
  del: [val: Word],
  change: [i: number]
}>()

const playWordAudio = usePlayWordAudio()
const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple,
} = useWordOptions()

</script>

<template>
  <div class="common-list-item"
       :class="{active}"
  >
    <div class="left">
      <div class="item-title">
        <span class="word" :class="!showWord && 'text-shadow'">{{ word.name }}</span>
        <span class="phonetic">{{ word.usphone }}</span>
        <VolumeIcon class="volume" @click="playWordAudio(word.name)"></VolumeIcon>
      </div>
      <div class="item-sub-title" v-if="word.trans.length && showTranslate">
        <div v-for="item in word.trans">{{ item }}</div>
      </div>
    </div>
    <div class="right">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.left {
  display: flex;
  gap: 10rem;
  flex-direction: column;
  word-break: break-word;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  transition: all .3s;
}
</style>