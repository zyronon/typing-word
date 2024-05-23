<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {assign, chunk, cloneDeep, reverse, shuffle} from "lodash-es";
import {DefaultDict, Dict, DictResource, DictType, Sort, Word} from "@/types.ts";
import {nanoid} from "nanoid";
import {FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {MessageBox} from "@/utils/MessageBox.tsx";
import * as XLSX from "xlsx";
import {Icon} from "@iconify/vue";
import EditDict from "@/pages/pc/dict/components/EditDict.vue";
import {syncMyDictList} from "@/hooks/dict.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import {useWindowClick} from "@/hooks/event.ts";
import ChapterWordList from "@/pages/pc/dict/components/ChapterWordList.vue";
import {useNav} from "@/utils";

const emit = defineEmits<{
  back: []
}>()

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let loading = $ref(false)
let chapterList2 = $ref([])
let wordListRef: any = $ref()
let residueWordListRef: any = $ref()
let chapterIndex = $ref(1)
let isEditDict = $ref(false)
let showExport = $ref(false)

useWindowClick(() => showExport = false)

const isPinDict = $computed(() => {
  return [DictType.collect, DictType.wrong, DictType.simple].includes(runtimeStore.editDict.type)
})
const isCanOperation = $computed(() => {
  return runtimeStore.editDict.type !== DictType.wrong
})

let wordList: Word[] = $computed({
  get() {
    return runtimeStore.editDict.words ?? []
  },
  set(newValue) {
    runtimeStore.editDict.words[chapterIndex] = newValue
  }
})

let residueWordList: Word[] = $computed({
  get() {
    return runtimeStore.editDict.residueWords ?? []
  },
  set(newValue) {
    runtimeStore.editDict.residueWords = newValue
  }
})

async function getDictDetail(val: {
  dict: DictResource | Dict,
  index: number
}) {
  let item = val.dict
  // console.log('word-getDictDetail', item)
  chapterList2 = []
  chapterIndex = -1
  wordFormData.type = FormMode.None
  loading = true
  let find: Dict = store.myDictList.find((v: Dict) => v.id === item.id)
  if (find) {
    runtimeStore.editDict = cloneDeep(find)
  } else {
    runtimeStore.editDict = cloneDeep({
      ...cloneDeep(DefaultDict),
      ...item,
    })
    runtimeStore.editDict.id = nanoid(6)
    //设置默认章节单词数
    runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
  }

  console.log('runtimeStore', runtimeStore)

  if ([DictType.collect, DictType.simple, DictType.wrong].includes(runtimeStore.editDict.type)) {

  } else {
    //如果不是自定义词典，并且有url地址才去下载
    if (!runtimeStore.editDict.isCustom && runtimeStore.editDict.url) {
      let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
      if (!runtimeStore.editDict.originWords.length) {
        let r = await fetch(url)
        let v = await r.json()
        v.map(s => {
          s.id = nanoid(6)
        })
        runtimeStore.editDict.originWords = cloneDeep(v)
        changeSort(runtimeStore.editDict.sort)
      } else {
        runtimeStore.editDict.length = runtimeStore.editDict.words.length
      }
    }
  }
  chapterList2 = runtimeStore.editDict.chapterWords.map((v, i) => ({id: i}))
  loading = false
}

function checkRepeatWord(
    words: Word[],
    targetList: Word[],
    concatNoRepeat: Function,
    concatRepeat: Function,
    notice?: Function
) {
  let repeatWords = []
  let noRepeatWords = []
  words.map((v: any) => {
    let rIndex = targetList.findIndex(s => s.word === v.word)
    if (rIndex > -1) {
      v.index = rIndex
      repeatWords.push(v)
    } else {
      noRepeatWords.push(v)
    }
  })
  concatNoRepeat(noRepeatWords)
  if (repeatWords.length) {
    MessageBox.confirm(
        '单词"' + repeatWords.map(v => v.word).join(', ') + '" 已存在，继续将会覆盖原有单词，是否继续？',
        '检测到重复单词',
        () => concatRepeat(repeatWords),
        null,
        () => notice?.()
    )
  } else {
    notice?.()
  }
}

//同步到我的词典列表
function syncEditDict2MyDictList() {
  syncMyDictList(runtimeStore.editDict)
}


/**/
/* start单词修改相关start*/
/**/

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
        let r = wordList.find(v => v.word === wordForm.word)
        // if (r) return ElMessage.warning('已有相同名称单词！')
        // else list.push(data)
        runtimeStore.editDict.originWords.push(data)
        wordList.push(data)
        ElMessage.success('添加成功')
        wordForm = cloneDeep(DefaultFormWord)
        setTimeout(wordListRef?.scrollToBottom, 100)
      } else {
        let r = wordList.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        //同步修改到列表
        r = runtimeStore.editDict.originWords.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        r = runtimeStore.editDict.words.find(v => v.id === wordFormData.id)
        if (r) assign(r, data)
        ElMessage.success('修改成功')
      }
      syncEditDict2MyDictList()
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

