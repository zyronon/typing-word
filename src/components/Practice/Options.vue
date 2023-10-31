<script setup lang="ts">

import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {useWordOptions} from "@/hooks/dict.ts";

defineProps<{
  showEdit?: boolean,
  isCollect: boolean,
  isSimple: boolean
}>()

const emit = defineEmits<{
  toggleCollect: [],
  toggleSimple: [],
  edit: [],
  skip: [],
}>()

</script>

<template>
  <div class="options">
    <Tooltip v-if="showEdit" title="编辑(快捷键：Ctrl + E)">
      <IconWrapper>
        <Icon icon="tabler:edit" class="menu"
              @click="emit('edit')"/>
      </IconWrapper>
    </Tooltip>

    <BaseIcon
        v-if="!isSimple"
        class-name="collect"
        @click="$emit('toggleSimple')"
        title="忽略(快捷键：`)"
        icon="material-symbols:check-circle-outline-rounded"/>
    <BaseIcon
        v-else
        class-name="fill"
        @click="$emit('toggleSimple')"
        title="已忽略(快捷键：`)"
        icon="material-symbols:check-circle-rounded"/>

    <BaseIcon
        v-if="!isCollect"
        class-name="collect"
        @click="$emit('toggleCollect')"
        title="收藏(快捷键：Enter)"
        icon="ph:star"/>
    <BaseIcon
        v-else
        class-name="fill"
        @click="$emit('toggleCollect')"
        title="已收藏(快捷键：Enter)"
        icon="ph:star-fill"/>

    <Tooltip title="跳过(快捷键：Tab)">
      <IconWrapper>
        <Icon icon="icon-park-outline:go-ahead" class="menu"
              @click="emit('skip')"/>
      </IconWrapper>
    </Tooltip>
  </div>
</template>

<style scoped lang="scss">
.options {
  margin-top: 10rem;
  display: flex;
  gap: 15rem;
  font-size: 18rem;
}
</style>