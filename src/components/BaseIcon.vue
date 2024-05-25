<script setup lang="ts">

import Tooltip from "@/pages/pc/components/Tooltip.vue";
import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";

defineProps<{
  title?: string,
  icon: string,
}>()

defineEmits(['click'])
</script>

<template>
  <Tooltip :title="title">
    <IconWrapper v-bind="$attrs" @click.stop="$emit('click')">
      <Icon  :icon="icon"/>
    </IconWrapper>
  </Tooltip>
</template>

<style scoped lang="scss">

</style>