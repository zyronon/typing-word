<script setup lang="ts">
import {useSettingStore} from "@/stores/setting.ts";
import {nextTick, watch} from 'vue'
import {$computed} from "vue/macros";

const props = withDefaults(defineProps<{
  list?: any[],
  activeIndex?: number,
  activeId?: string,
  isActive?: boolean
  showBorder?: boolean
  static?: boolean
}>(), {
  list: [],
  activeIndex: -1,
  activeId: '',
  isActive: false,
  showBorder: false,
  static: true
})

const emit = defineEmits<{
  click: [val: {
    item: any,
    index: number
  }],
}>()

//虚拟列表长度限制
const limit = 99
const settingStore = useSettingStore()
const listRef: any = $ref()

const localActiveIndex = $computed(() => {
  if (props.activeId) {
    return props.list.findIndex(v => v.id === props.activeId)
  }
  return props.activeIndex
})

function scrollViewToCenter(index: number) {
  if (index === -1) return
  nextTick(()=>{
    if (props.list.length > limit) {
      listRef?.scrollToItem(index)
    } else {
      listRef?.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
    }
  })
}

watch(() => localActiveIndex, (n: any) => {
  if (props.static) return
  if (settingStore.showPanel) {
    scrollViewToCenter(n)
  }
})

watch(() => props.isActive, (n: boolean) => {
  if (props.static) return
  if (n) {
    setTimeout(() => scrollViewToCenter(localActiveIndex), 300)
  }
})

watch(() => props.list, () => {
  if (props.static) return
  nextTick(()=>{
    if (props.list.length > limit) {
      listRef?.scrollToItem(0)
    } else {
      listRef?.scrollTo(0, 0)
    }
  })
})

function scrollToBottom() {
  nextTick(()=>{
    listRef.scrollToBottom()
  })
}

function scrollToItem(index: number) {
  nextTick(()=>{
    listRef.scrollToItem(index)
  })
}

function itemIsActive(item: any, index: number) {
  return props.activeId ?
      props.activeId === item.id
      : props.activeIndex === index
}

defineExpose({scrollToBottom, scrollToItem})

</script>

<template>
  <DynamicScroller
      v-if="list.length>limit"
      :items="list"
      ref="listRef"
      :min-item-size="90"
      class="scroller"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
          item.id,
        ]"
          :data-index="index"
      >
        <div class="list-item-wrapper">
          <div class="common-list-item"
               :class="{
            active:itemIsActive(item,index),
            border:showBorder
          }"
               @click="emit('click',{item,index})"
          >
            <div class="left">
              <slot name="prefix" :item="item" :index="index"></slot>
              <div class="title-wrapper">
                <slot :item="item" :index="index"></slot>
              </div>
            </div>
            <div class="right">
              <slot name="suffix" :item="item" :index="index"></slot>
            </div>
          </div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <div
      v-else
      class="scroller"
      style="overflow: auto;"
      ref="listRef">
    <div class="list-item-wrapper"
         v-for="(item,index) in list"
         :key="item.id"
    >
      <div class="common-list-item"
           :class="{
            active:itemIsActive(item,index),
            border:showBorder
          }"
           @click="emit('click',{item,index})"
      >
        <div class="left">
          <slot name="prefix" :item="item" :index="index"></slot>
          <div class="title-wrapper">
            <slot :item="item" :index="index"></slot>
          </div>
        </div>
        <div class="right">
          <slot name="suffix" :item="item" :index="index"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/variable";

.scroller {
  flex: 1;
  padding: 0 var(--space);
}
</style>
