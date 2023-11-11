<script setup lang="ts">

import {$computed, $ref} from "vue/macros";
import Slide from "@/components/Slide.vue";
import DictList from "@/components/list/DictList.vue";
import {Icon} from "@iconify/vue";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useDisableEventListener} from "@/hooks/event.ts";
import {DefaultDict, Dict, DictType, languageCategoryOptions, Word} from "@/types.ts";
import {onMounted, reactive, watch} from "vue";
import {FormInstance, FormRules} from "element-plus";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {cloneDeep} from "lodash-es";
import Empty from "@/components/Empty.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList2 from "@/components/list/WordList2.vue";

useDisableEventListener()

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

const emit = defineEmits([
  'close',
])

let step = $ref(1)
let isAddDict = $ref(false)
let wordList = $ref([])

let dictList = $computed(() => {
  return [
    store.collect,
    store.simple,
    store.wrong
  ].concat(store.myDicts.filter(v => [DictType.customWord, DictType.customArticle].includes(v.type)))
      .concat([{name: '',} as any])
})

let categoryList = {}
let tagList = {}

const DefaultDictForm = {
  id: '',
  name: '',
  description: '',
  category: '',
  tags: [],
  translateLanguage: 'zh-CN',
  language: 'en',
  type: DictType.customWord
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

watch(() => dictForm.language, () => isAddDict && (dictForm.category = ''))
watch(() => dictForm.category, () => isAddDict && (dictForm.tags = []))

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

  console.log('categoryList', categoryList)
  console.log('tagList', tagList)
})

function selectDict(val: { dict: Dict, index: number }) {
  store.current.editIndex = val.index
  wordList = cloneDeep(store.editDict.originWords)
  isAddDict = false
  step = 1
}

function editDict() {
  // dictForm.id = store.editDict.id
  // dictForm.name = store.editDict.name
  // dictForm.description = store.editDict.description
  console.log('store.editDict', store.editDict)
  dictForm = cloneDeep(store.editDict)
  //直接复制，上面会watch到category，然后把tags 设置为空
  setTimeout(() => isAddDict = true, 0)
}

function closeDictForm() {
  if (dictForm.id) {
    isAddDict = false
    dictForm = cloneDeep(DefaultDictForm)
  } else {
    step = 0
  }
}

async function onSubmit() {
  await dictFormRef.validate((valid, fields) => {
    if (valid) {
      let data: Dict = {
        ...DefaultDict,
        ...dictForm,
      }
      if (data.id) {
        let rIndex = store.myDicts.findIndex(v => v.id === data.id)
        store.myDicts[rIndex] = cloneDeep(data)
        isAddDict = false
        ElMessage.success('修改成功')
      } else {
        data.id = 'custom-dict-' + Date.now()
        if (store.myDicts.find(v => v.name === dictForm.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          store.myDicts.push(cloneDeep(data))
          store.current.editIndex = 3 + store.myDicts.filter(v => [DictType.customWord, DictType.customArticle].includes(v.type)).length - 1
          isAddDict = false
          ElMessage.success('添加成功')
        }
      }
      console.log('submit!', data)

    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

/**/
/**/
/**/
enum FormMode {
  None = -1,
  Add = -2,
}

const DefaultFormWord = {
  name: '',
  usphone: '',
  ukphone: '',
  trans: ''
}

let wordFormMode = $ref(FormMode.None)
let wordForm = $ref(cloneDeep(DefaultFormWord))
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
      let data: any = cloneDeep(wordForm)
      if (data.trans) {
        data.trans = data.trans.split('\n');
      } else {
        data.trans = []
      }
      if (wordFormMode === FormMode.Add) {
        if (wordList.find(v => v.name === wordForm.name)) {
          return ElMessage.warning('已有相同名称单词！')
        } else {
          store.editDict.originWords.push(data)
          //因为虚拟列表，必须重新赋值才能检测到更新
          wordList = cloneDeep(store.editDict.originWords)
          ElMessage.success('添加成功')
          wordForm = cloneDeep(DefaultFormWord)
          setTimeout(wordListRef?.scrollToBottom, 100)
        }
        console.log('store.editDict', store.editDict)
      } else {
        store.editDict.originWords[wordFormMode] = data
        //因为虚拟列表，必须重新赋值才能检测到更新
        wordList = cloneDeep(store.editDict.originWords)
        ElMessage.success('修改成功')
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(index: number) {
  store.editDict.originWords.splice(index, 1)
  wordList = cloneDeep(store.editDict.originWords)
}

function editWord(val: { word: Word, index: number }) {
  wordFormMode = val.index
  wordForm.name = val.word.name
  wordForm.ukphone = val.word.ukphone
  wordForm.usphone = val.word.usphone
  wordForm.trans = val.word.trans.join('\n')
}

function closeWordForm() {
  wordFormMode = FormMode.None
  wordForm = cloneDeep(DefaultFormWord)
}

function addWord() {
  wordFormMode = FormMode.Add
  wordForm = cloneDeep(DefaultFormWord)
}

watch(() => step, v => {
  if (v === 0) {
    closeWordForm()
    closeDictForm()
  }
})

function close() {
  emit('close')
}

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
              :list="dictList"/>
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
              <div class="common-title">{{ wordFormMode === FormMode.Add ? '添加' : '修改' }}单词</div>
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
                            :autosize="{ minRows: 2, maxRows: 6 }"
                            type="textarea"/>
                </el-form-item>
                <el-form-item label="音标/发音/注音①">
                  <el-input v-model="wordForm.usphone"/>
                </el-form-item>
                <el-form-item label="音标/发音/注音②">
                  <el-input v-model="wordForm.ukphone"/>
                </el-form-item>
                <div class="flex-center">
                  <el-button @click="closeWordForm">关闭</el-button>
                  <el-button type="primary" @click="onSubmitWord">{{
                      wordFormMode === FormMode.Add ? '添加' : '保存'
                    }}
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
          <div class="list-wrapper">
            <div class="list-header">
              <div class="name">单词列表</div>
              <div class="flex-center gap10">
                <div class="name">{{ wordList.length }}个单词</div>
                <BaseIcon icon="mi:add"
                          @click='addWord'
                />
              </div>
            </div>
            <WordList2
                ref="wordListRef"
                v-if="wordList.length"
                class="word-list"
                :is-active="true"
                @change="editWord"
                :list="wordList"
                :activeIndex="wordFormMode">
              <template v-slot="{word,index}">
                <BaseIcon
                    class-name="del"
                    @click="delWord(index)"
                    title="移除"
                    icon="solar:trash-bin-minimalistic-linear"/>
              </template>
            </WordList2>
            <Empty v-else/>
          </div>
        </div>
        <div class="edit" v-else>
          <div class="common-title">{{ dictForm.id ? '修改' : '添加' }}词典</div>
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
              <el-select v-model="dictForm.type" placeholder="请选择选项">
                <el-option label="单词" :value="DictType.customWord"/>
                <el-option label="文章" :value="DictType.customArticle"/>
              </el-select>
            </el-form-item>
            <div class="flex-center">
              <el-button @click="closeDictForm">关闭</el-button>
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
        padding-right: var(--space);
        padding-bottom: var(--space);
        box-sizing: border-box;
        overflow: auto;

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
      height: calc(100% - $header-height);
      padding: var(--space);
      padding-top: 0;
      width: 100%;
      box-sizing: border-box;
      overflow: auto;
    }
  }
}
</style>