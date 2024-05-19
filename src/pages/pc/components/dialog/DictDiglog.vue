<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts"
import {onMounted} from "vue"
import {DefaultDict, Dict, DictResource, DictType} from "@/types.ts"
import {chunk, cloneDeep} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import "vue-activity-calendar/style.css";
import WordListDialog from "@/pages/pc/components/dialog/WordListDialog.vue";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import EditBatchArticleModal from "@/pages/pc/components/article/EditBatchArticleModal.vue";
import {nanoid} from "nanoid";
import {useRouter} from "vue-router";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {getDictFile} from "@/utils";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let router = useRouter()

let show = $ref(false)
let chapterWordNumber = $ref(0)
let toggleLoading = $ref(false)


async function selectDict(val: { dict: DictResource | Dict, index: number }) {
  let item = val.dict
  // console.log('item', item)
  let find: Dict = store.myDictList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
    runtimeStore.editDict.id = nanoid(6)
    //设置默认章节单词数
    runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
  }

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {
  } else {
    //如果不是自定义词典，并且有url地址才去下载
    if (!runtimeStore.editDict.isCustom && runtimeStore.editDict.url) {
      let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
      if (runtimeStore.editDict.type === DictType.word) {
        if (!runtimeStore.editDict.originWords.length) {
          let v = await getDictFile(url)
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.originWords = cloneDeep(v)
        } else {
          runtimeStore.editDict.length = runtimeStore.editDict.words.length
        }
      }
      if (runtimeStore.editDict.type === DictType.article) {
        if (!runtimeStore.editDict.articles.length) {
          let v = await getDictFile(url)
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.articles = cloneDeep(v)
        } else {
          runtimeStore.editDict.length = runtimeStore.editDict.articles.length
        }
      }
    }
  }
  chapterWordNumber = runtimeStore.editDict.chapterWordNumber
}


function close() {
  show = false
}

//TODO 切大词典太卡了
function changeDict() {
  close()
  store.changeDict(runtimeStore.editDict)
  setTimeout(() => {
    runtimeStore.editDict = cloneDeep(DefaultDict)
  })
  ElMessage.success('切换成功')
}

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

function showAllWordModal() {
  emitter.emit(EventKey.openWordListModal, {
    title: runtimeStore.editDict.name,
    translateLanguage: runtimeStore.editDict.translateLanguage,
    list: runtimeStore.editDict.words
  })
}

function resetChapterList(v: number) {
  const temp = () => {
    runtimeStore.editDict.chapterWordNumber = v
    runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, runtimeStore.editDict.chapterWordNumber)
  }
  if (runtimeStore.editDict.isCustom) {

  } else {
    temp()
  }
}


function option(type: string) {
  show = false
  setTimeout(() => {
    router.push({path: '/pc/dict', query: {type: type}})
  }, 500)
}

onMounted(() => {
  emitter.on(EventKey.openDictModal, (type: 'detail' | 'list' | 'my') => {
    if (type === "detail") {
      selectDict({dict: store.currentDict, index: 0})
    }
    show = true
  })
})


</script>

<template>
  <Dialog
      :header="false"
      v-model="show"
      :show-close="false">
    <div id="DictDialog">
      <header>
        <div class="text-2xl">
          {{ runtimeStore.editDict.name }}
        </div>
        <Icon @click="close"
              class="hvr-grow pointer"
              width="20" color="#929596"
              icon="ion:close-outline"/>
      </header>
      <div class="detail">
        <div class="desc">{{ runtimeStore.editDict.description }}</div>
        <div class="text flex align-center">
          <div v-if="dictIsArticle">总文章：{{ runtimeStore.editDict.articles.length }}篇
          </div>
          <div v-else>总词汇：
            <span class="count" @click="showAllWordModal">{{
                runtimeStore.editDict.originWords.length
              }}词</span>
          </div>
          <BaseIcon icon="mi:add"
                    @click='option("addWordOrArticle")'
                    :title="`添加${dictIsArticle?'文章':'单词'}`"
          />
        </div>
        <div class="text">开始日期：-</div>
        <div class="text">花费时间：-</div>
        <div class="text">累积错误：-</div>
        <div class="text">进度：
          <el-progress :percentage="0"
                       :stroke-width="8"
                       :show-text="false"/>
        </div>
        <div class="row">
          <div class="label">每日目标</div>
          <el-slider
              class="my-slider"
              :min="10"
              :step="10"
              :max="runtimeStore.editDict.words.length < 10 ? 10 : 500"
              size="small"
              v-model="chapterWordNumber"
              @change="resetChapterList"
          />
        </div>
        <div class="notice">
          <span class="text">最小:10</span>
          <span class="text">最大:{{ runtimeStore.editDict.words.length < 10 ? 10 : 500 }}</span>
        </div>
      </div>
      <div class="footer">
        <BaseButton @click="close">关闭</BaseButton>
        <BaseButton :loading="toggleLoading" @click="changeDict">切换</BaseButton>
      </div>
    </div>
  </Dialog>
  <WordListDialog/>
  <EditBatchArticleModal/>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

$header-height: 4rem;

#DictDialog {
  //position: fixed;
  //left: 50%;
  //top: 50%;
  //transform: translate(-50%, -50%);
  background: var(--color-second-bg);
  z-index: 99999;
  width: 30rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    cursor: pointer;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    height: $header-height;
    align-items: center;
    justify-content: space-between;
    color: var(--color-font-3);
    padding: 0 var(--space);

    .left {
      display: flex;
      gap: .6rem;
      align-items: center;
    }
  }

  .detail {
    padding-left: var(--space);
    flex: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    gap: .2rem;
    position: relative;
    font-size: .9rem;
    padding-right: var(--space);

    .name {
      font-size: 1.6rem;
      width: 95%;
    }

    .desc {
      font-size: 1rem;
      margin-bottom: 1.2rem;
    }

    .count {
      cursor: pointer;
      border-bottom: 2px solid var(--color-item-active);
    }

    :deep(.edit-icon) {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  .footer {
    box-sizing: content-box;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: var(--space);
    padding-right: var(--space);
    margin: var(--space) 0;
  }
}


</style>

