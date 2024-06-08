<script setup lang="ts">

import BasePage from "@/pages/pc/components/BasePage.vue";
import {onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {assign, cloneDeep} from "lodash-es";
import {Word} from "@/types.ts";
import {nanoid} from "nanoid";
import BaseIcon from "@/components/BaseIcon.vue";
import {_checkDictWords, useNav} from "@/utils";
import {FormInstance, FormRules} from "element-plus";
import BaseTable from "@/pages/pc/components/BaseTable.vue";

const runtimeStore = useRuntimeStore()
const store = useBaseStore()
const route = useRoute()

let list = $computed({
  get() {
    return runtimeStore.editDict.words
  },
  set(v) {
    runtimeStore.editDict.words = v
  }
})

onMounted(() => {
  switch (Number(route.query.type)) {
    case -1:
      runtimeStore.editDict = cloneDeep(runtimeStore.routeData)
      _checkDictWords(runtimeStore.editDict)
      break
    case 0:
      runtimeStore.editDict = cloneDeep(store.collectWord)
      break
    case 1:
      runtimeStore.editDict = cloneDeep(store.wrong)
      break
    case 2:
      runtimeStore.editDict = cloneDeep(store.simple)
      break
    case 3:
      runtimeStore.editDict = cloneDeep(store.master)
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


</script>

<template>
  <BasePage>
    <header class="flex gap-4 mb-2 items-center">
      <BaseIcon @click="back" icon="octicon:arrow-left-24" width="20"/>
      <div class="left">
        <div class="top">
          <div class="text-xl">
            {{ runtimeStore.editDict.name }}
          </div>
        </div>
        <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
      </div>
    </header>
    <div class="flex h-140">
      <div class="w-1/2">
        <BaseTable
            class="h-full"
            ref="listRef"
            v-model:list="list">
          <template v-slot:suffix="{ item, index }">
            <BaseIcon
                class="del"
                @click="editWord(item)"
                title="编辑"
                icon="tabler:edit"/>
            <BaseIcon
                class="del"
                @click="del({item,index})"
                title="删除"
                icon="solar:trash-bin-minimalistic-linear"/>
          </template>
        </BaseTable>
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