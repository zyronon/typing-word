<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import ChapterWordList from "@/pages/pc/dict/components/ChapterWordList.vue";
import BaseButton from "@/components/BaseButton.vue";
import {$computed, $ref} from "vue/macros";
import {assign, chunk, cloneDeep, reverse, shuffle} from "lodash-es";
import {DefaultDict, Dict, DictResource, DictType, Sort, Word} from "@/types.ts";
import {nanoid} from "nanoid";
import {FormInstance, FormRules} from "element-plus";
import {reactive, watch} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import Dialog from "@/pages/pc/components/dialog/Dialog.vue";
import {MessageBox} from "@/utils/MessageBox.tsx";
import * as XLSX from "xlsx";
import WordListDialog from "@/pages/pc/components/dialog/WordListDialog.vue";
import {no} from "@/utils";
import {Icon} from "@iconify/vue";
import EditDict from "@/pages/pc/dict/components/EditDict.vue";
import {syncMyDictList} from "@/hooks/dict.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import {useWindowClick} from "@/hooks/event.ts";
import BaseList from "@/pages/pc/components/list/BaseList.vue";

const emit = defineEmits<{
  back: []
}>()

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let loading = $ref(false)
let chapterList2 = $ref([])
let chapterWordListRef: any = $ref()
let residueWordListRef: any = $ref()
let chapterListRef: any = $ref()
let chapterIndex = $ref(1)
let isEditDict = $ref(false)
let showExport = $ref(false)
let chapterWordNumber = $ref(settingStore.chapterWordNumber)

useWindowClick(() => showExport = false)

const isPinDict = $computed(() => {
  return [DictType.collect, DictType.wrong, DictType.simple].includes(runtimeStore.editDict.type)
})
const isCanOperation = $computed(() => {
  return runtimeStore.editDict.type !== DictType.wrong
})

let chapterWordList: Word[] = $computed({
  get() {
    return runtimeStore.editDict.chapterWords[chapterIndex] ?? []
  },
  set(newValue) {
    runtimeStore.editDict.chapterWords[chapterIndex] = newValue
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

function addNewChapter() {
  runtimeStore.editDict.chapterWords.push([])
  chapterList2 = runtimeStore.editDict.chapterWords.map((v, i) => ({id: i}))
  ElMessage.success('新增章节成功')
  setTimeout(() => chapterListRef?.scrollToItem(chapterList2.length - 1), 100)
}

function delWordChapter(index: number) {
  let list = runtimeStore.editDict.chapterWords[index]
  list.map(v => v.checked = false)
  residueWordList = residueWordList.concat(list)
  runtimeStore.editDict.chapterWords.splice(index, 1)
  chapterList2 = runtimeStore.editDict.chapterWords.map((v, i) => ({id: i}))

  // if (runtimeStore.editDict.chapterWords.length) {
  //   if (chapterIndex >= runtimeStore.editDict.chapterWords.length - 1) {
  //     chapterIndex = runtimeStore.editDict.chapterWords.length - 1
  //   }
  // } else {
  //   chapterIndex = -1
  // }

  //这里采用删除后跳到上一张的做法，因为章节名是index，如果保持删除后的index不变，看起来就像未删除一样，但是实际删除了
  if (chapterIndex >= index) chapterIndex--
  if (chapterIndex < 0) chapterIndex = 0

  syncEditDict2MyDictList()
}

let chapterWordListCheckedTotal = $computed(() => {
  return chapterWordList.filter(v => v.checked).length
})

let residueWordListCheckedTotal = $computed(() => {
  return residueWordList.filter(v => v.checked).length
})

function handleChangeCurrentChapter(val: {
  index: number
}) {
  chapterIndex = val.index
  chapterWordList.map(v => {
    v.checked = false
  })

  chapterWordListRef?.scrollToItem(0)
  closeWordForm()
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

function toResidueWordList() {
  let list = cloneDeep(chapterWordList.filter(v => v.checked))
  list.map(v => v.checked = false)
  checkRepeatWord(list, residueWordList,
      noRepeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where === 'chapter') {
          if (noRepeatWords.find(v => v.word === wordForm.word)) {
            wordFormData.where = 'residue'
          }
        }
        noRepeatWords.map(v => {
          let rIndex = chapterWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) chapterWordList.splice(rIndex, 1)
        })
        residueWordList = residueWordList.concat(noRepeatWords)
        syncEditDict2MyDictList()
        setTimeout(residueWordListRef?.scrollToBottom, 100)
      },
      repeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where === 'chapter') {
          if (repeatWords.find(v => v.word === wordForm.word)) {
            wordFormData.where = 'residue'
          }
        }
        repeatWords.map(v => {
          residueWordList[v.index] = v
          delete residueWordList[v.index].index

          let rIndex = chapterWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) chapterWordList.splice(rIndex, 1)
        })
        setTimeout(residueWordListRef?.scrollToBottom, 100)
      }
  )
}

