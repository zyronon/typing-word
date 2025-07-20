<script setup lang="ts">
import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";

defineProps<{
  item?: Dict
  quantifier?: string
  isAdd: boolean
}>()

</script>

<template>
  <div class="book">
    <template v-if="!isAdd">
      <div>
        <div>{{ item?.name }}</div>
        <div class="text-sm line-clamp-3" v-opacity="item.name !== item.description">{{ item?.description }}</div>
      </div>
      <div class="absolute bottom-4 right-4">{{ item?.words?.length }}{{ quantifier }}</div>
    </template>
    <div v-else class="center h-full">
      <Icon
          width="40px"
          icon="fluent:add-20-filled"/>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
