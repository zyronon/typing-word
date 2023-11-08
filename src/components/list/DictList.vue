<script setup lang="ts">
import {Dict} from "@/types.ts";
import {Icon} from "@iconify/vue";

const props = defineProps<{
  list?: Dict[],
  selectDictName?: string
}>()

const emit = defineEmits<{
  selectDict: [val: Dict]
  detail: [],
  add: []
}>()

</script>

<template>
  <div class="dict-list">
    <template v-for="i in list">
      <div class="dict-item anim"
           :class="selectDictName === i.name && 'active'"
           @click="emit('selectDict',i)"
           v-if="i.name"
      >
        <div class="name">{{ i.name }}</div>
        <div class="desc">{{ i.description }}</div>
        <div class="num">{{ i.length }}词</div>

        <Icon icon="octicon:arrow-right-24" v-if="selectDictName === i.name"
              @click.stop="emit('detail')"
              class="go" width="20" color="#929596"/>
      </div>
      <div v-else class="dict-item add" @click.stop="emit('add')">
        <Icon icon="fluent:add-20-filled" width="60" color="#929596"/>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.dict-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15rem;

  .dict-item {
    cursor: pointer;
    padding: 10rem;
    min-height: 100rem;
    border-radius: 10rem;
    position: relative;
    background: var(--color-item-bg);
    color: var(--color-font-1);
    font-size: 14rem;

    .name {
      font-size: 18rem;
    }

    .desc {
      color: var(--color-font-2);
    }

    .num {
      font-weight: bold;
    }

    .go {
      position: absolute;
      right: 10rem;
      bottom: 15rem;
    }

    &.active {
      background: var(--color-item-active);
      color: var(--color-font-active-1);

      .desc {
        color: var(--color-font-active-2);
      }
    }
  }

  .add {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

</style>