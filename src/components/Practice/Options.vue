<script setup lang="ts">

import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";

const emit = defineEmits<{
  remove: [],
  collect: [],
  skip: [],
  edit: [],
}>()
</script>

<template>
  <div class="options">
    <Tooltip title="编辑(快捷键：Ctrl + E)">
      <IconWrapper>
        <Icon icon="tabler:edit" class="menu"
              @click="emit('edit')"/>
      </IconWrapper>
    </Tooltip>
    <Tooltip title="忽略(快捷键：`)">
      <IconWrapper>
        <Icon icon="fluent:delete-20-regular" class="menu"
              @click="emit('remove')"/>
      </IconWrapper>
    </Tooltip>
    <Tooltip title="收藏(快捷键：Enter)">
      <IconWrapper>
        <Icon icon="ph:star" class="menu"
              @click="emit('collect')"/>
      </IconWrapper>
    </Tooltip>
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