<script setup lang="ts">

import {Article, DefaultArticle, Sentence, TranslateEngine, TranslateType} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import EditAbleText from "@/pages/pc/components/EditAbleText.vue";
import {Icon} from "@iconify/vue";
import {
  getNetworkTranslate,
  getSentenceAllText,
  getSentenceAllTranslateText,
  renewSectionTexts,
  renewSectionTranslates
} from "@/hooks/translate.ts";

import {MessageBox} from "@/utils/MessageBox.tsx";
import {getSplitTranslateText} from "@/hooks/article.ts";
import {cloneDeep} from "lodash-es";
import {watch, ref} from "vue";
import Empty from "@/components/Empty.vue";
import {UploadProps, UploadUserFile} from "element-plus";
import {_copy, _parseLRC} from "@/utils";
import * as Comparison from "string-comparison"
import audio from '/public/sound/article/nce2-1/1.mp3'
import BaseIcon from "@/components/BaseIcon.vue";

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

watch(() => editArticle.text, (s) => {
  if (!s.trim()) {
    editArticle.sections = []
  }
})

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
  //注意！！！
  //这里需要用异步，因为watch了article.networkTranslate，改变networkTranslate了之后，会重新设置article.sections
  //导致getNetworkTranslate里面拿到的article.sections是废弃的值
  setTimeout(async () => {
    await getNetworkTranslate(editArticle, TranslateEngine.Baidu, true, (v: number) => {
      progress = v
    })
    failCount = 0
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

const fileList = ref<UploadUserFile[]>([])

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
      `The limit is 3, you selected ${files.length} files this time, add up to ${
          files.length + uploadFiles.length
      } totally`
  )
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  console.log(1)
  fileList.value.push({
    name: uploadFile.name,
    url: uploadFile.url,
  })
}

function test() {
  let lrc = `[00:00.00]Lesson 1 A Private Conversation
[00:04.35]First listen and then answer the question.
[00:09.26]Why did the writer complain to the people behind him?
[00:14.60]Last week I went to the theatre.
[00:19.15]I had a very good seat.
[00:22.03]The play was very interesting.
[00:24.59]I did not enjoy it.
[00:27.26]A young man and a young woman were sitting behind me.
[00:31.65]They were talking loudly.
[00:34.43]I got very angry.
[00:36.98]I could not hear the actors.
[00:40.36]I turned round.I looked at the man and the woman angrily.
[00:46.59]They did not pay any attention.
[00:50.65]In the end,I could not bear it.
[00:54.57]I turned round again 'I can't hear a word!'I said angrily
[01:02.98]'It's none of your business,'the young man said rudely.
[01:08.85]'This is a private conversation!'
`
  let lrcList = _parseLRC(lrc)
  console.log(lrcList)
  editArticle.sections.map((v, i) => {
    v.map((w, j) => {
      console.log(w)
      for (let k = 0; k < lrcList.length; k++) {
        let s = lrcList[k]
        let d = Comparison.default.cosine.similarity(w.text, s.text)
        d = Comparison.default.levenshtein.similarity(w.text, s.text)
        d = Comparison.default.longestCommonSubsequence.similarity(w.text, s.text)
        // d = Comparison.default.metricLcs.similarity(w.text, s.text)
        console.log(w.text, s.text, d)
        if (d >= 0.8) {
          w.audioPosition = [s.start, s.end ?? -1]
          w.test = s.text
          break
        }
      }
    })
  })
  console.log(editArticle.sections.flat())
  // console.log(cosine.similarity('Thanos', 'Rival'))
}

const a = new Audio(audio)

function play(sentence: Sentence) {
  if (sentence.audioPosition?.length) {
    let start = sentence.audioPosition[0];
    a.currentTime = start
    a.play()
    let end = sentence.audioPosition?.[1]
    if (end && end !== -1) {
      setTimeout(() => {
        a.pause()
      }, (end - start) * 1000)
    }
  }
}

function s() {

}

</script>

