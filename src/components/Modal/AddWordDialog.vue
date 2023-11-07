<script setup lang="ts">

import WordList from "@/components/WordList.vue";
import {$computed, $ref} from "vue/macros";
import Slide from "@/components/Slide.vue";
import DictList from "@/components/DictList.vue";
import {Icon} from "@iconify/vue";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useDisableEventListener} from "@/hooks/event.ts";
import {Dict, DictType, languageCategoryOptions, Sort} from "@/types.ts";
import {onMounted, reactive, watch} from "vue";
import {FormInstance, FormRules} from "element-plus";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {cloneDeep} from "lodash-es";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import ChapterList from "@/components/ChapterList.vue";

let data = $ref({
  words: [],
  index: 0
})


const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

const emit = defineEmits([
  'close',
])

let step = $ref(0)
let isEdit = $ref(true)

useDisableEventListener()

let list = $computed(() => {
  return store.myDicts.filter(v => v.type === DictType.customArticle)
      .concat([
        store.simple,
        store.wrong,
        store.collect
      ])
      .concat([{name: '',} as any])
})

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

let languageCategoryList = []
let categoryList = {}
let tagList = {}
const ruleFormRef = $ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
    {max: 20, message: '名称不能超过20个字符', trigger: 'blur'},
  ],
  category: [{required: true, message: '请选择', trigger: 'change'}],
  tags: [{required: true, message: '请选择', trigger: 'change'}],
  languageCategory: [{required: true, message: '请选择', trigger: 'change'}],
})

watch(() => form.languageCategory, () => form.category = '')
watch(() => form.category, () => form.tags = [])

onMounted(() => {
  dictionaryResources.map(v => {
    // if (!languageCategoryList.find(w => w === v.languageCategory)) {
    //   languageCategoryList.push(v.languageCategory)
    // }
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

  console.log('languageCategoryList', languageCategoryList)
  console.log('categoryList', categoryList)
  console.log('tagList', tagList)
})

function selectDict(dict: Dict) {
  runtimeStore.editDict = cloneDeep(dict)
  isEdit = false
  step = 1
}

async function onSubmit() {
  await ruleFormRef.validate((valid, fields) => {
    if (valid) {
      let data = {
        sort: Sort.normal,
        type: DictType.customArticle,
        originWords: [],
        words: [],
        chapterWordNumber: 30,
        chapterWords: [],
        chapterIndex: 0,
        chapterWordIndex: 0,
        statistics: [],
        articles: [],
        url: '',
        ...form,
      }
      if (form.id) {
        let rIndex = store.myDicts.findIndex(v => v.id === form.id)
        runtimeStore.editDict = data
        store.myDicts[rIndex] = cloneDeep(data)
        isEdit = false
      } else {
        if (store.myDicts.find(v => v.name === form.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          runtimeStore.editDict = data
          store.myDicts.push(cloneDeep(data))
          isEdit = false
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
      <el-form-item>
        <el-button @click="step = 0">返回</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

#AddWordDialog {
  position: fixed;
  width: 700rem;
  height: 70vh;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  z-index: 9999999;
  background: var(--color-second-bg);

  $header-height: 60rem;

}
</style>