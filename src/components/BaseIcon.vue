<script setup lang="ts">

import Tooltip from "@/components/Tooltip.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import {Icon} from "@iconify/vue";

defineProps<{
  title: string,
  icon: string,
}>()
</script>

<template>
  <Tooltip :title="title">
    <IconWrapper>
      <Icon :icon="icon"/>
    </IconWrapper>
  </Tooltip>
</template>

<style scoped lang="scss">

</style>