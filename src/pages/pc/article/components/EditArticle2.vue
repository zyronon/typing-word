<script setup lang="ts">

import {Article, getDefaultArticle, Sentence, TranslateEngine} from "@/types/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import EditAbleText from "@/pages/pc/components/EditAbleText.vue";
import {Icon} from "@iconify/vue";
import {getNetworkTranslate, getSentenceAllText, getSentenceAllTranslateText} from "@/hooks/translate.ts";
import {genArticleSectionData, splitCNArticle2, splitEnArticle2, usePlaySentenceAudio} from "@/hooks/article.ts";
import {_nextTick, _parseLRC, cloneDeep, last} from "@/utils";
import {watch} from "vue";
import Empty from "@/components/Empty.vue";
import {ElInputNumber, ElMessage, ElOption, ElPopover, ElSelect, ElUpload, UploadProps} from "element-plus";
import * as Comparison from "string-comparison"
import BaseIcon from "@/components/BaseIcon.vue";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";

interface IProps {
  article?: Article,
  type?: 'single' | 'batch'
}

const props = withDefaults(defineProps<IProps>(), {
  article: () => getDefaultArticle(),
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

let editArticle = $ref<Article>(getDefaultArticle())

watch(() => props.article, val => {
  editArticle = cloneDeep(val)
  progress = 0
  failCount = 0
  apply(false)
}, {immediate: true})

watch(() => editArticle.text, (s) => {
  if (!s.trim()) {
    editArticle.sections = []
  }
})

function apply(isHandle: boolean = true) {
  let text = editArticle.text.trim()
  if (!text && isHandle) {
    // text = "Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily. They did not pay any attention. In the end, I could not bear it. I turned round again. 'I can't hear a word!' I said angrily.\n\n    'It's none of your business,' the young man said rudely. 'This is a private conversation!'"
    // text = `While it is yet to be seen what direction the second Trump administration will take globally in its China policy, VOA traveled to the main island of Mahe in Seychelles to look at how China and the U.S. have impacted the country, and how each is fairing in that competition for influence there.`
    // text = "It was Sunday. I never get up early on Sundays. I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again.' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train,' she said. 'I'm coming to see you.'\n\n     'But I'm still having breakfast,' I said.\n\n     'What are you doing?' she asked.\n\n     'I'm having breakfast,' I repeated.\n\n     'Dear me,' she said. 'Do you always get up so late? It's one o'clock!'"
    editArticle.sections = []
    ElMessage.error('请填写原文！')
    return
  }
  failCount = genArticleSectionData(editArticle)
}

//分句原文
function splitText() {
  editArticle.text = splitEnArticle2(editArticle.text.trim())
  return
  let text = editArticle.text.trim();
  if (text) {
    editArticle.text = splitEnArticle2(text)
  }
}

//分句翻译
function splitTranslateText() {
  editArticle.textTranslate = splitCNArticle2(editArticle.textTranslate.trim())
  return
  let text = editArticle.textTranslate.trim();
  if (text) {
    editArticle.textTranslate = splitCNArticle2(text)
  }
}

//TODO
async function startNetworkTranslate() {
  if (!editArticle.title.trim()) {
    return ElMessage.error('请填写标题！')
  }
  if (!editArticle.text.trim()) {
    return ElMessage.error('请填写正文！')
  }
  apply()
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
  editArticle.textTranslate = getSentenceAllTranslateText(editArticle)
  apply()
}

function saveSentenceText(sentence: Sentence, val: string) {
  sentence.text = val
  editArticle.text = getSentenceAllText(editArticle)
  apply()
}

function save(option: 'save' | 'saveAndNext') {
  // return console.log(cloneDeep(editArticle))
  return new Promise((resolve: Function) => {
    // console.log('article', article)
    // copy(JSON.stringify(article))

    editArticle.title = editArticle.title.trim()
    editArticle.titleTranslate = editArticle.titleTranslate.trim()
    editArticle.text = editArticle.text.trim()
    editArticle.textTranslate = editArticle.textTranslate.trim()

    if (!editArticle.title) {
      ElMessage.error('请填写标题！')
      return resolve(false)
    }
    if (!editArticle.text) {
      ElMessage.error('请填写正文！')
      return resolve(false)
    }

    const saveTemp = () => {
      emit(option as any, editArticle)
      return resolve(true)
    }

    saveTemp()
  })
}

//不知道为什么直接用editArticle，取到是空的默认值
defineExpose({save, getEditArticle: () => cloneDeep(editArticle)})

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile)
  let reader = new FileReader();
  reader.readAsText(uploadFile.raw, 'UTF-8');
  reader.onload = function (e) {
    let lrc: string = e.target.result as string;
    console.log(lrc)
    if (lrc.trim()) {
      let lrcList = _parseLRC(lrc)
      console.log('lrcList', lrcList)
      if (lrcList.length) {
        editArticle.lrcPosition = editArticle.sections.map((v, i) => {
          return v.map((w, j) => {
            for (let k = 0; k < lrcList.length; k++) {
              let s = lrcList[k]
              let d = Comparison.default.cosine.similarity(w.text, s.text)
              d = Comparison.default.levenshtein.similarity(w.text, s.text)
              d = Comparison.default.longestCommonSubsequence.similarity(w.text, s.text)
              // d = Comparison.default.metricLcs.similarity(w.text, s.text)
              // console.log(w.text, s.text, d)
              if (d >= 0.8) {
                w.audioPosition = [s.start, s.end ?? -1]
                break
              }
            }
            return w.audioPosition ?? []
          })
        }).flat()
      }
    }
  }
}

