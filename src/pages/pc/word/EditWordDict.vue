<script setup lang="tsx">

import BasePage from "@/pages/pc/components/BasePage.vue";
import {onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {assign, cloneDeep} from "lodash-es";
import {nanoid} from "nanoid";
import BaseIcon from "@/components/BaseIcon.vue";
import {_checkDictWords, useNav} from "@/utils";
import BaseTable from "@/pages/pc/components/BaseTable.vue";
import WordItem from "@/pages/pc/components/WordItem.vue";
import type {Word} from "@/types.ts";
import type {FormInstance, FormRules} from "element-plus";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";

const runtimeStore = useRuntimeStore()
const store = useBaseStore()
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

onMounted(async () => {
  switch (Number(route.query.type)) {
    case -1:
      if (runtimeStore.routeData) {
        loading = true
        runtimeStore.editDict = cloneDeep(runtimeStore.routeData)
        await _checkDictWords(runtimeStore.editDict)
        setTimeout(() => {
          loading = false
        }, 300)
      }
      break
    case 0:
      runtimeStore.editDict = cloneDeep(store.collectWord)
      break
    case 1:
      runtimeStore.editDict = cloneDeep(store.wrong)
      break
    case 2:
      runtimeStore.editDict = cloneDeep(store.simple)
      break
    case 3:
      runtimeStore.editDict = cloneDeep(store.master)
      break
    default:
      break
  }
})
const {back} = useNav()

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

function editWord(word: Word,) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.map(v => JSON.stringify(v)).join('\n')
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

function s(ss) {
  console.log('s', ss)
}

defineRender(() => {
  return (
      <BasePage>
        <header class="flex gap-4 mb-2 items-center">
          <BaseIcon onClick={back} icon="octicon:arrow-left-24" width={20}/>
          <div class="left">
            <div class="top">
              <div class="text-xl">
                {runtimeStore.editDict.name}
              </div>
            </div>
            {
              runtimeStore.editDict.description ?
                  <div class="desc">{runtimeStore.editDict.description}</div> : null
            }
          </div>
        </header>
        <div class="flex" style="height:calc(100vh - 8rem)">
          <div class="w-1/2">
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
                <div class="flex-1 ml-4">
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
                          onUpdate:model-value={e => wordForm.word = e}
                      />
                    </el-form-item>
                    <el-form-item label="翻译">
                      <el-input
                          modelValue={wordForm.trans}
                          onUpdate:model-value={e => wordForm.trans = e}
                          placeholder="多个翻译请换行"
                          autosize={{minRows: 6, maxRows: 10}}
                          type="textarea"/>
                    </el-form-item>
                    <el-form-item label="音标/发音①">
                      <el-input
                          modelValue={wordForm.phonetic0}
                          onUpdate:model-value={e => wordForm.phonetic0 = e}
                      />
                    </el-form-item>
                    <el-form-item label="音标/发音②">
                      <el-input
                          modelValue={wordForm.phonetic1}
                          onUpdate:model-value={e => wordForm.phonetic1 = e}/>
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
      </BasePage>
  )
})
</script>

<style scoped lang="scss">

</style>
