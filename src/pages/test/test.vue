<script setup lang="ts">
// import origin from './data.json'
import BaseButton from "@/components/BaseButton.vue";
import {checkAndUpgradeSaveDict, shakeCommonDict} from "@/utils";
import localforage from "localforage";
import {SAVE_DICT_KEY} from "@/utils/const.ts";
import str from './data.json'

let data = {}
let origin = {}


async function look() {
  let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  let obj = JSON.parse(configStr)
  console.log('local', obj)

}

function set() {
  // localforage.setItem(SAVE_DICT_KEY.key, JSON.stringify({val: shakeCommonDict(origin.val as any), version: 3}))
}

async function check() {
  // let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  // console.log('local', configStr)
  // console.log('or',origin)
  // let configStr: string = await localforage.getItem(SAVE_DICT_KEY.key)
  console.parse(str)
  // console.log(str)
  let data = checkAndUpgradeSaveDict(str)
  console.log('data', data)
  // this.setState(data)
}


const generateColumns = (length = 10, prefix = 'column-', props?: any) =>
    Array.from({length}).map((_, columnIndex) => ({
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
    Array.from({length}).map((_, rowIndex) => {
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

  .data {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 30rem;
  }
}
</style>
