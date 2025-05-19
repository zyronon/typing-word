<script setup lang="ts">
import origin from './data.json'
import BaseButton from "@/components/BaseButton.vue";
import {checkAndUpgradeSaveDict, shakeCommonDict} from "@/utils";
import localforage from "localforage";
import {SAVE_DICT_KEY} from "@/utils/const.ts";

let data = {
  "title": "A cold welcome",
  "titleTranslate": "冷遇",
  "text": "On Wednesday evening, we went to the Town Hall. It was the last day of the year and a large crowd of people had gathered under the Town Hall clock. It would strike twelve in twenty minutes' time. Fifteen minutes passed and then, at five to twelve, the clock stopped. The big minute hand did not move. We waited and waited, but nothing happened. Suddenly someone shouted. 'It's two minutes past twelve! The clock has stopped!' I looked at my watch. It was true. The big clock refused to welcome the New Year. At that moment, everybody began to laugh and sing.\n",
  "textTranslate": "星期三的晚上，我们去了市政厅。 那是一年的最后一天，一大群人聚集在市政厅的大钟下面。再过20分钟，大钟将敲响12下。15分钟过去了，而就在11点55分时，大钟停了。那根巨大的分针不动了。 我们等啊等啊，可情况没有变化。突然有人喊道：“已经12点零2分了！那钟已经停了！”我看了一下我的手表，果真如此。那座大钟不愿意迎接新年。此时，大家已经笑了起来，同时唱起了歌。",
  "textNetworkTranslate": "",
  "textTranslateIsFormat": false,
  "useTranslateType": "custom",
  "newWords": [],
  "id": "UydP2M"
}
// data =   {
//   "title": "The best and the worst",
//   "titleTranslate": "最好的和最差的",
//   "text": "Joe Sanders has the most beautiful garden in our town. Nearly everybody enters for 'The Nicest Garden Competition' each year, but Joe wins every time. Bill Frith's garden is larger than Joe's. Bill works harder than Joe and grows more flowers and vegetables, but Joe's garden is more interesting. He has made neat paths and has built a wooden bridge over a pool. I like gardens too, but I do not like hard work. Every year I enter for the garden competition too, and I always win a little prize for the worst garden in the town!",
//   "textTranslate": "乔.桑德斯拥有我们镇上最漂亮的花园。\n几乎每个人都参加每年举办的“最佳花园竞赛”，而每次都是乔获胜。\n比尔.弗里斯的花园比乔的花园大，\n他比乔也更为勤奋，种植的花卉和蔬菜也更多，但乔的花园更富有情趣。\n他修筑了一条条整洁的小路，并在一个池塘上架了一座小木桥。\n我也喜欢花园，但我却不愿意辛勤劳动。\n每年的花园竞赛我也参加，但总因是镇上最劣的花园而获得一个小奖！",
//   "textNetworkTranslate": "",
//   "textTranslateIsFormat": true,
//   "useTranslateType": "custom",
//   "newWords": [],
//   "id": "TdAAqD"
// }

async function look() {
  let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  let obj = JSON.parse(configStr)
  console.log('local', obj)

}

function set() {
  localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: shakeCommonDict(origin.val as any), version: 3}))
}

async function check() {
  // let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  // console.log('local', configStr)
  // console.log('or',origin)
  let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  let data = checkAndUpgradeSaveDict(configStr)
  console.log('data',data)
  // this.setState(data)
}


const generateColumns = (length = 10, prefix = 'column-', props?: any) =>
    Array.from({ length }).map((_, columnIndex) => ({
      ...props,
      key: `${prefix}${columnIndex}`,
      dataKey: `${prefix}${columnIndex}`,
      title: `Column ${columnIndex}`,
      width: 150,
    }))

const generateData = (
    columns: ReturnType<typeof generateColumns>,
    length = 200,
    prefix = 'row-'
) =>
    Array.from({ length }).map((_, rowIndex) => {
      return columns.reduce(
          (rowData, column, columnIndex) => {
            rowData[column.dataKey] = `Row ${rowIndex} - Col ${columnIndex}`
            return rowData
          },
          {
            id: `${prefix}${rowIndex}`,
            parentId: null,
          }
      )
    })

const columns = generateColumns(10)
const data1 = generateData(columns, 1000)
</script>

<template>
  <div class="page">
    <div class="data">
      <p>数据升级检测</p>
      <BaseButton @click="look">获取保存到localforage的数据</BaseButton>
      <BaseButton @click="set">设置data.json的数据到localforage</BaseButton>
      <BaseButton @click="check">检测升级逻辑</BaseButton>
    </div>
    <el-table-v2
        :columns="columns"
        :data="data1"
        :width="700"
        :height="400"
        fixed
    />
  </div>
</template>

<style scoped lang="scss">
.page {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  color: black;

  .data{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 30rem;
  }
}
</style>