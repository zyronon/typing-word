<script setup lang="ts">
import {Dict, DictResource} from "@/types.ts";
import {Icon} from "@iconify/vue";
import {ElProgress, ElCheckbox} from 'element-plus';

const props = defineProps<{
  item?: Partial<Dict>;
  quantifier?: string
  isAdd: boolean
  showCheckbox?: boolean
  checked?: boolean
}>()

defineEmits<{
  check: []
}>()

const progress = $computed(() => {
  if (props.item?.complete) return 100
  return Number(((props.item?.lastLearnIndex / props.item?.length) * 100).toFixed())
})

const studyProgress = $computed(() => {
  if (props.item.complete) return props.item?.length + '/'
  return props.item?.lastLearnIndex ? props.item?.lastLearnIndex + '/' : ''
})
</script>

<template>
  <div class="book relative overflow-hidden">
    <template v-if="!isAdd">
      <div>
        <div>{{ item?.name }}</div>
        <div class="text-sm line-clamp-3" v-opacity="item.name !== item.description">{{ item?.description }}</div>
      </div>
      <div class="absolute bottom-4 right-4">
        <div>{{ studyProgress }}{{ item?.length }}{{ quantifier }}</div>
      </div>
      <div class="absolute bottom-2 left-4 right-4">
        <ElProgress v-if="item?.lastLearnIndex || item.complete" class="mt-1"
                    :percentage="progress"
                    :show-text="false"></ElProgress>
      </div>
      <ElCheckbox v-if="showCheckbox"
                  :model-value="checked"
                  @click.stop="$emit('check')"
                  class="absolute left-0 bottom-0 h-5!"/>
      <div class="custom" v-if="item.custom">自定义</div>
    </template>
    <div v-else class="center h-full">
      <Icon
          width="40px"
          icon="fluent:add-20-filled"/>
    </div>

  </div>
</template>

<style scoped lang="scss">
.custom {
  position: absolute;
  top: 4px;
  right: -22px;
  padding: 1px 20px;
  background: whitesmoke;
  font-size: 11px;
  transform: rotate(45deg);
}
</style>