function toChapterWordList() {
  if (chapterIndex == -1) return ElMessage.warning('请选择章节')
  let list = cloneDeep(residueWordList.filter(v => v.checked))
  list.map(v => v.checked = false)

  checkRepeatWord(list, chapterWordList,
      noRepeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where !== 'chapter') {
          if (noRepeatWords.find(v => v.word === wordForm.word)) {
            wordFormData.where = 'chapter'
          }
        }
        noRepeatWords.map(v => {
          let rIndex = residueWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) residueWordList.splice(rIndex, 1)
        })
        chapterWordList = chapterWordList.concat(noRepeatWords)
        syncEditDict2MyDictList()
        setTimeout(chapterWordListRef?.scrollToBottom, 100)
      },
      repeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where !== 'chapter') {
          if (repeatWords.find(v => v.word === wordForm.word)) {
            wordFormData.where = 'chapter'
          }
        }
        repeatWords.map((v) => {
          chapterWordList[v.index] = v
          delete chapterWordList[v.index].index

          let rIndex = residueWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) residueWordList.splice(rIndex, 1)
        })
        syncEditDict2MyDictList()
        setTimeout(chapterWordListRef?.scrollToBottom, 100)
      }
  )
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
      //直接使用引用修改
      let index = wordFormData.where === 'chapter' ? 0 : 1;
      let list = [chapterWordList, residueWordList][index]
      let listRef = [chapterWordListRef, residueWordListRef][index]
      if (wordFormData.type === FormMode.Add) {
        data.id = nanoid(6)
        data.checked = false
        let r = list.find(v => v.word === wordForm.word)
        if (r) return ElMessage.warning('已有相同名称单词！')
        else list.push(data)
        runtimeStore.editDict.originWords.push(data)
        runtimeStore.editDict.words.push(data)
        ElMessage.success('添加成功')
        wordForm = cloneDeep(DefaultFormWord)
        setTimeout(listRef?.scrollToBottom, 100)
      } else {
        let r = list.find(v => v.id === wordFormData.id)
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

function editWord(word: Word, index: number, where: string) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordFormData.where = where
  wordForm.word = word.word
  wordForm.phonetic1 = word.phonetic1
  wordForm.phonetic0 = word.phonetic0
  wordForm.trans = word.trans.join('\n')
}

function addWord(where: string) {
  // setTimeout(wordListRef?.scrollToBottom, 100)
  wordFormData.type = FormMode.Add
  wordFormData.where = where
  wordForm = cloneDeep(DefaultFormWord)
}

function closeWordForm() {
  wordFormData.type = FormMode.None
  wordForm = cloneDeep(DefaultFormWord)
}

/**/
/* end单词修改相关end*/
/**/

let showAllocationChapterDialog = $ref(false)

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
    list = chapterWordList
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

function s() {
  if (runtimeStore.editDict.words.length) {
    showAllocationChapterDialog = true
  } else {
    ElMessage.warning('请先添加单词')
  }
}

