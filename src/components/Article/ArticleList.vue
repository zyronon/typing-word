<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import Input from "@/components/Input.vue";
import {$computed, $ref} from "vue/macros";
import {cloneDeep, throttle} from "lodash-es";
import {Article} from "@/types.ts";
import ListItem from "@/components/ListItem.vue";

interface IProps {
  list: Article[]
  selectItem: Article,
}

const props = defineProps<IProps>()
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

let el: HTMLDivElement = $ref()

function scrollBottom() {
  el.scrollTo({
    top: el.scrollHeight,
    left: 0,
    behavior: "smooth",
  });
}

defineExpose({scrollBottom})

</script>

<template>
  <div class="list-wrapper"
       ref="el"
  >
    <div class="search">
      <Input v-model="searchKey"/>
    </div>
    <ListItem @click="emit('selectItem',item)"
              v-for="(item,index) in localList"
              :key="item.id">
      <div class="name"> {{ `${index + 1}. ${item.title}` }}</div>
      <div class="translate-name"> {{ `   ${item.titleTranslate}` }}</div>
    </ListItem>
  </div>
</template>

<style scoped lang="scss">
.list-wrapper {
  transition: all .3s;
  flex: 1;
  overflow: overlay;
  padding-right: 5rem;

  .search {
    margin: 10rem 0;
    width: 100%;
  }

  .list {
  }

}
</style>