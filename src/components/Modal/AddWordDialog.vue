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
import {DefaultDict, Dict, DictType, languageCategoryOptions, Sort, Word} from "@/types.ts";
import {onMounted, reactive, watch} from "vue";
import {FormInstance, FormRules} from "element-plus";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {cloneDeep} from "lodash-es";
import Empty from "@/components/Empty.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList2 from "@/components/list/WordList2.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {useWordOptions} from "@/hooks/dict.ts";

let data = $ref({
  words: [],
  index: -1
})

useDisableEventListener()

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

const emit = defineEmits([
  'close',
])

let step = $ref(1)
let isAddDict = $ref(false)

let list = $computed(() => {
  return [
    store.collect,
    store.simple,
    store.wrong
  ].concat(store.myDicts.filter(v => v.type === DictType.customArticle))
      .concat([{name: '',} as any])
})

let languageCategoryList = []
let categoryList = {}
let tagList = {}

let dictForm = reactive({
  id: '',
  name: '123',
  description: '',
  category: '',
  tags: [],
  languageCategory: '',
  language: '',
})
const dictFormRef = $ref<FormInstance>()
const dictRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
    {max: 20, message: '名称不能超过20个字符', trigger: 'blur'},
  ],
  category: [{required: true, message: '请选择', trigger: 'change'}],
  tags: [{required: true, message: '请选择', trigger: 'change'}],
  languageCategory: [{required: true, message: '请选择', trigger: 'change'}],
})

watch(() => dictForm.languageCategory, () => dictForm.category = '')
watch(() => dictForm.category, () => dictForm.tags = [])

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

function selectDict(val: {
  dict: Dict,
  index: number
}) {
  store.current.editIndex = val.index
  isAddDict = false
  step = 1
}

