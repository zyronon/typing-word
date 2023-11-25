<script setup lang="ts">
import {dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {onMounted, reactive, watch} from "vue"
import {DefaultDict, Dict, DictResource, DictType, languageCategoryOptions, Sort, Word} from "@/types.ts"
import {assign, chunk, cloneDeep, groupBy, merge, reverse, shuffle} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import {Icon} from '@iconify/vue';
import DictGroup from "@/components/toolbar/DictGroup.vue";
import {v4 as uuidv4} from "uuid";
import "vue-activity-calendar/style.css";
import WordListDialog from "@/components/dialog/WordListDialog.vue";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import DictList from "@/components/list/DictList.vue";
import {FormInstance, FormRules} from "element-plus";
import Empty from "@/components/Empty.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import EditBatchArticleModal from "@/components/article/EditBatchArticleModal.vue";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import BaseButton from "@/components/BaseButton.vue";
import VirtualWordList from "@/components/list/VirtualWordList.vue";
import Dialog from "@/components/dialog/Dialog.vue";
import {nanoid} from "nanoid";
import {no} from "@/utils";
import Test from "@/pages/dict/Test.vue";
import VirtualWordList2 from "@/components/list/VirtualWordList2.vue";
import ChapterWordList from "@/pages/dict/ChapterWordList.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let currentLanguage = $ref('my')
let currentTranslateLanguage = $ref('common')
let groupByLanguage = groupBy(dictionaryResources, 'language')
let translateLanguageList = $ref([])

let step = $ref(1)
let loading = $ref(false)
let chapterList2 = $ref([])
let chapterWordNumber = $ref(settingStore.chapterWordNumber)

let chapterIndex = $ref(-1)
let residueWordList = $ref([])

async function selectDict(val: {
  dict: DictResource | Dict,
  index: number
}) {
  let item = val.dict
  console.log('item', item)
  step = 1
  isAddDict = false
  wordFormData.type = FormMode.None
  loading = true
  let find: Dict = store.myDictList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
  }

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {
  } else {
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

    if (runtimeStore.editDict.type === DictType.customWord) {

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

  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
  loading = false
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
}

function groupByDictTags(dictList: DictResource[]) {
  return dictList.reduce<Record<string, DictResource[]>>((result, dict) => {
    dict.tags.forEach((tag) => {
      if (Object.prototype.hasOwnProperty.call(result, tag)) {
        result[tag].push(dict)
      } else {
        result[tag] = [dict]
      }
    })
    return result
  }, {})
}

const groupByTranslateLanguage = $computed(() => {
  let data: any
  if (currentLanguage === 'article') {
    let articleList = dictionaryResources.filter(v => v.type === 'article')
    data = groupBy(articleList, 'translateLanguage')
  } else if (currentLanguage === 'my') {
    data = {
      common: store.myDictList.concat([{name: '',} as any])
    }
  } else {
    data = groupBy(groupByLanguage[currentLanguage], 'translateLanguage')
  }
  // console.log('groupByTranslateLanguage', data)
  translateLanguageList = Object.keys(data)
  currentTranslateLanguage = translateLanguageList[0]
  return data
})

const groupedByCategoryAndTag = $computed(() => {
  const currentTranslateLanguageDictList = groupByTranslateLanguage[currentTranslateLanguage]
  const groupByCategory = groupBy(currentTranslateLanguageDictList, 'category')

  let data = []
  for (const [key, value] of Object.entries(groupByCategory)) {
    data.push([key, groupByDictTags(value)])
  }
  // console.log('groupedByCategoryAndTag', data)
  return data
})

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

function changeSort(v) {
  if (v === Sort.normal) {
    runtimeStore.editDict.words = cloneDeep(runtimeStore.editDict.originWords)
  } else if (v === Sort.random) {
    runtimeStore.editDict.words = shuffle(cloneDeep(runtimeStore.editDict.originWords))
  } else {
    runtimeStore.editDict.words = reverse(cloneDeep(runtimeStore.editDict.originWords))
  }
  resetChapterList()
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


/**/
/* 单词修改相关*/
/**/

let wordFormData = $ref({
  where: '',
  type: '',
  name: '',
  id: '',
  index: 0
})

enum FormMode {
  None = '',
  Add = 'Add',
  Edit = 'Edit',
}

const DefaultFormWord = {
  name: '',
  usphone: '',
  ukphone: '',
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
let wordListRef: any = $ref()

//同步到我的词典列表
function syncMyDictList() {
  //任意修改，都将其变为自定义词典
  if (runtimeStore.editDict.type === DictType.word) runtimeStore.editDict.type = DictType.customWord
  if (runtimeStore.editDict.type === DictType.article) runtimeStore.editDict.type = DictType.customArticle

  let rIndex = store.myDictList.findIndex(v => v.id === runtimeStore.editDict.id)
  if (rIndex > -1) {
    store.myDictList[rIndex] = cloneDeep(runtimeStore.editDict)
  } else {
    store.myDictList.push(cloneDeep(runtimeStore.editDict))
  }
}

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
        let r
        if (wordFormData.where === 'chapter') {
          r = currentChapterWordList.find(v => v.name === wordForm.name)
          if (r) return ElMessage.warning('已有相同名称单词！')
          else {
            currentChapterWordList.push(data)
          }
        } else {
          r = residueWordList.find(v => v.name === wordForm.name)
          if (r) return ElMessage.warning('已有相同名称单词！')
          else {
            residueWordList.push(data)
          }
        }

        runtimeStore.editDict.originWords.push(data)
        runtimeStore.editDict.words.push(data)
        ElMessage.success('添加成功')
        wordForm = cloneDeep(DefaultFormWord)
        setTimeout(wordListRef?.scrollToBottom, 100)

        console.log('runtimeStore.editDict', runtimeStore.editDict)
      } else {
        //直接使用引用修改
        let r
        if (wordFormData.where === 'chapter') {
          r = currentChapterWordList.find(v => v.id === wordFormData.id)
          if (r) assign(r, data)
        } else {
          r = residueWordList.find(v => v.id === wordFormData.id)
          if (r) assign(r, data)
        }
        //同步修改到列表
        r = runtimeStore.editDict.originWords.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        r = runtimeStore.editDict.words.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)

        ElMessage.success('修改成功')
      }
      syncMyDictList()
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function addWord(where: string) {
  // setTimeout(wordListRef?.scrollToBottom, 100)
  wordFormData.type = FormMode.Add
  wordFormData.where = where
  wordForm = cloneDeep(DefaultFormWord)
}

function delWord(val: { word: Word }) {
  let rIndex = runtimeStore.editDict.originWords.findIndex(v => v.id === val.word.id)
  if (rIndex > -1) {
    runtimeStore.editDict.originWords.splice(rIndex, 1)
  }
  let rIndex2 = runtimeStore.editDict.words.findIndex(v => v.id === val.word.id)
  if (rIndex2 > -1) {
    runtimeStore.editDict.words.splice(rIndex2, 1)
  }

  if (wordFormData.type === FormMode.Edit && wordForm.name === val.word.name) {
    closeWordForm()
  }
  syncMyDictList()
}

function editWord(word: Word, index: number, where: string) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordFormData.where = where
  wordForm.name = word.name
  wordForm.ukphone = word.ukphone
  wordForm.usphone = word.usphone
  wordForm.trans = word.trans.join('\n')
}

function closeWordForm() {
  wordFormData.type = FormMode.None
  wordForm = cloneDeep(DefaultFormWord)
}

/**/
/* 单词修改相关*/
/**/

watch(() => step, v => {
  if (v === 0) {
    closeWordForm()
    closeDictForm()
    chapterWordNumber = settingStore.chapterWordNumber
  }
})

watch(() => store.load, v => {
  if (v) {
    selectDict({dict: store.currentDict, index: 0})
  }
})

const playWordAudio = usePlayWordAudio()
let showAllocationChapterDialog = $ref(false)

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
      addWord('residue')
    }
    if (type === "simple") {
      selectDict({dict: store.simple, index: 0})
      addWord('residue')
    }

  })
  // console.log('categoryList', categoryList)
  // console.log('tagList', tagList)
})

