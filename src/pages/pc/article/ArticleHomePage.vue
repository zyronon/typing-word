<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import {enArticle} from "@/assets/dictionary.ts";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {useNav} from "@/utils";
import {Dict, DictResource, getDefaultDict} from "@/types.ts";
import {cloneDeep} from "lodash-es";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {getArticleBookDataByUrl} from "@/utils/article.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import Input from "@/pages/pc/components/Input.vue";
import {computed} from "vue";

const {nav} = useNav()
const base = useBaseStore()
const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
let showAddChooseDialog = $ref(false)
let showSearchDialog = $ref(false)
let searchKey = $ref('')

function clickEvent(e) {
  console.log('e', e)
}

async function getBookDetail(val: DictResource) {
  let r = await getArticleBookDataByUrl(val)
  runtimeStore.editDict = cloneDeep(r)
  nav('book-detail')
}

async function getBookDetail2(val: Dict) {
  if (!val.name) {
    showSearchDialog = true
    return
  }
  runtimeStore.editDict = cloneDeep(val)
  nav('book-detail')
}

const searchList = computed(() => {
  if (searchKey) {
    return enArticle.filter(v => v.name.toLocaleLowerCase().includes(searchKey.toLocaleLowerCase()))
  }
  return []
})

function addBook() {
  showAddChooseDialog = false
  runtimeStore.editDict = getDefaultDict()
  nav('book-detail', {isAdd: true})
}

function startStudy() {
  if (!base.currentBook.name) {
    showSearchDialog = true
    return
  }
  router.push('/study-article')
}
</script>

<template>
  <BasePage>
    <div class="card ">
      <div class="flex justify-between items-center">
        <div class="bg-slate-200 p-3 gap-4 rounded-md cursor-pointer flex items-center">
          <span class="text-lg font-bold"
                @click="getBookDetail2(base.currentBook)">{{
              base.currentBook.name || '请选择书籍开始学习'
            }}</span>
          <BaseIcon @click="showSearchDialog = true"
                    :icon="base.currentBook.name ? 'gg:arrows-exchange':'fluent:add-20-filled'"/>
        </div>
        <div class="rounded-xl bg-slate-800 flex items-center py-3 px-5 text-white cursor-pointer"
             :class="base.currentBook.name || 'opacity-70 cursor-not-allowed'"
             @click="startStudy">
          开始学习
        </div>
      </div>
      <div class="mt-5 text-sm">已学习{{ base.currentBook.lastLearnIndex }}篇文章</div>
      <el-progress class="mt-1" :percentage="base.currentBookProgress" :show-text="false"></el-progress>
    </div>

    <div class="card  flex flex-col">
      <div class="title">
        我的
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <div class="book"
             v-for="dict in store.article.bookList"
             @click="getBookDetail2(dict)">
          <div>
            <div class="name">{{ dict.name }}</div>
            <div class="desc">{{ dict.description }}</div>
          </div>
          <div class="absolute bottom-4 right-4">{{ dict.length }}篇</div>
        </div>
        <div class="book" @click="showAddChooseDialog = true">
          <div class="center h-full">
            <Icon
                width="40px"
                icon="fluent:add-20-filled"/>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="title flex justify-between">
        <span>书籍列表</span>
        <BaseIcon @click="showSearchDialog = true" icon="fluent:search-24-regular"/>
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <div class="book"
             v-for="dict in enArticle"
             @click="getBookDetail(dict)">
          <div class="top">
            <div class="name">{{ dict.name }}</div>
            <div class="desc">{{ dict.description }}</div>
          </div>
          <div class="absolute bottom-4 right-4">{{ dict.length }}篇</div>
        </div>
      </div>
    </div>

    <Dialog v-model="showAddChooseDialog" title="选项">
      <div class="color-black px-6 w-100">
        <div class="cursor-pointer  hover:bg-black/10 p-2 rounded"
             @click="showAddChooseDialog = false,showSearchDialog = true">选择一本书籍
        </div>
        <p class="cursor-pointer  hover:bg-black/10 p-2 rounded" @click="addBook">创建自己的书籍</p>
      </div>
    </Dialog>

    <Dialog v-model="showSearchDialog"
            :show-close="false"
            @close="searchKey = ''"
            :header="false">
      <div class="color-black  w-140">
        <div class="p-4">
          <Input v-if="showSearchDialog" :autofocus="true" v-model="searchKey"/>
        </div>
        <div class="line"></div>
        <div v-if="searchList.length">
          <div class="p-4 min-h-40 max-h-140 overflow-auto">
            <div class="flex justify-between my-2 hover:bg-black/10 p-2 rounded"
                 v-for="dict in searchList"
                 @click="getBookDetail(dict)">
              <div class="name">{{ dict.name }}</div>
              <div class="">{{ dict.length }}篇</div>
            </div>
          </div>
        </div>
        <div v-else class="h-40 center flex-col text-xl color-black/60">
          <div> 请输入书籍名称搜索</div>
          <div>或直接在书籍列表选中</div>
        </div>
      </div>
    </Dialog>
  </BasePage>
</template>

<style scoped lang="scss">

</style>
