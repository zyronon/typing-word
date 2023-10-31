<script setup lang="ts">
import {Word} from "../types";
import {watch} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import WordItem from "@/components/WordItem.vue";
import ListItem from "@/components/ListItem.vue";
import VolumeIcon from "@/components/VolumeIcon.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";


const props = withDefaults(defineProps<{
  list: Word[],
  activeIndex?: number,
  isActive?: boolean
}>(), {
  activeIndex: -1,
  isActive: false
})

const emit = defineEmits<{
  del: [i: number],
  change: [i: number]
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
  <div class="list" ref="listRef">
    <ListItem
        v-for="(word,i) in list" :key="i"
        @click="emit('change',i)"
        :active="activeIndex === i"
        class="item"
        :class="{active:activeIndex === i}"
        :show-volume="true"
        @play="playWordAudio(word.name)">
      <div class="title">
        <span class="word">{{ word.name }}</span>
        <span class="phonetic">{{ word.usphone }}</span>
        <VolumeIcon class="volume" @click="playWordAudio(word.name)"></VolumeIcon>
      </div>
      <div class="translate" v-if="word.trans.length">{{ word.trans.join('；') }}</div>
    </ListItem>
  </div>
</template>


<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  flex: 1;
  overflow: overlay;
  padding: 0 $space;

  .item {
    .volume {
      opacity: 0;
    }

    &:hover {
      .volume {
        opacity: 1;
      }
    }

    &.active {
      .phonetic {
        color: white !important;
      }
    }

    .title {
      display: flex;
      align-items: center;
      gap: 8rem;

      .word {
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
  }
}
</style>
