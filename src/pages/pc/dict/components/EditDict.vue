<script setup lang="ts">

import {DefaultDict, Dict, DictType} from "@/types.ts";
import {cloneDeep} from "lodash-es";

import {FormInstance, FormRules} from "element-plus";
import {onMounted, reactive, watch} from "vue";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {syncMyDictList} from "@/hooks/dict.ts";

const props = defineProps<{
  isAdd: boolean
}>()
const emit = defineEmits<{
  submit: []
  cancel: []
}>()
const runtimeStore = useRuntimeStore()
const store = useBaseStore()
let categoryList = {}
let tagList = {}
let init = false
const DefaultDictForm = {
  id: '',
  name: '',
  description: '',
  category: '',
  tags: [],
  translateLanguage: 'zh-CN',
  language: 'en',
  type: DictType.word
}
let dictForm: any = $ref(cloneDeep(DefaultDictForm))
const dictFormRef = $ref<FormInstance>()
const dictRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
    {max: 20, message: '名称不能超过20个字符', trigger: 'blur'},
  ],
  category: [{required: true, message: '请选择', trigger: 'change'}],
  tags: [{required: true, message: '请选择', trigger: 'change'}],
})

watch(() => dictForm.language, () => init && (dictForm.category = ''))
watch(() => dictForm.category, () => init && (dictForm.tags = []))

function closeDictForm() {
  emit('cancel')
}

async function onSubmit() {
  await dictFormRef.validate((valid, fields) => {
    if (valid) {
      let data: Dict = cloneDeep({
        ...DefaultDict,
        ...dictForm,
      })
      //任意修改，都将其变为自定义词典
      data.isCustom = true

      if (props.isAdd) {
        data.id = 'custom-dict-' + Date.now()
        //TODO 允许同名？
        if (store.myDictList.find(v => v.name === data.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          store.myDictList.push(data)
          runtimeStore.editDict = data
          ElMessage.success('添加成功')
        }
      } else {
        syncMyDictList(data)
        runtimeStore.editDict = data
        ElMessage.success('修改成功')
      }
      emit('submit')
      console.log('submit!', data)
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

onMounted(() => {
  dictionaryResources.map(v => {
    if (categoryList[v.language]) {
      if (!categoryList[v.language].find(w => w === v.category)) {
        categoryList[v.language].push(v.category)
      }
    } else {
      categoryList[v.language] = [v.category]
    }
    if (tagList[v.category]) {
      tagList[v.category] = Array.from(new Set(tagList[v.category].concat(v.tags)))
    } else {
      tagList[v.category] = v.tags
    }
  })

  if (props.isAdd) {
    dictForm = cloneDeep(DefaultDict)
  } else {
    dictForm = cloneDeep(runtimeStore.editDict)
  }
  //上面复制后，watch会检测到变更从而把其他值变成空。这里加一个限制
  setTimeout(() => {
    init = true
  })
})

</script>

<template>
  <div class="edit-dict">
    <div class="wrapper">
      <div class="common-title">{{ dictForm.id ? '修改' : '添加' }}词典</div>
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
        <el-form-item label="语言">
          <el-select v-model="dictForm.language" placeholder="请选择选项">
            <el-option label="英语" value="en"/>
            <el-option label="德语" value="de"/>
            <el-option label="日语" value="ja"/>
            <el-option label="代码" value="code"/>
          </el-select>
        </el-form-item>
        <el-form-item label="翻译语言">
          <el-select v-model="dictForm.translateLanguage" placeholder="请选择选项">
            <!--                <el-option label="通用" value="common"/>-->
            <el-option label="中文" value="zh-CN"/>
            <el-option label="英语" value="en"/>
            <el-option label="德语" value="de"/>
            <el-option label="日语" value="ja"/>
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="dictForm.category" placeholder="请选择选项">
            <el-option :label="i" :value="i" v-for="i in categoryList[dictForm.language]"/>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
              multiple
              v-model="dictForm.tags" placeholder="请选择选项">
            <el-option :label="i" :value="i" v-for="i in tagList[dictForm.category]"/>
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="dictForm.type" placeholder="请选择选项" :disabled="dictForm.id">
            <el-option label="单词" :value="DictType.word"/>
            <el-option label="文章" :value="DictType.article"/>
          </el-select>
        </el-form-item>
        <div class="flex-center">
          <el-button @click="closeDictForm">关闭</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-dict {
  flex: 1;
  width: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;

  .wrapper {
    width: 80rem;
  }

  .el-select {
    width: 100%;
  }
}

</style>