<script setup lang="ts">

import {Dict, DictType, getDefaultDict} from "@/types.ts";
import {cloneDeep} from "lodash-es";

import {FormInstance, FormRules} from "element-plus";
import {onMounted, reactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {syncMyDictList} from "@/hooks/dict.ts";

const props = defineProps<{
  isAdd: boolean,
  isBook: boolean
}>()
const emit = defineEmits<{
  submit: []
  close: []
}>()
const runtimeStore = useRuntimeStore()
const store = useBaseStore()
const DefaultDictForm = {
  id: '',
  name: '',
  description: '',
  category: '',
  tags: [],
  translateLanguage: 'zh-CN',
  language: 'en',
  type: DictType.article
}
let dictForm: any = $ref(cloneDeep(DefaultDictForm))
const dictFormRef = $ref<FormInstance>()
const dictRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
    {max: 20, message: '名称不能超过20个字符', trigger: 'blur'},
  ],
})

async function onSubmit() {
  await dictFormRef.validate((valid) => {
    if (valid) {
      let data: Dict = cloneDeep({
        ...getDefaultDict(),
        ...dictForm,
      })
      let source = [store.article, store.word][props.isBook ? 0 : 1]
      //任意修改，都将其变为自定义词典
      data.custom = true

      if (props.isAdd) {
        data.id = 'custom-dict-' + Date.now()
        //TODO 允许同名？
        if (source.bookList.find(v => v.name === data.name)) {
          return ElMessage.warning('已有相同名称书籍！')
        } else {
          source.bookList.push(data)
          runtimeStore.editDict = data
          emit('submit')
          ElMessage.success('添加成功')
        }
      } else {
        let rIndex = source.bookList.findIndex(v => v.id === data.id)
        if (rIndex > -1) {
          source.bookList[rIndex] = cloneDeep(data)
          runtimeStore.editDict = cloneDeep(data)
          emit('submit')
          ElMessage.success('修改成功')
        } else {
          ElMessage.warning('修改失败')
        }
      }
      console.log('submit!', data)
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

onMounted(() => {
  if (!props.isAdd) {
    dictForm = cloneDeep(runtimeStore.editDict)
  }
})

</script>

<template>
  <div class="w-120 mt-4">
    <el-form
        ref="dictFormRef"
        :rules="dictRules"
        :model="dictForm"
        label-width="8rem">
      <el-form-item label="名称" prop="name">
        <el-input v-model="dictForm.name"/>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="dictForm.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="原文语言">
        <el-select v-model="dictForm.language" placeholder="请选择选项">
          <el-option label="英语" value="en"/>
          <el-option label="德语" value="de"/>
          <el-option label="日语" value="ja"/>
          <el-option label="代码" value="code"/>
        </el-select>
      </el-form-item>
      <el-form-item label="译文语言">
        <el-select v-model="dictForm.translateLanguage" placeholder="请选择选项">
          <el-option label="中文" value="zh-CN"/>
          <el-option label="英语" value="en"/>
          <el-option label="德语" value="de"/>
          <el-option label="日语" value="ja"/>
        </el-select>
      </el-form-item>
      <div class="center">
        <el-button @click="emit('close')">关闭</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped lang="scss">


</style>
