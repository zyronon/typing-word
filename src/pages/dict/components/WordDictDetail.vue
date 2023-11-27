<script setup lang="ts">

import BaseIcon from "@/components/BaseIcon.vue";
import Empty from "@/components/Empty.vue";
import ChapterWordList from "@/pages/dict/components/ChapterWordList.vue";
import BaseButton from "@/components/BaseButton.vue";
import {$computed, $ref} from "vue/macros";
import {assign, chunk, cloneDeep, reverse, shuffle} from "lodash-es";
import {Sort, Word} from "@/types.ts";
import {nanoid} from "nanoid";
import {FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";
import Dialog from "@/components/dialog/Dialog.vue";
import {MessageBox} from "@/utils/MessageBox.tsx";
import * as XLSX from "xlsx";
import WordListDialog from "@/components/dialog/WordListDialog.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
const runtimeStore = useRuntimeStore()

let loading = $ref(false)
let chapterList2 = $ref([])
let chapterWordListRef: any = $ref()
let residueWordListRef: any = $ref()
let chapterListRef: any = $ref()
let chapterIndex = $ref(1)
let residueWordList = $ref([])

let chapterWordList: Word[] = $computed({
  get() {
    return runtimeStore.editDict.chapterWords[chapterIndex] ?? []
  },
  set(newValue) {
    runtimeStore.editDict.chapterWords[chapterIndex] = newValue
  }
})

function addNewChapter() {
  runtimeStore.editDict.chapterWords.push([])
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
  chapterListRef?.scrollToItem(chapterList2.length - 1)
  ElMessage.success('新增章节成功')
  console.log('scrollToBottom', chapterListRef)
}


function delWordChapter(index: number) {
  let list = runtimeStore.editDict.chapterWords[index]
  list.map(v => v.checked = false)
  residueWordList = residueWordList.concat(list)
  runtimeStore.editDict.chapterWords.splice(index, 1)
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))

  if (chapterIndex >= index) chapterIndex--
  if (chapterIndex < 0) chapterIndex = 0

  syncMyDictList()
}


let chapterWordListCheckedTotal = $computed(() => {
  return chapterWordList.filter(v => v.checked).length
})

let residueWordListCheckedTotal = $computed(() => {
  return residueWordList.filter(v => v.checked).length
})

function handleChangeCurrentChapter(index: number) {
  chapterWordList.map(v => v.checked = false)
  chapterIndex = index
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
    let rIndex = targetList.findIndex(s => s.name === v.name)
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
        '单词"' + repeatWords.map(v => v.name).join(', ') + '" 已存在，继续将会覆盖原有单词，是否继续？',
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
          if (noRepeatWords.find(v => v.name === wordForm.name)) {
            wordFormData.where = 'residue'
          }
        }
        noRepeatWords.map(v => {
          let rIndex = chapterWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) chapterWordList.splice(rIndex, 1)
        })
        residueWordList = residueWordList.concat(noRepeatWords)
        setTimeout(residueWordListRef?.scrollToBottom, 100)
      },
      repeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where === 'chapter') {
          if (repeatWords.find(v => v.name === wordForm.name)) {
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
          if (noRepeatWords.find(v => v.name === wordForm.name)) {
            wordFormData.where = 'chapter'
          }
        }
        noRepeatWords.map(v => {
          let rIndex = residueWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) residueWordList.splice(rIndex, 1)
        })
        chapterWordList = chapterWordList.concat(noRepeatWords)
        setTimeout(chapterWordListRef?.scrollToBottom, 100)
      },
      repeatWords => {
        if (wordFormData.type === FormMode.Edit && wordFormData.where !== 'chapter') {
          if (repeatWords.find(v => v.name === wordForm.name)) {
            wordFormData.where = 'chapter'
          }
        }

        repeatWords.map((v) => {
          chapterWordList[v.index] = v
          delete chapterWordList[v.index].index

          let rIndex = residueWordList.findIndex(s => s.id === v.id)
          if (rIndex > -1) residueWordList.splice(rIndex, 1)
        })
        setTimeout(chapterWordListRef?.scrollToBottom, 100)
      }
  )
}


/**/
/* 单词修改相关*/
/**/

