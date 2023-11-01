<script setup lang="ts">
import {Word} from "../types";
import {watch} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import ListItem from "@/components/ListItem.vue";
import VolumeIcon from "@/components/VolumeIcon.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useWordOptions} from "@/hooks/dict.ts";

const props = withDefaults(defineProps<{
  list: Word[],
  activeIndex?: number,
  showDel?: boolean,
  isActive?: boolean
}>(), {
  activeIndex: -1,
  isActive: false,
  showDel: false
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
const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple,
  delWrongWord
} = useWordOptions()

</script>

<template>
  <div class="list" ref="listRef">
    <ListItem
        v-for="(word,i) in list" :key="i"
        class="common-list-item"
        :active="activeIndex === i"
        :class="{active:activeIndex === i}"
        :show-volume="true"
        @click="emit('change',i)"
        :isCollect="isWordCollect(word)"
        @toggle-collect="toggleWordCollect(word)"
        :is-simple="isWordSimple(word)"
        @toggle-simple="toggleWordSimple(word)"
        :show-del="showDel"
        @del="delWrongWord(word)"
    >
      <div class="item-title">
        <span class="word" :class="settingStore.dictation && 'text-shadow'">{{ word.name }}</span>
        <span class="phonetic">{{ word.usphone }}</span>
        <VolumeIcon class="volume" @click="playWordAudio(word.name)"></VolumeIcon>
      </div>
      <div class="item-sub-title" v-if="word.trans.length && settingStore.translate">
        <div v-for="item in word.trans">{{ item }}</div>
      </div>
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
}
</style>