function delWord(val: {
  item: Word
}) {
  let rIndex = runtimeStore.editDict.originWords.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    runtimeStore.editDict.originWords.splice(rIndex, 1)
  }
  let rIndex2 = runtimeStore.editDict.words.findIndex(v => v.id === val.item.id)
  if (rIndex2 > -1) {
    runtimeStore.editDict.words.splice(rIndex2, 1)
  }

  if (wordFormData.type === FormMode.Edit && wordForm.word === val.item.word) {
    closeWordForm()
  }
  syncEditDict2MyDictList()
}

function editWord(word: Word, index: number,) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.join('\n')
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

/**/
/* end单词修改相关end*/
/**/

function changeSort(v: Sort) {
  if (v === Sort.normal) {
    runtimeStore.editDict.words = cloneDeep(runtimeStore.editDict.originWords)
  } else if (v === Sort.random) {
    runtimeStore.editDict.words = shuffle(runtimeStore.editDict.originWords)
  } else {
    runtimeStore.editDict.words = reverse(runtimeStore.editDict.originWords)
  }
  resetChapterList()
}

function resetChapterList(num?: number, sync?: boolean) {
  if (num !== undefined) {
    runtimeStore.editDict.chapterWordNumber = num
  }
  residueWordList = []
  chapterIndex = -1
  runtimeStore.editDict.words.map(v => v.checked = false)
  runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, runtimeStore.editDict.chapterWordNumber)
  runtimeStore.editDict.length = runtimeStore.editDict.words.length
  chapterList2 = runtimeStore.editDict.chapterWords.map((v, i) => ({id: i}))
  if (sync !== undefined) {
    syncEditDict2MyDictList()
  }
}

async function resetDict() {
  MessageBox.confirm(
      '删除所有自定义内容: 章节、排序、单词，并恢复至默认状态，确认恢复？',
      '提示',
      async () => {
        closeWordForm()
        chapterIndex = -1
        if (runtimeStore.editDict.url) {
          runtimeStore.editDict.sort = Sort.normal
          runtimeStore.editDict.isCustom = false
          runtimeStore.editDict.chapterWordNumber = settingStore.chapterWordNumber
          let url = `./dicts/${runtimeStore.editDict.language}/${runtimeStore.editDict.type}/${runtimeStore.editDict.translateLanguage}/${runtimeStore.editDict.url}`;
          let r = await fetch(url)
          let v = await r.json()
          v.map(s => {
            s.id = nanoid(6)
          })
          runtimeStore.editDict.originWords = cloneDeep(v)
          changeSort(runtimeStore.editDict.sort)
          syncMyDictList(runtimeStore.editDict, false)
          ElMessage.success('恢复成功')
        } else {
          ElMessage.success('恢复失败')
        }
      }
  )
  // runtimeStore.editDict
}

function exportData(type: string) {
  let list = []
  let filename = ''
  if (type === 'chapter') {
    if (chapterIndex === -1) {
      return ElMessage.error('请选择章节')
    }
    list = wordList
    filename = runtimeStore.editDict.name + `-第${chapterIndex + 1}章`
  } else {
    list = runtimeStore.editDict.words
    filename = runtimeStore.editDict.name
  }
  let wb = XLSX.utils.book_new()
  let sheetData = list.map(v => {
    return {
      单词: v.word,
      '音标①': v.usphone,
      '音标②': v.ukphone,
      '释义(一行一个释义)': v.trans.join('\n')
    }
  })
  wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(sheetData)
  wb.SheetNames = ['Sheet1']
  XLSX.writeFile(wb, `${filename}-zh-CN.xlsx`);
  ElMessage.success(filename + ' 导出成功！')
  showExport = false
}

function importData(e: any) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader();
  reader.onload = function (e) {
    let data = e.target.result;
    // 读取二进制的excel
    let workbook = XLSX.read(data, {type: 'binary'});
    let res: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
    if (res.length) {
      let words = res.map(v => {
        if (v['单词']) {
          let word: Word = {
            id: nanoid(6),
            checked: false,
            word: String(v['单词']),
            phonetic0: String(v['音标①'] ?? ''),
            phonetic1: String(v['音标②'] ?? ''),
            trans: String(v['释义(一行一个释义)'] ?? '').split('\n')
          }
          return word
        }
      }).filter(v => v)

      checkRepeatWord(words, residueWordList, noRepeatWords => {
            residueWordList = residueWordList.concat(noRepeatWords)
            syncEditDict2MyDictList()
            setTimeout(residueWordListRef?.scrollToBottom, 100)
          },
          repeatWords => {
            repeatWords.map(v => {
              residueWordList[v.index] = v
              delete residueWordList[v.index].index
            })
            syncEditDict2MyDictList()
            setTimeout(residueWordListRef?.scrollToBottom, 100)
          },
          () => ElMessage.success('导入成功！'))
    } else {
      ElMessage.warning('导入失败！原因：没有数据')
    }
  };
  reader.readAsBinaryString(file);
}