let wordFormData = $ref({
  where: '',
  type: '',
  name: '',
  id: '',
  index: 0
})

enum FormMode {
  None = '',
  Add = 'Add',
  Edit = 'Edit',
}

const DefaultFormWord = {
  name: '',
  usphone: '',
  ukphone: '',
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
        let r = list.find(v => v.name === wordForm.name)
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
      syncMyDictList()
    } else {
      ElMessage.warning('请填写完整')
    }
  })
}

//同步到我的词典列表
function syncMyDictList() {
  //任意修改，都将其变为自定义词典
  runtimeStore.editDict.isCustom = true

  let rIndex = store.myDictList.findIndex(v => v.id === runtimeStore.editDict.id)
  if (rIndex > -1) {
    store.myDictList[rIndex] = cloneDeep(runtimeStore.editDict)
  } else {
    store.myDictList.push(cloneDeep(runtimeStore.editDict))
  }
}

function delWord(val: { word: Word }) {
  let rIndex = runtimeStore.editDict.originWords.findIndex(v => v.id === val.word.id)
  if (rIndex > -1) {
    runtimeStore.editDict.originWords.splice(rIndex, 1)
  }
  let rIndex2 = runtimeStore.editDict.words.findIndex(v => v.id === val.word.id)
  if (rIndex2 > -1) {
    runtimeStore.editDict.words.splice(rIndex2, 1)
  }

  if (wordFormData.type === FormMode.Edit && wordForm.name === val.word.name) {
    closeWordForm()
  }
  syncMyDictList()
}

function editWord(word: Word, index: number, where: string) {
  wordFormData.type = FormMode.Edit
  wordFormData.id = word.id
  wordFormData.where = where
  wordForm.name = word.name
  wordForm.ukphone = word.ukphone
  wordForm.usphone = word.usphone
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
/* 单词修改相关*/
/**/

let showAllocationChapterDialog = $ref(false)
let chapterWordNumber = $ref(settingStore.chapterWordNumber)

function resetChapterList(num?: number) {
  if (num !== undefined) {
    runtimeStore.editDict.chapterWordNumber = num
  }
  residueWordList = []
  chapterIndex = -1
  runtimeStore.editDict.words.map(v => v.checked = false)
  runtimeStore.editDict.chapterWords = chunk(runtimeStore.editDict.words, runtimeStore.editDict.chapterWordNumber)
  chapterList2 = Array.from({length: runtimeStore.editDict.chapterWords.length}).map((v, i) => ({id: i}))
  // console.log('runtimeStore.editDict.chapterWords',runtimeStore.editDict.chapterWords)
  // console.log('chapterList2',chapterList2)
}

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
          ElMessage.success('恢复成功')
        } else {
          ElMessage.success('恢复失败')
        }
      }
  )
  // runtimeStore.editDict
}

function exportData() {
  let wb = XLSX.utils.book_new()
// 一个简单的sheet
  let sheetData = chapterWordList.map(v => {
    return {
      单词: v.name,
      '音标①': v.usphone,
      '音标②': v.ukphone,
      '释义(一行一个释义)': v.trans.join('\n')
    }
  })
  let sheet = XLSX.utils.json_to_sheet(sheetData)
  wb.Sheets['Sheet1'] = sheet
  wb.SheetNames = ['Sheet1']
  XLSX.writeFile(wb, `${runtimeStore.editDict.name}-zh-CN.xlsx`);
  ElMessage.success('导出成功！')
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
            name: String(v['单词']),
            usphone: String(v['音标①'] ?? ''),
            ukphone: String(v['音标②'] ?? ''),
            trans: String(v['释义(一行一个释义)'] ?? '').split('\n')
          }
          return word
        }
      }).filter(v => v)

      checkRepeatWord(words, residueWordList, noRepeatWords => {
            residueWordList = residueWordList.concat(noRepeatWords)
            setTimeout(residueWordListRef?.scrollToBottom, 100)
          },
          repeatWords => {
            repeatWords.map(v => {
              residueWordList[v.index] = v
              delete residueWordList[v.index].index
            })
            setTimeout(residueWordListRef?.scrollToBottom, 100)
          },
          () => ElMessage.success('导入成功！'))
    } else {
      ElMessage.warning('导入失败！原因：没有数据')
    }
  };
  reader.readAsBinaryString(file);
}

