<script setup lang="ts">

import {$ref} from "vue/macros";
import {Word} from "@/types.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import BaseList from "@/components/list2/BaseList.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";

const props = withDefaults(defineProps<{
  list: Word[],
  showTranslate?: boolean
  showWord?: boolean
}>(), {
  list: [],
  showTranslate: true,
  showWord: true
})

const emit = defineEmits<{
  click: [val: { item: Word, index: number }],
  title: [val: { item: Word, index: number }],
}>()

const listRef: any = $ref(null as any)

function scrollToBottom() {
  listRef?.scrollToBottom()
}

function scrollToItem(index: number) {
  listRef?.scrollToItem(index)
}

const playWordAudio = usePlayWordAudio()

defineExpose({scrollToBottom, scrollToItem})

</script>

<template>
  <BaseList
      ref="listRef"
      @click="(e:any) => emit('click',e)"
      :list="list"
      v-bind="$attrs">
    <template v-slot:prefix="{ item, index }">
      <slot name="prefix" :item="item" :index="index"></slot>
    </template>
    <template v-slot="{ item, index }">
      <div class="item-title">
        <span class="word" :class="!showWord && 'text-shadow'">{{ item.name }}</span>
        <span class="phonetic">{{ item.usphone }}</span>
        <VolumeIcon class="volume" @click="playWordAudio(item.name)"></VolumeIcon>
      </div>
      <div class="item-sub-title" v-if="item.trans.length && showTranslate">
        <div v-for="tran in item.trans">{{ tran }}</div>
      </div>
    </template>
    <template v-slot:suffix="{ item, index }">
      <slot name="suffix" :item="item" :index="index"></slot>
    </template>
  </BaseList>
</template>

<style scoped lang="scss">

</style>