function editDict() {
  isEditDict = true
}

const {back} = useNav()
defineExpose({getDictDetail, add: addWord, editDict})

</script>

<template>
  <div class="dict-detail">
    <header>
      <div class="back" @click.stop="back">
        <Icon icon="octicon:arrow-left-24" width="20"/>
      </div>
      <div class="left">
        <div class="top">
          <div class="title">
            {{ runtimeStore.editDict.name }}
          </div>
          <template v-if="!isPinDict">
            <BaseIcon icon="tabler:edit" @click='editDict'/>
            <!--            <BaseIcon icon="ph:star" @click='no'/>-->
            <BaseButton size="small" v-if="runtimeStore.editDict.isCustom" @click="resetDict">恢复默认</BaseButton>
          </template>
          <div class="import hvr-grow">
            <BaseButton size="small">导入</BaseButton>
            <input type="file"
                   accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                   @change="importData">
          </div>
          <div class="export"
               style="position: relative"
               @click.stop="null">
            <BaseButton size="small" @click="showExport = true">导出</BaseButton>
            <MiniDialog
                v-model="showExport"
                style="width: 80rem;"
            >
              <div class="mini-row-title">
                导出选项
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="exportData('all')">全部单词</BaseButton>
              </div>
              <div class="mini-row">
                <BaseButton size="small" @click="exportData('chapter')">当前章节</BaseButton>
              </div>
            </MiniDialog>
          </div>
        </div>
        <div class="desc" v-if="runtimeStore.editDict.description">{{ runtimeStore.editDict.description }}</div>
      </div>
    </header>
    <EditDict
        :isAdd="false"
        v-if="isEditDict"
        @cancel="isEditDict = false"
        @submit="isEditDict = false"/>
    <div v-else class="content">
      <ChapterWordList
          ref="wordListRef"
          :can-operation="isCanOperation"
          title="单词列表"
          :show-add="true"
          @add="addWord"
          @del="delWord"
          empty-title="还没有单词哦~"
          @edit="val => editWord(val.item,val.index)"
          @sync="syncMyDictList(runtimeStore.editDict)"
          v-model:list="wordList"/>
      <div class="right-column">
        <div class="add" v-if="wordFormData.type">
          <div class="common-title">
            {{ wordFormData.type === FormMode.Add ? '添加' : '修改' }}单词
          </div>
          <el-form
              class="form"
              ref="wordFormRef"
              :rules="wordRules"
              :model="wordForm"
              label-width="6rem">
            <el-form-item label="单词" prop="word">
              <el-input v-model="wordForm.word"/>
            </el-form-item>
            <el-form-item label="翻译">
              <el-input v-model="wordForm.trans"
                        placeholder="多个翻译请换行"
                        :autosize="{ minRows: 2, maxRows: 6 }"
                        type="textarea"/>
            </el-form-item>
            <el-form-item label="音标/发音①">
              <el-input v-model="wordForm.phonetic0"/>
            </el-form-item>
            <el-form-item label="音标/发音②">
              <el-input v-model="wordForm.phonetic1"/>
            </el-form-item>
            <div class="flex-center">
              <el-button @click="closeWordForm">关闭</el-button>
              <el-button type="primary" @click="onSubmitWord">保存</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dict-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  header {
    width: 100%;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    color: var(--color-font-1);
    padding: 0 var(--space);
    gap: 1.2rem;
    margin-bottom: 1.2rem;

    .back {
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .left {
      display: flex;
      gap: .6rem;
      flex-direction: column;
      color: var(--color-font-2);

      .top {
        color: var(--color-font-1);
        display: flex;
        gap: .6rem;
        font-size: 1.2rem;
        align-items: center;
      }

      .import {
        display: inline-flex;
        position: relative;

        input {
          position: absolute;
          height: 100%;
          width: 100%;
          opacity: 0;
        }
      }
    }
  }

}

.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
  gap: var(--space);

  .header {
    padding: 0 var(--space);

    .common-title {
      margin-bottom: 0;
      position: relative;

      .options {
        position: absolute;
        right: 0;
        display: flex;
        gap: 10rem;
      }
    }

    .select {
      height: 3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        display: flex;
        gap: .3rem;
        align-items: center;
      }
    }
  }

  .wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .column {
    flex: 1;
    background: white;
    border-radius: .6rem;
    background: var(--color-second-bg);
    background: white;
    color: var(--color-font-1);
    padding-bottom: var(--space);
    display: flex;
    flex-direction: column;
  }

  .right-column {
    //@extend .column;
    flex: 1;
    box-sizing: border-box;
    align-items: center;

    .add {
      width: 90%;
    }
  }
}
</style>