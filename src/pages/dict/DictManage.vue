<script setup lang="ts">
import {dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {onMounted, reactive, watch} from "vue"
import {DefaultDict, Dict, DictResource, DictType, Sort} from "@/types.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import {Icon} from '@iconify/vue';
import {v4 as uuidv4} from "uuid";
import "vue-activity-calendar/style.css";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import {FormInstance, FormRules} from "element-plus";
import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {nanoid} from "nanoid";
import {no} from "@/utils";
import ArticleDictDetail from "@/pages/dict/components/ArticleDictDetail.vue";
import WordDictDetail from "@/pages/dict/components/WordDictDetail.vue";
import DictListPanel from "@/pages/dict/components/DictListPanel.vue";


const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let step = $ref(1)

async function selectDict(val: {
  dict: DictResource | Dict,
  index: number
}) {
  let item = val.dict
  console.log('item', item)
  step = 1
  isAddDict = false
  // wordFormData.type = FormMode.None
  // loading = true
  let find: Dict = store.myDictList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
    //设置默认章节单词数
    runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
  }

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {
  } else {
    //如果不是自定义词典，并且有url地址才去下载
    if (!runtimeStore.editDict.isCustom && runtimeStore.editDict.url) {
      let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
      if (runtimeStore.editDict.type === DictType.word) {
        if (!runtimeStore.editDict.originWords.length) {
          let r = await fetch(url)
          let v = await r.json()
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.originWords = cloneDeep(v)
          changeSort(runtimeStore.editDict.sort)
        }
      }

      if (runtimeStore.editDict.type === DictType.article) {
        if (!runtimeStore.editDict.articles.length) {
          let r = await fetch(url)
          let v = await r.json()
          runtimeStore.editDict.articles = cloneDeep(v.map(s => {
            s.id = uuidv4()
            return s
          }))
        }
      }
    }
  }

  // chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
  // loading = false
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
}

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

function changeSort(v: Sort) {
  if (v === Sort.normal) {
    runtimeStore.editDict.words = cloneDeep(runtimeStore.editDict.originWords)
  } else if (v === Sort.random) {
    runtimeStore.editDict.words = shuffle(runtimeStore.editDict.originWords)
  } else {
    runtimeStore.editDict.words = reverse(runtimeStore.editDict.originWords)
  }
  // resetChapterList()
}


/**/
/*词典相关*/
/**/


let isAddDict = $ref(false)
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

function editDict() {
  // dictForm.id = store.editDict.id
  // dictForm.name = store.editDict.name
  // dictForm.description = store.editDict.description
  console.log('store.editDict', runtimeStore.editDict)
  dictForm = cloneDeep(runtimeStore.editDict)
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
      //任意修改，都将其变为自定义词典
      if (data.type === DictType.word) data.type = DictType.customWord
      if (data.type === DictType.article) data.type = DictType.customArticle

      if (data.id) {
        let rIndex = store.myDictList.findIndex(v => v.id === data.id)
        store.myDictList[rIndex] = cloneDeep(data)
        runtimeStore.editDict = cloneDeep(data)
        isAddDict = false
        ElMessage.success('修改成功')
      } else {
        data.id = 'custom-dict-' + Date.now()
        if (store.myDictList.find(v => v.name === dictForm.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          store.myDictList.push(cloneDeep(data))
          runtimeStore.editDict = cloneDeep(data)
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
/*词典相关*/
/**/

watch(() => step, v => {
  if (v === 0) {
    // closeWordForm()
    closeDictForm()
    // chapterWordNumber = settingStore.chapterWordNumber
  }
})

watch(() => store.load, v => {
  if (v) {
    selectDict({dict: store.currentDict, index: 0})
  }
})

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

  selectDict({dict: store.currentDict, index: 0})

  emitter.on(EventKey.openDictModal, (type: 'detail' | 'list' | 'my' | 'collect' | 'simple') => {
    if (type === "detail") {
      selectDict({dict: store.currentDict, index: 0})
    }
    if (type === "list") {
      currentLanguage = 'en'
      step = 0
    }
    if (type === "my") {
      currentLanguage = 'my'
      step = 0
    }
    if (type === "collect") {
      selectDict({dict: store.collect, index: 0})
      // addWord('residue')
    }
    if (type === "simple") {
      selectDict({dict: store.simple, index: 0})
      // addWord('residue')
    }

  })
  // console.log('categoryList', categoryList)
  // console.log('tagList', tagList)
})

const isPinDict = $computed(() => {
  return [DictType.collect, DictType.wrong, DictType.simple].includes(runtimeStore.editDict.type)
})

</script>

<template>
  <div id="DictDialog">
    <Slide :slide-count="2" :step="step">
      <DictListPanel
          @add="step = 1"
          @select-dict="selectDict"
      />
      <div class="dict-detail-page">
        <header>
          <Icon icon="octicon:arrow-left-24"
                @click.stop="step = 0"
                width="20"/>
          <div class="left">
            <div class="top">
              <div class="title">
                {{ runtimeStore.editDict.name }}
              </div>
              <template v-if="!isPinDict">
                <BaseIcon icon="tabler:edit" @click='editDict'/>
                <BaseIcon icon="ph:star" @click='no'/>
                <BaseButton size="small" @click="resetDict">恢复默认</BaseButton>
              </template>
              <div class="import hvr-grow">
                <BaseButton size="small">导入</BaseButton>
                <input type="file"
                       accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                       @change="importData">
              </div>
              <BaseButton size="small" @click="exportData">导出</BaseButton>
            </div>
            <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
            <div class="num">总词汇: {{ runtimeStore.editDict.originWords.length }}词</div>
          </div>
        </header>
        <div class="detail" v-if="!isAddDict">
          <ArticleDictDetail v-if="dictIsArticle"/>
          <WordDictDetail v-else/>
        </div>
        <div class="edit-dict" v-else>
          <div class="wrapper">
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
      </div>
    </Slide>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

$modal-mask-bg: rgba(#000, .15);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

#DictDialog {
  font-size: 14rem;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 80vw;
  height: 75vh;
}

.dict-detail-page {
  width: 50%;
  height: 100%;
  $header-height: 60rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    width: 100%;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    color: var(--color-font-1);
    padding: 0 var(--space);
    gap: 20rem;
    margin-bottom: 20rem;

    svg {
      cursor: pointer
    }

    .left {
      display: flex;
      gap: 10rem;
      flex-direction: column;
      color: var(--color-font-2);

      .top {
        color: var(--color-font-1);
        display: flex;
        gap: 10rem;
        font-size: 20rem;
        align-items: center;
      }

      .import {
        display: inline-flex;
        position: relative;

        input {
          position: absolute;
          height: 100%;
          width: 100%;
          opacity: 0;
        }
      }
    }
  }

  .detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .edit-dict {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;

    .wrapper {
      width: 500rem;
    }

    .el-select {
      width: 100%;
    }
  }
}
</style>

