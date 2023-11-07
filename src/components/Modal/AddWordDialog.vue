<script setup lang="ts">

import {$ref} from "vue/macros";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useDisableEventListener} from "@/hooks/event.ts";
import {Dict, DictType, Sort} from "@/types.ts";
import {onMounted, reactive, watch} from "vue";
import {FormInstance, FormRules} from "element-plus";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {cloneDeep} from "lodash-es";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

const emit = defineEmits([
  'close',
])

useDisableEventListener()

let form = reactive({
  id: '',
  name: '123',
  description: '',
  category: '',
  tags: [],
  languageCategory: '',
  language: '',
})

let wordForm = reactive({
  name: '',
  translate: '',
  usphone: '',
  ukphone: '',
})

const ruleFormRef = $ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
    {max: 20, message: '名称不能超过20个字符', trigger: 'blur'},
  ],
})

async function onSubmit() {
  await ruleFormRef.validate((valid, fields) => {
    if (valid) {
      let data = {
        ...form,
      }
      if (form.id) {
        let rIndex = store.myDicts.findIndex(v => v.id === form.id)
        runtimeStore.editDict = data
        store.myDicts[rIndex] = cloneDeep(data)
      } else {
        if (store.myDicts.find(v => v.name === form.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          runtimeStore.editDict = data
          store.myDicts.push(cloneDeep(data))
          console.log('submit!', data)
        }
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function close() {
  emit('close')
}
</script>

<template>
  <div id="AddWordDialog">
    <el-form
        class="form"
        ref="ruleFormRef"
        :rules="rules"
        :model="wordForm"
        label-width="60px">
      <el-form-item label="单词" prop="name">
        <el-input v-model="wordForm.name"/>
      </el-form-item>
      <el-form-item label="翻译">
        <el-input v-model="wordForm.translate" type="textarea"/>
      </el-form-item>
      <el-form-item label="音标">
        <el-input v-model="wordForm.ukphone"/>
      </el-form-item>
      <div class="flex-center">
        <el-button @click="step = 0">返回</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

#AddWordDialog {
  position: fixed;
  width: 400rem;
  height: 300rem;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  z-index: 9999999;
  background: var(--color-second-bg);

  display: flex;
  align-items: center;
  justify-content: center;
  $header-height: 60rem;

  .form {
    width: 90%;
  }

}
</style>