function back() {
  emit('back')
  setTimeout(() => {
    isEditDict = false
  }, 500)
}

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
        <div class="num">总词汇: {{ runtimeStore.editDict.length }}词</div>
      </div>
    </header>
    <EditDict
        :isAdd="false"
        v-if="isEditDict"
        @cancel="isEditDict = false"
        @submit="isEditDict = false"/>
    <div v-else class="content">
      <div class="left-column">
        <div class="header">
          <div class="common-title">
            <span>章节管理</span>
            <div class="options">
              <BaseIcon
                  v-if="isCanOperation"
                  @click="addNewChapter"
                  icon="fluent:add-20-filled"
                  title="新增章节"/>
            </div>
          </div>
          <div class="select">
            <BaseButton v-if="isCanOperation" size="small" @click="s">智能分配</BaseButton>
            <span>{{ runtimeStore.editDict.chapterWords.length }}章</span>
          </div>
        </div>
        <div class="wrapper">
          <BaseList
              ref="chapterListRef"
              :list="chapterList2"
              @click="handleChangeCurrentChapter"
              :active-index="chapterIndex">
            <template v-slot:prefix="{ item, index }">
              <input type="radio" :checked="chapterIndex === item.id">
            </template>
            <template v-slot="{ item, index }">
              <div class="item-title">
                <span>第{{ item.id + 1 }}章</span>
                <span>{{ runtimeStore.editDict.chapterWords[item.id]?.length }}词</span>
              </div>
            </template>
            <template v-slot:suffix="{ item, index }" v-if="isCanOperation">
              <BaseIcon
                  class="del"
                  @click="delWordChapter(item.id)"
                  title="移除"
                  icon="solar:trash-bin-minimalistic-linear"/>
            </template>
          </BaseList>
        </div>
      </div>
      <ChapterWordList
          ref="chapterWordListRef"
          :can-operation="isCanOperation"
          :title="`${chapterIndex > -1 ? `第${chapterIndex + 1}章` : ''} 单词列表`"
          :show-add="chapterIndex > -1"
          @add="addWord('chapter')"
          @del="delWord"
          :empty-title="chapterIndex === -1?'请选择章节':null"
          @edit="val => editWord(val.item,val.index,'chapter')"
          @sync="syncMyDictList(runtimeStore.editDict)"
          v-model:list="chapterWordList"/>
      <div class="options-column" v-if="isCanOperation">
        <BaseButton @click="toChapterWordList"
                    :disabled="residueWordListCheckedTotal === 0">
          &lt;
        </BaseButton>
        <BaseButton @click="toResidueWordList"
                    :disabled="chapterWordListCheckedTotal === 0">
          &gt;
        </BaseButton>
      </div>
      <ChapterWordList
          v-if="isCanOperation"
          :can-operation="isCanOperation"
          ref="residueWordListRef"
          title="未分配单词列表"
          :empty-title="null"
          :show-add="true"
          @add="addWord('residue')"
          @del="delWord"
          @edit="val => editWord(val.item,val.index,'residue')"
          @sync="syncMyDictList(runtimeStore.editDict)"
          v-model:list="residueWordList"/>
      <div class="right-column">
        <div class="add" v-if="wordFormData.type">
          <div class="common-title">
            {{ wordFormData.type === FormMode.Add ? '添加' : '修改' }}单词
            {{
              wordFormData.type === FormMode.Add ? (wordFormData.where === 'chapter' ? `> 第${chapterIndex + 1}章` : '> 未分配') : ''
            }}
          </div>
          <el-form
              class="form"
              ref="wordFormRef"
              :rules="wordRules"
              :model="wordForm"
              label-width="100rem">
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
  <Dialog
      title="智能分配单词"
      :footer="true"
      @ok="resetChapterList(chapterWordNumber,true)"
      @cancel="chapterWordNumber = settingStore.chapterWordNumber"
      v-model="showAllocationChapterDialog">
    <div class="allocation-chapter">
      <div class="desc">
        <div>为您自动创建章节以及分配单词</div>
        <div>注意：已存在的章节将被删除！</div>
      </div>
      <div class="row">
        <div class="label">每章单词数</div>
        <el-slider :min="10"
                   :step="10"
                   show-input
                   size="small"
                   :max="runtimeStore.editDict.words.length < 10 ? 10 : runtimeStore.editDict.words.length"
                   v-model="chapterWordNumber"
        />

      </div>

      <div class="notice">
        <span class="text">最小:10</span>
        <span class="text">最大:{{ runtimeStore.editDict.words.length }}</span>
      </div>

      <div class="row">
        <div class="label">将会创建</div>
        <div class="option">
          <span>{{ Math.ceil(runtimeStore.editDict.words.length / chapterWordNumber) }}章</span>
        </div>
      </div>
      <div class="row">
        <div class="label">每章</div>
        <div class="option">
          <span>{{ chapterWordNumber }}个单词</span>
        </div>
      </div>
      <div class="row" :style="{opacity:runtimeStore.editDict.words.length % chapterWordNumber}">
        <div class="label">最后一章</div>
        <div class="option">
          <span>{{ runtimeStore.editDict.words.length % chapterWordNumber }}个单词</span>
        </div>
      </div>
    </div>
  </Dialog>
  <WordListDialog/>
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
    gap: 20rem;
    margin-bottom: 20rem;

    .back {
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .left {
      display: flex;
      gap: 10rem;
      flex-direction: column;
      color: var(--color-font-2);

      .top {
        color: var(--color-font-1);
        display: flex;
        gap: 10rem;
        font-size: 20rem;
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
      height: 45rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        display: flex;
        gap: 5rem;
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
    border-radius: 10rem;
    background: var(--color-second-bg);
    color: var(--color-font-1);
    padding-bottom: var(--space);
    display: flex;
    flex-direction: column;
  }

  .left-column {
    max-width: 250rem;
    width: 16vw;
    @extend .column;
  }

  .options-column {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rem;
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

.allocation-chapter {
  width: 500rem;
  padding: var(--space);
  padding-top: 0;
  color: var(--color-font-1);

  .desc {
    margin-top: 10rem;
    margin-bottom: 35rem;
    text-align: center;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 20rem;
    margin-bottom: 15rem;
    word-break: keep-all;

    .label {
      width: 90rem;
    }

    .text {
      font-size: 12rem;
    }
  }

  .notice {
    display: flex;
    justify-content: space-between;
    transform: translate3d(0, -15rem, 0);
    padding-left: 110rem;
    font-size: 13rem;
  }
}

</style>