<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import {nextTick, onMounted, watch} from "vue"
import {Dict, DictResource, DictType, Sort} from "@/types.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es";
import {$ref} from "vue/macros";
import "vue-activity-calendar/style.css";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import ArticleDictDetail from "@/pages/dict/components/ArticleDictDetail.vue";
import WordDictDetail from "@/pages/dict/components/WordDictDetail.vue";
import DictListPanel from "@/pages/dict/components/DictListPanel.vue";
import EditDict from "@/pages/dict/components/EditDict.vue";


const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let detailRef = $ref()
let dictIsArticle = $ref(false)
let step = $ref(1)
let isAddDict = $ref(false)

async function selectDict(val: {
  dict: DictResource | Dict,
  index: number
}) {
  step = 1
  isAddDict = false
  dictIsArticle = val.dict.type === DictType.article
  nextTick(() => {
    detailRef?.getDictDetail(val)
  })
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
}

function changeSort(v: Sort) {
  if (v === Sort.normal) {
    runtimeStore.editDict.words = cloneDeep(runtimeStore.editDict.originWords)
  } else if (v === Sort.random) {
    runtimeStore.editDict.words = shuffle(runtimeStore.editDict.originWords)
  } else {
    runtimeStore.editDict.words = reverse(runtimeStore.editDict.originWords)
  }
  // resetChapterList()
}

/**/
/*词典相关*/
/**/


let categoryList = {}
let tagList = {}


/**/
/*词典相关*/
/**/

watch(() => step, v => {
  if (v === 0) {
    // closeWordForm()
    // closeDictForm()
    // chapterWordNumber = settingStore.chapterWordNumber
  }
})

watch(() => store.load, v => {
  if (v) {
    selectDict({dict: store.currentDict, index: 0})
  }
})

onMounted(() => {

  selectDict({dict: store.currentDict, index: 0})

  emitter.on(EventKey.openDictModal, (type: 'detail' | 'list' | 'my' | 'collect' | 'simple') => {
    if (type === "detail") {
      selectDict({dict: store.currentDict, index: 0})
    }
    if (type === "list") {
      currentLanguage = 'en'
      step = 0
    }
    if (type === "my") {
      currentLanguage = 'my'
      step = 0
    }
    if (type === "collect") {
      selectDict({dict: store.collect, index: 0})
      // addWord('residue')
    }
    if (type === "simple") {
      selectDict({dict: store.simple, index: 0})
      // addWord('residue')
    }
  })
  // console.log('categoryList', categoryList)
  // console.log('tagList', tagList)
})


function addDict() {
  step = 1
  isAddDict = true
}

function back() {
  step = 0
  // isAddDict = false
}


</script>

<template>
  <div id="DictDialog">
    <Slide :slide-count="2" :step="step">
      <DictListPanel
          @add="addDict"
          @select-dict="selectDict"
      />
      <div class="dict-detail-page">
        <EditDict
            v-if="isAddDict"
            :isAdd="true"
            @cancel="isAddDict = false;step = 0"
            @submit="selectDict({dict:runtimeStore.editDict})"/>
        <template v-else>
          <ArticleDictDetail
              ref="detailRef"
              @back="back"
              v-if="dictIsArticle"/>
          <WordDictDetail
              ref="detailRef"
              @back="back"
              v-else/>
        </template>
      </div>
    </Slide>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

$modal-mask-bg: rgba(#000, .15);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

#DictDialog {
  font-size: 14rem;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 80vw;
  height: 75vh;
}

.dict-detail-page {
  width: 50%;
  height: 100%;
}
</style>

