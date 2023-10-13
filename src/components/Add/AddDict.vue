<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue"
import {Icon} from '@iconify/vue';
import {useSettingStore} from "@/stores/setting.ts";
import DictItem from "@/components/DictItem.vue";
import {DictType, Sort} from "@/types.ts";
import {$ref} from "vue/macros";
import {useDisableEventListener} from "@/hooks/event.ts";

const settingStore = useSettingStore()

const emit = defineEmits([
  'close',
])

let step = $ref(0)

useDisableEventListener()

let list = $ref([
  {
    name: '新概念英语2',
    sort: Sort.normal,
    type: DictType.publicDict,
    originWords: [],
    articles: [],
    words: [],
    chapterWordNumber: 15,
    chapterWords: [],
    chapterIndex: 0,
    chapterWordIndex: 0,
    statistics: [],
    url: '/dicts/NCE_2.json',
  },
  {
    name: '新概念英语2',
    sort: Sort.normal,
    type: DictType.publicDict,
    originWords: [],
    articles: [],
    words: [],
    chapterWordNumber: 15,
    chapterWords: [],
    chapterIndex: 0,
    chapterWordIndex: 0,
    statistics: [],
    url: '/dicts/NCE_2.json',
  },
  {
    name: '新概念英语2',
    sort: Sort.normal,
    type: DictType.publicDict,
    originWords: [],
    articles: [],
    words: [],
    chapterWordNumber: 15,
    chapterWords: [],
    chapterIndex: 0,
    chapterWordIndex: 0,
    statistics: [],
    url: '/dicts/NCE_2.json',
  }
])
</script>

<template>
  <Modal
      @close="emit('close')"
      title="添加词典">
    <div class="slide">
      <div class="slide-list" :class="`step${step}`">
        <div class="page">
          <div class="list">
            <DictItem :list="list"/>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.slide {
  width: 1100rem;
  height: 75vh;

  .slide-list {
    width: 200%;
    height: 100%;
    display: flex;
    transition: all .5s;
  }

  .step1 {
    transform: translate3d(-50%, 0, 0);
  }
}

</style>