async function onSubmit() {
  await dictFormRef.validate((valid, fields) => {
    if (valid) {
      let data: Dict = {
        ...DefaultDict,
        ...dictForm,
      }
      if (dictForm.id) {
        let rIndex = store.myDicts.findIndex(v => v.id === dictForm.id)
        store.myDicts[rIndex] = cloneDeep(data)
        isAddDict = false
      } else {
        if (store.myDicts.find(v => v.name === dictForm.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          store.myDicts.push(cloneDeep(data))
          store.current.editIndex = store.myDicts.length - 1
          isAddDict = false
          console.log('submit!', data)
        }
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function editDict() {
  dictForm.name = store.editDict.name
  dictForm.description = store.editDict.description
  wordFormMode = FormMode.None;
  isAddDict = true
}

enum FormMode {
  None = 'None',
  Edit = 'Edit',
  Add = 'Add'
}

let wordFormMode = $ref(FormMode.None)
let wordForm = reactive({
  name: '',
  trans: '',
  usphone: '',
  ukphone: '',
})
const wordFormRef = $ref<FormInstance>()
const wordRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入单词', trigger: 'blur'},
    {max: 30, message: '名称不能超过30个字符', trigger: 'blur'},
  ],
})
let wordListRef: any = $ref()

async function onSubmitWord() {
  await wordFormRef.validate((valid, fields) => {
    if (valid) {
      if (wordFormMode === FormMode.Add) {
        if (store.editDict.originWords.find(v => v.name === wordForm.name)) {
          return ElMessage.warning('已有相同名称单词！')
        } else {
          // let list = cloneDeep(store.editDict.originWords)
          let data: any = cloneDeep(wordForm)
          if (data.trans) {
            data.trans = data.trans.split('\n');
          } else {
            data.trans = []
          }
          store.editDict.originWords.push(data)
          console.log('wordListRef',wordListRef)
          wordListRef?.reset()
          // store.editDict.originWords = list
          //因为虚拟列表，必须重新赋值才能检测到更新
          // store.editDict.originWords = cloneDeep(store.editDict.originWords)
        }
        console.log('store.editDict', store.editDict)
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function close() {
  emit('close')
}

const playWordAudio = usePlayWordAudio()
const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple,
} = useWordOptions()

</script>

<template>
  <div id="AddWordDialog" :class="wordFormMode !== FormMode.None && 'add-word-mode'">
    <Slide :slide-count="2" :step="step">
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
              @add="step = 1;isAddDict = true"
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
        <div class="detail" v-if="!isAddDict">
          <div class="dict">
            <div class="info">
              <div class="name">{{ store.editDict.name }}</div>
              <div class="desc">{{ store.editDict.description }}</div>
              <div class="more-info">
                <div class="item">词汇量：{{ store.editDict.originWords.length }}词</div>
                <div class="item">创建日期：-</div>
                <div class="item">花费时间：-</div>
                <div class="item">累积错误：-</div>
              </div>
              <BaseIcon
                  class-name="edit-icon"
                  icon="tabler:edit"
                  @click='editDict'
              />
            </div>
            <div class="add" v-if="wordFormMode !== FormMode.None">
              <div class="common-title">添加单词</div>
              <el-form
                  class="form"
                  ref="wordFormRef"
                  :rules="wordRules"
                  :model="wordForm"
                  label-width="140rem">
                <el-form-item label="单词" prop="name">
                  <el-input v-model="wordForm.name"/>
                </el-form-item>
                <el-form-item label="翻译">
                  <el-input v-model="wordForm.trans"
                            placeholder="多个翻译请换行"
                            :autosize="{ minRows: 2, maxRows: 8 }"
                            type="textarea"/>
                </el-form-item>
                <el-form-item label="音标/发音/注音①">
                  <el-input v-model="wordForm.usphone"/>
                </el-form-item>
                <el-form-item label="音标/发音/注音②">
                  <el-input v-model="wordForm.ukphone"/>
                </el-form-item>
                <div class="flex-center">
                  <el-button @click="wordFormMode = FormMode.None">关闭</el-button>
                  <el-button type="primary" @click="onSubmitWord">确定</el-button>
                </div>
              </el-form>
            </div>
          </div>
          <div class="list-wrapper">
            <div class="list-header">
              <div class="name">单词列表</div>
              <div class="flex-center gap10">
                <div class="name">{{ store.editDict.originWords.length }}个单词</div>
                <BaseIcon icon="mi:add"
                          @click='wordFormMode = FormMode.Add'
                />
              </div>
            </div>
            <WordList2
                ref="wordListRef"
                v-if="store.editDict.originWords.length"
                class="word-list"
                :is-active="true"
                @change="(i:number) => data.index = i"
                :list="store.editDict.originWords"
                :activeIndex="data.index">
              <template v-slot="{word}">
                <BaseIcon
                    v-if="!isWordCollect(word)"
                    class-name="collect"
                    @click="toggleWordCollect(word)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class-name="fill"
                    @click="toggleWordCollect(word)"
                    title="取消收藏" icon="ph:star-fill"/>
              </template>
            </WordList2>
            <Empty v-else/>
          </div>
        </div>
        <div class="edit" v-else>
          <el-form
              ref="dictFormRef"
              :rules="dictRules"
              :model="dictForm"
              label-width="120rem">
            <el-form-item label="名称" prop="name">
              <el-input v-model="dictForm.name"/>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="dictForm.description" type="textarea"/>
            </el-form-item>
            <el-form-item label="分类" prop="languageCategory">
              <el-select
                  v-model="dictForm.languageCategory" placeholder="请选择选项">
                <el-option :label="i.name" :value="i.id" v-for="i in languageCategoryOptions"/>
              </el-select>
            </el-form-item>
            <el-form-item label="用途" prop="category">
              <el-select v-model="dictForm.category" placeholder="请选择选项">
                <el-option :label="i" :value="i" v-for="i in categoryList[dictForm.languageCategory]"/>
              </el-select>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
              <el-select
                  multiple
                  v-model="dictForm.tags" placeholder="请选择选项">
                <el-option :label="i" :value="i" v-for="i in tagList[dictForm.category]"/>
              </el-select>
            </el-form-item>
            <div class="flex-center">
              <el-button @click="step = 0">返回</el-button>
              <el-button type="primary" @click="onSubmit">确定</el-button>
            </div>
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
  width: 600rem;
  height: 70vh;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  z-index: 9999999;
  background: var(--color-second-bg);
  transition: all .3s;

  &.add-word-mode {
    width: 800rem;

    .more-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      display: none;
    }
  }

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
        flex: 1;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);
        padding-left: var(--space);
        box-sizing: border-box;

        .info {
          border-radius: 8rem;
          background: var(--color-item-bg);
          padding: 20rem;
          position: relative;

          :deep(.edit-icon) {
            position: absolute;
            top: 10rem;
            right: 10rem;
          }

          .name {
            font-size: 24rem;
            margin-bottom: 10rem;
          }

          .desc {
            font-size: 18rem;
            margin-bottom: 30rem;
          }

          .item {
            margin-top: 10rem;
          }
        }

        .add {
          margin-top: 20rem;
        }
      }

      .list-wrapper {
        width: 350rem;
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

    .edit {
      padding: 0 var(--space);
      width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>