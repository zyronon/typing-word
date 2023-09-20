<script setup lang="ts">

import {onMounted, reactive, watch} from "vue";
import {Article, DefaultArticle, Sentence, TranslateEngine, TranslateType} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {
  getNetworkTranslate,
  getSentenceAllText,
  getSentenceAllTranslateText,
  updateLocalSentenceTranslate
} from "@/hooks/translate.ts";
import * as copy from "copy-to-clipboard";
import {getSplitTranslateText, splitEnArticle} from "@/hooks/article.ts";
import EditAbleText from "@/components/EditAbleText.vue";
import {Icon} from "@iconify/vue";
import {cloneDeep} from "lodash-es";
import {useDisableEventListener, useEsc} from "@/hooks/event.ts";

interface IProps {
  article?: Article
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => cloneDeep(DefaultArticle)
})

let article = reactive<Article>(props.article)
let networkTranslateEngine = $ref('baidu')
let progress = $ref(0)
const TranslateEngineOptions = [
  {value: 'baidu', label: '百度'},
  {value: 'youdao', label: '有道'},
]
const emit = defineEmits(['close', 'save'])

useDisableEventListener()
useEsc(() => {
  emit('close')
})

onMounted(() => {
  updateSentenceTranslate()
})

function updateSections() {
  let {text, sections} = splitEnArticle(article.article)
  article.article = text
  article.sections = sections
}

async function startNetworkTranslate() {
  if (!article.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!article.article.trim()) {
    return ElMessage.error('请填写正文！')
  }
  updateSections()
  article.networkTranslate = ''
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
  if (article.translateType === TranslateType.custom) {
    article.customTranslate = getSentenceAllTranslateText(article)
  } else {
    article.networkTranslate = getSentenceAllTranslateText(article)
  }
}

function saveSentenceText(sentence: Sentence, val: string) {
  sentence.text = val
  article.article = getSentenceAllText(article)
  updateSentenceTranslate()
}

function updateSentenceTranslate() {
  if (article.article.trim()) {
    updateSections()
    if (article.translateType === TranslateType.custom) {
      updateLocalSentenceTranslate(article, article.customTranslate)
    } else {
      updateLocalSentenceTranslate(article, article.networkTranslate)
    }
  }
}

function appendTranslate(str: string) {
  if (article.translateType === TranslateType.custom) {
    article.customTranslate += str
  } else {
    article.networkTranslate += str
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  // @ts-ignore
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  ElMessageBox.confirm('', '是否需要进行自动分句?', {
    confirmButtonText: '需要',
    cancelButtonText: '关闭',
    type: 'warning',
  }).then(() => {
    let r = getSplitTranslateText(paste)
    if (r) appendTranslate(r)
  }).catch(() => {
    appendTranslate(paste)
  })
}

function onBlur() {
  document.removeEventListener('paste', onPaste);
}

function onFocus() {
  document.addEventListener('paste', onPaste);
}

function save() {
  console.log('article', article)
  copy(JSON.stringify(article))

  if (!article.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!article.article.trim()) {
    return ElMessage.error('请填写正文！')
  }

  const saveTemp = ()=>{
    article.translateSplit = true
    emit('close')
    emit('save', cloneDeep(article))
  }

  if (article.translateType === TranslateType.network) {
    if (!article.networkTranslate.trim()) {
      return ElMessageBox.confirm('您选择了“网络翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        article.translateType = TranslateType.none
        saveTemp()
      }).catch(() => void 0)
    }
  }

  if (article.translateType === TranslateType.custom) {
    if (!article.customTranslate.trim()) {
      return ElMessageBox.confirm('您选择了“本地翻译”，但译文内容却为空白，是否修改为“不需要翻译”并保存?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        article.translateType = TranslateType.none
        saveTemp()
      }).catch(() => void 0)
    }
  }

}

watch(() => article.customTranslate, (str: string) => {
  updateSentenceTranslate()
})

watch(() => article.networkTranslate, (str: string) => {
  updateSentenceTranslate()
})

watch(() => article.translateType, () => {
  if (article.article.trim()) {
    if (article.translateType === TranslateType.custom) {
      if (article.customTranslate.trim()) {
        updateLocalSentenceTranslate(article, article.customTranslate)
      } else {
        updateSections()
      }
    } else {
      if (article.networkTranslate.trim()) {
        updateLocalSentenceTranslate(article, article.networkTranslate)
      } else {
        updateSections()
      }
    }
  }
})

</script>

<template>
  <Teleport to="body">
    <div class="add-article" @click.stop="null">
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
                v-model="article.article"
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
              <el-radio-group v-model="article.translateType">
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
              <div class="translate-item" v-if="article.translateType === TranslateType.network">
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
                v-if="article.translateType === TranslateType.custom"
                v-model="article.customTranslate"
                :readonly="![100,0].includes(progress)"
                @blur="onBlur"
                @focus="onFocus"
                type="textarea"
                class="base-textarea"
                placeholder="请填写翻译正文"
            >
            </textarea>
            <textarea
                v-if="article.translateType === TranslateType.network"
                v-model="article.networkTranslate"
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
          <div class="options">
            <BaseButton @click="save">保存</BaseButton>
          </div>
        </div>
      </div>
      <Icon @click="$emit('close')"
            class="close hvr-grow pointer"
            width="20" color="#929596"
            icon="ion:close-outline"/>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@import "@/assets/css/style.scss";

.add-article {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100vw;
  height: 100vh;
  padding: $space;
  box-sizing: border-box;
  color: black;
  background: var(--color-main-bg);

  .close {
    position: absolute;
    right: 20rem;
    top: 20rem;
  }

  .content {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $space;
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
    }
  }
}
</style>