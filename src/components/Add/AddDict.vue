<script setup lang="ts">
import Modal from "@/components/Modal/Modal.vue"
import {Icon} from '@iconify/vue';
import {useSettingStore} from "@/stores/setting.ts";
import DictList from "@/components/DictList.vue";
import {Dict, DictType, languageCategoryOptions, Sort} from "@/types.ts";
import {$computed, $ref} from "vue/macros";
import {useDisableEventListener} from "@/hooks/event.ts";
import {onMounted, reactive, watch} from "vue";
import {dictionaryResources} from "@/assets/dictionary.ts";
import {cloneDeep} from "lodash-es";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {FormInstance, FormRules} from "element-plus";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import ChapterList from "@/components/ChapterList.vue";
import {useBaseStore} from "@/stores/base.ts";

const baseStore = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

const emit = defineEmits([
  'close',
])

let step = $ref(1)
let isEdit = $ref(true)

useDisableEventListener()


let list = $computed(() => {
  return baseStore.myDicts.filter(v => v.type === DictType.customArticle).concat([{name: '',} as any])
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
        let rIndex = baseStore.myDicts.findIndex(v => v.id === form.id)
        runtimeStore.editDict = data
        baseStore.myDicts[rIndex] = cloneDeep(data)
        isEdit = false
      } else {
        if (baseStore.myDicts.find(v => v.name === form.name)) {
          return ElMessage.warning('已有相同名称词典！')
        } else {
          runtimeStore.editDict = data
          baseStore.myDicts.push(cloneDeep(data))
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
  <Modal
      :show-close="false"
      :header="false"
      @close="close"
      title="我的词典">
    <div class="slide">
      <div class="slide-list" :class="`step${step}`">
        <div class="page">
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
            <div class="other">
              <div class="common-title">
                文章列表：共{{ runtimeStore.editDict.articles.length }}章
                <Icon @click="emitter.emit(EventKey.openArticleListModal)"
                      class="hvr-grow pointer"
                      width="24" color="#929596"
                      icon="mi:add"/>
              </div>
              <ChapterList
                  :is-article="true"
                  v-model:active-index="runtimeStore.editDict.chapterIndex"
                  :dict="runtimeStore.editDict"/>
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
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.slide {
  width: 700rem;
  height: 75vh;

  .slide-list {
    width: 200%;
    height: 100%;
    display: flex;
    transition: all .5s;
  }

  .step1 {
    transform: translate3d(-50%, 0, 0);
  }
}

$header-height: 60rem;
.page {
  padding: $space;
  padding-top: 0;
  width: 50%;

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
}

.add-page {
  color: black;

  .detail {
    display: flex;
    position: relative;
    gap: $space;

    .dict {
      overflow: auto;
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 10rem;
      padding: 15rem;
      min-height: 100rem;
      position: relative;
      border-radius: 10rem;
      background: var(--color-second-bg);
      color: var(--color-font-1);
      font-size: 14rem;

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
    }

    .other {
      flex: 5;
      border-radius: 10rem;
      background: var(--color-second-bg);
      color: var(--color-font-1);
      padding: 10rem;
      display: flex;
      flex-direction: column;

      .common-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}

</style>