let currentSentence = $ref<Sentence>({} as any)
let editSentence = $ref<Sentence>({} as any)
let preSentence = $ref<Sentence>({} as any)
let showEditAudioDialog = $ref(false)
let sentenceAudioRef = $ref<HTMLAudioElement>()
let audioRef = $ref<HTMLAudioElement>()

function handleShowEditAudioDialog(val: Sentence, i: number, j: number) {
  showEditAudioDialog = true
  currentSentence = val
  editSentence = cloneDeep(val)
  preSentence = null
  audioRef.pause()
  if (j == 0) {
    if (i != 0) {
      preSentence = last(editArticle.sections[i - 1])
    }
  } else {
    preSentence = editArticle.sections[i][j - 1]
  }
  if (!editSentence.audioPosition?.length) {
    editSentence.audioPosition = [0, 0]
    if (preSentence) {
      editSentence.audioPosition = [preSentence.audioPosition[1] ?? 0, 0]
    }
  }
  _nextTick(() => {
    sentenceAudioRef.currentTime = editSentence.audioPosition[0]
  })
}

function recordStart() {
  if (sentenceAudioRef.paused) {
    sentenceAudioRef.play()
  }
  editSentence.audioPosition[0] = Number(sentenceAudioRef.currentTime.toFixed(2))
}

function recordEnd() {
  if (!sentenceAudioRef.paused) {
    sentenceAudioRef.pause()
  }
  editSentence.audioPosition[1] = Number(sentenceAudioRef.currentTime.toFixed(2))
}

const {playSentenceAudio} = usePlaySentenceAudio()

function saveLrcPosition() {
  // showEditAudioDialog = false
  currentSentence.audioPosition = cloneDeep(editSentence.audioPosition)
  editArticle.lrcPosition = editArticle.sections.map((v, i) => v.map((w, j) => (w.audioPosition ?? []))).flat()
}

function jumpAudio(time: number) {
  sentenceAudioRef.currentTime = time
}

function setPreEndTimeToCurrentStartTime() {
  if (preSentence) {
    editSentence.audioPosition[0] = preSentence.audioPosition[1]
  }
}

