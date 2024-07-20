<script setup lang="ts">

import {Word} from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";


const props = withDefaults(defineProps<{
  item: Word,
  showTranslate?: boolean
  showWord?: boolean
  hiddenOptionIcon?: boolean
}>(), {
  showTranslate: true,
  showWord: true,
  hiddenOptionIcon: false,
})

const playWordAudio = usePlayWordAudio()

</script>

<template>
  <div class="word-item"
       :class="{hiddenOptionIcon}"
  >
    <div class="left">
      <slot name="prefix" :item="item"></slot>
      <div class="title-wrapper">
        <div class="item-title">
          <span class="word" :class="!showWord && 'word-shadow'">{{ item.word }}</span>
          <span class="phonetic">{{ item.phonetic0 }}</span>
          <VolumeIcon class="volume" @click="playWordAudio(item.word)"></VolumeIcon>
        </div>
        <div class="item-sub-title" v-if="item.trans.length && showTranslate">
          <div v-for="v in item.trans">{{ (v.pos ? v.pos + '.' : '') + (v.tran ) }}</div>
        </div>
      </div>
    </div>
    <div class="right">
      <slot name="suffix" :item="item"></slot>
    </div>
  </div>
</template>


<style scoped lang="scss">
.word-item {
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  background: var(--color-item-bg);
  color: var(--color-font-1);
  font-size: 1.1rem;
  border-radius: .5rem;
  display: flex;
  justify-content: space-between;
  transition: all .3s;
  padding: .6rem;
  gap: .6rem;
  border: 1px solid var(--color-item-border);

  .left {
    display: flex;
    gap: .6rem;

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: .2rem;
      word-break: break-word;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: .3rem;
    transition: all .3s;
  }

  .volume {
    opacity: 0;
  }

  .item-title {
    display: flex;
    align-items: center;
    gap: .5rem;
    color: var(--color-font-1);

    .word {
      font-size: 1.2rem;
      display: flex;
    }

    .phonetic {
      font-size: .9rem;
      color: gray;
    }
  }

  .item-sub-title {
    font-size: 1rem;
    color: gray;
  }

  &:hover {
    background: var(--color-item-hover);

    .volume, :deep(.option-icon) {
      opacity: 1;
    }
  }

  &.hiddenOptionIcon {
    :deep(.option-icon) {
      opacity: 0;
    }
  }

  &.active {
    background: var(--color-item-active);
    $c: #E6A23C;

    .phonetic, .item-sub-title {
      color: var(--color-gray) !important;
    }

    .volume, .collect, .easy, .fill {
      color: $c;
    }
  }
}

</style>