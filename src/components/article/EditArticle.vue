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
import {watch} from "vue";
import Empty from "@/components/Empty.vue";

interface IProps {
  article?: Article,
  type?: 'single' | 'batch'
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle),
  type: 'single'
})

const emit = defineEmits<{
  save: [val: Article],
  saveAndNext: [val: Article]
}>()

let networkTranslateEngine = $ref('baidu')
let progress = $ref(0)
let failCount = $ref(0)
let textareaRef = $ref<HTMLTextAreaElement>()
const TranslateEngineOptions = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]

let editArticle = $ref<Article>(cloneDeep(DefaultArticle))

watch(() => props.article, val => {
  editArticle = cloneDeep(val)
  progress = 0
  failCount = 0
  if (editArticle.text.trim()) {
    if (editArticle.useTranslateType === TranslateType.custom) {
      if (editArticle.textCustomTranslate.trim()) {
        if (!editArticle.textCustomTranslateIsFormat) {
          let r = getSplitTranslateText(editArticle.textCustomTranslate)
          if (r) {
            editArticle.textCustomTranslate = r
            ElMessage({
              message: '检测到本地翻译未格式化，已自动格式化',
              type: 'success',
              duration: 3000
            })
          }
        }
      }
    }
  }
  renewSections()
  // console.log('ar', article)
}, {immediate: true})

function renewSections() {
  if (editArticle.text.trim()) {
    renewSectionTexts(editArticle)
    if (editArticle.useTranslateType === TranslateType.custom) {
      failCount = renewSectionTranslates(editArticle, editArticle.textCustomTranslate)
    }
    if (editArticle.useTranslateType === TranslateType.network) {
      failCount = renewSectionTranslates(editArticle, editArticle.textNetworkTranslate)
    }
  } else {
    editArticle.sections = []
  }
}

