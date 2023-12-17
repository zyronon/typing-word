<script setup lang="ts">
import SlideHorizontal from "@/components/slide/SlideHorizontal.vue";
import SlideItem from "@/components/slide/SlideItem.vue";
import {$ref} from "vue/macros";
import {useBaseStore} from "@/stores/base.ts";
import {showConfirmDialog, showToast} from "vant";
import 'vant/lib/index.css'
import {onMounted} from "vue";
import DeleteIcon from "@/components/icon/DeleteIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {Dict} from "@/types.ts";
import DictPlan from "@/pages/mobile/components/DictPlan.vue";
import BackIcon from "@/components/icon/BackIcon.vue";
import {useRouter} from "vue-router";

const store = useBaseStore()
let index = $ref(0)
const router = useRouter()


const onChange = ({selectedValues}) => {
  showToast(`当前值: ${selectedValues.join(',')}`);
};

onMounted(() => {
})

function handleDel(item: Dict, index: number) {
  if (item.id === store.currentDict.id) {
    //TODO
  } else {
    showConfirmDialog({title: '确认删除？', message: '删除后无法撤销，确认删除吗？',})
        .then(() => {
          store.myDictList.splice(index, 1)
        })
  }
}
</script>

<template>
  <div class="mobile-page">
    <header>
      <BackIcon @click="router.back()"/>
      <div class="tabs">
        <div class="tab" :class="index === 0 && 'active'" @click="index = 0">修改计划</div>
        <div class="tab" :class="index === 1 && 'active'" @click="index = 1">更换词书</div>
      </div>
    </header>
    <SlideHorizontal v-model:index="index">
      <SlideItem>
        <DictPlan/>
      </SlideItem>
      <SlideItem>
        <div class="my-dcits">
          <div class="list">
            <div class="dict" v-for="(item,index) in store.myDictList">
              <div class="title">
                <div class="name">{{ item.name }}</div>
                <span v-if="item.id === store.currentDict.id">当前在学</span>
                <template v-else>
                  <DeleteIcon
                      v-if="index>=3"
                      @click="handleDel(item,index)"/>
                </template>
              </div>
              <div class="chapter">每日{{ item.chapterWordNumber }}词 剩余100天</div>
              <el-progress
                  :show-text="false"
                  :percentage="90"
              />
              <div class="progress">
                <span>已学单词</span>
                <span>0/{{ item.length }}</span>
              </div>
            </div>
          </div>
          <BaseButton size="large">添加新书</BaseButton>
        </div>
      </SlideItem>
    </SlideHorizontal>
  </div>
</template>

<style scoped lang="scss">
header {
  height: 60rem;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 var(--space);

  .back {
    position: absolute;
  }

  .tabs {
    width: 100%;
    border-top: 1px solid gray;
    height: 100%;
    display: flex;
    justify-content: center;

    .tab {
      width: 100rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .active {
      border-bottom: 2px solid gray;
    }
  }
}

.plan {
  padding: 10rem;

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

.my-dcits {
  height: 100%;
  padding: var(--space);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .list {
    flex: 1;
    overflow: auto;
    margin-bottom: 20rem;
  }

  .dict {
    padding: var(--space);
    border-radius: var(--radius);
    background: var(--color-second-bg);
    display: flex;
    flex-direction: column;
    gap: 6rem;
    margin-bottom: 10rem;

    .title {
      display: flex;
      justify-content: space-between;
    }
  }

}

</style>