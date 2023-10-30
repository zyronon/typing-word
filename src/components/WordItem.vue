<script setup lang="ts">

import {usePlayWordAudio} from "@/hooks/sound.ts";
import {Word} from "@/types.ts";
import ListItem from "@/components/ListItem.vue";
import VolumeIcon from "@/components/VolumeIcon.vue";

const playWordAudio = usePlayWordAudio()
defineProps<{
  word: Word,
  active?: boolean
}>()

const emit = defineEmits<{
  del: []
}>()
</script>

<template>
  <ListItem
      class="item"
      :show-volume="true"
      @play="playWordAudio(word.name)"
      :active="active">
    <div class="title">
      <span class="word">{{ word.name }}</span>
      <span class="phonetic">{{ word.usphone }}</span>
      <VolumeIcon class="volume" @click="playWordAudio(word.name)"></VolumeIcon>
    </div>
    <div class="translate" v-if="word.trans.length">{{ word.trans.join('；') }}</div>
  </ListItem>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.item {
  .volume {
    opacity: 0;
  }

  &:hover {
    .volume {
      opacity: 1;
    }
  }
}

.title {
  display: flex;
  align-items: center;
  gap: 8rem;

  .word {
    font-size: 18rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    display: flex;
  }

  .phonetic {
    font-size: 14rem;
    color: gray;
  }
}

.translate {
  font-size: 16rem;
}
</style>