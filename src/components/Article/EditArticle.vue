<script setup lang="ts">

import {Article, DefaultArticle, Sentence, TranslateEngine, TranslateType} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import EditAbleText from "@/components/EditAbleText.vue";
import {Icon} from "@iconify/vue";
import {
  getNetworkTranslate,
  getSentenceAllText,
  getSentenceAllTranslateText,
  renewSectionTexts,
  renewSectionTranslates
} from "@/hooks/translate.ts";
import * as copy from "copy-to-clipboard";
import {$ref} from "vue/macros";
import {MessageBox} from "@/utils/MessageBox.tsx";
import {getSplitTranslateText} from "@/hooks/article.ts";
import {cloneDeep} from "lodash-es";
import {v4 as uuidv4} from "uuid";
import {watch} from "vue";
import {useBaseStore} from "@/stores/base.ts";

interface IProps {
  article?: Article
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle),
})

let networkTranslateEngine = $ref('baidu')
let progress = $ref(0)
let failCount = $ref(0)
const TranslateEngineOptions = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]

const base = useBaseStore()
let article = $ref<Article>(cloneDeep(DefaultArticle))

watch(() => props.article, val => {
  article = cloneDeep(val)
  if (article.text.trim()) {
    if (article.useTranslateType === TranslateType.custom) {
      if (article.textCustomTranslate.trim()) {
        if (!article.textCustomTranslateIsFormat) {
          let r = getSplitTranslateText(article.textCustomTranslate)
          if (r) {
            article.textCustomTranslate = r
            ElMessage({
              message: '检测到本地翻译未格式化，已自动格式化',
              type: 'success',
              duration: 5000
            })
          }
        }
      }
    }
  }
  renewSections()
  console.log('ar', article)
}, {immediate: true})

function renewSections() {
  if (article.text.trim()) {
    renewSectionTexts(article)
    if (article.useTranslateType === TranslateType.custom) {
      failCount = renewSectionTranslates(article, article.textCustomTranslate)
    }
    if (article.useTranslateType === TranslateType.network) {
      failCount = renewSectionTranslates(article, article.textNetworkTranslate)
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
      '是否需要自动分句',
      '提示',
      () => {
        let r = getSplitTranslateText(paste)
        if (r) {
          appendTranslate(r)
          renewSections()
        }
      },
      () => {
        appendTranslate(paste)
        renewSections()
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

function save(option: 'save' | 'next', mute: boolean = false) {
  console.log('article', article)
  copy(JSON.stringify(article))

  if (mute) {
    if (article.title.trim() && article.text.trim()) {
      return false
    }
  }

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
  if (has && !article.id) {
    return ElMessage.error('已存在同名文章！')
  }

  const saveTemp = () => {
    article.textCustomTranslateIsFormat = true
    // emit('close')
    // emit('save', cloneDeep(article))
    if (article.id) {
      let rIndex = base.currentEditDict.articles.findIndex(v => v.id === article.id)
      if (rIndex > -1) {
        base.currentEditDict.articles[rIndex] = cloneDeep(article)
      }
    } else {
      let data = {...article, id: uuidv4()}
      base.currentEditDict.articles.push(data)
      if (option === 'save') {
        article = cloneDeep(data)
      }
    }
    if (option === 'next') {
      article = cloneDeep(DefaultArticle)
    }
    //TODO 保存完成后滚动到对应位置
    if (!mute) {
      ElMessage.success('保存成功！')
    }
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

async function startNetworkTranslate() {
  if (!article.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!article.text.trim()) {
    return ElMessage.error('请填写正文！')
  }
  renewSectionTexts(article)
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
  renewSections()
}

function saveSentenceText(sentence: Sentence, val: string) {
  sentence.text = val
  article.text = getSentenceAllText(article)
  renewSections()
}

defineExpose({save})
</script>

<template>
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
            @input="renewSections"
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
          <el-radio-group
              v-model="article.useTranslateType"
              @change="renewSections"
          >
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
            @input="renewSections"
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
            @input="renewSections"
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
        <div class="warning">
          <template v-if="failCount && article.useTranslateType !== TranslateType.none">
            <Icon icon="typcn:warning-outline"/>
            共有{{ failCount }}句没有翻译！
          </template>
        </div>
        <div class="left">
          <BaseButton @click="save('save')">保存</BaseButton>
          <BaseButton @click="save('next')">保存并添加下一篇</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.content {
  flex: 1;
  display: flex;
  gap: $space;
  padding: $space;
  padding-top: 10rem;
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

        &:last-child {
          margin-bottom: 0;
        }

        .text {
          font-size: 18rem;
        }
      }
    }
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .warning {
      display: flex;
      align-items: center;
      font-size: 20rem;
      color: red;
      gap: 10rem;

    }

    .left {
      gap: $space;
      display: flex;
    }
  }
}
</style>