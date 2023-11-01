<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import VolumeIcon from "@/components/VolumeIcon.vue";

defineProps<{
  showVolume?: boolean,
  showDel?: boolean,
  active?: boolean
  isCollect: boolean
  isSimple: boolean
}>()

defineEmits<{
  toggleSimple: [],
  toggleCollect: [],
  del: [],
}>()
</script>

<template>
  <div class="list-item"
       :class="{active}"
  >
    <div class="left">
      <slot></slot>
    </div>
    <div class="right">
      <BaseIcon
          v-if="showDel"
          class-name="del"
          @click="$emit('del')"
          title="移除"
          icon="solar:trash-bin-minimalistic-linear"/>
      <template v-else>
        <BaseIcon
            v-if="!isCollect"
            class-name="collect"
            @click="$emit('toggleCollect')"
            title="收藏" icon="ph:star"/>
        <BaseIcon
            v-else
            class-name="fill"
            @click="$emit('toggleCollect')"
            title="取消收藏" icon="ph:star-fill"/>


        <BaseIcon
            v-if="!isSimple"
            class-name="easy"
            @click="$emit('toggleSimple')"
            title="标记为简单词(快捷键：`)"
            icon="material-symbols:check-circle-outline-rounded"/>
        <BaseIcon
            v-else
            class-name="fill"
            @click="$emit('toggleSimple')"
            title="取消标记简单词(快捷键：`)"
            icon="material-symbols:check-circle-rounded"/>

      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-item {
  width: 100%;
  box-sizing: border-box;
  background: var(--color-item-bg);
  color: var(--color-font-1);
  font-size: 18rem;
  border-radius: 8rem;
  display: flex;
  justify-content: space-between;
  transition: all .3s;
  padding: 10rem;
  gap: 20rem;

  .left {
    display: flex;
    gap: 10rem;
    flex-direction: column;
    word-break: break-word;
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: 5rem;
    transition: all .3s;
  }

  :deep(.collect) {
    opacity: 0;
  }

  :deep(.easy) {
    opacity: 0;
  }

  &:hover {
    background: rgb(226, 226, 226);

    :deep(.collect) {
      opacity: 1;
    }

    :deep(.easy) {
      opacity: 1;
    }
  }

  &.active {
    background: var(--color-item-active);
    color: white !important;

    $c: #E6A23C;

    :deep(.collect) {
      color: $c;
    }

    :deep(.fill) {
      color: $c;
    }

    :deep(.easy) {
      color: $c;
    }
  }
}
</style>