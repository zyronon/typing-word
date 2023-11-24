<script setup lang="ts">
import {Word} from "@/types.ts";

const props = defineProps<{
  items: Word[]
}>()
</script>

<template>
  <DynamicScroller
      :items="items"
      :min-item-size="54"
      class="scroller"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
          item.name,
        ]"
          :data-index="index"
      >

        <div class="text">{{ item.name }}</div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<style scoped lang="scss">
.scroller {
  height: 100%;
}
</style>