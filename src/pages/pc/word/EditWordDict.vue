<script setup lang="tsx">

import BasePage from "@/pages/pc/components/BasePage.vue";
import {computed, onMounted, reactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {assign, cloneDeep} from "lodash-es";
import {nanoid} from "nanoid";
import BaseIcon from "@/components/BaseIcon.vue";
import BaseTable from "@/pages/pc/components/BaseTable.vue";
import WordItem from "@/pages/pc/components/WordItem.vue";
import type {Word} from "@/types.ts";
import type {FormInstance, FormRules} from "element-plus";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import BackIcon from "@/components/BackIcon.vue";
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
    runtimeStore.editDict.words = v
  }
})

onMounted(() => {
  if (!runtimeStore.editDict.id) {
    router.push("/word")
  }
})

let wordFormData = $ref({
  where: '',
  type: '',
  id: '',
  index: 0
})

enum FormMode {
  None = '',
  Add = 'Add',
  Edit = 'Edit',
}

const DefaultFormWord = {
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
let wordForm = $ref(cloneDeep(DefaultFormWord))
const wordFormRef = $ref<FormInstance>()
const wordRules = reactive<FormRules>({
  name: [
    {required: true, message: '请输入单词', trigger: 'blur'},
    {max: 30, message: '名称不能超过30个字符', trigger: 'blur'},
  ],
})

//TODO trans结构变了，
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
        let r = list.find(v => v.word === wordForm.word)
        // if (r) return ElMessage.warning('已有相同名称单词！')
        // else list.push(data)
        list.push(data)
        ElMessage.success('添加成功')
        wordForm = cloneDeep(DefaultFormWord)
        // setTimeout(wordListRef?.scrollToBottom, 100)
      } else {
        let r = list.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        r = list.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        ElMessage.success('修改成功')
      }
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(id: string) {
  let rIndex2 = list.findIndex(v => v.id === id)
  if (rIndex2 > -1) {
    list.splice(rIndex2, 1)
  }
  // if (wordFormData.type === FormMode.Edit && wordForm.word === val.item.word) {
  //   closeWordForm()
  // }
}

function batchDel(ids: string[]) {
  ids.map(v => delWord(v))
}

function editWord(word: Word) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.map(v => (v.pos + v.cn).replaceAll('"', '')).join('\n')
  wordForm.sentences = word.sentences.map(v => (v.c + "\n" + v.cn).replaceAll('"', '')).join('\n\n')
  wordForm.phrases = word.phrases.map(v => (v.c + "\n" + v.cn).replaceAll('"', '')).join('\n\n')
  wordForm.synos = word.synos.map(v => (v.pos + v.cn + "\n" + v.ws.join('/')).replaceAll('"', '')).join('\n\n')
  wordForm.relWords = word.relWords.rels.map(v => (v.pos + "\n" + v.words.map(v => (v.c + "\n" + v.cn))).replaceAll('"', '')).join('\n\n')
}

function addWord() {
  // setTimeout(wordListRef?.scrollToBottom, 100)
  wordFormData.type = FormMode.Add
  wordForm = cloneDeep(DefaultFormWord)
}

function closeWordForm() {
  wordFormData.type = FormMode.None
  wordForm = cloneDeep(DefaultFormWord)
}

let isEdit = $ref(false)
let isAdd = $ref(false)

const showBookDetail = computed(() => {
  return !(isAdd || isEdit);
})

onMounted(() => {
  if (route.query?.isAdd) {
    isAdd = true
  }
})

function formClose() {
  if (isEdit) isEdit = false
  else router.back()
}

function addMyStudyList() {
  let rIndex = base.word.bookList.findIndex(v => v.name === runtimeStore.editDict.name)
  if (rIndex > -1) {
    base.word.studyIndex = rIndex
  } else {
    base.word.bookList.push(runtimeStore.editDict)
    base.word.studyIndex = base.word.bookList.length - 1
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
                  <div class="absolute text-2xl text-align-center w-full">{runtimeStore.editDict.name}</div>
                  <div class="flex gap-2">
                    <BaseButton type="info" onClick={() => isEdit = true}>编辑</BaseButton>
                    <BaseButton onClick={addMyStudyList}>学习</BaseButton>
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
                    wordFormData.type ? (
                        <div class="flex-1 ml-4 overflow-auto">
                          <div class="common-title">
                            {wordFormData.type === FormMode.Add ? '添加' : '修改'}单词
                          </div>
                          <el-form
                              className="form"
                              ref="wordFormRef"
                              rules={wordRules}
                              model={wordForm}
                              label-width="7rem">
                            <el-form-item label="单词" prop="word">
                              <el-input
                                  modelValue={wordForm.word}
                                  onUpdate:modelValue={e => wordForm.word = e}
                              />
                            </el-form-item>
                            <el-form-item label="音标/发音①">
                              <el-input
                                  modelValue={wordForm.phonetic0}
                                  onUpdate:modelValue={e => wordForm.phonetic0 = e}
                              />
                            </el-form-item>
                            <el-form-item label="音标/发音②">
                              <el-input
                                  modelValue={wordForm.phonetic1}
                                  onUpdate:modelValue={e => wordForm.phonetic1 = e}/>
                            </el-form-item>
                            <el-form-item label="翻译">
                              <el-input
                                  modelValue={wordForm.trans}
                                  onUpdate:modelValue={e => wordForm.trans = e}
                                  placeholder="一行一个翻译，前面词性，后面内容（n.取消）；多个翻译请换行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <el-form-item label="例句">
                              <el-input
                                  modelValue={wordForm.sentences}
                                  onUpdate:modelValue={e => wordForm.sentences = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <el-form-item label="短语">
                              <el-input
                                  modelValue={wordForm.phrases}
                                  onUpdate:modelValue={e => wordForm.phrases = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <el-form-item label="同义词">
                              <el-input
                                  modelValue={wordForm.synos}
                                  onUpdate:modelValue={e => wordForm.synos = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <el-form-item label="同根词">
                              <el-input
                                  modelValue={wordForm.relWords}
                                  onUpdate:modelValue={e => wordForm.relWords = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <el-form-item label="词源">
                              <el-input
                                  modelValue={wordForm.etymology}
                                  onUpdate:modelValue={e => wordForm.etymology = e}
                                  placeholder="一行原文，一行译文；多个请换两行"
                                  autosize={{minRows: 6, maxRows: 10}}
                                  type="textarea"/>
                            </el-form-item>
                            <div class="center">
                              <el-button
                                  onClick={closeWordForm}>关闭
                              </el-button>
                              <el-button type="primary"
                                         onClick={onSubmitWord}>保存
                              </el-button>
                            </div>
                          </el-form>
                        </div>
                    ) : null
                  }
                </div>
              </div> :
              <div class="card mb-0 h-[95vh]">
                <div class="flex justify-between items-center relative">
                  <BackIcon class="z-2" onClick={() => isAdd ? router.back() : (isEdit = false)}/>
                  <div class="absolute text-2xl text-align-center w-full">
                    {runtimeStore.editDict.id ? '修改' : '添加'}词典
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
