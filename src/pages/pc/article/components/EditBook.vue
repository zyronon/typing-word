<script setup lang="ts">

import {Dict, DictType, getDefaultDict} from "@/types.ts";
import {cloneDeep} from "@/utils";

import {ElForm,ElFormItem,ElInput,ElSelect,ElOption, FormInstance, FormRules} from "element-plus";
import {onMounted, reactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import BaseButton from "@/components/BaseButton.vue";

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
      let data: Dict = getDefaultDict(dictForm)
      let source = [store.article, store.word][props.isBook ? 0 : 1]
      //任意修改，都将其变为自定义词典
      //todo 可以检查的更准确些，比如json对比
      data.custom = true
      if (props.isAdd) {
        data.id = 'custom-dict-' + Date.now()
        if (source.bookList.find(v => v.name === data.name)) {
          ElMessage.warning('已有相同名称！')
          return
        } else {
          source.bookList.push(cloneDeep(data))
          runtimeStore.editDict = data
          emit('submit')
          ElMessage.success('添加成功')
        }
      } else {
        let rIndex = source.bookList.findIndex(v => v.id === data.id)
        runtimeStore.editDict = data
        if (rIndex > -1) {
          source.bookList[rIndex] = cloneDeep(data)
          emit('submit')
          ElMessage.success('修改成功')
        } else {
          source.bookList.push(cloneDeep(data))
          ElMessage.success('修改成功并加入我的词典')
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
    <ElForm
        ref="dictFormRef"
        :rules="dictRules"
        :model="dictForm"
        label-width="8rem">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="dictForm.name"/>
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput v-model="dictForm.description" type="textarea"/>
      </ElFormItem>
      <ElFormItem label="原文语言">
        <ElSelect v-model="dictForm.language" placeholder="请选择选项">
          <ElOption label="英语" value="en"/>
          <ElOption label="德语" value="de"/>
          <ElOption label="日语" value="ja"/>
          <ElOption label="代码" value="code"/>
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="译文语言">
        <ElSelect v-model="dictForm.translateLanguage" placeholder="请选择选项">
          <ElOption label="中文" value="zh-CN"/>
          <ElOption label="英语" value="en"/>
          <ElOption label="德语" value="de"/>
          <ElOption label="日语" value="ja"/>
        </ElSelect>
      </ElFormItem>
      <div class="center">
        <base-button type="info" @click="emit('close')">关闭</base-button>
        <base-button type="primary" @click="onSubmit">确定</base-button>
      </div>
    </ElForm>
  </div>
</template>

<style scoped lang="scss">


</style>
