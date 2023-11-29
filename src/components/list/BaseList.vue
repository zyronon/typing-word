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
  click: [val: { word: Word, index: number }],
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
  listRef.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef.scrollToItem(index)
}

defineExpose({scrollToBottom, scrollToItem})

</script>

<template>
  <DynamicScroller
      :items="list"
      ref="listRef"
      :min-item-size="90"
      class="scroller"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
          item.id,
        ]"
          :data-index="index"
      >
        <div class="list-item-wrapper">
          <div class="common-list-item"
               :class="{active:activeIndex === index}"
               @click="emit('click',{data:item,index})"
          >
            <div class="left">
              <slot name="prefix" :word="item" :index="index"></slot>
              <div class="title-wrapper">
                <div class="item-title">
                  <span class="word" :class="!showWord && 'text-shadow'">{{ item.name }}</span>
                  <span class="phonetic">{{ item.usphone }}</span>
                  <VolumeIcon class="volume" @click="playWordAudio(item.name)"></VolumeIcon>
                </div>
                <div class="item-sub-title" v-if="item.trans.length && showTranslate">
                  <div v-for="tran in item.trans">{{ tran }}</div>
                </div>
              </div>
            </div>
            <div class="right">
              <slot :word="item" :index="index"></slot>
            </div>
          </div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<style lang="scss" scoped>
@import "@/assets/css/variable";

.scroller {
  height: 100%;
  padding: 0 var(--space);
}


</style>
