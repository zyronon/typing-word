<script setup lang="tsx">
import type {Word} from "@/types";
import {DictId, getDefaultDict} from "@/types";

import BasePage from "@/pages/pc/components/BasePage.vue";
import {computed, onMounted, reactive, shallowReactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {_getDictDataByUrl, _nextTick, cloneDeep, convertToWord} from "@/utils";
import {nanoid} from "nanoid";
import BaseIcon from "@/components/BaseIcon.vue";
import BaseTable from "@/pages/pc/components/BaseTable.vue";
import WordItem from "@/pages/pc/components/WordItem.vue";
import type {FormInstance, FormRules} from "element-plus";
import {ElForm, ElFormItem, ElInput, ElMessage} from "element-plus";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import BackIcon from "@/pages/pc/components/BackIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {useRoute, useRouter} from "vue-router";
import {useBaseStore} from "@/stores/base.ts";
import EditBook from "@/pages/pc/article/components/EditBook.vue";

const runtimeStore = useRuntimeStore()
const base = useBaseStore()
const router = useRouter()
const route = useRoute()

let loading = $ref(false)

let list = $computed({
  get() {
    return runtimeStore.editDict.words
  },
  set(v) {
    runtimeStore.editDict.words = shallowReactive(v)
  }
})

const getDefaultFormWord = () => {
  return {
    id: '',
    word: '',
    phonetic0: '',
    phonetic1: '',
    trans: '',
    sentences: '',
    phrases: '',
    synos: '',
    relWords: '',
    etymology: '',
  }
}
let isOperate = $ref(false)
let wordForm = $ref(getDefaultFormWord())
let wordFormRef = $ref<FormInstance>()
const wordRules = reactive<FormRules>({
  word: [
    {required: true, message: '请输入单词', trigger: 'blur'},
    {max: 30, message: '名称不能超过30个字符', trigger: 'blur'},
  ],
})
let studyLoading = $ref(false)

function syncDictInMyStudyList(study = false) {
  _nextTick(() => {
    let rIndex = base.word.bookList.findIndex(v => v.id === runtimeStore.editDict.id)
    let temp = cloneDeep(runtimeStore.editDict);
    console.log(temp)
    if (!temp.custom) {
      temp.custom = true
      temp.id += '_custom'
    }
    temp.length = temp.words.length
    if (rIndex > -1) {
      base.word.bookList[rIndex] = temp
      if (study) base.word.studyIndex = rIndex
    } else {
      base.word.bookList.push(temp)
      if (study) base.word.studyIndex = base.word.bookList.length - 1
    }
  }, 100)
}

async function onSubmitWord() {
  await wordFormRef.validate((valid) => {
    if (valid) {
      let data: any = convertToWord(wordForm)
      //todo 可以检查的更准确些，比如json对比
      if (data.id) {
        let r = list.find(v => v.id === data.id)
        if (r) {
          Object.assign(r, data)
          ElMessage.success('修改成功')
        } else {
          ElMessage.success('修改失败，未找到单词')
          return
        }
      } else {
        data.id = nanoid(6)
        data.checked = false
        let r = list.find(v => v.word === wordForm.word)
        if (r) {
          ElMessage.warning('已有相同名称单词！')
          return
        } else list.push(data)
        ElMessage.success('添加成功')
        wordForm = getDefaultFormWord()
      }
      syncDictInMyStudyList()
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(id: string, isBatch = false) {
  let rIndex2 = list.findIndex(v => v.id === id)
  if (rIndex2 > -1) {
    if (id === wordForm.id) {
      wordForm = getDefaultFormWord()
    }
    list.splice(rIndex2, 1)
  }
  if (!isBatch) syncDictInMyStudyList()
}

function batchDel(ids: string[]) {
  ids.map(v => delWord(v, true))
  syncDictInMyStudyList()
}

function editWord(word: Word) {
  isOperate = true
  wordForm.id = word.id
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.map(v => (v.pos + v.cn).replaceAll('"', '')).join('\n')
  wordForm.sentences = word.sentences.map(v => (v.c + "\n" + v.cn).replaceAll('"', '')).join('\n\n')
  wordForm.phrases = word.phrases.map(v => (v.c + "\n" + v.cn).replaceAll('"', '')).join('\n\n')
  wordForm.synos = word.synos.map(v => (v.pos + v.cn + "\n" + v.ws.join('/')).replaceAll('"', '')).join('\n\n')
  wordForm.relWords = '词根:' + word.relWords.root + '\n\n' +
      word.relWords.rels.map(v => (v.pos + "\n" + v.words.map(v => (v.c + ':' + v.cn)).join('\n')).replaceAll('"', '')).join('\n\n')
  wordForm.etymology = word.etymology.map(v => (v.t + '\n' + v.d).replaceAll('"', '')).join('\n\n')
}

function addWord() {
  // setTimeout(wordListRef?.scrollToBottom, 100)
  isOperate = true
  wordForm = getDefaultFormWord()
}

function closeWordForm() {
  isOperate = false
  wordForm = getDefaultFormWord()
}

let isEdit = $ref(false)
let isAdd = $ref(false)

const showBookDetail = computed(() => {
  return !(isAdd || isEdit);
})

onMounted(() => {
  if (route.query?.isAdd) {
    isAdd = true
    runtimeStore.editDict = getDefaultDict()
  } else {
    if (!runtimeStore.editDict.id) {
      router.push("/word")
    } else {
      if (!runtimeStore.editDict.words.length
          && !runtimeStore.editDict.custom
          && ![DictId.wordCollect, DictId.wordWrong, DictId.wordKnown].includes(runtimeStore.editDict.id)
      ) {
        loading = true
        _getDictDataByUrl(runtimeStore.editDict).then(r => {
          loading = false
          runtimeStore.editDict = r
        })
      }
    }
  }
})

function formClose() {
  if (isEdit) isEdit = false
  else router.back()
}

async function addMyStudyList() {
  studyLoading = true
  await base.changeDict(runtimeStore.editDict)
  studyLoading = false
  if (route.query?.from) {
    router.back()
  }
  router.back()
}

defineRender(() => {
  return (
      <BasePage>
        {
          showBookDetail.value ? <div className="card mb-0 h-[95vh] flex flex-col">
                <div class="flex justify-between items-center relative">
                  <BackIcon class="z-2" onClick={() => router.back()}/>
                  <div class="absolute page-title text-align-center w-full">{runtimeStore.editDict.name}</div>
                  <div class="flex gap-2">
                    <BaseButton type="info" onClick={() => isEdit = true}>编辑</BaseButton>
                    <BaseButton loading={studyLoading} onClick={addMyStudyList}>学习</BaseButton>
                  </div>
                </div>
                <div class="text-lg  ">介绍：{runtimeStore.editDict.description}</div>
                <div class="line my-3"></div>

                <div class="flex flex-1 overflow-hidden">
                  <div class="w-4/10">
                    <BaseTable
                        class="h-full"
                        list={list}
                        loading={loading}
                        onUpdate:list={e => list = e}
                        del={delWord}
                        batchDel={batchDel}
                        add={addWord}
                    >
                      {
                        (val) =>
                            <WordItem
                                showTransPop={false}
                                item={val.item}>
                              {{
                                prefix: () => val.checkbox(val.item),
                                suffix: () => (
                                    <div class='flex flex-col'>
                                      <BaseIcon
                                          class="option-icon"
                                          onClick={() => editWord(val.item)}
                                          title="编辑"
                                          icon="tabler:edit"/>
                                      <PopConfirm title="确认删除？"
                                                  onConfirm={() => delWord(val.item.id)}
                                      >
                                        <BaseIcon
                                            class="option-icon"
                                            title="删除"
                                            icon="solar:trash-bin-minimalistic-linear"/>
                                      </PopConfirm>

                                    </div>
                                )
                              }}
                            </WordItem>
                      }
                    </BaseTable>
                  </div>
                  {
                    isOperate ? (
                        <div class="flex-1 flex flex-col ml-4">
                          <div class="common-title">
                            {wordForm.id ? '修改' : '添加'}单词
                          </div>
                          <ElForm
                              class="flex-1 overflow-auto pr-2"
                              ref={e => wordFormRef = e}
                              rules={wordRules}
                              model={wordForm}
                              label-width="7rem">
                            <ElFormItem label="单词" prop="word">
                              <ElInput
                                  modelValue={wordForm.word}
                                  onUpdate:modelValue={e => wordForm.word = e}
                              />
                            </ElFormItem>
                            <ElFormItem label="英音音标">
                              <ElInput
                                  modelValue={wordForm.phonetic0}
                                  onUpdate:modelValue={e => wordForm.phonetic0 = e}
                              />
                            </ElFormItem>
                            <ElFormItem label="美音音标">
                              <ElInput
                                  modelValue={wordForm.phonetic1}
                                  onUpdate:modelValue={e => wordForm.phonetic1 = e}/>
                            </ElFormItem>
                            <ElFormItem label="翻译">
                              <ElInput
                                  modelValue={wordForm.trans}
                                  onUpdate:modelValue={e => wordForm.trans = e}
                                  placeholder="一行一个翻译，前面词性，后面内容（如n.取消）；多个翻译请换行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </ElFormItem>
                            <ElFormItem label="例句">
                              <ElInput
                                  modelValue={wordForm.sentences}
                                  onUpdate:modelValue={e => wordForm.sentences = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </ElFormItem>
                            <ElFormItem label="短语">
                              <ElInput
                                  modelValue={wordForm.phrases}
                                  onUpdate:modelValue={e => wordForm.phrases = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </ElFormItem>
                            <ElFormItem label="同义词">
                              <ElInput
                                  modelValue={wordForm.synos}
                                  onUpdate:modelValue={e => wordForm.synos = e}
                                  placeholder="请参考已有单词格式"
                                  autosize={{minRows: 6, maxRows: 20}}
                                  type="textarea"/>
                            </ElFormItem>
                            <ElFormItem label="同根词">
                              <ElInput
                                  modelValue={wordForm.relWords}
                                  onUpdate:modelValue={e => wordForm.relWords = e}
                                  placeholder="请参考已有单词格式"
                                  autosize={{minRows: 6, maxRows: 20}}
                                  type="textarea"/>
                            </ElFormItem>
                            <ElFormItem label="词源">
                              <ElInput
                                  modelValue={wordForm.etymology}
                                  onUpdate:modelValue={e => wordForm.etymology = e}
                                  placeholder="请参考已有单词格式"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </ElFormItem>
                          </ElForm>
                          <div class="center">
                            <BaseButton
                                type="info"
                                onClick={closeWordForm}>关闭
                            </BaseButton>
                            <BaseButton type="primary"
                                        onClick={onSubmitWord}>保存
                            </BaseButton>
                          </div>
                        </div>
                    ) : null
                  }
                </div>
              </div> :
              <div class="card mb-0 h-[95vh]">
                <div class="flex justify-between items-center relative">
                  <BackIcon class="z-2" onClick={() => isAdd ? router.back() : (isEdit = false)}/>
                  <div class="absolute page-title text-align-center w-full">
                    {runtimeStore.editDict.id ? '修改' : '创建'}词典
                  </div>
                </div>
                <div class="center">
                  <EditBook
                      isAdd={isAdd}
                      isBook={false}
                      onClose={formClose}
                      onSubmit={() => isEdit = isAdd = false}
                  />
                </div>
              </div>
        }
      </BasePage>
  )
})
</script>

<style scoped lang="scss">

</style>
