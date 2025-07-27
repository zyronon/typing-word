<script setup lang="ts">
import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";

const props = defineProps<{
  item?: Dict
  quantifier?: string
  isAdd: boolean
  showCheckbox?: boolean
  checked?: boolean
}>()

defineEmits<{
  check: []
}>()

const progress = $computed(() => {
  return Number(((props.item?.lastLearnIndex / props.item?.length) * 100).toFixed())
})
</script>

<template>
  <div class="book relative">
    <template v-if="!isAdd">
      <div>
        <div>{{ item?.name }}</div>
        <div class="text-sm line-clamp-3" v-opacity="item.name !== item.description">{{ item?.description }}</div>
      </div>
      <div class="absolute bottom-4 right-4">
        <div>{{ item?.lastLearnIndex ? item?.lastLearnIndex + '/' : '' }}{{ item?.length }}{{ quantifier }}</div>
      </div>
      <div class="absolute bottom-2 left-4 right-4">
        <el-progress v-if="item?.lastLearnIndex" class="mt-1"
                     :percentage="progress"
                     :show-text="false"></el-progress>
      </div>
      <el-checkbox v-if="showCheckbox"
                   :model-value="checked"
                   @click.stop="$emit('check')"
                   class="absolute left-3 bottom-2"/>
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
