<script setup lang="ts">
import {$ref} from "vue/macros";
import {useBaseStore} from "@/stores/base.ts";
import {Picker, showToast} from "vant";
import 'vant/lib/index.css'
import {onMounted} from "vue";
import BaseButton from "@/components/BaseButton.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()

let columns = $ref([])
let columns2 = $ref([])

const onChange = ({selectedValues}) => {
  showToast(`当前值: ${selectedValues.join(',')}`);
};

onMounted(() => {
  columns = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200].map(value => {
    return {
      text: value,
      value,
    }
  })
  columns2 = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200].map(value => {
    return {
      text: value,
      value,
    }
  })
})

</script>

<template>
  <div class="plan">
    <div class="content">
      <div class="dict">
        <div class="name">{{ runtimeStore.editDict.name }}</div>
        <div class="chapter">每日{{ runtimeStore.editDict.chapterWordNumber }}词 剩余100天</div>
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
              :columns="columns"
              @change="onChange"
          />
          <Picker
              :show-toolbar="false"
              :columns="columns2"
              @change="onChange"
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