<script setup lang="ts">
import {dictionaryResources} from '@/assets/dictionary.ts'
import {useBaseStore} from "@/stores/base.ts"
import {onMounted, reactive, watch} from "vue"
import {DefaultDict, Dict, DictResource, DictType, languageCategoryOptions, Sort, Word} from "@/types.ts"
import {chunk, cloneDeep, groupBy, reverse, shuffle} from "lodash-es";
import {$computed, $ref} from "vue/macros";
import BaseButton from "@/components/BaseButton.vue";
import {Icon} from '@iconify/vue';
import DictGroup from "@/components/Toolbar/DictGroup.vue";
import {v4 as uuidv4} from "uuid";
import {ActivityCalendar} from "vue-activity-calendar";
import "vue-activity-calendar/style.css";
import ChapterList from "@/components/list/ChapterList.vue";
import WordListModal from "@/components/Modal/WordListModal.vue";
import {isArticle} from "@/hooks/article.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import Slide from "@/components/Slide.vue";
import DictList from "@/components/list/DictList.vue";
import VirtualWordList from "@/components/list/VirtualWordList.vue";
import {FormInstance, FormRules} from "element-plus";
import Empty from "@/components/Empty.vue";
import BaseIcon from "@/components/BaseIcon.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()
let currentLanguage = $ref('en')
let currentTranslateLanguage = $ref('common')
let groupByLanguage = groupBy(dictionaryResources, 'language')
let translateLanguageList = $ref([])
let wordList = $ref([])

let step = $ref(1)
let loading = $ref(false)

watch(() => runtimeStore.showDictModal, (n: boolean) => {
  runtimeStore.editDict = cloneDeep(store.currentDict)
})

async function selectDict(val: { dict: DictResource, index: number }) {
  let item = val.dict
  console.log('item', item)
  step = 1
  isAddDict = false
  detailListTabIndex = 0
  wordFormMode = FormMode.None
  loading = true
  let find: Dict = store.myDictList.find((v: Dict) => v.name === item.name)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
  }

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {
    wordList = cloneDeep(runtimeStore.editDict.words)
  } else {
    let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
    if (runtimeStore.editDict.type === DictType.word) {
      if (!runtimeStore.editDict.originWords.length) {
        let r = await fetch(url)
        let v = await r.json()
        runtimeStore.editDict.originWords = cloneDeep(v)
        changeSort(runtimeStore.editDict.sort)
      }
      wordList = cloneDeep(runtimeStore.editDict.words)
    }

    if (runtimeStore.editDict.type === DictType.customWord) {
      if (!runtimeStore.editDict.words.length) {
        changeSort(runtimeStore.editDict.sort)
      }
      wordList = cloneDeep(runtimeStore.editDict.words)
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
  loading = false
}

function changeDict() {
  store.changeDict(runtimeStore.editDict)
  close()
}

function close() {
  runtimeStore.showDictModal = false
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

function clickEvent(e) {
  console.log('e', e)
}

const dictIsArticle = $computed(() => {
  return isArticle(runtimeStore.editDict.type)
})

function showAllWordModal() {
  emitter.emit(EventKey.openWordListModal, {
    title: runtimeStore.editDict.name,
    translateLanguage: runtimeStore.editDict.translateLanguage,
    list: runtimeStore.editDict.words
  })
}

function resetChapterList() {
  runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, runtimeStore.editDict.chapterWordNumber)
}

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

let detailListTabIndex = $ref(0)

function changeDetailListTab(val: number) {
  detailListTabIndex = val
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

  // console.log('categoryList', categoryList)
  // console.log('tagList', tagList)
})

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
/* 单词修改相关*/
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
      if (wordFormMode === FormMode.Add) {
        if (wordList.find(v => v.name === wordForm.name)) {
          return ElMessage.warning('已有相同名称单词！')
        } else {
          runtimeStore.editDict.originWords.push(data)
          runtimeStore.editDict.words.push(data)
          //因为虚拟列表，必须重新赋值才能检测到更新
          wordList = cloneDeep(runtimeStore.editDict.words)

          runtimeStore.editDict.chapterWords[runtimeStore.editDict.chapterWords.length - 1].push(data)

          ElMessage.success('添加成功')
          wordForm = cloneDeep(DefaultFormWord)
          setTimeout(wordListRef?.scrollToBottom, 100)
        }
        console.log('runtimeStore.editDict', runtimeStore.editDict)
      } else {
        runtimeStore.editDict.words[wordFormMode] = data
        //因为虚拟列表，必须重新赋值才能检测到更新
        wordList = cloneDeep(runtimeStore.editDict.words)
        //同步到原始列表，因为word可能是随机的，所以需要自己寻找index去修改原始列表
        let rIndex = runtimeStore.editDict.originWords.findIndex(v => v.name === data.name)
        if (rIndex > -1) {
          runtimeStore.editDict.originWords[rIndex] = data
        }

        runtimeStore.editDict.chapterWords = runtimeStore.editDict.chapterWords.map(list => {
          let rIndex2 = list.findIndex(v => v.name === data.name)
          if (rIndex2 > -1) {
            list[rIndex2] = data
          }
          return list
        })
        ElMessage.success('修改成功')
      }
      syncMyDictList()
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(word: Word, index: number) {
  //同步到原始列表，因为word可能是随机的，所以需要自己寻找index去修改原始列表
  let rIndex = runtimeStore.editDict.originWords.findIndex(v => v.name === word.name)
  if (rIndex > -1) {
    runtimeStore.editDict.originWords.splice(rIndex, 1)
  }

  runtimeStore.editDict.chapterWords.map(list => {
    let rIndex2 = list.findIndex(v => v.name === word.name)
    if (rIndex2 > -1) {
      list.splice(rIndex2, 1)
    }
  })

  runtimeStore.editDict.chapterWords = runtimeStore.editDict.chapterWords.filter(v => v.length)
  if (runtimeStore.editDict.chapterWords.length === 0) runtimeStore.editDict.chapterIndex = -1
  else {
    if (runtimeStore.editDict.chapterIndex >= runtimeStore.editDict.chapterWords.length) {
      runtimeStore.editDict.chapterIndex = runtimeStore.editDict.chapterWords.length - 1
    }
  }

  runtimeStore.editDict.words.splice(index, 1)
  wordList = cloneDeep(runtimeStore.editDict.words)
  syncMyDictList()

  closeWordForm()
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
  // setTimeout(wordListRef?.scrollToBottom, 100)
  detailListTabIndex = 1
  wordFormMode = FormMode.Add
  wordForm = cloneDeep(DefaultFormWord)
}

