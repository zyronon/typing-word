<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {$computed, $ref} from "vue/macros";
import {watch} from "vue";
import {DictResource} from "@/types.ts";

const props = defineProps<{
  category: string,
  groupByTag: any,
  selectDictName: string
}>()
const emit = defineEmits<{
  selectDict: [index: DictResource],
  detail: [],
}>()
const tagList = $computed(() => Object.keys(props.groupByTag))
let currentTag = $ref(tagList[0])
let list = $computed(() => {
  return props.groupByTag[currentTag]
})

watch(() => props.groupByTag, () => {
  currentTag = tagList[0]
})

</script>

<template>
  <div class="dict-group">
    <div class="category">{{ category }}</div>
    <div class="tags">
      <div class="tag" :class="i === currentTag &&'active'"
           @click="currentTag = i"
           v-for="i in Object.keys(groupByTag)">{{ i }}
      </div>
    </div>
    <div class="dict-list">
      <div class="dict-item anim"
           :class="selectDictName === i.name && 'active'"
           @click="emit('selectDict',i)"
           v-for="i in list"
      >
        <div class="name">{{ i.name }}</div>
        <div class="desc">{{ i.description }}</div>
        <div class="num">{{ i.length }}词</div>

        <Icon icon="octicon:arrow-right-24" v-if="selectDictName === i.name"
              @click.stop="emit('detail')"
              class="go" width="20" color="#929596"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dict-group {
  color: black;
  margin-bottom: 40rem;
  //border-bottom: 1px dashed gray;

  .category {
    font-size: 24rem;
    padding-bottom: 10rem;
    border-bottom: 1px dashed gray;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin: 10rem 0;

  .tag {
    color: var(--color-font-1);
    cursor: pointer;
    padding: 5rem 10rem;
    border-radius: 20rem;

    &.active {
      color: var(--color-font-active-1);
      background: gray;
    }
  }
}

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
}
</style>