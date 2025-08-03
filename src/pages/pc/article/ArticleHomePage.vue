<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {Icon} from '@iconify/vue'
import "vue-activity-calendar/style.css";
import {useRouter} from "vue-router";
import {enArticle} from "@/assets/dictionary.ts";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {useNav} from "@/utils";
import {Dict, DictResource, getDefaultDict} from "@/types.ts";
import {cloneDeep} from "@/utils";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {getArticleBookDataByUrl} from "@/utils/article.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import Input from "@/pages/pc/components/Input.vue";
import {computed} from "vue";
import Book from "@/pages/pc/components/Book.vue";
import {ElMessage, ElProgress} from 'element-plus';
import BaseButton from "@/components/BaseButton.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";

const {nav} = useNav()
const base = useBaseStore()
const router = useRouter()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
let showAddChooseDialog = $ref(false)
let showSearchDialog = $ref(false)
let searchKey = $ref('')


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
    ElMessage.warning('请先选择一本书籍')
    return
  }
  router.push('/study-article')
}


let isMultiple = $ref(false)
let selectIds = $ref([])

function handleBatchDel() {
  selectIds.forEach(id => {
    let r = store.word.bookList.findIndex(v => v.id === id)
    if (r !== -1) {
      if (store.word.studyIndex === r) {
        store.word.studyIndex = -1
      }
      if (store.word.studyIndex > r) {
        store.word.studyIndex--
      }
      store.word.bookList.splice(r, 1)
    }
  })
  selectIds = []
  ElMessage.success("删除成功！")
}

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

async function goDictDetail(val: DictResource) {
  runtimeStore.editDict = getDefaultDict(val)
  nav('book-detail', {})
}
</script>

<template>
  <BasePage>
    <div class="card ">
      <div class="flex justify-between items-center">
        <div class="bg-third p-3 gap-4 rounded-md cursor-pointer flex items-center">
          <span class="text-lg font-bold"
                @click="getBookDetail2(base.currentBook)">{{
              base.currentBook.name || '请选择书籍开始学习'
            }}</span>
          <BaseIcon @click="showSearchDialog = true"
                    :icon="base.currentBook.name ? 'gg:arrows-exchange':'fluent:add-20-filled'"/>
        </div>
        <BaseButton
            size="large"
            @click="startStudy"
            :disabled="!base.currentBook.name"
        >
          <div class="flex items-center gap-2">
            <span>开始学习</span>
            <Icon icon="icons8:right-round" class="text-2xl"/>
          </div>
        </BaseButton>
      </div>
      <div class="mt-5 text-sm">已学习{{ base.currentBook.lastLearnIndex }}篇文章</div>
      <ElProgress class="mt-1" :percentage="base.currentBookProgress" :show-text="false"></ElProgress>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">我的书籍</div>
        <div class="flex gap-4 items-center">
          <PopConfirm title="确认删除所有选中书籍？" @confirm="handleBatchDel" v-if="selectIds.length">
            <BaseIcon class="del" title="删除" icon="solar:trash-bin-minimalistic-linear"/>
          </PopConfirm>

          <div class="color-blue cursor-pointer" v-if="store.article.bookList.length > 1"
               @click="isMultiple = !isMultiple; selectIds = []">{{ isMultiple ? '取消' : '管理书籍' }}
          </div>
          <div class="color-blue cursor-pointer" @click="nav('dict-detail', { isAdd: true })">创建个人书籍</div>
        </div>
      </div>
      <div class="grid grid-cols-6 gap-4  mt-4">
        <Book :is-add="false" quantifier="篇" :item="item" :checked="selectIds.includes(item.id)"
              @check="() => toggleSelect(item)"
              :show-checkbox="isMultiple && j >= 1"
              v-for="(item, j) in store.article.bookList"
              @click="goDictDetail(item)"/>
        <Book :is-add="true" @click="router.push('/dict-list')"/>
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

</style>