function appendTranslate(str: string) {
  let selectionStart = textareaRef.selectionStart;
  let selectionEnd = textareaRef.selectionEnd;
  if (editArticle.useTranslateType === TranslateType.custom) {
    editArticle.textCustomTranslate = editArticle.textCustomTranslate.slice(0, selectionStart) + str + editArticle.textCustomTranslate.slice(selectionEnd)
  }
  if (editArticle.useTranslateType === TranslateType.network) {
    editArticle.textNetworkTranslate = editArticle.textNetworkTranslate.slice(0, selectionStart) + str + editArticle.textNetworkTranslate.slice(selectionEnd)
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
      }, null,
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

async function startNetworkTranslate() {
  if (!editArticle.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!editArticle.text.trim()) {
    return ElMessage.error('请填写正文！')
  }
  renewSectionTexts(editArticle)
  editArticle.textNetworkTranslate = ''
  //注意！！！
  //这里需要用异步，因为watch了article.networkTranslate，改变networkTranslate了之后，会重新设置article.sections
  //导致getNetworkTranslate里面拿到的article.sections是废弃的值
  setTimeout(async () => {
    await getNetworkTranslate(editArticle, TranslateEngine.Baidu, true, (v: number) => {
      progress = v
    })
    failCount = 0

    copy(JSON.stringify(editArticle.sections))
  })
}

function saveSentenceTranslate(sentence: Sentence, val: string) {
  sentence.translate = val
  if (editArticle.useTranslateType === TranslateType.custom) {
    editArticle.textCustomTranslate = getSentenceAllTranslateText(editArticle)
  }
  if (editArticle.useTranslateType === TranslateType.network) {
    editArticle.textNetworkTranslate = getSentenceAllTranslateText(editArticle)
  }
  renewSections()
}

function saveSentenceText(sentence: Sentence, val: string) {
  sentence.text = val
  editArticle.text = getSentenceAllText(editArticle)
  renewSections()
}

function save(option: 'save' | 'saveAndNext') {
  // return console.log(cloneDeep(editArticle))
  return new Promise((resolve: Function) => {
    // console.log('article', article)
    // copy(JSON.stringify(article))

    editArticle.title = editArticle.title.trim()
    editArticle.titleTranslate = editArticle.titleTranslate.trim()
    editArticle.text = editArticle.text.trim()
    editArticle.textCustomTranslate = editArticle.textCustomTranslate.trim()
    editArticle.textNetworkTranslate = editArticle.textNetworkTranslate.trim()

    if (!editArticle.title) {
      ElMessage.error('请填写标题！')
      return resolve(false)
    }
    if (!editArticle.text) {
      ElMessage.error('请填写正文！')
      return resolve(false)
    }

    const saveTemp = () => {
      editArticle.textCustomTranslateIsFormat = true
      emit(option as any, editArticle)

      return resolve(true)
    }

    if (editArticle.useTranslateType === TranslateType.network) {
      if (!editArticle.textNetworkTranslate) {
        return MessageBox.confirm(
            '您选择了“网络翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?',
            '提示',
            () => {
              editArticle.useTranslateType = TranslateType.none
              saveTemp()
            },
            () => void 0,
        )
      }
    }

    if (editArticle.useTranslateType === TranslateType.custom) {
      if (!editArticle.textCustomTranslate) {
        return MessageBox.confirm(
            '您选择了“本地翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?',
            '提示',
            () => {
              editArticle.useTranslateType = TranslateType.none
              saveTemp()
            },
            () => void 0,
        )
      }
    }

    saveTemp()
  })
}

//不知道为什么直接用editArticle，取到是空的默认值
defineExpose({save, getEditArticle: () => cloneDeep(editArticle)})

</script>

<template>
  <div class="content">
    <div class="row">
      <div class="title">①原文</div>
      <div class="item">
        <div class="label">标题：</div>
        <textarea
            v-model="editArticle.title"
            type="textarea"
            class="base-textarea"
            placeholder="请填写原文标题"
        >
            </textarea>
      </div>
      <div class="item basic">
        <div class="label">正文：</div>
        <textarea
            v-model="editArticle.text"
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
      <div class="title">②译文</div>
      <div class="item">
        <div class="label">
          <span>标题：</span>
          <el-radio-group
              v-model="editArticle.useTranslateType"
              @change="renewSections"
          >
            <el-radio-button :label="TranslateType.custom">本地翻译</el-radio-button>
            <el-radio-button :label="TranslateType.network">网络翻译</el-radio-button>
            <el-radio-button :label="TranslateType.none">不需要翻译</el-radio-button>
          </el-radio-group>
        </div>
        <textarea
            v-model="editArticle.titleTranslate"
            type="textarea"
            class="base-textarea"
            placeholder="请填写翻译标题"
        >
            </textarea>
      </div>
      <div class="item basic">
        <div class="label">
          <span>正文：</span>
          <div class="translate-item" v-if="editArticle.useTranslateType === TranslateType.network">
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
            v-if="editArticle.useTranslateType === TranslateType.custom"
            v-model="editArticle.textCustomTranslate"
            @input="renewSections"
            @blur="onBlur"
            @focus="onFocus"
            type="textarea"
            class="base-textarea"
            placeholder="请填写翻译正文"
            ref="textareaRef"
        >
            </textarea>
        <textarea
            v-if="editArticle.useTranslateType === TranslateType.network"
            v-model="editArticle.textNetworkTranslate"
            :readonly="![100,0].includes(progress)"
            @input="renewSections"
            @blur="onBlur"
            @focus="onFocus"
            type="textarea"
            class="base-textarea"
            placeholder="等待网络翻译中..."
            ref="textareaRef"
        >
            </textarea>
        <Empty
            text="不需要翻译~"
            v-if="editArticle.useTranslateType === TranslateType.none"
        />
      </div>
    </div>
    <div class="row">
      <div class="title">③译文对照</div>
      <template v-if="editArticle.sections.length">
        <div class="article-translate">
          <div class="section" v-for="(item,indexI) in editArticle.sections">
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
        <div class="options" v-if="editArticle.text.trim()">
          <div class="status">
            <span>状态：</span>
            <div class="warning" v-if="failCount && editArticle.useTranslateType !== TranslateType.none">
              <Icon icon="typcn:warning-outline"/>
              共有{{ failCount }}句没有翻译！
            </div>
            <div class="success" v-else>
              <Icon icon="mdi:success-circle-outline"/>
              翻译完成！
            </div>
          </div>
          <div class="left">
            <BaseButton @click="save('save')">保存</BaseButton>
            <BaseButton v-if="type === 'batch'" @click="save('saveAndNext')">保存并添加下一篇</BaseButton>
          </div>
        </div>
      </template>
      <Empty v-else text="没有译文对照~"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.content {
  color: var(--color-font-1);
  flex: 1;
  display: flex;
  gap: var(--space);
  padding: var(--space);
  padding-top: 10rem;
}

.row {
  flex: 10;
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

  &:nth-child(1) {
    flex: 7;
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
    gap: calc(var(--space) / 2);
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
      background: var(--color-textarea-bg);
      margin-bottom: 20rem;
      padding: var(--space);
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

    .status {
      display: flex;
      align-items: center;
    }

    .warning {
      display: flex;
      align-items: center;
      font-size: 20rem;
      color: red;
    }

    .success {
      display: flex;
      align-items: center;
      font-size: 20rem;
      color: #67C23A;
    }

    .left {
      gap: var(--space);
      display: flex;
    }
  }
}
</style>