let currentChapterWordList: any[] = $computed(() => {
  return runtimeStore.editDict.chapterWords[chapterIndex] ?? []
})

let currentChapterWordListCheckedTotal = $computed(() => {
  return currentChapterWordList.filter(v => v.checked).length
})

let residueWordListCheckedTotal = $computed(() => {
  return residueWordList.filter(v => v.checked).length
})

function handleChangeCurrentChapter(index: number) {
  currentChapterWordList.map(v => v.checked = false)
  chapterIndex = index
  closeWordForm()
}

function toResidueWordList() {
  let list = currentChapterWordList.filter(v => v.checked)
  if (wordFormData.type === FormMode.Edit && wordFormData.where === 'chapter') {
    if (list.find(v => v.name === wordForm.name)) {
      wordFormData.where = 'residue'
    }
  }
  runtimeStore.editDict.chapterWords[chapterIndex] = currentChapterWordList.filter(v => !v.checked)
  list.map(v => v.checked = false)
  residueWordList = residueWordList.concat(list)
}

function toChapterWordList() {
  if (chapterIndex == -1) return ElMessage.warning('请选择章节')
  let list = residueWordList.filter(v => v.checked)
  if (wordFormData.type === FormMode.Edit && wordFormData.where !== 'chapter') {
    if (list.find(v => v.name === wordForm.name)) {
      wordFormData.where = 'chapter'
    }
  }
  residueWordList = residueWordList.filter(v => !v.checked)
  list.map(v => v.checked = false)
  runtimeStore.editDict.chapterWords[chapterIndex] = currentChapterWordList.concat(list)
}