</script>

<template>
  <div class="page-content">
    <div class="left-column">
      <div class="header">
        <div class="common-title">
          <span>章节管理</span>
          <div class="options">
            <BaseIcon
                @click="addNewChapter"
                icon="fluent:add-20-filled"
                title="新增章节"/>
          </div>
        </div>
        <div class="select">
          <BaseButton size="small" @click="showAllocationChapterDialog = true">智能分配</BaseButton>
          <span>{{ runtimeStore.editDict.chapterWords.length }}章</span>
        </div>
      </div>
      <div class="wrapper">
        <RecycleScroller
            v-if="chapterList2.length"
            ref="chapterListRef"
            style="height: 100%;"
            :items="chapterList2"
            :item-size="63"
            key-field="id"
            v-slot="{ item,index }"
        >
          <div style="padding: 0 15rem;">
            <div class="common-list-item"
                 :class="chapterIndex === item.id && 'active'"
                 @click="handleChangeCurrentChapter(item.id)">
              <div class="flex gap10 flex1 ">
                <input type="radio" :checked="chapterIndex === item.id">
                <div class="item-title flex flex1 space-between">
                  <span>第{{ item.id + 1 }}章</span>
                  <span>{{ runtimeStore.editDict.chapterWords[item.id]?.length }}词</span>
                </div>
              </div>
              <div class="right">
                <BaseIcon
                    class-name="del"
                    @click="delWordChapter(item.id)"
                    title="移除"
                    icon="solar:trash-bin-minimalistic-linear"/>
              </div>
            </div>
          </div>
        </RecycleScroller>
        <Empty v-else/>
      </div>
    </div>
    <ChapterWordList
        ref="chapterWordListRef"
        :title="`${chapterIndex > -1 ? `第${chapterIndex + 1}章` : ''} 单词列表`"
        :show-add="chapterIndex > -1"
        @add="addWord('chapter')"
        @del="delWord"
        :empty-title="chapterIndex === -1?'请选择章节':null"
        @edit="val => editWord(val.word,val.index,'chapter')"
        v-model:list="chapterWordList"/>
    <div class="options-column">
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
        ref="residueWordListRef"
        title="未分配单词列表"
        :empty-title="null"
        :show-add="true"
        @add="addWord('residue')"
        @del="delWord"
        @edit="val => editWord(val.word,val.index,'residue')"
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
          <el-form-item label="单词" prop="name">
            <el-input v-model="wordForm.name"/>
          </el-form-item>
          <el-form-item label="翻译">
            <el-input v-model="wordForm.trans"
                      placeholder="多个翻译请换行"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                      type="textarea"/>
          </el-form-item>
          <el-form-item label="音标/发音①">
            <el-input v-model="wordForm.usphone"/>
          </el-form-item>
          <el-form-item label="音标/发音②">
            <el-input v-model="wordForm.ukphone"/>
          </el-form-item>
          <div class="flex-center">
            <el-button @click="closeWordForm">关闭</el-button>
            <el-button type="primary" @click="onSubmitWord">保存</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
  <Dialog
      title="智能分配单词"
      :footer="true"
      @ok="resetChapterList(chapterWordNumber)"
      @cancel="chapterWordNumber = settingStore.chapterWordNumber"
      v-model="showAllocationChapterDialog">
    <div class="allocation-chapter">
      <div class="desc">
        <div>为您自动创建章节以及分配单词</div>
        <div>注意：已存在的章节将被删除！</div>
      </div>
      <div class="row">
        <div class="label">每章单词数</div>
        <span class="text">最小:10</span>
        <el-slider :min="10"
                   :step="10"
                   :max="runtimeStore.editDict.words.length ?? 10"
                   v-model="chapterWordNumber"
        />
        <span class="text">最大:{{ runtimeStore.editDict.words.length ?? 10 }}</span>
      </div>

      <div class="notice">鼠标按住滑块，按键盘左右箭头可进行微调</div>

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

.page-content {
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
    transform: translate3d(110rem, -20rem, 0);
    font-size: 11rem;
  }
}

</style>