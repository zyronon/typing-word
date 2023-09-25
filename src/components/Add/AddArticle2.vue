<script setup lang="ts">

import {onMounted, watch} from "vue";
import {Article, DefaultArticle, Sentence, TranslateEngine, TranslateType} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {
  getNetworkTranslate,
  getSentenceAllText,
  getSentenceAllTranslateText,
  updateLocalSentenceTranslate,
  updateSections
} from "@/hooks/translate.ts";
import * as copy from "copy-to-clipboard";
import {getSplitTranslateText} from "@/hooks/article.ts";
import EditAbleText from "@/components/EditAbleText.vue";
import {cloneDeep} from "lodash-es";
import {useDisableEventListener} from "@/hooks/event.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import BaseIcon from "@/components/BaseIcon.vue";
import {useBaseStore} from "@/stores/base.ts";
import {$computed, $ref} from "vue/macros";
import Input from "@/components/Input.vue";
import List from "@/components/List.vue";

interface IProps {
  selectIndex?: number
}

const props = withDefaults(defineProps<IProps>(), {
  selectIndex: -1
})

const base = useBaseStore()
let article = $ref<Article>(cloneDeep(DefaultArticle))
let selectIndex = $ref<number>(props.selectIndex)
let selectItem = $ref<number>(props.selectIndex)
let networkTranslateEngine = $ref('baidu')
let searchKey = $ref('')
let progress = $ref(0)
const TranslateEngineOptions = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]
const emit = defineEmits([
  'update:modelValue',
  'close',
  'save'
])

// useDisableEventListener(() => props.modelValue)

watch(() => props.article, n => {
  if (n) {
    article = cloneDeep(props.article)
    if (article.text.trim()) {
      if (article.useTranslateType === TranslateType.custom) {
        if (article.textCustomTranslate.trim()) {
          if (!article.textCustomTranslateIsFormat) {
            let r = getSplitTranslateText(article.textCustomTranslate)
            if (r) article.textCustomTranslate = r
            ElMessage({
              message: '检测到本地翻译未格式化，已自动格式',
              type: 'success',
              duration: 5000
            })
          }
        }
      }
    }
    updateSentenceTranslate()
  }
})

onMounted(() => {
  if (selectIndex > -1) {
    article = base.currentEditDict.articles[selectIndex]
  }
})

async function startNetworkTranslate() {
  if (!article.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!article.text.trim()) {
    return ElMessage.error('请填写正文！')
  }
  updateSections(article)
  article.textNetworkTranslate = ''
  //注意！！！
  //这里需要用异步，因为watch了article.networkTranslate，改变networkTranslate了之后，会重新设置article.sections
  //导致getNetworkTranslate里面拿到的article.sections是废弃的值
  setTimeout(async () => {
    await getNetworkTranslate(article, TranslateEngine.Baidu, true, (v: number) => {
      progress = v
    })

    copy(JSON.stringify(article.sections))
  })
}

function saveSentenceTranslate(sentence: Sentence, val: string) {
  sentence.translate = val
  if (article.useTranslateType === TranslateType.custom) {
    article.textCustomTranslate = getSentenceAllTranslateText(article)
  }
  if (article.useTranslateType === TranslateType.network) {
    article.textNetworkTranslate = getSentenceAllTranslateText(article)
  }
}

function saveSentenceText(sentence: Sentence, val: string) {
  sentence.text = val
  article.text = getSentenceAllText(article)
  updateSentenceTranslate()
}

function updateSentenceTranslate() {
  if (article.text.trim()) {
    updateSections(article)
    if (article.useTranslateType === TranslateType.custom) {
      updateLocalSentenceTranslate(article, article.textCustomTranslate)
    }
    if (article.useTranslateType === TranslateType.network) {
      updateLocalSentenceTranslate(article, article.textNetworkTranslate)
    }
  } else {
    article.sections = []
  }
}