function addNewChapter() {
  runtimeStore.editDict.chapterWords.push([])
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
}

function delWordChapter(index: number) {
  let list = runtimeStore.editDict.chapterWords[index]
  list.map(v => v.checked = false)
  residueWordList = residueWordList.concat(list)
  runtimeStore.editDict.chapterWords.splice(index, 1)
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))

  if (chapterIndex >= index) chapterIndex--
  if (chapterIndex < 0) chapterIndex = 0

  syncMyDictList()
}

function resetChapterList() {
  residueWordList = []
  chapterIndex = -1
  runtimeStore.editDict.words.map(v => v.checked = false)
  runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, chapterWordNumber)
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
  console.log('runtimeStore.editDict.chapterWords',runtimeStore.editDict.chapterWords)
  console.log('chapterList2',chapterList2)
}

function exportData() {
  no()
}

function importData() {
  no()
}

const isPinDict = $computed(() => {
  return [DictType.collect, DictType.wrong, DictType.simple].includes(runtimeStore.editDict.type)
})

</script>

<template>
  <div id="DictDialog">
    <Slide :slide-count="2" :step="step">
      <div class="dict-page">
        <header>
          <div class="tabs">
            <div class="tab"
                 :class="currentLanguage === item.id && 'active'"
                 @click="currentLanguage = item.id"
                 v-for="item in languageCategoryOptions">
              <img :src='item.flag'/>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </header>
        <div class="page-content">
          <div class="dict-list-wrapper">
            <template v-if="currentLanguage === 'my'">
              <DictList
                  @add="step = 1;isAddDict = true"
                  @selectDict="selectDict"
                  :list="groupByTranslateLanguage['common']"/>
            </template>
            <template v-else>
              <div class="translate">
                <span>翻译：</span>
                <el-radio-group v-model="currentTranslateLanguage">
                  <el-radio-button border v-for="i in translateLanguageList" :label="i">{{ i }}</el-radio-button>
                </el-radio-group>
              </div>
              <DictGroup
                  v-for="item in groupedByCategoryAndTag"
                  :select-dict-name="runtimeStore.editDict.resourceId"
                  @selectDict="selectDict"
                  @detail="step = 1"
                  :groupByTag="item[1]"
                  :category="item[0]"
              />
            </template>
          </div>
        </div>
      </div>
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
                <BaseButton size="small" @click="no">恢复默认</BaseButton>
              </template>
              <div class="import hvr-grow">
                <BaseButton size="small">导入</BaseButton>
                <input type="file" accept="application/json" @change="importData">
              </div>
              <BaseButton size="small" @click="exportData">导出</BaseButton>
            </div>
            <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
            <div class="num">总词汇: {{ runtimeStore.editDict.originWords.length }}词</div>
          </div>
        </header>
        <div class="detail" v-if="!isAddDict">
          <div class="page-content">
            <div class="left-column">
              <div class="header">
                <div class="common-title">
                  <span>章节管理</span>
                  <div class="options">
                    <BaseIcon
                        @click="addNewChapter"
                        icon="fluent:add-20-filled"
                        title="新增章节"/>
                  </div>
                </div>
                <div class="select">
                  <BaseButton size="small" @click="showAllocationChapterDialog = true">智能分配</BaseButton>
                  <span>{{ runtimeStore.editDict.chapterWords.length }}章</span>
                </div>
              </div>
              <div class="wrapper">
                <RecycleScroller
                    v-if="chapterList2.length"
                    style="height: 100%;"
                    :items="chapterList2"
                    :item-size="63"
                    key-field="id"
                    v-slot="{ item,index }"
                >
                  <div style="padding: 0 15rem;">
                    <div class="common-list-item"
                         :class="chapterIndex === item.id && 'active'"
                         @click="handleChangeCurrentChapter(item.id)">
                      <div class="flex gap10 flex1 ">
                        <input type="radio" :checked="chapterIndex === item.id">
                        <div class="item-title flex flex1 space-between">
                          <span>第{{ item.id + 1 }}章</span>
                          <span>{{ runtimeStore.editDict.chapterWords[item.id]?.length }}词</span>
                        </div>
                      </div>
                      <div class="right">
                        <BaseIcon
                            class-name="del"
                            @click="delWordChapter(item.id)"
                            title="移除"
                            icon="solar:trash-bin-minimalistic-linear"/>
                      </div>
                    </div>
                  </div>
                </RecycleScroller>
                <Empty v-else/>
              </div>
            </div>
            <ChapterWordList :title="`${chapterIndex > -1 ? `第${chapterIndex + 1}章` : ''} 单词列表`"
                             :show-add="chapterIndex > -1"
                             @add="addWord('chapter')"
                             @del="delWord"
                             empty-title="请选择章节"
                             @edit="val => editWord(val.word,val.index,'chapter')"
                             :list="currentChapterWordList"/>
            <div class="options-column">
              <BaseButton @click="toChapterWordList"
                          :disabled="residueWordListCheckedTotal === 0">
                &lt;
              </BaseButton>
              <BaseButton @click="toResidueWordList"
                          :disabled="currentChapterWordListCheckedTotal === 0">
                &gt;
              </BaseButton>
            </div>
            <ChapterWordList title="未分配单词列表"
                             :empty-title="null"
                             :show-add="true"
                             @add="addWord('residue')"
                             @del="delWord"
                             @edit="val => editWord(val.word,val.index,'residue')"
                             :list="residueWordList"/>
            <div class="right-column">
              <div class="add" v-if="wordFormData.type">
                <div class="common-title">
                  {{ wordFormData.type === FormMode.Add ? '添加' : '修改' }}单词
                  {{
                    wordFormData.type === FormMode.Add ? (wordFormData.where === 'chapter' ? `> 第${chapterIndex + 1}章` : '> 未分配') : ''
                  }}
                </div>
                <el-form
                    class="form"
                    ref="wordFormRef"
                    :rules="wordRules"
                    :model="wordForm"
                    label-width="100rem">
                  <el-form-item label="单词" prop="name">
                    <el-input v-model="wordForm.name"/>
                  </el-form-item>
                  <el-form-item label="翻译">
                    <el-input v-model="wordForm.trans"
                              placeholder="多个翻译请换行"
                              :autosize="{ minRows: 2, maxRows: 6 }"
                              type="textarea"/>
                  </el-form-item>
                  <el-form-item label="音标/发音①">
                    <el-input v-model="wordForm.usphone"/>
                  </el-form-item>
                  <el-form-item label="音标/发音②">
                    <el-input v-model="wordForm.ukphone"/>
                  </el-form-item>
                  <div class="flex-center">
                    <el-button @click="closeWordForm">关闭</el-button>
                    <el-button type="primary" @click="onSubmitWord">保存</el-button>
                  </div>
                </el-form>
              </div>
            </div>
          </div>
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

  <Dialog
      title="智能分配单词"
      :footer="true"
      @ok="resetChapterList"
      @cancel="chapterWordNumber = settingStore.chapterWordNumber"
      v-model="showAllocationChapterDialog">
    <div class="allocation-chapter">
      <div class="desc">
        <div>为您自动创建章节以及分配单词</div>
        <div>注意：已存在的章节将被删除！</div>
      </div>
      <div class="row">
        <div class="label">每章单词数</div>
        <span class="text">最小:10</span>
        <el-slider :min="10"
                   :step="10"
                   :max="runtimeStore.editDict.words.length ?? 10"
                   v-model="chapterWordNumber"
        />
        <span class="text">最大:{{ runtimeStore.editDict.words.length ?? 10 }}</span>
      </div>

      <div class="notice">鼠标按住滑块，按键盘左右箭头可进行微调</div>

      <div class="row">
        <div class="label">将会创建</div>
        <div class="option">
          <span>{{ Math.ceil(runtimeStore.editDict.words.length / chapterWordNumber) }}章</span>
        </div>
      </div>
      <div class="row">
        <div class="label">每章</div>
        <div class="option">
          <span>{{ chapterWordNumber }}个单词</span>
        </div>
      </div>
      <div class="row" :style="{opacity:runtimeStore.editDict.words.length % chapterWordNumber}">
        <div class="label">最后一章</div>
        <div class="option">
          <span>{{ runtimeStore.editDict.words.length % chapterWordNumber }}个单词</span>
        </div>
      </div>
    </div>
  </Dialog>
  <WordListDialog/>
  <EditBatchArticleModal/>
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