function setStartTime(val: Sentence, i: number, j: number) {
  let preSentence = null
  if (j == 0) {
    if (i != 0) {
      preSentence = last(editArticle.sections[i - 1])
    }
  } else {
    preSentence = editArticle.sections[i][j - 1]
  }
  if (preSentence) {
    val.audioPosition[0] = preSentence.audioPosition[1]
  } else {
    val.audioPosition[0] = Number(Number(audioRef.currentTime).toFixed(2))
  }
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
      <div class="justify-end items-center flex">
        <ElPopover
            class="box-item"
            title="使用方法"
            placement="top"
            :width="400"
        >
          <ol class="py-0 pl-5 my-0 text-base color-main">
            <li>复制原文，然后分句</li>
            <li>点击 <span class="color-red font-bold">分句</span> 按钮进行自动分句<span
                class="color-red font-bold"> 或</span> 手动编辑分句
            </li>
            <li>分句规则：一行一句，段落间空一行</li>
            <li>修改完成后点击 <span class="color-red font-bold">应用</span> 按钮同步到左侧结果栏
            </li>
          </ol>
          <template #reference>
            <Icon icon="ri:question-line" class="mr-3" width="20"/>
          </template>
        </ElPopover>
        <BaseButton @click="splitText">分句</BaseButton>
        <BaseButton @click="apply()">应用</BaseButton>
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
          v-model="editArticle.textTranslate"
          :readonly="![100,0].includes(progress)"
          type="textarea"
          class="base-textarea"
          placeholder="请填写翻译"
          ref="textareaRef"
      >
            </textarea>
      <div class="justify-between items-center flex">
        <div class="flex gap-space items-center w-50 ">
          <BaseButton @click="startNetworkTranslate"
                      :loading="progress!==0 && progress !== 100">翻译
          </BaseButton>
          <ElSelect v-model="networkTranslateEngine"
          >
            <ElOption
                v-for="item in TranslateEngineOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </ElSelect>
          {{ progress }}%
        </div>
        <div class="flex items-center">
          <ElPopover
              class="box-item"
              title="使用方法"
              placement="top"
              :width="400"
          >
            <ol class="py-0 pl-5 my-0 text-base color-black/60">
              <li>复制译文，如果没有请点击 <span class="color-red font-bold">翻译</span> 按钮</li>
              <li>点击 <span class="color-red font-bold">分句</span> 按钮进行自动分句<span class="color-red font-bold"> 或</span>
                手动编辑分句
              </li>
              <li>分句规则：一行一句，段落间空一行</li>
              <li>修改完成后点击 <span class="color-red font-bold">应用</span> 按钮同步到左侧结果栏
              </li>
            </ol>
            <template #reference>
              <Icon icon="ri:question-line" class="mr-3" width="20"/>
            </template>
          </ElPopover>
          <BaseButton @click="splitTranslateText">分句</BaseButton>
          <BaseButton @click="apply(true)">应用</BaseButton>
        </div>
      </div>
    </div>
    <div class="row flex flex-col gap-2">
      <div class="title">结果</div>
      <div class="center">正文、译文与结果均可编辑，编辑后点击应用按钮会自动同步</div>
      <div class="flex gap-2">
        <BaseButton>添加音频</BaseButton>
        <ElUpload
            class="upload-demo"
            :limit="1"
            :on-change="handleChange"
            :auto-upload="false"
        >
          <BaseButton>添加音频LRC文件</BaseButton>
        </ElUpload>
        <audio ref="audioRef" :src="editArticle.audioSrc" controls></audio>
      </div>
      <template v-if="editArticle.sections.length">
        <div class="flex-1 overflow-auto flex flex-col">
          <div class="flex justify-between bg-black/10 py-2">
            <div class="center flex-[7]">内容</div>
            <div>|</div>
            <div class="center flex-[3]">音频</div>
          </div>
          <div class="article-translate">
            <div class="section " v-for="(item,indexI) in editArticle.sections">
              <div class="section-title">第{{ indexI + 1 }}段</div>
              <div class="sentence" v-for="(sentence,indexJ) in item">
                <div class="flex-[7]">
                  <EditAbleText
                      :value="sentence.text"
                      @save="(e:string) => saveSentenceText(sentence,e)"
                  />
                  <EditAbleText
                      class="text-lg!"
                      v-if="sentence.translate"
                      :value="sentence.translate"
                      @save="(e:string) => saveSentenceTranslate(sentence,e)"
                  />
                </div>
                <div class="flex-[2] flex justify-end gap-1 items-center">
                  <div class="flex justify-end gap-2">
                    <div class="flex flex-col items-center justify-center">
                      <div>{{ sentence.audioPosition?.[0] ?? 0 }}s</div>
                      <BaseIcon
                          @click="setStartTime(sentence,indexI,indexJ)"
                          :icon="indexI === 0 && indexJ === 0 ?'ic:sharp-my-location':'twemoji:end-arrow'"
                          :title="indexI === 0 && indexJ === 0 ?'设置开始时间':'使用前一句的结束时间'"
                      />
                    </div>
                    <div>-</div>
                    <div class="flex flex-col items-center justify-center">
                      <div v-if="sentence.audioPosition?.[1] !== -1">{{ sentence.audioPosition?.[1] ?? 0 }}s</div>
                      <div v-else> 结束</div>
                      <BaseIcon
                          @click="sentence.audioPosition[1] = Number(Number(audioRef.currentTime).toFixed(2))"
                          title="设置结束时间"
                          icon="ic:sharp-my-location"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <BaseIcon :icon="sentence.audioPosition?.length ? 'basil:edit-outline' : 'basil:add-outline'"
                              @click="handleShowEditAudioDialog(sentence,indexI,indexJ)"/>
                    <BaseIcon v-if="sentence.audioPosition?.length" icon="hugeicons:play"
                              @click="playSentenceAudio(sentence,audioRef,editArticle)"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="options" v-if="editArticle.text.trim()">
          <div class="status">
            <span>状态：</span>
            <div class="warning" v-if="failCount">
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
    <Dialog title="设置音频与句子的对应位置(LRC)"
            v-model="showEditAudioDialog"
            :footer="true"
            @close="showEditAudioDialog = false"
            @ok="saveLrcPosition"
    >
      <div class="p-4 pt-0 color-main w-150 flex flex-col gap-2">
        <div class="">
          教程：点击音频播放按钮，当播放到句子开始时，点击开始时间的 <span class="color-red">记录</span>
          按钮；当播放到句子结束时，点击结束时间的 <span class="color-red">记录</span> 按钮，最后再试听是否正确
        </div>
        <audio ref="sentenceAudioRef" :src="editArticle.audioSrc" controls class="w-full"></audio>
        <div class="flex items-center gap-2 space-between mb-2" v-if="editSentence.audioPosition?.length">
          <div>{{ editSentence.text }}</div>
          <div class="flex items-center gap-2 shrink-0">
            <div>
              <span>{{ editSentence.audioPosition?.[0] }}s</span>
              <span v-if="editSentence.audioPosition?.[1] !== -1"> - {{ editSentence.audioPosition?.[1] }}s</span>
              <span v-else> - 结束</span>
            </div>
            <BaseIcon icon="hugeicons:play"
                      title="试听"
                      @click="playSentenceAudio(editSentence,sentenceAudioRef,editArticle)"/>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex gap-2 items-center">
            <div>开始时间：</div>
            <div class="flex justify-between flex-1">
              <div class="flex items-center gap-2">
                <ElInputNumber v-model="editSentence.audioPosition[0]" :precision="2" :step="0.1">
                  <template #suffix>
                    <span>s</span>
                  </template>
                </ElInputNumber>
                <BaseIcon
                    @click="jumpAudio(editSentence.audioPosition[0])"
                    title="跳转"
                    icon="ic:sharp-my-location"
                />
                <BaseIcon
                    @click="setPreEndTimeToCurrentStartTime"
                    title="使用前一句的结束时间"
                    icon="twemoji:end-arrow"
                />
              </div>
              <BaseButton @click="recordStart">记录</BaseButton>
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <div>结束时间：</div>
            <div class="flex justify-between flex-1">
              <div class="flex items-center gap-2">
                <ElInputNumber v-model="editSentence.audioPosition[1]" :precision="2" :step="0.1">
                  <template #suffix>
                    <span>s</span>
                  </template>
                </ElInputNumber>
                <span>或</span>
                <BaseButton size="small" @click="editSentence.audioPosition[1] = -1">结束</BaseButton>
              </div>
              <BaseButton @click="recordEnd">记录</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.content {
  color: var(--color-article);
  height: 100%;
  width: 100%;
  box-sizing: border-box;
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

  &:nth-child(3) {
    flex: 10;
  }

  .title {
    font-weight: bold;
    font-size: 1.4rem;
    text-align: center;
  }

  .article-translate {
    flex: 1;
    overflow-y: overlay;

    .section {
      background: var(--color-textarea-bg);
      margin-bottom: 1.2rem;

      .section-title {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-item-border);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .sentence {
        display: flex;
        padding: 0.5rem 1.5rem;
        line-height: 1.2;
        border-bottom: 1px solid var(--color-item-border);

        &:last-child {
          border-bottom: none;
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
