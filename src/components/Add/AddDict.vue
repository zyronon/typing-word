<script setup lang="ts">

import WordList from "@/components/list/WordList.vue";
import {$computed, $ref} from "vue/macros";
import Slide from "@/components/Slide.vue";
import DictList from "@/components/list/DictList.vue";
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
import ChapterList from "@/components/list/ChapterList.vue";

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
  return store.myDictList.filter(v => v.type === DictType.customArticle)
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
        let rIndex = store.myDictList.findIndex(v => v.id === form.id)
        runtimeStore.editDict = data
        store.myDictList[rIndex] = cloneDeep(data)
        isEdit = false
      } else {
        if (store.myDictList.find(v => v.name === form.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          runtimeStore.editDict = data
          store.myDictList.push(cloneDeep(data))
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
    <Slide slide-count="2" :step="step">
      <div class="page dict-list-page">
        <header>
          <div class="title">
            我的词典
          </div>
          <Icon @click="close"
                class="hvr-grow pointer"
                width="20" color="#929596"
                icon="ion:close-outline"/>
        </header>
        <div class="list">
          <DictList
              @add="step = 1;isEdit = true"
              @selectDict="selectDict"
              :list="list"/>
        </div>
      </div>
      <div class="page add-page">
        <header>
          <div class="left" @click.stop="step = 0">
            <Icon icon="octicon:arrow-left-24" class="go" width="20"/>
            <div class="title">
              词典详情
            </div>
          </div>
          <Icon @click="close"
                class="hvr-grow pointer"
                width="20" color="#929596"
                icon="ion:close-outline"/>
        </header>
        <div class="detail" v-if="!isEdit">
          <div class="dict">
            <div class="info">
              <div class="name">{{ runtimeStore.editDict.name }}</div>
              <div class="desc">{{ runtimeStore.editDict.description }}</div>
              <div class="num">总文章：{{ runtimeStore.editDict.articles.length }}篇</div>
              <div class="num">创建日期：-</div>
              <div class="num">花费时间：-</div>
              <div class="num">累积错误：-</div>
              <div class="num">进度：
                <el-progress :percentage="10"
                             :stroke-width="8"
                             :show-text="false"/>
              </div>
            </div>
            <div class="add" v-if="false">
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
          </div>
          <div class="list">
            <div class="list-header">
              <div class="name">{{ runtimeStore.editDict.name }}</div>
              <div class="flex-center gap10">
                <div class="name">{{ runtimeStore.editDict.words.length }}个单词</div>
                <Icon @click="emitter.emit(EventKey.openArticleListModal)"
                      class="hvr-grow pointer"
                      width="24" color="#929596"
                      icon="mi:add"/>
              </div>
            </div>
            <WordList
                class="word-list"
                :is-active="true"
                @change="(i:number) => data.index = i"
                :list="runtimeStore.editDict.words"
                :activeIndex="data.index"/>
          </div>
        </div>
        <div class="edit" v-else>
          <el-form
              ref="ruleFormRef"
              :rules="rules"
              :model="form"
              label-width="120px">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea"/>
            </el-form-item>
            <el-form-item label="分类" prop="languageCategory">
              <el-select
                  v-model="form.languageCategory" placeholder="请选择选项">
                <el-option :label="i.name" :value="i.id" v-for="i in languageCategoryOptions"/>
              </el-select>
            </el-form-item>
            <el-form-item label="用途" prop="category">
              <el-select v-model="form.category" placeholder="请选择选项">
                <el-option :label="i" :value="i" v-for="i in categoryList[form.languageCategory]"/>
              </el-select>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
              <el-select
                  multiple
                  v-model="form.tags" placeholder="请选择选项">
                <el-option :label="i" :value="i" v-for="i in tagList[form.category]"/>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="step = 0">返回</el-button>
              <el-button type="primary" @click="onSubmit">确定</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </Slide>
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


  header {
    color: var(--color-font-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: $header-height;

    .left {
      cursor: pointer;
      display: flex;
      gap: 10rem;
      align-items: center;
    }
  }

  .dict-list-page {
    padding: 0 var(--space);
    box-sizing: border-box;

  }

  .add-page {
    color: var(--color-font-1);
    //display: flex;
    //flex-direction: column;

    header {
      padding: 0 var(--space);
    }

    .detail {
      flex: 1;
      height: calc(100% - $header-height);
      display: flex;
      position: relative;

      .dict {
        width: 50%;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);
        padding-left: var(--space);
        box-sizing: border-box;

        .info {
          border-radius: 8rem;
          background: gray;
          padding: 20rem;

          .name {
            font-size: 28rem;
            margin-bottom: 10rem;
          }

          .desc {
            font-size: 18rem;
            margin-bottom: 30rem;
          }
        }
      }

      .list {
        flex: 1;
        display: flex;
        flex-direction: column;
        font-size: 14rem;
        padding-bottom: 20rem;

        .list-header {
          min-height: 50rem;
          padding: 10rem 24rem;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16rem;
          color: var(--color-font-3);

          .name {
            font-size: 18rem;
          }
        }
      }
    }
  }
}
</style>