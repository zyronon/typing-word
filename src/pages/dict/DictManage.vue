<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import {nextTick, onMounted, watch} from "vue"
import {Dict, DictResource, DictType} from "@/types.ts"
import {$ref} from "vue/macros";
import "vue-activity-calendar/style.css";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import ArticleDictDetail from "@/pages/dict/components/ArticleDictDetail.vue";
import WordDictDetail from "@/pages/dict/components/WordDictDetail.vue";
import DictListPanel from "@/components/DictListPanel.vue";
import EditDict from "@/pages/dict/components/EditDict.vue";
import {useRoute} from "vue-router";

const route = useRoute()
const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let detailRef = $ref()
let dictIsArticle = $ref(false)
let step = $ref(0)
let isAddDict = $ref(false)

async function selectDict(val: { dict: DictResource | Dict }, cb?: any) {
  step = 1
  isAddDict = false
  dictIsArticle = val.dict.type === DictType.article
  nextTick(() => {
    detailRef?.getDictDetail(val)
    cb?.()
  })
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
}

watch(() => store.load, v => {
  if (v) {
    // selectDict({dict: store.currentDict, index: 0})
  }
})

function addDict() {
  step = 1
  isAddDict = true
}

function back() {
  step = 0
}

function cancelAddDict() {
  step = 0
  setTimeout(() => {
    isAddDict = false
  }, 500)
}


onMounted(() => {
  // selectDict({dict: store.currentDict, index: 0})
  // console.log('router.params', route)
  switch (route.query.type) {
    case 'addDict':
      setTimeout(() => {
        addDict()
      }, 300)
      break
    case 'addWordOrArticle':
      setTimeout(() => {
        selectDict({dict: runtimeStore.editDict}, () => {
          detailRef?.add()
        })
      }, 300)
      break
    case 'detail':
      setTimeout(() => {
        selectDict({dict: runtimeStore.editDict})
      }, 300)
      break
    case 'editDict':
      setTimeout(() => {
        selectDict({dict: runtimeStore.editDict}, () => {
          detailRef?.editDict()
        })
      }, 300)
      break
  }
  emitter.on(EventKey.openDictModal, (type: 'detail' | 'list' | 'my' | 'collect' | 'simple') => {
    if (type === "detail") {
      selectDict({dict: store.currentDict})
    }
    if (type === "list") {
      // currentLanguage = 'en'
      step = 0
    }
    if (type === "my") {
      // currentLanguage = 'my'
      step = 0
    }
    if (type === "collect") {
      selectDict({dict: store.collect})
    }
    if (type === "simple") {
      selectDict({dict: store.simple})
    }
  })
  // console.log('categoryList', categoryList)
  // console.log('tagList', tagList)
})
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
            @cancel="cancelAddDict"
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

#DictDialog {
  font-size: 14rem;
  position: absolute;
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