function appendTranslate(str: string) {
  if (article.useTranslateType === TranslateType.custom) {
    article.textCustomTranslate += str
  }
  if (article.useTranslateType === TranslateType.network) {
    article.textNetworkTranslate += str
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  // @ts-ignore
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  return MessageBox.confirm(
      '是否需要进行自动分句',
      '提示',
      () => {
        let r = getSplitTranslateText(paste)
        if (r) appendTranslate(r)
      },
      () => {
        appendTranslate(paste)
      },
      {
        confirmButtonText: '需要',
        cancelButtonText: '关闭',
      }
  )
}

function onBlur() {
  document.removeEventListener('paste', onPaste);
}

function onFocus() {
  document.addEventListener('paste', onPaste);
}

function save(option: 'save' | 'next') {
  console.log('article', article)
  copy(JSON.stringify(article))

  article.title = article.title.trim()
  article.titleTranslate = article.titleTranslate.trim()
  article.text = article.text.trim()
  article.textCustomTranslate = article.textCustomTranslate.trim()
  article.textNetworkTranslate = article.textNetworkTranslate.trim()

  if (!article.title) {
    return ElMessage.error('请填写标题！')
  }
  if (!article.text) {
    return ElMessage.error('请填写正文！')
  }

  let has = base.currentEditDict.articles.find((item: Article) => item.title === article.title)
  if (has && selectIndex === -1) {
    return ElMessage.error('已存在同名文章！')
  }

  const saveTemp = () => {
    article.textCustomTranslateIsFormat = true
    // emit('close')
    // emit('save', cloneDeep(article))
    if (selectIndex > -1) {
      base.currentEditDict.articles[selectIndex] = cloneDeep(article)
    } else {
      base.currentEditDict.articles.push(cloneDeep(article))
      if (option === 'save') {
        selectIndex = base.currentEditDict.articles.length - 1
      }
    }
    if (option === 'next') {
      selectIndex = -1
      article = cloneDeep(DefaultArticle)
    }
    ElMessage.success('保存成功！')
  }

  if (article.useTranslateType === TranslateType.network) {
    if (!article.textNetworkTranslate) {
      return MessageBox.confirm(
          '您选择了“网络翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?',
          '提示',
          () => {
            article.useTranslateType = TranslateType.none
            saveTemp()
          },
          () => void 0,
      )
    }
  }

  if (article.useTranslateType === TranslateType.custom) {
    if (!article.textCustomTranslate) {
      return MessageBox.confirm(
          '您选择了“本地翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?',
          '提示',
          () => {
            article.useTranslateType = TranslateType.none
            saveTemp()
          },
          () => void 0,
      )
    }
  }

  saveTemp()
}

watch(() => article.textCustomTranslate, (str: string) => {
  updateSentenceTranslate()
})

watch(() => article.textNetworkTranslate, (str: string) => {
  updateSentenceTranslate()
})

watch(() => article.useTranslateType, () => {
  if (article.text.trim()) {
    if (article.useTranslateType === TranslateType.custom) {
      if (article.textCustomTranslate.trim()) {
        updateLocalSentenceTranslate(article, article.textCustomTranslate)
      } else {
        updateSections(article)
      }
    }
    if (article.useTranslateType === TranslateType.network) {
      if (article.textNetworkTranslate.trim()) {
        updateLocalSentenceTranslate(article, article.textNetworkTranslate)
      } else {
        updateSections(article)
      }
    }
    if (article.useTranslateType === TranslateType.none) {
      updateSections(article)
    }
  }
})

const list = $computed(() => {
  if (searchKey) {
    return base.currentEditDict.articles.filter((item: Article) => {
      //把搜索内容，分词之后，判断是否有这个词，比单纯遍历包含体验更好
      return searchKey.toLowerCase().split(' ').filter(v => v).some(value => {
        return item.title.toLowerCase().includes(value) || item.titleTranslate.toLowerCase().includes(value)
      })
    })
  } else {
    return base.currentEditDict.articles
  }
})

function selectArticle(index: number) {
  article = cloneDeep(base.currentEditDict.articles[index])
  selectIndex = index
}

function delArticle(item: Article) {
  let rIndex = base.currentEditDict.articles.findIndex((v: Article) => v.id === item.id)
  if (rIndex > -1) {
    if (index < selectIndex) {
      selectIndex--
    } else if (index === selectIndex) {
      if (selectIndex === base.currentEditDict.articles.length - 1) {
        selectIndex--
      }
    }
    base.currentEditDict.articles.splice(index, 1)
    if (selectIndex < 0) {
      article = cloneDeep(DefaultArticle)
    } else {
      article = cloneDeep(base.currentEditDict.articles[selectIndex])
    }
  }
}

</script>

<template>
  <div class="add-article">
    <div class="slide">
      <header>
        <div class="dict-name">{{ base.currentEditDict.name }}</div>
        <BaseIcon title="选择其他词典/文章" icon="carbon:change-catalog"/>
      </header>
      <List
          v-model:list="list"
          v-model:searchKey="searchKey"
          :select-index="selectIndex"
          :row-key="(item:Article) => item.title"
          @del-article="delArticle"
          @select-article="selectArticle"
      >
        <template v-slot="{item,index}">
          <div class="name"> {{ `${index + 1}. ${item.title}` }}</div>
          <div class="translate-name"> {{ `   ${item.titleTranslate}` }}</div>
        </template>
      </List>
      <div class="footer">
        <BaseButton>导入</BaseButton>
        <BaseButton>导出</BaseButton>
      </div>
    </div>

    <div class="content">
      <div class="row">
        <div class="title">原文</div>
        <div class="item">
          <div class="label">标题：</div>
          <textarea
              v-model="article.title"
              type="textarea"
              class="base-textarea"
              placeholder="请填写原文标题"
          >
            </textarea>
        </div>
        <div class="item basic">
          <div class="label">正文：</div>
          <textarea
              v-model="article.text"
              @input="updateSentenceTranslate"
              :readonly="![100,0].includes(progress)"
              type="textarea"
              class="base-textarea"
              placeholder="请填写原文正文"
          >
            </textarea>
        </div>
      </div>
      <div class="row">
        <div class="title">译文</div>
        <div class="item">
          <div class="label">
            <span>标题：</span>
            <el-radio-group v-model="article.useTranslateType">
              <el-radio-button :label="TranslateType.custom">本地翻译</el-radio-button>
              <el-radio-button :label="TranslateType.network">网络翻译</el-radio-button>
              <el-radio-button :label="TranslateType.none">不需要翻译</el-radio-button>
            </el-radio-group>
          </div>
          <textarea
              v-model="article.titleTranslate"
              type="textarea"
              class="base-textarea"
              placeholder="请填写翻译标题"
          >
            </textarea>
        </div>
        <div class="item basic">
          <div class="label">
            <span>正文：</span>
            <div class="translate-item" v-if="article.useTranslateType === TranslateType.network">
              <el-progress :percentage="progress"
                           :duration="30"
                           :striped="progress !== 100"
                           :striped-flow="progress !== 100"
                           :stroke-width="8"
                           :show-text="true"/>
              <el-select v-model="networkTranslateEngine"
                         style="width: 80rem;"
              >
                <el-option
                    v-for="item in TranslateEngineOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
              <BaseButton
                  size="small"
                  @click="startNetworkTranslate"
                  :loading="progress!==0 && progress !== 100"
              >开始翻译
              </BaseButton>

            </div>
          </div>
          <textarea
              v-if="article.useTranslateType === TranslateType.custom"
              v-model="article.textCustomTranslate"
              :readonly="![100,0].includes(progress)"
              @blur="onBlur"
              @focus="onFocus"
              type="textarea"
              class="base-textarea"
              placeholder="请填写翻译正文"
          >
            </textarea>
          <textarea
              v-if="article.useTranslateType === TranslateType.network"
              v-model="article.textNetworkTranslate"
              @blur="onBlur"
              @focus="onFocus"
              type="textarea"
              class="base-textarea"
              placeholder="等待网络翻译中..."
          >
            </textarea>
        </div>
      </div>
      <div class="row">
        <div class="title">译文对照</div>
        <div class="article-translate">
          <div class="section" v-for="(item,indexI) in article.sections">
            <div class="sentence" v-for="(sentence,indexJ) in item">
              <EditAbleText
                  :value="sentence.text"
                  @save="(e:string) => saveSentenceText(sentence,e)"
              />
              <EditAbleText
                  :value="sentence.translate"
                  @save="(e:string) => saveSentenceTranslate(sentence,e)"
              />
            </div>
          </div>
        </div>
        <div class="options" v-if="article.text.trim()">
          <BaseButton @click="save('save')">保存</BaseButton>
          <BaseButton @click="save('next')">保存并添加下一篇</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.add-article {
  //position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  color: black;
  background: var(--color-main-bg);
  display: flex;

  .slide {
    height: 100%;
    background: white;
    padding: 0 10rem;
    display: flex;
    flex-direction: column;

    $height: 60rem;

    header {
      height: $height;
      display: flex;
      justify-content: space-between;
      align-items: center;
      //opacity: 0;

      .dict-name {
        font-size: 30rem;
        color: black;
      }
    }

    .name {
      font-size: 18rem;
    }

    .translate-name {
      font-size: 16rem;
    }

    .footer {
      height: $height;
      display: flex;
      gap: $space;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .content {
    flex: 1;
    display: flex;
    gap: $space;
    padding: $space;
    //opacity: 0;
  }

  .row {
    flex: 1;
    width: 33%;
    //height: 100%;
    display: flex;
    flex-direction: column;
    //opacity: 0;

    .basic {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &:nth-child(2) {
      opacity: 1;
    }

    .title {
      font-size: 22rem;
      text-align: center;
    }

    .item {
      width: 100%;
      //margin-bottom: 10rem;

      .label {
        height: 45rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16rem;
      }
    }

    .translate-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: calc($space / 2);
    }

    .el-progress {
      flex: 1;
    }

    .article-translate {
      margin-top: 10rem;
      margin-bottom: 20rem;
      flex: 1;
      overflow: auto;
      border-radius: 8rem;

      .section {
        background: white;
        margin-bottom: 20rem;
        padding: $space;
        border-radius: 8rem;

        &:last-child {
          margin-bottom: 0;
        }

        .sentence {
          margin-bottom: 20rem;

          .text {
            font-size: 18rem;
          }
        }
      }
    }

    .options {
      display: flex;
      justify-content: flex-end;
      gap: $space;
    }
  }
}
</style>