watch(() => step, v => {
  if (v === 0) {
    closeWordForm()
    closeDictForm()
  }
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
          <Icon @click="close"
                class="hvr-grow pointer"
                width="20" color="#929596"
                icon="ion:close-outline"/>
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
          <div class="page-content">
            <div class="left-column">
              <BaseIcon
                  v-if="![DictType.collect,DictType.wrong,DictType.simple].includes(runtimeStore.editDict.type)"
                  class-name="edit-icon"
                  icon="tabler:edit"
                  @click='editDict'
              />
              <div class="name">{{ runtimeStore.editDict.name }}</div>
              <div class="desc">{{ runtimeStore.editDict.description }}</div>
              <div class="text flex align-center gap10">
                <div v-if="dictIsArticle">总文章：{{ runtimeStore.editDict.articles.length }}篇
                </div>
                <div v-else>总词汇：
                  <span class="count" @click="showAllWordModal">{{ runtimeStore.editDict.originWords.length }}词</span>
                </div>
                <BaseIcon icon="mi:add"
                          @click='addWord'
                />
              </div>
              <div class="text">开始日期：-</div>
              <div class="text">花费时间：-</div>
              <div class="text">累积错误：-</div>
              <div class="text">进度：
                <el-progress :percentage="0"
                             :stroke-width="8"
                             :show-text="false"/>
              </div>
            </div>
            <div class="center-column">
              <div class="setting" v-if="wordFormMode === FormMode.None">
                <div class="common-title">学习设置</div>
                <div class="row" v-if="!isArticle(runtimeStore.editDict.type)">
                  <div class="label">每章单词数</div>
                  <el-slider :min="10"
                             :step="10"
                             :max="100"
                             v-model="runtimeStore.editDict.chapterWordNumber"
                             @change="resetChapterList"
                  />
                  <div class="option">
                    <span>{{ runtimeStore.editDict.chapterWordNumber }}</span>
                  </div>
                </div>
                <div class="row">
                  <div class="label">单词顺序</div>
                  <div class="option">
                    <el-radio-group v-model="runtimeStore.editDict.sort"
                                    @change="changeSort"
                    >
                      <el-radio :label="Sort.normal" size="large">默认</el-radio>
                      <el-radio :label="Sort.random" size="large">随机</el-radio>
                      <el-radio :label="Sort.reverse" size="large">反转</el-radio>
                    </el-radio-group>
                  </div>
                </div>
                <div class="row">
                  <div class="label">学习模式</div>
                  <div class="option">
                    <el-radio-group v-model="settingStore.dictation">
                      <el-radio :label="false" size="large">再认</el-radio>
                      <el-radio :label="true" size="large">拼写</el-radio>
                    </el-radio-group>
                  </div>
                </div>
                <div class="row">
                  <div class="label">单词发音</div>
                  <div class="option">
                    <el-radio-group v-model="settingStore.wordSoundType">
                      <el-radio label="us" size="large">美音</el-radio>
                      <el-radio label="uk" size="large">英音</el-radio>
                    </el-radio-group>
                  </div>
                </div>
                <div class="row">
                  <div class="label">单词自动发音</div>
                  <div class="option">
                    <el-switch v-model="settingStore.wordSound"
                               inline-prompt
                               active-text="开"
                               inactive-text="关"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="label">是否显示翻译</div>
                  <div class="option">
                    <el-switch v-model="settingStore.translate"
                               inline-prompt
                               active-text="开"
                               inactive-text="关"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="label">忽略大小写</div>
                  <div class="option">
                    <el-switch v-model="settingStore.ignoreCase"
                               inline-prompt
                               active-text="开"
                               inactive-text="关"
                    />
                  </div>
                </div>
              </div>
              <div class="add" v-else>
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
            <div class="right-column">
              <div class="tabs">
                <div class="tab"
                     @click="detailListTabIndex = 0"
                     :class="detailListTabIndex === 0 && 'active'">
                  <span>{{ dictIsArticle ? '文章' : '章节' }}列表</span>
                </div>
                <div class="tab"
                     @click="detailListTabIndex = 1"
                     :class="detailListTabIndex === 1 && 'active'">
                  <span>单词列表</span>
                </div>
              </div>
              <ChapterList
                  v-loading="loading"
                  v-if="detailListTabIndex === 0"
                  :is-article="dictIsArticle"
                  v-model:active-index="runtimeStore.editDict.chapterIndex"
                  :dict="runtimeStore.editDict"/>
              <div class="scroll" v-else>
                <VirtualWordList
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
                        @click="delWord(word,index)"
                        title="移除"
                        icon="solar:trash-bin-minimalistic-linear"/>
                  </template>
                </VirtualWordList>
                <Empty v-else/>
              </div>
            </div>
          </div>
          <div v-if="false" class="activity">
            <ActivityCalendar
                :data="[{ date: '2023-05-22', count: 5 }]"
                :width="40"
                :height="7"
                :cellLength="16"
                :cellInterval="8"
                :fontSize="12"
                :showLevelFlag="false"
                :showWeekDayFlag="false"
                :clickEvent="clickEvent"
            />
          </div>
          <div class="footer">
            <!--            <BaseButton @click="step = 0">导出</BaseButton>-->
            <BaseButton @click="close">关闭</BaseButton>
            <BaseButton @click="changeDict">切换</BaseButton>
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
  <WordListModal/>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

$modal-mask-bg: rgba(#000, .15);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

#DictDialog {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-second-bg);
  z-index: 99999;
  width: 1000rem;
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
    cursor: pointer;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    height: $header-height;
    align-items: center;
    justify-content: space-between;
    color: var(--color-font-3);
    padding: 0 var(--space);

    .left {
      display: flex;
      gap: 10rem;
      align-items: center;
    }
  }

  .detail {
    padding-left: var(--space);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .page-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      position: relative;

      .left-column {
        overflow: auto;
        flex: 4;
        display: flex;
        flex-direction: column;
        gap: 10rem;
        min-height: 100rem;
        position: relative;
        color: var(--color-font-1);
        font-size: 14rem;
        position: relative;
        padding-right: var(--space);

        .name {
          font-size: 28rem;
          margin-bottom: 10rem;
        }

        .desc {
          font-size: 18rem;
          margin-bottom: 30rem;
        }

        .count {
          cursor: pointer;
          border-bottom: 2px solid var(--color-item-active);
        }

        .edit-icon {

        }

        :deep(.edit-icon) {
          position: absolute;
          top: 8rem;
          right: 0;
        }
      }

      .center-column {
        overflow: auto;
        flex: 7;
        background: white;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);

        .setting {
          .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40rem;
            word-break: keep-all;
            gap: 10rem;

            .el-radio {
              margin-right: 10rem;
            }
          }
        }

      }

      .right-column {
        flex: 8;
        border-radius: 10rem;
        background: var(--color-second-bg);
        color: var(--color-font-1);
        display: flex;
        flex-direction: column;

        .tabs {
          display: flex;
          margin-bottom: 10rem;

          .tab {
            font-size: 20rem;
            color: var(--color-font-3);
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;

            span {
              cursor: pointer;
              border-bottom: 3px solid transparent;
              padding-bottom: 10rem;
              transition: all .3s;
            }

            &.active {
              color: var(--color-font-1);

              span {
                border-bottom: 3px solid var(--color-main-active);
              }
            }
          }

        }

        .scroll {
          height: calc(100% - 45rem);
        }
      }
    }

    .activity {
      display: flex;
      justify-content: center;
    }

    .footer {
      box-sizing: content-box;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      gap: var(--space);
      padding-right: var(--space);
    }
  }

  .edit-dict {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;

    .wrapper {
      width: 50%;
    }

    .el-select {
      width: 100%;
    }

  }

}
</style>

