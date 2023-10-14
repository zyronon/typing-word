<script setup lang="ts">

import VolumeIcon from "@/components/VolumeIcon.vue";
import {Icon} from "@iconify/vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {Word} from "@/types.ts";

const playWordAudio = usePlayWordAudio()
const props = defineProps<{
  word: Word,
  active?: boolean
}>()

const emit = defineEmits<{
  del: []
}>()
</script>

<template>
  <div class="word-item"
       :class="{active}">
    <div class="left">
      <div class="title">
        <span class="word">{{ word.name }}</span>
        <span class="phonetic">{{ word.usphone }}</span>
      </div>
      <div class="translate">{{ word.trans.join('；') }}</div>
    </div>
    <div class="right">
      <VolumeIcon @click="playWordAudio(word.name)"></VolumeIcon>
      <div class="del"
           @click.stop="emit('del')"
      >
        <Icon
            icon="fluent:delete-28-regular"
            width="20"
            color="#929596"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.word-item {
  background: var(--color-header-bg);
  border-radius: 6rem;
  padding: 12rem;
  display: flex;
  justify-content: space-between;
  transition: all .3s;
  color: var(--color-font-1);

  &.active {
    background: $second;
    color: white;

    .phonetic {
      color: white!important;
    }
  }

  &:hover {
    //background: $dark-main-bg;
    //background: $item-hover;
    background: rgb(226, 226, 226);
  }

  .left {
    .title {
      display: flex;
      align-items: center;
      gap: 10rem;

      .word {
        font-size: 24rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
        display: flex;
      }

      .phonetic {
        font-size: 14rem;
        color: gray;
      }
    }
  }

  .right {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5rem;

    .del {
      cursor: pointer;
    }
  }
}
</style>