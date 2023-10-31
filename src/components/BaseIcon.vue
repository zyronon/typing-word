<script setup lang="ts">

import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";

defineProps<{
  title?: string,
  icon: string,
  className: string
}>()

defineEmits(['click'])
</script>

<template>
  <Tooltip :title="title">
    <IconWrapper :class="className">
      <Icon @click.stop="$emit('click')" :icon="icon"/>
    </IconWrapper>
  </Tooltip>
</template>

<style scoped lang="scss">

</style>