.dict-page {
  width: 50%;
  height: 100%;
  $header-height: 60rem;
  padding: var(--space);
  padding-top: 0;
  box-sizing: border-box;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: $header-height;

    .tabs {
      display: flex;
      gap: 20rem;

      .tab {
        color: var(--color-font-1);
        cursor: pointer;
        padding: 10rem;
        padding-bottom: 5rem;
        transition: all .5s;
        border-bottom: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 6rem;

        &.active {
          border-bottom: 2px solid $main;
        }

        img {
          height: 30rem;
        }
      }
    }
  }

  .page-content {
    display: flex;
    height: calc(100% - $header-height);

    .dict-list-wrapper {
      flex: 1;
      overflow: auto;
      height: 100%;
      padding-right: var(--space);

      .translate {
        display: flex;
        align-items: center;
        color: var(--color-font-1);
        margin-bottom: 30rem;

        & > span {
          font-size: 22rem;
        }
      }
    }
  }
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

    .page-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      position: relative;
      gap: var(--space);

      .header {
        padding: 0 var(--space);

        .common-title {
          margin-bottom: 0;
          position: relative;

          .options {
            position: absolute;
            right: 0;
            display: flex;
            gap: 10rem;
          }
        }

        .select {
          height: 45rem;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .left {
            display: flex;
            gap: 5rem;
            align-items: center;
          }
        }
      }

      .wrapper {
        flex: 1;
        overflow: hidden;
      }

      .column {
        flex: 1;
        background: white;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);
        padding-bottom: var(--space);
        display: flex;
        flex-direction: column;
      }

      .left-column {
        max-width: 250rem;
        width: 16vw;
        @extend .column;
      }

      .options-column {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10rem;
      }

      .right-column {
        //@extend .column;
        flex: 1;
        box-sizing: border-box;
        align-items: center;

        .add {
          width: 90%;
        }
      }
    }
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

.allocation-chapter {
  width: 500rem;
  padding: var(--space);
  padding-top: 0;

  .desc {
    margin-top: 10rem;
    margin-bottom: 35rem;
    text-align: center;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 20rem;
    margin-bottom: 15rem;
    word-break: keep-all;

    .label {
      width: 90rem;
    }

    .text {
      font-size: 12rem;
    }
  }

  .notice {
    transform: translate3d(110rem, -20rem, 0);
    font-size: 11rem;
  }
}
</style>