<template>
  <div class="content">
    <div class="row flex flex-col gap-2">
      <div class="title">原文</div>
      <div class="">标题：</div>
      <input
          v-model="editArticle.title"
          type="text"
          class="base-input"
          placeholder="请填写原文标题"
      />
      <div class="">正文：</div>
      <textarea
          v-model="editArticle.text"
          :readonly="![100,0].includes(progress)"
          type="textarea"
          class="base-textarea"
          placeholder="请复制原文"
      >
            </textarea>
      <div class="justify-between items-center gap-2 flex">
        <div class="text-base mb-1 color-white/60">请复制原文，然后进行分句，一行一句，段落间空一行。修改完成后，点击 <span class="color-red font-bold">应用按钮</span> 同步到左侧结果
        </div>
        <el-button type="primary" @click="renewSections">应用</el-button>
      </div>
    </div>
    <div class="row flex flex-col gap-2">
      <div class="title">译文</div>
      <div class="flex gap-2">
        标题
      </div>
      <input
          v-model="editArticle.titleTranslate"
          type="text"
          class="base-input"
          placeholder="请填写翻译标题"
      />

      <div class="flex">
        <span>正文：</span>
      </div>
      <textarea
          v-model="editArticle.textCustomTranslate"
          :readonly="![100,0].includes(progress)"
          @blur="onBlur"
          @focus="onFocus"
          type="textarea"
          class="base-textarea"
          placeholder="请填写翻译"
          ref="textareaRef"
      >
            </textarea>
      <div class="justify-between items-center gap-2 flex">
        <div class="text-base mb-1 color-white/60">
          请复制译文，如果没有可点击“网络翻译”按钮进行翻译，然后进行分句，一行一句，段落间空一行。修改完成后，点击 <span class="color-red font-bold">应用按钮</span> 同步到左侧结果
        </div>
        <div class="flex flex-col gap-2">
          <div class="translate-item">
            <el-progress :percentage="progress"
                         :duration="30"
                         :striped="progress !== 100"
                         :striped-flow="progress !== 100"
                         :stroke-width="8"
                         :show-text="true"/>
            <el-select v-model="networkTranslateEngine"
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
            >网络翻译
            </BaseButton>
          </div>
          <div class="flex justify-end">
            <el-button type="primary" @click="renewSections">应用</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="title">结果</div>
      <div class="center">正文、译文与结果均可编辑，修改一处，另外两处会自动同步变动</div>
      <div class="flex gap-2">
        <BaseButton>导入音频</BaseButton>
        <BaseButton @click="test">导入音频LRC</BaseButton>
        <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            :limit="1"
            :on-change="handleChange"
        >
          <el-button type="primary">Click to upload</el-button>
          <template #tip>
            <div class="el-upload__tip">
              jpg/png files with a size less than 500KB.
            </div>
          </template>
        </el-upload>
        <audio :src="audio" controls></audio>
      </div>
      <template v-if="editArticle.sections.length">
        <div class="article-translate">
          <div class="section" v-for="(item,indexI) in editArticle.sections">
            <div class="sentence flex justify-between" v-for="(sentence,indexJ) in item">
              <div>
                <EditAbleText
                    :value="sentence.text"
                    @save="(e:string) => saveSentenceText(sentence,e)"
                />
                <EditAbleText
                    v-if="sentence.translate"
                    :value="sentence.translate"
                    @save="(e:string) => saveSentenceTranslate(sentence,e)"
                />
              </div>
              <div class="flex items-center gap-2">
                <div class="text-base"> {{ sentence.audioPosition?.[0] }} - {{ sentence.audioPosition?.[1] }}</div>
                <div>
                  <BaseIcon icon="hugeicons:play" @click="play(sentence)"/>
                </div>
              </div>
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
@import "@/assets/css/style";

.content {
  color: var(--color-article);
  flex: 1;
  display: flex;
  gap: var(--space);
  padding: var(--space);
  padding-top: .6rem;
}

.row {
  flex: 7;
  width: 33%;
  //height: 100%;
  display: flex;
  flex-direction: column;
  //opacity: 0;

  .basic {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  &:nth-child(3) {
    flex: 10;
  }

  .title {
    font-weight: bold;
    font-size: 1.4rem;
    text-align: center;
  }

  .item {
    width: 100%;
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
    margin-top: .6rem;
    margin-bottom: 1.2rem;
    flex: 1;
    overflow: auto;
    border-radius: .5rem;

    .section {
      background: var(--color-textarea-bg);
      margin-bottom: 1.2rem;
      padding: var(--space);
      border-radius: .5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .sentence {
        margin-bottom: 0.5rem;
        line-height: 1.2;

        &:last-child {
          margin-bottom: 0;
        }

        .text {
          font-size: 1.1rem;
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
      font-size: 1.2rem;
      color: red;
    }

    .success {
      display: flex;
      align-items: center;
      font-size: 1.2rem;
      color: #67C23A;
    }

    .left {
      gap: var(--space);
      display: flex;
    }
  }
}
</style>