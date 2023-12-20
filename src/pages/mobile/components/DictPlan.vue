<script setup lang="ts">
import {$ref} from "vue/macros";
import {useBaseStore} from "@/stores/base.ts";
import {Picker, showToast} from "vant";
import 'vant/lib/index.css'
import {onMounted} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let columns = $ref([])
let columns2 = $ref([])
let chapterWordNumber = $ref([runtimeStore.editDict.chapterWordNumber])
let length = $ref(runtimeStore.editDict.length)
let days = $ref([Math.ceil(length / chapterWordNumber)])

const onChange = ({selectedValues}) => {
  chapterWordNumber = selectedValues
  days = [Math.ceil(length / chapterWordNumber[0])]
  console.log('days', days, chapterWordNumber)
};

const onChange2 = ({selectedValues}) => {
  days = selectedValues
  chapterWordNumber = [Math.ceil(length / days[0])]
  console.log('days', days, chapterWordNumber)

};


onMounted(() => {
  console.log('runtimeStore.editDict.length',runtimeStore.editDict.length)
  let list = []
  if (length > 50) {
    list = Array.from({length: 10}).map((v, i) => (i + 1) * 5)
  }
  if (length > 100) {
    list = list.concat(Array.from({length: 5}).map((v, i) => 50 + (i + 1) * 10))
  }
  if (length > 200) {
    list = list.concat(Array.from({length: 4}).map((v, i) => 100 + (i + 1) * 25))
  }
  if (length > 500) {
    list = list.concat(Array.from({length: 6}).map((v, i) => 200 + (i + 1) * 50))
  }
  let d = Math.floor((length - 500) / 100)
  console.log('d', d)
  if (d) {
    list = list.concat(Array.from({length: d}).map((v, i) => 500 + (i + 1) * 100))
  }

  list.push(length)
  // if (runtimeStore.editDict.length < 50) {
  // } else if (runtimeStore.editDict.length < 100) {
  //   list = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200]
  // }

  console.log('list', length, list)
  columns = list.map(value => {
    return {
      text: value,
      value,
    }
  })

  columns2 = columns.map(v => {
    let value = Math.ceil(length / v.value)
    // console.log('v', v.value, value)
    return {
      text: value,
      value
    }
  })
})

</script>

<template>
  <div class="plan">
    <div class="content">
      <div class="dict">
        <div class="name">{{ runtimeStore.editDict.name }}</div>
        <div class="chapter">每日{{ chapterWordNumber[0] }}词 剩余{{ days[0] }}天</div>
        <el-progress
            :show-text="false"
            :percentage="90"
        />
        <div class="progress">
          <span>已学单词</span>
          <span>0/{{ runtimeStore.editDict.length }}</span>
        </div>
      </div>
      <div class="notice">
        <span>完成日期：</span>
        <span class="date">2023年1月1日</span>
        <span>预计每天11分钟</span>
      </div>
      <div class="set-plan">
        <div class="header">
          <span>每天背单词</span>
          <span>完成天数</span>
        </div>
        <div class="picker-wrapper">
          <Picker
              :show-toolbar="false"
              :model-value="chapterWordNumber"
              :columns="columns"
              @change="onChange"
          />
          <Picker
              :show-toolbar="false"
              :model-value="days"
              :columns="columns2"
              @change="onChange2"
          />
        </div>
      </div>
    </div>
    <BaseButton size="large">确认</BaseButton>
  </div>
</template>

<style scoped lang="scss">
.plan {
  height: 100%;
  padding: 10rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;

    .dict {
      display: flex;
      flex-direction: column;
      gap: 10rem;
    }

    .set-plan {
      background: white;

      .header {
        height: 60rem;
        color: black;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }

      .picker-wrapper {
        display: flex;

        .van-picker {
          flex: 1;
        }
      }
    }
  }


}
</style>