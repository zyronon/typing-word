<script setup lang="ts">

import {Dict, DictType} from "@/types.ts";
import {Icon} from "@iconify/vue";
import BaseIcon from "@/components/BaseIcon.vue";

const props = defineProps<{
  dict?: Dict,
  active?: boolean
  showDel?: boolean
}>()

const emit = defineEmits<{
  add: []
  del: []
}>()

</script>

<template>
  <div
      class="book anim"
      :class="active && 'active'"
  >
    <template v-if="dict.id">
      <div class="top">
        <div class="name">{{ dict.name }}</div>
        <div class="desc" :style="{opacity:dict.name !== dict.description?1:0}">{{ dict.description }}</div>
      </div>
      <div class="bottom">
        <div class="num">{{ dict.length + '词' }}</div>
      </div>
      <div class="del" v-if="dict.showDel && !active">
        <BaseIcon icon="solar:trash-bin-minimalistic-linear" @click="emit('del')"/>
      </div>
    </template>
    <div v-else class="add" @click.stop="emit('add')">
      <Icon icon="fluent:add-20-filled" width="38" color="#929596"/>
    </div>
  </div>

</template>

<style scoped lang="scss">

</style>
