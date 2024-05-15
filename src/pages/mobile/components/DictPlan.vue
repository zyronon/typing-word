<script setup lang="ts">

import {useBaseStore} from "@/stores/base.ts";
import {Picker, showToast} from "vant";
import 'vant/lib/index.css'
import {onMounted} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import router from "@/router.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()

let columns = $ref([])
let columns2 = $ref([])
let chapterWordNumber = $ref([runtimeStore.editDict.chapterWordNumber])
let length = $ref(runtimeStore.editDict.length)
let completeDay = $ref([Math.ceil(length / chapterWordNumber[0])])

const onChange = ({selectedValues}) => {
  chapterWordNumber = selectedValues
  completeDay = [Math.ceil(length / chapterWordNumber[0])]
};

const onChange2 = ({selectedValues}) => {
  completeDay = selectedValues
  for (let i = 0; i < columns.length; i++) {
    let v = columns[i]
    let s = Math.ceil(length / v.value)
    if (s === completeDay[0]) {
      chapterWordNumber = [v.value]
      break
    }
  }
};

onMounted(() => {
  let list = []
  if (length < 50) {
    list = Array.from({length: Math.floor(length / 5)}).map((v, i) => (i + 1) * 5)
  }
  if (length > 50) {
    list = Array.from({length: 10}).map((v, i) => (i + 1) * 5)
  }
  if (length > 100) {
    list = list.concat(Array.from({length: 5}).map((v, i) => 50 + (i + 1) * 10))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 50) / 10)}).map((v, i) => 50 + (i + 1) * 10))
  }
  if (length > 200) {
    list = list.concat(Array.from({length: 4}).map((v, i) => 100 + (i + 1) * 25))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 100) / 25)}).map((v, i) => 100 + (i + 1) * 25))
  }
  if (length > 500) {
    list = list.concat(Array.from({length: 6}).map((v, i) => 200 + (i + 1) * 50))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 200) / 50)}).map((v, i) => 200 + (i + 1) * 50))
  }
  if (length > 1000) {
    list = list.concat(Array.from({length: 5}).map((v, i) => 500 + (i + 1) * 100))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 500) / 100)}).map((v, i) => 500 + (i + 1) * 100))
  }
  if (length > 3000) {
    list = list.concat(Array.from({length: 8}).map((v, i) => 1000 + (i + 1) * 250))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 1000) / 250)}).map((v, i) => 1000 + (i + 1) * 250))
  }
  if (length > 10000) {
    list = list.concat(Array.from({length: 14}).map((v, i) => 3000 + (i + 1) * 500))
  } else {
    list = list.concat(Array.from({length: Math.floor((length - 3000) / 500)}).map((v, i) => 3000 + (i + 1) * 500))
  }
  let d = Math.floor((length - 10000) / 1000)
  if (d > 0) {
    list = list.concat(Array.from({length: d}).map((v, i) => 10000 + (i + 1) * 1000))
  }

  list.push(length)

  columns = list.map(value => {
    return {
      text: value,
      value,
    }
  })

  let days = Array.from(new Set(list.map(v => Math.ceil(length / v)))).sort((a, b) => a - b)
  columns2 = days.map(value => {
    return {
      text: value,
      value
    }
  })
})

function confirm() {
  runtimeStore.editDict.chapterWordNumber = chapterWordNumber[0]
  store.changeDict(runtimeStore.editDict)
  router.back()
}

</script>

<template>
  <div class="plan">
    <div class="content">
      <div class="dict">
        <div class="name">{{ runtimeStore.editDict.name }}</div>
        <div class="chapter">每日{{ chapterWordNumber[0] }}词 剩余{{ completeDay[0] }}天</div>
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
              :model-value="completeDay"
              :columns="columns2"
              @change="onChange2"
          />
        </div>
      </div>
    </div>
    <BaseButton size="large" @click="confirm">确认</BaseButton>
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