<script setup lang="ts">

import BasePage from "@/pages/pc/components/BasePage.vue";
import {onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {assign, cloneDeep, reverse, shuffle} from "lodash-es";
import {DefaultDict, Sort, Word} from "@/types.ts";
import {nanoid} from "nanoid";
import BaseIcon from "@/components/BaseIcon.vue";
import {Icon} from "@iconify/vue";
import {useNav} from "@/utils";
import {FormInstance, FormRules} from "element-plus";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import BaseButton from "@/components/BaseButton.vue";
import {$computed, $ref} from "vue/macros";

const runtimeStore = useRuntimeStore()
const store = useBaseStore()
const route = useRoute()

let show = $ref(false)
let searchKey = $ref('')
let list = $computed({
  get() {
    if (searchKey) {
      return runtimeStore.editDict.words.filter(v => v.word.includes(searchKey))
    }
    return runtimeStore.editDict.words
  },
  set(v) {
    runtimeStore.editDict.words = v
  }
})

onMounted(() => {
  switch (Number(route.query.type)) {
    case 0:
      runtimeStore.editDict = cloneDeep({
        ...cloneDeep(DefaultDict),
        id: nanoid(),
        name: '收藏',
        words: store.collectWord
      })
      break
    case 1:
      runtimeStore.editDict = cloneDeep({
        ...cloneDeep(DefaultDict),
        id: nanoid(),
        name: '错词本', words: store.wrong2
      })
      break
    case 2:
      runtimeStore.editDict = cloneDeep({
        ...cloneDeep(DefaultDict),
        id: nanoid(),
        name: '简单词', words: store.simple2
      })
      break
    default:
      break
  }
})
const {back} = useNav()


let wordFormData = $ref({
  where: '',
  type: '',
  id: '',
  index: 0
})

enum FormMode {
  None = '',
  Add = 'Add',
  Edit = 'Edit',
}

const DefaultFormWord = {
  word: '',
  phonetic0: '',
  phonetic1: '',
  trans: '',
}
let wordForm = $ref(cloneDeep(DefaultFormWord))
const wordFormRef = $ref<FormInstance>()
const wordRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入单词', trigger: 'blur'},
    {max: 30, message: '名称不能超过30个字符', trigger: 'blur'},
  ],
})

//TODO trans结构变了，
async function onSubmitWord() {
  await wordFormRef.validate((valid, fields) => {
    if (valid) {
      let data: any = cloneDeep(wordForm)
      if (data.trans) {
        data.trans = data.trans.split('\n');
      } else {
        data.trans = []
      }
      if (wordFormData.type === FormMode.Add) {
        data.id = nanoid(6)
        data.checked = false
        let r = list.find(v => v.word === wordForm.word)
        // if (r) return ElMessage.warning('已有相同名称单词！')
        // else list.push(data)
        list.push(data)
        ElMessage.success('添加成功')
        wordForm = cloneDeep(DefaultFormWord)
        // setTimeout(wordListRef?.scrollToBottom, 100)
      } else {
        let r = list.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        r = list.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        ElMessage.success('修改成功')
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(val: {
  item: Word
}) {
  let rIndex2 = list.findIndex(v => v.id === val.item.id)
  if (rIndex2 > -1) {
    list.splice(rIndex2, 1)
  }
  if (wordFormData.type === FormMode.Edit && wordForm.word === val.item.word) {
    closeWordForm()
  }
}

function batchDelWord() {
  console.log('multipleSelection', multipleSelection)
  multipleSelection.map(v => delWord({item: v}))
}

function editWord(word: Word,) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.join('\n')
}

function addWord() {
  // setTimeout(wordListRef?.scrollToBottom, 100)
  wordFormData.type = FormMode.Add
  wordForm = cloneDeep(DefaultFormWord)
}

function closeWordForm() {
  wordFormData.type = FormMode.None
  wordForm = cloneDeep(DefaultFormWord)
}


let multipleSelection = $ref<any[]>([])
const handleSelectionChange = (val: any[]) => {
  multipleSelection = val
}

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    list = reverse(cloneDeep(list))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    list = shuffle(cloneDeep(list))
  }
}


</script>

<template>
  <BasePage>
    <header class="flex gap-4">
      <div class="back" @click.stop="back">
        <Icon icon="octicon:arrow-left-24" width="20"/>
      </div>
      <div class="left">
        <div class="top">
          <div class="title">
            {{ runtimeStore.editDict.name }}
          </div>
        </div>
        <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
      </div>
    </header>
    <div class="flex">
      <div class="w-1/2">
        <div class="flex justify-end py-5 gap-2 relative">
          <el-input v-model="searchKey"/>
          <BaseIcon
              v-if="multipleSelection.length"
              @click="batchDelWord"
              class="del"
              title="删除"
              icon="solar:trash-bin-minimalistic-linear"/>
          <BaseIcon
              @click="addWord"
              icon="fluent:add-20-filled"
              title="添加单词"/>
          <BaseIcon
              title="改变顺序"
              icon="icon-park-outline:sort-two"
              @click="show = !show"
          />
          <MiniDialog
              v-model="show"
              style="width: 8rem;"
          >
            <div class="mini-row-title">
              列表循环设置
            </div>
            <div class="mini-row">
              <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
              <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
            </div>
          </MiniDialog>
        </div>
        <el-table :data="list"
                  @selection-change="handleSelectionChange"
                  max-height="80vh">
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="word" label="单词" width="120"/>
          <el-table-column prop="trans" label="翻译" width="180">
            <template #default="scope">
              {{ scope.row.trans.map(v => v.cn) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="editWord( scope.row)">
                Edit
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="delWord({item: scope.row})"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="add w-1/2" v-if="wordFormData.type">
        <div class="common-title">
          {{ wordFormData.type === FormMode.Add ? '添加' : '修改' }}单词
        </div>
        <el-form
            class="form"
            ref="wordFormRef"
            :rules="wordRules"
            :model="wordForm"
            label-width="6rem">
          <el-form-item label="单词" prop="word">
            <el-input v-model="wordForm.word"/>
          </el-form-item>
          <el-form-item label="翻译">
            <el-input v-model="wordForm.trans"
                      placeholder="多个翻译请换行"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                      type="textarea"/>
          </el-form-item>
          <el-form-item label="音标/发音①">
            <el-input v-model="wordForm.phonetic0"/>
          </el-form-item>
          <el-form-item label="音标/发音②">
            <el-input v-model="wordForm.phonetic1"/>
          </el-form-item>
          <div class="flex-center">
            <el-button @click="closeWordForm">关闭</el-button>
            <el-button type="primary" @click="onSubmitWord">保存</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

</style>