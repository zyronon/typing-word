<script setup lang="ts">

import Input from "@/components/Input.vue";
import {$computed, $ref} from "vue/macros";
import {Article, Word} from "@/types.ts";
import ListItem from "@/components/ListItem.vue";
import {useSettingStore} from "@/stores/setting.ts";
import {watch} from "vue";


const props = withDefaults(defineProps<{
  list: Article[],
  activeIndex?: number,
  isActive?: boolean
}>(), {
  activeIndex: -1,
  isActive: false
})

const emit = defineEmits<{
  selectItem: [val: Article],
  delSelectItem: [],
  'update:searchKey': [val: string],
  'update:list': [list: Article[]],
}>()

let searchKey = $ref('')
let localList = $computed({
  get() {
    if (searchKey) {
      return props.list.filter((item: Article) => {
        //把搜索内容，分词之后，判断是否有这个词，比单纯遍历包含体验更好
        return searchKey.toLowerCase().split(' ').filter(v => v).some(value => {
          return item.title.toLowerCase().includes(value) || item.titleTranslate.toLowerCase().includes(value)
        })
      })
    } else {
      return props.list
    }
  },
  set(newValue) {
    emit('update:list', newValue)
  }
})

const settingStore = useSettingStore()

const listRef: HTMLElement = $ref(null as any)

function scrollViewToCenter(index: number) {
  if (index === -1) return
  listRef.children[index + 1]?.scrollIntoView({block: 'center', behavior: 'smooth'})
}

watch(() => props.activeIndex, (n: any) => {
  if (settingStore.showPanel) {
    scrollViewToCenter(n)
  }
})

watch(() => props.isActive, (n: boolean) => {
  setTimeout(() => {
    if (n) scrollViewToCenter(props.activeIndex)
  }, 300)
})

watch(() => props.list, () => {
  listRef.scrollTo(0, 0)
})

</script>

<template>
  <div class="list"
       ref="listRef"
  >
    <div class="search">
      <Input v-model="searchKey"/>
    </div>
    <ListItem
        @click="emit('selectItem',item)"
        v-for="(item,i) in localList"
        :active="activeIndex === i"
        :key="item.id">
      <div class="name"> {{ `${i + 1}. ${item.title}` }}</div>
      <div class="translate"> {{ `   ${item.titleTranslate}` }}</div>
    </ListItem>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

.list {
  display: flex;
  flex-direction: column;
  gap: 15rem;
  flex: 1;
  overflow: overlay;
  padding: 0 $space;

  .search {
    width: 100%;
  }

  .translate {
    font-size: 16rem;
  }
}
</style>